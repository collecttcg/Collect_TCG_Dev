# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-10-25

## Repositories

- Production: `collecttcg/Collect_TCG`
- Development: `collecttcg/Collect_TCG_Dev`
- Default branch: `main`
- Development is the working environment.
- Production is protected unless an explicit Production update is requested.

Reconciliation priority: current GitHub HEAD > latest valid release manifest > this baseline > recent Project conversations > older conversations.

## Versioning

- `V210` is the final legacy `V###` release; historical releases are never renamed.
- New releases use `YYYY-MM-DD-vNN` using the actual build date; Development and Production counters are independent.
- Development full: `Collect-TCG-Dev-YYYY-MM-DD-vNN-full.zip`
- Development patch: `Collect-TCG-Dev-OLD-to-NEW-patch.zip`
- Production full: `Collect-TCG-Production-YYYY-MM-DD-vNN-full.zip`
- Production patch: `Collect-TCG-Production-OLD-to-NEW-patch.zip`
- SQL: `YYYY-MM-DD-vNN-DESCRIPTIVE-NAME.sql`

## Current State

### Development

Current Development work: `2026-10-25-v06`
Previous Development version: `2026-10-25-v05`
Release manifest: `release-manifests/2026-10-25-v06.txt`
Canonical package source commit: `a9bdd0c65b7ae2fa5ea96f75732958bcc3f3ad05`
Initial v06 manifest commit: `c915aa853d73fe90f3459f41552d6b434278b46e`

Status: **Completed and validated.**

Development v06 change:
- `dev/src/features/owner/card-scanner.js` surfaces the backend JSON error/message returned by the Supabase Edge Function for non-2xx responses instead of only the generic invoke error.
- Successful identification behavior is unchanged.
- Market-price research remains isolated from identification.
- No timeout was blindly increased.
- No SQL was required.

Release-state repair completed on 2026-10-25:
- stale v04/v01 validation markers were reconciled to the current Development/Production state;
- the v06 workflow/package label is correct;
- the v06 manifest exists and is treated as immutable;
- the Development workflow now refuses to overwrite an existing accepted release manifest.

Development package record:
- Full ZIP: `Collect-TCG-Dev-2026-10-25-v06-full.zip`
- Full SHA256: `79c18c9973402e567136201a4e5d51dfc51258ffc91a9e365382b0a881cd3d76`
- Patch ZIP: `Collect-TCG-Dev-2026-10-25-v05-to-2026-10-25-v06-patch.zip`
- Patch SHA256: `14371132ec9480ad9063d6f29348c22a8e6b92f6e30841cbef7aa19bd18356a1`

Validation executed for v06:
- feature regression tests: passed
- scanner JavaScript syntax: passed
- SEO generator syntax/self-test: passed
- Development SEO generation: passed
- JavaScript/repository references: passed
- CSS/retained release contracts: passed
- package creation and ZIP integrity checks: passed
- package artifact upload: passed
- Development Pages deployment for the manifest commit: passed

Validation limitations:
- Authenticated Owner scanner behavior was not interactively browser-tested.
- Interactive desktop/mobile/Safari testing was not performed for this release-state repair.

### Production

Latest Production: `2026-10-25-v02`
Previous Production: `2026-10-25-v01`
Development promoted from: `2026-10-25-v05`
Production release manifest: `release-manifests/2026-10-25-v02.txt`
Production v02 package source commit: `5c6eee211b51e405a6d957e1ad13c29877f0ce27`

Production v02 contains the already-deployed Owner AI Card Scanner stylesheet/loader work and repaired release workflow/bookkeeping. Development v06 scanner error-reporting remains Development-only and was not promoted.

Production package record:
- Full ZIP: `Collect-TCG-Production-2026-10-25-v02-full.zip`
- Full SHA256: `e0139b2481b170fa0d18765a7dd2246696494def9d02a09a5f58ad0ad6eb6dab`
- Patch ZIP: `Collect-TCG-Production-2026-10-25-v01-to-2026-10-25-v02-patch.zip`
- Patch SHA256: `57ed8a291fb4d2543d5cbba6960e8e643e6b400ea55926d110db10672ce151c0`

The historical `release-manifests/2026-10-16-v02.txt` was restored to its accepted original content and must remain immutable.

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

### Hyper Battle canonical mapping — promoted v05 state

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

## Canonical Retained History / Files

- Active Development app directory is `dev/`.
- SQL history remains under `migrations/2026/` and `migrations/legacy/`.
- Owner **Custom Order** behavior remains retained unless explicitly changed.
- QR Generator remains retained.
- Owner Insights styling remains in canonical `dev/src/styles/27-insights-dashboard.css`.
- Canonical active modules must not be replaced by version-suffixed active filenames.

## Retained Product Behavior

Preserve unless explicitly changed:
- desktop, mobile and Safari-sensitive behavior;
- navigation/routes, inventory, card details, filtering/ordering and generators;
- Owner Mode security and owner Add/Edit/Delete/management tools;
- Supabase/RLS and backward compatibility;
- analytics and Development analytics-test exclusion behavior;
- Contact to Buy: Availability, Make an offer, More photos / video, COD / meetup, Malaysia & Singapore messaging and negotiable international shipping;
- giveaways, Giveaway Code, bonus entries, Facebook Group bonus, generator/images/winner;
- QR Generator and existing visual design/spacing.

## Intentionally Removed / Do Not Restore

Do not restore abandoned/superseded experiments, old Beta runtime dependencies, removed share/basket/compact-layout experiments, or superseded scanner/layout work unless explicitly requested.

## Validation Contract

A commit is not completion. Required checks include changed-JS syntax, imports/exports/references/cache-busters, assets/markup/CSS, requested paths and edge cases, affected regressions, Owner/public boundaries, SQL/RLS implications, release diff, committed-file inspection, full/patch ZIP integrity, release manifest and Pages deployment.

Use status wording precisely:
- Tested = executed/exercised.
- Statically verified = repository/code inspection.
- Not tested = unavailable/not performed.
- If code is committed but validation is incomplete: `Implemented, validation pending.`

## Deployment / Analytics Safety

- Do not browse/open live Production for testing without explicit authorization because it may contaminate Insights.
- Prefer repository inspection, static validation, Development and screenshots.
- Use the Development analytics exclusion URL for Dev browser/UI testing where available.

## Production Promotion Contract

Only when explicitly requested: identify latest Production and approved Development, confirm validation, promote only approved changes, preserve Production-specific behavior, create a new date-based Production version, independently validate/package, and confirm Pages/rollback protection.

## Baseline Maintenance

Update/reconcile this file as part of every accepted release/change. Historical release manifests are immutable and later workflow/scheduled runs must not overwrite their source commit or checksums.
