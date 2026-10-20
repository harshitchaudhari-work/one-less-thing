# One Less Thing

Pre-launch site for One Less Thing. Next.js (App Router), TypeScript, Tailwind.

```bash
npm install
npm run dev      # http://localhost:3000
```

## Email signups

Both early-access forms post to `/api/waitlist`. That route validates the request, rate-limits it, and forwards it to a Google Apps Script web app, which appends a row to a Google Sheet. The browser only ever talks to our own route; the Apps Script URL and secret stay on the server.

```
form → /api/waitlist (Next.js server) → Apps Script web app → Google Sheet
```

Until the two environment variables below are set, the form honestly replies "signups aren't open yet" and stores nothing.

### What gets sent and stored

| Sheet column | From |
|---|---|
| Signed up (IST) | time of signup |
| Email | the email, trimmed and lower-cased |
| Source | `hero` or `closing` (which form) |
| Marketing consent | always `No` for now: the forms don't ask for it. The column stays so an opt-in can be added back later without changing the script. |

### The Apps Script

Use [`apps-script/Code.gs`](apps-script/Code.gs). It expects `{ email, source, marketingConsent, secret }` and replies `{ "status": "created" | "duplicate" | "error", "error"?: "…" }`. `/api/waitlist` checks that reply strictly: anything else, including a Google sign-in page, counts as a failure and is logged.

1. In the sheet: **Extensions → Apps Script**, paste in `apps-script/Code.gs`, and save.
2. **Project Settings → Script properties**, then add `SECRET` with a long random value (`openssl rand -hex 24`).
3. **Deploy → New deployment → Web app**, with *Execute as: Me* and *Who has access: Anyone*. Copy the URL ending in `/exec`.

Editing the script later? **Deploy → Manage deployments → edit → Version: New version → Deploy.** The URL stays the same. (Saving alone doesn't update the live web app.)

### Environment variables

| Name | Value |
|---|---|
| `GOOGLE_SCRIPT_URL` | the web app URL ending in `/exec` |
| `GOOGLE_SCRIPT_SECRET` | the same value as the script's `SECRET` property |

These are server-only: never prefix them with `NEXT_PUBLIC_`, or Next.js will ship them to the browser.

**Locally:** create `.env.local` in the project root (it's git-ignored; `.env.example` shows the shape):

```bash
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/…/exec
GOOGLE_SCRIPT_SECRET=…
```

Then restart `npm run dev`. Env files are only read at startup.

**On Vercel:** Project → **Settings → Environment Variables**. Add both names with their values, tick **Production** and **Preview**, and save. Then redeploy (Deployments → ⋯ → Redeploy), because variables only apply to new deployments. You can also do it from the CLI:

```bash
vercel env add GOOGLE_SCRIPT_URL
vercel env add GOOGLE_SCRIPT_SECRET
```

### Protection

- **Rate limit:** 5 signup attempts per visitor (IP) per 10 minutes, then a friendly "wait a few minutes" message. It's in-memory per server instance, so it stops bursts rather than being a hard global cap. Back `src/lib/rateLimit.ts` with Upstash Redis if you ever need that.
- **Bots:** a hidden honeypot field catches most of them before anything reaches the sheet.
- **Duplicates:** an email already in the sheet isn't added again, and the person sees "you're already on the list".
- **Spreadsheet safety:** emails a spreadsheet could read as a formula are rejected by the script.

### Troubleshooting

Server logs (terminal, or Vercel → Logs) say what went wrong:

- *"did not return JSON (got an HTML page …)"*: the deployment's access isn't **Anyone**, or the URL isn't the `/exec` one.
- *"responded 403 (access denied)"*: same cause, seen as Google's "Access denied: You need access" page. In Apps Script, **Deploy → Manage deployments → edit → Who has access: Anyone → Deploy**, and make sure `GOOGLE_SCRIPT_URL` is that deployment's `/exec` URL.
- *"Apps Script error: unauthorized"*: `GOOGLE_SCRIPT_SECRET` doesn't match the script's `SECRET` property.
- Changes to the script not showing: deploy a **new version** (see above).

### Moving off Sheets

`src/lib/signups.ts` is the only file that knows where emails go. Replace the body of `addSignup` and keep its contract: it returns `"created"` or `"duplicate"`, and throws `SignupsNotConfiguredError` when unconfigured.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel (framework preset: Next.js).
2. Under Project → Settings → Environment Variables, add `GOOGLE_SCRIPT_URL` and `GOOGLE_SCRIPT_SECRET` (see above), and optionally `NEXT_PUBLIC_SITE_URL` (your domain, used for share links).
3. Deploy, then add your domain under Settings → Domains.

## Before launch

- Replace the Muller Next **trial** fonts in `src/app/fonts/` with licensed files (same weights). They're loaded in `src/app/layout.tsx`.
- Replace the placeholder privacy policy at `src/app/privacy/page.tsx` with a reviewed one.
