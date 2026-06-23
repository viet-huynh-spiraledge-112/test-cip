# Spiraledge Customer Intelligence — Live Tracking Demo

Single-page demo: a human fills in a planting form, the page HMAC-signs the
payload and POSTs it to the live CIP endpoint, then shows the response.

## Files

- `index.html` — the demo page (pure HTML/CSS/JS, zero dependencies)
- `api/cip.js` — Vercel serverless proxy that forwards the signed request to
  the real CIP endpoint (avoids browser CORS)
- `vercel.json` — SPA rewrite (excludes `/api/*`)

## Deploy to Vercel

1. Push this folder to your Git repo and import it on Vercel, **or** run
   `vercel` from this folder.
2. Set the environment variable on Vercel:
   - **Project → Settings → Environment Variables**
   - Name: `CIP_API_URL`
   - Value: `https://<real-staging-host>` (no trailing slash, no `/v1/...` path)
3. Redeploy. The proxy appends `/v1/1/a1a1ad52-9a66-442e-ae48-61322d9cf240`
   automatically.

## How signing works

The frontend computes HMAC-SHA256 of the JSON body using `SIGNING_SECRET` via
the Web Crypto API and sends it in the `X-Signal-Signature` header. The proxy
forwards the body and signature header unchanged to the CIP endpoint.

## Local dev

```bash
vercel dev
```

Make sure `CIP_API_URL` is set in your `.env` or Vercel project settings.
