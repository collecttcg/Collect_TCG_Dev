# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-11-01

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
Latest validated Development release: `2026-11-01-v01`
Previous Development: `2026-10-31-v02`
Development release manifest: `release-manifests/2026-11-01-v01.txt`
Development v01 package source commit: `64f67120c371b13b77fa38fa8c72fd773fe941c2`
Development v01 manifest commit: `43741587717b1d56ef5f9ef09347a78079e64235`
Current Development SEO infrastructure HEAD: `85119351ed036dfe374ea67b773b6b955099e254`

### Development package record — 2026-11-01-v01
- Full ZIP: `Collect-TCG-Dev-2026-11-01-v01-full.zip`
- Full SHA256: `e8efb6d063e5aed4f0bb2fa03465b1a6ef5358b8e3c5e920b1900b4da1286d98`
- Patch ZIP: `Collect-TCG-Dev-2026-10-31-v02-to-2026-11-01-v01-patch.zip`
- Patch SHA256: `2672666a0aaa85c1c6e688b9f9fcb163305b96e08f72a08a4abdd040d3fe49e4`

Current Development behavior:
- Inventory Sort remains separate from Filters with retained desktop/mobile responsive toolbar behavior and Most Popular sorting.
- Owner cards support `On eBay` status, optional validated eBay URL, Owner-only filter, image badge and quick-menu Mark/Remove actions.
- Owner quick actions preserve viewport position after availability, eBay-status and lifecycle changes.
- Buyer Messages include the updated post-purchase packing/video-recording notice.
- eBay Post Generator removes Item Specifics from the generated description/page output, adds packing-video language, tracking language and the retained import duties/taxes notice.
- Development SEO refresh is release-agnostic, validates the intended `noindex,nofollow,noarchive` policy, and no longer packages/releases or checks release-specific cache versions.
- `tools/check.mjs` validates current baseline structure by format rather than hard-coded release numbers.
- Owner-only AI Card Scanner, QR Generator, eBay Ban List, generators, private analytics and established Owner Inventory Tools remain retained.
- No SQL/schema/RLS/Edge Function change was required.

## Current Production
Latest Production: `2026-11-01-v03`
Previous Production: `2026-11-01-v02`
Development promoted from: latest validated application state `1427c2649715e4c081327dde5224bc5c5546a0c1`; v03 is SEO/release infrastructure only.
Production release manifest: `release-manifests/2026-11-01-v03.txt`
Production v03 package source commit: `83921d14a1e93f3f0f95df8aeebe5c4486dcf73e`
Production v03 manifest commit: `c8d6b32a1410b60033db6745abb763d927e9c972`

### Production package record — 2026-11-01-v03
- Full ZIP: `Collect-TCG-Production-2026-11-01-v03-full.zip`
- Full SHA256: `91b2c2a82b265dea971c9b5b3cbb0dc1103679bf9a0f25b3c3607b74c3acc8d3`
- Patch ZIP: `Collect-TCG-Production-2026-11-01-v02-to-2026-11-01-v03-patch.zip`
- Patch SHA256: `6e859a1c44812e5697e17cc71a43889d59ba275415a2cbf6fad77b257cdd04db`

### Production 2026-11-01-v03
Purpose: permanently decouple routine SEO refresh from release/cache-version metadata so normal cache busts and release-number changes do not break SEO validation.

Current behavior:
- Production SEO validates sitemap/robots/card metadata, stable public URLs, UUID exclusion and Production-only privacy/runtime boundaries.
- SEO no longer hard-codes feature cache versions or unrelated release-specific module assertions.
- Production baseline validation uses release-format checks instead of fixed release numbers.
- `tools/check-seo-workflow.mjs` prevents release-specific cache assertions from returning to SEO.
- Development has the equivalent guard and validates its intentional noindex policy.
- Buyer Messages, eBay generator, compact Inventory filters, On eBay status/quick actions, HEIC/HEIF, scanner, QR Generator, eBay Ban List and Owner/public boundaries remain retained.
- SQL required: No.

Validation completed:
- Development feature regression tests: 80/80 passed;
- Development repository/CSS checks, SEO guard, SEO self-test and generation passed;
- Development generated 336 public card pages and 23 Owner-only routes under its noindex policy;
- Production rollback anchor checked;
- all Production JavaScript syntax checked;
- Production repository/retained contracts and SEO workflow guard passed;
- Production SEO self-test/regeneration passed;
- v03 full/patch ZIPs created and integrity-checked;
- immutable v03 manifest/checksums recorded;
- GitHub Pages deployment for v03 manifest commit succeeded;
- `production-last-known-good` advanced after Pages success.

Validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Interactive desktop/mobile/Safari browser testing was not performed; v03 is infrastructure/validation only.

## Historical immutable state retained
- Production `2026-11-01-v02` remains immutable and contains the Buyer Messages/eBay generator messaging promotion.
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
- Production `2026-11-01-v03` required no SQL/database/RLS/Edge Function change.

## Release contract
A release is complete only after applicable implementation, validation, regression review, committed-file inspection, package integrity checks, immutable manifest, Pages deployment and rollback protection are confirmed. **Tested** means executed; **Statically verified** means repository/code inspection only; **Not tested** means unavailable/not performed. Do not live-open Production for routine testing without explicit authorization.

## Baseline maintenance
Reconcile this file in both Development and Production repositories after every accepted release or meaningful state change. Preserve historical release facts and retained/removed behavior; never rewrite immutable manifests from assumptions.
