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

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function normalizeResult(input: any) {
  const format = ["Raw", "Graded", "Sealed"].includes(text(input?.format)) ? text(input.format) : "";
  const allowedConditions = new Set(["M", "NM", "LP", "MP", "HP", "DMG", "SEALED", "NA"]);
  const result = {
    name: text(input?.name), card_code: text(input?.card_code), year: text(input?.year), game: text(input?.game),
    language: text(input?.language), language_details: text(input?.language_details), series: text(input?.series), era: text(input?.era),
    format, condition: allowedConditions.has(text(input?.condition)) ? text(input.condition) : "",
    grading_company: text(input?.grading_company), grade: text(input?.grade), cert: text(input?.cert),
    confidence: Math.max(0, Math.min(1, Number(input?.confidence) || 0)), notes: text(input?.notes),
  };
  if (result.format !== "Graded") { result.grading_company = ""; result.grade = ""; result.cert = ""; }
  if (result.format === "Graded") result.condition = "NA";
  if (result.format === "Sealed") result.condition = "SEALED";
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!supabaseUrl || !anonKey) return json({ error: "server_not_configured" }, 500);
  if (!geminiKey) return json({ error: "ai_not_configured", message: "GEMINI_API_KEY is not configured for the Development scanner." }, 503);

  const authorization = req.headers.get("Authorization") || "";
  const client = createClient(supabaseUrl, anonKey, { global: { headers: authorization ? { Authorization: authorization } : {} }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: owner, error: ownerError } = await client.rpc("is_app_owner");
  if (ownerError || owner !== true) return json({ error: "owner_required" }, 403);

  let body: { image?: unknown } = {};
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const image = String(body.image || "");
  const match = image.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i);
  if (!match) return json({ error: "invalid_image" }, 400);
  if (image.length > 12_000_000) return json({ error: "image_too_large" }, 413);
  const mimeType = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  const imageData = match[2];

  const prompt = `Identify the trading card or sealed TCG product in this SINGLE front image. Work across ALL trading-card games and eras. Return ONLY one JSON object with exactly these keys: name, card_code, year, game, language, language_details, series, era, format, condition, grading_company, grade, cert, confidence, notes.\nRules:\n- Never invent uncertain values; use an empty string.\n- name: canonical card/product name without grading company or grade.\n- card_code: printed collector/card/product code, e.g. OP01-001, C410, M-001, 4/102.\n- year: release/card year only when reliable.\n- game: canonical game/franchise.\n- language: ENG, JP, CN, KR, Mixed / Multiple languages, or N/A when clear.\n- series: set/collection/product series.\n- era: Vintage or Modern only when clear.\n- format: Raw, Graded, or Sealed. Raw means no grading slab is visible.\n- condition: M, NM, LP, MP, HP, DMG, SEALED, or NA. Graded must use NA; Sealed must use SEALED.\n- grading_company, grade, cert: ONLY when format is Graded and a grading slab/label visibly supports them. Raw/Sealed MUST return empty strings for all three.\n- cert: never treat raw-card numbers or barcodes as certification numbers.\n- confidence: number from 0 to 1.\n- notes: short uncertainty explanation; no pricing.\nThe image may be sideways/upside down. Inspect small printed codes carefully.`;

  let response: Response;
  try {
    response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "x-goog-api-key": geminiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageData } }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
      }),
    });
  } catch (error) {
    console.error("Gemini request network failure", error instanceof Error ? error.message : "unknown");
    return json({ error: "ai_network_failed", message: "Gemini request could not be completed." }, 502);
  }

  let data: any = {};
  try { data = await response.json(); } catch { return json({ error: "invalid_ai_transport", message: "Gemini returned an unreadable response." }, 502); }
  if (!response.ok) {
    console.error("Gemini card scan failed", response.status, data?.error?.status || "unknown", data?.error?.message || "");
    return json({ error: "ai_request_failed", message: data?.error?.message || "Gemini card scan failed." }, 502);
  }

  const outputText = String(data?.candidates?.[0]?.content?.parts?.map?.((part: any) => part?.text || "")?.join?.("") || "").trim();
  if (!outputText) return json({ error: "empty_ai_response", message: data?.promptFeedback?.blockReason ? `Gemini blocked the scan: ${data.promptFeedback.blockReason}` : "Gemini returned no card data." }, 502);
  let parsed: any;
  try { parsed = JSON.parse(outputText); } catch {
    console.error("Gemini returned invalid JSON");
    return json({ error: "invalid_ai_response", message: "Gemini returned invalid card data." }, 502);
  }
  return json({ ok: true, result: normalizeResult(parsed) });
});
