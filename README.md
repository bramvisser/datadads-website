# Datadads website

Marketing site for Datadads, a boutique collective of senior data, software and AI specialists in Nijmegen.
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

Project `datadads-website`, team `bramvissers-projects`. Deploys are done from the CLI, not from GitHub pushes:

```bash
vercel          # preview deployment
vercel --prod   # production (datadads.nl)
```

Push to GitHub separately to keep the repo in sync (`git push origin main`).

Environment variables (Vercel project settings or `vercel env add`):

| Name              | Where              | Purpose                          |
| ----------------- | ------------------ | -------------------------------- |
| `ANTHROPIC_API_KEY` | production, preview | Server-side key for `api/chat.js` |

The Vercel project currently stores this key under the name `ddwebsitechat`; `api/chat.js` accepts either name. Vercel cannot rename sensitive variables, so to move to the standard name, add `ANTHROPIC_API_KEY` and delete `ddwebsitechat`.

## Domain

DNS for `datadads.nl` is managed at Hostnet. Records pointing at Vercel:

- `@`   A      `216.198.79.1` and `64.29.17.1` (Vercel's current recommendation; `76.76.21.21` also works)
- `www` CNAME  `92ba730ee36b7a96.vercel-dns-017.com` (or `cname.vercel-dns.com`)

`www.datadads.nl` redirects (308) to the apex domain through the domain's redirect setting in the Vercel project (Settings → Domains).
Check status with `vercel domains verify datadads.nl`.

Mail (MX) records stay on Microsoft 365 and are unrelated to the website hosting.

## Structure

- `src/components/` page sections (`Header`, `Hero`, `Services`, `About`, `Contact`, `Footer`) and `ChatDock`
- `src/translations.js` EN/NL copy, `src/LanguageContext.jsx` language state (persisted in `localStorage`)
- `src/company.js` contact details used across components
- `api/chat.js` Vercel function: validates input, adds the system prompt, calls Anthropic (Claude Sonnet)
