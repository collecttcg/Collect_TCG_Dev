/** Owner-only card ownership categories stored inside private owner metadata. */
export function register(appContext){
  const OWNER_CATEGORIES=["Zakwan","Yen","Daniel","Jack","Shue"];
  const OWNER_CATEGORY_TAG_PREFIX="__owner_category__:";

  function sanitizeOwnerCategory(value){
    const normalized=String(value||"").trim().toLowerCase();
    return OWNER_CATEGORIES.find(name=>name.toLowerCase()===normalized) || "";
  }

  function isOwnerCategoryTag(tag){
    return String(tag||"").toLowerCase().startsWith(OWNER_CATEGORY_TAG_PREFIX);
  }

  function ownerCategoryFromTags(tags){
    const list=Array.isArray(tags) ? tags : [];
    for(const tag of list){
      if(!isOwnerCategoryTag(tag)) continue;
      const category=sanitizeOwnerCategory(String(tag).slice(OWNER_CATEGORY_TAG_PREFIX.length));
      if(category) return category;
    }
    return "";
  }

  function ownerTagsWithoutCategory(tags){
    return appContext.sanitizeOwnerTags(tags).filter(tag=>!isOwnerCategoryTag(tag));
  }

  function ownerTagsWithCategory(tags,category){
    const cleanTags=ownerTagsWithoutCategory(tags);
    const cleanCategory=sanitizeOwnerCategory(category);
    if(!cleanCategory) return cleanTags;
    return [`${OWNER_CATEGORY_TAG_PREFIX}${cleanCategory}`,...cleanTags.slice(0,11)];
  }

  function ownerCategoryOptionsHTML(selected="",includeUnassigned=true){
    const current=sanitizeOwnerCategory(selected);
    return `${includeUnassigned ? `<option value="">Unassigned</option>` : `<option value="">Select owner</option>`}${OWNER_CATEGORIES.map(name=>
      `<option value="${appContext.escapeHtml(name)}" ${current===name?"selected":""}>${appContext.escapeHtml(name)}</option>`
    ).join("")}`;
  }

  const originalPrivateFrom=appContext.supabaseClient?.from?.bind(appContext.supabaseClient);
  if(originalPrivateFrom){
    appContext.supabaseClient.from=function(table){
      const builder=originalPrivateFrom(table);
      if(table!=="card_owner_private" || !builder || typeof builder.upsert!=="function") return builder;
      return new Proxy(builder,{
        get(target,property){
          if(property==="upsert"){
            return (values,options)=>{
              const isArray=Array.isArray(values);
              const rows=(isArray ? values : [values]).map(row=>{
                if(!row || typeof row!=="object") return row;
                const id=appContext.safeCardId(row.card_id);
                const card=id ? appContext.getCardById?.(id) : null;
                const category=sanitizeOwnerCategory(card?._owner_category) || ownerCategoryFromTags(row.tags||[]);
                return {...row,tags:ownerTagsWithCategory(row.tags||[],category)};
              });
              return target.upsert(isArray ? rows : rows[0],options);
            };
          }
          const value=Reflect.get(target,property,target);
          return typeof value==="function" ? value.bind(target) : value;
        }
      });
    };
  }

  const originalFieldsTemplate=appContext.fieldsTemplate;
  appContext.fieldsTemplate=function(prefix){
    const html=originalFieldsTemplate(prefix);
    const marker=`<div class="field">\n          <label for="${prefix}OwnerTags">Private owner tags</label>`;
    if(!html.includes(marker)) return html;
    const required=prefix==="add" ? " required" : "";
    const categoryField=`<div class="field owner-card-category-field">\n          <label for="${prefix}OwnerCategory">Card owner${prefix==="add" ? ` <span class="field-required-note">required*</span>` : ""}</label>\n          <select id="${prefix}OwnerCategory"${required}>\n            ${ownerCategoryOptionsHTML("",prefix!=="add")}\n          </select>\n          <div class="hint">Owner-only category. Stored in private metadata and never included in public card data.</div>\n        </div>\n        `;
    return html.replace(marker,categoryField+marker);
  };

  const originalPopulateFields=appContext.populateFields;
  appContext.populateFields=function(prefix,card){
    const result=originalPopulateFields(prefix,card);
    const field=appContext.$(prefix+"OwnerCategory");
    if(field) field.value=sanitizeOwnerCategory(card?._owner_category||"");
    return result;
  };

  const originalCollectFields=appContext.collectFields;
  appContext.collectFields=function(prefix,id,formState){
    const data=originalCollectFields(prefix,id,formState);
    const category=sanitizeOwnerCategory(appContext.$(prefix+"OwnerCategory")?.value||"");
    data._owner_category=category;
    data._owner_tags=ownerTagsWithCategory(data._owner_tags,category);
    return data;
  };

  const originalFetchOwnerPrivateMeta=appContext.fetchOwnerPrivateMeta;
  appContext.fetchOwnerPrivateMeta=async function(cardId){
    const meta=await originalFetchOwnerPrivateMeta(cardId);
    const category=ownerCategoryFromTags(meta?.tags||[]);
    const id=appContext.safeCardId(cardId);
    if(id){
      const card=appContext.getCardById?.(id);
      if(card) card._owner_category=category;
    }
    return {tags:ownerTagsWithoutCategory(meta?.tags||[]),notes:meta?.notes||"",owner_category:category};
  };

  async function loadOwnerCategoriesIntoCards(){
    if(!appContext.isOwnerMode() || !appContext.ownerPrivateSupported){
      (appContext.cards||[]).forEach(card=>{ delete card._owner_category; });
      return true;
    }
    const {data,error}=await appContext.supabaseClient.from("card_owner_private").select("card_id,tags");
    if(error){ console.warn("Owner category metadata could not be loaded:",error); return false; }
    const categoryById=new Map((data||[]).map(row=>[appContext.safeCardId(row.card_id),ownerCategoryFromTags(row.tags||[])]).filter(([id])=>id));
    (appContext.cards||[]).forEach(card=>{ card._owner_category=categoryById.get(appContext.safeCardId(card.id))||""; });
    return true;
  }

  const originalLoadCards=appContext.loadCards;
  appContext.loadCards=async function(...args){ const loaded=await originalLoadCards(...args); if(loaded) await loadOwnerCategoriesIntoCards(); return loaded; };

  const originalGetFiltered=appContext.getFiltered;
  appContext.ownerCategoryFilter="";
  appContext.getFiltered=function(...args){
    const list=originalGetFiltered(...args);
    const category=appContext.isOwnerMode() ? sanitizeOwnerCategory(appContext.ownerCategoryFilter) : "";
    return category ? list.filter(card=>sanitizeOwnerCategory(card?._owner_category)===category) : list;
  };

  function ownerFilterMarkup(){
    const selected=sanitizeOwnerCategory(appContext.ownerCategoryFilter);
    const label=selected ? `Owner: ${selected}` : "All Owners";
    return `<div class="overview-select owner-only" id="filterOwnerCategoryWrap">\n      <button type="button" class="overview-select-btn" id="filterOwnerCategoryBtn"><span>${appContext.escapeHtml(label)}</span><i></i></button>\n      <div class="overview-select-menu" id="filterOwnerCategoryMenu" hidden>\n        <button type="button" class="overview-select-option" data-owner-category="">All Owners</button>\n        ${OWNER_CATEGORIES.map(name=>`<button type="button" class="overview-select-option" data-owner-category="${appContext.escapeHtml(name)}">${appContext.escapeHtml(name)}</button>`).join("")}\n      </div>\n      <input type="hidden" id="filterOwnerCategory" value="${appContext.escapeHtml(selected)}">\n    </div>`;
  }

  const originalInventoryPageHTML=appContext.inventoryPageHTML;
  appContext.inventoryPageHTML=function(...args){
    const html=originalInventoryPageHTML(...args);
    if(!appContext.isOwnerMode()) return html;
    const marker='<div class="overview-select" id="sortByWrap">';
    return html.includes(marker) ? html.replace(marker,ownerFilterMarkup()+"\n          "+marker) : html;
  };

  function wireOwnerInventoryFilter(scope){
    if(!appContext.isOwnerMode()) return;
    const wrap=appContext.$("filterOwnerCategoryWrap"),btn=appContext.$("filterOwnerCategoryBtn"),menu=appContext.$("filterOwnerCategoryMenu");
    if(!wrap || !btn || !menu) return;
    btn.addEventListener("click",event=>{ event.stopPropagation(); menu.hidden=!menu.hidden; wrap.classList.toggle("menu-open",!menu.hidden); });
    menu.addEventListener("click",event=>{ const option=event.target.closest("[data-owner-category]"); if(!option) return; appContext.ownerCategoryFilter=sanitizeOwnerCategory(option.dataset.ownerCategory||""); appContext.renderInventoryPage(scope); });
    document.addEventListener("click",event=>{ if(!wrap.contains(event.target)){ menu.hidden=true; wrap.classList.remove("menu-open"); } },{once:true});
    appContext.$("clearAllFiltersBtn")?.addEventListener("click",()=>{ appContext.ownerCategoryFilter=""; },{once:true});
  }

  const originalRenderInventoryPage=appContext.renderInventoryPage;
  appContext.renderInventoryPage=function(scope="inventory"){ const result=originalRenderInventoryPage(scope); wireOwnerInventoryFilter(scope); return result; };

  function wireHiddenListingsOwnerFilter(){
    if(!appContext.isOwnerMode()) return;
    const grid=appContext.$("hiddenListingsGrid"),tools=appContext.view?.querySelector?.(".inventory-display-tools");
    if(!grid || !tools) return;
    const wrap=document.createElement("div");
    wrap.className="field owner-only"; wrap.style.minWidth="160px";
    wrap.innerHTML=`<label for="hiddenOwnerCategoryFilter">Owner</label><select id="hiddenOwnerCategoryFilter"><option value="">All Owners</option>${OWNER_CATEGORIES.map(name=>`<option value="${appContext.escapeHtml(name)}">${appContext.escapeHtml(name)}</option>`).join("")}</select>`;
    tools.appendChild(wrap);
    const select=wrap.querySelector("select"),summary=tools.querySelector(".inventory-result-summary strong");
    const apply=()=>{ const category=sanitizeOwnerCategory(select.value); let shown=0; Array.from(grid.children).forEach(tile=>{ const card=appContext.getCardById?.(tile.dataset.cardId||""); const visible=!category || sanitizeOwnerCategory(card?._owner_category)===category; tile.hidden=!visible; if(visible) shown++; }); if(summary) summary.textContent=shown.toLocaleString(); };
    select.addEventListener("change",apply);
  }

  const originalRenderHiddenListingsPage=appContext.renderHiddenListingsPage;
  if(typeof originalRenderHiddenListingsPage==="function") appContext.renderHiddenListingsPage=function(...args){ const result=originalRenderHiddenListingsPage(...args); wireHiddenListingsOwnerFilter(); return result; };

  async function bulkAssignOwnerCategory(cardIds,category){
    if(!appContext.requireOwner("bulk edit card owner")) return {saved:0,failed:cardIds.length};
    if(!appContext.ownerPrivateSupported) throw new Error("Private owner information migration is required.");
    const cleanCategory=sanitizeOwnerCategory(category);
    const ids=[...new Set(cardIds.map(appContext.safeCardId).filter(Boolean))];
    if(!ids.length) return {saved:0,failed:0};
    const currentById=new Map(ids.map(id=>[id,{tags:[],notes:""}]));
    for(let start=0;start<ids.length;start+=100){
      const chunk=ids.slice(start,start+100);
      const {data,error}=await appContext.supabaseClient.from("card_owner_private").select("card_id,tags,notes").in("card_id",chunk);
      if(error) throw error;
      (data||[]).forEach(row=>{ const id=appContext.safeCardId(row.card_id); if(id) currentById.set(id,{tags:row.tags||[],notes:row.notes||""}); });
    }
    const rows=ids.map(id=>{ const current=currentById.get(id)||{tags:[],notes:""}; return {card_id:id,tags:ownerTagsWithCategory(current.tags,cleanCategory),notes:appContext.sanitizeOwnerPrivateNotes(current.notes||"")}; });
    for(let start=0;start<rows.length;start+=100){
      const chunk=rows.slice(start,start+100);
      // Use the currently available Supabase client instead of the registration-time
      // snapshot. The client may be initialized after this module registers.
      const {error}=await appContext.supabaseClient.from("card_owner_private").upsert(chunk,{onConflict:"card_id"});
      if(error) throw error;
    }
    ids.forEach(id=>{ const card=appContext.getCardById?.(id); if(card) card._owner_category=cleanCategory; });
    return {saved:ids.length,failed:0};
  }

  function wireBulkOwnerCategoryEditor(){
    if(!appContext.isOwnerMode()) return;
    const privateFields=appContext.view?.querySelector?.(".bulk-private-fields"),picker=appContext.$("bulkMetaPicker");
    if(!privateFields || !picker || appContext.$("bulkOwnerCategoryValue")) return;
    const field=document.createElement("div"); field.className="bulk-private-field owner-only";
    field.innerHTML=`<div class="bulk-private-field-top"><strong>Card owner</strong></div><div class="bulk-private-field-controls"><select id="bulkOwnerCategoryValue" ${appContext.ownerPrivateSupported?"":"disabled"}><option value="__choose__">Choose owner…</option><option value="">Unassigned</option>${OWNER_CATEGORIES.map(name=>`<option value="${appContext.escapeHtml(name)}">${appContext.escapeHtml(name)}</option>`).join("")}</select><button type="button" class="btn-primary" id="bulkOwnerCategoryApply" disabled>Apply Card Owner to Selected</button></div><div class="hint">Updates only the private Card Owner category for the listings selected above.</div>`;
    privateFields.prepend(field);
    const select=appContext.$("bulkOwnerCategoryValue"),button=appContext.$("bulkOwnerCategoryApply"),status=appContext.$("bulkMetaStatus");
    const sync=()=>{ const selectedCount=picker.querySelectorAll("input[data-bulk-meta-id]:checked").length; button.disabled=!appContext.ownerPrivateSupported || select.value==="__choose__" || selectedCount===0; };
    select.addEventListener("change",sync); picker.addEventListener("change",sync);
    button.addEventListener("click",async()=>{
      if(!appContext.requireOwner("bulk edit card owner")) return;
      const ids=Array.from(picker.querySelectorAll("input[data-bulk-meta-id]:checked")).map(input=>appContext.safeCardId(input.dataset.bulkMetaId)).filter(Boolean);
      if(!ids.length){ appContext.showToast("Select at least one listing"); return; }
      if(select.value==="__choose__"){ appContext.showToast("Choose a Card Owner"); return; }
      const category=sanitizeOwnerCategory(select.value),label=category || "Unassigned";
      if(!confirm(`Set Card Owner to ${label} for ${ids.length} selected listing${ids.length===1?"":"s"}?`)) return;
      const originalText=button.textContent; button.disabled=true; button.textContent="Saving…";
      try{ const result=await bulkAssignOwnerCategory(ids,category); if(status) status.textContent=`${result.saved} listing${result.saved===1?"":"s"} updated: Card Owner → ${label}.`; appContext.showToast(`Updated Card Owner for ${result.saved} listing${result.saved===1?"":"s"}`); }
      catch(error){ console.error("Bulk Card Owner update failed:",error); const detail=String(error?.message||error?.details||error?.hint||"").trim(); if(status) status.textContent=detail ? `Card Owner bulk update failed: ${detail}` : "Card Owner bulk update failed."; appContext.showToast("Could not update Card Owner"); }
      finally{ button.textContent=originalText; sync(); }
    });
    sync();
  }

  const originalRenderBulkMetadataPage=appContext.renderBulkMetadataPage;
  if(typeof originalRenderBulkMetadataPage==="function") appContext.renderBulkMetadataPage=function(...args){ const result=originalRenderBulkMetadataPage(...args); wireBulkOwnerCategoryEditor(); return result; };

  Object.assign(appContext,{OWNER_CATEGORIES,OWNER_CATEGORY_TAG_PREFIX,sanitizeOwnerCategory,isOwnerCategoryTag,ownerCategoryFromTags,ownerTagsWithoutCategory,ownerTagsWithCategory,loadOwnerCategoriesIntoCards,bulkAssignOwnerCategory});
}
