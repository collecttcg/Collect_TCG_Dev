/** Module: features/owner/dashboard. Routes Owner inventory entry to the established Inventory Tools workspace. */
export function register(appContext){
  const renderInventoryToolsPage=typeof appContext.renderInventoryToolsPage==="function"
    ? appContext.renderInventoryToolsPage.bind(appContext)
    : null;

  const EBAY_PURCHASE_MESSAGE=`Hi! Thank you very much for your purchase from Collect TCG!
We really appreciate your support. Your item will be carefully packed to ensure it is well protected during shipping.
Once the package has been shipped, the tracking information will be updated on eBay.
Please note that any applicable import duties, tariffs, taxes, customs clearance fees, or other import-related charges are not included in the item price or shipping cost and are the buyer’s responsibility. We recommend checking your local import requirements and applicable charges.
If you have any questions about your order, please feel free to message us anytime.
Thank you again for your purchase, and we hope you enjoy your new card!
Collect TCG MY & SG`;

  function addBuyerMessagesLink(){
    const subnav=appContext.view?.querySelector?.('.inventory-tools-subnav');
    if(!subnav || subnav.querySelector('[data-owner-buyer-messages]')) return;
    const link=document.createElement('a');
    link.href='#/inventory-tools?mode=activity&sub=buyer-messages';
    link.dataset.ownerBuyerMessages='true';
    link.textContent='Buyer Messages';
    subnav.appendChild(link);
  }

  function renderBuyerMessages(){
    if(!appContext.requireOwner("open Owner buyer messages")) return;
    const message=appContext.escapeHtml(EBAY_PURCHASE_MESSAGE);
    appContext.view.innerHTML=`
      <div class="inventory-tools-page">
        <div class="eyebrow">Owner Tools</div>
        <h2>Buyer Messages</h2>
        <p class="muted">Approved reusable messages for buyer communication.</p>
        <div class="inventory-tools-subnav">
          <a href="#/inventory-tools?mode=activity&sub=recent">Recently Edited</a>
          <a href="#/inventory-tools?mode=activity&sub=history">Edit History</a>
          <a href="#/inventory-tools?mode=activity&sub=qr">QR Generator</a>
          <a class="active" data-owner-buyer-messages="true" href="#/inventory-tools?mode=activity&sub=buyer-messages">Buyer Messages</a>
        </div>
        <section class="card" style="max-width:760px;margin-top:18px;padding:18px;">
          <div class="eyebrow">eBay</div>
          <h3 style="margin:6px 0 8px;">Thank You After Purchase</h3>
          <p class="muted" style="margin-top:0;">Send after a buyer completes a purchase.</p>
          <textarea id="ownerBuyerMessageText" readonly style="box-sizing:border-box;width:100%;min-height:250px;resize:vertical;padding:14px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text);font:inherit;line-height:1.55;">${message}</textarea>
          <div style="display:flex;justify-content:flex-end;margin-top:12px;">
            <button class="btn-primary" id="ownerCopyBuyerMessage" type="button">Copy Message</button>
          </div>
        </section>
      </div>`;
    const button=appContext.$("ownerCopyBuyerMessage");
    const textarea=appContext.$("ownerBuyerMessageText");
    if(button && textarea) button.onclick=async()=>{
      try{
        if(navigator.clipboard?.writeText){
          await navigator.clipboard.writeText(EBAY_PURCHASE_MESSAGE);
        }else{
          textarea.focus();
          textarea.select();
          if(!document.execCommand('copy')) throw new Error('Copy command failed');
        }
        button.textContent='Copied!';
        setTimeout(()=>{if(button) button.textContent='Copy Message';},1600);
      }catch(error){
        console.error('Buyer message copy failed:',error);
        textarea.focus();
        textarea.select();
        button.textContent='Select & Copy';
      }
    };
  }

  function renderOwnerInventoryTools(){
    if(!appContext.requireOwner("open Owner inventory tools")) return;
    const params=appContext.currentHashParams();
    if(params.get('mode')==='activity' && params.get('sub')==='buyer-messages'){
      renderBuyerMessages();
      return;
    }
    if(renderInventoryToolsPage){
      renderInventoryToolsPage();
      if(params.get('mode')==='activity') addBuyerMessagesLink();
      return;
    }
    appContext.view.innerHTML='<div class="empty"><strong>Inventory Tools unavailable.</strong><span>The established Owner inventory workspace could not be loaded.</span></div>';
  }

  appContext.renderInventoryToolsPage=renderOwnerInventoryTools;
  appContext.renderOwnerDashboard=renderOwnerInventoryTools;
}
