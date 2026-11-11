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
      let description=originalEbayListingDescription(card);
      if(!description) return description;

      const shippingLine="The packing process and sealed package will be video recorded before dispatch to document the condition and packaging and help prevent any problems or disputes during shipping.";
      const trackingLine="Tracking will be provided after dispatch.";
      if(description.includes(trackingLine) && !description.includes(shippingLine)){
        description=description.replace(trackingLine,`${shippingLine}\n${trackingLine}`);
      }

      const notice=[
        "[IMPORT DUTIES & TAXES]",
        "Import duties, tariffs, taxes, customs clearance fees, and other import-related charges are not included in the item price or shipping cost and are the buyer's responsibility.",
        "Please check applicable import charges before purchasing.",
        "If delivery cannot be completed because the buyer refuses or fails to pay applicable import duties, taxes, customs fees, or other required import charges, the transaction will be handled in accordance with eBay's applicable policies. Such circumstances may not be covered by eBay Money Back Guarantee."
      ].join("\n");
      const marker="\n[COLLECT TCG MY & SG]";
      return description.includes(marker)
        ? description.replace(marker,`\n${notice}\n${marker}`)
        : `${description}\n${notice}`;
    };
  }

  const originalRenderEbayListingGeneratorPage=appContext.renderEbayListingGeneratorPage;
  if(typeof originalRenderEbayListingGeneratorPage==="function"){
    appContext.renderEbayListingGeneratorPage=function(...args){
      const originalIsLiveLifecycle=appContext.isLiveLifecycle;
      try{
        appContext.isLiveLifecycle=card=>appContext.cardLifecycle(card)==="draft" || originalIsLiveLifecycle(card);
        const result=originalRenderEbayListingGeneratorPage(...args);

        const specificsOutput=document.getElementById("ebaySpecificsOutput");
        const specificsField=specificsOutput?.closest(".field");
        const specificsActions=specificsField?.nextElementSibling;
        specificsField?.remove();
        if(specificsActions?.querySelector?.("#ebayCopySpecifics")) specificsActions.remove();

        const pageDescription=appContext.view?.querySelector?.(".page-head p");
        if(pageDescription) pageDescription.textContent="Select an inventory card and copy an eBay-ready title and description.";

        return result;
      }finally{
        appContext.isLiveLifecycle=originalIsLiveLifecycle;
      }
    };
  }
}
