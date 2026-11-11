import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function validCountry(value: unknown) {
  const code = String(value || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) && code !== "XX" ? code : "";
}

function firstForwardedIp(req: Request) {
  const raw = req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for") || "";
  return raw.split(",")[0].trim();
}

function isUsableIp(ip: string) {
  if (!ip) return false;
  if (ip === "::1" || ip.startsWith("127.") || ip.startsWith("10.") ||
      ip.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return false;
  return true;
}

async function resolveCountry(req: Request) {
  for (const candidate of [
    req.headers.get("cf-ipcountry"),
    req.headers.get("x-country-code"),
    req.headers.get("x-vercel-ip-country"),
    req.headers.get("cloudfront-viewer-country"),
  ]) {
    const code = validCountry(candidate);
    if (code) return { code, source: "edge-header" };
  }

  const ip = firstForwardedIp(req);
  if (!isUsableIp(ip)) return { code: "", source: "unknown" };

  try {
    const response = await fetch(
      `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok) return { code: "", source: "lookup-failed" };
    const data = await response.json();
    const code = data?.success === false ? "" : validCountry(data?.country_code);
    return { code, source: code ? "ipwho.is" : "lookup-failed" };
  } catch {
    return { code: "", source: "lookup-failed" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: { card_id?: unknown; visitor_id?: unknown } = {};
  try { body = await req.json(); }
  catch { return json({ error: "invalid_json" }, 400); }

  const cardId = String(body.card_id || "").trim();
  const visitorId = String(body.visitor_id || "").trim();
  if (!cardId || !visitorId || visitorId.length < 8 || visitorId.length > 128) {
    return json({ error: "invalid_payload" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return json({ error: "server_not_configured" }, 500);

  const authorization = req.headers.get("Authorization") || "";
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: authorization ? { Authorization: authorization } : {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await client.rpc("record_card_view_event", {
    p_card_id: cardId,
    p_visitor_id: visitorId,
  });
  if (error) {
    console.error("record_card_view_event failed", error);
    return json({ error: "record_failed" }, 500);
  }

  const { code, source } = await resolveCountry(req);
  return json({ ok: true, country_code: code || null, country_source: source });
});
