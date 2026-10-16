import { createProductionRuntime } from './app/production-runtime.js?v=2026-09-29-v09';
import { registerFeatures } from './app/register-features.js?v=2026-10-07-v02&owner=2026-10-16-v03';
import { initializeApp } from './app/initialize.js?v=2026-10-05-v01';
import { setup as setup1 } from './ui/enhancement-1.js';
import { setup as setup2 } from './ui/enhancement-2.js';
import { setup as setup3 } from './ui/enhancement-3.js';

try{
  const runtime=createProductionRuntime();
  const appContext={...runtime};
  registerFeatures(appContext);
  setup1(appContext);
  setup2(appContext);
  setup3(appContext);
  await initializeApp(appContext,runtime);
}catch(error){
  console.error('Application startup failed:',error);
  const view=document.getElementById('view');
  if(view){
    view.innerHTML='<div class="panel"><h2>Unable to start Collect TCG</h2><p>Please refresh the page. If the problem continues, contact the site owner.</p></div>';
  }
}