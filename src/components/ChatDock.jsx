import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';

const MAX_HISTORY = 20;

export default function ChatDock({ open, onOpenChange }) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, error]);

  async function handleSubmit(e) {
    e.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setError(false);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-MAX_HISTORY), language }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (typeof data.reply !== 'string') throw new Error('Malformed response');
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="chat-pill"
        onClick={() => onOpenChange(true)}
        aria-expanded="false"
        aria-controls="chat-panel"
      >
        <span aria-hidden="true">💾</span>
        {t('chatOpen')}
      </button>
    );
  }

  return (
    <section
      id="chat-panel"
      className="chat-panel"
      role="dialog"
      aria-label={t('chatTitle')}
    >
      <div className="chat-header">
        <span>{t('chatTitle')}</span>
        <button
          type="button"
          className="chat-close"
          onClick={() => onOpenChange(false)}
          aria-label={t('chatClose')}
        >
          ×
        </button>
      </div>

      <ul className="chat-log" ref={logRef} aria-live="polite">
        <li className="chat-msg assistant">{t('chatIntro')}</li>
        {messages.map((msg, i) => (
          <li key={i} className={`chat-msg ${msg.role}`}>
            {msg.content}
          </li>
        ))}
        {loading && (
          <li className="chat-msg assistant">
            {t('thinking')}
            <span className="cursor-blink" aria-hidden="true" />
          </li>
        )}
        {error && <li className="chat-msg error">{t('chatError')}</li>}
      </ul>

      <form className="chat-form" onSubmit={handleSubmit} autoComplete="off">
        <span className="chat-prompt" aria-hidden="true">
          &gt;
        </span>
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder={t('typeMessage')}
          aria-label={t('chatLabel')}
          maxLength={1000}
        />
        <button type="submit" className="chat-send" disabled={loading || !input.trim()}>
          {t('chatSend')}
        </button>
      </form>
    </section>
  );
}
