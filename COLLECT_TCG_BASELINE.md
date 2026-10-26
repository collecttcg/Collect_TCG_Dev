# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-10-26

## Repositories

- Production: `collecttcg/Collect_TCG`
- Development: `collecttcg/Collect_TCG_Dev`
- Default branch: `main`
- Development is the normal working environment.
- Production is protected and is modified/promoted only when explicitly authorized.

Reconciliation priority: current GitHub HEAD > latest valid release manifest > this baseline > recent Project conversations > older conversations.

## Versioning

- `V210` is the final legacy `V###` release; historical releases are never renamed.
- Current releases use `YYYY-MM-DD-vNN` with the actual build date; Development and Production counters are independent.
- Development full: `Collect-TCG-Dev-YYYY-MM-DD-vNN-full.zip`
- Development patch: `Collect-TCG-Dev-OLD-to-NEW-patch.zip`
- Production full: `Collect-TCG-Production-YYYY-MM-DD-vNN-full.zip`
- Production patch: `Collect-TCG-Production-OLD-to-NEW-patch.zip`
- SQL: `YYYY-MM-DD-vNN-DESCRIPTIVE-NAME.sql`

## Current Development

Latest validated Development release: `2026-10-25-v09`
Previous Development: `2026-10-25-v08`
Release manifest: `release-manifests/2026-10-25-v09.txt`
Package source commit: `ce875d0722014881bd577a06953730c7be25c2b9`
Current Development code HEAD before this baseline-only reconciliation: `e2e9caa83a8f2e891e04fe08cb8128f8badfd998`
Current post-v09 state: corrective Owner Inventory Tools restoration plus Available-inventory value overview are implemented and committed; full release validation/package gate is pending.

### Post-v09 corrective state — validation pending

- Commit `70eec314ead2c49788bbce55507f36b42dbc5e08` attempted to improve the v09 Inventory Manager UI and restore specialist access after Owner feedback.
- Commit `f84143a88e8def41f66b22d3efd3a6ea08439de4` removes the redundant custom Inventory Manager/dashboard renderer and routes the Owner inventory entry back to the established Inventory Tools workspace.
- The established compact Inventory Tools interface is again the canonical Owner inventory workspace.
- PSA POP, Missing Certs, Bulk Prices, Bulk Metadata, Bulk Status and the existing category/subtool navigation remain retained through the established Inventory Tools implementation.
- The correction avoids maintaining two competing Owner inventory interfaces and removes the inconsistent transition from the new dashboard into the established specialist-tool screen.
- Owner authorization remains required before the Inventory Tools workspace is opened.
- Commits `835c6a1cd816172f3e599a3e27d7d6edb95589d9`, `ff1ccdf20dca55d3ed60b73de77be01c8a265c86` and `e2e9caa83a8f2e891e04fe08cb8128f8badfd998` add and refine an Owner-only Available inventory value overview in the established Inventory Tools overview.
- Available inventory value uses the stored MYR listing price multiplied by quantity and includes only live listings whose availability is `Available`; Reserved, Sold, Collection (NFS), Draft and Archived records are excluded.
- The overview also reports Available listing count, unit count and how many Available listings are missing a MYR price. It does not represent acquisition/purchase cost basis because no purchase-cost field is introduced by this change.
- No SQL, schema, RLS, Edge Function or shared Supabase change is required or applied for this corrective work.
- Production is unchanged and remains on `2026-10-25-v03`.
- Status: **Implemented, validation pending.** This corrective state is not yet a new validated/package Development release.

### Development package record

- Full ZIP: `Collect-TCG-Dev-2026-10-25-v09-full.zip`
- Full SHA256: `e859da6552e4b4d4831ad1653eb1747b57ee48b8d0d39831d06a2d4bbccab20f`
- Patch ZIP: `Collect-TCG-Dev-2026-10-25-v08-to-2026-10-25-v09-patch.zip`
- Patch SHA256: `51296346925c8c1c2c9bc4490da3c62c8adb6a3bfac81911e2a626b47adcf195`

## Development 2026-10-25-v09

