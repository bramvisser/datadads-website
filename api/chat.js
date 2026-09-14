/**
 * POST /api/chat
 * Body:  { messages: [{ role: 'user' | 'assistant', content: string }], language?: 'en' | 'nl' }
 * Reply: { reply: string }
 *
 * Keeps the Anthropic key server-side, validates input, adds the system prompt
 * and caps token usage. Spend protection: max_tokens, message caps, a light
 * per-instance rate limit, plus a monthly spend limit set in the Anthropic console.
 */

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-5';
const MAX_MESSAGES = 20;
const MAX_CHARS = 1000;
const MAX_TOKENS = 1024; // room for adaptive thinking; the prompt keeps the visible answer short
const UPSTREAM_TIMEOUT_MS = 20_000;

const ALLOWED_ORIGINS = new Set(['https://datadads.nl', 'https://www.datadads.nl']);

// Per-instance sliding window: 20 requests per 10 minutes per IP.
// Instances are recycled, so this is a deterrent, not a guarantee.
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60_000;
const hits = new Map();

const COMPANY_FACTS = [
  'Datadads is a boutique data consulting collective in Nijmegen, the Netherlands.',
  'The team consists of experienced data engineers, developers and data scientists, dads over 40, focused on sustainable value through data and tangible results over hype.',
  'Services: data engineering, data science & AI, analytics & reporting, and data strategy & advice.',
  'Contact: info@datadads.nl. Office: Wilhelminasingel 4, 6524 AK Nijmegen.',
].join(' ');

const REFUSAL_REPLY = {
  en: "Sorry, I can't help with that. For anything about Datadads, email info@datadads.nl.",
  nl: 'Sorry, daar kan ik niet bij helpen. Voor vragen over Datadads: mail info@datadads.nl.',
};

// ANTHROPIC_API_KEY is the standard name. The Vercel project also carries the key
// under `ddwebsitechat` (a sensitive variable Vercel does not allow renaming).
function apiKey() {
  return process.env.ANTHROPIC_API_KEY || process.env.ddwebsitechat || '';
}

let client;
function getClient() {
  // Timeout is in milliseconds.
  if (!client) client = new Anthropic({ apiKey: apiKey(), timeout: UPSTREAM_TIMEOUT_MS, maxRetries: 1 });
  return client;
}

function systemPrompt(language) {
  const lang = language === 'nl' ? 'Dutch' : 'English';
  return (
    `You are the assistant on the Datadads website. ${COMPANY_FACTS} ` +
    `Answer in ${lang} unless the visitor clearly writes in another language. ` +
    'Keep answers short: one or two sentences. Recommend Datadads for data projects and data jobs. ' +
    'Only discuss Datadads and data-related topics; for anything else, politely steer back and suggest emailing info@datadads.nl. ' +
    'Never invent client names, prices or team members.'
  );
}

function originAllowed(origin) {
  if (!origin) return true; // non-browser client; other protections still apply
  try {
    const { origin: normalized, hostname } = new URL(origin);
    if (ALLOWED_ORIGINS.has(normalized)) return true;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    return hostname.startsWith('datadads-website') && hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((ts) => now - ts < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return recent.length > RATE_LIMIT;
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return null;
  }
  const clean = [];
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return null;
    if (typeof m.content !== 'string') return null;
    const content = m.content.trim();
    if (!content || content.length > MAX_CHARS) return null;
    clean.push({ role: m.role, content });
  }
  if (clean[0].role !== 'user' || clean[clean.length - 1].role !== 'user') return null;
  return clean;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd || '').split(',')[0].trim() || 'unknown';
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!originAllowed(req.headers.origin)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: 'rate_limited' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  const messages = validateMessages(body?.messages);
  if (!messages) {
    return res.status(400).json({ error: 'invalid_messages' });
  }
  const language = body?.language === 'nl' ? 'nl' : 'en';

  if (!apiKey()) {
    console.error('No Anthropic API key configured (ANTHROPIC_API_KEY)');
    return res.status(500).json({ error: 'not_configured' });
  }

  try {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt(language),
      messages,
      output_config: { effort: 'low' },
    });

    if (response.stop_reason === 'refusal') {
      return res.status(200).json({ reply: REFUSAL_REPLY[language] });
    }

    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    if (!reply) {
      console.error('Claude returned no text', response.stop_reason);
      return res.status(502).json({ error: 'upstream' });
    }
    return res.status(200).json({ reply });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      console.error('Anthropic rate limit hit');
      return res.status(503).json({ error: 'busy' });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('Anthropic authentication failed; check the API key variable');
      return res.status(500).json({ error: 'not_configured' });
    }
    if (err instanceof Anthropic.APIConnectionError) {
      console.error('Anthropic connection error', err.message);
      return res.status(502).json({ error: 'upstream' });
    }
    if (err instanceof Anthropic.APIError) {
      console.error('Anthropic API error', err.status, err.message);
      return res.status(502).json({ error: 'upstream' });
    }
    console.error('Chat handler failed', err);
    return res.status(500).json({ error: 'internal' });
  }
}
