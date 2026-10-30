# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-10-30

## Repositories

- Production: `collecttcg/Collect_TCG`
- Development: `collecttcg/Collect_TCG_Dev`
- Default branch: `main`
- Development is the normal working environment.
- Production is protected and is modified/promoted only when explicitly authorized.

Reconciliation priority: current GitHub HEAD > latest valid release manifest > this baseline > recent Project context > older context.

## Versioning

- `V210` is the final legacy `V###` release; historical releases are never renamed.
- Current releases use `YYYY-MM-DD-vNN` with the actual build date; Development and Production counters are independent.
- Development full: `Collect-TCG-Dev-YYYY-MM-DD-vNN-full.zip`
- Development patch: `Collect-TCG-Dev-OLD-to-NEW-patch.zip`
- Production full: `Collect-TCG-Production-YYYY-MM-DD-vNN-full.zip`
- Production patch: `Collect-TCG-Production-OLD-to-NEW-patch.zip`
- SQL: `YYYY-MM-DD-vNN-DESCRIPTIVE-NAME.sql`
- Historical release manifests are immutable.

## Current Development

Latest validated Development release: `2026-10-30-v03`
Previous Development: `2026-10-30-v02`
Development release manifest: `release-manifests/2026-10-30-v03.txt`
Development v03 package source commit: `3da4d58198fc582180cffc80261bc4f2f6d6f1ac`
Development v03 manifest commit: `f0a52420d800ecc576c25eb2582da25fe020371c`

### Development package record — 2026-10-30-v03

- Full ZIP: `Collect-TCG-Dev-2026-10-30-v03-full.zip`
- Full SHA256: `8a29a645e54d1498295e811a7cd19d53984e5bd1c4250d4584ca4b4f00c13575`
- Patch ZIP: `Collect-TCG-Dev-2026-10-30-v02-to-2026-10-30-v03-patch.zip`
- Patch SHA256: `64a70ffc9d8e68ff98645aca8d6a6c28740a0f871854204a472651d03b881c09`

### Development 2026-10-30-v03 retained/current state

- Owner Inventory Tools → Bulk Edit includes `Unassigned Owners`, showing active non-sold inventory without an assigned private Card Owner.
- Owner can select one, multiple, or all unassigned listings and assign Zakwan, Yen, Daniel, Jack, or Shue directly from Inventory Tools.
- Assignment reuses existing private `card_owner_private` metadata and existing Owner/RLS authorization; no new public card field is exposed.
- Bulk assignment reads and writes in chunks of up to 100 listings.
- The assignment runtime regression `originalPrivateFrom is not a function` was corrected by using the currently initialized Supabase client for the upsert path.
- Cache/version references for `card-owner-category.js` and `dashboard.js` were refreshed in Development v03 so browsers load the corrected modules.
- Contact → Official eBay Accounts and eBay Ban List account shortcuts from Development `2026-10-30-v01` remain retained.
- No SQL/schema/RLS/Edge Function change was required.

## Current Production

Latest Production: `2026-10-30-v02`
Previous Production: `2026-10-30-v01`
Development promoted from: `2026-10-30-v03`
Production release manifest: `release-manifests/2026-10-30-v02.txt`
Production v02 package source commit: `4760776ef14c33261d498ebf2c8aca3abf0e4fb1`
Production last-known-good / release manifest commit: `3eacd0091ed0ccf8fea42bbc50b678d6793f2c17`

### Production package record — 2026-10-30-v02

- Full ZIP: `Collect-TCG-Production-2026-10-30-v02-full.zip`
- Full SHA256: `1c066aa9a4468ed752a38c4836a07d861b0096ae6dfb04c968d4fbfce207b610`
- Patch ZIP: `Collect-TCG-Production-2026-10-30-v01-to-2026-10-30-v02-patch.zip`
- Patch SHA256: `565ac4a7c4125d047736c0048ab070fd1a08b27f1d40fc9f78fe0b412d8ebd7c`

### Production 2026-10-30-v02

Purpose: promote the approved Owner Inventory Tools unassigned-owner assignment flow and its runtime correction from validated Development `2026-10-30-v03`, while preserving Production-specific behavior.

Retained/current behavior:
- Owner Inventory Tools → Bulk Edit exposes `Unassigned Owners` only within Owner-protected tooling.
- Active non-sold listings with no Card Owner can be selected and assigned to Zakwan, Yen, Daniel, Jack, or Shue.
- Existing `card_owner_private` storage and Owner/RLS authorization are reused; public card data remains unchanged.
- Bulk owner assignment supports larger selections through 100-row read/write chunks.
- The `originalPrivateFrom is not a function` failure is corrected by using the current Supabase client for assignment upserts.
- Production cache references for the changed Card Owner and dashboard modules are refreshed to `2026-10-30-v02`.
- Production-specific scanner endpoint remains `scan-card-ai`; Development-only `scan-card-ai-dev` must not appear in Production runtime code.
- QR Generator, eBay account links, eBay Ban List, SEO, analytics/privacy boundaries, Contact to Buy, giveaways, generators, Buyer Messages and established Owner tools remain retained.
- Existing eBay Ban List database/RLS state from Production `2026-10-25-v03` remains unchanged.

SQL required: No.

