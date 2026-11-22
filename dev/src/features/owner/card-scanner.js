/** Owner-only Add Card scanner. AI analyzes only the first uploaded image and recommends fields for confirmation. */
export function normalizeScanText(value){return String(value||"").replace(/[\u2010-\u2015]/g,"-").replace(/\s+/g," ").trim();}
export function extractCardCode(value){
  const raw=String(value||""); const text=normalizeScanText(raw).toUpperCase();
  const standard=text.match(/(?:^|[^A-Z0-9])([O0][P]|[S58][T7]|[E3][B8]|PR[B8])\s*[- ]?\s*(\d{2})\s*[- ]\s*(\d{3})(?:[1I])?(?=\D|$)/);
  if(standard){const prefix=standard[1].replace(/^0P$/,"OP").replace(/^[58]7$/,"ST").replace(/^3[8B]$/,"EB").replace(/^E8$/,"EB").replace(/^PR8$/,"PRB");return `${prefix}${standard[2]}-${standard[3]}`;}
  const promo=text.match(/\bP\s*[- ]\s*(\d{3})(?=\D|$)/);if(promo)return `P-${promo[1]}`;
  const lines=raw.split(/\r?\n/).map(line=>normalizeScanText(line).toUpperCase()).filter(Boolean);
  for(const line of lines){const labelled=line.match(/#\s*([CSG])\s*(\d{2,3})(?:\b|\D)/);if(labelled)return `${labelled[1]}${labelled[2]}`;}
  if(/\bHYPER\s+BATTLE\b|\bBANDAI\s+(?:1999|2000|2001)\b/.test(text))for(const line of lines){const vintage=line.match(/^([CSG])\s*(\d{2,3})(?:\b|\D)/);if(vintage)return `${vintage[1]}${vintage[2]}`;}
  for(const line of lines){const isolated=line.match(/^(?:[#:]\s*)?([CSG])\s*[- ]?\s*(\d{2,3})\s*$/);if(isolated)return `${isolated[1]}${isolated[2]}`;}
  return "";
}
export function extractYear(value){const text=normalizeScanText(value).toUpperCase();for(const p of [/\b(19\d{2}|20\d{2})\b(?=.{0,30}\bONE\s+PIECE\b)/,/\bONE\s+PIECE\b.{0,30}?\b(19\d{2}|20\d{2})\b/,/\bBANDAI\s+(19\d{2}|20\d{2})\s+MADE\s+IN\s+JAPAN\b/]){const m=text.match(p);if(m)return m[1];}return "";}
export function extractLanguage(value){const text=normalizeScanText(value).toUpperCase();if(/\bCHINESE\b|\bCHN\b|\bONE\s+PIECE\s+CN\b/.test(text))return"CN";if(/\bJAPANESE\b|\bJAPAN\b|\bONE\s+PIECE\s+JP\b/.test(text))return"JP";if(/\bKOREAN\b|\bKOREA\b|\bONE\s+PIECE\s+KR\b/.test(text))return"KR";if(/\bENGLISH\b|\bONE\s+PIECE\s+ENG\b/.test(text))return"ENG";return"";}
export function extractGame(value){return /\bONE\s+PIECE\b/i.test(normalizeScanText(value))?"One Piece":"";}
export function extractPsaLabelName(value){if(extractGame(value)!=="One Piece")return"";const lines=String(value||"").split(/\r?\n/).map(normalizeScanText).filter(Boolean);const anchor=lines.findIndex(line=>/\b(?:19\d{2}|20\d{2})\b/.test(line)&&/\bONE(?:\s+PIECE)?\b/i.test(line));if(anchor<0)return"";for(let i=anchor+1;i<Math.min(lines.length,anchor+13);i++){if(/[a-z]/.test(lines[i]))continue;let line=lines[i].toUpperCase();if(/^(?:PSA|CERT|FIRST STAGE|PB STORAGE|CHINESE NEW YEAR|NEW YEAR|ONE PIECE|PIECE|CHB|JP|CN|KR|ENG|GEM|NM|MINT|EX|VG|GOOD|POOR|PR|#)/.test(line))continue;line=line.replace(/\b(?:GEM\s*(?:MINT|MT)|NM(?:\s*[- ]?\s*MT)?|MINT|EX(?:\s*[- ]?\s*MT)?|VG(?:\s*[- ]?\s*EX)?|GOOD|PR|POOR)\b.*$/,'').replace(/\s+#?[A-Z]?\d{1,4}\s*$/,'').replace(/[^A-Z0-9 .&'’-]+/g,' ').replace(/\s+/g,' ').trim();if(line.length>=3&&/[A-Z]/.test(line))return line;}return"";}
export function resolveCreateWorker(module){const fn=module?.createWorker||module?.default?.createWorker;return typeof fn==="function"?fn:null;}
export function extractPsaCert(value,barcodeValues=[]){for(const candidate of [...(Array.isArray(barcodeValues)?barcodeValues:[]),String(value||"")]){const url=String(candidate).match(/psacard\.com\/(?:cert|certification)\/(\d{7,10})/i);if(url)return url[1];const labelled=String(candidate).match(/(?:CERT(?:IFICATION)?(?:\s*(?:NO\.?|NUMBER|#))?)[\s:#-]*(\d{7,10})\b/i);if(labelled)return labelled[1];}const standalone=normalizeScanText(value).match(/(?:^|\s)(\d{7,10})(?=\s|$)/);return standalone?standalone[1]:"";}
export function extractGradingCompany(value,barcodeValues=[]){const text=`${normalizeScanText(value)} ${(Array.isArray(barcodeValues)?barcodeValues:[]).join(" ")}`.toUpperCase();if(/PSACARD\.COM|\bPSA\b/.test(text))return"PSA";if(/\bBGS\b|\bBECKETT\b/.test(text))return"BGS";if(/\bCGC\b|CERTIFIED GUARANTY/.test(text))return"CGC";return"";}
export function extractGrade(value){const text=normalizeScanText(value).toUpperCase();const patterns=[/\b(?:GEM\s*(?:MINT|MT))\s*(10(?:\.0)?)\b/,/\b(?:MINT)\s*(9(?:\.5|\.0)?)\b/,/\b(?:NM\s*[- ]?\s*MT|NEAR\s*MINT\s*[- ]?\s*MINT)\s*(8(?:\.5|\.0)?)\b/,/\b(?:NM|NEAR\s*MINT)\s*(7(?:\.5|\.0)?)\b/,/\b(?:EX\s*[- ]?\s*MT|EXCELLENT\s*[- ]?\s*MINT)\s*(6(?:\.5|\.0)?)\b/,/\b(?:EX|EXCELLENT)\s*(5(?:\.5|\.0)?)\b/,/\b(?:VG\s*[- ]?\s*EX|VERY\s*GOOD\s*[- ]?\s*EXCELLENT)\s*(4(?:\.5|\.0)?)\b/,/\b(?:VG|VERY\s*GOOD)\s*(3(?:\.5|\.0)?)\b/,/\b(?:GOOD)\s*(2(?:\.5|\.0)?)\b/,/\b(?:PR|POOR)\s*(1(?:\.5|\.0)?)\b/];for(const p of patterns){const m=text.match(p);if(m)return m[1].replace(/\.0$/,'');}for(const p of [/\bGEM\s*(?:MINT|MT)\b(?:\s+\S+){0,7}?\s+(10(?:\.0)?)\b/,/\bMINT\b(?:\s+\S+){0,5}?\s+(9(?:\.5|\.0)?)\b/,/\bNM\b(?:\s+\S+){0,5}?\s+(7(?:\.5|\.0)?)\b/]){const m=text.match(p);if(m)return m[1].replace(/\.0$/,'');}const explicit=text.match(/\bGRADE\s*[:#-]?\s*(10|[1-9](?:\.5)?)\b/);return explicit?explicit[1]:"";}
function identityValue(field,value){
  const normalized=normalizeScanText(field==="language" ? normalizeAiLanguage(value) : value).toLowerCase();
  if(!normalized || ["unknown","n/a","na"].includes(normalized)) return "";
  if(field==="game" && /^one piece (?:carddass )?hyper battle$/.test(normalized)) return "one piece hyper battle";
  if(field==="series") return normalized.replace(/\b(first|second|third|fourth|fifth|sixth|seventh)\b/g,
    ordinal=>({first:"1st",second:"2nd",third:"3rd",fourth:"4th",fifth:"5th",sixth:"6th",seventh:"7th"})[ordinal]);
  return normalized;
}

const scanIdentityFields=["game","series","language","year"];
const errorNamePrefix=/^(?:\[PRE ERRATA\]\s*\[ERROR\]|PRE ERRATA ERROR|ERROR)(?:\s+|$)/i;

function sameCardCode(card,code){
  return identityValue("card_code",card?.card_code)===code;
}

function scanVariantKey(card){
  return [...scanIdentityFields,"name"].map(field=>identityValue(field,card[field])).join("|");
}

export function resolveScanInventoryMatch(cards,result){
  const code=identityValue("card_code",result?.card_code);
  if(!code) return {matched_card:null,match_candidates:[],match_conflict:false};
  const sameCode=(Array.isArray(cards)?cards:[]).filter(card=>sameCardCode(card,code));
  const compatible=sameCode.filter(card=>scanIdentityFields.every(field=>{
    const detected=identityValue(field,result[field]);
    const stored=identityValue(field,card[field]);
    return !detected || !stored || detected===stored;
  }));
  const candidates=[...new Map(compatible.map(card=>[scanVariantKey(card),card])).values()];
  const only=candidates.length===1 ? candidates[0] : null;
  // A matching number alone cannot establish an error printing.
  const canAutoMatch=only && !errorNamePrefix.test(String(only.name||"").trim()) &&
    identityValue("game",result.game) && identityValue("game",result.game)===identityValue("game",only.game);
  return {
    matched_card:canAutoMatch ? only : null,
    match_candidates:canAutoMatch ? [] : candidates,
    match_conflict:!candidates.length && sameCode.length>0
  };
}

export function findExistingCardByCode(cards,code){const target=String(code||"").trim().toUpperCase();if(!target)return null;return(Array.isArray(cards)?cards:[]).find(card=>String(card?.card_code||"").trim().toUpperCase()===target)||null;}
export function buildCardScanResult(text,barcodeValues=[],cards=[]){const cardCode=extractCardCode(text);return{company:extractGradingCompany(text,barcodeValues),grade:extractGrade(text),cert:extractPsaCert(text,barcodeValues),card_code:cardCode,name:extractPsaLabelName(text),year:extractYear(text),game:extractGame(text),language:extractLanguage(text),matched_card:findExistingCardByCode(cards,cardCode)};}
function gradingEntryMatches(card,company,grade){const entries=Array.isArray(card?.grading)?card.grading:[];return entries.some(entry=>(!company||String(entry?.company||"").trim().toUpperCase()===String(company).trim().toUpperCase())&&(!grade||String(entry?.grade??"").trim()===String(grade).trim()));}
function isRawCard(card){const entries=Array.isArray(card?.grading)?card.grading:[];return !entries.length&&String(card?.format||"").trim().toLowerCase()!=="graded";}
function median(values){const sorted=values.slice().sort((a,b)=>a-b);if(!sorted.length)return null;const middle=Math.floor(sorted.length/2);return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;}
export function buildInventoryPriceRecommendation(cards,result){const code=String(result?.card_code||"").trim().toUpperCase();if(!code)return null;const exact=(Array.isArray(cards)?cards:[]).filter(card=>
  sameCardCode(card,identityValue("card_code",code)) &&
  scanIdentityFields.every(field=>{
    const detected=identityValue(field,result[field]);
    return !detected || detected===identityValue(field,card[field]);
  }) &&
  (!result.name || identityValue("name",result.name)===identityValue("name",card.name)) &&
  Number.isFinite(Number(card?.price_myr)) && Number(card.price_myr)>0
);if(!exact.length)return null;const company=String(result?.company||result?.grading_company||"").trim(),grade=String(result?.grade||"").trim();let pool=[],basis="";if(company||grade){const graded=exact.filter(card=>gradingEntryMatches(card,company,grade));const sold=graded.filter(card=>String(card?.availability||"").trim().toLowerCase()==="sold");if(sold.length){pool=sold;basis="sold inventory comparables with the same card code and grade";}else if(graded.length){pool=graded;basis="inventory comparables with the same card code and grade";}else return null;}else{const raw=exact.filter(isRawCard);const sold=raw.filter(card=>String(card?.availability||"").trim().toLowerCase()==="sold");if(sold.length){pool=sold;basis="sold raw inventory comparables with the same card code";}else if(raw.length){pool=raw;basis="raw inventory comparables with the same card code";}else return null;}const prices=pool.map(card=>Number(card.price_myr)).filter(v=>Number.isFinite(v)&&v>0);if(!prices.length)return null;return{myr:median(prices),min_myr:Math.min(...prices),max_myr:Math.max(...prices),count:prices.length,basis,source:"inventory"};}
export function buildMarketSearches(result){const matched=result?.matched_card||{};const parts=[result?.year||matched.year,result?.game||matched.game,result?.name||matched.name,result?.card_code||matched.card_code,result?.language||matched.language,result?.format,result?.company,result?.grade].filter(Boolean);const query=parts.join(" ").trim();if(!query)return{query:"",ebay:"",mercari:"",google:""};const q=encodeURIComponent(query);return{query,ebay:`https://www.ebay.com/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1`,mercari:`https://jp.mercari.com/search?keyword=${q}`,google:`https://www.google.com/search?q=${q}`};}
function normalizeAiLanguage(value){const v=String(value||"").trim();const u=v.toUpperCase();if(["JP","JPN","JAPANESE"].includes(u))return"JP";if(["ENG","EN","ENGLISH"].includes(u))return"ENG";if(["CN","CHN","CHINESE"].includes(u))return"CN";if(["KR","KOR","KOREAN"].includes(u))return"KR";if(/MIXED|MULTIPLE/.test(u))return"Mixed / Multiple languages";if(["N/A","NA","UNKNOWN"].includes(u))return"N/A";return v;}
export function normalizeAiScanResult(value,cards=[]){const raw=value&&typeof value==="object"?value:{};const format=["Raw","Graded","Sealed"].includes(raw.format)?raw.format:"";const result={name:String(raw.name||"").trim(),card_code:String(raw.card_code||"").trim(),year:String(raw.year||"").trim(),game:String(raw.game||"").trim(),language:normalizeAiLanguage(raw.language),language_details:String(raw.language_details||"").trim(),series:String(raw.series||"").trim(),era:String(raw.era||"").trim(),format,condition:String(raw.condition||"").trim(),company:format==="Graded"?String(raw.grading_company||"").trim():"",grading_company:format==="Graded"?String(raw.grading_company||"").trim():"",grade:format==="Graded"?String(raw.grade||"").trim():"",cert:format==="Graded"?String(raw.cert||"").trim():"",confidence:Math.max(0,Math.min(1,Number(raw.confidence)||0)),notes:String(raw.notes||"").trim()};result.name=result.name.replace(errorNamePrefix,"");
    if(format==="Graded" && /^PSA$/i.test(result.company) && !/^\d{7,10}$/.test(result.cert)) result.cert="";
    return Object.assign(result,resolveScanInventoryMatch(cards,result));}
export function normalizeAiMarketPrice(value){const raw=value&&typeof value==="object"?value:{};const myr=Number(raw.myr);if(!Number.isFinite(myr)||myr<=0)return null;const min=Number(raw.min_myr),max=Number(raw.max_myr);return{myr,min_myr:Number.isFinite(min)&&min>0?min:myr,max_myr:Number.isFinite(max)&&max>0?max:myr,count:Math.max(0,Math.round(Number(raw.count)||0)),basis:String(raw.basis||"AI web market research").trim(),confidence:Math.max(0,Math.min(1,Number(raw.confidence)||0)),sources:Array.isArray(raw.sources)?raw.sources.filter(source=>source&&/^https?:\/\//i.test(String(source.url||""))).slice(0,5):[],source:"ai_web"};}
async function functionErrorMessage(error,fallback){try{const response=error?.context;if(response&&typeof response.clone==="function"){const payload=await response.clone().json();const message=String(payload?.message||payload?.error||"").replace(/\s+/g," ").trim();if(message)return message;}}catch{}return String(error?.message||fallback||"Request failed").replace(/\s+/g," ").trim();}

export function register(appContext){
  let lastResult=null,lastPriceRecommendation=null,scannerBusy=false,scanSequence=0,addFormState=null,scannedSource="",scannedDetail=null;
  const $=id=>appContext.$(id);
  const setStatus=(message,tone="")=>{const el=$("addCardScanStatus");if(el){el.textContent=message;el.dataset.tone=tone;}};
  const setProgress=message=>{const el=$("addCardScanProgress");if(el)el.textContent=message;};
  const setPriceStatus=(message,tone="")=>{const el=$("addCardScanPrice");if(el){el.textContent=message;el.dataset.tone=tone;}};
  function firstUploadedImageSource(){const clean=addFormState?.imageCleanSources?.[0];if(clean)return clean;const image=$("addImageGalleryPreview")?.querySelector?.("img");return String(image?.currentSrc||image?.src||"").trim();}
  async function scanImageDataUrl(source,maxSize){
    const {img}=await appContext.loadImageElementFromSource(source);
    const scale=Math.min(1,maxSize/Math.max(img.naturalWidth,img.naturalHeight));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const ctx=canvas.getContext("2d",{alpha:false});
    if(!ctx)throw new Error("Image canvas unavailable.");
    ctx.fillStyle="#fff";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    return canvas.toDataURL("image/jpeg",0.92);
  }

  async function scanDetailDataUrl(file){
    if(!file)return "";
    if(!/^image\/(?:jpeg|png|webp)$/i.test(file.type))throw new Error("Use a JPEG, PNG or WebP close-up.");
    const source=URL.createObjectURL(file);
    try{return await scanImageDataUrl(source,1600);}
    finally{URL.revokeObjectURL(source);}
  }

  function setField(id,value){if(value==null||value==="")return false;const field=$(id);if(!field)return false;const text=String(value);if(field.tagName==="SELECT"&&!Array.from(field.options||[]).some(option=>option.value===text))return false;field.value=text;field.dispatchEvent(new Event("change",{bubbles:true}));field.dispatchEvent(new Event("input",{bubbles:true}));return true;}
  function applyMatchedFallback(card,result){if(!card)return;const map=[["name","name"],["card_code","card_code"],["year","year"],["game","game"],["language","language"],["language_details","language_details"],["era","era"],["series","series"]];for(const [key,cardKey] of map)if(!result[key]&&card[cardKey])result[key]=card[cardKey];}
  function applyGrading(result){const rows=$("addGradingRows");if(result.format!=="Graded"){setField("addFormat",result.format||"Raw");if(rows)rows.innerHTML="";return;}setField("addFormat","Graded");setField("addCondition","NA");let row=rows?.querySelector?.(".grading-row");if(!row){$("addAddGrade")?.click();row=rows?.querySelector?.(".grading-row");}if(!row)return;const company=row.querySelector(".addGradeCompany"),grade=row.querySelector(".addGradeValue"),cert=row.querySelector(".addGradeCert");if(company&&result.company){company.value=result.company;company.dispatchEvent(new Event("change",{bubbles:true}));}if(grade&&result.grade){grade.value=result.grade;grade.dispatchEvent(new Event("change",{bubbles:true}));}if(cert&&result.cert){cert.value=result.cert;cert.dispatchEvent(new Event("input",{bubbles:true}));}}
  function scanPhotosStillMatch(){
    return scannedSource===firstUploadedImageSource() && scannedDetail===($("addCardScanDetail")?.files?.[0]||null);
  }
  function applyScanResult(){if(!lastResult || !appContext.isOwnerMode?.())return;if(!scanPhotosStillMatch()){setStatus("The scan photos changed. Run the scan again.","warning");return;}applyMatchedFallback(lastResult.matched_card,lastResult);for(const [id,key] of [["addName","name"],["addCardCode","card_code"],["addYear","year"],["addGame","game"],["addLanguage","language"],["addLanguageDetails","language_details"],["addSeries","series"],["addEra","era"],["addCondition","condition"]])setField(id,lastResult[key]);appContext.wirePreErrataError?.("add");if(lastResult.format)applyGrading(lastResult);appContext.showToast?.("AI-detected card details applied — please review before saving");setStatus("Applied AI-detected details to Add Card. Review every field before saving.","success");}
  function priceSummary(r){if(!r)return"No reliable current market price or matching internal comparable was found.";const range=r.min_myr===r.max_myr?"":` · range RM ${Math.round(r.min_myr).toLocaleString()}–${Math.round(r.max_myr).toLocaleString()}`;const confidence=r.source==="ai_web"&&r.confidence?` · ${Math.round(r.confidence*100)}% confidence`:"";const source=r.source==="ai_web"?"current web market research":"internal inventory comparables";return`Suggested price: RM ${Math.round(r.myr).toLocaleString()} · ${source}${r.count?` (${r.count} comparable${r.count===1?"":"s"})`:""}${range}${confidence}. ${r.basis||""}`.trim();}
  function applyPriceRecommendation(){if(!lastPriceRecommendation || !appContext.isOwnerMode?.())return;if(!scanPhotosStillMatch()){setStatus("The scan photos changed. Run the scan again.","warning");return;}const rounded=Math.round(lastPriceRecommendation.myr);setField("addPriceMYR",rounded);appContext.showToast?.(`Suggested price RM ${rounded.toLocaleString()} applied`);setPriceStatus(`${priceSummary(lastPriceRecommendation)} Applied to MYR price; review before saving.`,"success");}
  function setMarketLinks(result,price){const box=$("addCardScanMarket");if(!box)return;const searches=buildMarketSearches(result);const sourceLinks=Array.isArray(price?.sources)?price.sources.map((source,index)=>`<a href="${String(source.url).replace(/"/g,"%22")}" target="_blank" rel="noopener noreferrer">Source ${index+1}</a>`).join(" · "):"";if(!searches.query&&!sourceLinks){box.innerHTML="";return;}const safe=searches.query.replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;"}[c]));const manual=searches.query?`Market check for <strong>${safe}</strong>: <a href="${searches.ebay}" target="_blank" rel="noopener noreferrer">eBay sold/completed</a> · <a href="${searches.mercari}" target="_blank" rel="noopener noreferrer">Mercari JP</a> · <a href="${searches.google}" target="_blank" rel="noopener noreferrer">Google</a>.`:"";box.innerHTML=`${sourceLinks?`AI market sources: ${sourceLinks}. `:""}${manual}`;}
  function scanSummary(result){const parts=[];if(result.name)parts.push(result.name);if(result.card_code)parts.push(result.card_code);if(result.game)parts.push(result.game);if(result.year)parts.push(result.year);if(result.language)parts.push(result.language);if(result.format)parts.push(result.format);if(result.company)parts.push(result.company);if(result.grade)parts.push(`Grade ${result.grade}`);if(result.cert)parts.push(`Cert ${result.cert}`);if(!parts.length)return"The scan could not identify reliable card details.";return`AI detected: ${parts.join(" · ")}.${result.confidence?` Confidence ${Math.round(result.confidence*100)}%.`:""}${result.notes?` ${result.notes}`:""}`;}
  async function researchPrice(result,sequence){if(!result)return;const priceButton=$("addCardScanApplyPrice");if(priceButton)priceButton.disabled=true;const internal=buildInventoryPriceRecommendation(appContext.cards||[],result);if(internal){lastPriceRecommendation=internal;setPriceStatus(`${priceSummary(internal)} Checking current web market in background…`,"success");setMarketLinks(result,internal);}else setPriceStatus("Card identified. Checking current web market in background…");try{const {data,error}=await appContext.supabaseClient.functions.invoke("scan-card-ai-dev",{body:{action:"price",card:{...result,matched_card:undefined,match_candidates:undefined}}});if(sequence!==scanSequence)return;if(error)throw new Error(await functionErrorMessage(error,"Market research failed"));const web=normalizeAiMarketPrice(data?.market_price);lastPriceRecommendation=web||internal;setPriceStatus(priceSummary(lastPriceRecommendation),lastPriceRecommendation?"success":"");setMarketLinks(result,lastPriceRecommendation);if(priceButton)priceButton.disabled=!lastPriceRecommendation;}catch(error){if(sequence!==scanSequence)return;console.warn("AI market price research failed:",error);lastPriceRecommendation=internal;setPriceStatus(internal?`${priceSummary(internal)} Current web market check was unavailable.`:"Current web market check was unavailable; no exact internal comparable was found.",internal?"success":"warning");setMarketLinks(result,internal);if(priceButton)priceButton.disabled=!internal;}}
  function showDetection(result){
    const needsReview=result.match_conflict || result.match_candidates.length>0;
    const message=result.match_conflict
      ? " The detected game, set, language or year conflicts with inventory cards sharing this number."
      : result.match_candidates.length ? " Confirm the printing below before using inventory details or a price." : "";
    setStatus(scanSummary(result)+message,needsReview || !result.card_code ? "warning" : "success");
    const button=$("addCardScanApply");
    if(button)button.disabled=!(result.name || result.card_code || result.game);
  }

  function checkDetectedPrice(result,sequence){
    const priceButton=$("addCardScanApplyPrice");
    if(priceButton)priceButton.disabled=true;
    lastPriceRecommendation=null;
    setMarketLinks(result,null);
    if(result.match_conflict || result.match_candidates.length || !result.card_code || !result.name ||
       !result.game || !result.format || (!result.match_confirmed && result.confidence>0 && result.confidence<0.7) || (result.format==="Graded" && (!result.company || !result.grade))){
      setPriceStatus("Price withheld until there is enough information to identify the printing and grade.","warning");
      return;
    }
    void researchPrice(result,sequence);
  }

  function showMatchChoices(detected){
    const field=$("addCardScanMatch");
    if(!field)return;
    field.onchange=null;
    field.replaceChildren(new Option("Choose a matching printing",""));
    field.parentElement.hidden=!detected.match_candidates.length;
    detected.match_candidates.forEach((card,index)=>{
      const label=[card.name,card.game,card.series,card.language,card.year].filter(Boolean).join(" · ");
      field.add(new Option(label,String(index)));
    });
    field.onchange=()=>{
      if(!appContext.isOwnerMode?.())return;
      if(!scanPhotosStillMatch()){setStatus("The scan photos changed. Run the scan again.","warning");return;}
      const chosen=field.value==="" ? null : detected.match_candidates[Number(field.value)];
      lastResult={...detected};
      if(chosen){
        lastResult.matched_card=chosen;
        lastResult.match_confirmed=true;
        lastResult.match_candidates=[];
        lastResult.name=chosen.name||detected.name;
        applyMatchedFallback(chosen,lastResult);
      }
      showDetection(lastResult);
      checkDetectedPrice(lastResult,++scanSequence);
    };
  }

  async function scanFirstUploadedImage(){
    if(scannerBusy || !appContext.isOwnerMode?.())return;
    const source=firstUploadedImageSource();
    if(addFormState?.processingImages){setStatus("Wait for the photo to finish processing.","warning");return;}
    if(!source){setStatus("Upload a clear front photo as image #1.","warning");return;}
    const detail=$("addCardScanDetail")?.files?.[0];
    scannerBusy=true;
    const sequence=++scanSequence;
    lastResult=null;
    lastPriceRecommendation=null;
    setMarketLinks(null,null);
    showMatchChoices({match_candidates:[]});
    const scanButton=$("addCardScanUploaded");
    for(const id of ["addCardScanUploaded","addCardScanApply","addCardScanApplyPrice"]){
      const button=$(id);
      if(button)button.disabled=true;
    }
    setStatus("Reading the card number, printing and slab label…");
    setProgress("Preparing scan photos…");
    setPriceStatus("Price research starts after a printing is identified.");
    try{
      const [image,detail_image]=await Promise.all([scanImageDataUrl(source,2000),scanDetailDataUrl(detail)]);
      setProgress("Identifying card…");
      const {data,error}=await appContext.supabaseClient.functions.invoke("scan-card-ai-dev",{
        body:detail_image ? {image,detail_image} : {image}
      });
      if(error)throw new Error(await functionErrorMessage(error,"AI scanner request failed"));
      if(!data?.ok)throw new Error(data?.message||data?.error||"AI scanner returned no result");
      if(sequence!==scanSequence)return;
      if(source!==firstUploadedImageSource() || detail!==$("addCardScanDetail")?.files?.[0]){
        setStatus("The scan photos changed. Run the scan again.","warning");
        setProgress("");
        return;
      }
      scannedSource=source;
      scannedDetail=detail||null;
      lastResult=normalizeAiScanResult(data.result,appContext.cards||[]);
      applyMatchedFallback(lastResult.matched_card,lastResult);
      showDetection(lastResult);
      showMatchChoices(lastResult);
      setProgress("Scan complete. Review the detected fields before saving.");
      checkDetectedPrice(lastResult,sequence);
    }catch(error){
      if(sequence!==scanSequence)return;
      console.error("AI card scanner failed:",error);
      setStatus(String(error?.message||"Could not scan this card.").slice(0,220),"error");
      setProgress("");
      setPriceStatus("No price recommendation was generated.");
    }finally{
      scannerBusy=false;
      if(scanButton)scanButton.disabled=false;
    }
  }

  function wireScanner(){if(!appContext.isOwnerMode?.())return;const form=appContext.view?.querySelector?.(".form-card");if(!form||$("addCardScanner"))return;const scanner=document.createElement("div");scanner.id="addCardScanner";scanner.className="panel owner-only ai-card-scanner";scanner.innerHTML=`<div class="ai-card-scanner__header"><div><div class="ai-card-scanner__eyebrow">OWNER AI TOOL</div><h3>AI Card Scanner</h3><p class="hint">Scan image #1. Add an optional close-up or back photo for small print or similar variants.</p></div></div><label class="field">Close-up or back photo (optional, scan only)<input type="file" id="addCardScanDetail" accept="image/jpeg,image/png,image/webp"></label><div class="ai-card-scanner__actions"><button type="button" class="btn-primary" id="addCardScanUploaded">AI Scan Card</button><button type="button" id="addCardScanApply" disabled>Apply detected fields</button><button type="button" id="addCardScanApplyPrice" disabled>Apply recommended price</button></div><div class="ai-card-scanner__results"><div class="ai-card-scanner__result"><span class="ai-card-scanner__label">CARD DETECTION</span><div class="hint" id="addCardScanStatus">Upload a clear front photo as image #1.</div></div><div class="ai-card-scanner__result"><span class="ai-card-scanner__label">SCAN STATUS</span><div class="hint" id="addCardScanProgress">Image #1 and the optional scan photo are used.</div></div><div class="ai-card-scanner__result ai-card-scanner__result--price"><span class="ai-card-scanner__label">PRICE RECOMMENDATION</span><div class="hint" id="addCardScanPrice">Price research runs separately after identification, so it does not delay the scan result.</div></div></div><label class="field" hidden>Confirm matching printing<select id="addCardScanMatch"></select></label><div class="ai-card-scanner__market hint" id="addCardScanMarket"></div>`;const imageField=form.querySelector(".image-field");if(imageField)imageField.insertAdjacentElement("afterend",scanner);else form.prepend(scanner);$("addCardScanUploaded")?.addEventListener("click",scanFirstUploadedImage);$("addCardScanApply")?.addEventListener("click",applyScanResult);$("addCardScanApplyPrice")?.addEventListener("click",applyPriceRecommendation);}
  const originalRenderAddPage=appContext.renderAddPage;appContext.renderAddPage=function(...args){const result=originalRenderAddPage(...args);addFormState=result||null;++scanSequence;lastResult=null;lastPriceRecommendation=null;wireScanner();return result;};Object.assign(appContext,{scanUploadedCardPhotos:scanFirstUploadedImage,buildCardScanResult:(text,barcodes=[])=>buildCardScanResult(text,barcodes,appContext.cards||[]),buildInventoryPriceRecommendation:result=>buildInventoryPriceRecommendation(appContext.cards||[],result)});
}
