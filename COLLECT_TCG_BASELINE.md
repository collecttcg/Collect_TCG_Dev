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
Latest validated Development release: `2026-10-31-v01`
Previous Development: `2026-10-30-v06`
Development release manifest: `release-manifests/2026-10-31-v01.txt`
Development v01 package source commit: `c2636c086462e59729b297ebd49083464d9031ec`
Development v01 manifest commit: `67d9298ea9322b5ba12d677d22181147009b00a0`

### Development package record — 2026-10-31-v01
- Full ZIP: `Collect-TCG-Dev-2026-10-31-v01-full.zip`
- Full SHA256: `726a4a8a49f217c1e42d112e8bc1570ad2ff94d3f0d6aca1b29390fae191be3c`
- Patch ZIP: `Collect-TCG-Dev-2026-10-30-v06-to-2026-10-31-v01-patch.zip`
- Patch SHA256: `68a82c5016196e3b5fd9b5de55c4fae4a395e5543bf7de8e09e7236eb3800c27`

Current Development behavior:
- Owner Add/Edit retains JPEG, PNG, WebP, HEIC and HEIF support with native decode first and pinned `heic-to` 1.6.7 fallback.
- Owner Add/Edit listing photos support file drop and drag-reorder edge auto-scroll.
- Owner Inventory Tools → PSA POP includes `Get Never-Synced PSA POPs (N)`, limited to PSA listings with a certificate and no saved POP count.
- Existing Update Due / Update All PSA behavior remains unchanged.
- Owner-only AI Card Scanner, QR Generator, eBay account links/Ban List, Buyer Messages, generators, private analytics and established Inventory Tools remain retained.
- Development SEO card pages, sitemap and slug map were regenerated and validated for v01.
- No SQL/schema/RLS/Edge Function change was required.

## Current Production
Latest Production: `2026-10-31-v01`
Previous Production: `2026-10-30-v04`
Development promoted from: `2026-10-31-v01`
Production release manifest: `release-manifests/2026-10-31-v01.txt`
Production v01 package source commit: `c5e9821ba15e14def560413ab283eb6bb48c8045`
Production last-known-good / release manifest commit: `7da37d811ab4e2c4d9cf50d4050ab068ed88d76f`

### Production package record — 2026-10-31-v01
- Full ZIP: `Collect-TCG-Production-2026-10-31-v01-full.zip`
- Full SHA256: `2c6584a316b50b2617908687cd950372f67158e8f42c36046ba237c7d35c0b50`
- Patch ZIP: `Collect-TCG-Production-2026-10-30-v04-to-2026-10-31-v01-patch.zip`
- Patch SHA256: `18876d3d6dcb13de721fec93e113cb47b686aa6d40e8ab27ccb166c4638eb07a`

### Production 2026-10-31-v01
Purpose: promote validated Development `2026-10-31-v01` Owner image workflow and PSA POP improvements while preserving Production-specific behavior and refreshing SEO.

Retained/current behavior:
- Owner Add/Edit supports listing-photo file drop and drag-reorder edge auto-scroll.
- PSA POP includes the focused never-synced action for certificate-bearing PSA listings with no saved POP count; existing Due/All actions are unchanged.
- HEIC/HEIF support remains Owner-only and client-side; native decode first, pinned `heic-to` 1.6.7 fallback.
- Production scanner remains `scan-card-ai`; `scan-card-ai-dev` must not appear in Production runtime code.
- QR Generator, eBay accounts/Ban List, Buyer Messages, SEO/stable URLs, analytics/privacy boundaries, Contact to Buy, giveaways and generators remain retained.
- Production SEO card pages were regenerated after promotion and the SEO validation gate passed.
- SQL required: No.

Validation completed: rollback anchor; all Production JavaScript syntax; Production repository/reference checks; promoted v01 integration contracts; retained HEIC contract; CSS/Post Generator checks; SEO generator self-test and Production SEO validation; full/patch ZIP creation and integrity checks; package artifact upload; immutable Production manifest/checksums; Pages deployment confirmation and last-known-good advancement.

Validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Interactive desktop/mobile/Safari browser testing was not performed during this promotion.

## Historical immutable state retained
- Production `2026-10-30-v04` / Development `2026-10-30-v06` remain immutable prior releases and retain the modern HEIC decoder path.
- Development `2026-10-30-v04` / Production `2026-10-30-v03` introduced/promoted initial HEIC support.
- Development `2026-10-30-v03` / Production `2026-10-30-v02` introduced/promoted corrected Unassigned Owners assignment.
- Production `2026-10-27-v02` remains immutable and retains its historical manifest facts.
- Production `2026-10-25-v03` added the Owner eBay Ban List and `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`, applied and verified on Supabase project `cbzytysxtdcqxuckspye`.

## Canonical retained behavior
Preserve public card pages/SEO/stable URLs/SPA history; Related Cards/Trending/discovery attribution; Inventory/Collection/Sold/Reserved/Favorites; Owner Mode and Owner-only tools; JPEG/PNG/WebP/HEIC/HEIF listing photos; established compact Owner Inventory Tools; Owner categories/Unassigned Owners; inventory value; Buyer Messages; private analytics/Buyer Preview; Owner-only AI Card Scanner; eBay Ban List; QR Generator; Post Generators/giveaways; Contact to Buy; Malaysia/Singapore messaging; Supabase/RLS and analytics boundaries; Safari-safe layout; Development analytics-test exclusion in Development only.

## Intentionally removed / excluded
Do not restore Download Share Preview; V200 inquiry basket; V201 custom Share menu/grid; V202 share-menu experiment; V203/V204 compact-layout experiments; abandoned/superseded scanner/layout experiments; old Beta runtime dependencies; Development-only analytics-test behavior in Production; post-v09 duplicate Inventory Manager/dashboard renderer.

## SQL / database baseline
- Latest relevant Production migration remains `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`.
- `public.ebay_banlist` remains Owner-only through RLS.
- Card Owner assignment uses existing private `card_owner_private` metadata and authorization.
- 2026-10-31-v01 changes are client-side and required no SQL/database/RLS/Edge Function change.

## Release contract
A release is complete only after applicable implementation, validation, regression review, committed-file inspection, package integrity checks, immutable manifest, Pages deployment and rollback protection are confirmed. **Tested** means executed; **Statically verified** means repository/code inspection only; **Not tested** means unavailable/not performed. Do not live-open Production for routine testing without explicit authorization.

## Baseline maintenance
Reconcile this file in both Development and Production repositories after every accepted release or meaningful state change. Preserve historical release facts and retained/removed behavior; never rewrite immutable manifests from assumptions.
