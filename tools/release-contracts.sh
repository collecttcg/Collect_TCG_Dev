#!/usr/bin/env bash
set -euo pipefail

echo "== Validate Phase 2B1 discovery migration =="
set -euo pipefail
test -s migrations/2026/2026-09-24-v07-DISCOVERY-ATTRIBUTION.sql
grep -q 'create table if not exists public.card_discovery_views' migrations/2026/2026-09-24-v07-DISCOVERY-ATTRIBUTION.sql
grep -q 'enable row level security' migrations/2026/2026-09-24-v07-DISCOVERY-ATTRIBUTION.sql
grep -q 'revoke all on table public.card_discovery_views from anon, authenticated' migrations/2026/2026-09-24-v07-DISCOVERY-ATTRIBUTION.sql
grep -q 'create or replace function public.record_card_discovery_view' migrations/2026/2026-09-24-v07-DISCOVERY-ATTRIBUTION.sql
grep -q 'grant execute on function public.record_card_discovery_view' migrations/2026/2026-09-24-v07-DISCOVERY-ATTRIBUTION.sql

echo "== Validate Phase 2 completion =="
set -euo pipefail
test -s migrations/2026/2026-09-24-v08-DISCOVERY-SUMMARY.sql
grep -q 'create or replace function public.get_card_discovery_summary' migrations/2026/2026-09-24-v08-DISCOVERY-SUMMARY.sql
grep -q 'public.is_app_owner()' migrations/2026/2026-09-24-v08-DISCOVERY-SUMMARY.sql
grep -q 'revoke all on function public.get_card_discovery_summary' migrations/2026/2026-09-24-v08-DISCOVERY-SUMMARY.sql
grep -q 'grant execute on function public.get_card_discovery_summary' migrations/2026/2026-09-24-v08-DISCOVERY-SUMMARY.sql
grep -q 'function relatedSeriesAffinity' dev/src/features/cards/related.js
grep -q 'function relatedGradeAffinity' dev/src/features/cards/related.js
grep -Fq 'unique*100' dev/src/features/inventory/filtering.js
grep -q 'fetchDiscoverySourceSummary' dev/src/services/analytics.js
grep -q 'Where card interest starts' dev/src/features/owner/insights-dashboard.js

echo "== Validate fast clean-card navigation =="
set -euo pipefail
node --check dev/src/app/routing.js
node --check dev/src/ui/notifications.js
node --check dev/src/features/cards/details.js
node --check dev/src/app/initialize.js
grep -Fq 'history.pushState(state,"",cleanUrl.pathname+cleanUrl.search+cleanUrl.hash)' dev/src/app/routing.js
grep -q 'state.collectTcgSpaCardId=id' dev/src/app/routing.js
grep -q 'window.addEventListener("popstate", appContext.router)' dev/src/app/routing.js
grep -q 'history.back()' dev/src/features/cards/details.js
! grep -q 'location.assign(clean)' dev/src/app/routing.js
grep -q 'meta\[name="collect-tcg-card-id"\]' dev/src/app/routing.js
grep -q 'routing.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'notifications.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'information.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'collage.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'posts.js?v=2026-09-30-v02' dev/src/app/register-features.js
test "$(grep -o 'appContext.isLiveLifecycle(card)' dev/src/features/social/posts*.js | wc -l | tr -d ' ')" -ge "2"
grep -Fq 'appContext.isLiveLifecycle(card) && appContext.cardMatchesListingScope' dev/src/features/media/collage.js
grep -q '01-foundation.css?v=2026-09-29-v09' dev/index.html
grep -q 'details.js?v=2026-09-30-v03' dev/src/app/register-features.js
grep -q 'event.stopPropagation()' dev/src/features/content/home.js
grep -q 'appContext.openDetailsModal(card)' dev/src/app/routing.js

