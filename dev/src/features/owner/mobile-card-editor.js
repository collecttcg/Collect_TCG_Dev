/** Owner-only standalone card manager for authenticated mobile sessions. */
export function register(appContext){
  const ROUTE="mobile-card-editor";
  const originalRouter=appContext.router;
  const originalIsOwnerMode=appContext.isOwnerMode;
  const originalOpenOwnerAccess=appContext.openOwnerAccess;

  function isStandaloneMobileEditorRoute(){
    return appContext.currentRoute()===ROUTE;
  }

  function isStandaloneMobileCloneRoute(){
    return appContext.currentRoute()==="add" &&
      appContext.currentHashParams?.().get("clone")==="1" &&
      !!appContext.pendingCloneCard;
  }

  // Preserve the existing mobile public/owner boundary everywhere except this
  // explicit owner-only manager and its in-memory clone handoff. Supabase owner
  // verification is still required.
  appContext.isOwnerMode=function(){
    if(isStandaloneMobileEditorRoute() || isStandaloneMobileCloneRoute()){
      return appContext.isOwnerAuthenticated() && !appContext.isOwnerBuyerPreview();
    }
    return originalIsOwnerMode();
  };

  appContext.openOwnerAccess=async function(){
    await originalOpenOwnerAccess();
    if(!isStandaloneMobileEditorRoute() || !appContext.isOwnerAuthenticated()) return;
    const loaded=await appContext.loadCards();
    if(!loaded && !appContext.cards.length){
      appContext.renderCatalogueLoadError();
      return;
    }
    appContext.applyOwnerMode();
    renderMobileCardEditorPage();
  };

  function installStyles(){
    if(document.getElementById("mobileOwnerCardEditorStyles")) return;
    const style=document.createElement("style");
    style.id="mobileOwnerCardEditorStyles";
    style.textContent=`
      .mobile-owner-card-editor{max-width:760px;margin:0 auto;padding:16px 14px 40px}
      .mobile-owner-card-editor .page-head{margin-bottom:14px}
      .mobile-owner-card-editor-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 18px}
      .mobile-owner-card-editor-actions button{min-height:48px}
      .mobile-owner-card-editor-search{width:100%;min-height:48px;margin:0 0 12px}
      .mobile-owner-card-editor-list{display:grid;gap:9px}
      .mobile-owner-card-editor-item{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--panel)}
      .mobile-owner-card-editor-item img{width:58px;height:76px;object-fit:cover;border-radius:8px;background:var(--panel-2)}
      .mobile-owner-card-editor-item strong,.mobile-owner-card-editor-item span{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .mobile-owner-card-editor-item span{font-size:12px;opacity:.72;margin-top:3px}
      .mobile-owner-card-editor-item-actions{display:grid;gap:6px}
      .mobile-owner-card-editor-item-actions button{min-height:42px;min-width:64px}
      .mobile-owner-card-editor-empty{padding:24px 12px;text-align:center;opacity:.75}
      .mobile-owner-card-editor-back{margin:0 0 12px}
      body.mobile-owner-card-editor-editing #modalOverlay{display:block!important;position:fixed;inset:0;z-index:10000;overflow:auto;background:var(--bg);padding:0;-webkit-overflow-scrolling:touch}
      body.mobile-owner-card-editor-editing #modalOverlay>.modal{display:block;position:relative;width:min(100%,760px);max-width:none;min-height:100dvh;margin:0 auto;border:0;border-radius:0;padding:16px 14px 96px;box-shadow:none;background:var(--bg)}
      body.mobile-owner-card-editor-editing #editForm>.modal-actions{position:sticky;bottom:0;z-index:3;padding:10px 0 max(10px,env(safe-area-inset-bottom));background:var(--bg);border-top:1px solid var(--line)}
      body.mobile-owner-card-editor-editing .image-preview-box{touch-action:pan-y}
      body.mobile-owner-card-editor-editing .image-drag-handle{touch-action:none;cursor:grab}
      @media (min-width:801px){.mobile-owner-card-editor{padding-top:24px}}
    `;
    document.head.appendChild(style);
  }

  function cardSearchText(card){
    return [card?.name,card?.game,card?.series,card?.card_number,card?.card_code,card?.availability]
      .filter(Boolean).join(" ").toLowerCase();
  }

  function renderCardRows(query=""){
    const mount=document.getElementById("mobileOwnerCardEditorList");
    if(!mount) return;
    const needle=String(query||"").trim().toLowerCase();
    const cards=(appContext.cards||[])
      .filter(card=>!needle || cardSearchText(card).includes(needle))
      .slice()
      .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")))
      .slice(0,100);

    mount.innerHTML="";
    if(!cards.length){
      const empty=document.createElement("div");
      empty.className="mobile-owner-card-editor-empty";
      empty.textContent=needle ? "No matching cards." : "No cards available to edit.";
      mount.appendChild(empty);
      return;
    }

    cards.forEach(card=>{
      const row=document.createElement("div");
      row.className="mobile-owner-card-editor-item";
      const image=document.createElement("img");
      const images=appContext.getImages(card);
      if(images?.[0]) image.src=images[0];
      image.alt="";
      image.loading="lazy";

      const copy=document.createElement("div");
      const name=document.createElement("strong");
      name.textContent=card.name||"Untitled card";
      const meta=document.createElement("span");
      meta.textContent=[card.game,card.card_code||card.card_number,card.availability].filter(Boolean).join(" · ");
      copy.append(name,meta);

      const actions=document.createElement("div");
      actions.className="mobile-owner-card-editor-item-actions";

      const edit=document.createElement("button");
      edit.type="button";
      edit.className="btn-primary";
      edit.textContent="Edit";
      edit.addEventListener("click",async()=>{
        if(!appContext.isOwnerMode()) return;
        document.body.classList.add("mobile-owner-card-editor-editing");
        await appContext.openEditModal(card);
      });

      const clone=document.createElement("button");
      clone.type="button";
      clone.className="btn-ghost";
      clone.textContent="Clone";
      clone.addEventListener("click",()=>{
        if(!appContext.requireOwner("clone card")) return;
        appContext.openCloneOptions(card);
      });

      actions.append(edit,clone);
      row.append(image,copy,actions);
      mount.appendChild(row);
    });
  }

  function renderMobileCardEditorPage(){
    installStyles();
    if(!appContext.isOwnerAuthenticated()){
      appContext.view.innerHTML=`
        <section class="mobile-owner-card-editor">
          <div class="page-head"><div><div class="eyebrow">Owner Tool</div><h2>Card Manager</h2><p>Sign in to add or edit cards from this device.</p></div></div>
          <button type="button" class="btn-primary" id="mobileOwnerCardEditorLogin">Owner login</button>
        </section>`;
      document.getElementById("mobileOwnerCardEditorLogin")?.addEventListener("click",()=>appContext.openOwnerAccess());
      return;
    }

    appContext.applyOwnerMode();
    appContext.view.innerHTML=`
      <section class="mobile-owner-card-editor">
        <div class="page-head"><div><div class="eyebrow">Owner Tool</div><h2>Card Manager</h2><p>Add a new card or find an existing card to edit or clone.</p></div></div>
        <div class="mobile-owner-card-editor-actions">
          <button type="button" class="btn-primary" id="mobileOwnerAddCard">+ Add card</button>
          <button type="button" class="btn-ghost" id="mobileOwnerRefreshCards">Refresh</button>
        </div>
        <input class="mobile-owner-card-editor-search" id="mobileOwnerCardSearch" type="search" autocomplete="off" placeholder="Search name, game, card number…" aria-label="Search cards to edit">
        <div class="mobile-owner-card-editor-list" id="mobileOwnerCardEditorList"></div>
      </section>`;

    document.getElementById("mobileOwnerAddCard")?.addEventListener("click",()=>{
      appContext.renderAddPage();
      const form=appContext.view.querySelector("#addForm");
      if(form){
        const back=document.createElement("button");
        back.type="button";
        back.className="btn-ghost mobile-owner-card-editor-back";
        back.textContent="← Card Manager";
        back.addEventListener("click",renderMobileCardEditorPage);
        form.parentElement?.insertBefore(back,form);
      }
    });
    document.getElementById("mobileOwnerRefreshCards")?.addEventListener("click",async()=>{
      const loaded=await appContext.loadCards();
      if(loaded) renderMobileCardEditorPage();
    });
    document.getElementById("mobileOwnerCardSearch")?.addEventListener("input",event=>renderCardRows(event.target.value));
    renderCardRows();
  }

  appContext.router=function(){
    if(isStandaloneMobileEditorRoute()){
      renderMobileCardEditorPage();
      return;
    }
    document.body.classList.remove("mobile-owner-card-editor-editing");
    return originalRouter();
  };

  Object.assign(appContext,{isStandaloneMobileEditorRoute,isStandaloneMobileCloneRoute,renderMobileCardEditorPage});
}

export function initialize(appContext){
  const originalClose=appContext.closeEditModal;
  appContext.closeEditModal=function(options){
    // The shared editor may update/rerender routing as part of its save flow.
    // Capture the standalone state from the body marker as well as the hash so
    // a successful mobile edit always returns to Card Manager, never Inventory.
    const standalone=appContext.isStandaloneMobileEditorRoute?.() ||
      document.body.classList.contains("mobile-owner-card-editor-editing");
    const result=originalClose(options);
    document.body.classList.remove("mobile-owner-card-editor-editing");
    if(standalone){
      if(location.hash!=="#/mobile-card-editor"){
        history.replaceState(null,"","#/mobile-card-editor");
      }
      appContext.renderMobileCardEditorPage();
    }
    return result;
  };

  // In the standalone mobile editor, ordinary vertical swipes over a photo
  // should scroll the form. Reordering begins only from the visible ☰ handle.
  document.addEventListener("pointerdown",event=>{
    if(!document.body.classList.contains("mobile-owner-card-editor-editing")) return;
    const box=event.target.closest?.(".image-preview-box[data-image-index]");
    if(!box || event.target.closest?.("button,.image-drag-handle")) return;
    event.stopPropagation();
  },true);
}