Purpose: consolidate Owner inventory operations into a practical Inventory Manager while preserving specialist tools and public behavior. This section records the immutable validated v09 release state; the post-v09 corrective state above supersedes its dashboard UI in current Development code but does not rewrite v09 history.

Changes retained in validated v09:
- Existing `#/inventory-tools` landing page was changed to the Owner Inventory Manager / command center.
- Dashboard summarized total records, Available/Reserved/Sold/Collection counts, Draft/Archived counts, data-quality issues, stale records and stored MYR/USD/SGD listing value.
- Search spanned card name, code, series/set, game, language, year, grading/certification and notes.
- Filters covered lifecycle/status, game, data-quality issues, missing stored cost and stale records.
- Inventory table provided direct View and Edit actions and displayed status, game, stored price, stored cost and last update date.
- Specialist Bulk Metadata, Bulk Status, Data Quality, Hidden Listings, Edit History, Image Health, Storage Health, eBay Ban List and Export/Backup remained available from the command center.
- Redundant top-level Owner navigation entries for Data Quality, Hidden Listings and Export were consolidated into Inventory Manager without deleting their retained routes or capabilities.
- Existing specialist `inventory-tools?mode=...&sub=...` flows remained backward compatible.
- Release tooling was repaired so repository checks reflected the accepted v08/v03 baseline instead of stale v07/v02 markers.
- Canonical startup compatibility contracts were retained after validation identified them as required behavior.

SQL required: No.
Database status: No schema, RLS, Edge Function or shared Supabase change was applied for v09.

### Development validation status

Completed for validated v09:
- 80 feature regression tests executed successfully.
- Changed Owner JavaScript syntax checks executed successfully, including the dashboard module as released in v09.
- eBay nested-navigation regression test executed successfully.
- SEO generator syntax/self-test and Development SEO generation executed successfully.
- Repository/reference validation executed successfully across 69 JavaScript files.
- CSS validation and retained release-contract validation executed successfully.
- Full and patch ZIPs created and integrity checked.
- Full and patch packages uploaded as the `Collect-TCG-Dev-2026-10-25-v09-packages` workflow artifact.
- Immutable v09 release manifest recorded with SHA256 checksums.
- Development Pages deployment for package source commit `ce875d0722014881bd577a06953730c7be25c2b9` completed successfully.

Validation limitations:
- Authenticated Owner Inventory Manager interactions were not manually exercised in a browser session.
- Interactive desktop/mobile/Safari browser testing was not performed.
- The post-v09 corrective commits, including the Available-inventory value overview, are not covered by the v09 validation/package record and require their own validation before a new Development release can be accepted.

Refactoring review:
- v09 reviewed the changed Owner registration/navigation/startup surface and immediate release-tooling dependencies.
- Post-v09 corrective work performed a localized cleanup by removing the duplicate dashboard implementation and restoring one canonical Inventory Tools workspace.
- The Available-inventory value change is isolated in `dev/src/features/owner/inventory-value-overview.js` and registered after the established Inventory Tools module to avoid broad changes to the retained tools implementation.
- Broader Owner route registration, DOM helpers and Supabase access-layer refactors remain deferred to avoid expanding regression scope.

### Previous Development release — 2026-10-25-v08

Manifest: `release-manifests/2026-10-25-v08.txt`.
Package source commit: `06caa4ae097a50dcbef1974773fcf85b99acc318`.
Full ZIP SHA256: `4dcc494e48616d29459228dd13631fafc0060bbbbe7e2930542509ebf6a8a0f2`.
Patch ZIP SHA256: `50f15aa9113be4bc0c0a86db4ebdbee8255c6c27dd2f556cba98bfb9c4af22f0`.
v08 completed and validated the Owner eBay Ban List after correcting the v07 Owner-navigation startup regression.

## Current Production

Latest Production: `2026-10-25-v03`
Previous Production: `2026-10-25-v02`
Development promoted from: `2026-10-25-v08`
Production release manifest: `release-manifests/2026-10-25-v03.txt`
Production package source commit: `48983c7c9ab8cbd53fbd46084bb3709a70b99eba`

### Production package record

