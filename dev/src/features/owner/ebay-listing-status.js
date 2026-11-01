/** Development: manual eBay listing marker, URL, public badge and inventory filter. */
export function register(appContext){
  const EBAY_MARKER_RE=/(?:^|\n)\s*eBay listing:\s*(yes|https?:\/\/[^\s]+)\s*(?=\n|$)/i;

  function normalizeEbayListingUrl(value){
    const raw=String(value||"").trim();
    if(!raw) return "";
    try{
      const url=new URL(raw);
      if(url.protocol!=="https:") return "";
      const host=url.hostname.toLowerCase().replace(/^www\./,"");
      if(!/(^|\.)ebay\.[a-z.]+$/i.test(host)) return "";
      return url.href;
    }catch{
      return "";
    }
  }

  function ebayListingFromNotes(notes){
    const match=String(notes||"").match(EBAY_MARKER_RE);
    if(!match) return {onEbay:false,url:""};
    const value=String(match[1]||"").trim();
    return {onEbay:true,url:value.toLowerCase()==="yes" ? "" : normalizeEbayListingUrl(value)};
  }

  function stripEbayListingMarker(notes){
    return String(notes||"")
      .replace(EBAY_MARKER_RE,"\n")
      .replace(/\n{3,}/g,"\n\n")
      .trim();
  }

  function notesWithEbayListing(notes,onEbay,url){
    const clean=stripEbayListingMarker(notes);
    if(!onEbay) return clean;
    const normalized=normalizeEbayListingUrl(url);
    const marker=`eBay listing: ${normalized||"yes"}`;
    return clean ? `${clean}\n\n${marker}` : marker;
  }

  Object.assign(appContext,{normalizeEbayListingUrl,ebayListingFromNotes,stripEbayListingMarker,notesWithEbayListing});

  const originalDbToCard=appContext.dbToCard;
  if(typeof originalDbToCard==="function"){
    appContext.dbToCard=function dbToCardWithEbay(row){
      const card=originalDbToCard(row);
      const ebay=ebayListingFromNotes(row?.notes||"");
      card.on_ebay=ebay.onEbay;
      card.ebay_url=ebay.url;
      card.notes=stripEbayListingMarker(card.notes||"");
      return card;
    };
  }

  const originalCardToDb=appContext.cardToDb;
  if(typeof originalCardToDb==="function"){
    appContext.cardToDb=function cardToDbWithEbay(card){
      const row=originalCardToDb(card);
      row.notes=notesWithEbayListing(card?.notes||"",card?.on_ebay===true,card?.ebay_url||"");
      return row;
    };
  }

  const originalFieldsTemplate=appContext.fieldsTemplate;
  if(typeof originalFieldsTemplate==="function"){
    appContext.fieldsTemplate=function fieldsTemplateWithEbay(p){
      const html=originalFieldsTemplate(p);
      return `${html}\n<div class="ebay-editor-block">\n<div class="owner-editor-section-heading ebay-listing-heading"><span>eBay</span><small>Cross-listing status</small></div>\n<div class="field ebay-listing-field">\n  <label class="ebay-listing-toggle" for="${p}OnEbay">\n    <input type="checkbox" id="${p}OnEbay">\n    <span><strong>Listed on eBay</strong><small>Show an On eBay badge on this listing.</small></span>\n  </label>\n</div>\n<div class="field ebay-listing-url-field" id="${p}EbayUrlField" hidden>\n  <label for="${p}EbayUrl">eBay listing URL <span class="field-optional">(optional)</span></label>\n  <input type="url" id="${p}EbayUrl" inputmode="url" autocomplete="url" placeholder="https://www.ebay.com/itm/…">\n  <div class="hint">Optional. When supplied, the On eBay badge opens the eBay listing in a new tab.</div>\n</div>\n</div>`;
    };
  }

  function wireEbayListingFields(p){
    const toggle=appContext.$(p+"OnEbay");
    const field=appContext.$(p+"EbayUrlField");
    const input=appContext.$(p+"EbayUrl");
    if(!toggle || !field || !input || toggle.dataset.ebayWired==="1") return;
    toggle.dataset.ebayWired="1";
    const sync=()=>{ field.hidden=!toggle.checked; if(!toggle.checked) input.setCustomValidity(""); };
    const validate=()=>{
      const raw=input.value.trim();
      input.setCustomValidity(raw && !normalizeEbayListingUrl(raw) ? "Enter a valid https:// eBay listing URL." : "");
    };
    toggle.addEventListener("change",sync);
    input.addEventListener("input",validate);
    input.addEventListener("blur",()=>{
      validate();
      const normalized=normalizeEbayListingUrl(input.value);
      if(normalized) input.value=normalized;
    });
    sync();
  }

  const originalPopulateFields=appContext.populateFields;
  if(typeof originalPopulateFields==="function"){
    appContext.populateFields=function populateFieldsWithEbay(p,card){
      originalPopulateFields(p,card);
      wireEbayListingFields(p);
      const toggle=appContext.$(p+"OnEbay");
      const input=appContext.$(p+"EbayUrl");
      if(toggle) toggle.checked=card?.on_ebay===true;
      if(input) input.value=card?.ebay_url||"";
      toggle?.dispatchEvent(new Event("change"));
    };
  }

  const originalCollectFields=appContext.collectFields;
  if(typeof originalCollectFields==="function"){
    appContext.collectFields=function collectFieldsWithEbay(p,id,formState){
      const card=originalCollectFields(p,id,formState);
      const toggle=appContext.$(p+"OnEbay");
      const input=appContext.$(p+"EbayUrl");
      card.on_ebay=Boolean(toggle?.checked);
      card.ebay_url=card.on_ebay ? normalizeEbayListingUrl(input?.value||"") : "";
      return card;
    };
  }

  function ebayImageBadgeHTML(card){
    if(card?.on_ebay!==true) return "";
    const url=normalizeEbayListingUrl(card.ebay_url||"");
    return url
      ? `<a class="ebay-listing-badge ebay-listing-image-badge" href="${appContext.escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="Open this listing on eBay" aria-label="Open this listing on eBay">On eBay ↗</a>`
      : `<span class="ebay-listing-badge ebay-listing-image-badge" title="This card is also listed on eBay">On eBay</span>`;
  }

  const originalCardThumbHTML=appContext.cardThumbHTML;
  if(typeof originalCardThumbHTML==="function"){
    appContext.cardThumbHTML=function cardThumbHTMLWithEbay(card,...args){
      const html=originalCardThumbHTML(card,...args);
      const badge=ebayImageBadgeHTML(card);
      if(!badge) return html;
      if(html.includes('class="image-count-badge"')){
        return html.replace('<span class="image-count-badge"',`${badge}<span class="image-count-badge"`);
      }
      return html.replace(/<\/div>\s*$/,`${badge}</div>`);
    };
  }

  const originalGetFiltered=appContext.getFiltered;
  if(typeof originalGetFiltered==="function"){
    appContext.getFiltered=function getFilteredWithEbay(...args){
      const list=originalGetFiltered(...args);
      return appContext.ebayOnlyFilter===true && Array.isArray(list)
        ? list.filter(card=>card?.on_ebay===true)
        : list;
    };
  }

  function ensureStyle(){
    if(document.getElementById("ebay-listing-status-style")) return;
    const style=document.createElement("style");
    style.id="ebay-listing-status-style";
    style.textContent=`
      .ebay-editor-block{display:grid;gap:12px;padding-bottom:96px}.ebay-listing-heading{margin-bottom:0}.ebay-listing-field,.ebay-listing-url-field{margin:0}.ebay-listing-toggle{display:flex;align-items:flex-start;gap:10px;cursor:pointer;padding:8px 0}.ebay-listing-toggle input{margin-top:3px}.ebay-listing-toggle span{display:grid;gap:3px}.ebay-listing-toggle small{color:var(--muted,#9ca3af);font-weight:500}
      .ebay-listing-badge{display:inline-flex;align-items:center;justify-content:center;padding:5px 9px;border:1px solid rgba(255,205,55,.72);border-radius:999px;background:rgba(12,13,16,.88);color:#f4c84a;font-size:10px;font-weight:900;line-height:1;text-transform:uppercase;letter-spacing:.05em;text-decoration:none;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.32);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}
      .ebay-listing-image-badge{position:absolute;left:10px;bottom:10px;z-index:8;max-width:calc(100% - 76px)}
      a.ebay-listing-badge:hover{background:rgba(28,29,32,.94);border-color:#f4c84a}
      .ebay-only-filter{display:flex;align-items:center;gap:8px;min-height:44px;padding:0 12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;background:rgba(255,255,255,.025);font-weight:700}.ebay-only-filter input{accent-color:#f4c84a}
      @media(max-width:560px){.ebay-editor-block{padding-bottom:112px}.ebay-listing-image-badge{left:8px;bottom:8px;padding:4px 7px;font-size:9px}.ebay-only-filter{min-height:42px}}
    `;
    document.head.appendChild(style);
  }

  function refreshInventoryForEbayFilter(){
    const search=appContext.$("search");
    if(search){ search.dispatchEvent(new Event("input",{bubbles:true})); return; }
    if(typeof appContext.router==="function") appContext.router();
  }

  function ensureEbayFilter(){
    const row=document.querySelector("#filterDrawerShell .filter-row");
    if(!row || document.getElementById("filterEbayOnlyWrap")) return;
    const label=document.createElement("label");
    label.id="filterEbayOnlyWrap";
    label.className="ebay-only-filter";
    label.innerHTML='<input type="checkbox" id="filterEbayOnly"> <span>On eBay only</span>';
    const checkbox=label.querySelector("input");
    checkbox.checked=appContext.ebayOnlyFilter===true;
    checkbox.addEventListener("change",()=>{
      appContext.ebayOnlyFilter=checkbox.checked;
      refreshInventoryForEbayFilter();
    });
    row.appendChild(label);
  }

  if(typeof document!=="undefined"){
    ensureStyle();
    document.addEventListener("click",event=>{
      if(event.target.closest?.(".ebay-listing-badge")) event.stopPropagation();
    },true);
    const observer=new MutationObserver(()=>ensureEbayFilter());
    observer.observe(document.body,{childList:true,subtree:true});
    requestAnimationFrame(ensureEbayFilter);
  }
}
