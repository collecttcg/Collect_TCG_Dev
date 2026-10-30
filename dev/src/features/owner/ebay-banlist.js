/** Owner-only shared eBay ban list. Data access is additionally protected by Supabase RLS. */
const EBAY_BLOCKED_BUYERS_URL="https://www.ebay.com/bmgt/BuyerBlock";
const EBAY_ACCOUNT_URLS=[
  "https://www.ebay.com/usr/COLLECT_TCG_1",
  "https://www.ebay.co.uk/str/collecttcg2",
  "https://www.ebay.co.uk/usr/collect_tcg_3",
  "https://www.ebay.co.uk/usr/collect_tcg_4"
];

function escapeHtml(value){
  return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
}

function normalizeUsername(value){
  return String(value||"").trim().replace(/^@+/,"");
}

export function register(appContext){
  async function loadEbayBanlist(){
    if(!appContext.isOwnerMode()) return [];
    const {data,error}=await appContext.supabaseClient
      .from("ebay_banlist")
      .select("id,ebay_username,reason,created_at,updated_at")
      .order("ebay_username",{ascending:true});
    if(error) throw error;
    return Array.isArray(data)?data:[];
  }

  async function renderEbayBanlistPage(){
    if(!appContext.isOwnerMode()){
      appContext.showToast?.("Owner login required");
      location.hash="#/home";
      return;
    }

    appContext.view.innerHTML=`<section class="ebay-banlist-page"><div class="ebay-banlist-loading" role="status">Loading shared eBay ban list…</div></section>`;

    let rows=[];
    let loadError=null;
    try{ rows=await loadEbayBanlist(); }
    catch(error){ loadError=error; console.error("eBay ban list load error:",error); }

    if(appContext.currentRoute()!=="ebay-banlist") return;

    const accountLinks=EBAY_ACCOUNT_URLS.map((url,index)=>`
      <a class="ebay-banlist-account" href="${url}" target="_blank" rel="noopener noreferrer">
        <strong>eBay Account ${index+1}</strong><span>Open eBay Account ↗</span>
      </a>`).join("");

    const tableRows=rows.map(row=>`
      <tr data-ban-id="${escapeHtml(row.id)}">
        <td><strong>${escapeHtml(row.ebay_username)}</strong></td>
        <td>${escapeHtml(row.reason||"—")}</td>
        <td>${escapeHtml(row.created_at?new Date(row.created_at).toLocaleDateString():"—")}</td>
        <td class="ebay-banlist-actions">
          <button type="button" class="btn-secondary" data-copy-ban="${escapeHtml(row.ebay_username)}">Copy</button>
          <button type="button" class="btn-secondary" data-edit-ban>Edit</button>
          <button type="button" class="btn-secondary ebay-banlist-remove" data-remove-ban>Remove</button>
        </td>
      </tr>`).join("");

    appContext.view.innerHTML=`
      <section class="ebay-banlist-page">
        <header class="ebay-banlist-header">
          <div><p class="eyebrow">OWNER ONLY</p><h2>eBay Ban List</h2><p>One shared master list for all four Collect TCG eBay accounts.</p></div>
          <div class="ebay-banlist-count"><strong>${rows.length}</strong><span>blocked ${rows.length===1?"buyer":"buyers"}</span></div>
        </header>

        <div class="ebay-banlist-account-grid">${accountLinks}</div>
        <p class="ebay-banlist-hint">Open the eBay account you want to update, then manage its blocked buyers while signed in to that account. The website remains the master list.</p>

        ${loadError?`<div class="ebay-banlist-error" role="alert"><strong>Ban list database is not available yet.</strong><span>Apply the Development v07 SQL migration, then reload this page.</span></div>`:""}

        <form class="ebay-banlist-form" id="ebayBanlistForm">
          <label><span>eBay username</span><input name="username" maxlength="100" autocomplete="off" placeholder="Buyer username" required></label>
          <label><span>Reason / note <small>(optional)</small></span><input name="reason" maxlength="500" autocomplete="off" placeholder="Why this buyer is blocked"></label>
          <button type="submit" class="btn-primary" ${loadError?"disabled":""}>Add to master list</button>
        </form>

        <div class="ebay-banlist-toolbar">
          <label class="ebay-banlist-search"><span class="sr-only">Search ban list</span><input id="ebayBanlistSearch" type="search" placeholder="Search username or reason…"></label>
          <button type="button" class="btn-secondary" id="copyAllEbayBanlist" ${rows.length?"":"disabled"}>Copy all usernames</button>
        </div>

        <div class="ebay-banlist-table-wrap">
          <table class="ebay-banlist-table">
            <thead><tr><th>eBay username</th><th>Reason / note</th><th>Added</th><th>Actions</th></tr></thead>
            <tbody>${tableRows || `<tr class="ebay-banlist-empty"><td colspan="4">${loadError?"Ban list unavailable.":"No buyers are on the shared ban list yet."}</td></tr>`}</tbody>
          </table>
        </div>
      </section>`;
  }

  const originalRouter=appContext.router;
  appContext.router=function ebayBanlistRouter(){
    if(appContext.currentRoute()==="ebay-banlist"){
      renderEbayBanlistPage();
      appContext.setNavigationActiveRoute?.("ebay-banlist");
      return;
    }
    return originalRouter.apply(this,arguments);
  };

  const originalShouldHighlightMore=appContext.shouldHighlightMore;
  appContext.shouldHighlightMore=function ebayBanlistHighlight(route){
    if(appContext.routeBase(route)==="ebay-banlist") return true;
    return originalShouldHighlightMore(route);
  };

  Object.assign(appContext,{loadEbayBanlist,renderEbayBanlistPage});
}

