/** Facebook sales posts assembled from saved eBay listing links. */
export function registerFacebookEbayPosts(appContext){
  function facebookEbayListingEntries(cards){
    return cards.filter(card=>
      appContext.isLiveLifecycle(card) &&
      appContext.normalizeFilterValue(card.availability || "Available")==="available"
    ).map(card=>({
      card,
      url:appContext.normalizeEbayListingUrl(card.ebay_url),
      owner:card._owner_category || "",
      era:appContext.normalizeFilterValue(card.era)
    })).filter(entry=>entry.url);
  }

  function buildFacebookEbayListingsPost(entries){
    if(!entries.length) return "";
    const games=new Set(entries.map(({card})=>String(card.game || "").trim()));
    const game=games.size===1 ? [...games][0] : "";
    const vintage=entries.every(({era})=>era==="vintage");
    const heading=[vintage ? "Vintage" : "", game || "Trading Cards"].filter(Boolean).join(" ");
    const lines=entries.map(({card,url},index)=>{
      const name=appContext.formatPreErrataErrorName(card.name || "Card");
      const isError=/^ERROR(?: |$)/.test(name);
      const identity=[isError ? name.slice(5).trimStart() : name,card.card_code].filter(Boolean).join(" ");
      const details=[identity,card.series,card.year,isError ? "ERROR" : ""].filter(Boolean).join(" · ");
      return `${index+1}. ${details}\n🛒 ${url}`;
    });
    return [
      `WTS | ${heading}`,
      "A few cards from my collection are available on eBay. Tap a listing below to see the price, condition, and full photo gallery.",
      ...lines,
      "See a card you like? Feel free to message me with any questions.\n\n— Collect TCG MY & SG"
    ].join("\n\n");
  }

  function renderFacebookEbayListingsPage(){
    if(!appContext.requireOwner("open Facebook eBay listings generator")) return;
    const entries=facebookEbayListingEntries(appContext.cards);
    const selected=new Map();
    const esc=appContext.escapeHtml;
    const choices=values=>[...new Set(values)].sort((a,b)=>a.localeCompare(b));
    const options=values=>values.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join("");
    appContext.view.innerHTML=`
      <div class="fb-card-list-layout" id="facebookEbayListings">
        <section class="panel fb-card-list-controls">
          <h3>Select cards</h3>
          <div class="fb-card-list-filter-row">
            <label class="field">Owner
              <select data-owner><option value="">All owners</option><option value="unassigned">Unassigned</option>${options(choices(entries.map(entry=>entry.owner).filter(Boolean)))}</select>
            </label>
            <label class="field">Era
              <select data-era><option value="">All eras</option>${options(choices(entries.map(({card})=>String(card.era || "").trim()).filter(Boolean)))}</select>
            </label>
          </div>
          <div class="fb-card-list-bulk-actions">
            <button type="button" class="btn-ghost" data-select>Select filtered</button>
            <button type="button" class="btn-ghost" data-clear>Clear selection</button>
          </div>
          <div class="fb-card-list-picker" data-picker aria-label="Cards with eBay links"></div>
        </section>
        <section class="panel fb-card-list-controls">
          <h3>Post preview</h3>
          <p data-count aria-live="polite"></p>
          <label class="field">Facebook post
            <textarea data-post rows="15" readonly></textarea>
          </label>
          <div class="fb-card-list-bulk-actions">
            <button type="button" class="btn-gold" data-copy>Copy post</button>
            <button type="button" class="btn-ghost" data-zip>Download first photos ZIP</button>
          </div>
          <p data-status class="hint" aria-live="polite"></p>
        </section>
      </div>`;
    const root=appContext.view.querySelector("#facebookEbayListings");
    const get=selector=>root.querySelector(selector);
    const owner=get("[data-owner]");
    const era=get("[data-era]");
    const picker=get("[data-picker]");
    const output=get("[data-post]");
    const zip=get("[data-zip]");
    const copy=get("[data-copy]");
    const status=get("[data-status]");
    let filtered=[];
    let downloading=false;

    function updatePost(){
      const hiddenCount=selected.size-filtered.filter(({card})=>selected.has(String(card.id))).length;
      get("[data-count]").textContent=`${selected.size} selected${hiddenCount ? ` · ${hiddenCount} outside current filters` : ""}`;
      output.value=buildFacebookEbayListingsPost([...selected.values()]);
      copy.disabled=!selected.size;
      get("[data-clear]").disabled=!selected.size;
      zip.disabled=!selected.size || downloading;
    }

    function updatePicker(){
      filtered=entries.filter(entry=>
        (!owner.value || (entry.owner || "unassigned")===owner.value) &&
        (!era.value || entry.era===appContext.normalizeFilterValue(era.value))
      );
      picker.innerHTML=filtered.map(({card})=>{
        const id=String(card.id);
        const photo=appContext.getImages(card)[0];
        return `<label class="fb-card-list-picker-row ${selected.has(id) ? "selected" : ""}">
          <input type="checkbox" value="${esc(id)}" ${selected.has(id) ? "checked" : ""}>
          <span class="fb-card-list-picker-thumb">${photo ? `<img src="${esc(photo)}" loading="lazy" alt="">` : "No photo"}</span>
          <span class="fb-card-list-picker-copy"><strong>${esc(card.name || "Untitled card")}</strong><small>${esc([card.card_code,card.series,card.era].filter(Boolean).join(" · "))}</small></span>
        </label>`;
      }).join("") || '<p class="hint">No available cards with eBay links match these filters.</p>';
      get("[data-select]").disabled=!filtered.length;
      updatePost();
    }

    owner.addEventListener("change",updatePicker);
    era.addEventListener("change",updatePicker);
    picker.addEventListener("change",event=>{
      const input=event.target.closest('input[type="checkbox"]');
      if(!input) return;
      const entry=filtered.find(({card})=>String(card.id)===input.value);
      if(!entry) return;
      if(input.checked) selected.set(input.value,entry);
      else selected.delete(input.value);
      input.closest(".fb-card-list-picker-row")?.classList.toggle("selected",input.checked);
      updatePost();
    });
    get("[data-select]").addEventListener("click",()=>{
      filtered.forEach(entry=>selected.set(String(entry.card.id),entry));
      updatePicker();
    });
    get("[data-clear]").addEventListener("click",()=>{
      selected.clear();
      updatePicker();
    });
    copy.addEventListener("click",async()=>{
      if(!appContext.requireOwner("copy Facebook eBay listings post") || !output.value) return;
      status.textContent=await appContext.copyTextToClipboard(output.value) ? "Post copied." : "Could not copy. Select and copy the preview manually.";
    });
    zip.addEventListener("click",async()=>{
      if(downloading || !selected.size || !appContext.requireOwner("download Facebook eBay listing photos")) return;
      const cards=[...selected.values()].map(({card})=>card);
      downloading=true;
      updatePost();
      status.textContent="Preparing ZIP…";
      try{
        const result=await appContext.downloadCardListFirstImagesZip(cards,null,{
          filePrefix:"Collect-TCG-Facebook-eBay-Listings",
          reportMissing:true
        });
        status.textContent=`Downloaded ${result.added} of ${cards.length} first photos.`;
      }catch(error){
        status.textContent=error.message || "Could not create photo ZIP.";
      }finally{
        downloading=false;
        updatePost();
      }
    });
    updatePicker();
  }

  Object.assign(appContext,{facebookEbayListingEntries,buildFacebookEbayListingsPost,renderFacebookEbayListingsPage});
}
