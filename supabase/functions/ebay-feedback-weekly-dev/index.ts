// A single-use signature authorizes one background sync for a connected account.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const accounts = new Set(Array.from({ length: 5 }, (_, index) => `collect_tcg_${index + 1}`));
const reply = (status: number) => new Response(null, { status, headers: { "cache-control": "no-store" } });

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply(405);
  const signature = request.headers.get("x-collect-tcg-schedule-signature") ?? "";
  if (!/^[a-f0-9]{64}$/.test(signature)) return reply(403);

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!projectUrl || !serviceKey) return reply(503);

  const db = createClient(projectUrl, serviceKey, { auth: { persistSession: false } });

  let seller: string;
  let issuedAt: number;
  try {
    const input = await request.json();
    seller = input.seller;
    issuedAt = input.issued_at;
  } catch {
    return reply(400);
  }
  if (!accounts.has(seller) || !Number.isSafeInteger(issuedAt)) return reply(400);

  const { data: authorized, error: authError } = await db.rpc("claim_ebay_feedback_schedule_dev", {
    p_seller: seller, p_issued_at: issuedAt, p_signature: signature
  });
  if (authError || authorized !== true) return reply(403);

  const { data: connection, error: connectionError } = await db.from("ebay_oauth_connections_dev")
    .select("ebay_account").eq("ebay_account", seller).maybeSingle();
  if (connectionError) return reply(503);
  if (!connection) return reply(204);

  try {
    const result = await fetch(new URL("/functions/v1/ebay-feedback-sync-dev", projectUrl), {
      method: "POST",
      headers: { authorization: `Bearer ${serviceKey}`, "content-type": "application/json" },
      body: JSON.stringify({ seller }),
      signal: AbortSignal.timeout(90000)
    });
    await result.body?.cancel();
    return reply(result.status === 200 ? 204 : 502);
  } catch {
    return reply(502);
  }
});
