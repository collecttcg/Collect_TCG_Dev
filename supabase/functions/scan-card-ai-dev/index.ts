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
    name: { type: "string" },
    card_code: { type: "string" },
    year: { type: "string" },
    game: { type: "string" },
    language: { type: "string" },
    language_details: { type: "string" },
    series: { type: "string" },
    era: { type: "string" },
    format: { type: "string", enum: ["Raw", "Graded", "Sealed", ""] },
    condition: { type: "string", enum: ["M", "NM", "LP", "MP", "HP", "DMG", "SEALED", "NA", ""] },
    grading_company: { type: "string" },
    grade: { type: "string" },
    cert: { type: "string" },
    confidence: { type: "number" },
    notes: { type: "string" },
  },
  required: ["name", "card_code", "year", "game", "language", "language_details", "series", "era", "format", "condition", "grading_company", "grade", "cert", "confidence", "notes"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!supabaseUrl || !anonKey) return json({ error: "server_not_configured" }, 500);
  if (!openaiKey) return json({ error: "ai_not_configured", message: "OPENAI_API_KEY is not configured for the Development scanner." }, 503);

  const authorization = req.headers.get("Authorization") || "";
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: authorization ? { Authorization: authorization } : {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: owner, error: ownerError } = await client.rpc("is_app_owner");
  if (ownerError || owner !== true) return json({ error: "owner_required" }, 403);

  let body: { image?: unknown } = {};
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const image = String(body.image || "");
  if (!/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(image)) return json({ error: "invalid_image" }, 400);
  if (image.length > 12_000_000) return json({ error: "image_too_large" }, 413);

  const prompt = `Identify the trading card or sealed TCG product in this single front image. This scanner must work across ALL trading-card games and eras, not only One Piece. Read visible text carefully and use visual/world knowledge when useful. Return only fields supported by the schema.\n\nRules:\n- Never invent a value when it cannot be identified reliably; return an empty string.\n- name: canonical card/product name, without grading company or grade.\n- card_code: printed collector/card number or product code exactly enough to identify the card (examples OP01-001, C410, M-001, 4/102).\n- year: release/card year when reliably identifiable; otherwise empty.\n- game: canonical game/franchise name (One Piece, Pokémon, Zatch Bell!, Gundam Card Game, etc.).\n- language: use the site's short values when clear: ENG, JP, CN, KR, Mixed / Multiple languages, or N/A.\n- series: set/collection/product series, such as Hyper Battle, OP-01 Romance Dawn, Base Set, Championship, Visual Adventure.\n- era: use Vintage or Modern only when appropriate and clear; otherwise empty.\n- format: Raw for an ungraded loose card, Graded only when a grading slab/label is visibly present, Sealed for sealed product.\n- condition: estimate only when reasonably visible. Use M, NM, LP, MP, HP, DMG, SEALED, NA. For Graded use NA. Do not overstate condition from a photo.\n- grading_company, grade, cert: populate ONLY when format is Graded and the slab label visibly supports them. For Raw or Sealed these MUST be empty strings.\n- cert: never infer a certification number from random card numbers/barcodes on a raw card.\n- confidence: 0 to 1 overall identification confidence.\n- notes: short explanation of uncertain or inferred fields; no pricing.\n\nThe image may be sideways or upside down. Pay special attention to small printed card codes.`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-5.6-luna",
      input: [{ role: "user", content: [
        { type: "input_text", text: prompt },
        { type: "input_image", image_url: image, detail: "original" },
      ] }],
      text: { format: { type: "json_schema", name: "card_scan", strict: true, schema } },
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("OpenAI card scan failed", response.status, data?.error?.code || data?.error?.type || "unknown");
    return json({ error: "ai_request_failed", message: data?.error?.message || "AI card scan failed." }, 502);
  }

  const outputText = String(data?.output_text || data?.output?.flatMap?.((item: any) => item?.content || [])?.find?.((item: any) => item?.type === "output_text")?.text || "");
  if (!outputText) return json({ error: "empty_ai_response" }, 502);
  let result: any;
  try { result = JSON.parse(outputText); } catch { return json({ error: "invalid_ai_response" }, 502); }

  if (result.format !== "Graded") {
    result.grading_company = "";
    result.grade = "";
    result.cert = "";
  }
  result.confidence = Math.max(0, Math.min(1, Number(result.confidence) || 0));
  return json({ ok: true, result });
});
