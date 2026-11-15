/** Module: features/content/reviews. Shared dependencies are explicit on appContext. */
const REVIEWS_PER_PAGE=10;
const EBAY_FEEDBACK_BATCH_SIZE=250;

export function register(appContext){
function reviewStars(rating){
    const value=Math.max(1,Math.min(5,Number(rating)||1));
    return `${"★".repeat(value)}${"☆".repeat(5-value)}`;
  }

function reviewCountryLabel(value){
    const safe=String(value||"").trim();
    const match=appContext.REVIEW_COUNTRIES.find(([code])=>code===safe);
    return match ? match[1] : "";
  }

function reviewCountryOptions(){
    const priority=new Set(["MY","SG","JP","KR","US","GB","AU","CN","HK","TW","TH","ID","PH","VN"]);
    const primary=appContext.REVIEW_COUNTRIES.filter(([code])=>priority.has(code));
    const rest=appContext.REVIEW_COUNTRIES.filter(([code])=>!priority.has(code) && code!=="Other");

    const option=([code,label])=>`<option value="${appContext.escapeHtml(code)}">${appContext.escapeHtml(label)}</option>`;

    return [
      ...primary.map(option),
      `<option disabled>──────────</option>`,
      ...rest.map(option),
      `<option value="Other">Other</option>`
    ].join("");
  }

function reviewDateLabel(value){
    if(!value) return "";
    const d=new Date(value);
    if(Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US",{
      year:"numeric",
      month:"short",
      day:"numeric"
    }).format(d);
  }

function reviewRpcUnavailable(error,name){
    const message=`${error?.message||""} ${error?.details||""}`.toLowerCase();
    return message.includes(String(name||"").toLowerCase()) ||
      message.includes("schema cache") ||
      message.includes("could not find the function");
  }

async function loadPublicReviews(){
    const {data,error}=await appContext.supabaseClient.rpc("get_public_reviews");
    if(error){
      if(appContext.reviewRpcUnavailable(error,"get_public_reviews")){
        appContext.reviewBackendState="missing";
      }else{
        console.error("Load public reviews error:",error);
        appContext.reviewBackendState="error";
      }
      appContext.publicReviews=[];
      return false;
    }

    appContext.reviewBackendState="ready";
    appContext.publicReviews=Array.isArray(data)?data:[];
    return true;
  }

async function loadOwnerReviewSubmissions(){
    if(!appContext.isOwnerMode()){
      appContext.ownerReviewSubmissions=[];
      return true;
    }

    const {data,error}=await appContext.supabaseClient.rpc("get_review_submissions");
    if(error){
      if(!appContext.reviewRpcUnavailable(error,"get_review_submissions")){
        console.error("Load review submissions error:",error);
      }
      appContext.ownerReviewSubmissions=[];
      return false;
    }

    appContext.ownerReviewSubmissions=Array.isArray(data)?data:[];
    return true;
  }

function approvedReviewSummary(){
    const rows=appContext.publicReviews;
    const count=rows.length;
    const average=count
      ? rows.reduce((sum,row)=>sum+Number(row.rating||0),0)/count
      : 0;
    const verified=rows.filter(row=>row.verified_buyer===true).length;
    return {count,average,verified};
  }

function reviewPublicCardHtml(review){
    const item=String(review.item_reference||"").trim();
    const country=appContext.reviewCountryLabel(review.country);
    return `
      <article class="review-card">
        <div class="review-card-top">
          <div>
            <div class="review-stars" aria-label="${appContext.escapeHtml(`${review.rating} out of 5 stars`)}">${appContext.reviewStars(review.rating)}</div>
            <div class="reviewer-line">
              <strong>${appContext.escapeHtml(review.display_name||"Collector")}</strong>
              ${review.verified_buyer ? `<span class="review-verified-badge">✓ Verified Buyer</span>` : ""}
            </div>
          </div>
          <time>${appContext.escapeHtml(appContext.reviewDateLabel(review.approved_at||review.created_at))}</time>
        </div>

        <p class="review-text">${appContext.escapeHtml(review.review_text||"")}</p>

        ${(item||country) ? `
          <div class="review-meta-row">
            ${item ? `<span>Item: ${appContext.escapeHtml(item)}</span>` : ""}
            ${country ? `<span>${appContext.escapeHtml(country)}</span>` : ""}
          </div>
        ` : ""}
      </article>
    `;
  }

