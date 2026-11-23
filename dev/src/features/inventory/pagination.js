/** Align a preferred page size with complete grid rows. */
export function fullRowPageSize(preferred, tracks){
  const columns=tracks.trim().split(/\s+/);
  if(!columns.every(track=>/^\d+(?:\.\d+)?px$/.test(track))) return preferred;
  const count=columns.filter(track=>parseFloat(track)>0).length;
  return count>1 ? Math.max(1,Math.round(preferred/count))*count : preferred;
}

export function createInventoryPagination(appContext,{draw,getFilterSignature,scrollToListingStart,getPageSize=()=>appContext.listingPerPage}){
  let filterSignature=null;
  let firstDraw=true;

  function syncFilterPage(){
    const next=getFilterSignature();
    if(firstDraw){firstDraw=false;filterSignature=next;return;}
    if(next===filterSignature)return;
    filterSignature=next;
    if(appContext.listingCurrentPage!==1){
      appContext.listingCurrentPage=1;
      appContext.updateListingUrlFromControls();
    }
  }

  function pageItems(current,total){
    if(total<=7)return Array.from({length:total},(_,i)=>i+1);
    const pages=new Set([1,total,current-1,current,current+1]);
    if(current<=4)[2,3,4,5].forEach(page=>pages.add(page));
    if(current>=total-3)[total-4,total-3,total-2,total-1].forEach(page=>pages.add(page));
    const sorted=Array.from(pages).filter(page=>page>=1&&page<=total).sort((a,b)=>a-b);
    const items=[];
    sorted.forEach((page,index)=>{if(index&&page-sorted[index-1]>1)items.push("ellipsis");items.push(page);});
    return items;
  }

  function html(totalItems,pageSize){
    const totalPages=Math.max(1,Math.ceil(totalItems/pageSize));
    const start=totalItems?((appContext.listingCurrentPage-1)*pageSize)+1:0;
    const end=totalItems?Math.min(appContext.listingCurrentPage*pageSize,totalItems):0;
    return `<nav class="listing-pagination" aria-label="Listing pages">
      <div class="listing-pagination-summary"><strong>Showing ${start.toLocaleString()}–${end.toLocaleString()}</strong> of ${totalItems.toLocaleString()} listings · Page ${appContext.listingCurrentPage.toLocaleString()} of ${totalPages.toLocaleString()}</div>
      <div class="listing-pagination-pages">
        <button type="button" class="listing-page-btn" data-page-direction="prev" aria-label="Previous page" ${appContext.listingCurrentPage<=1?"disabled":""}>‹</button>
        ${pageItems(appContext.listingCurrentPage,totalPages).map(page=>page==="ellipsis"
          ?'<span class="listing-page-ellipsis" aria-hidden="true">…</span>'
          :`<button type="button" class="listing-page-btn ${page===appContext.listingCurrentPage?"active":""}" data-listing-page="${page}" ${page===appContext.listingCurrentPage?'aria-current="page"':""}>${page}</button>`).join("")}
        <button type="button" class="listing-page-btn" data-page-direction="next" aria-label="Next page" ${appContext.listingCurrentPage>=totalPages?"disabled":""}>›</button>
      </div>
    </nav>`;
  }

  function render(totalItems){
    const pageSize=getPageSize();
    const totalPages=Math.max(1,Math.ceil(totalItems/pageSize));
    appContext.listingCurrentPage=Math.min(Math.max(1,appContext.listingCurrentPage),totalPages);
    ["listingPaginationTop","listingPaginationBottom"].forEach(id=>{
      const mount=appContext.$(id);if(!mount)return;
      mount.hidden=totalItems<=pageSize;
      mount.innerHTML=totalItems>pageSize?html(totalItems,pageSize):"";
    });
  }

  function changePerPage(value){
    appContext.listingPerPage=appContext.setSavedListingPerPage(Number(value));
    appContext.listingCurrentPage=1;
    ["listingPerPageSelect","mobileListingPerPageSelect"].forEach(id=>{
      const select=appContext.$(id);
      if(select&&Number(select.value)!==appContext.listingPerPage)select.value=String(appContext.listingPerPage);
    });
    appContext.updateListingUrlFromControls();
    draw();
  }

  function handleClick(event){
    const button=event.target.closest(".listing-page-btn");
    if(!button||button.disabled)return;
    const totalPages=Math.max(1,Math.ceil(appContext.getFiltered().length/getPageSize()));
    let next=appContext.listingCurrentPage;
    if(button.dataset.pageDirection==="prev")next=Math.max(1,next-1);
    else if(button.dataset.pageDirection==="next")next=Math.min(totalPages,next+1);
    else if(button.dataset.listingPage)next=appContext.safeListingPage(button.dataset.listingPage);
    next=Math.min(Math.max(1,next),totalPages);
    if(next===appContext.listingCurrentPage)return;
    const fromBottom=!!button.closest("#listingPaginationBottom");
    try{button.blur();}catch{}
    appContext.listingCurrentPage=next;
    appContext.updateListingUrlFromControls();
    draw();
    if(fromBottom)scrollToListingStart?.();
  }

  return {syncFilterPage,render,changePerPage,handleClick,pageItems};
}
