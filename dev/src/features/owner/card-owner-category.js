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
    // The existing private tag store allows 12 tags. Reserve one private slot
    // for the ownership marker without exposing it through normal owner tags.
    return [`${OWNER_CATEGORY_TAG_PREFIX}${cleanCategory}`,...cleanTags.slice(0,11)];
  }

  function ownerCategoryOptionsHTML(selected="",includeUnassigned=true){
    const current=sanitizeOwnerCategory(selected);
    return `${includeUnassigned ? `<option value="">Unassigned</option>` : `<option value="">Select owner</option>`}${OWNER_CATEGORIES.map(name=>
      `<option value="${appContext.escapeHtml(name)}" ${current===name?"selected":""}>${appContext.escapeHtml(name)}</option>`
    ).join("")}`;
  }

  // Preserve the reserved ownership marker whenever existing owner-only private
  // tags are changed by another owner tool (including Bulk Metadata). Public
  // card queries never touch this private table.
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
    return {
      tags:ownerTagsWithoutCategory(meta?.tags||[]),
      notes:meta?.notes||"",
      owner_category:category
    };
  };

  async function loadOwnerCategoriesIntoCards(){
    if(!appContext.isOwnerMode() || !appContext.ownerPrivateSupported){
      (appContext.cards||[]).forEach(card=>{ delete card._owner_category; });
      return true;
    }

    const {data,error}=await appContext.supabaseClient
      .from("card_owner_private")
      .select("card_id,tags");

    if(error){
      console.warn("Owner category metadata could not be loaded:",error);
      return false;
    }

    const categoryById=new Map((data||[]).map(row=>[
      appContext.safeCardId(row.card_id),
      ownerCategoryFromTags(row.tags||[])
    ]).filter(([id])=>id));

    (appContext.cards||[]).forEach(card=>{
      card._owner_category=categoryById.get(appContext.safeCardId(card.id))||"";
    });
    return true;
  }

  const originalLoadCards=appContext.loadCards;
  appContext.loadCards=async function(...args){
    const loaded=await originalLoadCards(...args);
    if(loaded) await loadOwnerCategoriesIntoCards();
    return loaded;
  };

  const originalGetFiltered=appContext.getFiltered;
  appContext.ownerCategoryFilter="";
  appContext.getFiltered=function(...args){
    const list=originalGetFiltered(...args);
    const category=appContext.isOwnerMode() ? sanitizeOwnerCategory(appContext.ownerCategoryFilter) : "";
    if(!category) return list;
    return list.filter(card=>sanitizeOwnerCategory(card?._owner_category)===category);
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
    const wrap=appContext.$("filterOwnerCategoryWrap");
    const btn=appContext.$("filterOwnerCategoryBtn");
    const menu=appContext.$("filterOwnerCategoryMenu");
    if(!wrap || !btn || !menu) return;

    btn.addEventListener("click",event=>{
      event.stopPropagation();
      menu.hidden=!menu.hidden;
      wrap.classList.toggle("menu-open",!menu.hidden);
    });
    menu.addEventListener("click",event=>{
      const option=event.target.closest("[data-owner-category]");
      if(!option) return;
      appContext.ownerCategoryFilter=sanitizeOwnerCategory(option.dataset.ownerCategory||"");
      appContext.renderInventoryPage(scope);
    });
    document.addEventListener("click",event=>{
      if(!wrap.contains(event.target)){
        menu.hidden=true;
        wrap.classList.remove("menu-open");
      }
    },{once:true});
    appContext.$("clearAllFiltersBtn")?.addEventListener("click",()=>{
      appContext.ownerCategoryFilter="";
    },{once:true});
  }

  const originalRenderInventoryPage=appContext.renderInventoryPage;
  appContext.renderInventoryPage=function(scope="inventory"){
    const result=originalRenderInventoryPage(scope);
    wireOwnerInventoryFilter(scope);
    return result;
  };

  function wireHiddenListingsOwnerFilter(){
    if(!appContext.isOwnerMode()) return;
    const grid=appContext.$("hiddenListingsGrid");
    const tools=appContext.view?.querySelector?.(".inventory-display-tools");
    if(!grid || !tools) return;

    const wrap=document.createElement("div");
    wrap.className="field owner-only";
    wrap.style.minWidth="160px";
    wrap.innerHTML=`<label for="hiddenOwnerCategoryFilter">Owner</label><select id="hiddenOwnerCategoryFilter"><option value="">All Owners</option>${OWNER_CATEGORIES.map(name=>`<option value="${appContext.escapeHtml(name)}">${appContext.escapeHtml(name)}</option>`).join("")}</select>`;
    tools.appendChild(wrap);

    const select=wrap.querySelector("select");
    const summary=tools.querySelector(".inventory-result-summary strong");
    const apply=()=>{
      const category=sanitizeOwnerCategory(select.value);
      let shown=0;
      Array.from(grid.children).forEach(tile=>{
        const card=appContext.getCardById?.(tile.dataset.cardId||"");
        const visible=!category || sanitizeOwnerCategory(card?._owner_category)===category;
        tile.hidden=!visible;
        if(visible) shown++;
      });
      if(summary) summary.textContent=shown.toLocaleString();
    };
    select.addEventListener("change",apply);
  }

  const originalRenderHiddenListingsPage=appContext.renderHiddenListingsPage;
  if(typeof originalRenderHiddenListingsPage==="function"){
    appContext.renderHiddenListingsPage=function(...args){
      const result=originalRenderHiddenListingsPage(...args);
      wireHiddenListingsOwnerFilter();
      return result;
    };
  }

  Object.assign(appContext,{
    OWNER_CATEGORIES,
    OWNER_CATEGORY_TAG_PREFIX,
    sanitizeOwnerCategory,
    isOwnerCategoryTag,
    ownerCategoryFromTags,
    ownerTagsWithoutCategory,
    ownerTagsWithCategory,
    loadOwnerCategoriesIntoCards
  });
}
