# Datadads website

Marketing site for Datadads, a boutique data consulting collective in Nijmegen.
Live at https://datadads.nl. React 19 + Vite, hosted on Vercel with one serverless
function (`api/chat.js`) that proxies the on-site assistant to Anthropic (Claude Sonnet).

## Develop

```bash
npm install
cp .env.example .env.local        # add your ANTHROPIC_API_KEY
vercel dev                        # site on http://localhost:3000 with /api/chat
```

`npm run dev` also works for pure front-end work, but `/api/chat` is only served by `vercel dev`.

## Build & lint

```bash
npm run lint
npm run build                     # output in dist/
```

## Deploy

Vercel builds from `main` on every push (project `datadads-website`, team `bramvissers-projects`).
Manual: `vercel` for a preview, `vercel --prod` for production.

Environment variables (Vercel project settings or `vercel env add`):

| Name              | Where              | Purpose                          |
| ----------------- | ------------------ | -------------------------------- |
| `ANTHROPIC_API_KEY` | production, preview | Server-side key for `api/chat.js` |

## Domain

DNS for `datadads.nl` is managed at Hostnet. Records pointing at Vercel:

- `@`   A      `76.76.21.21`
- `www` CNAME  `cname.vercel-dns.com`

Mail (MX) records stay on Microsoft 365 and are unrelated to the website hosting.

## Structure

- `src/components/` page sections (`Header`, `Hero`, `Services`, `About`, `Contact`, `Footer`) and `ChatDock`
- `src/translations.js` EN/NL copy, `src/LanguageContext.jsx` language state (persisted in `localStorage`)
- `src/company.js` contact details used across components
- `api/chat.js` Vercel function: validates input, adds the system prompt, calls Anthropic (Claude Sonnet)
