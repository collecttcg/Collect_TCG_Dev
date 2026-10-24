/** Owner-only Add Card scanner. OCR runs in the browser and only recommends fields for confirmation. */
const TESSERACT_MODULE_URL="https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.esm.min.js";
const TESSERACT_WORKER_URL="https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js";
const TESSERACT_CORE_URL="https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0";
const TESSERACT_LANG_URL="https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int/";

export function normalizeScanText(value){
  return String(value||"").replace(/[\u2010-\u2015]/g,"-").replace(/\s+/g," ").trim();
}

export function extractCardCode(value){
  const text=normalizeScanText(value).toUpperCase();
  const standard=text.match(/(?:^|[^A-Z0-9])([O0][P]|[S58][T7]|[E3][B8]|PR[B8])\s*[- ]?\s*(\d{2})\s*[- ]\s*(\d{3})(?:[1I])?(?=\D|$)/);
  if(standard){
    const prefix=standard[1]
      .replace(/^0P$/,"OP")
      .replace(/^[58]7$/,"ST")
      .replace(/^3[8B]$/,"EB")
      .replace(/^E8$/,"EB")
      .replace(/^PR8$/,"PRB");
    return `${prefix}${standard[2]}-${standard[3]}`;
  }
  const promo=text.match(/\bP\s*[- ]\s*(\d{3})(?=\D|$)/);
  if(promo) return `P-${promo[1]}`;
  const lines=String(value||"").split(/\r?\n/).map(line=>normalizeScanText(line).toUpperCase()).filter(Boolean);
  for(const line of lines){
    const labelled=line.match(/#\s*([CSG])(\d{2,3})(?:\b|\D)/);
    if(labelled) return `${labelled[1]}${labelled[2]}`;
  }
  if(/\bHYPER\s+BATTLE\b|\bBANDAI\s+(?:1999|2000|2001)\b/.test(text)){
    for(const line of lines){
      const vintage=line.match(/^([CSG])(\d{2,3})(?:\b|\D)/);
      if(vintage) return `${vintage[1]}${vintage[2]}`;
    }
  }
  return "";
}

export function extractYear(value){
  const text=normalizeScanText(value).toUpperCase();
  const patterns=[
    /\b(19\d{2}|20\d{2})\b(?=.{0,30}\bONE\s+PIECE\b)/,
    /\bONE\s+PIECE\b.{0,30}?\b(19\d{2}|20\d{2})\b/,
    /\bBANDAI\s+(19\d{2}|20\d{2})\s+MADE\s+IN\s+JAPAN\b/
  ];
  for(const pattern of patterns){
    const match=text.match(pattern);
    if(match) return match[1];
  }
  return "";
}

export function extractLanguage(value){
  const text=normalizeScanText(value).toUpperCase();
  if(/\bCHINESE\b|\bCHN\b|\bONE\s+PIECE\s+CN\b/.test(text)) return "CN";
  if(/\bJAPANESE\b|\bJAPAN\b|\bONE\s+PIECE\s+JP\b/.test(text)) return "JP";
  if(/\bKOREAN\b|\bKOREA\b|\bONE\s+PIECE\s+KR\b/.test(text)) return "KR";
  if(/\bENGLISH\b|\bONE\s+PIECE\s+ENG\b/.test(text)) return "ENG";
  if(/\bONE\s+PIECE\b/.test(text)){
    const lines=String(value||"").split(/\r?\n/).map(line=>normalizeScanText(line).toUpperCase()).filter(Boolean);
    if(lines.includes("JP")) return "JP";
    if(lines.includes("CN")) return "CN";
    if(lines.includes("KR")) return "KR";
    if(lines.includes("ENG")) return "ENG";
  }
  return "";
}

export function extractGame(value){
  return /\bONE\s+PIECE\b/i.test(normalizeScanText(value)) ? "One Piece" : "";
}

export function extractPsaLabelName(value){
  if(extractGame(value)!=="One Piece") return "";
  const lines=String(value||"").split(/\r?\n/).map(normalizeScanText).filter(Boolean);
  const anchor=lines.findIndex(line=>/\b(?:19\d{2}|20\d{2})\b/.test(line) && /\bONE(?:\s+PIECE)?\b/i.test(line));
  if(anchor<0) return "";
  for(let index=anchor+1; index<Math.min(lines.length,anchor+13); index++){
    if(/[a-z]/.test(lines[index])) continue;
    let line=lines[index].toUpperCase();
    if(/^(?:PSA|CERT|FIRST STAGE|PB STORAGE|CHINESE NEW YEAR|NEW YEAR|ONE PIECE|PIECE|CHB|JP|CN|KR|ENG|GEM|NM|MINT|EX|VG|GOOD|POOR|PR|#)/.test(line)) continue;
    line=line
      .replace(/\b(?:GEM\s*(?:MINT|MT)|NM(?:\s*[- ]?\s*MT)?|MINT|EX(?:\s*[- ]?\s*MT)?|VG(?:\s*[- ]?\s*EX)?|GOOD|PR|POOR)\b.*$/,'')
      .replace(/\s+#?[A-Z]?\d{1,4}\s*$/,'')
      .replace(/[^A-Z0-9 .&'’-]+/g,' ')
      .replace(/\s+/g,' ')
      .trim();
    if(line.length>=3 && /[A-Z]/.test(line)) return line;
  }
  return "";
}

export function resolveCreateWorker(module){
  const createWorker=module?.createWorker || module?.default?.createWorker;
  return typeof createWorker==="function" ? createWorker : null;
}

export function extractPsaCert(value,barcodeValues=[]){
  const candidates=[...(Array.isArray(barcodeValues)?barcodeValues:[]),String(value||"")];
  for(const candidate of candidates){
    const text=String(candidate||"");
    const urlMatch=text.match(/psacard\.com\/(?:cert|certification)\/(\d{7,10})/i);
    if(urlMatch) return urlMatch[1];
    const labelled=text.match(/(?:CERT(?:IFICATION)?(?:\s*(?:NO\.?|NUMBER|#))?)[\s:#-]*(\d{7,10})\b/i);
    if(labelled) return labelled[1];
  }
  const compact=normalizeScanText(value);
  const standalone=compact.match(/(?:^|\s)(\d{7,10})(?=\s|$)/);
  return standalone ? standalone[1] : "";
}

export function extractGradingCompany(value,barcodeValues=[]){
  const text=`${normalizeScanText(value)} ${(Array.isArray(barcodeValues)?barcodeValues:[]).join(" ")}`.toUpperCase();
  if(/PSACARD\.COM|\bPSA\b/.test(text)) return "PSA";
  if(/\bBGS\b|\bBECKETT\b/.test(text)) return "BGS";
  if(/\bCGC\b|CERTIFIED GUARANTY/.test(text)) return "CGC";
  return "";
}

export function extractGrade(value){
  const text=normalizeScanText(value).toUpperCase();
  const patterns=[
    /\b(?:GEM\s*(?:MINT|MT))\s*(10(?:\.0)?)\b/,
    /\b(?:MINT)\s*(9(?:\.5|\.0)?)\b/,
    /\b(?:NM\s*[- ]?\s*MT|NEAR\s*MINT\s*[- ]?\s*MINT)\s*(8(?:\.5|\.0)?)\b/,
    /\b(?:NM|NEAR\s*MINT)\s*(7(?:\.5|\.0)?)\b/,
    /\b(?:EX\s*[- ]?\s*MT|EXCELLENT\s*[- ]?\s*MINT)\s*(6(?:\.5|\.0)?)\b/,
    /\b(?:EX|EXCELLENT)\s*(5(?:\.5|\.0)?)\b/,
    /\b(?:VG\s*[- ]?\s*EX|VERY\s*GOOD\s*[- ]?\s*EXCELLENT)\s*(4(?:\.5|\.0)?)\b/,
    /\b(?:VG|VERY\s*GOOD)\s*(3(?:\.5|\.0)?)\b/,
    /\b(?:GOOD)\s*(2(?:\.5|\.0)?)\b/,
    /\b(?:PR|POOR)\s*(1(?:\.5|\.0)?)\b/
  ];
  for(const pattern of patterns){
    const match=text.match(pattern);
    if(match) return match[1].replace(/\.0$/,'');
  }
  const relaxed=[
    [/\bGEM\s*(?:MINT|MT)\b(?:\s+\S+){0,7}?\s+(10(?:\.0)?)\b/,"10"],
    [/\bMINT\b(?:\s+\S+){0,5}?\s+(9(?:\.5|\.0)?)\b/,"9"],
    [/\bNM\b(?:\s+\S+){0,5}?\s+(7(?:\.5|\.0)?)\b/,"7"]
  ];
  for(const [pattern] of relaxed){
    const match=text.match(pattern);
    if(match) return match[1].replace(/\.0$/,'');
  }
  const explicit=text.match(/\bGRADE\s*[:#-]?\s*(10|[1-9](?:\.5)?)\b/);
  return explicit ? explicit[1] : "";
}

export function findExistingCardByCode(cards,code){
  const target=String(code||"").trim().toUpperCase();
  if(!target) return null;
  return (Array.isArray(cards)?cards:[]).find(card=>String(card?.card_code||"").trim().toUpperCase()===target) || null;
}

export function buildCardScanResult(text,barcodeValues=[],cards=[]){
  const cardCode=extractCardCode(text);
  return {
    company:extractGradingCompany(text,barcodeValues),
    grade:extractGrade(text),
    cert:extractPsaCert(text,barcodeValues),
    card_code:cardCode,
    name:extractPsaLabelName(text),
    year:extractYear(text),
    game:extractGame(text),
    language:extractLanguage(text),
    matched_card:findExistingCardByCode(cards,cardCode)
  };
}

function gradingEntryMatches(card,company,grade){
  const entries=Array.isArray(card?.grading) ? card.grading : [];
  if(!company && !grade) return true;
  return entries.some(entry=>{
    const companyMatch=!company || String(entry?.company||"").trim().toUpperCase()===String(company).trim().toUpperCase();
    const gradeMatch=!grade || String(entry?.grade??"").trim()===String(grade).trim();
    return companyMatch && gradeMatch;
  });
}

function median(values){
  const sorted=values.slice().sort((a,b)=>a-b);
  if(!sorted.length) return null;
  const middle=Math.floor(sorted.length/2);
  return sorted.length%2 ? sorted[middle] : (sorted[middle-1]+sorted[middle])/2;
}

export function buildInventoryPriceRecommendation(cards,result){
  const code=String(result?.card_code||"").trim().toUpperCase();
  if(!code) return null;
  const exact=(Array.isArray(cards)?cards:[]).filter(card=>
    String(card?.card_code||"").trim().toUpperCase()===code &&
    Number.isFinite(Number(card?.price_myr)) &&
    Number(card.price_myr)>0
  );
  if(!exact.length) return null;

  const company=String(result?.company||"").trim();
  const grade=String(result?.grade||"").trim();
  const graded=company||grade ? exact.filter(card=>gradingEntryMatches(card,company,grade)) : [];
  const sold=exact.filter(card=>String(card?.availability||"").trim().toLowerCase()==="sold");
  const soldGraded=graded.filter(card=>String(card?.availability||"").trim().toLowerCase()==="sold");

  let pool=soldGraded;
  let basis="sold inventory comparables with the same card code and grade";
  if(!pool.length){
    pool=graded;
    basis="inventory comparables with the same card code and grade";
  }
  if(!pool.length){
    pool=sold;
    basis="sold inventory comparables with the same card code";
  }
  if(!pool.length){
    pool=exact;
    basis="inventory comparables with the same card code";
  }

  const prices=pool.map(card=>Number(card.price_myr)).filter(value=>Number.isFinite(value)&&value>0);
  if(!prices.length) return null;
  return {
    myr:median(prices),
    min_myr:Math.min(...prices),
    max_myr:Math.max(...prices),
    count:prices.length,
    basis
  };
}

export function register(appContext){
  let lastResult=null;
  let lastPriceRecommendation=null;
  let scannerBusy=false;

  function setStatus(message,tone=""){
    const status=appContext.$("addCardScanStatus");
    if(!status) return;
    status.textContent=message;
    status.dataset.tone=tone;
  }

  function setProgress(message){
    const progress=appContext.$("addCardScanProgress");
    if(progress) progress.textContent=message;
  }

  function setPriceStatus(message,tone=""){
    const status=appContext.$("addCardScanPrice");
    if(!status) return;
    status.textContent=message;
    status.dataset.tone=tone;
  }

  function uploadedImageSources(){
    return Array.from(appContext.$("addImageGalleryPreview")?.querySelectorAll?.("img")||[])
      .map(image=>String(image.currentSrc||image.src||"").trim())
      .filter(Boolean);
  }

  async function sourceToBlob(source){
    if(typeof Blob!=="undefined" && source instanceof Blob) return source;
    if(typeof source!=="string") return null;
    try{
      const response=await fetch(source);
      if(!response.ok) return null;
      return await response.blob();
    }catch{
      return null;
    }
  }

  async function buildOcrRegions(source){
    if(typeof document==="undefined" || typeof createImageBitmap!=="function") return [source];
    let bitmap;
    try{
      const blob=await sourceToBlob(source);
      if(!blob) return [source];
      bitmap=await createImageBitmap(blob);
      const width=bitmap.width;
      const height=bitmap.height;
      if(!width || !height) return [source];
      const specs=height>=width
        ? [[Math.round(width*0.10),Math.round(height*0.04),Math.round(width*0.80),Math.round(height*0.28)],[Math.round(width*0.08),Math.round(height*0.60),Math.round(width*0.84),Math.round(height*0.37)]]
        : [[Math.round(width*0.04),Math.round(height*0.08),Math.round(width*0.38),Math.round(height*0.84)],[Math.round(width*0.58),Math.round(height*0.08),Math.round(width*0.38),Math.round(height*0.84)]];
      const regions=[source];
      for(const [sx,sy,sw,sh] of specs){
        if(sw<40 || sh<40) continue;
        const scale=Math.min(2,1600/Math.max(sw,sh));
        const canvas=document.createElement("canvas");
        canvas.width=Math.max(1,Math.round(sw*scale));
        canvas.height=Math.max(1,Math.round(sh*scale));
        const context=canvas.getContext("2d",{alpha:false});
        if(!context) continue;
        context.drawImage(bitmap,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
        regions.push(canvas.toDataURL("image/jpeg",0.92));
      }
      return regions;
    }catch(error){
      console.warn("Card scanner detail crops unavailable:",error);
      return [source];
    }finally{
      try{ bitmap?.close?.(); }catch(_error){}
    }
  }

  async function detectBarcodes(source){
    if(typeof window==="undefined" || !("BarcodeDetector" in window) || typeof createImageBitmap!=="function") return [];
    let bitmap;
    try{
      const blob=await sourceToBlob(source);
      if(!blob) return [];
      const supported=typeof window.BarcodeDetector.getSupportedFormats==="function"
        ? await window.BarcodeDetector.getSupportedFormats()
        : ["qr_code"];
      const formats=["qr_code","code_128","data_matrix"].filter(format=>supported.includes(format));
      if(!formats.length) return [];
      bitmap=await createImageBitmap(blob);
      const detector=new window.BarcodeDetector({formats});
      const found=await detector.detect(bitmap);
      return (found||[]).map(item=>String(item?.rawValue||"").trim()).filter(Boolean);
    }catch(error){
      console.warn("Card scanner barcode detection unavailable:",error);
      return [];
    }finally{
      try{ bitmap?.close?.(); }catch(_error){}
    }
  }

  async function createOcrWorker(){
    const module=await import(TESSERACT_MODULE_URL);
    const createWorker=resolveCreateWorker(module);
    if(!createWorker) throw new Error("Tesseract OCR library loaded without createWorker");
    const worker=await createWorker("eng",1,{
      workerPath:TESSERACT_WORKER_URL,
      corePath:TESSERACT_CORE_URL,
      langPath:TESSERACT_LANG_URL,
      logger:event=>{
        if(!event?.status) return;
        const percent=Number.isFinite(event.progress) ? ` ${Math.round(event.progress*100)}%` : "";
        setProgress(`${event.status}${percent}`);
      }
    });
    await worker.setParameters?.({tessedit_pageseg_mode:"11",preserve_interword_spaces:"1"});
    return worker;
  }

  function scanSummary(result,confidence,imageCount){
    const parts=[];
    if(result.company) parts.push(result.company);
    if(result.grade) parts.push(`Grade ${result.grade}`);
    if(result.cert) parts.push(`Cert ${result.cert}`);
    if(result.card_code) parts.push(result.card_code);
    if(result.matched_card?.name) parts.push(String(result.matched_card.name));
    else if(result.name) parts.push(result.name);
    if(result.year) parts.push(result.year);
    if(result.language) parts.push(result.language);
    if(!parts.length) return `Scanned ${imageCount} uploaded photo${imageCount===1?"":"s"}, but no reliable card details were detected. Try a closer, sharper card/front-label photo.`;
    const confidenceText=confidence>0 ? ` Average OCR confidence ${Math.round(confidence)}%.` : "";
    return `Detected from ${imageCount} uploaded photo${imageCount===1?"":"s"}: ${parts.join(" · ")}.${confidenceText}`;
  }

  function priceSummary(recommendation){
    if(!recommendation) return "No internal price comparable was found for this card code. Market pricing is not guessed automatically.";
    const rounded=Math.round(recommendation.myr);
    const range=recommendation.min_myr===recommendation.max_myr
      ? ""
      : ` · observed RM ${Math.round(recommendation.min_myr).toLocaleString()}–${Math.round(recommendation.max_myr).toLocaleString()}`;
    return `Suggested starting price: RM ${rounded.toLocaleString()} · based on ${recommendation.count} ${recommendation.basis}${range}. This is an internal comparable, not a live market quote.`;
  }

  function setField(id,value){
    if(value==null || value==="") return false;
    const field=appContext.$(id);
    if(!field) return false;
    field.value=String(value);
    field.dispatchEvent(new Event("change",{bubbles:true}));
    field.dispatchEvent(new Event("input",{bubbles:true}));
    return true;
  }

  function applyMatchedCard(card){
    if(!card) return;
    setField("addName",card.name);
    setField("addCardCode",card.card_code);
    setField("addYear",card.year);
    setField("addGame",card.game);
    setField("addLanguage",card.language);
    setField("addLanguageDetails",card.language_details);
    setField("addEra",card.era);
    setField("addSet",card.set);
    setField("addSeries",card.series);
    setField("addFormat",card.format);
    setField("addRarity",card.rarity);
  }

  function applyGrading(result){
    if(!result.company && !result.grade && !result.cert) return;
    setField("addFormat","Graded");
    let row=appContext.$("addGradingRows")?.querySelector?.(".grading-row");
    if(!row){
      appContext.$("addAddGrade")?.click();
      row=appContext.$("addGradingRows")?.querySelector?.(".grading-row");
    }
    if(!row) return;
    const company=row.querySelector(".addGradeCompany");
    const grade=row.querySelector(".addGradeValue");
    const cert=row.querySelector(".addGradeCert");
    if(company && result.company){ company.value=result.company; company.dispatchEvent(new Event("change",{bubbles:true})); }
    if(grade && result.grade){ grade.value=result.grade; grade.dispatchEvent(new Event("change",{bubbles:true})); }
    if(cert && result.cert){ cert.value=result.cert; cert.dispatchEvent(new Event("input",{bubbles:true})); }
  }

  function applyScanResult(){
    if(!lastResult) return;
    if(lastResult.matched_card) applyMatchedCard(lastResult.matched_card);
    else{
      setField("addName",lastResult.name);
      setField("addCardCode",lastResult.card_code);
      setField("addYear",lastResult.year);
      setField("addGame",lastResult.game);
      setField("addLanguage",lastResult.language);
    }
    applyGrading(lastResult);
    appContext.showToast?.("Detected card details applied — please review before saving");
    setStatus("Applied detected details to Add Card. Review every field before saving.","success");
  }

  function applyPriceRecommendation(){
    if(!lastPriceRecommendation) return;
    const rounded=Math.round(lastPriceRecommendation.myr);
    setField("addPriceMYR",rounded);
    appContext.showToast?.(`Suggested price RM ${rounded.toLocaleString()} applied`);
    setPriceStatus(`${priceSummary(lastPriceRecommendation)} Applied to MYR price; review before saving.`,"success");
  }

  async function scanUploadedPhotos(){
    if(scannerBusy) return;
    const sources=uploadedImageSources();
    if(!sources.length){
      setStatus("Upload the card photos using the normal Choose Files control first, then press Scan Uploaded Photos.","warning");
      setProgress("The scanner now uses the same photos that will be saved with the card.");
      return;
    }

    scannerBusy=true;
    lastResult=null;
    lastPriceRecommendation=null;
    const scanButton=appContext.$("addCardScanUploaded");
    const applyButton=appContext.$("addCardScanApply");
    const priceButton=appContext.$("addCardScanApplyPrice");
    if(scanButton) scanButton.disabled=true;
    if(applyButton) applyButton.disabled=true;
    if(priceButton) priceButton.disabled=true;
    setStatus(`Scanning ${sources.length} uploaded photo${sources.length===1?"":"s"}…`);
    setPriceStatus("Price recommendation will appear after the card is identified.");
    setProgress("Preparing OCR…");

    let worker;
    try{
      worker=await createOcrWorker();
      const texts=[];
      const barcodes=[];
      const confidences=[];
      for(let index=0;index<sources.length;index++){
        setProgress(`Scanning uploaded photo ${index+1} of ${sources.length}…`);
        const [barcodeValues,regions]=await Promise.all([
          detectBarcodes(sources[index]),
          buildOcrRegions(sources[index])
        ]);
        barcodes.push(...barcodeValues);
        for(let regionIndex=0;regionIndex<regions.length;regionIndex++){
          if(regionIndex>0) setProgress(`Reading detail region ${regionIndex} of photo ${index+1}…`);
          const ocr=await worker.recognize(regions[regionIndex],{rotateAuto:true});
          texts.push(String(ocr?.data?.text||""));
          const confidence=Number(ocr?.data?.confidence);
          if(Number.isFinite(confidence)&&confidence>0) confidences.push(confidence);
        }
      }
      lastResult=buildCardScanResult(texts.join("\n"),barcodes,appContext.cards||[]);
      lastPriceRecommendation=buildInventoryPriceRecommendation(appContext.cards||[],lastResult);
      const averageConfidence=confidences.length
        ? confidences.reduce((sum,value)=>sum+value,0)/confidences.length
        : 0;
      setStatus(scanSummary(lastResult,averageConfidence,sources.length),lastResult.card_code||lastResult.cert?"success":"warning");
      setPriceStatus(priceSummary(lastPriceRecommendation),lastPriceRecommendation?"success":"");
      setProgress(lastResult.matched_card
        ? "Existing inventory match found. Nothing changes until you apply the detected fields."
        : "Nothing changes until you apply the detected fields.");
      if(applyButton) applyButton.disabled=!(lastResult.card_code||lastResult.company||lastResult.grade||lastResult.cert||lastResult.name||lastResult.year||lastResult.game||lastResult.language||lastResult.matched_card);
      if(priceButton) priceButton.disabled=!lastPriceRecommendation;
    }catch(error){
      console.error("Card scanner failed:",error);
      const detail=String(error?.message||error||"").replace(/\s+/g," ").trim().slice(0,180);
      setStatus(`Could not scan the uploaded photos.${detail ? ` Scanner error: ${detail}` : ""}`,"error");
      setProgress("Your uploaded photos and the normal Add Card form are unchanged.");
      setPriceStatus("No price recommendation was generated.");
    }finally{
      try{ await worker?.terminate?.(); }catch(_error){}
      scannerBusy=false;
      if(scanButton) scanButton.disabled=false;
    }
  }

  function wireScanner(){
    if(!appContext.isOwnerMode?.()) return;
    const form=appContext.view?.querySelector?.(".form-card");
    if(!form || appContext.$("addCardScanner")) return;
    const scanner=document.createElement("div");
    scanner.id="addCardScanner";
    scanner.className="panel owner-only";
    scanner.innerHTML=`
      <div class="section-head">
        <div><h3>Scan Uploaded Card Photos</h3><p class="hint">Upload photos normally above, then scan those same photos. The scanner only recommends fields; you confirm before anything is saved.</p></div>
      </div>
      <div class="actions">
        <button type="button" class="btn-primary" id="addCardScanUploaded">Scan Uploaded Photos</button>
        <button type="button" id="addCardScanApply" disabled>Apply detected fields</button>
        <button type="button" id="addCardScanApplyPrice" disabled>Apply recommended price</button>
      </div>
      <div class="hint" id="addCardScanStatus">Upload one or more clear card/slab photos with the normal Choose Files control, then scan them here.</div>
      <div class="hint" id="addCardScanProgress">For slabs, include a clear label photo. OCR runs in your browser; nothing is saved automatically.</div>
      <div class="hint" id="addCardScanPrice">After a card code is identified, the scanner can suggest a MYR starting price from matching cards already in this inventory.</div>`;
    const imageField=form.querySelector(".image-field");
    if(imageField) imageField.insertAdjacentElement("afterend",scanner);
    else form.prepend(scanner);

    appContext.$("addCardScanUploaded")?.addEventListener("click",scanUploadedPhotos);
    appContext.$("addCardScanApply")?.addEventListener("click",applyScanResult);
    appContext.$("addCardScanApplyPrice")?.addEventListener("click",applyPriceRecommendation);
  }

  const originalRenderAddPage=appContext.renderAddPage;
  appContext.renderAddPage=function(...args){
    const result=originalRenderAddPage(...args);
    wireScanner();
    return result;
  };

  Object.assign(appContext,{
    scanUploadedCardPhotos:scanUploadedPhotos,
    buildCardScanResult:(text,barcodes=[])=>buildCardScanResult(text,barcodes,appContext.cards||[]),
    buildInventoryPriceRecommendation:(result)=>buildInventoryPriceRecommendation(appContext.cards||[],result)
  });
}
