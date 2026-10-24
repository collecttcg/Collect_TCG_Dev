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

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" }, card_code: { type: "string" }, year: { type: "string" }, game: { type: "string" }, language: { type: "string" }, language_details: { type: "string" }, series: { type: "string" }, era: { type: "string" },
    format: { type: "string", enum: ["Raw", "Graded", "Sealed", ""] }, condition: { type: "string", enum: ["M", "NM", "LP", "MP", "HP", "DMG", "SEALED", "NA", ""] },
    grading_company: { type: "string" }, grade: { type: "string" }, cert: { type: "string" }, confidence: { type: "number" }, notes: { type: "string" },
  },
  required: ["name", "card_code", "year", "game", "language", "language_details", "series", "era", "format", "condition", "grading_company", "grade", "cert", "confidence", "notes"],
};

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

  const prompt = `Identify the trading card or sealed TCG product in this single front image. This scanner must work across ALL trading-card games and eras, not only One Piece. Read visible text carefully and use visual/world knowledge when useful. Return only fields supported by the schema.\nRules:\n- Never invent a value when it cannot be identified reliably; return an empty string.\n- name: canonical card/product name, without grading company or grade.\n- card_code: printed collector/card number or product code exactly enough to identify the card (examples OP01-001, C410, M-001, 4/102).\n- year: release/card year when reliably identifiable; otherwise empty.\n- game: canonical game/franchise name.\n- language: use ENG, JP, CN, KR, Mixed / Multiple languages, or N/A when clear.\n- series: set/collection/product series.\n- era: use Vintage or Modern only when appropriate and clear; otherwise empty.\n- format: Raw for an ungraded loose card, Graded only when a grading slab/label is visibly present, Sealed for sealed product.\n- condition: estimate only when reasonably visible. Use M, NM, LP, MP, HP, DMG, SEALED, NA. For Graded use NA.\n- grading_company, grade, cert: populate ONLY when format is Graded and the slab label visibly supports them. For Raw or Sealed these MUST be empty strings.\n- cert: never infer a certification number from random card numbers/barcodes on a raw card.\n- confidence: 0 to 1 overall identification confidence.\n- notes: short explanation of uncertain or inferred fields; no pricing.\nThe image may be sideways or upside down. Pay special attention to small printed card codes.`;

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: { "x-goog-api-key": geminiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageData } }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: schema },
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Gemini card scan failed", response.status, data?.error?.status || "unknown");
    return json({ error: "ai_request_failed", message: data?.error?.message || "Gemini card scan failed." }, 502);
  }

  const outputText = String(data?.candidates?.[0]?.content?.parts?.map?.((part: any) => part?.text || "")?.join?.("") || "");
  if (!outputText) return json({ error: "empty_ai_response", message: data?.promptFeedback?.blockReason ? `Gemini blocked the scan: ${data.promptFeedback.blockReason}` : "Gemini returned no card data." }, 502);
  let result: any;
  try { result = JSON.parse(outputText); } catch { return json({ error: "invalid_ai_response" }, 502); }
  if (result.format !== "Graded") { result.grading_company = ""; result.grade = ""; result.cert = ""; }
  result.confidence = Math.max(0, Math.min(1, Number(result.confidence) || 0));
  return json({ ok: true, result });
});
