// Collect TCG Development: eBay marketplace account deletion endpoint.
// No secrets are committed. This endpoint deliberately fails closed until configured.
// eBay documentation: challengeResponse = SHA256(challenge_code + token + exact endpoint).
const jsonHeaders = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const endpoint = "https://cbzytysxtdcqxuckspye.supabase.co/functions/v1/ebay-account-deletion-dev";

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === "GET") {
    const challenge = new URL(request.url).searchParams.get("challenge_code");
    if (!challenge || challenge.length > 1024) {
      return new Response(JSON.stringify({ error: "Missing or invalid challenge_code" }), { status: 400, headers: jsonHeaders });
    }
    const token = Deno.env.get("EBAY_DELETION_VERIFICATION_TOKEN");
    if (!token || !/^[A-Za-z0-9_-]{32,80}$/.test(token)) {
      return new Response(JSON.stringify({ error: "Endpoint not configured" }), { status: 503, headers: jsonHeaders });
    }
    const input = new TextEncoder().encode(challenge + token + endpoint);
    const digest = await crypto.subtle.digest("SHA-256", input);
    const challengeResponse = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
    return new Response(JSON.stringify({ challengeResponse }), { status: 200, headers: jsonHeaders });
  }

  if (request.method === "POST") {
    // Never acknowledge or process unverified account deletion messages.
    // Signed eBay notification verification and idempotent deletion processing
    // must be implemented and tested before this endpoint is registered with eBay.
    return new Response(JSON.stringify({ error: "Notification verification not configured" }), { status: 503, headers: jsonHeaders });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...jsonHeaders, allow: "GET, POST" } });
});