echo "== Validate Phase 3 conversion and performance =="
set -euo pipefail
node --check dev/src/features/cards/details.js
node --check dev/src/services/analytics.js
node --check dev/src/services/catalogue.js
node --check dev/src/features/cards/tiles.js
node --check dev/src/features/owner/insights-dashboard.js
node --check dev/src/app/startup.js
grep -q 'function contactCardReferenceLines' dev/src/features/cards/details.js
grep -q 'recordCardEngagement(card.id,"inquiry_copy",platform)' dev/src/features/cards/details.js
grep -q 'fetchOwnerCardConversionSummary' dev/src/services/analytics.js
grep -q 'ownerCardConversionSummaryCache = new Map' dev/src/services/analytics.js
grep -q 'data-owner-conversion="intent-rate"' dev/src/features/cards/details.js
grep -q 'cardImageLoadPromises.get(id)' dev/src/services/catalogue.js
grep -q 'preloadCardDetailsMedia' dev/src/features/cards/tiles.js
grep -q 'Saved without contact' dev/src/features/owner/insights-dashboard.js
grep -q 'const directCardEntry=' dev/src/app/startup.js
grep -q 'Promise.allSettled' dev/src/app/startup.js
grep -q 'analytics.js?v=2026-10-05-v01' dev/src/app/register-features.js
grep -q 'catalogue.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'tiles.js?v=2026-09-29-v13' dev/src/app/register-features.js
grep -q 'insights-dashboard.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'details.js?v=2026-09-30-v03' dev/src/app/register-features.js
grep -q 'startup.js?v=2026-09-29-v09' dev/src/app/register-features.js

echo "== Validate Phase 4 owner sales intelligence =="
set -euo pipefail
node --check dev/src/features/owner/insights-dashboard.js
grep -q 'function cardPerformanceRows' dev/src/features/owner/insights-dashboard.js
grep -q 'data-insights-v20-sort' dev/src/features/owner/insights-dashboard.js
grep -q 'const pageSize=10' dev/src/features/owner/insights-dashboard.js
grep -q 'data-insights-v20-pagination' dev/src/features/owner/insights-dashboard.js
grep -q 'insights-v20-performance-controls' dev/src/features/owner/insights-dashboard.js
grep -q 'data-insights-v20-page="next"' dev/src/features/owner/insights-dashboard.js
grep -q 'Highest intent rate' dev/src/features/owner/insights-dashboard.js
grep -q 'Needs attention' dev/src/features/owner/insights-dashboard.js
grep -q 'data-insights-v14-open-card' dev/src/features/owner/insights-dashboard.js
grep -q 'insights-v20-table-wrap' dev/src/styles/27-insights-dashboard.css
grep -q 'insights-dashboard.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'register-features.js?v=2026-10-07-v02' dev/src/main.js
grep -q 'src/main.js?v=2026-10-05-v01' dev/index.html

echo "== Validate Phase 5 sales action queue =="
set -euo pipefail
node --check dev/src/features/owner/insights-dashboard.js
node --check dev/src/features/social/posts.js
grep -q 'function salesActionQueueRows' dev/src/features/owner/insights-dashboard.js
grep -q 'function salesActionQueueHtml' dev/src/features/owner/insights-dashboard.js
grep -q 'data-insights-v21-generate-post' dev/src/features/owner/insights-dashboard.js
grep -Fq '#/fb-tools?mode=single&card=' dev/src/features/owner/insights-dashboard.js
grep -q 'What to act on next' dev/src/features/owner/insights-dashboard.js
grep -q 'insights-v21-action-queue' dev/src/styles/27-insights-dashboard.css
grep -q 'requestedCardId' dev/src/features/social/posts*.js
grep -q 'renderFbSingleCardOptions();' dev/src/features/social/posts*.js
grep -q 'insights-dashboard.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'posts.js?v=2026-09-30-v02' dev/src/app/register-features.js

echo "== Validate Phase 7 code safety =="
set -euo pipefail
node --check dev/src/features/inventory/page.js
node --check dev/src/features/inventory/pagination.js
node --check dev/src/features/cards/details.js
node --check dev/src/features/cards/modal-keyboard.js
grep -q 'createInventoryPagination' dev/src/features/inventory/page*.js
grep -q 'function pageItems' dev/src/features/inventory/pagination.js
grep -q 'createModalKeyboardController' dev/src/features/cards/details.js
grep -q 'page.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'filtering.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'details.js?v=2026-09-30-v03' dev/src/app/register-features.js

echo "== Validate visitor UX improvements =="
set -euo pipefail
node --check dev/src/features/content/home.js
node --check dev/src/features/content/information.js
node --check dev/src/features/media/collage.js
node --check dev/src/features/cards/compare.js
grep -Fq 'premiumShelf("Recently Viewed"' dev/src/features/content/home.js
grep -Fq 'source:"recently-viewed"' dev/src/features/content/home.js
grep -q 'function handleCompareModalKeydown' dev/src/features/cards/compare.js
grep -q 'compareLastFocusedElement' dev/src/features/cards/compare.js
grep -q 'home.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'compare.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'id="pillFilterSummary"' dev/src/features/inventory/page*.js
grep -q 'function cardSearchScore' dev/src/features/inventory/filtering.js
grep -q 'navigator.share' dev/src/features/cards/details.js