function reviewModerationCardHtml(review){
    const status=String(review.status||"pending").toLowerCase();
    return `
      <article class="review-moderation-card" data-review-admin-card="${appContext.escapeHtml(review.id)}">
        <div class="review-moderation-head">
          <div>
            <div class="review-stars">${appContext.reviewStars(review.rating)}</div>
            <strong>${appContext.escapeHtml(review.display_name||"Collector")}</strong>
          </div>
          <span class="review-status review-status-${appContext.escapeHtml(status)}">${appContext.escapeHtml(status.toUpperCase())}</span>
        </div>

        <p>${appContext.escapeHtml(review.review_text||"")}</p>

        <div class="review-moderation-meta">
          ${review.item_reference ? `<span>Item: ${appContext.escapeHtml(review.item_reference)}</span>` : ""}
          ${review.country ? `<span>${appContext.escapeHtml(appContext.reviewCountryLabel(review.country))}</span>` : ""}
          <span>${appContext.escapeHtml(appContext.reviewDateLabel(review.created_at))}</span>
          ${review.verified_buyer ? `<span class="review-verified-badge">✓ Verified Buyer</span>` : ""}
        </div>

        <div class="review-moderation-actions">
          <button type="button" class="btn-primary" data-review-action="approve" data-review-id="${appContext.escapeHtml(review.id)}">Approve</button>
          <button type="button" class="btn-ghost" data-review-verified="${appContext.escapeHtml(review.id)}">
            ${review.verified_buyer ? "Remove Verified" : "Mark Verified"}
          </button>
          <button type="button" class="btn-ghost" data-review-action="hide" data-review-id="${appContext.escapeHtml(review.id)}">Hide</button>
          <button type="button" class="btn-ghost review-reject-btn" data-review-action="reject" data-review-id="${appContext.escapeHtml(review.id)}">Reject</button>
          <button type="button" class="btn-ghost review-delete-btn" data-review-delete="${appContext.escapeHtml(review.id)}">Delete</button>
        </div>
      </article>
    `;
  }

function reviewSubmitErrorMessage(code){
    const value=String(code||"").toLowerCase();
    const messages={
      "invalid_name":"Please enter a display name between 2 and 60 characters.",
      "invalid_rating":"Please choose a rating from 1 to 5 stars.",
      "invalid_review":"Please write a review between 10 and 500 characters.",
      "invalid_item":"The item / transaction reference is too long.",
      "invalid_country":"Please choose a valid country.",
      "link_not_allowed":"Please remove website links from the review text.",
      "pending_exists":"You already have a review waiting for approval.",
      "rate_limited":"We’ve already received a recent review. Please try again later.",
      "duplicate":"This looks like a duplicate review.",
      "owner_blocked":"Owner Mode cannot submit public reviews."
    };
    return messages[value] || "Could not submit the review. Please try again later.";
  }