export function initialize(appContext){
  if(typeof document==="undefined") return;

  const style=document.createElement("link");
  style.rel="stylesheet";
  style.href="./src/styles/31-ebay-banlist.css?v=2026-10-25-v07";
  style.id="ebayBanlistStyles";
  if(!document.getElementById(style.id)) document.head.appendChild(style);

  const addNavLink=(container,beforeSelector="")=>{
    if(!container || container.querySelector('[data-route="ebay-banlist"]')) return;
    const link=document.createElement("a");
    link.href="#/ebay-banlist";
    link.dataset.route="ebay-banlist";
    link.className="owner-only";
    link.hidden=true;
    link.innerHTML='<span class="ic">⊘</span><span>eBay Ban List</span>';
    const before=beforeSelector?container.querySelector(beforeSelector):null;
    if(before?.parentNode) before.parentNode.insertBefore(link,before); else container.appendChild(link);
  };

  addNavLink(document.getElementById("premiumDesktopMoreMenu"),'[data-route="export"]');
  addNavLink(document.getElementById("mainnav"),'[data-route="export"]');
  appContext.applyOwnerMode?.();

  appContext.view.addEventListener("submit",async event=>{
    const form=event.target.closest("#ebayBanlistForm");
    if(!form) return;
    event.preventDefault();
    if(!appContext.requireOwner("manage the eBay ban list")) return;

    const username=normalizeUsername(new FormData(form).get("username"));
    const reason=String(new FormData(form).get("reason")||"").trim();
    if(!username){ appContext.showToast("Enter an eBay username"); return; }

    const submit=form.querySelector('button[type="submit"]');
    submit.disabled=true;
    const {error}=await appContext.supabaseClient.from("ebay_banlist").insert({
      ebay_username:username,
      reason:reason||null,
      created_by:appContext.ownerSession?.user?.id||null,
      updated_by:appContext.ownerSession?.user?.id||null
    });
    if(error){
      console.error("eBay ban list add error:",error);
      appContext.showToast(error.code==="23505"?"That username is already on the ban list":"Could not add buyer");
      submit.disabled=false;
      return;
    }
    appContext.showToast("Buyer added to shared ban list");
    await appContext.renderEbayBanlistPage();
  });

  appContext.view.addEventListener("input",event=>{
    if(event.target.id!=="ebayBanlistSearch") return;
    const query=event.target.value.trim().toLowerCase();
    appContext.view.querySelectorAll(".ebay-banlist-table tbody tr[data-ban-id]").forEach(row=>{
      row.hidden=!!query && !row.textContent.toLowerCase().includes(query);
    });
  });

  appContext.view.addEventListener("click",async event=>{
    const copyButton=event.target.closest("[data-copy-ban]");
    if(copyButton){
      await navigator.clipboard.writeText(copyButton.dataset.copyBan||"");
      appContext.showToast("Username copied");
      return;
    }

    if(event.target.closest("#copyAllEbayBanlist")){
      if(!appContext.requireOwner("copy the eBay ban list")) return;
      try{
        const rows=await appContext.loadEbayBanlist();
        await navigator.clipboard.writeText(rows.map(row=>row.ebay_username).join(", "));
        appContext.showToast("Full ban list copied");
      }catch(error){ console.error(error); appContext.showToast("Could not copy ban list"); }
      return;
    }

    const row=event.target.closest("tr[data-ban-id]");
    if(!row) return;
    const id=row.dataset.banId;

    if(event.target.closest("[data-edit-ban]")){
      if(!appContext.requireOwner("edit the eBay ban list")) return;
      const currentUser=row.children[0]?.textContent?.trim()||"";
      const currentReason=row.children[1]?.textContent?.trim()==="—"?"":row.children[1]?.textContent?.trim()||"";
      const username=normalizeUsername(window.prompt("eBay username",currentUser));
      if(!username) return;
      const reason=window.prompt("Reason / note (optional)",currentReason);
      if(reason===null) return;
      const {error}=await appContext.supabaseClient.from("ebay_banlist").update({
        ebay_username:username,
        reason:String(reason).trim()||null,
        updated_at:new Date().toISOString(),
        updated_by:appContext.ownerSession?.user?.id||null
      }).eq("id",id);
      if(error){ console.error(error); appContext.showToast(error.code==="23505"?"That username is already on the ban list":"Could not update buyer"); return; }
      appContext.showToast("Ban list entry updated");
      await appContext.renderEbayBanlistPage();
      return;
    }

    if(event.target.closest("[data-remove-ban]")){
      if(!appContext.requireOwner("remove from the eBay ban list")) return;
      const username=row.children[0]?.textContent?.trim()||"this buyer";
      if(!appContext.confirmOwnerAction(`Remove ${username} from the shared eBay ban list?`)) return;
      const {error}=await appContext.supabaseClient.from("ebay_banlist").delete().eq("id",id);
      if(error){ console.error(error); appContext.showToast("Could not remove buyer"); return; }
      appContext.showToast("Buyer removed from shared ban list");
      await appContext.renderEbayBanlistPage();
    }
  });
}
