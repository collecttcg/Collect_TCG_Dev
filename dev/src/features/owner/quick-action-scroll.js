/** Preserve the current viewport when owner quick actions rerender the listing. */
export function register(appContext){
  if(typeof window==="undefined" || typeof appContext.router!=="function") return;

  let preserveNextRouterScroll=false;
  let preservedScroll=null;
  const captureScroll=()=>{
    const shell=document.querySelector(".shell");
    return {
      windowX:Math.max(0,Number(window.scrollX||0)),
      windowY:Math.max(0,Number(window.scrollY||0)),
      shellX:shell ? Math.max(0,Number(shell.scrollLeft||0)) : 0,
      shellY:shell ? Math.max(0,Number(shell.scrollTop||0)) : 0
    };
  };
  const restoreScroll=state=>{
    if(!state) return;
    const shell=document.querySelector(".shell");
    if(shell){
      shell.scrollTo({top:state.shellY,left:state.shellX,behavior:"auto"});
    }
    window.scrollTo({top:state.windowY,left:state.windowX,behavior:"auto"});
  };

  const baseRouter=appContext.router;
  appContext.router=function(...args){
    if(!preserveNextRouterScroll) return baseRouter.apply(this,args);

    preserveNextRouterScroll=false;
    const state=preservedScroll || captureScroll();
    preservedScroll=null;
    const result=baseRouter.apply(this,args);
    // Inventory uses .shell as the scroll container on mobile and window on
    // desktop. Restore both after the rerender has painted so quick actions do
    // not jump to the top on either layout.
    requestAnimationFrame(()=>{
      restoreScroll(state);
      requestAnimationFrame(()=>restoreScroll(state));
    });
    return result;
  };

  const wrapQuickAction=fn=>async function(...args){
    preservedScroll=captureScroll();
    preserveNextRouterScroll=true;
    try{
      const result=await fn.apply(this,args);
      if(!result){
        preserveNextRouterScroll=false;
        preservedScroll=null;
      }
      return result;
    }catch(error){
      preserveNextRouterScroll=false;
      preservedScroll=null;
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
