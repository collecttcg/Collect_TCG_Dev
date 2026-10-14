/** Allow owner-only hidden (draft) listings to use the existing eBay Post Generator. */
export function register(appContext){
  const originalCardTileHTML=appContext.cardTileHTML;
  if(typeof originalCardTileHTML==="function"){
    appContext.cardTileHTML=function(card,...args){
      if(appContext.cardLifecycle(card)!=="draft") return originalCardTileHTML(card,...args);
      const originalIsLiveLifecycle=appContext.isLiveLifecycle;
      try{
        appContext.isLiveLifecycle=c=>c===card || originalIsLiveLifecycle(c);
        return originalCardTileHTML(card,...args);
      }finally{
        appContext.isLiveLifecycle=originalIsLiveLifecycle;
      }
    };
  }

  const originalRenderEbayListingGeneratorPage=appContext.renderEbayListingGeneratorPage;
  if(typeof originalRenderEbayListingGeneratorPage==="function"){
    appContext.renderEbayListingGeneratorPage=function(...args){
      const originalIsLiveLifecycle=appContext.isLiveLifecycle;
      try{
        appContext.isLiveLifecycle=card=>appContext.cardLifecycle(card)==="draft" || originalIsLiveLifecycle(card);
        return originalRenderEbayListingGeneratorPage(...args);
      }finally{
        appContext.isLiveLifecycle=originalIsLiveLifecycle;
      }
    };
  }
}
