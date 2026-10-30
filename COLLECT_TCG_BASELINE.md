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

Latest validated Development release: `2026-10-30-v04`
Previous Development: `2026-10-30-v03`
Development release manifest: `release-manifests/2026-10-30-v04.txt`
Development v04 package source commit: `27e258feba7aa135013330f6e870b8b5bb4fd89d`
Development v04 manifest commit: `6a1ec3e2a2a6c3b51af2ba5f7ad041722d7a41af`

### Development package record — 2026-10-30-v04

- Full ZIP: `Collect-TCG-Dev-2026-10-30-v04-full.zip`
- Full SHA256: `f818c8df4e39856a3249425252397600d66a627849ef5ca3b57a5c718180f62b`
- Patch ZIP: `Collect-TCG-Dev-2026-10-30-v03-to-2026-10-30-v04-patch.zip`
- Patch SHA256: `cabaca9a16d284c1e3e1164469483ca67b71fae2ddcc0e0e41a3fbc9b9519fa2`

### Development 2026-10-30-v04 retained/current state

- Owner Add Listing and Edit Listing image pickers accept JPEG, PNG, WebP, HEIC and HEIF.
- HEIC/HEIF owner uploads are converted client-side to JPEG before entering the established resize/validation/upload pipeline; stored listing images therefore remain compatible with existing image handling.
- HEIC conversion is Owner-protected, preserves the established image-size limit, and loads `heic2any` 0.0.4 on demand only when a HEIC/HEIF file is selected.
- Existing JPEG/PNG/WebP behavior remains unchanged.
- Owner Inventory Tools → Bulk Edit retains `Unassigned Owners`, private Card Owner assignment and 100-row chunking from Development `2026-10-30-v03`.
- Contact → Official eBay Accounts and eBay Ban List account shortcuts remain retained.
- No SQL/schema/RLS/Edge Function change was required.

## Current Production

Latest Production: `2026-10-30-v03`
Previous Production: `2026-10-30-v02`
Development promoted from: `2026-10-30-v04`
Production release manifest: `release-manifests/2026-10-30-v03.txt`
Production v03 package source commit: `5bb6310420349d4e1bc5b294ef35d5e2a625ae4c`
Production last-known-good / release manifest commit: `4ffb6b3caf0ca29626bde56afd7fcaaa2bb9004c`

### Production package record — 2026-10-30-v03

- Full ZIP: `Collect-TCG-Production-2026-10-30-v03-full.zip`
- Full SHA256: `f5f7e4fc9375bf2600497b36066fa3e1e085c82788faf520d3c51ef7fa365b79`
- Patch ZIP: `Collect-TCG-Production-2026-10-30-v02-to-2026-10-30-v03-patch.zip`
- Patch SHA256: `1a3c41b64c9c98fc05dfc91d1ea6ceed42911e5b87889f4c565f1dfa572578dc`

### Production 2026-10-30-v03

Purpose: promote validated HEIC/HEIF listing-photo support from Development `2026-10-30-v04` while preserving Production-specific behavior.

Retained/current behavior:
- Owner Add Listing and Edit Listing accept HEIC/HEIF in addition to JPEG/PNG/WebP.
- HEIC/HEIF files are converted client-side to JPEG before the existing image resize/validation/upload flow.
- Existing image size limits and Owner authorization remain in force; no public upload surface was added.
- Existing JPEG/PNG/WebP upload behavior remains unchanged.
- Owner Inventory Tools → Bulk Edit retains Unassigned Owners assignment and private `card_owner_private` storage.
- Production-specific scanner endpoint remains `scan-card-ai`; Development-only `scan-card-ai-dev` must not appear in Production runtime code.
- QR Generator, eBay account links, eBay Ban List, SEO, analytics/privacy boundaries, Contact to Buy, giveaways, generators, Buyer Messages and established Owner tools remain retained.
- Existing eBay Ban List database/RLS state from Production `2026-10-25-v03` remains unchanged.

SQL required: No.

### Production v03 validation status

Completed:
- rollback-anchor validation;
- all Production JavaScript syntax validation;
- Production repository/reference validation;
- HEIC Add/Edit registration and integration contract validation;
- CSS and Post Generator validation;
- SEO validation and retained Production endpoint checks;
- full and patch ZIP creation and integrity checks;
- package artifact upload;
- immutable Production manifest/checksum recording;
- GitHub Pages deployment confirmation;
- `production-last-known-good` advanced to `4ffb6b3caf0ca29626bde56afd7fcaaa2bb9004c` after successful deployment.

Validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- A physical HEIC/HEIF file was not interactively uploaded in a browser during release validation; HEIC Add/Edit support was validated by syntax, wiring and integration contracts.
- Interactive desktop/mobile/Safari browser testing was not performed during this promotion.

## Earlier validated state retained

- Development `2026-10-30-v03` and Production `2026-10-30-v02` remain immutable; they introduced/promoted the corrected Unassigned Owners assignment workflow.
- Development `2026-10-30-v02` is immutable; it first packaged the Unassigned Owners feature/runtime correction.
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
- Owner listing photo support for JPEG, PNG, WebP, HEIC and HEIF;
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
- Card Owner assignment continues to use existing private `card_owner_private` metadata and existing authorization.
- HEIC/HEIF listing-photo support is client-side and required no SQL/database/RLS/Edge Function change for Development `2026-10-30-v04` or Production `2026-10-30-v03`.
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