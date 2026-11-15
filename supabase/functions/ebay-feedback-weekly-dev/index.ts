// The scheduler token authorizes only background synchronization of connected accounts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const accounts = new Set(Array.from({ length: 5 }, (_, index) => `collect_tcg_${index + 1}`));
const reply = (status: number) => new Response(null, { status, headers: { "cache-control": "no-store" } });

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply(405);
  const token = request.headers.get("x-collect-tcg-schedule-token") ?? "";
  if (!/^[a-f0-9-]{72}$/.test(token)) return reply(403);

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!projectUrl || !serviceKey) return reply(503);

  const db = createClient(projectUrl, serviceKey, { auth: { persistSession: false } });
  const { data: authorized, error: authError } = await db.rpc("verify_ebay_feedback_schedule_token_dev", { p_token: token });
  if (authError || authorized !== true) return reply(403);

  let seller: string;
  try {
    const input = await request.json();
    seller = input.seller;
  } catch {
    return reply(400);
  }
  if (!accounts.has(seller)) return reply(400);

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
