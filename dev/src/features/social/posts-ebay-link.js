/** Development: include a saved eBay listing URL in single-card Facebook sales posts.
 * The URL is appended independently of the website card link and sold price.
 */
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

    const separator="━━━━━━━━━━━━━━━━━━━━━━━━";
    const marker=post.indexOf("\n"+separator);
    if(marker<0) return post+"\n\n🛒 eBay Listing:\n"+ebayUrl;

    // Insert the eBay link after the price/details section, for both
    // available and sold cards, without changing any existing URLs.
    return post.slice(0,marker)+"\n\n🛒 eBay Listing:\n"+ebayUrl+post.slice(marker);
  };
}
