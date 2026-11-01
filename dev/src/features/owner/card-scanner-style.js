export function register(){
  if(typeof document==="undefined")return;
  if(!document.getElementById("aiCardScannerStyles")){
    const link=document.createElement("link");
    link.id="aiCardScannerStyles";
    link.rel="stylesheet";
    link.href="./src/styles/30-ai-card-scanner.css?v=2026-10-25-v02";
    document.head.appendChild(link);
  }
  if(!document.getElementById("compactDesktopInventoryFilterStyles")){
    const style=document.createElement("style");
    style.id="compactDesktopInventoryFilterStyles";
    style.textContent=`@media(min-width:801px){
      .filter-drawer-shell:not(.desktop-collapsed){padding:10px 12px 11px!important;border-radius:12px!important}
      .filter-drawer-shell:not(.desktop-collapsed)>.filter-drawer-head{margin:0 0 8px!important;padding-bottom:7px!important}
      .filter-drawer-shell:not(.desktop-collapsed) .filter-row{gap:8px!important;align-items:center!important}
      .filter-drawer-shell:not(.desktop-collapsed) .overview-select-btn{min-height:40px!important;height:40px!important;padding:7px 12px!important;border-radius:10px!important;font-size:11px!important;font-weight:700!important}
      .filter-drawer-shell:not(.desktop-collapsed) .filter-row input,.filter-drawer-shell:not(.desktop-collapsed) .filter-row select{min-height:40px!important;height:40px!important;padding-top:7px!important;padding-bottom:7px!important;border-radius:10px!important;font-size:11px!important}
      .filter-drawer-shell:not(.desktop-collapsed) .ebay-only-filter{min-height:40px!important;height:40px!important;padding:0 12px!important;border-radius:10px!important;font-size:11px!important;box-sizing:border-box!important}
      .filter-drawer-shell:not(.desktop-collapsed) .ebay-only-filter input{width:16px!important;height:16px!important;min-height:0!important;margin:0!important;padding:0!important}
      .filter-drawer-shell:not(.desktop-collapsed) .clear-all-filters-btn{min-height:36px!important;padding:7px 11px!important;border-radius:9px!important;font-size:10px!important}
    }`;
    document.head.appendChild(style);
  }
}
