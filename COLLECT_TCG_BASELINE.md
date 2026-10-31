# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-10-31

## Repositories
- Production: `collecttcg/Collect_TCG`
- Development: `collecttcg/Collect_TCG_Dev`
- Default branch: `main`
- Development is the normal working environment; Production is protected.
- Reconciliation priority: current GitHub HEAD > latest valid release manifest > baseline > recent Project context > older context.

## Versioning
- `V210` is the final legacy `V###` release.
- Current releases use `YYYY-MM-DD-vNN`; Development and Production counters are independent.
- Historical release manifests are immutable.

## Current Development
Latest validated Development release: `2026-10-31-v02`
Previous Development: `2026-10-31-v01`
Development release manifest: `release-manifests/2026-10-31-v02.txt`
Development v02 package source commit: `81321726a563869da9f5030baaa697a3c9d62f16`
Development v02 manifest commit: `4d644a127f19fdbcb9c90b810d97452a10602fd5`

### Development package record — 2026-10-31-v02
- Full ZIP: `Collect-TCG-Dev-2026-10-31-v02-full.zip`
- Full SHA256: `9013298a670da6677f8180cb69324aae3131bc5cea56d32b10d3c1bc5ac37a99`
- Patch ZIP: `Collect-TCG-Dev-2026-10-31-v01-to-2026-10-31-v02-patch.zip`
- Patch SHA256: `9ed59c5c4eff967075d19f150935fcda32a46ca957e92fed8349e4ccd27f0977`

Current Development behavior:
- Inventory Sort is separate from Filters. Desktop keeps Search, Sort, Filters, Currency and Add Card on one toolbar row; Sort is sized consistently with adjacent controls.
- Portrait mobile keeps Search, Sort, Filters and Currency on one row, with Search allowed to shrink; Sort opens the retained mobile sort sheet.
- Existing sort methods remain, including both price directions; `Most Popular` uses the existing Trending/7-day interest data.
- Owner Add/Edit retains JPEG, PNG, WebP, HEIC and HEIF support with native decode first and pinned `heic-to` 1.6.7 fallback.
- Owner Add/Edit listing photos retain file drop and drag-reorder edge auto-scroll.
- Owner Inventory Tools → PSA POP retains `Get Never-Synced PSA POPs (N)`; existing Update Due / Update All behavior remains unchanged.
- Owner-only AI Card Scanner, QR Generator, eBay account links/Ban List, Buyer Messages, generators, private analytics and established compact Owner Inventory Tools remain retained.
- Development SEO generation and validation passed for v02.
- No SQL/schema/RLS/Edge Function change was required.

## Current Production
Latest Production: `2026-10-31-v02`
Previous Production: `2026-10-31-v01`
Development promoted from: `2026-10-31-v02`
Production release manifest: `release-manifests/2026-10-31-v02.txt`
Production v02 package source commit: `0d25adcc1fe3ca4a5a8badc21e4e31e2f6031100`
Production last-known-good / release manifest commit: `27e6b180aafc649c6e17688ec96530e2a652cf38`

### Production package record — 2026-10-31-v02
- Full ZIP: `Collect-TCG-Production-2026-10-31-v02-full.zip`
- Full SHA256: `d10d8102ead83dbfd0d32d3d5535871b8135aa3fa7b61c8fa481aa40a546ff66`
- Patch ZIP: `Collect-TCG-Production-2026-10-31-v01-to-2026-10-31-v02-patch.zip`
- Patch SHA256: `46d3771da63b15292021d03e045ca4925c2464262a4b3e0e01b2590fd13ddeb7`

### Production 2026-10-31-v02
Purpose: promote validated Development `2026-10-31-v02` Inventory sorting and responsive toolbar improvements while preserving Production-specific behavior and refreshing SEO.

