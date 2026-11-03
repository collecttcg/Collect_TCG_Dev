/** Development: include a saved eBay listing URL in single-card Facebook sales posts. */
export function register(appContext){
  const originalBuildFbPostText=appContext.buildFbPostText;
  if(typeof originalBuildFbPostText!=="function") return;

  appContext.buildFbPostText=function(card,values){
    const post=originalBuildFbPostText(card,values);
    if(!post || !card) return post;

    const ebayUrl=typeof appContext.normalizeEbayListingUrl==="function"
      ? appContext.normalizeEbayListingUrl(card.ebay_url||"")
      : "";
    if(!ebayUrl) return post;

    const websiteCardUrl=appContext.getCardShareUrl(card.id);
    if(!websiteCardUrl || !post.includes(websiteCardUrl)) return post;

    return post.replace(
      websiteCardUrl,
      `${websiteCardUrl}\n\n🛒 eBay Listing:\n${ebayUrl}`
    );
  };
}
