/** Development: keep listing sort controls separate from filters and add popularity sorting. */
export function register(appContext){
  const originalSortOptions=appContext.inventorySortOptions;
  const originalGetFiltered=appContext.getFiltered;
  const originalInventoryPageHTML=appContext.inventoryPageHTML;

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

  // Render the mobile Sort control as part of the toolbar markup itself. This
  // avoids relying on a later MutationObserver insertion, which could miss the
  // first inventory render on mobile Safari.
  if(typeof originalInventoryPageHTML==="function"){
    appContext.inventoryPageHTML=function inventoryPageHTMLWithInlineSort(...args){
      const html=originalInventoryPageHTML(...args);
      if(html.includes('id="mobileInlineSortBtn"')) return html;
      const filterMarker='<button type="button"\n                class="mobile-filter-open-btn mobile-search-filter-btn"\n                id="mobileFilterOpenBtn"';
      const inlineSort=`<button type="button"\n                class="mobile-inline-sort"\n                id="mobileInlineSortBtn"\n                aria-expanded="false"\n                aria-controls="mobileSortSheet">\n          Sort\n        </button>\n\n        `;
      return html.replace(filterMarker,inlineSort+filterMarker);
    };
  }

  function ensureStyle(){
    if(document.getElementById("inventory-sort-toolbar-style")) return;
    const style=document.createElement("style");
    style.id="inventory-sort-toolbar-style";
    style.textContent=`
      @media (min-width:801px){
        .desktop-filter-toggle-row{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(160px,220px) auto auto auto!important;align-items:stretch!important;gap:8px!important;width:100%!important;}
        .desktop-filter-toggle-actions{display:contents!important;}
        .desktop-filter-toggle-actions>.desktop-inline-search{grid-column:1;min-width:0!important;width:100%!important;}
        .desktop-filter-toggle-actions>.inventory-sort-toolbar{grid-column:2;position:relative!important;min-width:0!important;width:100%!important;align-self:stretch;}
        .desktop-filter-toggle-actions>.desktop-filter-toggle-btn{grid-column:3;height:100%;white-space:nowrap;min-width:0!important;width:auto!important;}
        .desktop-filter-toggle-actions>.desktop-listing-currency-control{grid-column:4;height:100%;white-space:nowrap;min-width:0!important;width:auto!important;}
        .desktop-filter-toggle-row>.desktop-filter-add-card{grid-column:5;align-self:stretch;display:flex;align-items:center;white-space:nowrap;min-width:0!important;}
        .desktop-filter-toggle-actions>.inventory-sort-toolbar .overview-select-btn{width:100%;min-height:48px;height:100%;white-space:nowrap;}
        .desktop-filter-toggle-actions>.inventory-sort-toolbar .overview-select-menu{position:absolute!important;top:calc(100% + 6px)!important;right:0!important;bottom:auto!important;left:0!important;width:100%!important;min-width:220px!important;max-width:none!important;max-height:min(420px,60vh)!important;overflow-y:auto!important;z-index:1000!important;}
        .filter-drawer-shell .inventory-sort-toolbar{display:none!important;}
      }
      @media (min-width:801px) and (max-width:1100px){
        .desktop-filter-toggle-row{grid-template-columns:minmax(0,1fr) minmax(150px,180px) auto auto auto!important;gap:6px!important;}
        .desktop-filter-toggle-actions>.inventory-sort-toolbar .overview-select-menu{min-width:180px!important;}
      }
      @media (max-width:800px){
        .mobile-search-filter-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto auto auto!important;gap:6px!important;align-items:stretch!important;}
        .mobile-search-filter-row>.mobile-inventory-search{min-width:0!important;width:auto!important;}
        .mobile-search-filter-row>.mobile-inline-sort,.mobile-search-filter-row>.mobile-filter-open-btn,.mobile-search-filter-row>.mobile-inline-currency{min-width:0!important;width:auto!important;white-space:nowrap!important;}
        .mobile-inline-sort{display:flex!important;align-items:center!important;justify-content:center!important;padding:0 10px!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:12px!important;background:rgba(20,22,28,.92)!important;color:inherit!important;font:inherit!important;font-weight:700!important;text-transform:uppercase!important;}
        .sticky-mobile-results-bar{display:none!important;}
      }
      @media (max-width:560px){
        .mobile-search-filter-row{grid-template-columns:minmax(82px,1fr) auto auto auto!important;gap:5px!important;}
        .mobile-inventory-search input{min-width:0!important;padding-left:34px!important;padding-right:24px!important;}
        .mobile-inline-sort{padding:0 8px!important;}
        .mobile-search-filter-row>.mobile-filter-open-btn{padding-left:8px!important;padding-right:8px!important;}
        .mobile-search-filter-row>.mobile-inline-currency{padding-left:6px!important;padding-right:6px!important;}
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
    if(!row || !filterButton) return false;
    let button=appContext.$("mobileInlineSortBtn");
    if(!button){
      button=document.createElement("button");
      button.type="button";
      button.id="mobileInlineSortBtn";
      button.className="mobile-inline-sort";
      button.textContent="Sort";
      button.setAttribute("aria-expanded","false");
      button.setAttribute("aria-controls","mobileSortSheet");
      row.insertBefore(button,filterButton);
    }
    if(button.dataset.sortClickReady!=="true"){
      button.dataset.sortClickReady="true";
      button.addEventListener("click",()=>{
        if(stickySort){ stickySort.click(); return; }
        const sheet=appContext.$("mobileSortSheet");
        const backdrop=appContext.$("mobileSortBackdrop");
        if(sheet) sheet.hidden=false;
        if(backdrop) backdrop.hidden=false;
        button.setAttribute("aria-expanded","true");
        document.body.classList.add("mobile-sort-open");
      });
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
