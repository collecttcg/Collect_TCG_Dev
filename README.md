# Collect TCG Development

Development repository for the **Collect TCG MY & SG** website.

- Production: `collecttcg/Collect_TCG`
- Development: `collecttcg/Collect_TCG_Dev`
- Current Development release: `2026-10-25-v08`
- Previous Development release: `2026-10-25-v07`
- Production is protected and is not changed by Development releases unless an explicit Production promotion is approved.

## Current Development state

Development `2026-10-25-v08` is the validated follow-up to the eBay Ban List release. It fixes the Owner navigation insertion regression that could stop application startup when the Export control was nested under a different DOM parent.

Current Development functionality includes the Owner-only **eBay Ban List**, with persistent Supabase storage, search, add/edit/remove actions, copy controls and shortcuts to eBay Blocked Buyers. Access remains protected by Owner Mode and Supabase RLS.

The Development scanner also retains improved backend error reporting for failed AI card-scanner requests.

## Repository layout

| Path | Purpose |
|---|---|
| `dev/` | Deployable Development website (legacy internal directory name retained for compatibility) |
| `dev/src/` | Active application modules and styles |
| `dev/assets/` | Runtime image assets |
| `dev/cards/` | Generated SEO card pages |
| `migrations/` | Versioned Supabase SQL migration history |
| `tests/` | Automated regression tests |
| `tools/` | Validation, build, local serve and SEO tools |
| `docs/` | Current engineering documentation |
| `insights/` | Standalone owner-only Insights Development PWA |
| `release-manifests/` | Immutable release/package checksum records |

## Development

Node.js 22+:

- `npm test` — regression tests.
- `npm run check` — JavaScript syntax, imports, HTML assets and repository-structure checks.
- `npm run build` — validated deployable copy under `dist/dev/`.
- `npm run dev` — local HTTP preview.

The website uses native ES modules and does not require a framework build for GitHub Pages. The application remains under `dev/` for compatibility, and the repository-root Pages URL redirects to it.

## Database migrations

All SQL history is kept under `migrations/`. Migration filenames are preserved exactly; moving them into the migration directory does not mean they were newly applied. See `migrations/README.md`.

The eBay Ban List uses the `public.ebay_banlist` table with Owner-only RLS policies. The associated `2026-10-25-v07` migration has been applied to the shared Collect TCG Supabase project.

## Release process

Development changes are complete only after implementation, regression/static validation, release-diff inspection, package creation/checksums and final committed-file inspection. Production promotion is a separate explicit operation.

Latest validated package record: `release-manifests/2026-10-25-v08.txt`.

See `docs/ARCHITECTURE.md`, `docs/VALIDATION.md`, `docs/TEST-CHECKLIST.md`, and `docs/CHANGELOG.md`.