- Full ZIP: `Collect-TCG-Production-2026-10-25-v03-full.zip`
- Full SHA256: `bbe483cbf4464193e584c0ff9393c1969f0cd28c5ce35ea1832e4cfe0223d382`
- Patch ZIP: `Collect-TCG-Production-2026-10-25-v02-to-2026-10-25-v03-patch.zip`
- Patch SHA256: `8469782b344b88fb5d6a69051bcb2ce2363e8b023aa1c9c94d2e7702e8baffd4`

Production v03 promotes validated Development v08 owner-tool changes while preserving Production-specific behavior and safeguards.

Retained/promoted behavior:
- Owner AI Card Scanner surfaces backend JSON error/message details for non-2xx `scan-card-ai` responses.
- Production scanner remains on `scan-card-ai`; Development remains on `scan-card-ai-dev`.
- Owner-only shared eBay Ban List is promoted with the corrected navigation insertion logic.
- eBay Ban List remains hidden from public users and protected by Supabase RLS.
- Production QR Generator, SEO, analytics/privacy boundaries, Contact to Buy, giveaways, generators and Owner tools remain retained.
- `production-last-known-good` was advanced only after successful Production validation and Pages deployment.

Production SQL migration: `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`.
SQL status: Applied and verified on Production Supabase project `cbzytysxtdcqxuckspye`.

### Production validation status

Completed for Production v03:
- Production repository/JavaScript validation including syntax/import checks.
- Consolidated CSS validation.
- Retained Post Generator checks.
- SEO generator syntax/self-test/generation and generated-output checks.
- Production-specific eBay Ban List/scanner endpoint/migration checks.
- Full and patch ZIP creation and integrity checks.
- Package artifact upload and immutable release manifest recording.
- Final Pages build/deployment.
- `production-last-known-good` advancement.
- Supabase eBay Ban List RLS/grants/policy verification.

Validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Authenticated Owner scanner and eBay Ban List were not interactively exercised in Production.
- Interactive desktop/mobile/Safari browser testing was not performed.

## Owner AI Card Scanner

Current architecture:
- Owner Mode only.
- Frontend analyzes only the first uploaded image.
- Image is resized before upload (max 1280 px, JPEG quality 0.8 where conversion applies).
- Development Edge Function: `scan-card-ai-dev`.
- Production Edge Function: `scan-card-ai`.
- JWT verification and `is_app_owner` authorization are required; public users must not gain scanner/owner capability.
- Gemini API credentials remain server-side only.
- AI output is a recommendation; detected values are not saved until the Owner applies/saves them.
- Raw/Sealed scans clear grading company, grade and certification values.
- Raw and graded market comparables remain separated.
- Identification is separated from slower market-price research.

### Hyper Battle canonical mapping

Supported One Piece Carddass Hyper Battle ranges include:
- `C001-C034` → `1st Stage`
- `C035-C066` → `2nd Stage`
- `C067-C110` → `Grand Box`
- `C111-C144` → `3rd Stage`
- `C145-C177` → `4th Stage`
- `C178-C220` → `Grand Box 2`
- `C221-C254` → `5th Stage`
- `C255-C287` → `6th Stage`
- `C288-C330` → `Grand Box 3`
- `C331-C364` → `7th Stage`
- `C365-C397` → `Grand Box 4`
- `C398-C427` → `Grand Line Compilation 1`
- `C428-C456` → `Grand Line Compilation 2`
- `C457-C489` → `Grand Box 5`
- `C490-C519` → `Grand Line Compilation 3`
- `C520-C546` → `Grand Box DX`

Recognized vintage promotional code families map to `Promo`; the override is limited to vintage One Piece Hyper Battle/Carddass identity/year so unrelated modern codes are not remapped.

## Canonical retained files / behavior

- Active Development app directory is `dev/`.
- SQL history remains under `migrations/2026/` and `migrations/legacy/` where applicable.
- Canonical active modules must not be replaced by version-suffixed active filenames.
- Owner Custom Order behavior remains retained unless explicitly changed.
- QR Generator remains retained.
- Owner Insights styling remains in canonical `dev/src/styles/27-insights-dashboard.css`.
- The established compact Owner Inventory Tools workspace is the current canonical Development inventory-administration interface after the post-v09 correction.
- PSA POP, Missing Certs and the retained specialist category/subtool workflows remain available through Inventory Tools.
- Inventory Tools includes an Owner-only Available inventory value overview based on MYR listing price × quantity for live Available records only; it excludes Reserved, Sold, Collection (NFS), Draft and Archived records.
- Do not reintroduce a second competing Inventory Manager/dashboard interface unless explicitly requested and validated as a replacement.

