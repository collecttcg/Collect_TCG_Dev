# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-10-30

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
Latest validated Development release: `2026-10-30-v06`
Previous Development: `2026-10-30-v05`
Development release manifest: `release-manifests/2026-10-30-v06.txt`
Development v06 package source commit: `6e32e6221ea041a09e601b82819a914577cc0383`
Development v06 manifest commit: `53a3c87e2d32e7eb620a4444d2e016c639527da4`

### Development package record — 2026-10-30-v06
- Full ZIP: `Collect-TCG-Dev-2026-10-30-v06-full.zip`
- Full SHA256: `41e65ed67ea5d14b255a7d7567a35a6bdce157dfff5fecf68cf2616ccb237dc3`
- Patch ZIP: `Collect-TCG-Dev-2026-10-30-v05-to-2026-10-30-v06-patch.zip`
- Patch SHA256: `80f2801ff8e17f7c6314c402a7d94b74e5546b9768dc8e1bf3cb7cf1b1543d6e`

Current Development behavior:
- Owner Add/Edit accepts JPEG, PNG, WebP, HEIC and HEIF, including HEIC/HEIF sequence MIME variants.
- HEIC conversion remains Owner-only and client-side. Native browser decode is attempted first; fallback is pinned `heic-to` 1.6.7 loaded on demand from jsDelivr.
- Existing image-size limits and JPEG/PNG/WebP behavior remain unchanged.
- established compact Owner Inventory Tools retain Unassigned Owners assignment, private Card Owner metadata and 100-row chunking.
- Owner-only AI Card Scanner, QR Generator, eBay account links/Ban List, Buyer Messages and generators remain retained.
- No SQL/schema/RLS/Edge Function change was required.

## Current Production
Latest Production: `2026-10-30-v04`
Previous Production: `2026-10-30-v03`
Development promoted from: `2026-10-30-v06`
Production release manifest: `release-manifests/2026-10-30-v04.txt`
Production v04 package source commit: `d9956480c288128206814f52af16a9fd376d1753`
Production last-known-good / release manifest commit: `24383c875d63992fcf302cce5fc3b752215c34de`

### Production package record — 2026-10-30-v04
- Full ZIP: `Collect-TCG-Production-2026-10-30-v04-full.zip`
- Full SHA256: `f0dc80b9ffd1685d486d69310e5a571ea4200e3c42334ffbdce6d5be259ddaf9`
- Patch ZIP: `Collect-TCG-Production-2026-10-30-v03-to-2026-10-30-v04-patch.zip`
- Patch SHA256: `4c52a4404ac0192cf3bbc91b124d77de776857a39e48e115ef40b7f7ffab9097`

### Production 2026-10-30-v04
Purpose: promote the validated modern iPhone HEIC decoder path from Development `2026-10-30-v06` while preserving Production-specific behavior.

Retained/current behavior:
- Owner Add/Edit accepts HEIC/HEIF plus JPEG/PNG/WebP.
- Native decode is attempted first; fallback uses pinned `heic-to` 1.6.7 and converts to JPEG before the existing image pipeline.
- Owner authorization and existing image-size limits remain in force; no public upload surface was added.
- Production scanner remains `scan-card-ai`; `scan-card-ai-dev` must not appear in Production runtime code.
- QR Generator, eBay Ban List, SEO, analytics/privacy boundaries, Contact to Buy, giveaways, generators, Buyer Messages and Owner tools remain retained.
- eBay Post Generator import-duty notice remains retained.
- SQL required: No.

Validation completed: rollback anchor; all Production JS syntax; repository/reference checks; HEIC Add/Edit integration and decoder availability; CSS/Post Generator/SEO checks; package creation and ZIP integrity; artifact upload; immutable manifest/checksums; Pages deployment; last-known-good advancement.

Validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- The user's exact `IMG_6923.HEIC` was not available as a file for interactive upload testing.
- Interactive desktop/mobile/Safari browser testing was not performed during this promotion.

## Historical immutable state retained
- Development `2026-10-30-v05` is immutable and superseded by v06 for HEIC compatibility.
- Development `2026-10-30-v04` / Production `2026-10-30-v03` introduced/promoted initial HEIC support.
- Development `2026-10-30-v03` / Production `2026-10-30-v02` introduced/promoted corrected Unassigned Owners assignment.
- Production `2026-10-27-v02` remains immutable and retains its historical manifest facts.
- Production `2026-10-25-v03` added the Owner eBay Ban List and `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`, applied and verified on Supabase project `cbzytysxtdcqxuckspye`.
- Historical validator snapshot for the prior accepted release: Latest validated Development release: `2026-10-30-v04`; Latest Production: `2026-10-30-v03`; Previous Production: `2026-10-30-v02`; Development promoted from: `2026-10-30-v04`.

## Canonical retained behavior
Preserve public card pages/SEO/stable URLs/SPA history; Related Cards/Trending/discovery attribution; Inventory/Collection/Sold/Reserved/Favorites; Owner Mode and Owner-only tools; JPEG/PNG/WebP/HEIC/HEIF listing photos; established compact Owner Inventory Tools; Owner categories/Unassigned Owners; inventory value; Buyer Messages; private analytics/Buyer Preview; Owner-only AI Card Scanner; eBay Ban List; QR Generator; Post Generators/giveaways; Contact to Buy; Malaysia/Singapore messaging; Supabase/RLS and analytics boundaries; Safari-safe layout; Development analytics-test exclusion in Development only.

## Intentionally removed / excluded
Do not restore Download Share Preview; V200 inquiry basket; V201 custom Share menu/grid; V202 share-menu experiment; V203/V204 compact-layout experiments; abandoned/superseded scanner/layout experiments; old Beta runtime dependencies; Development-only analytics-test behavior in Production; post-v09 duplicate Inventory Manager/dashboard renderer.

## SQL / database baseline
- Latest relevant Production migration remains `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`.
- `public.ebay_banlist` remains Owner-only through RLS.
- Card Owner assignment uses existing private `card_owner_private` metadata and authorization.
- HEIC support is client-side and required no SQL/database/RLS/Edge Function change for Development v06 or Production v04.

## Release contract
A release is complete only after applicable implementation, validation, regression review, committed-file inspection, package integrity checks, immutable manifest, Pages deployment and rollback protection are confirmed. **Tested** means executed; **Statically verified** means repository/code inspection only; **Not tested** means unavailable/not performed. Do not live-open Production for routine testing without explicit authorization.

## Baseline maintenance
Reconcile this file in both repositories after every accepted release or meaningful state change. Preserve historical release facts and retained/removed behavior; never rewrite immutable manifests from assumptions.
