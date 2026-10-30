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

Latest validated Development release: `2026-10-30-v01`
Previous Development: `2026-10-29-v01`
Development release manifest: `release-manifests/2026-10-30-v01.txt`
Development v01 package source commit: `31782df103c258bbfcec3d3abb20ab316b731c1a`

### Development package record — 2026-10-30-v01

- Full ZIP: `Collect-TCG-Dev-2026-10-30-v01-full.zip`
- Full SHA256: `cf362e09db7b9c204e6c25f5e545a53c9b62dcf57b7baff1a88582853919bd44`
- Patch ZIP: `Collect-TCG-Dev-2026-10-29-v01-to-2026-10-30-v01-patch.zip`
- Patch SHA256: `5985534c3cfd3d3ef314212434e9678c8fa5add6320f410a6b1409a53d24634d`

### Development 2026-10-30-v01 retained/current state

- Contact → Official eBay Accounts keeps Account 1 on eBay US and points Accounts 2/3/4 to their approved eBay UK store/profile URLs.
- Owner eBay Ban List account shortcuts open the corresponding Collect TCG eBay account/profile while the website remains the shared master ban list.
- Owner/public boundaries and existing `public.ebay_banlist` RLS behavior are unchanged.
- Owner Inventory Tools, Available inventory value, Buyer Messages, eBay Post Generator import-duty notice, QR Generator, scanner and other retained behavior remain unchanged.
- No SQL/schema/RLS/Edge Function change was required.

## Current Production

Latest Production: `2026-10-30-v01`
Previous Production: `2026-10-29-v01`
Development promoted from: `2026-10-30-v01`
Production release manifest: `release-manifests/2026-10-30-v01.txt`
Production v01 package source commit: `91b322acb86dad4a8d9a63ac2da4a2f30882aeba`
Production last-known-good / release manifest commit: `ae54404bae7cb4fb06eb9d56ba50a3ae092461e3`

### Production package record — 2026-10-30-v01

- Full ZIP: `Collect-TCG-Production-2026-10-30-v01-full.zip`
- Full SHA256: `381896bf0a349ccf0a1b64371d0327fdbda51d01c1db512587c9105eac137c40`
- Patch ZIP: `Collect-TCG-Production-2026-10-29-v01-to-2026-10-30-v01-patch.zip`
- Patch SHA256: `adada6f84dccf08b28092951e757a738590ba862600ca03540dd402ac9c0a366`

### Production 2026-10-30-v01

Purpose: promote the approved eBay account-link changes from validated Development `2026-10-30-v01` while preserving Production-specific behavior.

Retained/current behavior:
- Contact → Official eBay Accounts: Account 1 remains eBay US; Account 2 uses `ebay.co.uk/str/collecttcg2`; Accounts 3 and 4 use their approved eBay UK user profiles.
- Owner eBay Ban List account shortcuts open the corresponding account/profile; ban-list CRUD, Owner-only route protection and RLS remain unchanged.
- Production-specific scanner endpoint remains `scan-card-ai`; Development-only `scan-card-ai-dev` must not appear in Production runtime code.
- QR Generator, SEO, analytics/privacy boundaries, Contact to Buy, giveaways, generators, Inventory Tools, Buyer Messages and established Owner tools remain retained.
- Existing eBay Ban List database/RLS state from Production `2026-10-25-v03` remains unchanged.

SQL required: No.

### Production v01 validation status

Completed:
- rollback-anchor validation;
- all Production JavaScript syntax validation;
- Production repository validation;
- CSS and Post Generator validation;
- SEO validation including the promoted eBay UK link markers;
- full and patch ZIP creation and integrity checks;
- package artifact upload;
- immutable Production manifest/checksum recording;
- GitHub Pages build and deployment confirmation;
- `production-last-known-good` advancement after successful Pages deployment.

Validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Interactive desktop/mobile/Safari browser testing was not performed during this promotion.

## Earlier validated state retained

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
- No SQL/database change was required for Development/Production `2026-10-30-v01`.
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
