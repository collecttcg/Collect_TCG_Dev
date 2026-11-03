/** Development: dedicated eBay owner-tools category and reusable buyer messages. */
export function register(appContext){
  const previousRender=typeof appContext.renderInventoryToolsPage==="function"
    ? appContext.renderInventoryToolsPage.bind(appContext)
    : null;

  const PURCHASE_MESSAGE=`Hi! Thank you very much for your purchase from Collect TCG!\n\nWe really appreciate your support. Your item will be carefully packed to ensure it is well protected during shipping.\n\nFor additional security and documentation, the entire packaging process will also be video recorded before the parcel is handed over to the shipping carrier.\n\nOnce the package has been shipped, the tracking information will be updated on eBay.\n\nPlease note that any applicable import duties, tariffs, taxes, customs clearance fees, or other import-related charges are not included in the item price or shipping cost and are the buyer’s responsibility. We recommend checking your local import requirements and applicable charges.\n\nIf you have any questions about your order, please feel free to message us anytime.\n\nThank you again for your purchase, and we hope you enjoy your new card!\n\nCollect TCG`;

  const AFTER_SHIPPED_MESSAGE=`Hello,\n\nYour order has been shipped and the tracking information has been uploaded to eBay.\n\nThank you again for purchasing from Collect TCG. We hope your order arrives safely and that you enjoy your new addition to the collection!\n\nOnce your order arrives, if you're happy with your purchase, we would really appreciate it if you could leave positive feedback for our store. Your feedback really helps support us.\n\nThank you for your support!\n\nCollect TCG`;

  function addEbayCategory(active=false){
    const switcher=appContext.view?.querySelector?.('.inventory-tools-category-switcher');
    if(!switcher) return;
    let link=switcher.querySelector('[data-owner-ebay-tools]');
    if(!link){
      link=document.createElement('a');
      link.href='#/inventory-tools?mode=ebay&sub=messages';
      link.dataset.ownerEbayTools='true';
      link.setAttribute('role','tab');
      link.innerHTML='<strong>eBay</strong><span>Messages · selling tools</span>';
      switcher.appendChild(link);
    }
    if(active){
      switcher.querySelectorAll('a').forEach(item=>{
        item.classList.toggle('active',item===link);
        item.setAttribute('aria-selected',item===link?'true':'false');
      });
    }
  }

  function cleanActivityMessagesLink(){
    appContext.view?.querySelector?.('[data-owner-buyer-messages]')?.remove();
  }

  function copyHandler(buttonId,textareaId,message){
    const button=appContext.$(buttonId);
    const textarea=appContext.$(textareaId);
    if(!button || !textarea) return;
    button.onclick=async()=>{
      try{
        if(navigator.clipboard?.writeText){
          await navigator.clipboard.writeText(message);
        }else{
          textarea.focus();
          textarea.select();
          if(!document.execCommand('copy')) throw new Error('Copy command failed');
        }
        button.textContent='Copied!';
        setTimeout(()=>{if(button) button.textContent='Copy Message';},1600);
      }catch(error){
        console.error('eBay message copy failed:',error);
        textarea.focus();
        textarea.select();
        button.textContent='Select & Copy';
      }
    };
  }

  function messageCard(title,description,textareaId,buttonId,message,minHeight){
    return `<section class="card" style="box-sizing:border-box;width:min(100%,920px);margin-top:22px;padding:24px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:18px;">
        <div style="min-width:0;flex:1 1 420px;">
          <div class="eyebrow">eBay</div>
          <h3 style="margin:6px 0 6px;">${appContext.escapeHtml(title)}</h3>
          <p class="muted" style="margin:0;">${appContext.escapeHtml(description)}</p>
        </div>
        <button class="btn-primary" id="${buttonId}" type="button" style="flex:0 0 auto;min-width:140px;">Copy Message</button>
      </div>
      <textarea id="${textareaId}" readonly style="box-sizing:border-box;display:block;width:100%;min-height:${minHeight}px;resize:vertical;padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--text);font:inherit;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere;">${appContext.escapeHtml(message)}</textarea>
    </section>`;
  }

  function renderEbayMessages(){
    if(!appContext.requireOwner('open Owner eBay messages')) return;
    const baseSwitcher=typeof appContext.inventoryToolsSwitcher==="function"
      ? appContext.inventoryToolsSwitcher('activity','recent')
      : '';
    appContext.view.innerHTML=`<div class="inventory-tools-page">
      <div class="eyebrow">Owner Tools</div>
      <h2>eBay Messages</h2>
      <p class="muted">Reusable eBay buyer communication templates.</p>
      ${baseSwitcher}
      ${messageCard('After Purchase','Send after a buyer completes a purchase.','ownerEbayPurchaseMessage','ownerCopyEbayPurchaseMessage',PURCHASE_MESSAGE,390)}
      ${messageCard('After Shipped','Send after the order has shipped and tracking has been uploaded.','ownerEbayAfterShippedMessage','ownerCopyEbayAfterShippedMessage',AFTER_SHIPPED_MESSAGE,330)}
    </div>`;
    addEbayCategory(true);
    const subnav=appContext.view.querySelector('.inventory-tools-subnav');
    if(subnav) subnav.innerHTML='<a class="active" href="#/inventory-tools?mode=ebay&sub=messages">eBay Messages</a>';
    copyHandler('ownerCopyEbayPurchaseMessage','ownerEbayPurchaseMessage',PURCHASE_MESSAGE);
    copyHandler('ownerCopyEbayAfterShippedMessage','ownerEbayAfterShippedMessage',AFTER_SHIPPED_MESSAGE);
  }

  appContext.renderInventoryToolsPage=function(){
    const params=appContext.currentHashParams();
    if(params.get('mode')==='ebay'){
      renderEbayMessages();
      return;
    }
    if(previousRender) previousRender();
    cleanActivityMessagesLink();
    addEbayCategory(false);
  };
  appContext.renderOwnerDashboard=appContext.renderInventoryToolsPage;
}