Preserve unless explicitly changed:
- desktop, mobile and Safari-sensitive behavior;
- public card pages, SEO, stable URLs and SPA/history behavior;
- navigation/routes, inventory, card details, filtering/ordering and generators;
- Related Cards, Trending and discovery attribution;
- Inventory/Collection/Sold/Reserved/Favorites flows;
- Owner Mode and owner-only Add/Edit/Delete/bulk/lifecycle/export tools;
- Owner private analytics and Buyer Preview privacy;
- Owner-only AI Card Scanner;
- Owner-only shared eBay Ban List;
- Supabase/RLS and backward compatibility;
- analytics and Development analytics-test exclusion behavior;
- Contact to Buy: Availability, Make an offer, More photos / video, COD / meetup, Malaysia & Singapore messaging and negotiable international shipping;
- giveaways, Giveaway Code, bonus entries, Facebook Group bonus, generator/images/winner;
- QR Generator and existing visual design/spacing;
- Safari-safe purchase/contact layout.

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
- the post-v09 duplicate custom Inventory Manager/dashboard renderer superseded by the established Inventory Tools workspace.

## Historical release integrity

- `2026-10-25-v09` remains the latest validated/package Development release and remains Development-only until explicitly promoted.
- Current Development code contains post-v09 corrective work restoring the established Inventory Tools workspace and adding the Available-inventory value overview; that work is implemented but not yet a validated/package release.
- `2026-10-25-v07` introduced the eBay Ban List but had a runtime Owner-navigation `insertBefore` regression; v08 is the corrected validated successor.
- `2026-10-25-v06` introduced Development scanner error reporting and was not promoted until Production v03 via validated v08.
- Production `2026-10-25-v03` remains the current Production release and does not contain Development v09 or post-v09 inventory-interface changes.
- `release-manifests/2026-10-16-v02.txt` is an older accepted historical record and must remain immutable.
- Accepted historical manifests must never be rewritten by later workflows.

## Refactoring candidates — not approved changes

Potential future Dev-only, behavior-preserving refactors:
- centralize Owner navigation/route registration so individual features do not manipulate navigation DOM independently;
- provide shared safe DOM insertion/element/clipboard/notification helpers;
- isolate Supabase table operations behind small service/repository modules;
- reduce duplicated Owner feature CSS without changing visuals;
- expand reusable Owner-route tests for startup, nested navigation, public-user exclusion, missing DOM targets and rendering;
- consolidate common validation/release tooling where safe while keeping Development and protected Production release workflows separate.

These are candidates only. Do not perform a broad rewrite or redesign without explicit approval. Prefer incremental refactors with behavior-preserving validation after each subsystem.

## Release and validation contract

A commit is not completion. Required checks include changed-JS syntax, imports/exports/references/cache-busters, assets/markup/CSS, requested paths and edge cases, affected regressions, Owner/public boundaries, SQL/RLS implications, release diff, committed-file inspection, full/patch ZIP integrity, release manifest and Pages deployment.

Use status wording precisely:
- Tested = executed/exercised.
- Statically verified = repository/code inspection.
- Not tested = unavailable/not performed.
- If code is committed but validation is incomplete: `Implemented, validation pending.`

## Deployment / analytics safety

- Do not browse/open live Production for testing without explicit authorization because it may contaminate Insights.
- Prefer repository inspection, static validation, Development and screenshots.
- Use the Development analytics exclusion URL for Dev browser/UI testing where available.

## Production promotion contract

Only when explicitly requested: identify latest Production and approved Development, confirm validation, promote only approved changes, preserve Production-specific behavior, create a new date-based Production version, independently validate/package, and confirm Pages/rollback protection.

## Baseline maintenance

Update/reconcile this file as part of every accepted release/change. Historical release manifests are immutable and later workflow/scheduled runs must not overwrite their source commit or checksums.
