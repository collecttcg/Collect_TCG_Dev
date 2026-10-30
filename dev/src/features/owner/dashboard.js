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

  function unassignedOwnerCards(){
    if(!appContext.isOwnerMode()) return [];
    return (appContext.cards||[]).filter(card=>
      appContext.isLiveLifecycle(card) &&
      appContext.normalizeFilterValue(card.availability||"Available")!=="sold" &&
      !appContext.sanitizeOwnerCategory?.(card._owner_category||"")
    );
  }

  function addUnassignedOwnersLink(){
    const subnav=appContext.view?.querySelector?.('.inventory-tools-subnav');
    if(!subnav || subnav.querySelector('[data-owner-unassigned]')) return;
    const count=unassignedOwnerCards().length;
    const link=document.createElement('a');
    link.href='#/inventory-tools?mode=bulk&sub=unassigned';
    link.dataset.ownerUnassigned='true';
    link.textContent=`Unassigned Owners (${count})`;
    subnav.appendChild(link);
  }

  function addBuyerMessagesLink(){
    const subnav=appContext.view?.querySelector?.('.inventory-tools-subnav');
    if(!subnav || subnav.querySelector('[data-owner-buyer-messages]')) return;
    const link=document.createElement('a');
    link.href='#/inventory-tools?mode=activity&sub=buyer-messages';
    link.dataset.ownerBuyerMessages='true';
    link.textContent='Buyer Messages';
    subnav.appendChild(link);
  }

  function renderUnassignedOwners(){
    if(!appContext.requireOwner("manage unassigned card owners")) return;
    const cards=unassignedOwnerCards();
    const ownerOptions=(appContext.OWNER_CATEGORIES||[]).map(name=>
      `<option value="${appContext.escapeHtml(name)}">${appContext.escapeHtml(name)}</option>`
    ).join('');

    appContext.view.innerHTML=`
      <div class="inventory-tools-page">
        <div class="eyebrow">Owner Tools</div>
        <h2>Inventory Tools</h2>
        <p class="muted">Find active inventory without an assigned owner and assign it here.</p>
        ${appContext.inventoryToolsSwitcher?.('bulk','unassigned')||''}
        <section class="panel" style="margin-top:22px;">
          <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px;">
            <div>
              <div class="eyebrow">Card Ownership</div>
              <h3 style="margin:6px 0;">Unassigned Owners</h3>
              <p class="muted" style="margin:0;"><strong id="unassignedOwnerCount">${cards.length.toLocaleString()}</strong> active listing${cards.length===1?'':'s'} without an assigned owner.</p>
            </div>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
              <select id="unassignedOwnerValue" ${appContext.ownerPrivateSupported?'':'disabled'}>
                <option value="">Choose owner…</option>
                ${ownerOptions}
              </select>
              <button type="button" class="btn-primary" id="unassignedOwnerApply" disabled>Assign Selected</button>
            </div>
          </div>
          <div id="unassignedOwnerStatus" class="hint" style="margin-bottom:14px;">Select one or more listings, choose an owner, then assign.</div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="unassignedOwnerSelectAll"> <span>Select all</span></label>
          </div>
          <div id="unassignedOwnerList" class="quality-list">
            ${cards.length ? cards.map(card=>{
              const image=appContext.getImages(card)[0]||'';
              const meta=[card.card_code,card.year,card.game,card.series].filter(Boolean).join(' · ')||'No listing metadata';
              return `<article class="quality-row has-issues" data-unassigned-owner-row="${appContext.escapeHtml(card.id)}">
                <div style="display:flex;align-items:center;padding:0 6px;"><input type="checkbox" data-unassigned-owner-id="${appContext.escapeHtml(card.id)}" aria-label="Select ${appContext.escapeHtml(card.name||'card')}"></div>
                <div class="quality-row-image">${image?`<img src="${appContext.escapeHtml(image)}" alt="">`:`<span>No image</span>`}</div>
                <div class="quality-row-main">
                  <div class="quality-row-title"><strong>${appContext.escapeHtml(card.name||'Untitled card')}</strong><span>${appContext.escapeHtml(card.availability||'Available')}</span></div>
                  <div class="quality-row-meta">${appContext.escapeHtml(meta)}</div>
                  <div class="quality-row-issues"><span class="quality-issue critical">Owner unassigned</span></div>
                </div>
                <div class="quality-row-actions"><button type="button" class="btn-ghost" data-unassigned-owner-view="${appContext.escapeHtml(card.id)}">View</button><button type="button" class="btn-primary" data-unassigned-owner-edit="${appContext.escapeHtml(card.id)}">Edit</button></div>
              </article>`;
            }).join('') : `<div class="empty compact"><strong>All active inventory has an owner.</strong><span>No unassigned cards found.</span></div>`}
          </div>
        </section>
      </div>`;

    const subnav=appContext.view.querySelector('.inventory-tools-subnav');
    if(subnav){
      const link=document.createElement('a');
      link.href='#/inventory-tools?mode=bulk&sub=unassigned';
      link.className='active';
      link.dataset.ownerUnassigned='true';
      link.textContent=`Unassigned Owners (${cards.length})`;
      subnav.appendChild(link);
    }

    const list=appContext.$('unassignedOwnerList');
    const selectAll=appContext.$('unassignedOwnerSelectAll');
    const ownerSelect=appContext.$('unassignedOwnerValue');
    const applyButton=appContext.$('unassignedOwnerApply');
    const status=appContext.$('unassignedOwnerStatus');

    const selectedInputs=()=>Array.from(list?.querySelectorAll('[data-unassigned-owner-id]:checked')||[]);
    const sync=()=>{
      const total=list?.querySelectorAll('[data-unassigned-owner-id]').length||0;
      const selected=selectedInputs().length;
      if(selectAll){
        selectAll.checked=total>0 && selected===total;
        selectAll.indeterminate=selected>0 && selected<total;
        selectAll.disabled=total===0;
      }
      if(applyButton) applyButton.disabled=!appContext.ownerPrivateSupported || !ownerSelect?.value || selected===0;
    };

    selectAll?.addEventListener('change',()=>{
      list?.querySelectorAll('[data-unassigned-owner-id]').forEach(input=>{ input.checked=selectAll.checked; });
      sync();
    });
    list?.addEventListener('change',event=>{
      if(event.target.matches('[data-unassigned-owner-id]')) sync();
    });
    ownerSelect?.addEventListener('change',sync);

    list?.querySelectorAll('[data-unassigned-owner-view]').forEach(button=>button.addEventListener('click',()=>{
      const card=appContext.getCardById(button.dataset.unassignedOwnerView);
      if(card) appContext.openCardRoute(card.id);
    }));
    list?.querySelectorAll('[data-unassigned-owner-edit]').forEach(button=>button.addEventListener('click',()=>{
      const card=appContext.getCardById(button.dataset.unassignedOwnerEdit);
      if(card && appContext.requireOwner('edit unassigned owner listing')) appContext.openEditModal(card);
    }));

    applyButton?.addEventListener('click',async()=>{
      if(!appContext.requireOwner('assign card owner')) return;
      const ids=selectedInputs().map(input=>appContext.safeCardId(input.dataset.unassignedOwnerId)).filter(Boolean);
      const category=appContext.sanitizeOwnerCategory?.(ownerSelect?.value||'')||'';
      if(!ids.length || !category) return;
      if(!confirm(`Assign ${category} to ${ids.length} selected listing${ids.length===1?'':'s'}?`)) return;

      const originalText=applyButton.textContent;
      applyButton.disabled=true;
      applyButton.textContent='Assigning…';
      try{
        const result=await appContext.bulkAssignOwnerCategory(ids,category);
        ids.forEach(id=>list?.querySelector(`[data-unassigned-owner-row="${CSS.escape(id)}"]`)?.remove());
        const remaining=unassignedOwnerCards().length;
        const countEl=appContext.$('unassignedOwnerCount');
        if(countEl) countEl.textContent=remaining.toLocaleString();
        if(status) status.textContent=`${result.saved} listing${result.saved===1?'':'s'} assigned to ${category}.`;
        appContext.showToast(`Assigned ${result.saved} listing${result.saved===1?'':'s'} to ${category}`);
        if(!remaining && list) list.innerHTML='<div class="empty compact"><strong>All active inventory has an owner.</strong><span>No unassigned cards found.</span></div>';
      }catch(error){
        console.error('Unassigned Card Owner update failed:',error);
        const detail=String(error?.message||error?.details||error?.hint||'').trim();
        if(status) status.textContent=detail ? `Owner assignment failed: ${detail}` : 'Owner assignment failed.';
        appContext.showToast('Could not assign Card Owner');
      }finally{
        applyButton.textContent=originalText;
        sync();
      }
    });
    sync();
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
        <section class="card" style="box-sizing:border-box;width:min(100%,920px);margin-top:22px;padding:24px;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:18px;">
            <div style="min-width:0;flex:1 1 420px;">
              <div class="eyebrow">eBay</div>
              <h3 style="margin:6px 0 6px;">Thank You After Purchase</h3>
              <p class="muted" style="margin:0;">Send after a buyer completes a purchase.</p>
            </div>
            <button class="btn-primary" id="ownerCopyBuyerMessage" type="button" style="flex:0 0 auto;min-width:140px;">Copy Message</button>
          </div>
          <textarea id="ownerBuyerMessageText" readonly style="box-sizing:border-box;display:block;width:100%;min-height:390px;resize:vertical;padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--text);font:inherit;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere;">${message}</textarea>
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
    if(params.get('mode')==='bulk' && params.get('sub')==='unassigned'){
      renderUnassignedOwners();
      return;
    }
    if(params.get('mode')==='activity' && params.get('sub')==='buyer-messages'){
      renderBuyerMessages();
      return;
    }
    if(renderInventoryToolsPage){
      renderInventoryToolsPage();
      if(params.get('mode')==='activity') addBuyerMessagesLink();
      if((params.get('mode')||'bulk')==='bulk') addUnassignedOwnersLink();
      return;
    }
    appContext.view.innerHTML='<div class="empty"><strong>Inventory Tools unavailable.</strong><span>The established Owner inventory workspace could not be loaded.</span></div>';
  }

  appContext.renderInventoryToolsPage=renderOwnerInventoryTools;
  appContext.renderOwnerDashboard=renderOwnerInventoryTools;
}
