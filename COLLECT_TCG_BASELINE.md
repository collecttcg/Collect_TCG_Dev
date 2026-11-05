# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-11-05

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

## Current reconciled state — 2026-11-05

### Latest validated releases
- Development: `2026-11-03-v02`; previous `2026-11-03-v01`; manifest `release-manifests/2026-11-03-v02.txt`; package source `df39a93b2138732c22aa9f674f870df6fd75f76e`.
- Development v02 full ZIP: `Collect-TCG-Dev-2026-11-03-v02-full.zip` (SHA256 `950a31875a30d8d0d373cc171ef730dc37d6e57fca84c5a28847eb83f9d9c5d3`).
- Development v02 patch ZIP: `Collect-TCG-Dev-2026-11-03-v01-to-2026-11-03-v02-patch.zip` (SHA256 `38ad762832ef2a5504a7e8b12c26de719d300b6d8f349d3a588a672c962a3d4c`).
- Production: `2026-11-03-v02`; previous `2026-11-03-v01`; manifest `release-manifests/2026-11-03-v02.txt`; source `5004b407617369d4dcfef88a2d0890ac9661f16f`; manifest/rollback commit `2bdbfee616938d65b35303d38402feff2d05b377`.
- Production v02 full ZIP: `Collect-TCG-Production-2026-11-03-v02-full.zip` (SHA256 `872dc22886389b20a28c45fbaf566dfd31768bba2aa74e385caab0e8d55da07d`).
- Production v02 patch ZIP: `Collect-TCG-Production-2026-11-03-v01-to-2026-11-03-v02-patch.zip` (SHA256 `afae239c9e3b943fd28bb0837f7d0ca5d27abd97e77ec003b182a001137f33de`).
- v02 removed the duplicate eBay Ban List link from More/main navigation while retaining Inventory Tools > eBay > eBay Ban List. No SQL. Both v02 release workflows and Production Pages deployment succeeded; interactive desktop/mobile/Safari testing was not performed.

### Unreleased Development changes / promotion gate
- Development commit `0cae8e53a079fb9ffa777ef8a110fd63f51da4d5`: optional saved eBay listing URL appears below the Collect TCG card URL in single-card Facebook sales posts; registered in `dev/src/app/register-features.js` by commit `b39b883168554add605bb3192bcef6ee4d1d410b`.
- Development commits `3acfcee3e07c316ece793544b0cdf5022b116c08`, `4444acf5930533bd36fbd847e03011a6be25b430`, `3213988c40426db5ea279715f86b196667219aff`: resolve actual card creation timestamp for sale snapshots, record unknown instead of fabricated 2000 date, and update analytics cache reference.
- Development release workflow updated in commit `35ca402a33e321cf2af77fc3961b1f6a7660a221` to attempt validation/packaging of `2026-11-05-v01`; **not a confirmed release** until successful workflow, packages, manifest, and deployment are verified. Do not promote this work to Production without passing the release gate.
- No new schema/RLS migration required by these frontend changes. No interactive browser/Safari testing has been confirmed.

### Shared Supabase data correction
- On 2026-11-04, the existing sale snapshot `card_sale_snapshots.id=43` for LUFFY (`card_id=c21edd25-757c-4f5c-aa5f-0e909c3e0ca4`) was explicitly approved and updated from `days_listed=9803` to `34` in the shared database; readback confirmed 47 snapshots, average 10 days, and no snapshots over 1000 days. This data fix affects both environments and does not imply a Production frontend deployment.

## Historical Development release record (2026-11-03-v01)
Development release at time of this record: `2026-11-03-v01`
Previous Development: `2026-11-02-v03`
Development release manifest: `release-manifests/2026-11-03-v01.txt`
Development v01 package source commit: `8d7a606445ce485a484235136902efdc4a0d7147`
Development v01 manifest commit: `e1eb3109a8eab4fade3293214c375649adb38d1b`

