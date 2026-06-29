# Spiraledge Customer Intelligence — Live Tracking Demo

Single-page demo: a human fills in a planting form, the page HMAC-signs the
payload and POSTs it to a user-supplied CIP webhook endpoint, then shows the
response.

The **Webhook Endpoint URL** and **Signing Secret** are entered directly in the
page's "Connection Settings" card — nothing is hardcoded. Both values persist in
the browser via `localStorage`, so you can edit and re-test any endpoint + secret
without touching code.

## Files

- `index.html` — the demo page (pure HTML/CSS/JS, zero dependencies)
- `api/cip.js` — generic Vercel serverless proxy. Forwards the signed request to
  whatever target URL the page sends via the `X-Target-URL` header (avoids
  browser CORS). No host/path is hardcoded in the proxy.
- `vercel.json` — SPA rewrite (excludes `/api/*`)

## Deploy to Vercel

1. Push this folder to your Git repo and import it on Vercel, **or** run
   `vercel` from this folder.
2. No environment variables are required — the destination URL is supplied by
   the user at runtime via the Connection Settings card.

## How signing works

The frontend computes HMAC-SHA256 of the JSON body using the **Signing Secret**
entered in the page (via the Web Crypto API) and sends it in the
`X-Signal-Signature` header. The page POSTs to the same-origin proxy (`/api/cip`)
with the target endpoint in the `X-Target-URL` header; the proxy relays the body
and signature unchanged to that target.

## Local dev

```bash
vercel dev
```
