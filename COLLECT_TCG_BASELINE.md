# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-11-02

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
Latest validated Development release: `2026-11-02-v02`
Previous Development: `2026-11-02-v01`
Development release manifest: `release-manifests/2026-11-02-v02.txt`
Development v02 package source commit: `5fd899b1176480107c34165e5847d408edfc449a`
Development v02 manifest commit: `55c1d4c74b72513e38c4928b5785137b6bbc0ae7`

### Development package record — 2026-11-02-v02
- Full ZIP: `Collect-TCG-Dev-2026-11-02-v02-full.zip`
- Full SHA256: `09a0d55d081aea95c1f5fe0fd6d65cb3b70df5408fe92f613fd6e0635d071fc4`
- Patch ZIP: `Collect-TCG-Dev-2026-11-02-v01-to-2026-11-02-v02-patch.zip`
- Patch SHA256: `0ee18cabc412e8b50d73b6b74056f458425f41b8a696d564f1a38b35e5a6172b`

Current Development behavior:
- MYR is the primary owner-entered price. For MYR prices below RM400, automatic USD and SGD conversion uses the current FX rate and rounds only to two decimal places. At RM400 and above, the established upward pricing rule remains: round up to the next 50, with the clean-hundred rule allowed only upward when within the configured tolerance.
- The expanded desktop Inventory filter panel has the newer compact typography/control sizing; mobile filter behavior was not intentionally changed by that styling update.
- eBay Listing Generator keeps the standalone Item Specifics UI removed, but relevant Item Specifics are included inside the generated Description. Import duties/taxes and packing/tracking language remain retained.
- Buyer Messages end with `Collect TCG` and retain the packing/video-recording and import-charge notice.
- Inventory Sort remains separate from Filters with retained desktop/mobile responsive toolbar behavior and Most Popular sorting.
- Owner cards retain `On eBay` status, optional validated eBay URL, Owner-only filter, image badge and quick-menu Mark/Remove actions.
- Owner quick actions preserve viewport position after availability, eBay-status and lifecycle changes.
- Development SEO refresh is release-agnostic and retains the intended `noindex,nofollow,noarchive` policy.
- Owner-only AI Card Scanner, QR Generator, eBay Ban List, generators, private analytics and established Owner Inventory Tools remain retained.
- SQL/schema/RLS/Edge Function change required by `2026-11-02-v02`: No.

Development v02 validation completed:
- feature regression tests passed;
- all Development JavaScript syntax checks passed;
- low-price FX threshold/registration contract passed;
- repository/CSS/release contracts passed;
- SEO self-test/generation passed;
- full/patch ZIPs created and integrity-checked;
- immutable manifest/checksums recorded.

Development validation limitations:
- Interactive desktop/mobile/Safari browser testing was not performed for v02.

## Current Production
Latest Production: `2026-11-02-v02`
Previous Production: `2026-11-02-v01`
Development promoted from: `2026-11-02-v02` source `5fd899b1176480107c34165e5847d408edfc449a`
Production release manifest: `release-manifests/2026-11-02-v02.txt`
Production v02 package source commit: `2c330d4bdcf44d17db5738d937c943eb701c5e6d`
Production v02 manifest commit: `d6e1d095264d77e3513e6a4687632b407b53578b`

### Production package record — 2026-11-02-v02
- Full ZIP: `Collect-TCG-Production-2026-11-02-v02-full.zip`
- Full SHA256: `17b2274353e2914a8de54045cccc0433800600d9e4c5c4be7df944a777e1bfc6`
- Patch ZIP: `Collect-TCG-Production-2026-11-02-v01-to-2026-11-02-v02-patch.zip`
- Patch SHA256: `3f34715a805eb66bc0f3d0384783c4cdd647ddd696d0210ba4bda4a3bb958330`

### Production 2026-11-02-v02
Purpose: use normal current-rate USD/SGD conversion for MYR prices below RM400 while retaining the established rounded pricing policy at RM400 and above.

