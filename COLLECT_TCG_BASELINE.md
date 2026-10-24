# Collect TCG Current Baseline

Last reconciled against GitHub: 2026-10-25

## Repositories

- Production: `collecttcg/Collect_TCG`
- Development: `collecttcg/Collect_TCG_Dev`
- Default branch: `main`
- Development is the working environment.
- Production is protected. Never modify, promote, deploy, prepare, or live-test Production unless explicitly requested.

Reconciliation priority: current GitHub HEAD > latest release manifest > this baseline > recent Project conversations > older conversations.

## Versioning

- `V210` is the final legacy `V###` release; historical releases are never renamed.
- Current releases use `YYYY-MM-DD-vNN` with the actual build date; Development and Production counters are independent.
- Development full: `Collect-TCG-Dev-YYYY-MM-DD-vNN-full.zip`
- Development patch: `Collect-TCG-Dev-OLD-to-NEW-patch.zip`
- Production full: `Collect-TCG-Production-YYYY-MM-DD-vNN-full.zip`
- Production patch: `Collect-TCG-Production-OLD-to-NEW-patch.zip`
- SQL: `YYYY-MM-DD-vNN-DESCRIPTIVE-NAME.sql`

## Current State

### Development

Current Development work: `2026-10-25-v03`
Previous Development checkpoint: `2026-10-25-v02`
Latest previously packaged Development release: `2026-10-24-v09`

`2026-10-25-v03` source history:
- `c98bf95bb05f0687901356eddb1b406075317167` — previous v02 scanner layout/cache checkpoint.
- `8cf3ab2167240f3d7b32db969c3709bccee1ecee` — AI scanner Series detection committed to GitHub.
- `d043a614e0f86bdf38eb40ddf55ec1fa6ea872d9` — Development validation/package workflow corrected for v03 and scanner CSS/style validation coverage.
- `23611e425301770e3eb14507f3f46e6d48950cbb` — restored historical `2026-10-24-v09` manifest after stale workflow overwrite.
- `957858b2d1d9357a67445650bd593863d31f474f` — repository baseline validation markers reconciled with current versions.

Current v03 validation/package status: in progress. Do not call v03 complete until workflow, package integrity, manifest, Pages deployment, and committed-file inspection are confirmed.

Latest previously packaged Development release manifest: `release-manifests/2026-10-24-v09.txt`.
Canonical v09 release record:
- Source commit: `39bec0768c863a3fa33365dad6ac35490e60a7a8`
- Full ZIP: `Collect-TCG-Dev-2026-10-24-v09-full.zip`
- Full SHA256: `c33ee749024f7981267bfc28bd8093e8e1ad3f2d8a8c36eb8ea111d26b05e1ed`
- Patch ZIP: `Collect-TCG-Dev-2026-10-24-v08-to-2026-10-24-v09-patch.zip`
- Patch SHA256: `00dbab23ac76287aa9bbbb2701e7af7be03b472d3e5d57cbe2d34cf69e4f1906`

### Production

Latest Production: `2026-10-16-v02`
Previous Production: `2026-10-16-v01`
Development promoted from: `2026-10-16-v03`
Production source commit recorded by manifest: `0ffb4ce7369406da05b81131e256d2c19a35a03b`
Current Production repository HEAD at reconciliation: `65b295179f86718cea033ec1dff59797ce5c3098`

Production package record:
- Full ZIP: `Collect-TCG-Production-2026-10-16-v02-full.zip`
- Full SHA256: `3de78e671de035e62ef37b121eaafbc8fc105df2f1848a7945c56b9224f81a9e`
- Patch ZIP: `Collect-TCG-Production-2026-10-16-v01-to-2026-10-16-v02-patch.zip`
- Patch SHA256: `71bc5f7cc113eb8223c8cfb82e997707de6140d5b12780c9c01ef92ae2ff7d2b`

Production has not received the October 24/25 scanner work. Keep it untouched unless an explicit Production update is requested.

## Development-only Changes Since Production

The Development repository contains later work that is not in Production, including the Owner Card/Slab Scanner and subsequent scanner/UI/performance/market-pricing changes.

Current scanner architecture:
- Owner Mode only.
- Frontend uses the first uploaded image for AI analysis.
- Image is resized before upload (current target max 1280 px, JPEG quality 0.8 where conversion applies).
- Development Supabase Edge Function: `scan-card-ai-dev`.
- JWT verification and `is_app_owner` authorization are required; public users must not gain scanner/owner capability.
- Gemini API key remains server-side only.
- AI output is a recommendation; detected values are not saved until the owner applies/saves them.
- Raw/Sealed scans must not retain grading company, grade, or certification values.
- Market pricing keeps raw and graded comparables separated; graded pricing should match grading company/grade where possible.
- Identification is separated from slower market research so detected fields can return first.
- No SQL is required for the current Series-detection change.

