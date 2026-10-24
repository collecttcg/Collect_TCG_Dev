import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const IDENTIFY_MODEL = "gemini-3.5-flash-lite";
const MARKET_MODEL = "gemini-3.5-flash-lite";
const IDENTIFY_TIMEOUT_MS = 20_000;
const MARKET_TIMEOUT_MS = 20_000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function finitePositive(value: unknown) { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : 0; }
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
function parseJsonObject(value: string) {
  const clean = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(clean); } catch {
    const start = clean.indexOf("{"); const end = clean.lastIndexOf("}");
    if (start >= 0 && end > start) try { return JSON.parse(clean.slice(start, end + 1)); } catch { /* ignore */ }
  }
  return null;
}
function normalizeMarketPrice(input: any, groundingMetadata: any) {
  const suggested = finitePositive(input?.suggested_myr);
  if (!suggested) return null;
  const low = finitePositive(input?.low_myr) || suggested;
  const high = finitePositive(input?.high_myr) || suggested;
  const chunks = Array.isArray(groundingMetadata?.groundingChunks) ? groundingMetadata.groundingChunks : [];
  const sources = chunks.map((chunk: any) => ({ title: text(chunk?.web?.title), url: text(chunk?.web?.uri) })).filter((source: any) => source.url).slice(0, 5);
  return { myr:suggested, min_myr:Math.min(low,high,suggested), max_myr:Math.max(low,high,suggested), count:Math.max(0,Math.round(Number(input?.comparable_count)||0)), basis:text(input?.basis)||"AI web market research", confidence:Math.max(0,Math.min(1,Number(input?.confidence)||0)), sources, search_queries:Array.isArray(groundingMetadata?.webSearchQueries)?groundingMetadata.webSearchQueries.map(text).filter(Boolean).slice(0,5):[], source:"ai_web" };
}
async function getGroundedMarketPrice(geminiKey:string, card:any) {
  if (!card?.name && !card?.card_code) return null;
  const identity=[card.year,card.game,card.name,card.card_code,card.language,card.series,card.format,card.grading_company,card.grade?`grade ${card.grade}`:""].filter(Boolean).join(" | ");
  const prompt=`Research the CURRENT market price for this exact trading card/product: ${identity}. Use Google Search. Prioritize recent sold/completed sales and reliable marketplace/price-guide evidence. Do not mix raw and graded copies. For graded cards, only use the same grading company and grade when possible. Match card code, language, set/series and variant exactly. Ignore unrelated listings and extreme outliers. Convert the recommendation to Malaysian Ringgit (MYR) using a current exchange rate if needed. Return ONLY JSON with keys suggested_myr, low_myr, high_myr, comparable_count, basis, confidence. If there is not enough reliable exact-market evidence, return suggested_myr 0 instead of guessing.`;
  let response:Response;
  try { response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MARKET_MODEL}:generateContent`,{method:"POST",headers:{"x-goog-api-key":geminiKey,"Content-Type":"application/json"},signal:AbortSignal.timeout(MARKET_TIMEOUT_MS),body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{thinkingConfig:{thinkingLevel:"minimal"}}})}); }
  catch(error){console.error("Gemini market search network/timeout failure",error instanceof Error?error.message:"unknown");return null;}
  let data:any={}; try{data=await response.json();}catch{return null;}
  if(!response.ok){console.error("Gemini market search failed",response.status,data?.error?.status||"unknown",data?.error?.message||"");return null;}
  const candidate=data?.candidates?.[0]; const outputText=String(candidate?.content?.parts?.map?.((part:any)=>part?.text||"")?.join?.("")||"").trim(); const parsed=parseJsonObject(outputText);
  return parsed?normalizeMarketPrice(parsed,candidate?.groundingMetadata):null;
}

Deno.serve(async (req) => {
  if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST")return json({error:"method_not_allowed"},405);
  const supabaseUrl=Deno.env.get("SUPABASE_URL"),anonKey=Deno.env.get("SUPABASE_ANON_KEY"),geminiKey=Deno.env.get("GEMINI_API_KEY");
  if(!supabaseUrl||!anonKey)return json({error:"server_not_configured"},500);
  if(!geminiKey)return json({error:"ai_not_configured",message:"GEMINI_API_KEY is not configured for the Development scanner."},503);
  const authorization=req.headers.get("Authorization")||"";
  const client=createClient(supabaseUrl,anonKey,{global:{headers:authorization?{Authorization:authorization}:{}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:owner,error:ownerError}=await client.rpc("is_app_owner");
  if(ownerError||owner!==true)return json({error:"owner_required"},403);
  let body:any={}; try{body=await req.json();}catch{return json({error:"invalid_json"},400);}

  if(body?.action==="price"){
    const card=normalizeResult(body.card||{});
    if(!card.name&&!card.card_code)return json({error:"missing_card_identity"},400);
    const market_price=await getGroundedMarketPrice(geminiKey,card);
    return json({ok:true,market_price});
  }

  const image=String(body.image||""); const match=image.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i);
  if(!match)return json({error:"invalid_image"},400); if(image.length>8_000_000)return json({error:"image_too_large"},413);
  const mimeType=match[1].toLowerCase()==="image/jpg"?"image/jpeg":match[1].toLowerCase(),imageData=match[2];
  const prompt=`Identify the trading card or sealed TCG product in this SINGLE front image. Work across ALL trading-card games and eras. Return ONLY one JSON object with exactly these keys: name, card_code, year, game, language, language_details, series, era, format, condition, grading_company, grade, cert, confidence, notes.\nRules:\n- Never invent uncertain values; use an empty string.\n- name: canonical card/product name without grading company or grade.\n- card_code: printed collector/card/product code, e.g. OP01-001, C410, M-001, 4/102.\n- year: release/card year only when reliable.\n- game: canonical game/franchise.\n- language: ENG, JP, CN, KR, Mixed / Multiple languages, or N/A when clear.\n- series: set/collection/product series.\n- era: Vintage or Modern only when clear.\n- format: Raw, Graded, or Sealed. Raw means no grading slab is visible.\n- condition: M, NM, LP, MP, HP, DMG, SEALED, or NA. Graded must use NA; Sealed must use SEALED.\n- grading_company, grade, cert: ONLY when format is Graded and a grading slab/label visibly supports them. Raw/Sealed MUST return empty strings for all three.\n- cert: never treat raw-card numbers or barcodes as certification numbers.\n- confidence: number from 0 to 1.\n- notes: short uncertainty explanation; no pricing.\nThe image may be sideways/upside down. Inspect small printed codes carefully.`;
  let response:Response;
  try{response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${IDENTIFY_MODEL}:generateContent`,{method:"POST",headers:{"x-goog-api-key":geminiKey,"Content-Type":"application/json"},signal:AbortSignal.timeout(IDENTIFY_TIMEOUT_MS),body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt},{inline_data:{mime_type:mimeType,data:imageData}}]}],generationConfig:{responseMimeType:"application/json",maxOutputTokens:700,thinkingConfig:{thinkingLevel:"minimal"}}})});}catch(error){const timeout=error instanceof DOMException&&error.name==="TimeoutError";console.error("Gemini request network/timeout failure",error instanceof Error?error.message:"unknown");return json(timeout?{error:"ai_timeout",message:"AI identification timed out. Please try the scan again."}:{error:"ai_network_failed",message:"Gemini request could not be completed."},timeout?504:502);}
  let data:any={}; try{data=await response.json();}catch{return json({error:"invalid_ai_transport",message:"Gemini returned an unreadable response."},502);}
  if(!response.ok){console.error("Gemini card scan failed",response.status,data?.error?.status||"unknown",data?.error?.message||"");return json({error:"ai_request_failed",message:data?.error?.message||"Gemini card scan failed."},502);}
  const outputText=String(data?.candidates?.[0]?.content?.parts?.map?.((part:any)=>part?.text||"")?.join?.("")||"").trim();
  if(!outputText)return json({error:"empty_ai_response",message:data?.promptFeedback?.blockReason?`Gemini blocked the scan: ${data.promptFeedback.blockReason}`:"Gemini returned no card data."},502);
  const parsed=parseJsonObject(outputText); if(!parsed)return json({error:"invalid_ai_response",message:"Gemini returned invalid card data."},502);
  return json({ok:true,result:normalizeResult(parsed)};
});