async function submitPublicReview(form){
    const displayName=String(form.elements.display_name?.value||"").trim();
    const rating=Number(form.elements.rating?.value||0);
    const reviewText=String(form.elements.review_text?.value||"").trim();
    const itemReference=String(form.elements.item_reference?.value||"").trim();
    const country=String(form.elements.country?.value||"").trim();
    const honeypot=String(form.elements.website?.value||"").trim();

    // Bot honeypot: behave like a successful submission without sending data.
    if(honeypot){
      form.reset();
      appContext.showToast("Review submitted for moderation");
      return;
    }

    if(displayName.length<2 || displayName.length>appContext.REVIEW_NAME_MAX){
      appContext.showToast("Please enter a display name between 2 and 60 characters.");
      return;
    }
    if(!Number.isInteger(rating) || rating<1 || rating>5){
      appContext.showToast("Please choose a star rating.");
      return;
    }
    if(reviewText.length<appContext.REVIEW_TEXT_MIN || reviewText.length>appContext.REVIEW_TEXT_MAX){
      appContext.showToast(`Review must be ${appContext.REVIEW_TEXT_MIN}–${appContext.REVIEW_TEXT_MAX} characters.`);
      return;
    }
    if(/https?:\/\/|www\./i.test(reviewText)){
      appContext.showToast("Please remove website links from the review text.");
      return;
    }

    const submitBtn=form.querySelector('[type="submit"]');
    if(submitBtn){
      submitBtn.disabled=true;
      submitBtn.textContent="Submitting…";
    }

    try{
      const {data,error}=await appContext.supabaseClient.rpc("submit_review",{
        p_visitor_id:appContext.getVisitorId(),
        p_display_name:displayName,
        p_rating:rating,
        p_review_text:reviewText,
        p_item_reference:itemReference || null,
        p_country:country || "Other"
      });

      if(error){
        if(appContext.reviewRpcUnavailable(error,"submit_review")){
          appContext.reviewBackendState="missing";
          appContext.showToast("Reviews need the Supabase migration first");
        }else{
          console.error("Submit review error:",error);
          appContext.showToast("Could not submit review. Please try again later.");
        }
        return;
      }

      const result=Array.isArray(data) ? data[0] : data;
      if(!result?.success){
        appContext.showToast(appContext.reviewSubmitErrorMessage(result?.code));
        return;
      }

      form.reset();
      const ratingInput=form.querySelector('[name="rating"]');
      if(ratingInput) ratingInput.value="5";
      form.querySelectorAll("[data-review-star]").forEach(btn=>{
        btn.classList.toggle("active",Number(btn.dataset.reviewStar)<=5);
      });
      const count=appContext.$("reviewCharCount");
      if(count) count.textContent=`0 / ${appContext.REVIEW_TEXT_MAX}`;

      appContext.showToast("Review submitted — pending owner approval");
      const notice=appContext.$("reviewSubmitNotice");
      if(notice){
        notice.hidden=false;
        notice.textContent="Thank you. Your review is pending moderation and will not appear publicly until approved.";
      }
    }finally{
      if(submitBtn){
        submitBtn.disabled=false;
        submitBtn.textContent="Submit Review";
      }
    }
  }

async function moderateReview(id,action){
    if(!appContext.requireOwner("moderate reviews")) return;

    const row=appContext.ownerReviewSubmissions.find(item=>String(item.id)===String(id));
    if(!row) return;

    const {data,error}=await appContext.supabaseClient.rpc("moderate_review",{
      p_review_id:Number(id),
      p_action:String(action||""),
      p_verified:null
    });

    if(error){
      console.error("Moderate review error:",error);
      appContext.showToast("Could not update review");
      return;
    }

    appContext.showToast(
      action==="approve" ? "Review approved" :
      action==="reject" ? "Review rejected" :
      action==="hide" ? "Review hidden" :
      "Review updated"
    );
    await appContext.renderReviewsPage();
  }

async function toggleReviewVerified(id){
    if(!appContext.requireOwner("verify reviews")) return;

    const row=appContext.ownerReviewSubmissions.find(item=>String(item.id)===String(id));
    if(!row) return;

    const {error}=await appContext.supabaseClient.rpc("moderate_review",{
      p_review_id:Number(id),
      p_action:String(row.status||"pending"),
      p_verified:!row.verified_buyer
    });

    if(error){
      console.error("Verify review error:",error);
      appContext.showToast("Could not update Verified Buyer status");
      return;
    }

    appContext.showToast(row.verified_buyer ? "Verified Buyer removed" : "Marked as Verified Buyer");
    await appContext.renderReviewsPage();
  }

async function deleteReviewSubmission(id){
    if(!appContext.requireOwner("delete reviews")) return;

    const row=appContext.ownerReviewSubmissions.find(item=>String(item.id)===String(id));
    if(!row) return;

    const preview=String(row.review_text||"").trim().slice(0,80);
    const ok=confirm(
      `Permanently delete this review from ${row.display_name||"this reviewer"}?\n\n` +
      `${preview}${String(row.review_text||"").length>80?"…":""}\n\n` +
      `This cannot be undone.`
    );
    if(!ok) return;

    const {data,error}=await appContext.supabaseClient.rpc("delete_review",{
      p_review_id:Number(id)
    });

    if(error){
      console.error("Delete review error:",error);
      appContext.showToast("Could not delete review");
      return;
    }

    if(data!==true){
      appContext.showToast("Review was not deleted");
      return;
    }

    appContext.showToast("Review permanently deleted");
    await appContext.renderReviewsPage();
  }