Retained/current behavior:
- Inventory Sort is outside Filters and retains existing Custom Order/name/date/year/grade/price methods plus `Most Popular`.
- Desktop toolbar keeps Search, Sort, Filters, Currency and Add Card on one row; the Sort control matches adjacent control sizing.
- Portrait mobile keeps Search, Sort, Filters and Currency on one row; Search shrinks to preserve the four controls and Sort opens the existing mobile sort sheet.
- Owner Add/Edit file drop, drag-reorder edge auto-scroll and HEIC/HEIF support remain retained.
- PSA POP never-synced, Due and All actions remain retained.
- Production scanner remains `scan-card-ai`; `scan-card-ai-dev` must not appear in Production runtime code.
- QR Generator, eBay accounts/Ban List, Buyer Messages, SEO/stable URLs, analytics/privacy boundaries, Contact to Buy, giveaways and generators remain retained.
- Production SEO generator self-test, regeneration and SEO validation passed during the v02 release gate.
- SQL required: No.

Validation completed: rollback anchor; all Production JavaScript syntax; Production repository/reference checks; promoted v02 sort integration contracts; retained v01/HEIC contracts; CSS/Post Generator checks; SEO generator self-test and Production SEO regeneration/validation; full/patch ZIP creation and integrity checks; package artifact upload; immutable Production manifest/checksums; Pages deployment confirmation; last-known-good advanced to the v02 manifest commit.

Validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Interactive desktop/mobile/Safari browser testing was not performed during Production promotion; Development behavior was user-observed through supplied screenshots during iteration.

## Historical immutable state retained
- Production `2026-10-31-v01` / Development `2026-10-31-v01` remain immutable prior releases containing Owner image workflow and PSA POP improvements.
- Historical v01 baseline snapshot retained for validator/history continuity:
  - Latest validated Development release: `2026-10-31-v01`
  - Latest Production: `2026-10-31-v01`
  - Previous Production: `2026-10-30-v04`
  - Development promoted from: `2026-10-31-v01`
- Production `2026-10-30-v04` / Development `2026-10-30-v06` remain immutable prior releases and retain the modern HEIC decoder path.
- Development `2026-10-30-v04` / Production `2026-10-30-v03` introduced/promoted initial HEIC support.
- Development `2026-10-30-v03` / Production `2026-10-30-v02` introduced/promoted corrected Unassigned Owners assignment.
- Production `2026-10-27-v02` remains immutable and retains its historical manifest facts.
- Production `2026-10-25-v03` added the Owner eBay Ban List and `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`, applied and verified on Supabase project `cbzytysxtdcqxuckspye`.

## Canonical retained behavior
Preserve public card pages/SEO/stable URLs/SPA history; Related Cards/Trending/discovery attribution; Inventory/Collection/Sold/Reserved/Favorites; Inventory sorting and custom ordering; Owner Mode and Owner-only tools; JPEG/PNG/WebP/HEIC/HEIF listing photos; established compact Owner Inventory Tools; Owner categories/Unassigned Owners; inventory value; Buyer Messages; private analytics/Buyer Preview; Owner-only AI Card Scanner; eBay Ban List; QR Generator; Post Generators/giveaways; Contact to Buy; Malaysia/Singapore messaging; Supabase/RLS and analytics boundaries; Safari-safe layout; Development analytics-test exclusion in Development only.

## Intentionally removed / excluded
Do not restore Download Share Preview; V200 inquiry basket; V201 custom Share menu/grid; V202 share-menu experiment; V203/V204 compact-layout experiments; abandoned/superseded scanner/layout experiments; old Beta runtime dependencies; Development-only analytics-test behavior in Production; post-v09 duplicate Inventory Manager/dashboard renderer.

## SQL / database baseline
- Latest relevant Production migration remains `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`.
- `public.ebay_banlist` remains Owner-only through RLS.
- Card Owner assignment uses existing private `card_owner_private` metadata and authorization.
- `2026-10-31-v02` changes are client-side and required no SQL/database/RLS/Edge Function change.

## Release contract
A release is complete only after applicable implementation, validation, regression review, committed-file inspection, package integrity checks, immutable manifest, Pages deployment and rollback protection are confirmed. **Tested** means executed; **Statically verified** means repository/code inspection only; **Not tested** means unavailable/not performed. Do not live-open Production for routine testing without explicit authorization.

## Baseline maintenance
Reconcile this file in both Development and Production repositories after every accepted release or meaningful state change. Preserve historical release facts and retained/removed behavior; never rewrite immutable manifests from assumptions.
