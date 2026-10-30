/** Auto-scroll the Add/Edit listing page while an owner drags listing photos. */
export function register(appContext){
  if(typeof document==="undefined" || typeof window==="undefined") return;

  const EDGE_PX=120;
  const MAX_STEP_PX=30;
  let pointerY=null;
  let frameId=0;

  function isImageDragActive(){
    return Boolean(document.querySelector(".image-gallery-preview .image-preview-box.dragging"));
  }

  function scrollStep(){
    frameId=0;
    if(pointerY==null || !isImageDragActive()) return;

    const viewportHeight=window.innerHeight || document.documentElement.clientHeight || 0;
    let delta=0;

    if(pointerY<EDGE_PX){
      const strength=Math.min(1,Math.max(0,(EDGE_PX-pointerY)/EDGE_PX));
      delta=-Math.max(4,Math.round(MAX_STEP_PX*strength));
    }else if(pointerY>viewportHeight-EDGE_PX){
      const strength=Math.min(1,Math.max(0,(pointerY-(viewportHeight-EDGE_PX))/EDGE_PX));
      delta=Math.max(4,Math.round(MAX_STEP_PX*strength));
    }

    if(delta) window.scrollBy(0,delta);
    frameId=window.requestAnimationFrame(scrollStep);
  }

  function updateDragPosition(event){
    if(!isImageDragActive()) return;
    pointerY=Number(event.clientY);
    if(!Number.isFinite(pointerY)) return;
    if(!frameId) frameId=window.requestAnimationFrame(scrollStep);
  }

  function stopAutoScroll(){
    pointerY=null;
    if(frameId){
      window.cancelAnimationFrame(frameId);
      frameId=0;
    }
  }

  // dragover covers desktop HTML5 drag/drop; pointermove covers the existing
  // pointer-capture path used for touch/pen reordering.
  document.addEventListener("dragover",updateDragPosition,true);
  document.addEventListener("pointermove",updateDragPosition,true);
  document.addEventListener("dragend",stopAutoScroll,true);
  document.addEventListener("drop",stopAutoScroll,true);
  document.addEventListener("pointerup",stopAutoScroll,true);
  document.addEventListener("pointercancel",stopAutoScroll,true);
}

export function initialize(){}
