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
const SOURCE_PUBLIC_ID = "a1a1ad52-9a66-442e-ae48-61322d9cf240";

export default async function handler(req, res) {
  // Only POST is supported.
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const base = process.env.CIP_API_URL;
  if (!base) {
    res.status(500).json({
      error: "CIP_API_URL env var not set on Vercel",
      hint: "Project → Settings → Environment Variables → CIP_API_URL = https://<real-staging-host>",
    });
    return;
  }

  const upstream = `${base.replace(/\/+$/, "")}/v1/${BU_ID}/${SOURCE_PUBLIC_ID}`;
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
