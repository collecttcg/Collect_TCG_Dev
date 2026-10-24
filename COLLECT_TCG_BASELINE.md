# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-10-25

## Repositories

- Production: `collecttcg/Collect_TCG`
- Development: `collecttcg/Collect_TCG_Dev`
- Default branch: `main`
- Development is the working environment.
- Production is protected. Never modify, promote, deploy, prepare, or live-test Production unless explicitly requested.

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

Scanner change source commit: `512512f6fb78dcd2e90211eec59dc0bea824aa77`

Repository HEAD immediately after the v06 validation workflow: `baa3ade08fdb50d0489a576c0ecd5d1f3b7064de` (workflow-generated manifest commit).

Status: **Implemented; release-state reconciliation/packaging validation still required before v06 is called a completed Development release.**

Important workflow issue: the Development validation workflow executed successfully for source commit `512512f6fb78dcd2e90211eec59dc0bea824aa77`, but its package-recording step still used the stale release label `2026-10-25-v03` and committed `Development 2026-10-25-v03: record package validation`. Therefore that workflow success must not be treated as a valid v06 release manifest/package record. Historical v03 records must not be silently redefined by later Development work.

Last canonical packaged Development release retained in baseline: `2026-10-25-v03`.
- Manifest: `release-manifests/2026-10-25-v03.txt`
- Canonical source commit: `fa1e598381f2bc8087a0c798ceee4f5ca7b44974`
- Full ZIP: `Collect-TCG-Dev-2026-10-25-v03-full.zip`
- Canonical Full SHA256: `fdd300a1a064e46c01c18a13f7b37d08e37e79bc97270961ed6188d158ed63d9`
- Patch ZIP: `Collect-TCG-Dev-2026-10-25-v02-to-2026-10-25-v03-patch.zip`
- Canonical Patch SHA256: `3e45814e6a7fb560542dd9d9967882e7ba6d8cbd79163ca421b707a280bf93bc`

Production `2026-10-25-v01` records Development `2026-10-25-v05` as the Development state promoted to Production. A standalone `release-manifests/2026-10-25-v05.txt` was not present when checked; do not claim one exists unless GitHub later contains it.

### Production

Latest Production: `2026-10-25-v01`
Previous Production: `2026-10-16-v02`
Development promoted from: `2026-10-25-v05`
Production release manifest: `release-manifests/2026-10-25-v01.txt`
Production application source commit recorded by manifest: `e08599649dc87ed7a869b7e7b1ea4b389053dc94`
Final validated release/manifest HEAD before Production baseline-only reconciliation: `7bd74334c08026921de0093212e1bcf096be2cc7`
Production baseline reconciliation commit: `529f54e6702f966096d67d5d8ef05a70a62e4d1c`
`production-last-known-good`: `7bd74334c08026921de0093212e1bcf096be2cc7`

Production package record:
- Full ZIP: `Collect-TCG-Production-2026-10-25-v01-full.zip`
- Full SHA256: `231595e86b0bf296890e38a8c0f32ec36005b4731aa88e55b2c42c3a5e182372`
- Patch ZIP: `Collect-TCG-Production-2026-10-16-v02-to-2026-10-25-v01-patch.zip`
- Patch SHA256: `8bb782965ed33967610fa9683d7def0d47c33603ee2329be69bbfd0d6cb5e704`

Production already contains the approved v05 scanner/Hyper Battle work. The v06 Development error-reporting change is Development-only and must not be promoted unless explicitly requested.

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
- Raw and graded market comparables remain separated; graded pricing should match grading company/grade where possible.
- Identification is separated from slower market-price research.
- No SQL is required for the current scanner changes.

### Hyper Battle canonical mapping — promoted v05 state

One Piece Carddass Hyper Battle Series is deterministically corrected after identification for supported vintage codes instead of relying only on AI guesses.

Supported canonical families include normal `C`, `S`, `FP`, `H` ranges and recognized promotional code families. Examples:
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

Example: `C222` is `5th Stage`; `C409`/`C410` are `Grand Line Compilation 1`.

Recognized hyphenated vintage promotional families such as `C-J1`, `S-E1`, `C-E1`, `C-T1`, `C-W1`, `C-B1`, `C-JF01.1`, `C-A1`, `C-J09`, `H-P1`, `C-EC1`, `S-W1`, `H-VJ1`, `C-JF02.1`, and `H-T1` map to `Promo`.

The override is limited to vintage One Piece Hyper Battle/Carddass identity/year so unrelated modern codes are not remapped.

Development Edge Function `scan-card-ai-dev` was ACTIVE version 14 with `verify_jwt: true` at the v05 promotion state.

### Development v06 — scanner failure diagnostics

Purpose: make intermittent scanner failures diagnosable without changing successful identification behavior.

Change:
- `dev/src/features/owner/card-scanner.js` now extracts the actual JSON error/message returned by the Supabase Edge Function when `functions.invoke()` receives a non-2xx response.
- Identification failures can therefore surface the backend reason instead of only the generic `Edge Function returned a non-2xx status code` message.
- Market-price research remains isolated from card identification; a pricing failure does not invalidate an already successful identification.
- No timeout was blindly increased as part of this change.
- No Production file/function was modified by v06.

