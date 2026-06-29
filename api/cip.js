// Vercel Serverless Function — generic CIP proxy.
// Forwards the HMAC-signed webhook to whatever target URL the caller supplies
// (via the X-Target-URL header), bypassing browser CORS restrictions.
//
// The frontend is fully in control of the destination URL and signing secret;
// nothing is hardcoded here. The proxy simply relays body + X-Signal-Signature
// to the user-supplied endpoint and streams the upstream response back.
//
// NOTE: This is an open relay intended for a demo only.

export default async function handler(req, res) {
  // Only POST is supported.
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const target = req.headers["x-target-url"] || "";
  if (!target) {
    res.status(400).json({ error: "missing_target_url", message: "X-Target-URL header is required" });
    return;
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch (_) {
    res.status(400).json({ error: "invalid_target_url", message: "X-Target-URL must be a valid absolute URL" });
    return;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    res.status(400).json({ error: "invalid_target_url", message: "X-Target-URL must be http(s)" });
    return;
  }

  const signature = req.headers["x-signal-signature"] || "";
  const body = JSON.stringify(req.body || {});

  try {
    const upstreamRes = await fetch(parsed.toString(), {
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