async function syncEbayFeedbackDev(seller){
    if(!appContext.requireOwner("sync eBay feedback")) return;
    const button=appContext.$("syncEbayFeedbackDevBtn");
    if(button){button.disabled=true;button.textContent="Syncing eBay feedback…";}
    try{
      const {data,error}=await appContext.supabaseClient.functions.invoke("ebay-feedback-sync-dev",{body:seller?{seller}:{}});
      if(error) throw error;
      const results=Array.isArray(data?.results)?data.results:[];
      const failed=results.filter(item=>item.status!=="success");
      appContext.showToast(`${results.length-failed.length} account(s) synced; ${failed.length} failed`);
      await appContext.renderReviewsPage();
    }catch(error){
      console.error("Development eBay feedback sync error:",error);
      appContext.showToast("eBay feedback sync failed. Check the Edge Function logs.");
    }finally{
      if(button){button.disabled=false;button.textContent="Sync eBay Feedback";}
    }
  }

async function connectEbayAccountDev(account){
 if(!appContext.requireOwner("connect eBay account")) return;
 try{
 const {data,error}=await appContext.supabaseClient.functions.invoke("ebay-oauth-connect-dev",{body:{action:"connect",account}});
 if(error||!data?.authorization_url) throw new Error(data?.error||"Connection unavailable");
 const url=new URL(data.authorization_url);
 if(url.origin!=="https://auth.ebay.com") throw new Error("Unexpected authorization URL");
 window.location.assign(url.href);
 }catch(error){console.error("eBay connection error",error);appContext.showToast("eBay connection unavailable. Check OAuth configuration.");}
}

async function loadEbayFeedback(){
    const feedback=[];
    for(let offset=0;;offset+=EBAY_FEEDBACK_BATCH_SIZE){
      const {data,error}=await appContext.supabaseClient.from("ebay_feedback_dev")
        .select("ebay_account,feedback_type,comment,feedback_at")
        .order("feedback_at",{ascending:false})
        .order("id",{ascending:false})
        .range(offset,offset+EBAY_FEEDBACK_BATCH_SIZE-1);
      if(error) throw error;
      const batch=Array.isArray(data)?data:[];
      feedback.push(...batch);
      if(batch.length<EBAY_FEEDBACK_BATCH_SIZE) return feedback;
    }
  }

function ebayFeedbackCardHtml(item){
    return `
      <article class="review-card">
        <div class="review-moderation-head"><strong>${appContext.escapeHtml(item.ebay_account)}</strong><span class="review-status">${appContext.escapeHtml(item.feedback_type.toUpperCase())} · eBay</span></div>
        <p>${appContext.escapeHtml(item.comment)}</p>
        <div class="review-moderation-meta"><span>${appContext.escapeHtml(appContext.reviewDateLabel(item.feedback_at))}</span></div>
      </article>`;
  }

function reviewPagerHtml(listId,label){
    return `
      <nav data-review-pagination aria-label="${label} pages">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;padding:12px">
          <button type="button" class="btn-ghost" data-review-previous aria-controls="${listId}" style="min-height:44px">Previous</button>
          <span data-review-page-status aria-live="polite"></span>
          <button type="button" class="btn-ghost" data-review-next aria-controls="${listId}" style="min-height:44px">Next</button>
        </div>
      </nav>`;
  }

