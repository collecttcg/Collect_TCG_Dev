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

### Development package record — 2026-11-01-v01
- Full ZIP: `Collect-TCG-Dev-2026-11-01-v01-full.zip`
- Full SHA256: `e8efb6d063e5aed4f0bb2fa03465b1a6ef5358b8e3c5e920b1900b4da1286d98`
- Patch ZIP: `Collect-TCG-Dev-2026-10-31-v02-to-2026-11-01-v01-patch.zip`
- Patch SHA256: `2672666a0aaa85c1c6e688b9f9fcb163305b96e08f72a08a4abdd040d3fe49e4`

### Development 2026-11-01-v01
Purpose: add a lightweight manual eBay cross-listing status without changing the database schema.

Changes retained:
- Owner Add/Edit has a `Listed on eBay` toggle and optional eBay listing URL.
- eBay listing state is stored compatibly inside the existing public `notes` field using an internal marker; the marker is stripped from normal displayed notes.
- Public Inventory cards marked for eBay show a compact `On eBay` badge.
- When an eBay URL is supplied, the badge opens that listing in a new tab; only HTTPS eBay domains are accepted.
- Inventory Filters include `On eBay only` for quickly finding cross-listed cards.
- Existing Inventory Sort, desktop/mobile toolbar behavior, Owner/public boundaries, HEIC/HEIF image handling, PSA POP actions, scanner, QR Generator, eBay Ban List and other retained behavior are unchanged.
- No SQL/schema/RLS/Edge Function change was required.

Validation completed:
- feature regression tests;
- all Development JavaScript syntax checks;
- dedicated eBay listing integration contract;
- local executed marker parse/write, badge, filter and eBay-domain validation test;
- retained Inventory Sort and HEIC integration contracts;
- SEO generator self-test and Development generation;
- repository/reference, CSS and retained release-contract validation;
- full/patch ZIP creation and integrity checks;
- package artifact upload;
- immutable `2026-11-01-v01` manifest recording.

Validation limitations:
- authenticated Owner Add/Edit save was not interactively exercised in a browser;
- interactive desktop/mobile/Safari browser testing was not performed.

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
- Development `2026-10-31-v02` is the previous Development release and the source of current Production `2026-10-31-v02`.
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
- Development `2026-11-01-v01` stores eBay cross-listing status compatibly in the existing `cards.notes` field and requires no migration.
- Production remains `2026-10-31-v02`; the Development eBay listing-status feature has not been promoted.

## Release contract
A release is complete only after applicable implementation, validation, regression review, committed-file inspection, package integrity checks, immutable manifest, Pages deployment and rollback protection are confirmed. **Tested** means executed; **Statically verified** means repository/code inspection only; **Not tested** means unavailable/not performed. Do not live-open Production for routine testing without explicit authorization.

## Baseline maintenance
Reconcile this file after accepted releases or meaningful state changes while respecting Production protection. Preserve historical release facts and retained/removed behavior; never rewrite immutable manifests from assumptions.