### Series detection — `2026-10-25-v03`

The AI scanner treats `series` as a first-class detected field and should identify the most useful collector release grouping when reliable. Examples include `OP01`, `OP02`, `Promo`, `First Stage`, `Second Stage`, anniversary releases, Championship, Tournament Pack, Starter Deck, Limited Edition, and other specific release groupings.

The scanner must not use the franchise/game name as Series and must leave Series blank when the release grouping cannot be identified reliably. Existing `Apply detected fields` behavior populates the editable Series field.

## Canonical Retained History / Files

- SQL history remains under `migrations/2026/` and `migrations/legacy/`; do not move SQL into active application folders.
- Owner **Custom Order** behavior remains retained unless explicitly changed.
- QR Generator remains retained.
- Owner Insights styling remains in canonical `dev/src/styles/27-insights-dashboard.css`.
- Canonical active modules must not be replaced by version-suffixed active filenames.

## Retained Product Behavior

Unless a release explicitly changes an item below, preserve it:
- Desktop, mobile, and Safari-sensitive behavior.
- Navigation/routes, inventory, card details, filtering/ordering, and generators.
- Owner Mode security and owner Add/Edit/Delete/management tools.
- Supabase/RLS and backward compatibility.
- Analytics and Development analytics-test exclusion behavior.
- Contact to Buy: Availability, Make an offer, More photos / video, COD / meetup, Malaysia & Singapore purchase messaging, and negotiable international shipping where supported.
- Giveaways: social follows, Giveaway Code, entry form, optional bonus entries, Facebook Group bonus, giveaway generator, images, and winner functionality.
- QR Generator and other currently retained tools.
- Existing visual design/spacing unless a redesign is explicitly requested.

## Intentionally Removed / Do Not Restore

- Do not restore abandoned experiments or features removed by later accepted releases merely because they appear in older commits/chats.
- Historical Beta naming/paths are not active application terminology. Active environment is Development/Dev and canonical app directory is `dev/`.
- Do not reintroduce Production dependencies on the old Beta repository.

## Validation Contract

A commit is not completion. Before a Development or Production release is called complete:
1. Run syntax checks on every changed JavaScript file.
2. Validate imports, exports/registration, renamed/removed references, and cache-busters.
3. Validate changed local assets, markup, IDs/classes, and CSS/references.
4. Exercise requested success path and relevant empty/missing-data/output/control cases where tooling allows.
5. Inspect surrounding regressions relevant to the change: routes/navigation, generators, inventory/card details, Owner Mode, Add/Edit/Delete, Contact to Buy, giveaways, Supabase/RLS, and analytics.
6. For UI work, check representative desktop/mobile/overflow/navigation/Safari-sensitive behavior where browser tooling is available. Static inspection is not browser testing.
7. Confirm public users gain no owner functions when shared owner code/routes are affected.
8. If DB behavior changes, identify affected objects, provide separate versioned rerunnable SQL where practical, preserve RLS/backward compatibility, and never claim SQL applied without confirmation.
9. Inspect release diff and exclude debug/temp/abandoned/unrelated files.
10. After commit, inspect committed files, cache/version references, and final repository HEAD.
11. Create full and patch ZIPs and integrity-check them before claiming packaging complete.
12. Record a release manifest and confirm Development Pages deployment.

Use status wording precisely:
- Tested = executed/exercised.
- Statically verified = repository/code inspection.
- Not tested = unavailable/not performed.
- If code is committed but validation is incomplete: `Implemented, validation pending.`

## Deployment / Analytics Safety

- Do not browse/open live Production for testing without explicit authorization because it may contaminate Insights.
- Prefer repository inspection, static validation, Development, and screenshots.
- When Dev browser/UI testing is available, use the Development-only analytics exclusion URL.
- GitHub Pages uses the repository's dynamic Pages deployment. The custom Development validation workflow must not create a competing Pages deployment.

## Production Promotion Contract

Only when explicitly requested:
1. Identify latest Production and approved Development.
2. Confirm Development validation is complete and no release-caused regression is unresolved.
3. Promote only approved Development changes; exclude abandoned/experimental and Development-only infrastructure.
4. Preserve Production-specific behavior.
5. Create a new date-based Production version and record previous Production + Development promoted from.
6. Validate Production independently, package it, integrity-check packages, and confirm Pages/rollback protection where available.

## Baseline Maintenance

After each accepted release, reconcile this file against current GitHub HEAD and the latest release manifest. Never leave the baseline pointing at an older release after accepting a newer one. If GitHub and this file disagree, GitHub/manifest wins and this file must be corrected.