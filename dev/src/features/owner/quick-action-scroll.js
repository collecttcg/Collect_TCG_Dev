/** Preserve the current viewport when owner quick actions rerender the listing. */
export function register(appContext){
  if(typeof window==="undefined" || typeof appContext.router!=="function") return;

  let preserveNextRouterScroll=false;
  const baseRouter=appContext.router;
  appContext.router=function(...args){
    if(!preserveNextRouterScroll) return baseRouter.apply(this,args);

    preserveNextRouterScroll=false;
    const x=window.scrollX;
    const y=window.scrollY;
    const result=baseRouter.apply(this,args);
    const restore=()=>window.scrollTo(x,y);
    requestAnimationFrame(()=>{
      restore();
      requestAnimationFrame(restore);
    });
    return result;
  };

  const wrapQuickAction=fn=>async function(...args){
    preserveNextRouterScroll=true;
    try{
      const result=await fn.apply(this,args);
      if(!result) preserveNextRouterScroll=false;
      return result;
    }catch(error){
      preserveNextRouterScroll=false;
      throw error;
    }
  };

  if(typeof appContext.quickSetCardAvailability==="function"){
    appContext.quickSetCardAvailability=wrapQuickAction(appContext.quickSetCardAvailability);
  }
  if(typeof appContext.quickSetEbayStatus==="function"){
    appContext.quickSetEbayStatus=wrapQuickAction(appContext.quickSetEbayStatus);
  }
  if(typeof appContext.setCardLifecycle==="function"){
    appContext.setCardLifecycle=wrapQuickAction(appContext.setCardLifecycle);
  }
}

export function initialize(){}
