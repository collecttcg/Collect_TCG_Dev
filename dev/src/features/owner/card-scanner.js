/** Owner-only Add Card scanner. OCR runs in the browser and only recommends fields for confirmation. */
const TESSERACT_MODULE_URL="https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.esm.min.js";

export function normalizeScanText(value){
  return String(value||"").replace(/[\u2010-\u2015]/g,"-").replace(/\s+/g," ").trim();
}

export function extractCardCode(value){
  const text=normalizeScanText(value).toUpperCase();
  const standard=text.match(/\b(OP|ST|EB|PRB)\s*[- ]?\s*(\d{2})\s*[- ]\s*(\d{3})\b/);
  if(standard) return `${standard[1]}${standard[2]}-${standard[3]}`;
  const promo=text.match(/\bP\s*[- ]\s*(\d{3})\b/);
  return promo ? `P-${promo[1]}` : "";
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
  const standalone=compact.match(/(?:^|\s)(\d{8})(?=\s|$)/);
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
    matched_card:findExistingCardByCode(cards,cardCode)
  };
}

export function register(appContext){
  let lastResult=null;
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

  async function detectBarcodes(file){
    if(typeof window==="undefined" || !("BarcodeDetector" in window) || typeof createImageBitmap!=="function") return [];
    let bitmap;
    try{
      const supported=typeof window.BarcodeDetector.getSupportedFormats==="function"
        ? await window.BarcodeDetector.getSupportedFormats()
        : ["qr_code"];
      const formats=["qr_code","code_128","data_matrix"].filter(format=>supported.includes(format));
      if(!formats.length) return [];
      bitmap=await createImageBitmap(file);
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

  async function recognizeText(file){
    const module=await import(TESSERACT_MODULE_URL);
    const worker=await module.createWorker("eng",1,{
      logger:event=>{
        if(!event?.status) return;
        const percent=Number.isFinite(event.progress) ? ` ${Math.round(event.progress*100)}%` : "";
        setProgress(`${event.status}${percent}`);
      }
    });
    try{
      const result=await worker.recognize(file,{rotateAuto:true});
      return {text:String(result?.data?.text||""),confidence:Number(result?.data?.confidence)||0};
    }finally{
      await worker.terminate();
    }
  }

  function scanSummary(result,confidence){
    const parts=[];
    if(result.company) parts.push(result.company);
    if(result.grade) parts.push(`Grade ${result.grade}`);
    if(result.cert) parts.push(`Cert ${result.cert}`);
    if(result.card_code) parts.push(result.card_code);
    if(result.matched_card?.name) parts.push(String(result.matched_card.name));
    if(!parts.length) return "No reliable card details detected. Try a closer, sharper photo with the card number or slab label visible.";
    const confidenceText=confidence>0 ? ` OCR confidence ${Math.round(confidence)}%.` : "";
    return `Detected: ${parts.join(" · ")}.${confidenceText}`;
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
    setField("addCode",card.card_code);
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
    const graded=appContext.$("addGraded");
    if(graded && !graded.checked){
      graded.checked=true;
      graded.dispatchEvent(new Event("change",{bubbles:true}));
    }
    let row=appContext.$("addGradingList")?.querySelector?.(".grade-row");
    if(!row){
      appContext.$("addGradeBtn")?.click();
      row=appContext.$("addGradingList")?.querySelector?.(".grade-row");
    }
    if(!row) return;
    const company=row.querySelector('[data-g-field="company"]');
    const grade=row.querySelector('[data-g-field="grade"]');
    const cert=row.querySelector('[data-g-field="cert"]');
    if(company && result.company){ company.value=result.company; company.dispatchEvent(new Event("change",{bubbles:true})); }
    if(grade && result.grade){ grade.value=result.grade; grade.dispatchEvent(new Event("input",{bubbles:true})); }
    if(cert && result.cert){ cert.value=result.cert; cert.dispatchEvent(new Event("input",{bubbles:true})); }
  }

  function applyScanResult(){
    if(!lastResult) return;
    if(lastResult.matched_card) applyMatchedCard(lastResult.matched_card);
    else if(lastResult.card_code) setField("addCode",lastResult.card_code);
    applyGrading(lastResult);
    appContext.showToast?.("Detected card details applied — please review before saving");
    setStatus("Applied to Add Card. Review every detected field before saving.","success");
  }

  async function scanFile(file){
    if(scannerBusy || !file) return;
    if(!String(file.type||"").startsWith("image/")){
      setStatus("Please choose an image file.","error");
      return;
    }
    scannerBusy=true;
    lastResult=null;
    const applyButton=appContext.$("addCardScanApply");
    if(applyButton) applyButton.disabled=true;
    setStatus("Scanning image…");
    setProgress("Reading QR/barcode and preparing OCR…");
    try{
      const barcodeValues=await detectBarcodes(file);
      const ocr=await recognizeText(file);
      lastResult=buildCardScanResult(ocr.text,barcodeValues,appContext.cards||[]);
      setStatus(scanSummary(lastResult,ocr.confidence),lastResult.card_code||lastResult.cert?"success":"warning");
      setProgress(lastResult.matched_card
        ? "Existing inventory match found. Nothing is changed until you press Apply detected fields."
        : "Nothing is changed until you press Apply detected fields.");
      if(applyButton) applyButton.disabled=!(lastResult.card_code||lastResult.company||lastResult.grade||lastResult.cert||lastResult.matched_card);
    }catch(error){
      console.error("Card scanner failed:",error);
      setStatus("Could not scan this image. Check your connection and try a clearer photo.","error");
      setProgress("The normal Add Card form is unchanged and can still be used manually.");
    }finally{
      scannerBusy=false;
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
        <div><h3>Scan Card / Graded Slab</h3><p class="hint">Owner-only assistant. It recommends fields from the photo; you confirm before anything is saved.</p></div>
      </div>
      <div class="actions">
        <button type="button" class="btn-primary" id="addCardScanChoose">Scan Card / Slab</button>
        <button type="button" id="addCardScanApply" disabled>Apply detected fields</button>
        <input type="file" id="addCardScanInput" accept="image/*" capture="environment" hidden>
      </div>
      <div class="hint" id="addCardScanStatus">Take or upload a clear photo. For graded cards, keep the full label and certification number visible.</div>
      <div class="hint" id="addCardScanProgress">OCR runs in your browser. PSA QR/cert, grade and ONE PIECE card numbers are detected when readable.</div>`;
    const heading=form.querySelector("h2");
    if(heading) heading.insertAdjacentElement("afterend",scanner);
    else form.prepend(scanner);

    const input=appContext.$("addCardScanInput");
    appContext.$("addCardScanChoose")?.addEventListener("click",()=>input?.click());
    input?.addEventListener("change",()=>{
      const file=input.files?.[0];
      if(file) scanFile(file);
      input.value="";
    });
    appContext.$("addCardScanApply")?.addEventListener("click",applyScanResult);
  }

  const originalRenderAddPage=appContext.renderAddPage;
  appContext.renderAddPage=function(...args){
    const result=originalRenderAddPage(...args);
    wireScanner();
    return result;
  };

  Object.assign(appContext,{
    scanCardImage:scanFile,
    buildCardScanResult:(text,barcodes=[])=>buildCardScanResult(text,barcodes,appContext.cards||[])
  });
}
