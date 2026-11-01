/** Preserve the current viewport when owner quick actions rerender the listing. */
export function register(appContext){
  if(typeof window==="undefined" || typeof appContext.router!=="function") return;

  let preserveNextRouterScroll=false;
  let pendingEbayCardId="";
  const baseRouter=appContext.router;

  function scrollState(){
    const shell=document.querySelector(".shell");
    return {
      x:window.scrollX,
      y:window.scrollY,
      shell,
      shellX:shell?.scrollLeft||0,
      shellY:shell?.scrollTop||0
    };
  }

  function restoreScroll(state){
    if(!state) return;
    if(state.shell?.isConnected){
      state.shell.scrollTo({left:state.shellX,top:state.shellY,behavior:"auto"});
    }else{
      const shell=document.querySelector(".shell");
      shell?.scrollTo({left:state.shellX,top:state.shellY,behavior:"auto"});
    }
    window.scrollTo({left:state.x,top:state.y,behavior:"auto"});
  }

  function refreshEbayCardInPlace(cardId){
    const id=String(cardId||"");
    if(!id || typeof appContext.cardTileHTML!=="function") return false;
    const card=appContext.getCardById?.(id);
    const current=appContext.view?.querySelector?.(`.card[data-card-id="${CSS.escape(id)}"]`);
    if(!card || !current) return false;

    // Build the latest tile only as a source for the eBay-specific DOM pieces.
    // Keep the existing card node in place so its delegated/interactions remain intact.
    const holder=document.createElement("div");
    holder.innerHTML=appContext.cardTileHTML(card).trim();
    const fresh=holder.firstElementChild;
    if(!fresh) return false;

    const currentThumb=current.firstElementChild;
    const freshBadge=fresh.querySelector(".ebay-listing-image-badge");
    current.querySelector(".ebay-listing-image-badge")?.remove();
    if(freshBadge && currentThumb){
      currentThumb.appendChild(freshBadge.cloneNode(true));
    }

    const currentAction=current.querySelector('[data-action="ebay-status"]');
    const freshAction=fresh.querySelector('[data-action="ebay-status"]');
    if(currentAction && freshAction){
      currentAction.textContent=freshAction.textContent;
    }

    return true;
  }

  appContext.router=function(...args){
    if(pendingEbayCardId){
      const cardId=pendingEbayCardId;
      pendingEbayCardId="";
      preserveNextRouterScroll=false;
      const state=scrollState();
      if(refreshEbayCardInPlace(cardId)){
        restoreScroll(state);
        return;
      }
      // Fall through to the normal router only if the tile cannot be patched.
      preserveNextRouterScroll=true;
    }

    if(!preserveNextRouterScroll) return baseRouter.apply(this,args);

    preserveNextRouterScroll=false;
    const state=scrollState();
    const result=baseRouter.apply(this,args);
    const restore=()=>restoreScroll(state);
    restore();
    requestAnimationFrame(()=>{
      restore();
      requestAnimationFrame(restore);
    });
    setTimeout(restore,0);
    setTimeout(restore,50);
    return result;
  };

  const wrapQuickAction=(fn,{ebay=false}={})=>async function(...args){
    preserveNextRouterScroll=true;
    if(ebay) pendingEbayCardId=String(args[0]?.id||"");
    try{
      const result=await fn.apply(this,args);
      if(!result){
        preserveNextRouterScroll=false;
        pendingEbayCardId="";
      }
      return result;
    }catch(error){
      preserveNextRouterScroll=false;
      pendingEbayCardId="";
      throw error;
    }
  };

  if(typeof appContext.quickSetCardAvailability==="function"){
    appContext.quickSetCardAvailability=wrapQuickAction(appContext.quickSetCardAvailability);
  }
  if(typeof appContext.quickSetEbayStatus==="function"){
    appContext.quickSetEbayStatus=wrapQuickAction(appContext.quickSetEbayStatus,{ebay:true});
  }
  if(typeof appContext.setCardLifecycle==="function"){
    appContext.setCardLifecycle=wrapQuickAction(appContext.setCardLifecycle);
  }
}

export function initialize(){}