### Development package record — 2026-11-03-v01
- Full ZIP: `Collect-TCG-Dev-2026-11-03-v01-full.zip`
- Full SHA256: `f9fcde33367e3183e7abf1e8515e1050a9a14a1ad19eb28a49f5a5b9cd659867`
- Patch ZIP: `Collect-TCG-Dev-2026-11-02-v03-to-2026-11-03-v01-patch.zip`
- Patch SHA256: `728a8e4fb80cdfdadc702e0fb64ee8d187cd959e0e76c7e1b69a8382e6024e2e`

Current Development behavior:
- Owner Inventory Tools has a dedicated `eBay` category consolidating `eBay Messages`, `eBay Ban List`, and `eBay Listing Status`.
- eBay Messages contains separate `After Purchase` and `After Shipped` templates. The After Shipped template asks a satisfied buyer to leave positive feedback for the store.
- The legacy Buyer Messages Activity link is removed from the rendered Inventory Tools navigation by the consolidated eBay tools module.
- The existing eBay Ban List remains Owner-only and Supabase/RLS protected; its old route redirects into `Inventory Tools > eBay > eBay Ban List`.
- Existing Listed on eBay status, optional eBay URL, public On eBay badge and Owner `On eBay only` inventory filter remain retained.
- MYR below RM400 continues current-rate USD/SGD conversion rounded to the nearest whole amount; RM400+ retains the established upward pricing rule.
- Development SEO refresh remains release-agnostic, was regenerated/validated for this release, and retains `noindex,nofollow,noarchive`.
- Owner-only AI Card Scanner, QR Generator, generators, private analytics and established Owner Inventory Tools remain retained.
- SQL/schema/RLS/Edge Function change required by `2026-11-03-v01`: No.

Development v01 validation completed:
- feature regression tests passed;
- all Development JavaScript syntax checks passed;
- eBay tools/messages/ban-list/listing-status contracts passed;
- retained FX and HEIC contracts passed;
- repository/CSS/release contracts passed;
- SEO self-test, generation and output validation passed;
- full/patch ZIPs created and integrity-checked;
- immutable manifest/checksums recorded.

Development validation limitations:
- Interactive desktop/mobile/Safari browser testing was not performed for v01.

## Historical Production release record (2026-11-03-v01)
Production release at time of this record: `2026-11-03-v01`
Previous Production: `2026-11-02-v03`
Development promoted from: `2026-11-03-v01` source `8d7a606445ce485a484235136902efdc4a0d7147`
Production release manifest: `release-manifests/2026-11-03-v01.txt`
Production v01 package source commit: `d5b23f2448bf4b8af35d8bff9d58099fe9531b9a`
Production v01 manifest commit / validated rollback anchor: `c907d0c685ef0e0b6f3b36d82dc997855c44c0ba`

### Production package record — 2026-11-03-v01
- Full ZIP: `Collect-TCG-Production-2026-11-03-v01-full.zip`
- Full SHA256: `97f2c93f24aad47f67943fb85f6ad7069bbb4f03c1804a506aa9214b29ad9636`
- Patch ZIP: `Collect-TCG-Production-2026-11-02-v03-to-2026-11-03-v01-patch.zip`
- Patch SHA256: `272ffed4f7800cc198028d902a954c0dd3def361e8878a20c6a863eb391bcf08`

### Production 2026-11-03-v01
Purpose: consolidate Owner eBay tools under Inventory Tools > eBay, add a separate After Shipped feedback message, and refresh Production SEO output.

Current Production behavior:
- Owner Inventory Tools now exposes a dedicated `eBay` category with `eBay Messages`, `eBay Ban List`, and `eBay Listing Status`.
- eBay Messages contains separate After Purchase and After Shipped copyable templates; After Shipped asks satisfied buyers for positive store feedback.
- eBay Ban List remains Owner-only and protected by existing Supabase RLS; the former standalone route redirects into the consolidated eBay tools area.
- Existing eBay listing-status controls and public On eBay behavior are retained.
- Production-specific QR Generator, scanner endpoint, analytics/privacy boundaries, generators, Contact to Buy, giveaways and stable public URLs remain retained.
- Production SEO was regenerated and validated with index/follow card metadata, sitemap/robots checks and UUID exclusion.
- Below RM400 FX whole-number conversion and RM400+ upward pricing behavior remain unchanged.
- SQL/database/RLS/Edge Function change required by v01: No.

