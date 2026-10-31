/** Module: features/owner/psa-never-synced. Adds a focused first-sync action to the existing PSA POP tool. */
export function register(appContext){
  const renderBulkPsaPopPage=appContext.renderBulkPsaPopPage;
  if(typeof renderBulkPsaPopPage!=="function") return;

  appContext.renderBulkPsaPopPage=function renderBulkPsaPopPageWithNeverSynced(){
    renderBulkPsaPopPage();

    const actions=appContext.view?.querySelector?.(".psa-bulk-actions");
    const dueButton=appContext.$?.("psaBulkDueBtn");
    if(!actions || !dueButton || appContext.$?.("psaBulkNeverBtn")) return;

    const never=appContext.psaPopEntries().filter(entry=>
      entry?.pop==null || entry.pop===""
    );

    const button=document.createElement("button");
    button.type="button";
    button.className="btn-ghost";
    button.id="psaBulkNeverBtn";
    button.dataset.psaBulkAction="never";
    button.setAttribute("aria-label","Get PSA POPs never synced before");
    button.disabled=never.length===0;
    button.textContent=`Get Never-Synced PSA POPs (${never.length})`;
    dueButton.insertAdjacentElement("afterend",button);

    button.addEventListener("click",event=>{
      event.preventDefault();
      if(button.disabled) return;

      if(!never.length){
        appContext.showToast("No never-synced PSA POPs found");
        return;
      }

      const ok=confirm(
        `Get POP counts for ${never.length} PSA listing${never.length===1?"":"s"} that have a certificate but no saved POP yet?\n\n` +
        `Only listings with no saved POP count will be processed.`
      );
      if(!ok) return;

      button.disabled=true;
      appContext.showToast(`Starting first PSA POP sync · ${never.length} listing${never.length===1?"":"s"}…`);

      requestAnimationFrame(()=>{
        appContext.startBulkPsaPopSync(never,"Never-synced PSA POP");
      });
    });
  };
}