function bindReviewPagination({listId,rows,cardHtml,emptyMessage,filter}){
    const list=appContext.$(listId);
    const pager=list.nextElementSibling;
    const previous=pager.querySelector("[data-review-previous]");
    const next=pager.querySelector("[data-review-next]");
    const status=pager.querySelector("[data-review-page-status]");
    let page=1;
    let visibleRows=rows;

    function renderPage(){
      const pageCount=Math.ceil(visibleRows.length/REVIEWS_PER_PAGE);
      const start=(page-1)*REVIEWS_PER_PAGE;
      list.innerHTML=pageCount
        ? visibleRows.slice(start,start+REVIEWS_PER_PAGE).map(cardHtml).join("")
        : `<div class="reviews-empty">${emptyMessage(filter?.value)}</div>`;
      pager.hidden=pageCount<=1;
      previous.disabled=page===1;
      next.disabled=page>=pageCount;
      status.textContent=pageCount>1?`Page ${page} of ${pageCount}`:"";
    }

    function changePage(direction){
      page+=direction;
      renderPage();
      list.focus();
    }

    previous.addEventListener("click",()=>changePage(-1));
    next.addEventListener("click",()=>changePage(1));
    filter?.addEventListener("change",()=>{
      page=1;
      visibleRows=filter.value?rows.filter(row=>row.ebay_account===filter.value):rows;
      renderPage();
    });
    renderPage();
  }

function bindReviewPageEvents(){
    appContext.$("syncEbayFeedbackDevBtn")?.addEventListener("click",()=>appContext.syncEbayFeedbackDev());
    appContext.view.querySelectorAll("[data-ebay-connect]").forEach(btn=>btn.addEventListener("click",()=>appContext.connectEbayAccountDev(btn.dataset.ebayConnect)));
    appContext.$("writeReviewBtn")?.addEventListener("click",()=>{
      const panel=appContext.$("reviewSubmitPanel");
      if(!panel) return;
      panel.scrollIntoView({behavior:"smooth",block:"start"});
      setTimeout(()=>{
        panel.querySelector('input[name="display_name"]')?.focus({preventScroll:true});
      },350);
    });

    const form=appContext.$("reviewSubmitForm");
    if(form){
      const ratingInput=form.querySelector('[name="rating"]');
      form.querySelectorAll("[data-review-star]").forEach(btn=>{
        btn.addEventListener("click",()=>{
          const value=Number(btn.dataset.reviewStar||0);
          if(ratingInput) ratingInput.value=String(value);
          form.querySelectorAll("[data-review-star]").forEach(star=>{
            star.classList.toggle("active",Number(star.dataset.reviewStar)<=value);
          });
        });
      });

      const reviewText=form.elements.review_text;
      const count=appContext.$("reviewCharCount");
      reviewText?.addEventListener("input",()=>{
        if(count) count.textContent=`${reviewText.value.length} / ${appContext.REVIEW_TEXT_MAX}`;
      });

      form.addEventListener("submit",event=>{
        event.preventDefault();
        appContext.submitPublicReview(form);
      });
    }

    appContext.view.querySelectorAll("[data-review-action]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        appContext.moderateReview(btn.dataset.reviewId,btn.dataset.reviewAction);
      });
    });

    appContext.view.querySelectorAll("[data-review-verified]").forEach(btn=>{
      btn.addEventListener("click",()=>appContext.toggleReviewVerified(btn.dataset.reviewVerified));
    });

    appContext.view.querySelectorAll("[data-review-delete]").forEach(btn=>{
      btn.addEventListener("click",()=>appContext.deleteReviewSubmission(btn.dataset.reviewDelete));
    });
  }

