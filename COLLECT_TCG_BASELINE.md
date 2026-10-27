# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-10-27

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

Latest validated Development release: `2026-10-27-v01`
Previous Development: `2026-10-25-v09`
Development release manifest: `release-manifests/2026-10-27-v01.txt`
Development v01 package source commit: `8600fef997885b7a29c1dd342fc1fefcf65b1e5d`
Development code HEAD before this baseline reconciliation: `3e9b24f9a2df06fba1d3b19e151e13176d8aa63e`

### Development package record — 2026-10-27-v01

- Full ZIP: `Collect-TCG-Dev-2026-10-27-v01-full.zip`
- Full SHA256: `8f897fb9107089355ae0bc58b94d7081d8c6b6aca98c582603f63bb6202703ab`
- Patch ZIP: `Collect-TCG-Dev-2026-10-25-v09-to-2026-10-27-v01-patch.zip`
- Patch SHA256: `46c1ef7afbe678a319df5e6fcb894d8f15a0e8d111c6723996189fb7ec6c5da5`

### Current Development state after v01

- Owner Inventory Tools uses the established compact workspace; the duplicate post-v09 Inventory Manager/dashboard renderer remains removed.
- Owner Overview includes Available inventory value calculated from stored MYR listing price × quantity for live `Available` records only; Reserved, Sold, Collection (NFS), Draft and Archived records are excluded.
- The eBay Post Generator includes `[IMPORT DUTIES & TAXES]` with buyer-responsibility wording for import duties, tariffs, taxes, customs-clearance fees and other import-related charges.
- Commit `3e9b24f9a2df06fba1d3b19e151e13176d8aa63e` changes the separator before the import-duty notice from two line breaks to one.
- The Development SEO/validation workflow for that commit completed successfully on 2026-10-27, including regression tests, changed-JavaScript checks, SEO generation/validation, repository/reference validation, CSS/release-contract checks and Pages deployment.
- No SQL, schema, RLS or Edge Function change is required for the eBay-generator wording/spacing work.
- There is no `release-manifests/2026-10-27-v02.txt` in Development as of this reconciliation. Therefore the spacing commit is validated current Development code, but `2026-10-27-v01` remains the latest immutable packaged Development release.

## Current Production

Latest Production: `2026-10-27-v02`
Previous Production: `2026-10-27-v01`
Development promoted from: `2026-10-27-v02`
Production release manifest: `release-manifests/2026-10-27-v02.txt`
Production v02 package source commit: `64db0b3c4779c6f2036e5c7eb900eace09112c2b`
Production release/manifest HEAD before this baseline reconciliation: `a192b9390a2da229f0476bafe388bbcf751fa716`

### Production package record — 2026-10-27-v02

- Full ZIP: `Collect-TCG-Production-2026-10-27-v02-full.zip`
- Full SHA256: `6c2936dbf31b26131c7781f1034d268a93e001ce413d5769080b3d49a2166c32`
- Patch ZIP: `Collect-TCG-Production-2026-10-27-v01-to-2026-10-27-v02-patch.zip`
- Patch SHA256: `d2bd12aefc573471c1865925dfaa2e0ddbdc22e9bb49192c858f1e71d6957817`

### Production 2026-10-27-v02

Purpose: promote the eBay Post Generator spacing correction while retaining the import-duty notice introduced in Production v01.

Retained/current behavior:
- eBay Post Generator includes `[IMPORT DUTIES & TAXES]` after Shipping and before the Collect TCG section.
- Only one line break separates Shipping from the import-duty heading.
- The import-duty notice states that import duties, tariffs, taxes, customs-clearance fees and other import-related charges are not included in item price/shipping and are the buyer's responsibility.
- Production cache reference for `posts-hidden-ebay.js` is `2026-10-27-v02`.
- Production-specific scanner endpoint remains `scan-card-ai`; Development-only `scan-card-ai-dev` must not appear in Production runtime code.
- Owner-only eBay Ban List, QR Generator, SEO, analytics/privacy boundaries, Contact to Buy, giveaways, generators and Owner tools remain retained.
- Existing eBay Ban List RLS/database state from Production `2026-10-25-v03` remains unchanged.

SQL required: No for Production v01/v02 eBay-generator changes.

### Production v02 validation status

Completed:
- Production repository/JavaScript validation.
- Changed eBay generator JavaScript syntax checks.
- Consolidated CSS validation.
- Retained Post Generator checks.
- SEO generator syntax/self-test and Production SEO generation.
- Generated Production SEO file validation.
- Full and patch ZIP creation and integrity checks.
- Package artifact upload.
- Immutable v02 manifest/checksum recording.
- GitHub Pages deployment confirmation.
- `production-last-known-good` advancement after successful Pages deployment.

Validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Interactive desktop/mobile/Safari browser testing was not performed for this spacing-only change.

### Release-integrity note

The immutable Production v02 manifest records `Development promoted from: 2026-10-27-v02`, but Development currently has no immutable `2026-10-27-v02` release manifest; its latest packaged release is v01 and the spacing correction exists as subsequently validated Development code at commit `3e9b24f9a2df06fba1d3b19e151e13176d8aa63e`. Do not rewrite the accepted Production v02 manifest. Future release work should resolve this metadata mismatch by ensuring the exact Development release is packaged/manifested before promotion.

## Previous Production — 2026-10-27-v01

Production v01 introduced the eBay Post Generator import-duty notice and was promoted from Development `2026-10-27-v01`.

- Full ZIP: `Collect-TCG-Production-2026-10-27-v01-full.zip`
- Full SHA256: `1b892ddea31c5da9e0d9f708b9e12e8c500ba376f474a30bd47019effa993bfe`
- Patch ZIP: `Collect-TCG-Production-2026-10-25-v03-to-2026-10-27-v01-patch.zip`
- Patch SHA256: `fa1c71980b0702b2efce4a44f680c2e07ffa8f2262ba67a2fa1e90dfcb483dbc`

## Earlier validated state retained

- Development `2026-10-25-v09` remains an immutable historical release. Its custom Inventory Manager/dashboard UI was superseded in later Development code by restoration of the established compact Inventory Tools workspace.
- Development `2026-10-25-v08` corrected the v07 Owner-navigation `insertBefore` regression and was promoted to Production `2026-10-25-v03`.
- Production `2026-10-25-v03` added/promoted the Owner eBay Ban List and its RLS migration `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`; that migration was applied and verified on Supabase project `cbzytysxtdcqxuckspye`.
- Production `2026-10-25-v02` and older accepted manifests remain historical immutable records.
- `release-manifests/2026-10-16-v02.txt` is an older accepted record and must not be rewritten.

## Canonical retained behavior

Preserve unless explicitly changed:
- public card pages, SEO, stable URLs and SPA/history behavior;
- Related Cards, Trending and discovery attribution;
- Inventory/Collection/Sold/Reserved/Favorites flows;
- Owner Mode and owner-only Add/Edit/Delete/bulk/lifecycle/export tools;
- established compact Owner Inventory Tools and its specialist subtools;
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
- No SQL/database change was required for Development/Production 2026-10-27 eBay Post Generator changes.
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

Reconcile `COLLECT_TCG_BASELINE.md` in both Development and Production repositories after every accepted release or meaningful environment-state change. Preserve historical release facts and retained/removed behavior; never rewrite immutable release manifests from assumptions.
