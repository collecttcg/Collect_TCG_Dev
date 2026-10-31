/** Development: keep listing sort controls separate from filters and add popularity sorting. */
export function register(appContext){
  const originalSortOptions=appContext.inventorySortOptions;
  const originalGetFiltered=appContext.getFiltered;

  if(typeof originalSortOptions==="function"){
    appContext.inventorySortOptions=function inventorySortOptionsWithPopularity(scope){
      const options=originalSortOptions(scope);
      if(scope==="collection" || options.some(option=>option?.value==="popular")) return options;
      const popular={value:"popular",label:"Most Popular"};
      const priceIndex=options.findIndex(option=>option?.value==="price-low");
      if(priceIndex>=0) options.splice(priceIndex,0,popular);
      else options.push(popular);
      return options;
    };
  }

  if(typeof originalGetFiltered==="function"){
    appContext.getFiltered=function getFilteredWithPopularity(...args){
      const list=originalGetFiltered(...args);
      if(appContext.$("sortBy")?.value!=="popular" || !Array.isArray(list)) return list;
      return list.slice().sort((a,b)=>
        Number(appContext.trendingCardScore?.(b)||0)-Number(appContext.trendingCardScore?.(a)||0) ||
        Number(appContext.trendingCardUniqueViews?.(b)||0)-Number(appContext.trendingCardUniqueViews?.(a)||0) ||
        Number(appContext.trendingCardViews?.(b)||0)-Number(appContext.trendingCardViews?.(a)||0) ||
        String(a?.name||"").localeCompare(String(b?.name||""),undefined,{sensitivity:"base",numeric:true})
      );
    };
  }

  function ensureStyle(){
    if(document.getElementById("inventory-sort-toolbar-style")) return;
    const style=document.createElement("style");
    style.id="inventory-sort-toolbar-style";
    style.textContent=`
      @media (min-width:801px){
        .desktop-filter-toggle-row{display:flex!important;align-items:stretch!important;flex-wrap:nowrap!important;gap:8px!important;}
        .desktop-filter-toggle-actions{display:grid!important;grid-template-columns:minmax(240px,1fr) minmax(180px,220px) auto auto;align-items:stretch;gap:8px;min-width:0;width:auto!important;flex:1 1 auto!important;}
        .desktop-filter-toggle-actions>.desktop-inline-search{min-width:0!important;width:100%!important;}
        .desktop-filter-toggle-actions>.inventory-sort-toolbar{position:relative!important;min-width:0!important;width:100%!important;align-self:stretch;}
        .desktop-filter-toggle-actions>.inventory-sort-toolbar .overview-select-btn{width:100%;min-height:48px;height:100%;white-space:nowrap;}
        .desktop-filter-toggle-actions>.inventory-sort-toolbar .overview-select-menu{position:absolute!important;top:calc(100% + 6px)!important;right:0!important;bottom:auto!important;left:0!important;width:100%!important;min-width:220px!important;max-width:none!important;max-height:min(420px,60vh)!important;overflow-y:auto!important;z-index:1000!important;}
        .desktop-filter-toggle-actions>.desktop-filter-toggle-btn,.desktop-filter-toggle-actions>.desktop-listing-currency-control{height:100%;white-space:nowrap;flex:none!important;width:auto!important;min-width:0!important;}
        .desktop-filter-toggle-row>.desktop-filter-add-card{flex:0 0 auto!important;align-self:stretch;display:flex;align-items:center;white-space:nowrap;}
        .filter-drawer-shell .inventory-sort-toolbar{display:none!important;}
      }
      @media (min-width:801px) and (max-width:1100px){
        .desktop-filter-toggle-actions{grid-template-columns:minmax(180px,1fr) minmax(160px,185px) auto auto;gap:6px;}
        .desktop-filter-toggle-row{gap:6px!important;}
        .desktop-filter-toggle-actions>.inventory-sort-toolbar .overview-select-menu{min-width:185px!important;}
      }
      @media (max-width:800px){
        .mobile-search-filter-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto auto auto!important;gap:8px!important;align-items:stretch!important;}
        .mobile-search-filter-row>.mobile-inventory-search{min-width:0!important;width:auto!important;}
        .mobile-search-filter-row>.mobile-inline-sort,.mobile-search-filter-row>.mobile-filter-open-btn,.mobile-search-filter-row>.mobile-inline-currency{min-width:0!important;width:auto!important;white-space:nowrap!important;}
        .mobile-inline-sort{display:flex!important;align-items:center!important;justify-content:center!important;padding:0 14px!important;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(20,22,28,.92);color:inherit;font:inherit;font-weight:700;text-transform:uppercase;}
        .sticky-mobile-results-bar{display:none!important;}
      }
      @media (max-width:560px){
        .mobile-search-filter-row{grid-template-columns:minmax(118px,1fr) auto auto auto!important;gap:6px!important;}
        .mobile-inline-sort{padding:0 10px!important;}
        .mobile-search-filter-row>.mobile-filter-open-btn{padding-left:10px!important;padding-right:10px!important;}
        .mobile-search-filter-row>.mobile-inline-currency{padding-left:8px!important;padding-right:8px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function preparePopularitySort(sortWrap){
    const sortInput=sortWrap?.querySelector?.("#sortBy");
    if(!sortInput || sortInput.dataset.popularitySortReady==="true") return;
    sortInput.dataset.popularitySortReady="true";
    sortInput.addEventListener("change",()=>{
      if(sortInput.value!=="popular" || typeof appContext.refreshTrending7dPerformance!=="function") return;
      if(appContext.trending7dBackendState==="available" || sortInput.dataset.popularityLoadAttempted==="true") return;
      sortInput.dataset.popularityLoadAttempted="true";
      appContext.refreshTrending7dPerformance().then(()=>{
        if(sortInput.value!=="popular") return;
        sortInput.dispatchEvent(new Event("change",{bubbles:true}));
      }).catch(()=>{});
    });
  }

  function moveDesktopSortOutsideFilters(){
    const sortWrap=appContext.$("sortByWrap");
    const actions=document.querySelector(".desktop-filter-toggle-actions");
    const filterButton=appContext.$("desktopFilterToggleBtn");
    if(!sortWrap || !actions || !filterButton) return false;
    preparePopularitySort(sortWrap);
    if(sortWrap.parentElement===actions) return true;
    sortWrap.classList.add("inventory-sort-toolbar");
    actions.insertBefore(sortWrap,filterButton);
    return true;
  }

  function ensureMobileInlineSort(){
    const row=document.querySelector(".mobile-search-filter-row");
    const filterButton=appContext.$("mobileFilterOpenBtn");
    const stickySort=appContext.$("stickyMobileSortBtn");
    if(!row || !filterButton || !stickySort) return false;
    let button=appContext.$("mobileInlineSortBtn");
    if(!button){
      button=document.createElement("button");
      button.type="button";
      button.id="mobileInlineSortBtn";
      button.className="mobile-inline-sort";
      button.textContent="Sort";
      button.setAttribute("aria-expanded","false");
      button.setAttribute("aria-controls","mobileSortSheet");
      button.addEventListener("click",()=>stickySort.click());
      row.insertBefore(button,filterButton);
    }
    return true;
  }

  ensureStyle();
  const observer=new MutationObserver(()=>{
    const desktopReady=moveDesktopSortOutsideFilters();
    const mobileReady=ensureMobileInlineSort();
    if(desktopReady || mobileReady) requestAnimationFrame(()=>{moveDesktopSortOutsideFilters();ensureMobileInlineSort();});
  });
  observer.observe(document.body,{childList:true,subtree:true});
  requestAnimationFrame(()=>{moveDesktopSortOutsideFilters();ensureMobileInlineSort();});
}