async function renderReviewsPage(){
    appContext.view.innerHTML=`
      <div class="page-head">
        <div>
          <div class="eyebrow">Collector feedback</div>
          <h2>Reviews</h2>
          <p>Feedback from collectors who have dealt with Collect TCG MY &amp; SG.</p>
        </div>
      </div>
      <div class="review-loading panel">Loading reviews…</div>
    `;

    await Promise.all([
      appContext.loadPublicReviews(),
      appContext.loadOwnerReviewSubmissions()
    ]);

    if(appContext.currentRoute()!=="reviews") return;

    let ebayFeedback=[];
    let ebayFeedbackError=false;
    try{
      ebayFeedback=await loadEbayFeedback();
    }catch(error){
      ebayFeedbackError=true;
      console.warn("Development eBay feedback unavailable:",error);
    }

    const ebayAccounts=["collect_tcg_1","collect_tcg_2","collect_tcg_3","collect_tcg_4","collect_tcg_5"];
    let ebayConnections=[];
    if(appContext.isOwnerMode()){
      try{const {data,error}=await appContext.supabaseClient.functions.invoke("ebay-oauth-connect-dev",{body:{action:"status"}});if(!error&&Array.isArray(data?.accounts))ebayConnections=data.accounts;}
      catch(error){console.warn("eBay connection status unavailable",error);}
    }
    if(appContext.currentRoute()!=="reviews") return;

    const ebayPositive=ebayFeedback.filter(item=>item.feedback_type==="positive").length;
    const ebayNeutral=ebayFeedback.filter(item=>item.feedback_type==="neutral").length;
    const ebayNegative=ebayFeedback.filter(item=>item.feedback_type==="negative").length;
    const ebayRated=ebayPositive+ebayNeutral+ebayNegative;
    const ebayPositivePercent=ebayRated?Math.round(100*ebayPositive/ebayRated):0;
    const summary=appContext.approvedReviewSummary();
    const pendingCount=appContext.ownerReviewSubmissions.filter(row=>String(row.status)==="pending").length;

    appContext.view.innerHTML=`
      <div class="page-head review-page-head">
        <div>
          <div class="eyebrow">Collector feedback</div>
          <h2>Reviews</h2>
          <p>Feedback from collectors who have dealt with Collect TCG MY &amp; SG.</p>
        </div>
        <button type="button" class="btn-ghost" id="writeReviewBtn">Write a Review</button>
      </div>

      ${appContext.reviewBackendState==="missing" ? `
        <div class="review-setup-warning owner-only">
          <strong>Reviews backend not installed.</strong>
          <span>Run the secure Reviews Supabase migration before accepting submissions.</span>
        </div>
      ` : ""}

      <section aria-label="eBay seller feedback reputation" style="background:linear-gradient(135deg,#17251e,#171b22 58%);border:1px solid #365442;border-radius:18px;padding:clamp(18px,3vw,30px);margin-bottom:18px;color:#f0fdf4">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px">
          <strong style="color:#86efac;letter-spacing:.05em;font-size:.85rem">✓ COLLECT TCG · EBAY SELLER FEEDBACK</strong>
          <span style="border:1px solid #477d5a;border-radius:999px;padding:5px 12px;color:#bbf7d0;font-size:.8rem">Imported from eBay</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin-bottom:18px">
          <strong style="font-size:clamp(3.2rem,8vw,5rem);line-height:1;color:#4ade80;font-variant-numeric:tabular-nums">${ebayRated?ebayPositivePercent+"%":"—"}</strong>
          <div><strong style="font-size:clamp(1.3rem,3vw,1.8rem);display:block">Positive Feedback</strong><span style="color:#cbd5d1;font-size:.9rem">Across ${new Set(ebayFeedback.map(item=>item.ebay_account)).size} eBay account(s) with imported feedback</span></div>
        </div>
        <div role="img" aria-label="${ebayRated?ebayPositivePercent+" percent positive feedback":"No feedback yet"}" style="height:10px;background:#343c39;border-radius:999px;overflow:hidden;margin-bottom:16px"><div style="height:100%;width:${ebayPositivePercent}%;background:#4ade80;border-radius:999px"></div></div>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(6px,2vw,12px)">
          <div style="background:#232b28;border-radius:12px;padding:clamp(10px,2vw,18px);text-align:center"><strong style="display:block;font-size:clamp(1.5rem,4vw,2.3rem);color:#4ade80">${ebayPositive}</strong><span style="color:#d1d5db;font-size:.85rem">👍 Positive</span></div>
          <div style="background:#232b28;border-radius:12px;padding:clamp(10px,2vw,18px);text-align:center"><strong style="display:block;font-size:clamp(1.5rem,4vw,2.3rem);color:#f3f4f6">${ebayNeutral}</strong><span style="color:#d1d5db;font-size:.85rem">Neutral</span></div>
          <div style="background:#232b28;border-radius:12px;padding:clamp(10px,2vw,18px);text-align:center"><strong style="display:block;font-size:clamp(1.5rem,4vw,2.3rem);color:#fca5a5">${ebayNegative}</strong><span style="color:#d1d5db;font-size:.85rem">Negative</span></div>
        </div>
        <small style="display:block;margin-top:14px;color:#b7c2bc">Based on ${ebayRated} imported eBay seller feedback rating(s). eBay feedback uses positive, neutral and negative ratings, not five-star ratings.</small>
      </section>
      <section class="review-summary-panel" aria-label="Website reviews">
        <div class="review-summary-stat"><strong>${summary.count?summary.average.toFixed(1):"—"}</strong><div class="review-stars" aria-label="Website review rating">${summary.count?appContext.reviewStars(Math.round(summary.average)):"☆☆☆☆☆"}</div><span>${summary.count} approved website review${summary.count===1?"":"s"}</span></div>
        <div class="review-summary-trust"><strong>Review Protection</strong><span>Website reviews are moderated before publishing. ${summary.verified} marked Verified Buyer.</span></div>
      </section>

      <section class="reviews-list-panel" aria-label="eBay seller feedback" style="margin-bottom:18px">

        <div class="reviews-section-head"><div><h3>eBay Seller Feedback</h3><p>Imported seller feedback from Collect TCG eBay accounts. ${ebayRated ? `${ebayPositivePercent}% positive from ${ebayRated} imported ratings` : "Not yet synchronized"}. Separate from website reviews.</p></div><span>${ebayFeedback.length}</span></div>
        <div style="padding:0 12px 12px"><label for="ebayFeedbackAccountFilter">Account </label><select id="ebayFeedbackAccountFilter"><option value="">All accounts</option>${ebayAccounts.map(account=>`<option value="${account}">${account}</option>`).join("")}</select></div>
        <div class="reviews-list" id="ebayFeedbackList" tabindex="-1" aria-label="eBay seller feedback"></div>
        ${reviewPagerHtml("ebayFeedbackList","eBay seller feedback")}
      </section>

      <section class="reviews-list-panel owner-only" aria-label="Owner eBay account management" style="margin-bottom:18px">
        ${appContext.isOwnerMode() ? `<div style="padding:12px;display:grid;gap:10px"><div><strong>eBay Account Connections</strong> <button type="button" class="btn-ghost" id="syncEbayFeedbackDevBtn">Sync All Accounts</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:8px">${ebayAccounts.map(account=>{const connected=ebayConnections.find(row=>row.account===account)?.connected===true;return `<div style="border:1px solid #45464b;border-radius:10px;padding:10px;display:grid;gap:6px"><strong>${account}</strong><small>${connected?"Connected":"Not connected"}</small><button type="button" class="btn-ghost" data-ebay-connect="${account}">${connected?"Reconnect":"Connect"}</button></div>`;}).join("")}</div></div>` : ""}
      </section>

      <div class="reviews-public-layout">
        <section class="reviews-list-panel">
          <div class="reviews-section-head">
            <div>
              <h3>Collector Reviews</h3>
            </div>
            <span>${summary.count}</span>
          </div>

          <div class="reviews-list" id="collectorReviewsList" tabindex="-1" aria-label="Collector reviews"></div>
          ${reviewPagerHtml("collectorReviewsList","Collector review")}
        </section>

        <aside class="review-submit-panel" id="reviewSubmitPanel">
          <div class="review-submit-head">
            <div class="eyebrow">Share your experience</div>
            <h3>Write a Review</h3>
            <p>Reviews are checked for spam and relevance before they appear publicly.</p>
          </div>

          <form id="reviewSubmitForm" novalidate>
            <div class="review-form-grid">
              <label class="field">
                <span>Display name</span>
                <input name="display_name"
                       maxlength="${appContext.REVIEW_NAME_MAX}"
                       autocomplete="name"
                       required
                       placeholder="e.g. Alex T.">
              </label>

              <label class="field">
                <span>Country</span>
                <select name="country">
                  ${appContext.reviewCountryOptions()}
                </select>
              </label>
            </div>

            <div class="field review-rating-field">
              <span>Rating</span>
              <input type="hidden" name="rating" value="5">
              <div class="review-star-picker" role="group" aria-label="Choose rating">
                ${[1,2,3,4,5].map(n=>`
                  <button type="button"
                          class="active"
                          data-review-star="${n}"
                          aria-label="${n} star${n===1?"":"s"}">★</button>
                `).join("")}
              </div>
            </div>

            <label class="field">
              <span>Item / transaction reference <small>(optional)</small></span>
              <input name="item_reference"
                     maxlength="${appContext.REVIEW_ITEM_MAX}"
                     autocomplete="off"
                     placeholder="e.g. OP trophy card / COD in KL">
            </label>

            <label class="field">
              <span>Your review</span>
              <textarea name="review_text"
                        minlength="${appContext.REVIEW_TEXT_MIN}"
                        maxlength="${appContext.REVIEW_TEXT_MAX}"
                        rows="6"
                        required
                        placeholder="Tell other collectors about your experience."></textarea>
              <div class="review-text-meta">
                <span>No website links or promotional content.</span>
                <span id="reviewCharCount">0 / ${appContext.REVIEW_TEXT_MAX}</span>
              </div>
            </label>

            <label class="review-confirm">
              <input type="checkbox" required>
              <span>I confirm this review reflects my own experience with Collect TCG MY &amp; SG.</span>
            </label>

            <label class="review-honeypot" aria-hidden="true">
              Website
              <input name="website" tabindex="-1" autocomplete="off">
            </label>

            <button type="submit" class="btn-primary review-submit-btn" ${appContext.reviewBackendState==="missing"?"disabled":""}>
              Submit Review
            </button>

            <p class="review-moderation-note">
              Reviews may be moderated for spam, abusive content, duplicates, or unrelated content. Genuine positive and negative feedback is welcome.
            </p>
            <div class="review-submit-notice" id="reviewSubmitNotice" hidden></div>
          </form>
        </aside>
      </div>

      <section class="review-owner-panel owner-only">
        <div class="reviews-section-head">
          <div>
            <div class="eyebrow">Owner moderation</div>
            <h3>Review Management</h3>
            <p>Approve genuine reviews, reject spam, or mark confirmed buyers as verified.</p>
          </div>
          <span>${pendingCount} pending</span>
        </div>

        <div class="review-owner-stats">
          ${["pending","approved","hidden","rejected"].map(status=>{
            const count=appContext.ownerReviewSubmissions.filter(row=>String(row.status)===status).length;
            return `<div><strong>${count}</strong><span>${status}</span></div>`;
          }).join("")}
        </div>

        <div class="review-moderation-list">
          ${appContext.ownerReviewSubmissions.length
            ? appContext.ownerReviewSubmissions.map(appContext.reviewModerationCardHtml).join("")
            : `<div class="reviews-empty">No review submissions yet.</div>`}
        </div>
      </section>
    `;

    bindReviewPagination({
      listId:"ebayFeedbackList",
      rows:ebayFeedback,
      cardHtml:ebayFeedbackCardHtml,
      filter:appContext.$("ebayFeedbackAccountFilter"),
      emptyMessage:account=>{
        if(ebayFeedbackError) return "eBay feedback is temporarily unavailable.";
        return account?"No synchronized eBay feedback for this account yet.":"No synchronized eBay seller feedback yet.";
      }
    });
    bindReviewPagination({
      listId:"collectorReviewsList",
      rows:appContext.publicReviews,
      cardHtml:appContext.reviewPublicCardHtml,
      emptyMessage:()=>appContext.reviewBackendState==="error"
        ?"Collector reviews are temporarily unavailable."
        :"No approved reviews yet. Be the first to share your experience."
    });
    appContext.bindReviewPageEvents();
    appContext.applyOwnerMode();
  }

  Object.assign(appContext,{reviewStars,reviewCountryLabel,reviewCountryOptions,reviewDateLabel,reviewRpcUnavailable,loadPublicReviews,loadOwnerReviewSubmissions,approvedReviewSummary,reviewPublicCardHtml,reviewModerationCardHtml,reviewSubmitErrorMessage,submitPublicReview,moderateReview,toggleReviewVerified,deleteReviewSubmission,syncEbayFeedbackDev,connectEbayAccountDev,bindReviewPageEvents,renderReviewsPage});
}
