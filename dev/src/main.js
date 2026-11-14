import { createProductionRuntime } from './app/production-runtime.js?v=2026-09-29-v09';
import { registerFeatures } from './app/register-features.js?v=2026-11-14-v02';
import { register as registerScannerStyle } from './features/owner/card-scanner-style.js?v=2026-10-24-v10';
import { register as registerInventorySortToolbar } from './features/inventory/sort-toolbar.js?v=2026-10-31-v06';
import { initializeApp } from './app/initialize.js?v=2026-10-05-v01';
import { setup as setup1 } from './ui/enhancement-1.js';
import { setup as setup2 } from './ui/enhancement-2.js';
import { setup as setup3 } from './ui/enhancement-3.js';

function registerDesktopFilterCompactStyle(){
  const style=document.createElement('style');
  style.id='desktop-filter-compact-style';
  style.textContent=`
    @media (min-width:801px){
      #filterDrawerShell:not(.desktop-collapsed){padding:11px 13px 10px !important;}
      #filterDrawerShell:not(.desktop-collapsed) > .filter-drawer-head{margin-bottom:8px !important;padding-bottom:7px !important;}
      #filterDrawerShell .filter-drawer-head strong{font-size:13px !important;}
      #filterDrawerShell .filter-drawer-head span,
      #filterDrawerShell .clear-all-filters-btn{font-size:10px !important;}
      #filterDrawerShell:not(.desktop-collapsed) .filter-row{gap:8px !important;}
      #filterDrawerShell .overview-select-btn{min-height:44px !important;padding:8px 12px !important;font-size:12px !important;border-radius:10px !important;}
      #filterDrawerShell .overview-select-menu button{font-size:11.5px !important;}
      #filterDrawerShell .price-range-filter{min-height:44px !important;padding:6px 9px !important;gap:7px !important;}
      #filterDrawerShell .price-range-label{font-size:9.5px !important;}
      #filterDrawerShell .price-range-filter input{min-height:36px !important;padding:6px 8px !important;font-size:11.5px !important;border-radius:9px !important;}
      #filterDrawerShell .grade-shortcuts-label{font-size:10.5px !important;}
      #filterDrawerShell .grade-shortcuts button{min-height:34px !important;padding:5px 9px !important;font-size:10.5px !important;}
    }
  `;
  document.head.appendChild(style);
}

try{
  registerDesktopFilterCompactStyle();
  registerScannerStyle();
  const runtime=createProductionRuntime();
  const appContext={
    localStorage:runtime.localStorage,
    sessionStorage:runtime.sessionStorage,
    fetch:runtime.fetch
  };
  registerFeatures(appContext);
  registerInventorySortToolbar(appContext);
  initializeApp(appContext,runtime);
  setup1(appContext);
  setup2(appContext);
  setup3(appContext);
}catch(error){
  console.error('Collect TCG startup failed:',error);
  const notice=document.createElement('p');
  notice.setAttribute('role','alert');
  notice.textContent='Collect TCG could not start: '+error.message;
  document.body.prepend(notice);
}