### Production v02 validation status

Completed:
- rollback-anchor validation;
- all Production JavaScript syntax validation;
- Production repository/reference validation;
- changed module cache/version reference validation;
- Owner unassigned-owner route/marker validation;
- current Supabase assignment upsert-path validation by repository contract;
- CSS and Post Generator validation;
- SEO validation and retained Production endpoint checks;
- full and patch ZIP creation and integrity checks;
- package artifact upload;
- immutable Production manifest/checksum recording;
- GitHub Pages deployment confirmation;
- `production-last-known-good` advanced to `3eacd0091ed0ccf8fea42bbc50b678d6793f2c17` after successful deployment.

Validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Authenticated Owner assignment was not interactively re-exercised in Production after promotion.
- Interactive desktop/mobile/Safari browser testing was not performed during this promotion.

## Earlier validated state retained

- Development `2026-10-30-v02` is immutable; it first packaged the Unassigned Owners feature/runtime correction. Development v03 followed to add explicit cache-buster coverage before Production promotion.
- Development and Production `2026-10-30-v01` remain immutable; Production v01 promoted approved eBay account-link changes.
- Development and Production `2026-10-29-v01` remain immutable historical releases; Production v01 promoted Owner inventory value visibility and Owner Buyer Messages.
- Production `2026-10-27-v02` remains immutable. Its manifest records `Development promoted from: 2026-10-27-v02` despite no matching immutable Development v02 manifest; do not rewrite it.
- Production `2026-10-27-v01` introduced the eBay Post Generator import-duty notice.
- Development `2026-10-25-v09` remains immutable; its custom Inventory Manager/dashboard UI was superseded by restoration of the established compact Inventory Tools workspace.
- Development `2026-10-25-v08` corrected the v07 Owner-navigation `insertBefore` regression and was promoted to Production `2026-10-25-v03`.
- Production `2026-10-25-v03` added/promoted the Owner eBay Ban List and migration `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`; that migration was applied and verified on Supabase project `cbzytysxtdcqxuckspye`.
- Older accepted manifests remain historical immutable records.

## Canonical retained behavior

Preserve unless explicitly changed:
- public card pages, SEO, stable URLs and SPA/history behavior;
- Related Cards, Trending and discovery attribution;
- Inventory/Collection/Sold/Reserved/Favorites flows;
- Owner Mode and owner-only Add/Edit/Delete/bulk/lifecycle/export tools;
- established compact Owner Inventory Tools and specialist subtools;
- Owner-only Card Owner categories and Unassigned Owners assignment workflow;
- Available inventory value in Owner Overview;
- Owner-only Buyer Messages;
- Owner private analytics and Buyer Preview privacy;
- Owner-only AI Card Scanner;
- Owner-only shared eBay Ban List;
- QR Generator;
- Facebook/Carousell/eBay/Post Generator and giveaway functionality;
- Contact to Buy intents: Availability, Make an offer, More photos / video, COD / meetup;
- Malaysia & Singapore purchase messaging and negotiable international shipping;
- Supabase/RLS behavior and analytics boundaries;
- Safari-safe purchase/contact layout;
- Development analytics-test exclusion behavior in Development only.

## Intentionally removed / excluded

Do not restore unless explicitly requested:
- Download Share Preview;
- V200 multi-card inquiry basket;
- V201 custom Share menu/grid;
- V202 share-menu experiment;
- V203/V204 compact-layout experiments;
- abandoned/superseded scanner/layout experiments;
- old Beta runtime dependencies;
- Development-only analytics-test behavior in Production;
- the post-v09 duplicate custom Inventory Manager/dashboard renderer.

## SQL / database baseline

- Latest relevant Production migration remains `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`.
- Shared `public.ebay_banlist` remains Owner-only through RLS.
- Card Owner assignment continues to use existing private `card_owner_private` metadata and existing authorization; no SQL/database change was required for Development `2026-10-30-v03` or Production `2026-10-30-v02`.
- Never claim SQL, policies, Edge Functions or backend changes were applied unless confirmed.

## Refactoring candidates — not approved changes

Potential future Dev-only behavior-preserving work:
- centralize Owner navigation/route registration;
- add shared safe DOM/clipboard/notification helpers;
- isolate Supabase operations behind small service/repository modules;
- reduce duplicated Owner CSS without visual changes;
- expand reusable Owner-route/startup/public-exclusion regression coverage;
- consolidate common validation/release tooling while preserving Development/Production separation.

These are candidates only. Avoid broad rewrites and unrelated changes.

## Release and validation contract

A release is complete only after applicable implementation, validation, regression review, committed-file inspection, package creation/integrity checks, immutable manifest recording, Pages deployment and rollback protection are confirmed. A commit alone is not completion.

Terminology:
- **Tested** = executed/exercised.
- **Statically verified** = repository/code inspection only.
- **Not tested** = unavailable/not performed.

Do not live-open Production for testing unless explicitly authorized because it may contaminate Insights.

## Baseline maintenance

Reconcile `COLLECT_TCG_BASELINE.md` in both Development and Production repositories after every accepted release or meaningful environment-state change. This is part of release completion, not an optional follow-up. Preserve historical release facts and retained/removed behavior; never rewrite immutable release manifests from assumptions.