echo "== Validate Beta v09 inventory render regression =="
set -euo pipefail
node --check dev/src/features/inventory/page.js
grep -q 'function currentPaginationFilterSignature()' dev/src/features/inventory/page*.js
grep -q 'getFilterSignature:currentPaginationFilterSignature' dev/src/features/inventory/page*.js
grep -q 'page.js?v=2026-09-29-v09' dev/src/app/register-features.js

echo "== Validate Beta v08 card details and eBay images =="
set -euo pipefail
node --check dev/src/features/cards/details.js
node --check dev/src/features/social/posts.js
! grep -q 'class="details-desktop-contact-socials"' dev/src/features/cards/details.js
grep -q 'class="detail-buy-cta"' dev/src/features/cards/details.js
grep -q 'detailsContactSocialLinksHtml("details-buy-social-links")' dev/src/features/cards/details.js
grep -q 'id="ebayDownloadImages"' dev/src/features/social/posts*.js
grep -q 'downloadSingleCardImagesZip(selected' dev/src/features/social/posts*.js
grep -q 'download eBay listing images' dev/src/features/social/posts*.js
grep -q 'details.js?v=2026-09-30-v03' dev/src/app/register-features.js
grep -q 'posts.js?v=2026-09-30-v02' dev/src/app/register-features.js

echo "== Validate Facebook group-friendly post generator =="
set -euo pipefail
node --check dev/src/features/social/posts.js
grep -q 'function facebookGroupSalesCopy' dev/src/features/social/posts*.js
grep -q 'function facebookGroupSalesFooterLines' dev/src/features/social/posts*.js
grep -q 'Group-friendly (short)' dev/src/features/social/posts*.js
grep -q 'Detailed listing' dev/src/features/social/posts*.js
grep -Fq 'Price & full details:' dev/src/features/social/posts*.js
grep -Fq 'groupCopy.price' dev/src/features/social/posts*.js
! grep -Fq 'groupFriendly ? groupCopy.price : text.priceRefer' dev/src/features/social/posts*.js
grep -Fq 'Worldwide shipping available' dev/src/features/social/posts*.js
grep -Fq 'more photos / video' dev/src/features/social/posts*.js
grep -q '<option value="detailed" selected>Detailed listing</option>' dev/src/features/social/posts*.js
grep -q 'templateModeInput?.value||"detailed"' dev/src/features/social/posts*.js
grep -q 'posts.js?v=2026-09-30-v02' dev/src/app/register-features.js
grep -q 'register-features.js?v=2026-10-07-v02' dev/src/main.js
grep -q 'src/main.js?v=2026-10-05-v01' dev/index.html

echo "== Validate Development analytics test exclusion =="
set -euo pipefail
node --check dev/src/services/analytics.js
node --check dev/src/app/startup.js
grep -q 'function developmentAnalyticsTestSource()' dev/src/services/analytics.js
grep -q 'hostname!=="collecttcg.github.io"' dev/src/services/analytics.js
grep -Fq '!pathname.startsWith("/Collect_TCG_Dev/")' dev/src/services/analytics.js
grep -Fq 'get("analytics_test")' dev/src/services/analytics.js
grep -Fq 'new Set(["chatgpt","github","openai","automation"])' dev/src/services/analytics.js
grep -Fq 'appContext.isDevelopmentAnalyticsTestSession()' dev/src/services/analytics.js
grep -Fq '!appContext.isDevelopmentAnalyticsTestSession()' dev/src/app/startup.js
grep -q 'analytics.js?v=2026-10-05-v01' dev/src/app/register-features.js
grep -q 'startup.js?v=2026-09-29-v09' dev/src/app/register-features.js