Observed failure distinction that motivated v06:
- An identification request can fail independently with a backend timeout/504.
- Separate market-price research can encounter Gemini `429 RESOURCE_EXHAUSTED` quota/rate-limit responses.
- A later successful identification is consistent with those being separate/transient paths; do not label every scanner failure as quota exhaustion without the actual backend error.

Validation executed for v06 source commit `512512f6fb78dcd2e90211eec59dc0bea824aa77` by Development workflow run `40111521841`:
- feature regression tests: passed
- scanner JavaScript syntax validation: passed
- SEO generator syntax/self-test: passed
- Development SEO generation: passed
- JavaScript/repository reference validation: passed
- CSS/retained release-contract validation: passed
- package creation/upload steps: executed successfully
- workflow conclusion: success

Validation/release limitation:
- The workflow's release version/package-manifest recording is stale (`2026-10-25-v03`), so v06 is not considered a correctly packaged/reconciled release yet.
- Authenticated Owner scanner behavior was not interactively browser-tested as part of this baseline-only reconciliation.

## Canonical Retained History / Files

- Active Development app directory is `dev/`; legacy Beta naming/paths are not active application terminology.
- SQL history remains under `migrations/2026/` and `migrations/legacy/` where present; do not move SQL into active application folders.
- Owner **Custom Order** behavior remains retained unless explicitly changed.
- QR Generator remains retained.
- Owner Insights styling remains in canonical `dev/src/styles/27-insights-dashboard.css`.
- Canonical active modules must not be replaced by version-suffixed active filenames.

## Retained Product Behavior

Unless a release explicitly changes an item below, preserve it:
- Desktop, mobile and Safari-sensitive behavior.
- Navigation/routes, inventory, card details, filtering/ordering and generators.
- Owner Mode security and owner Add/Edit/Delete/management tools.
- Supabase/RLS and backward compatibility.
- Analytics and Development analytics-test exclusion behavior.
- Contact to Buy: Availability, Make an offer, More photos / video, COD / meetup, Malaysia & Singapore purchase messaging, and negotiable international shipping where supported.
- Giveaways: social follows, Giveaway Code, entry form, optional bonus entries, Facebook Group bonus, giveaway generator, images and winner functionality.
- QR Generator and other retained tools.
- Existing visual design/spacing unless a redesign is explicitly requested.

## Intentionally Removed / Do Not Restore

- Do not restore abandoned experiments or features removed by later accepted releases merely because they appear in older commits/chats.
- Do not reintroduce Production dependencies on old Beta paths/repositories.
- Do not restore superseded scanner/layout experiments.

## Validation Contract

A commit is not completion. Before a Development or Production release is called complete:
1. Run syntax checks on every changed JavaScript file.
2. Validate imports, exports/registration, renamed/removed references and cache-busters.
3. Validate changed local assets, markup, IDs/classes and CSS/references.
4. Exercise requested success path and relevant empty/missing-data/output/control cases where tooling allows.
5. Inspect surrounding regressions relevant to the change: routes/navigation, generators, inventory/card details, Owner Mode, Add/Edit/Delete, Contact to Buy, giveaways, Supabase/RLS and analytics.
6. For UI work, check representative desktop/mobile/overflow/navigation/Safari-sensitive behavior where browser tooling is available. Static inspection is not browser testing.
7. Confirm public users gain no owner functions when shared owner code/routes are affected.
8. If DB behavior changes, identify affected objects, provide separate versioned rerunnable SQL where practical, preserve RLS/backward compatibility and never claim SQL applied without confirmation.
9. Inspect release diff and exclude debug/temp/abandoned/unrelated files.
10. After commit, inspect committed files, cache/version references and final repository HEAD.
11. Create full and patch ZIPs and integrity-check them before claiming packaging complete.
12. Record the correct release manifest and confirm Development Pages deployment.

Use status wording precisely:
- Tested = executed/exercised.
- Statically verified = repository/code inspection.
- Not tested = unavailable/not performed.
- If code is committed but validation/release reconciliation is incomplete: `Implemented, validation pending.`

## Deployment / Analytics Safety

- Do not browse/open live Production for testing without explicit authorization because it may contaminate Insights.
- Prefer repository inspection, static validation, Development and screenshots.
- When Dev browser/UI testing is available, use the Development-only analytics exclusion URL.
- GitHub Pages uses the repository's dynamic Pages deployment. The custom Development validation workflow must not create a competing Pages deployment.

## Production Promotion Contract

Only when explicitly requested:
1. Identify latest Production and approved Development.
2. Confirm Development validation is complete and no release-caused regression is unresolved.
3. Promote only approved Development changes; exclude abandoned/experimental and Development-only infrastructure.
4. Preserve Production-specific behavior.
5. Create a new date-based Production version and record previous Production + Development promoted from.
6. Validate Production independently, package it, integrity-check packages and confirm Pages/rollback protection where available.

## Baseline Maintenance

**Mandatory: update/reconcile `COLLECT_TCG_BASELINE.md` as part of every accepted Development or Production release/change. Do not leave baseline maintenance for a later turn.**

After every change:
- reconcile this file against current GitHub HEAD and the latest valid release manifest;
- record the current work/release version, important source/HEAD commits, SQL status, validation status and limitations;
- keep Production state accurate in the Development baseline and Development/promoted state accurate in the Production baseline where relevant;
- never overwrite accepted historical manifest facts with a later workflow run;
- if GitHub and this file disagree, GitHub/current valid manifest wins and this file must be corrected immediately.
