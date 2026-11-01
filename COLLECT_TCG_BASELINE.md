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
Current validated Development HEAD promoted to Production: `1427c2649715e4c081327dde5224bc5c5546a0c1`

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
- Owner Add/Edit retains JPEG/PNG/WebP/HEIC/HEIF, file drop and drag-reorder edge auto-scroll.
- Owner-only AI Card Scanner, QR Generator, eBay Ban List, generators, private analytics and established Owner Inventory Tools remain retained.
- No SQL/schema/RLS/Edge Function change was required.

## Current Production
Latest Production: `2026-11-01-v02`
Previous Production: `2026-11-01-v01`
Development promoted from: latest validated Development state `1427c2649715e4c081327dde5224bc5c5546a0c1`
Production release manifest: `release-manifests/2026-11-01-v02.txt`
Production v02 package source commit: `12b8d7afea6ba27cf3aaa245b5d6d5786e3a7b66`
Production v02 manifest commit: `b47619734c9d6a399a7e8366761d0ce653579f54`

### Production package record — 2026-11-01-v02
- Full ZIP: `Collect-TCG-Production-2026-11-01-v02-full.zip`
- Full SHA256: `187a32fd88c3a69633441f82bc04f0e412e0c508638c8b8f2b7c70baaf366a7c`
- Patch ZIP: `Collect-TCG-Production-2026-11-01-v01-to-2026-11-01-v02-patch.zip`
- Patch SHA256: `fed563aa49cbc20970746f92acf1ea11ebc43939f2f65194bfc8134cde8200a7`

### Production 2026-11-01-v02
Purpose: promote the latest validated Buyer Messages/eBay generator messaging changes, retain the compact expanded desktop Inventory filters already present on Production, repair the stale Production validator, and refresh Production SEO.

Retained/current behavior:
- Buyer Messages post-purchase template now states that the packaging process is video recorded before carrier handoff.
- eBay Post Generator removes Item Specifics from the generated description/page output and adds packing-video language before tracking plus the retained import duties/taxes notice.
- Inventory expanded desktop filters retain the compact layout; Inventory Sort remains outside Filters with Most Popular and established sorting methods.
- Owner quick menu retains Mark/Remove On eBay and availability/lifecycle actions without viewport jumping.
- Owner Edit retains Listed on eBay plus optional validated eBay URL; internal notes marker remains hidden from normal displayed notes.
- Production scanner remains `scan-card-ai`; Development-only analytics-test behavior remains excluded.
- Owner image workflow, HEIC/HEIF, PSA POP tools, QR Generator, eBay Ban List, SEO/stable URLs, analytics/privacy boundaries, Contact to Buy, giveaways and generators remain retained.
- SQL required: No.

Validation completed:
- Production rollback anchor checked;
- all Production JavaScript syntax checked;
- Production repository and retained behavior contracts executed;
- Buyer Messages/eBay generator contracts executed;
- CSS/Post Generator validation executed;
- SEO generator self-test and Production SEO regeneration completed successfully;
- full/patch ZIPs created and integrity-checked;
- package artifacts uploaded;
- immutable `2026-11-01-v02` manifest/checksums recorded;
- GitHub Pages build/deployment for the release manifest commit completed successfully;
- release workflow advanced `production-last-known-good` after Pages success.

Validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Interactive desktop/mobile/Safari browser testing was not performed during Production promotion.

## Historical immutable state retained
- Production `2026-11-01-v01` / Development `2026-11-01-v01` remain immutable prior releases containing eBay listing-status and quick-action viewport preservation.
- Historical validator compatibility snapshot: Latest Production: `2026-11-01-v01`; Previous Production: `2026-10-31-v02`; Development promoted from: `2026-11-01-v01`.
- Production `2026-10-31-v02` / Development `2026-10-31-v02` remain immutable prior releases containing Inventory sorting and responsive toolbar improvements.
- Production `2026-10-31-v01` / Development `2026-10-31-v01` remain immutable prior releases containing Owner image workflow and PSA POP improvements.
- Production `2026-10-30-v04` / Development `2026-10-30-v06` remain immutable prior releases and retain the modern HEIC decoder path.
- Development `2026-10-30-v04` / Production `2026-10-30-v03` introduced/promoted initial HEIC support.
- Development `2026-10-30-v03` / Production `2026-10-30-v02` introduced/promoted corrected Unassigned Owners assignment.
- Production `2026-10-27-v02` remains immutable and retains its historical manifest facts.
- Production `2026-10-25-v03` added the Owner eBay Ban List and `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`, applied and verified on Supabase project `cbzytysxtdcqxuckspye`.

## Canonical retained behavior
Preserve public card pages/SEO/stable URLs/SPA history; Related Cards/Trending/discovery attribution; Inventory/Collection/Sold/Reserved/Favorites; Inventory sorting and custom ordering; Owner Mode and Owner-only tools; JPEG/PNG/WebP/HEIC/HEIF listing photos; compact Owner Inventory Tools; Owner categories/Unassigned Owners; inventory value; Buyer Messages; private analytics/Buyer Preview; Owner-only AI Card Scanner; eBay Ban List and listing status; QR Generator; Post Generators/giveaways; Contact to Buy; Malaysia/Singapore messaging; Supabase/RLS and analytics boundaries; Safari-safe layout; Development analytics-test exclusion in Development only.

## Intentionally removed / excluded
Do not restore Download Share Preview; V200 inquiry basket; V201 custom Share menu/grid; V202 share-menu experiment; V203/V204 compact-layout experiments; abandoned/superseded scanner/layout experiments; old Beta runtime dependencies; Development-only analytics-test behavior in Production; post-v09 duplicate Inventory Manager/dashboard renderer.

## SQL / database baseline
- Latest relevant Production migration remains `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`.
- `public.ebay_banlist` remains Owner-only through RLS.
- Card Owner assignment uses existing private `card_owner_private` metadata and authorization.
- Production `2026-11-01-v02` changes are client-side and required no SQL/database/RLS/Edge Function change.

## Release contract
A release is complete only after applicable implementation, validation, regression review, committed-file inspection, package integrity checks, immutable manifest, Pages deployment and rollback protection are confirmed. **Tested** means executed; **Statically verified** means repository/code inspection only; **Not tested** means unavailable/not performed. Do not live-open Production for routine testing without explicit authorization.

## Baseline maintenance
Reconcile this file in both Development and Production repositories after every accepted release or meaningful state change. Preserve historical release facts and retained/removed behavior; never rewrite immutable manifests from assumptions.
