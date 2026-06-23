// Vercel Serverless Function — CIP proxy.
// Forwards the HMAC-signed webhook to the real CIP endpoint server-side,
// bypassing browser CORS restrictions.
//
// Configure the real staging host in Vercel:
//   Project → Settings → Environment Variables → CIP_API_URL = https://<real-host>
//
// The frontend POSTs to /api/cip; this function appends the known path
// (/v1/<BU_ID>/<SOURCE_PUBLIC_ID>) and forwards body + X-Signal-Signature.

const BU_ID = "1";
const SOURCE_PUBLIC_ID = "cdff1aec-57ae-4fd0-958d-23a1213617be";
const CIP_API_URL = "https://crm-api-private-staging.spiraledge.com";

export default async function handler(req, res) {
  // Only POST is supported.
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const upstream = `${CIP_API_URL.replace(/\/+$/, "")}/v1/${BU_ID}/${SOURCE_PUBLIC_ID}`;
  const signature = req.headers["x-signal-signature"] || "";
  const body = JSON.stringify(req.body || {});

  try {
    const upstreamRes = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signal-Signature": signature,
      },
      body,
    });

    const text = await upstreamRes.text();
    res.status(upstreamRes.status);
    res.setHeader("Content-Type", upstreamRes.headers.get("content-type") || "application/json");
    res.send(text);
  } catch (err) {
    res.status(502).json({
      error: "upstream_fetch_failed",
      message: err && err.message ? err.message : String(err),
    });
  }
}
