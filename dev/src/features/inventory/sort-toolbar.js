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
        .desktop-filter-toggle-actions>.inventory-sort-toolbar{flex:0 0 auto;min-width:210px;}
        .desktop-filter-toggle-actions>.inventory-sort-toolbar .overview-select-btn{min-height:48px;white-space:nowrap;}
        .filter-drawer-shell .inventory-sort-toolbar{display:none!important;}
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
      if(appContext.trending7dBackendState==="available") return;
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

  ensureStyle();
  const observer=new MutationObserver(()=>{
    if(moveDesktopSortOutsideFilters()) requestAnimationFrame(moveDesktopSortOutsideFilters);
  });
  observer.observe(document.body,{childList:true,subtree:true});
  requestAnimationFrame(moveDesktopSortOutsideFilters);
}