Production v01 validation completed:
- rollback anchor validated;
- all Production JavaScript syntax checks passed;
- Production/retained and consolidated eBay tools contracts passed;
- SEO workflow guard, SEO self-test, regeneration and output validation passed;
- full/patch ZIPs created and integrity-checked;
- immutable `2026-11-03-v01` manifest/checksums recorded;
- GitHub Pages deployment for the release manifest commit completed successfully;
- `production-last-known-good` advanced to `c907d0c685ef0e0b6f3b36d82dc997855c44c0ba` after Pages success.

Production validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Interactive desktop/mobile/Safari browser testing was not performed.

## Historical immutable state retained
- Production `2026-11-02-v03` / Development `2026-11-02-v03` remain immutable and introduced whole-number current-rate FX conversion below RM400.
- Production `2026-11-02-v02` / Development `2026-11-02-v02` remain immutable and introduced normal current-rate FX conversion below RM400 with two-decimal output before v03 changed that low-price output to whole numbers.
- Production `2026-11-02-v01` remains immutable and contains the validated eBay import-duty refusal notice and Buyer Message `Collect TCG` signature promotion.
- Development `2026-11-02-v01` remains immutable as an earlier Development release.
- Production `2026-11-01-v03` remains immutable and contains the release-agnostic SEO/release infrastructure update.
- Production `2026-11-01-v02` remains immutable and contains earlier Buyer Messages/eBay generator messaging promotion.
- Production `2026-11-01-v01` / Development `2026-11-01-v01` remain immutable prior releases containing eBay listing-status and quick-action viewport preservation.
- Production `2026-10-31-v02` / Development `2026-10-31-v02` remain immutable prior releases containing Inventory sorting and responsive toolbar improvements.
- Production `2026-10-31-v01` / Development `2026-10-31-v01` remain immutable prior releases containing Owner image workflow and PSA POP improvements.
- Production `2026-10-30-v04` / Development `2026-10-30-v06` remain immutable prior releases and retain the modern HEIC decoder path.
- Production `2026-10-25-v03` added the Owner eBay Ban List and `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`, applied and verified on Supabase project `cbzytysxtdcqxuckspye`.

## Canonical retained behavior
Preserve public card pages/SEO/stable URLs/SPA history; Related Cards/Trending/discovery attribution; Inventory/Collection/Sold/Reserved/Favorites; Inventory sorting and custom ordering; Owner Mode and Owner-only tools; JPEG/PNG/WebP/HEIC/HEIF listing photos; compact Owner Inventory Tools; Owner categories/Unassigned Owners; inventory value; eBay Messages; private analytics/Buyer Preview; Owner-only AI Card Scanner; eBay Ban List and listing status; QR Generator; Post Generators/giveaways; Contact to Buy; Malaysia/Singapore messaging; Supabase/RLS and analytics boundaries; Safari-safe layout; Development analytics-test exclusion in Development only.

## Intentionally removed / excluded
Do not restore Download Share Preview; V200 inquiry basket; V201 custom Share menu/grid; V202 share-menu experiment; V203/V204 compact-layout experiments; abandoned/superseded scanner/layout experiments; old Beta runtime dependencies; Development-only analytics-test behavior in Production; post-v09 duplicate Inventory Manager/dashboard renderer.

## SQL / database baseline
- Latest relevant Production migration remains `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`.
- `public.ebay_banlist` remains Owner-only through RLS.
- Card Owner assignment uses existing private `card_owner_private` metadata and authorization.
- Production `2026-11-03-v01` required no SQL/database/RLS/Edge Function change.

## Release contract
A release is complete only after applicable implementation, validation, regression review, committed-file inspection, package integrity checks, immutable manifest, Pages deployment and rollback protection are confirmed. **Tested** means executed; **Statically verified** means repository/code inspection only; **Not tested** means unavailable/not performed. Do not live-open Production for routine testing without explicit authorization.

## Baseline maintenance
Reconcile this file in both Development and Production repositories after every accepted release or meaningful state change. Preserve historical release facts and retained/removed behavior; never rewrite immutable manifests from assumptions.
