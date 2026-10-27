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

  const originalEbayListingDescription=appContext.ebayListingDescription;
  if(typeof originalEbayListingDescription==="function"){
    appContext.ebayListingDescription=function(card){
      const description=originalEbayListingDescription(card);
      if(!description) return description;
      const notice=[
        "[IMPORT DUTIES & TAXES]",
        "Import duties, tariffs, taxes, customs clearance fees, and other import-related charges are not included in the item price or shipping cost and are the buyer's responsibility.",
        "Please check applicable import charges before purchasing."
      ].join("\n");
      const marker="\n[COLLECT TCG MY & SG]";
      return description.includes(marker)
        ? description.replace(marker,`\n\n${notice}\n${marker}`)
        : `${description}\n\n${notice}`;
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