echo "== Validate buyer privacy guards =="
set -euo pipefail
node --check dev/src/features/content/home.js
node --check dev/src/features/cards/details.js
node --check dev/src/features/cards/tiles.js
grep -Fq 'appContext.isOwnerMode() && trending && views>0' dev/src/features/content/home.js
grep -Fq 'home-premium-interest owner-only owner-private-analytics' dev/src/features/content/home.js
grep -Fq 'document.querySelectorAll(".owner-private-analytics")' dev/src/services/auth.js
grep -Fq 'el.style.setProperty("display","none","important")' dev/src/services/auth.js
grep -q 'auth.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -Fq 'appContext.isOwnerMode() ? `<div class="detail-item owner-only owner-private-analytics">' dev/src/features/cards/details.js
grep -Fq 'appContext.isOwnerMode() ? `<div class="owner-only owner-private-analytics clean-owner-views"' dev/src/features/cards/tiles.js
grep -q 'home.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'tiles.js?v=2026-09-29-v13' dev/src/app/register-features.js
grep -q 'details.js?v=2026-09-30-v03' dev/src/app/register-features.js
grep -q 'register-features.js?v=2026-10-07-v02' dev/src/main.js
grep -q 'src/main.js?v=2026-10-05-v01' dev/index.html

echo "== Validate hidden-card visibility guards =="
set -euo pipefail
node --check dev/src/features/inventory/filtering.js
node --check dev/src/features/content/home.js
node --check dev/src/features/inventory/page.js
node --check dev/src/features/cards/compare.js
grep -Fq 'if(lifecycle!=="live") return false;' dev/src/features/inventory/filtering.js
grep -Fq '.filter(c=>appContext.isLiveLifecycle(c) && appContext.cardMatchesListingScope(c,"inventory"))' dev/src/features/content/home.js
grep -Fq 'const visibleCards=appContext.cards.filter(card=>appContext.isLiveLifecycle(card));' dev/src/features/inventory/page*.js
grep -Fq '.filter(card=>card && appContext.isLiveLifecycle(card))' dev/src/features/cards/compare.js
grep -Fq 'String(card.id)===safe && appContext.isLiveLifecycle(card)' dev/src/features/cards/compare.js
grep -q 'home.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'filtering.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'page.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'compare.js?v=2026-09-29-v09' dev/src/app/register-features.js
grep -q 'register-features.js?v=2026-10-07-v02' dev/src/main.js
grep -q 'src/main.js?v=2026-10-05-v01' dev/index.html

echo "== Validate owner-only Hidden Listings page =="
set -euo pipefail
node --check dev/src/features/inventory/filtering.js
node --check dev/src/features/cards/repository.js
node --check dev/src/app/navigation.js
node --check dev/src/app/routing.js
node --check dev/src/features/owner/lifecycle.js
grep -Fq 'if(lifecycle!=="live") return false;' dev/src/features/inventory/filtering.js
grep -Fq '"hidden-listings"' dev/src/features/cards/repository.js
grep -Fq 'else if(route === "hidden-listings")' dev/src/app/routing.js
grep -Fq 'appContext.renderHiddenListingsPage()' dev/src/app/routing.js
grep -Fq 'function renderHiddenListingsPage()' dev/src/features/owner/lifecycle.js
grep -Fq 'appContext.cardLifecycle(card)==="draft"' dev/src/features/owner/lifecycle.js
grep -Fq 'drafts.map(appContext.cardTileHTML).join("")' dev/src/features/owner/lifecycle.js
grep -Fq 'class="${compact ? "grid compact-list" : "grid"}"' dev/src/features/owner/lifecycle.js
grep -Fq 'id="hiddenListingsViewToggle"' dev/src/features/owner/lifecycle.js
grep -Fq 'appContext.wireShimmer(grid);' dev/src/features/owner/lifecycle.js
grep -Fq 'appContext.wireCardActions(grid);' dev/src/features/owner/lifecycle.js
grep -Fq 'appContext.getInventoryViewMode()==="compact"' dev/src/features/owner/lifecycle.js
grep -Fq 'No hidden listings' dev/src/features/owner/lifecycle.js
grep -Fq 'renderHiddenListingsPage' dev/src/features/owner/lifecycle.js
test "$(grep -o 'href="#/hidden-listings"' dev/index.html | wc -l | tr -d ' ')" = "3"
test "$(grep -o 'data-route="hidden-listings" class="owner-only' dev/index.html | wc -l | tr -d ' ')" -ge "2"
grep -q 'repository.js?v=2026-09-29-v09' dev/src/app/register-features.js

echo "== Validate standalone mobile owner card manager =="
set -euo pipefail
node --check dev/src/features/owner/mobile-card-editor.js
grep -q 'const ROUTE="mobile-card-editor"' dev/src/features/owner/mobile-card-editor.js
grep -q 'mobile-owner-card-editor' dev/src/features/owner/mobile-card-editor.js
grep -q 'mobile-card-editor.js?v=2026-10-07-v03' dev/src/app/register-features.js

echo "Release contracts passed."
