# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-10-29

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

Latest validated Development release: `2026-10-29-v01`
Previous Development: `2026-10-27-v01`
Development release manifest: `release-manifests/2026-10-29-v01.txt`
Development v01 package source commit: `02abe40038d0a3e22537dbe42c7391d62e003a29`

### Development package record — 2026-10-29-v01

- Full ZIP: `Collect-TCG-Dev-2026-10-29-v01-full.zip`
- Full SHA256: `f0ce2a15be5d38fc9c519fc030ec32f0dffdb313f379559bdc282e3191eff57b`
- Patch ZIP: `Collect-TCG-Dev-2026-10-27-v01-to-2026-10-29-v01-patch.zip`
- Patch SHA256: `7fb5dce273973240a0035ddef013b3fcb71abf635ca60761bccbc3d81ea15a0d`

### Development 2026-10-29-v01 retained/current state

- Owner Inventory Tools uses the established compact workspace; the duplicate post-v09 Inventory Manager/dashboard renderer remains removed.
- Owner Overview includes Available inventory value calculated from stored MYR listing price × quantity for live `Available` records only; Reserved, Sold, Collection (NFS), Draft and Archived records are excluded.
- Owner Inventory Tools Activity includes the Owner-only `Buyer Messages` utility with the approved eBay `Thank You After Purchase` copyable template.
- Buyer Messages remains Owner-only through the existing `requireOwner` boundary and requires no SQL/schema/RLS/Edge Function change.
- eBay Post Generator retains `[IMPORT DUTIES & TAXES]` with buyer-responsibility wording and the corrected single-line-break spacing.

## Current Production

Latest Production: `2026-10-29-v01`
Previous Production: `2026-10-27-v02`
Development promoted from: `2026-10-29-v01`
Production release manifest: `release-manifests/2026-10-29-v01.txt`
Production v01 package source commit: `7e543586e1ca8b0f0b57d17fe2f36edbf2638b52`
Production last-known-good / release manifest commit: `66b4d1e462ef298afb47f08b35fe3153d746bab4`

### Production package record — 2026-10-29-v01

- Full ZIP: `Collect-TCG-Production-2026-10-29-v01-full.zip`
- Full SHA256: `a6f6fba18dff59439f4f11d845feb0dd48159f86d27a5f426be7725d72ce7dcb`
- Patch ZIP: `Collect-TCG-Production-2026-10-27-v02-to-2026-10-29-v01-patch.zip`
- Patch SHA256: `4719ab0ad8bfd344d64ac535f700e1439f734f0bc92c0425690b719ac2ee077b`

### Production 2026-10-29-v01

Purpose: promote validated Development `2026-10-29-v01`, including Owner inventory value visibility and Owner Buyer Messages, while preserving Production-specific behavior.

Retained/current behavior:
- Owner Inventory Tools includes Available inventory value calculated from stored MYR listing price × quantity for live `Available` records only; Reserved, Sold, Collection (NFS), Draft and Archived records are excluded.
- Owner Inventory Tools Activity includes the Owner-only Buyer Messages utility and approved eBay Thank You After Purchase template.
- eBay Post Generator retains the import-duty/tax notice and corrected spacing.
- Production-specific scanner endpoint remains `scan-card-ai`; Development-only `scan-card-ai-dev` must not appear in Production runtime code.
- Owner-only eBay Ban List, QR Generator, SEO, analytics/privacy boundaries, Contact to Buy, giveaways, generators and established Owner tools remain retained.
- Existing eBay Ban List RLS/database state from Production `2026-10-25-v03` remains unchanged.

SQL required: No.

### Production v01 validation status

Completed:
- rollback-anchor validation;
- all Production JavaScript syntax validation;
- Production repository validation;
- CSS and Post Generator validation;
- SEO validation;
- full and patch ZIP creation and integrity checks;
- package artifact upload;
- immutable Production manifest/checksum recording;
- GitHub Pages build and deployment confirmation;
- `production-last-known-good` advancement after successful Pages deployment.

Validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Interactive desktop/mobile/Safari browser testing was not performed during this promotion.

## Earlier validated state retained

- Production `2026-10-27-v02` remains an immutable historical release. Its manifest records `Development promoted from: 2026-10-27-v02` despite no matching immutable Development v02 manifest; do not rewrite that historical manifest.
- Production `2026-10-27-v01` introduced the eBay Post Generator import-duty notice.
- Development `2026-10-25-v09` remains immutable; its custom Inventory Manager/dashboard UI was superseded by restoration of the established compact Inventory Tools workspace.
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
- No SQL/database change was required for Development/Production `2026-10-29-v01`.
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