Current Production behavior:
- Below RM400, automatic USD/SGD conversion preserves normal FX pricing to two decimal places instead of applying the 50-unit pricing step.
- At RM400 and above, converted prices never round down; they retain the upward 50-unit step and upward clean-hundred tolerance rule.
- eBay Listing Generator retains Item Specifics inside the generated Description while the separate Item Specifics UI remains removed.
- eBay import duties/taxes refusal wording, Buyer Message `Collect TCG` signature, packing/tracking language, On eBay status/quick actions, HEIC/HEIF, scanner, QR Generator, eBay Ban List, SEO/stable URLs and Owner/public boundaries remain retained.
- Production SEO remains release-agnostic and validates sitemap/robots/card metadata, stable public URLs, UUID exclusion and Production-only privacy/runtime boundaries.
- SQL/database/RLS/Edge Function change required by v02: No.

Production v02 validation completed:
- rollback anchor validated;
- all Production JavaScript syntax checks passed;
- Production repository/retained contracts passed;
- low-price FX threshold/registration contract passed;
- SEO workflow guard and SEO self-test/regeneration passed;
- full/patch ZIPs created and integrity-checked;
- immutable `2026-11-02-v02` manifest/checksums recorded;
- GitHub Pages deployment for the v02 manifest commit completed successfully;
- release workflow advanced `production-last-known-good` after Pages success.

Production validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Interactive desktop/mobile/Safari browser testing was not performed.

## Historical immutable state retained
- Production `2026-11-02-v01` remains immutable and contains the validated eBay import-duty refusal notice and Buyer Message `Collect TCG` signature promotion.
- Development `2026-11-02-v01` remains immutable as the prior Development release.
- Production `2026-11-01-v03` remains immutable and contains the release-agnostic SEO/release infrastructure update.
- Production `2026-11-01-v02` remains immutable and contains earlier Buyer Messages/eBay generator messaging promotion.
- Production `2026-11-01-v01` / Development `2026-11-01-v01` remain immutable prior releases containing eBay listing-status and quick-action viewport preservation.
- Production `2026-10-31-v02` / Development `2026-10-31-v02` remain immutable prior releases containing Inventory sorting and responsive toolbar improvements.
- Production `2026-10-31-v01` / Development `2026-10-31-v01` remain immutable prior releases containing Owner image workflow and PSA POP improvements.
- Production `2026-10-30-v04` / Development `2026-10-30-v06` remain immutable prior releases and retain the modern HEIC decoder path.
- Production `2026-10-25-v03` added the Owner eBay Ban List and `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`, applied and verified on Supabase project `cbzytysxtdcqxuckspye`.

## Canonical retained behavior
Preserve public card pages/SEO/stable URLs/SPA history; Related Cards/Trending/discovery attribution; Inventory/Collection/Sold/Reserved/Favorites; Inventory sorting and custom ordering; Owner Mode and Owner-only tools; JPEG/PNG/WebP/HEIC/HEIF listing photos; compact Owner Inventory Tools; Owner categories/Unassigned Owners; inventory value; Buyer Messages; private analytics/Buyer Preview; Owner-only AI Card Scanner; eBay Ban List and listing status; QR Generator; Post Generators/giveaways; Contact to Buy; Malaysia/Singapore messaging; Supabase/RLS and analytics boundaries; Safari-safe layout; Development analytics-test exclusion in Development only.

## Intentionally removed / excluded
Do not restore Download Share Preview; V200 inquiry basket; V201 custom Share menu/grid; V202 share-menu experiment; V203/V204 compact-layout experiments; abandoned/superseded scanner/layout experiments; old Beta runtime dependencies; Development-only analytics-test behavior in Production; post-v09 duplicate Inventory Manager/dashboard renderer.

## SQL / database baseline
- Latest relevant Production migration remains `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`.
- `public.ebay_banlist` remains Owner-only through RLS.
- Card Owner assignment uses existing private `card_owner_private` metadata and authorization.
- Production `2026-11-02-v02` required no SQL/database/RLS/Edge Function change.

## Release contract
A release is complete only after applicable implementation, validation, regression review, committed-file inspection, package integrity checks, immutable manifest, Pages deployment and rollback protection are confirmed. **Tested** means executed; **Statically verified** means repository/code inspection only; **Not tested** means unavailable/not performed. Do not live-open Production for routine testing without explicit authorization.

## Baseline maintenance
Reconcile this file in both Development and Production repositories after every accepted release or meaningful state change. Preserve historical release facts and retained/removed behavior; never rewrite immutable manifests from assumptions.
