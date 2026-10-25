/** Module: features/owner/dashboard. Routes Owner inventory entry to the established Inventory Tools workspace. */
export function register(appContext){
  const renderInventoryToolsPage=typeof appContext.renderInventoryToolsPage==="function"
    ? appContext.renderInventoryToolsPage.bind(appContext)
    : null;

  function renderOwnerInventoryTools(){
    if(!appContext.requireOwner("open Owner inventory tools")) return;
    if(renderInventoryToolsPage){
      renderInventoryToolsPage();
      return;
    }
    appContext.view.innerHTML='<div class="empty"><strong>Inventory Tools unavailable.</strong><span>The established Owner inventory workspace could not be loaded.</span></div>';
  }

  appContext.renderInventoryToolsPage=renderOwnerInventoryTools;
  appContext.renderOwnerDashboard=renderOwnerInventoryTools;
}
