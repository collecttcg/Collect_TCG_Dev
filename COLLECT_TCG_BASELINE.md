# Collect TCG Current Baseline

<!-- BEGIN AUTOMATED BASELINE STATE -->
## GitHub state

- Development latest non-baseline commit: `18eccca9ef8fcb05831cc4a99b9a377305ea414c`.
- Production latest non-baseline commit: `a2985302f010c87ff403ce47eefdc7fb3ca9bd55`.
- Production rollback ref: `a2985302f010c87ff403ce47eefdc7fb3ca9bd55`.
- Latest local release manifest: [`2026-11-22-v09`](release-manifests/2026-11-22-v09.txt) from `479fcc015ac102939c044bc45355467ea15f49ed`.
- Latest local change: `18eccca9ef8fcb05831cc4a99b9a377305ea414c` · Release Development 2026-11-22-v10 Facebook eBay multi-owner filter.

This section records GitHub state. The release manifest and workflow results determine validation and deployment status.
<!-- END AUTOMATED BASELINE STATE -->

## Development Facebook eBay listing year order — 2026-11-22-v09

- Replaces Development `2026-11-22-v08`. The Owner card picker displays the saved year and sorts oldest first. Year ranges use the starting year and undated listings appear last. The preview, copied post and numbered first-photo ZIP use the same order regardless of selection order or filters.
- Repository validation, Owner-gate and ordering fixtures, SEO checks and both package integrity checks passed. The deployed entry and generator import chain matched the release. Interactive desktop, mobile and Safari checks were not performed. No SQL or Edge Function changes required.
- [Manifest](release-manifests/2026-11-22-v09.txt) and [full and patch ZIPs](https://github.com/collecttcg/Collect_TCG_Dev/actions/runs/45011985575/artifacts/14750615140).

## Development AI scanner accuracy — 2026-11-22-v08

- Replaces Development `2026-11-22-v07`. Owner Add Card scans a higher-detail first photo and an optional scan-only close-up/back photo. Inventory matching checks game, series, language and year. Ambiguity requires owner confirmation before inventory enrichment or price research. Error printings are not assumed from the model name. No SQL required.
- The dedicated `scan-card-ai-dev` Edge Function v20 was deployed, source-verified and returned 401 on an unauthenticated request. Development checks, synthetic identification/pricing fixtures, mocked single/paired image requests, ZIP integrity and deployed-file checks passed. Real-photo accuracy and interactive browser checks were not measured.
- [Manifest](release-manifests/2026-11-22-v08.txt) and [full and patch ZIPs](https://github.com/collecttcg/Collect_TCG_Dev/actions/runs/44992916655/artifacts/14742252672).


## Development Facebook Post · eBay Listings — 2026-11-22-v07

- Replaces Development `2026-11-22-v06`. The Owner-only Facebook tools mode supports multi-selection with Owner and Era filters for available live cards with valid saved eBay URLs. It copies a numbered Facebook post and uses the existing ZIP helper to download each first photo in selection order. No SQL required.
- Repository, SEO and feature fixtures passed, including Owner gating and partial photo failure handling. The deployed generator matched the release. Interactive browser checks were not performed.
- [Manifest](release-manifests/2026-11-22-v07.txt) and [full and patch ZIPs](https://github.com/collecttcg/Collect_TCG_Dev/actions/runs/44985369575/artifacts/14739995219).


## Development eBay title fitting — 2026-11-22-v06

- Replaces Development `2026-11-22-v05`. Titles up to 80 characters retain their complete text. Overlong titles preserve applicable Vintage and ERROR labels, prioritize the card name and number, and shorten catalogue labels first. CARDDASS is optional under space pressure. An exceptionally long card number may be clipped when it cannot fit with reserved labels.
- JavaScript, character-budget fixtures, retained contracts and SEO checks passed. Pages deployment succeeded and the live entry and generator matched. No SQL required. Browser interactions were not tested.
- [Manifest](release-manifests/2026-11-22-v06.txt) and [integrity-checked full and patch ZIPs](https://github.com/collecttcg/Collect_TCG_Dev/actions/runs/44984151681/artifacts/14738537962).


## Development error card titles — 2026-11-22-v05

- Replaces Development `2026-11-22-v04`. Owner Add/Edit and the eBay title generator use `ERROR` for error cards. Both previous prefix formats remain recognized, and unchecking the editor checkbox clears the prefix. No catalogue rewrite or SQL required.
- Repository, SEO and title checks passed, and the deployed editor and utility matched the release. Both package ZIPs were integrity-checked. Interactive browser checks were not performed. The existing shared formatter was reused.
- [Manifest](release-manifests/2026-11-22-v05.txt) and [full and patch ZIPs](https://github.com/collecttcg/Collect_TCG_Dev/actions/runs/44982833402/artifacts/14738213631).


## Development pre-errata / error titles — 2026-11-22-v04

- Replaces Development `2026-11-22-v03`. Owner Add/Edit recognizes bracketed and plain prefixes, saves `PRE ERRATA ERROR` without brackets and clears the prefix when unchecked. The eBay generator formats previously saved bracketed prefixes without requiring a card edit. The catalogue was not bulk rewritten. No SQL required.
- Repository and SEO checks, owner name round-trip and eBay title fixtures, full and patch ZIP integrity, and deployed-file comparisons passed. Interactive browser checks were not performed. Refactoring shared prefix handling between the editor and the generator.
- [Manifest](release-manifests/2026-11-22-v04.txt) and [full and patch ZIPs](https://github.com/collecttcg/Collect_TCG_Dev/actions/runs/44982577741/artifacts/14738636080).


## Development Vintage eBay titles — 2026-11-22-v03

- Replaces Development `2026-11-22-v02`. The eBay title generator prefixes cards marked Vintage with `Vintage`. The title remains within 80 characters and retains ordinary card numbers when shortening long vintage titles. No SQL required.
- Repository and SEO checks and title fixtures passed. The deployed generator matched the release. Interactive browser checks were not performed. Refactoring review found no further change warranted.
- [Manifest](release-manifests/2026-11-22-v03.txt) and [full and patch ZIPs](https://github.com/collecttcg/Collect_TCG_Dev/actions/runs/44982210363/artifacts/14738585286).


## Development movable watermark — 2026-11-22-v02

- Replaces Development `2026-11-22-v01`. The Owner Add/Edit editor can reposition the CTA/QR banner per photo in either watermark mode. It renders the new position from the clean photo and saves it through the existing image-variant path. Placement coordinates are held for the current edit session, while the saved position is part of the image. The separate logo overlay retains its existing placement. No SQL required.
- Repository and SEO checks passed, along with mocked canvas and save preparation checks. The deployed homepage and changed modules matched the release. Desktop, mobile and Safari interactions were not tested. Refactoring review consolidated banner geometry between the renderer and placement guide.
- [Manifest](release-manifests/2026-11-22-v02.txt) and [integrity-checked full and patch ZIPs](https://github.com/collecttcg/Collect_TCG_Dev/actions/runs/44973647647/artifacts/14734687700).


## Qualified card view traffic source — shared Supabase migration

- Applied and verified `dev_2026_11_22_v01_qualified_card_view_source` with explicit approval. It adds a nullable source category and separate writer and Owner-only reader RPCs. Existing writer and reader RPCs remain available and table RLS remains enabled.
- A rolled-back SQL fixture verified source capture and normalization, country and device context, deduplication, Owner exclusion, and non-Owner read denial. A follow-up query found no persisted source fixtures. Development `2026-11-22-v01` replaced `2026-11-21-v03`. Repository and SEO checks and both ZIP integrity checks passed. Deployed Insights and analytics modules matched the release. Interactive desktop, mobile and Safari checks were not performed. [Release manifest](release-manifests/2026-11-22-v01.txt).


Last reconciled against GitHub: 2026-11-20

## Development collection SEO — 2026-11-21

- Development `2026-11-21-v03` replaces `2026-11-21-v02`. The release manifest records repository validation, the SEO checks and both integrity-checked ZIPs. HTTP checks confirmed the deployed Dev homepage title and collection link, the collection page with 245 card links, and the sitemap entry. [Manifest and ZIP checksums](release-manifests/2026-11-21-v03.txt).

- Added a crawlable One Piece Carddass Hyper Battle landing page from the existing public SEO catalogue. The homepage links to it and uses more specific title and description metadata for One Piece, Gundam, Malaysia and Singapore. Stable card slugs and existing public/private routing are retained.
- The Dev SEO refresh committed a collection page with 245 card links and a sitemap entry. Local generator syntax checks, Dev and Production-mode generator self-tests, and mocked Dev generation passed. Mock catalogue fixtures covered legacy category names, preserved slugs, and exclusion of hidden, archived and unrelated cards. Dev retains noindex. No SQL, authorization, analytics or Production changes. Interactive desktop, mobile and Safari testing were not performed.
- Refactoring review kept collection generation in the existing SEO pipeline. No broader refactoring was warranted.

## Development eBay inventory listing checker — 2026-11-21-v02

- Development release `2026-11-21-v02` replaces `2026-11-21-v01`, source `9ea66c401649779ad7ca12d7f0c03e2d43040cfa`. Changed the Edge Function source and release workflow. eBay Trading API GetItem confirms the exact listing ID and closed status. The default request is read-only, and writes require explicit apply mode and authenticated scheduler or service-role access.
- Development dry run returned HTTP 200, checked 128 IDs, and confirmed 31 ended listings with zero errors and writes. Syntax, status, notes, and authorization fixtures passed. Release run 44905414904 passed and integrity-checked both ZIPs. Backend work required no interactive UI changes.
- After explicit approval, the shared Production job was activated for 09:30 JST daily. The first manual apply removed 31 links, and a second dry run checked the remaining 97 IDs with zero ended listings or errors. The schedule and auth SQL were applied separately to the shared project, with no card schema or RLS changes. Disable the schedule via `cron.unschedule('collect-tcg-ebay-inventory-daily')` to stop automatic cleanup. The first timer-triggered run remains pending.
- [Manifest](release-manifests/2026-11-21-v02.txt) and [full and patch ZIPs](https://github.com/collecttcg/Collect_TCG_Dev/actions/runs/44905414904/artifacts/14707267695).

## Production promotion of eBay title format — 2026-11-21

- Production `2026-11-21-v01` replaces `2026-11-20-v01` and promotes Development `2026-11-21-v01` (source `6a8697ff33333f77da439456943eee75bc6f208a`). Generated eBay titles use game, set/series, year, card name and card number. Condition and language remain in listing details. Exact card numbers receive space within the 80-character limit.
- The shared catalogue already supplies numeric series labels to both environments. No SQL or backend change was required for promotion.
- Production release `44879739940`, SEO refresh `44879739960`, and Pages deployment `44879792423` succeeded. Production syntax, generated-title fixtures, retained contracts, SEO, both ZIP integrity checks and deployed-file comparisons passed. Rollback ref advanced to `8e02ec3c8e7f218797b39433a5d6743410a484cc`, replacing `9691c20819996d34197a08361d1ed72183b0b236`. Interactive desktop, mobile and Safari sessions were not performed.
- [Manifest and ZIP checksums](https://github.com/collecttcg/Collect_TCG/blob/main/release-manifests/2026-11-21-v01.txt) and [full and patch ZIPs](https://github.com/collecttcg/Collect_TCG/actions/runs/44879739940/artifacts/14696608912).

## Repositories
- Production: `collecttcg/Collect_TCG`
- Development: `collecttcg/Collect_TCG_Dev`
- Default branch: `main`
- Development is the normal working environment; Production is protected.
- Reconciliation priority: current GitHub HEAD > latest valid release manifest > baseline > recent Project context > older context.

## Versioning
- `V210` is the final legacy `V###` release.
- Current releases use `YYYY-MM-DD-vNN`; Development and Production counters are independent.
- Historical release manifests are immutable.

## Shared catalogue series abbreviations — 2026-11-21

- Reviewed all 458 `public.cards` rows and applied a count-guarded data update to 165 rows across 13 Series / Collection values. Converted spelled-out stage ordinals from First through Seventh to 1st through 7th, including comma-separated series. Existing names and numeric values outside that mapping were retained.
- Verified the post-update distribution against the full pre-update catalogue and the exact mapping. The 121 former First Stage entries joined one existing 1st Stage entry. The normal card update history trigger was active. The shared catalogue supplies Dev and Production.
- No schema, RLS, frontend, or release package changes. Generated static SEO pages and interactive website views were not verified as part of this data edit.

## Development eBay title search terms — 2026-11-21-v01

- Development `2026-11-21-v01` replaces `2026-11-20-v02`. The eBay generator builds titles in game, set/series, year, card name, and card number order. Condition and language remain in item specifics and the description. The 80-character budget favors complete words and preserves the exact card number when shortening a long name. No SQL, Supabase, RLS or permission changes.
- Changed the marketplace generator, its cache references through the Dev homepage and feature registration, the existing title regression fixture, and release packaging workflow. SEO refresh regenerated the Dev pages using the new entry version. Refactoring review found no further change warranted.
- Syntax and title fixtures passed, including missing values, long names, and retained language and grade specifics. `npm run validate`, the SEO checks and refresh `44878593375`, and the full and patch ZIP integrity checks passed. Release `44878593854` succeeded on retry after an overlapping main update rejected the initial manifest push. Dev Pages `44878688019` succeeded. Interactive desktop, mobile and Safari sessions were not performed.
- [Manifest and ZIP checksums](release-manifests/2026-11-21-v01.txt) and [full and patch ZIPs](https://github.com/collecttcg/Collect_TCG_Dev/actions/runs/44878593854/artifacts/14697038167).

## Production promotion of Carddass category rename — 2026-11-20

- Validated Dev `2026-11-20-v02` (source `7eabc9c28ea3ba9806718d65c990a668addf50ec`) promoted to Production `2026-11-20-v01`, replacing `2026-11-19-v01`. Existing cards, Add/Edit choices, filters/search and generated Production metadata use **One Piece Carddass Hyper Battle** with legacy stored values and category-order keys retained. No SQL or backend changes.
- Independent Production checks included 350 filter/sort scenarios, category/lifecycle/save/search/order fixtures, syntax/import/structure, CSS, SEO and Owner/public contracts. All 426 existing Production public card URLs were preserved. Release `44683597737`, Pages `44683652910` and retried SEO `44683597828` passed. Live files matched source, both ZIPs passed integrity checks, and rollback ref advanced to `9691c20819996d34197a08361d1ed72183b0b236`. Interactive desktop/mobile/Safari sessions were not performed.
- [Production manifest](https://github.com/collecttcg/Collect_TCG/blob/main/release-manifests/2026-11-20-v01.txt) and [full/patch ZIP artifact](https://github.com/collecttcg/Collect_TCG/actions/runs/44683597737/artifacts/14605298517). Dev-only infrastructure and Production-specific behavior were preserved.

## Development Carddass category rename — 2026-11-20-v02

- Current Dev release `2026-11-20-v02`, previous packaged Dev release `2026-11-20-v01`; the task began from `2026-11-19-v01`. Final release source `7eabc9c28ea3ba9806718d65c990a668addf50ec`. [Manifest and ZIP checksums](release-manifests/2026-11-20-v02.txt). The earlier v01 manifest is retained unchanged; v02 corrects the shared category-order key compatibility found during final review.
- Dev displays **One Piece Carddass Hyper Battle** for existing cards stored as **One Piece Hyper Battle**, and offers the new name in Add/Edit choices. Both names match category filters and search. Shared database card writes retain the legacy game value, and normalized category-order keys retain `one piece hyper battle`, so Dev saves/reorders remain compatible with Production. No shared database rename, SQL, migration, RLS, permissions or Edge Function changes were applied.
- Changed catalogue mapping, card presentation choices, inventory normalization/search, module/cache entry points, Dev-only SEO generation and release workflow. Regenerated Dev card/Reviews pages, sitemap and stable slug records. All 425 existing public slugs common to the prior and refreshed catalogue were unchanged. The generator refreshed the current public catalogue, including newly registered cards.
- Tested: all 87 feature tests; 81 JavaScript/import/structure checks; CSS and release contracts; SEO workflow guard and generator self-test; card read/write/new-entry compatibility; legacy/new filter/search aliases; preserved inventory/collection order keys. Owner/public guards remain unchanged and existing boundary tests passed. No live database mutation was used for validation.
- Development Release `44682709570` succeeded, including full and patch ZIP creation, integrity checks, upload and immutable manifest. SEO refresh `44682633794` succeeded. Pages `44682745038` deployed successfully. HTTP checks confirmed the live Dev homepage, main/registry, catalogue, choices, filtering modules and a renamed generated card page exactly matched committed content.
- Interactive desktop/mobile and Safari sessions were not performed. The longer category label is shared across responsive layouts without a layout redesign.
- Production main was rechecked at `f042ea7a7d66a357c3bafd3e14b8b1af1723d28f`, still `2026-11-19-v01`; Production was not edited, promoted or opened for live testing. Its previously verified rollback ref remains `c65d68cd4c81f63b0182f6483fe3b37553a2914b`.
- Both ZIPs are in [the release artifact](https://github.com/collecttcg/Collect_TCG_Dev/actions/runs/44682709570/artifacts/14605436182), with GitHub's 30-day retention.

## Production promotion of Owner filter persistence — 2026-11-19

- Development `2026-11-19-v01` promoted to Production `2026-11-19-v01`, replacing Production `2026-11-15-v04`. Production release `44447284661` passed code, SEO, package integrity and deployed-file checks. Rollback ref verified at `c65d68cd4c81f63b0182f6483fe3b37553a2914b`. No SQL required. Production uses its own localStorage preference key.

## Development Owner filter persistence — 2026-11-19-v01

- Previous Dev release `2026-11-15-v07`. Source `9e1095cc981299d4d0cb83fa76c831d44c7a8daf`. [Manifest and ZIP checksums](release-manifests/2026-11-19-v01.txt).
- The Card Owner filter is saved in browser localStorage using a Dev-specific key and restored after refresh. All Owners and Clear All remove the preference; Clear All resets it before the inventory redraw. Public filtering remains gated by Owner Mode and private metadata authorization is retained. No SQL or backend changes.
- Updated the owner-category module, cache entry points, generated Reviews/card pages and release workflow. Adjusted the existing Hidden Listings import assertion to permit the changed cache version.
- All 87 tests, repository/CSS/release checks and SEO self-test passed. The lifecycle fixture exercised fresh registration, selection, refresh, All Owners, Clear All ordering, invalid values, unavailable storage and public-view isolation. Refactoring reviewed: a localized setter keeps in-memory and stored selections consistent.
- Development Release `44446686359` and SEO `44446686402` succeeded, both ZIPs were created and integrity-checked, and the live homepage, application entry modules and owner-filter module matched the release source. Interactive desktop/mobile/Safari sessions were not performed. Production remains `2026-11-15-v04`.

## Production promotion of Dev navigation v07 — 2026-11-15

- Development `2026-11-15-v07` was promoted to Production `2026-11-15-v04`. Desktop shows Reviews in the main row and Giveaway under More, and mobile retains its original layout. No SQL required.
- Production release `43724799373` and Pages `43724833485` succeeded. Both ZIPs were integrity-checked, and rollback ref verified at `3585e4b7b05c815a117ec4d7b9755a2efaed0a58`.

## Development mobile navigation restoration — 2026-11-15-v07

- Previous Dev release `2026-11-15-v06`. Source `020aa23bc087c3c7ffbd97e37dbfe97f688c428a`. [Manifest and ZIP checksums](release-manifests/2026-11-15-v07.txt).
- Restored the original mobile header, grid, and More menu order, with Reviews and Giveaway inside More. The desktop Reviews/Giveaway swap remains, including the compact desktop header. Updated the app shell, generated Reviews and card pages, responsive CSS, and Dev release workflow. No SQL or authorization changes.
- All 87 tests passed. Compared the mobile markup and responsive rules with Dev v05 and verified the desktop destinations. Release `43724371726`, SEO `43724371714` and Pages `43724409792` succeeded. Both ZIPs passed integrity checks and the live homepage, Reviews page and CSS matched the release. No interactive browser or Safari testing. Production remains `2026-11-15-v03`.

## Development primary navigation — 2026-11-15-v06

- Previous Dev release `2026-11-15-v05`. Source `653aba987b62863bb29801e1d02ce7e9205fa35f`. [Manifest and ZIP checksums](release-manifests/2026-11-15-v06.txt).
- Moved Reviews into the main desktop and mobile rows and moved Giveaway into More. Mobile keeps the logo, Inventory, Collection, Sold, and More, with Reviews added in a dedicated cell. More highlights on Giveaway, and Reviews still links to the clean URL. No SQL, database, or route authorization changes.
- Updated the app shell, generated Reviews and card HTML, responsive navigation CSS, navigation active-state logic and cache references, and the Dev release workflow. All 87 tests passed. Desktop/mobile markup and JS active-state fixtures passed, including widths from 320 to 1920 px. Interactive browser and Safari testing were not performed.
- Release `43723403183`, SEO refresh `43723403262`, and Pages `43723432573` succeeded. Both ZIPs passed integrity checks, and the served homepage, Reviews page, navigation JS, and CSS matched the release. Production remains `2026-11-15-v03`.

## Production promotion of Dev Reviews v05 — 2026-11-15

- Development `2026-11-15-v05` was promoted to Production `2026-11-15-v03` for the Reviews frontend and SEO, including the account filter removal from Dev v04. Production release `43720319868`, SEO `43720319942`, and Pages `43720343524` succeeded. Rollback ref verified at `0c19b5af5fd7b3aa8eabe612c0af5b5de36ca3f1`.
- The Production Reviews page and sitemap were served and verified. No SQL was required. Interactive browser testing and Google indexing were not verified.

## Development clean Reviews URL — 2026-11-15-v05

- Previous Dev release: `2026-11-15-v04`. Source `6a3629f2447ab1db957d8078a76772b9bac6eac9`. [Manifest and ZIP checksums](release-manifests/2026-11-15-v05.txt).
- Reviews is served at `/Collect_TCG_Dev/dev/reviews/` with its own canonical URL, title, description, Open Graph metadata, HTML heading and summary, navigation links, and sitemap entry. Existing `#/reviews` links continue to load the existing Reviews module. The Dev page retains noindex. No review-star markup, database changes, or Production changes.
- Updated the SEO generator, review HTML and sitemap, app shell and router entry points, and Dev workflows. All 87 tests passed. Route fixtures covered clean and legacy entry, other hash navigation, and card and home compatibility. SEO self-tests passed in both modes. Interactive browser and Safari sessions were not run.
- Development release `43717636532` verified and uploaded both ZIPs. SEO refresh `43717636589` and Pages `43717679766` completed successfully. HTTP asset checks matched the deployed Reviews HTML, sitemap, and routing modules. Production remains `2026-11-15-v02`.

## Development Reviews release — 2026-11-15-v04

- Previous Dev release: `2026-11-15-v03`. Source `e604639ff90bf15e57e7c481dae6706dfb1e48ed`. [Manifest and ZIP checksums](release-manifests/2026-11-15-v04.txt).
- Removed the eBay account dropdown and its event binding. eBay Seller Feedback shows one newest-first list across all seller accounts, with ten entries per page. Seller names, reputation totals, Collector Reviews, and Owner connection/sync controls are retained. No SQL or database changes.
- Changed `dev/src/features/content/reviews.js`, its cache-version entry points, and the Development release workflow. The separate Dev SEO workflow now rebases before publishing generated pages to handle concurrent baseline commits.
- All 87 tests and repository/release checks passed. The local pagination fixture covered 267 records across sellers, first/last and single-page states, empty/error handling, and public Owner-control visibility. Dev release `43715462716` verified and uploaded both ZIPs. Dev SEO `43715546596` passed on retry with the workflow fix. Dev Pages `43715567778` succeeded, and the deployed Reviews module and entry files matched the release. Interactive browser/Safari testing was not performed. Production remains `2026-11-15-v02`.

## Development Reviews release and Production promotion — 2026-11-15

- Development `2026-11-15-v03`, previous `2026-11-15-v02`, source `1b92e890e98e21363cba8236b3ed74eb16c09f9e`. [Manifest and ZIP checksums](release-manifests/2026-11-15-v03.txt). Development release workflow `43712762172` passed repository and SEO checks and verified both ZIPs. The pagination and OAuth routing fixtures passed.
- Production `2026-11-15-v02` promoted the Reviews frontend only. Production release `43712857967` and Pages `43712903625` succeeded, with rollback ref verified at `28a13c67d0bcded8dcfb2704be54973646a8050c`. This promotion reused the existing feedback cache and sync endpoints. No SQL or backend change for the frontend promotion.

## eBay Reviews Production promotion check — 2026-11-15
- Deployed shared OAuth callback `ebay-oauth-connect-dev` v5. An authenticated Owner can bind the Production return path into the one-time OAuth state when initiating a Production connection. State validation precedes destination selection, and existing Dev grants and callback requests continue to target Dev. Local tests exercised cancellation, tampering, replay, destination allowlisting, and the Owner authorization boundary. A signed-in live eBay OAuth round trip was not exercised.
- The Dev repository validation suite (87 tests, repository and CSS checks, release contracts), SEO workflow guard, and generator self-test passed at source `3c2e222e047137689d9a313453528b898a25fe31`.
- Full Production promotion remains blocked. The active deletion endpoint v6 returns HTTP 503 for deletion notifications, and the feedback cache stores comment, feedback ID, and seller account without the comment author's account identifier. The deletion workflow and backfill must be verified before publishing stored eBay comments in Production. Production remained on `2026-11-15-v01`.

## Daily eBay seller feedback sync — 2026-11-16

- The shared background job `collect-tcg-ebay-feedback-weekly-dev` now runs daily at 09:00 JST (00:00 GMT) via applied migration `dev_2026_11_16_v01_ebay_feedback_daily`. It retains its existing job name and signed command. The same eBay feedback cache supplies Dev and Production Reviews. No website deployment or Supabase Edge Function change was required.
- Confirmed the active daily schedule and identical job command. A manual run of the exact scheduled command returned HTTP 204 and advanced the success timestamps for accounts 1, 2, 3 and 5 at 17:23 JST. Account 4 is unconnected. The first timer-triggered daily run is due November 17 at 09:00 JST.

## Development weekly eBay seller feedback sync — 2026-11-15
- Approved shared Supabase migrations `dev_2026_11_15_v04_ebay_feedback_weekly` and `dev_2026_11_15_v05_ebay_feedback_weekly_signatures` were applied. Active job `collect-tcg-ebay-feedback-weekly-dev` was initially scheduled for Mondays at 09:00 JST (00:00 GMT), with separate requests for enabled, OAuth-connected accounts.
- `ebay-feedback-weekly-dev` v2 is active. The signing key stays in Vault. Requests use three-minute, seller-bound signatures, claimed once by the service-role-only RPC. The original token was rotated and its verifier disabled after the managed queue retained default grants.
- A manual execution of the exact scheduled command returned HTTP 204 and advanced the success timestamps for accounts 1 and 3. Replaying the signed requests returned HTTP 403. Verified the public and authenticated roles cannot execute the claim RPC. Accounts 2, 4 and 5 were unconnected. The first scheduled execution is pending.
- Public Reviews and Owner/OAuth changes remain subject to the Development release gate. The eBay OAuth callback currently returns to Development, and the active account-deletion endpoint rejects notifications until verification is implemented. No Production promotion was applied.

## Development Reviews pagination — 2026-11-15 (validation pending)
- Public eBay Seller Feedback and Collector Reviews show ten entries per page with Previous and Next controls. The eBay account filter returns to page one and shows an account-specific empty state. eBay feedback is retrieved in ordered batches beyond the former 100-row cap so reputation totals cover the full imported list.
- All 87 repository tests, reference/CSS checks, release contracts, SEO workflow guard and generator self-test passed locally. A fixture with 267 eBay entries and 21 Collector Reviews exercised page limits, account filtering, totals, empty/error handling, and public view. Browser desktop/mobile/Safari and live backend checks pending. No SQL or policy changes. No release manifest or packages for this change.
- Dev Pages deployment succeeded in run `43711238718` for `671fc6d5`. In SEO run `43711226288`, tests and generated-file validation passed, but the generated files could not be pushed because the automated baseline commit advanced `main` first.

## Development eBay reputation emphasis — 2026-11-15 (validation pending)
- Updated `dev/src/features/content/reviews.js` to highlight live imported eBay positive percentage in a green reputation panel, show prominent positive/neutral/negative counts, and retain the distinction from separate website five-star reviews. Responsive three-column counts and empty-feedback fallback included. Owner eBay connection controls moved below seller feedback into an Owner-only panel; public feedback filtering remains.
- Source committed `e8eebea2d475cc1a1308d07a5fdaf2f5ce150856`; JS syntax parsed. Browser desktop/mobile and Safari UI not exercised; no release manifest, ZIPs or release validation. Production unchanged. No SQL required.

## Development five-account eBay OAuth — 2026-11-15 (configuration and validation pending)
- Applied shared Supabase migration `dev_2026_11_15_v03_ebay_oauth_connections`: restricted, RLS-enabled Dev OAuth state and encrypted connection tables. Existing feedback and Production review tables unchanged.
- Deployed `ebay-oauth-connect-dev` v2: verified Owner starts one-time state-bound OAuth, callback verifies exact eBay account with Trading GetUser, AES-GCM encrypts refresh token and stores ciphertext only, then redirects to Dev Reviews. Requires Supabase secrets `EBAY_RUNAME` and a base64 32-byte `EBAY_TOKEN_ENCRYPTION_KEY`; eBay RuName callback must point to the deployed function. These configurations are not confirmed.
- Deployed `ebay-feedback-sync-dev` v4: per-account refresh-token use, retaining first-account legacy access-token fallback. Dev Reviews now shows account Connect/Reconnect, Sync All, and account filter. JS syntax parsed; Edge Functions bundled and deployed. OAuth live roundtrip, account linking, refresh, all-account sync, UI browser tests and scheduling are not tested/complete. No release packages or manifest. Production unchanged.

## Development Reviews eBay summary refinement — 2026-11-15 (validation pending)
- Confirmed 25 imported eBay feedback records, all positive. Updated `dev/src/features/content/reviews.js` to show eBay positive percentage and sentiment counts in leading summary; website stars and average remain separately labeled. eBay sentiment is not misrepresented as five-star ratings.
- Dev source committed `fb6d4cd87eead26ae29bc4067501122a603770df`. Browser and syntax execution not independently verified; no package/manifest created. Production unchanged.

## Development eBay feedback CORS fix — 2026-11-15 (validation pending)
- Live Supabase function logs confirmed browser `OPTIONS` preflight requests returned HTTP 405 on `ebay-feedback-sync-dev` v2; database had 0 imported feedback rows. Updated function to return 204 with CORS headers for preflight and include CORS headers on JSON responses. Deployed Edge Function v3 ACTIVE, source commit `a2fbeebc96002101780ea705e5ea8342ab663f67`.
- Owner JWT verification and service-role authorization remain unchanged. End-to-end browser retry and import still pending. Production frontend unchanged. No release packaging.

## Development eBay feedback Owner authorization fix — 2026-11-15 (validation pending)
- User's first import test returned `Unauthorized` because v1 required exact service-role bearer. `ebay-feedback-sync-dev` v2 now accepts an authenticated Supabase user token only after `auth.getUser` validation and server-side `app_owners` membership lookup; service-role bearer remains accepted for trusted backend invocation. JWT gateway remains enabled.
- Development Reviews module now exposes an Owner-only `Sync eBay Feedback` button invoking the function with the existing authenticated Supabase client for `collect_tcg_1`. Public visitors cannot invoke via the button. Deployed Edge Function v2 confirmed; website JS committed but not independently tested or packaged. End-to-end Owner import and UI tests pending. No Production promotion.

## Development eBay feedback import — 2026-11-15 (validation pending)
- Deployed `ebay-feedback-sync-dev` Edge Function v1 from `supabase/functions/ebay-feedback-sync-dev/index.ts`. Requires service-role bearer authorization and JWT gateway. Fetches seller feedback for allowlisted accounts 1–5, paginates, upserts into existing `public.ebay_feedback_dev` with account/feedback ID deduplication, and records per-account status. Uses `EBAY_USER_REFRESH_TOKEN` if configured, otherwise short-lived `EBAY_USER_ACCESS_TOKEN`.
- Deployment confirmed. Invocation, actual imported rows, permissions for accounts 2–5, scheduled execution, refresh renewal and end-to-end UI verification not tested/configured. Shared feedback table held zero rows before this change. Production frontend untouched. No release manifest or packages.

## Development eBay feedback API probe — 2026-11-15 (validation pending)
- Deployed JWT-protected read-only Edge Function `ebay-feedback-probe-dev` version 1, source `supabase/functions/ebay-feedback-probe-dev/index.ts`. Uses securely configured `EBAY_USER_ACCESS_TOKEN` to request first-page seller feedback via Trading API `GetFeedback` for allowlisted `collect_tcg_1` through `collect_tcg_5`; returns only aggregate metadata, no raw comments or tokens.
- User confirmed saving token in Supabase; value was not read. Deployment observed, but authenticated invocation and actual eBay feedback retrieval **not tested**. No DB writes, scheduled sync, or Production frontend changes. No release packages or manifest created.


- 2026-11-15 follow-up: deployed `ebay-feedback-probe-dev` v2 to return first-page positive/neutral/negative breakdown without exposing buyer details. First attempted deployment failed to bundle due to malformed regex; corrected source committed and v2 deployment confirmed. Live invocation of v2 pending. No feedback imported, no database writes or Production changes.

## Development eBay account-deletion endpoint — 2026-11-15 (validation pending)
- Explicitly approved shared-Supabase deployment: isolated Edge Function `ebay-account-deletion-dev` version 1. Source: `supabase/functions/ebay-account-deletion-dev/index.ts`.
- GET implements eBay SHA-256 challenge response only after secure `EBAY_DELETION_VERIFICATION_TOKEN` configuration. POST fails closed with 503 until signed notification validation and actual data deletion are implemented. **Do not register with eBay yet.**
- No credentials configured; no feedback or notifications imported. Production frontend untouched. Deployment observed, end-to-end testing and release packaging pending.

## Current Development release — 2026-11-15-v02

- Previous Development release: `2026-11-15-v01`. [Release manifest and ZIP checksums](release-manifests/2026-11-15-v02.txt).
- Removed the Inventory eBay callout and its styles. The quick-filter button reads “Listed on eBay” in desktop and mobile markup and continues to use `quick=ebay`.
- All 87 tests, release contracts, CSS checks, SEO generator self-test, and both ZIP integrity checks passed. No SQL required. Interactive desktop, mobile, and Safari testing was not performed for this release.
- Promoted to Production `2026-11-15-v01`. Pages served the new label. Production rollback-anchor advancement remains unconfirmed.

## Previous Development release — 2026-11-15-v01

- Previous Development release: `2026-11-14-v04`. [Release manifest and ZIP checksums](release-manifests/2026-11-15-v01.txt).
- Inventory now shows an eBay callout above the filter toolbar. One link opens eBay-listed Inventory and the other opens Contact, which lists the official eBay accounts. Desktop quick filter label is “Listed on eBay”; mobile keeps “On eBay” for fit.
- All 87 tests, release contracts, CSS checks, SEO generator self-test, and both ZIP integrity checks passed. Both links were exercised on deployed desktop Development; all 88 resulting cards had eBay badges, and Contact exposed the official accounts. Interactive mobile and Safari checks were not performed. No SQL required.

## Previous Development release — 2026-11-14-v04

- Previous Development release: `2026-11-14-v03`. [Release manifest and ZIP checksums](release-manifests/2026-11-14-v04.txt).
- On eBay replaces Championship in desktop and mobile listing quick filters. It uses the existing eBay listing marker and persists in the listing URL. Championship landing links retain their existing behavior. No SQL required.
- All 87 tests, Dev release contracts, SEO generator self-test, and both ZIP integrity checks passed. Development desktop browser showed 85 eBay-marked tiles out of 85 results and restored the filter on reload. Mobile markup and CSS were checked without an interactive mobile or Safari session.
- Promoted to Production `2026-11-14-v03`. Production Pages served the new filter code, and the release manifest records ZIP integrity checks. Production rollback-anchor advancement remains unconfirmed.

## Photo Library rename — 2026-11-14

- Owners can rename saved originals from Add Card and Edit Card. Renaming keeps the image extension and affects the private original only. Published listing copies use separate storage.
- Rename migration: `migrations/2026/2026-11-14-v03-OWNER-PHOTO-LIBRARY-RENAME.sql`. Production rollout uses the same private library so existing saved originals remain available. The release manifests record packaging and validation.

## Development Photo Library — 2026-11-14 (validation pending)

- Owner Add Card and Edit Card can save JPEG, PNG and WebP originals to the private `owner-card-photo-library-dev` bucket and select multiple files for the existing listing preview. Direct uploads and URL entry remain available. Saved listing copies still use the established listing image pipeline.
- Migration: `migrations/2026/2026-11-14-v02-OWNER-PHOTO-LIBRARY-DEV.sql`. Applied to the shared Supabase project with explicit approval. SQL readback confirmed the private bucket, allowed image formats, size limit, and Owner-only read/upload policies. Existing listing image storage is independent.
- Development repository validation, JavaScript syntax checks, SEO generator self-test, and a mocked storage flow passed. Owner and non-Owner end-to-end Storage API testing and interactive browser testing remain pending. No new release manifest or packages have been recorded.

## Latest release and promotion — 2026-11-14

- Development: `2026-11-14-v01`; previous `2026-11-12-v07`; manifest `release-manifests/2026-11-14-v01.txt`; package source `a9e2d7fd08aedd9c9b45596a5481be2b1d18b635`; manifest commit `b433461d7013edce2cb87e45619193180de31c38`.
- Development passed all 86 tests, repository and CSS checks, release contracts, and the SEO generator self-test. The full and patch ZIPs passed integrity checks. File names and checksums are in the immutable manifest.
- The release workflow uses `npm run validate` in place of stale cache-version checks. The registered Facebook generator is exercised with Sold, Available, group-friendly, and missing-price cases. Sold posts show one USD price line and preserve the saved eBay URL.
- Desktop inventory sort and filter controls use 11px labels and 40px heights at widths of 992px and above. The eBay checkbox measures 18 × 18px. Development desktop Cloud Browser confirmed these measurements at 1363 × 936 before packaging. The release workflow did not include interactive browser testing.
- About Us lists the five official eBay accounts. The experimental eBay feedback feature and its separate SQL migration stayed in Development. The promoted storefront changes required no SQL.
- Production: `2026-11-14-v01`; previous `2026-11-12-v06`; manifest `release-manifests/2026-11-14-v01.txt` in the Production repository; promoted from Development `2026-11-14-v01`. Production package source `4ab6679f643755f29d10c4ba2e076f9bc248dad5`; manifest commit `19f60813cf3eac2073073b9c7edb652069f5f315`.
- Production Pages served the new asset version. The last observed `production-last-known-good` ref was `e1047a76f9c6570bf9b6e2f8cd16b3431f2df355`, so rollback-anchor advancement is unconfirmed. No interactive Production browser test was performed.
- The November 13 notes below record the state at the time. Sold Facebook post behavior is covered by the November 14 tests, and Production had already received the sold-post and Insights updates on November 13. End-to-end Insights device capture remains unverified.

## Current reconciled state — 2026-11-10

### Previous validated releases (2026-11-05-v01)
- Development: `2026-11-05-v01`; previous `2026-11-03-v02`; manifest `release-manifests/2026-11-05-v01.txt`; package source `9f8312141068c2e7f33b85b8b341863255ff71ae`.
- Development full ZIP: `Collect-TCG-Dev-2026-11-05-v01-full.zip` (SHA256 `6d00cb3c09bf04efea15d45a705b807ed07f6a8c75e7b2de4c2ecc3971dafe24`).
- Development patch ZIP: `Collect-TCG-Dev-2026-11-03-v02-to-2026-11-05-v01-patch.zip` (SHA256 `f1c31d9090c662e3e1b5f60742c4e912a0ceaba025b71cc238662a413b694eec`).
- Production: `2026-11-05-v01`; previous `2026-11-03-v02`; manifest `release-manifests/2026-11-05-v01.txt`; package source `838e0fcdba04101c2dca4558d21de722c6a6b4e6`; manifest/rollback commit `d7696ef2988ffd41bc6a20e1345ff46736fc7aeb`.
- Production full ZIP: `Collect-TCG-Production-2026-11-05-v01-full.zip` (SHA256 `37849152060388021a885d2530225edc316cc6a2ae8f83c6855f8540cc1b65ad`).
- Production patch ZIP: `Collect-TCG-Production-2026-11-03-v02-to-2026-11-05-v01-patch.zip` (SHA256 `20e1b0d970ad47a9b67b958f22cc18cd8914bdcc4668a2cf51bec17f02b4b878`).
- Development v01 release validation, packages, immutable manifest and GitHub Pages deployment succeeded. Development SEO refresh also succeeded after updating the baseline checker and legacy analytics cache-version assertions.
- Production v01 independently passed the Production release workflow; packages and immutable manifest were recorded; GitHub Pages deployment succeeded; `production-last-known-good` advanced to `d7696ef2988ffd41bc6a20e1345ff46736fc7aeb`.
- No new SQL/Edge Function/RLS migration was required. Interactive desktop/mobile/Safari browser testing and live Production opening were not performed.

### Promoted Development changes
- Facebook single-card posts include an optional saved eBay listing URL after the Collect TCG card URL.
- Sale conversion snapshots resolve the actual card creation date from the database when omitted from the local card object. Unknown dates are recorded as unknown rather than inventing a January 2000 listing date.
- SEO card titles now include game and series to distinguish similarly named cards.
- Preserve Production-specific QR Generator, scanner endpoint, analytics/privacy boundaries and stable SEO URLs. Keep Development analytics-test exclusions out of Production.
- Development's `tools/check.mjs` and `tools/release-contracts.sh` were corrected to match the current baseline format and analytics cache version; Production's `tools/check-production.mjs` baseline validation was updated accordingly.
- All prior `2026-11-03-v02` release history remains immutable.

### Shared Supabase data correction
- On 2026-11-04, the existing sale snapshot `card_sale_snapshots.id=43` for LUFFY (`card_id=c21edd25-757c-4f5c-aa5f-0e909c3e0ca4`) was explicitly approved and updated from `days_listed=9803` to `34` in the shared database; readback confirmed 47 snapshots, average 10 days, and no snapshots over 1000 days. This data fix affects both environments and does not imply a Production frontend deployment.

### Latest validated releases — 2026-11-05-v02
- Development `2026-11-05-v02` (previous `2026-11-05-v01`), manifest `release-manifests/2026-11-05-v02.txt`, source `c45f6ae7ea4815aae1e3bc4c4c7078d54b92fd1d`. Development Release workflow 42034890411 succeeded, including JavaScript syntax, regression and eBay-footer checks, SEO, repository/CSS validation, full/patch package integrity. Development Pages deployment 42034939622 succeeded.
- Development full ZIP `Collect-TCG-Dev-2026-11-05-v02-full.zip` SHA256 `f3ce34887b14ffbc1f2db1e173c46dae9f81404d8cf5e4473b55675fe549a3cb`; patch ZIP `Collect-TCG-Dev-2026-11-05-v01-to-2026-11-05-v02-patch.zip` SHA256 `6d401a0eeaaa7678750de5ae2ff85c3a2c185548186446e1ed0ac64c139293b1`.
- Production `2026-11-05-v02` (previous `2026-11-05-v01`), promoted from Development `2026-11-05-v02`, manifest `release-manifests/2026-11-05-v02.txt`, package source `698ef031a53425d55a4c278c92736f6a7a0775be`, manifest/rollback commit `d0d90b1bdbc9a117a49749680aa5e2c3be974555`. Production Release workflow 42035576367 succeeded after correction of two stale retained-module cache checks; Production Pages deployment 42035628327 succeeded and rollback anchor was advanced.
- Production full ZIP `Collect-TCG-Production-2026-11-05-v02-full.zip` SHA256 `499590cb45084667e9a10f0572500bc506ac4821b5438fb5bd3b15f217cce441`; patch ZIP `Collect-TCG-Production-2026-11-05-v01-to-2026-11-05-v02-patch.zip` SHA256 `399ca43693702f5307862147107ca2ab5c309c73d925ee598a09122a66180383`.
- Both Full Card List and Short Drop Facebook posts include exactly one footer listing the five official eBay accounts from the Contact page. Removed the phrase about viewing seller history and feedback. Only `posts-card-list.js`, its cache import in `posts.js`, and release workflow files were changed for the promotion; Production-specific modules remain retained.
- SQL required: No. Validation limitations: interactive desktop/mobile/Safari browser tests not performed; live Production not opened to avoid analytics contamination.

### Previous Development release — 2026-11-07-v01
- Development `2026-11-07-v01` (previous `2026-11-05-v02`), manifest `release-manifests/2026-11-07-v01.txt`, package source `89d2bc6c17a9cfbba62de3812201328880706baf`, manifest commit `45f0301a1a3b397cc472b10569f6659c634efb90`.
- Purpose: show country attribution on each Owner Insights **Recently Viewed Cards** entry using the existing Qualified View country analytics. The compact line shows attributed country names with per-country view counts when repeated; unattributed cards show `Country unknown`.
- Development full ZIP `Collect-TCG-Dev-2026-11-07-v01-full.zip` SHA256 `3b70f4167c19b00e1f757265ca6d5ea68e608b091f05de4cce91a51ebbdbd6ad`; patch ZIP `Collect-TCG-Dev-2026-11-05-v02-to-2026-11-07-v01-patch.zip` SHA256 `d45ab6d9a5b888ac497562c83da4f322a99468253b8834b5a8f43cbbaaaf47dd`.
- Development Release workflow `42379012389` succeeded, including feature regression tests, all Development JavaScript syntax checks, the Recently Viewed country attribution contract, retained eBay/FX/HEIC contracts, SEO generation, repository/CSS/release contracts and package integrity.
- Development Pages deployment `42379034500` succeeded for the manifest commit.
- SQL/database/RLS/Edge Function change required: No. The UI reuses existing `get_country_card_view_insights` data; no shared Supabase state was changed.
- Refactoring review: no related refactor warranted; the implementation is localized to Owner Insights.
- Validation limitations: interactive desktop/mobile/Safari browser testing was not performed.
- Production was subsequently promoted as `2026-11-07-v01`; that Production release is recorded in the Production repository baseline.

### Latest Development release — 2026-11-10-v05
- Development `2026-11-10-v05` (previous `2026-11-10-v04`) adds **Download all listing images** to the desktop Card Details **More** menu.
- The action downloads a ZIP containing the listing photos only; it excludes the Inventory QR. The existing eBay-generator ZIP retains its Inventory QR, while existing sold/reserved download-watermark behavior remains unchanged.
- Source commit: `c45f417c114c04bc87bfbcd5fc8e7a63e58cb25a`; immutable manifest: `release-manifests/2026-11-10-v05.txt`, recorded at `161a3ca9a9eafe0ea72d4712fdd646ffa08f3c31`.
- Full ZIP: `Collect-TCG-Dev-2026-11-10-v05-full.zip` (SHA256 `2db713cb43a646936f443ce45ecc561b203cb10c6da0b919356ccefa9ea50386`).
- Patch ZIP: `Collect-TCG-Dev-2026-11-10-v04-to-2026-11-10-v05-patch.zip` (SHA256 `22790b3fae7127ee7966277579d956d50e006eaf0ea76998c831ed17cb63a9ba`).
- Development Release workflow `42822845948` passed feature tests, all Development JavaScript syntax checks, eBay/FX/HEIC and desktop listing-image ZIP contracts, SEO self-test/generation/output validation, repository/CSS/release contracts, and package integrity. Development Pages workflow `42822908713` built and deployed successfully.
- SQL/database/RLS/Edge Function change required: No.
- Refactoring: Reviewed and performed a localized optional `includeInventoryQr` flag in the shared ZIP helper so the new listing-photo ZIP does not duplicate download logic; existing eBay-generator behavior remains unchanged.
- Validation limitations: interactive desktop/mobile/Safari browser testing was not performed.

### Latest Development release — 2026-11-10-v04
- Development `2026-11-10-v04` (previous `2026-11-10-v03`) makes the paired mobile **Contact to Buy** and **View on eBay ↗** actions compact while retaining equal dimensions.
- The shared mobile row was reduced from 150px to 78px. Both action labels remain two-line, touch-friendly controls; desktop, the contact chooser, and eBay-link eligibility are unchanged.
- Source commit: `2777969a4476c95cae58ef41c7bbca2d6a1d77c9`; immutable manifest: `release-manifests/2026-11-10-v04.txt`, recorded at `718395f5dd1fce773ac453b82e446fcb9a4cb14e`.
- Full ZIP: `Collect-TCG-Dev-2026-11-10-v04-full.zip` (SHA256 `76f2bfc8843ad673ace756a01b6c1b9fc219c205f10111cadd6f6077a7760ced`).
- Patch ZIP: `Collect-TCG-Dev-2026-11-10-v03-to-2026-11-10-v04-patch.zip` (SHA256 `7cb424eb851338c2b244896d315aff238e7cd144dd855b9d7e2aa7fb436e2cda`).
- Development Release workflow `42816058283` passed all feature tests, Development JavaScript syntax checks, repository/CSS/release contracts, SEO self-test/generation/output validation, and package integrity. Development Pages workflow `42816110205` built and deployed successfully.
- SQL/database/RLS/Edge Function change required: No.
- Refactoring: Reviewed — no additional refactor warranted; the correction is a single localized sizing adjustment.
- Validation limitations: interactive desktop/mobile/Safari browser testing was not performed.

### Latest Development release — 2026-11-10-v03
- Development `2026-11-10-v03` (previous `2026-11-10-v02`) makes the paired mobile **Contact to Buy** and **View on eBay ↗** actions identical in width and height.
- The existing two-column grid is retained; both actions now share one 150px mobile row and the Contact-to-Buy summary fills its row. Desktop behavior, the contact chooser, and the eBay link rules remain unchanged.
- Source commit: `ec4b5963bfdbb97978a9267bd2654f1371d7d589`; immutable manifest: `release-manifests/2026-11-10-v03.txt`, recorded at `58e2d4fa8e5a5fc03b1b84a74ed599ea784cd348`.
- Full ZIP: `Collect-TCG-Dev-2026-11-10-v03-full.zip` (SHA256 `b80a2392dff51828ffb8e2ceeb6787dd74db234c7fde53cbc25da571aaa4ae34`).
- Patch ZIP: `Collect-TCG-Dev-2026-11-10-v02-to-2026-11-10-v03-patch.zip` (SHA256 `519ec81e9fc4d27aa641ee711db92d6e252437fa9d3e6c299ee5bbd3658ce7ba`).
- Development Release workflow `42815165653` passed all feature tests, Development JavaScript syntax checks, repository/CSS/release contracts, SEO self-test/generation/output validation, and package integrity. Development Pages workflow `42815225880` built and deployed successfully.
- SQL/database/RLS/Edge Function change required: No.
- Refactoring: Reviewed — no further change warranted; the correction is localized to the paired-action style contract.
- Validation limitations: interactive desktop/mobile/Safari browser testing was not performed.

### Latest Development release — 2026-11-10-v02
- Development `2026-11-10-v02` (previous `2026-11-10-v01`) adds a public **View on eBay ↗** action beside **Contact to Buy** on card details.
- The action is shown only for available cards that are marked On eBay and have a valid saved HTTPS eBay listing URL. It opens the listing in a new tab with `noopener noreferrer`; absent/invalid URLs and all other statuses retain the existing contact-only path.
- Source commit: `de9e37f083a19c77de5de6a10939d62c1bd61662`; immutable manifest: `release-manifests/2026-11-10-v02.txt`, recorded at `a56497d6b0d0d3318b88d0a742bb8bd8cd294228`.
- Full ZIP: `Collect-TCG-Dev-2026-11-10-v02-full.zip` (SHA256 `45e40f9cd1fe8a50dc130cd6b055adcc8fb7e8d484174cadb7790893c3998a33`).
- Patch ZIP: `Collect-TCG-Dev-2026-11-10-v01-to-2026-11-10-v02-patch.zip` (SHA256 `90d2c7be3606b865e61b7bc8fc3ed6a493048febccdf4bf29bf22565effa2486`).
- Development Release workflow `42812194085` passed: feature regression tests, all Development JavaScript syntax checks, direct card-detail eBay CTA contract, retained eBay/FX/HEIC and country-attribution contracts, SEO self-test/generation/output validation, repository/CSS/release contracts, and package integrity.
- SQL/database/RLS/Edge Function change required: No. The implementation reuses the existing saved eBay URL and validation.
- Pages note: the initial manifest-commit deployment `42812250564` was superseded by the subsequent baseline commit; the application code itself had already been published in Pages run `42811977818` before v03.
- Validation limitations: interactive desktop/mobile/Safari browser testing was not performed.

### Latest Development release — 2026-11-10-v01
- Development `2026-11-10-v01` (previous `2026-11-07-v01`) updates the Owner **eBay Messages → After Purchase** template to state: “It will be shipped over the weekend.”
- Source commit: `aba745c2aa04ca7088f1f8a26f79ad65d5c4fb25`; immutable manifest: `release-manifests/2026-11-10-v01.txt`, recorded at `52fb6719eabb35424cc76ee9de312f43c473535f`.
- Full ZIP: `Collect-TCG-Dev-2026-11-10-v01-full.zip` (SHA256 `733a7205ab05dfa602507856bad7c959d8e81849b6c5f92893ac62a1257ef92b`).
- Patch ZIP: `Collect-TCG-Dev-2026-11-07-v01-to-2026-11-10-v01-patch.zip` (SHA256 `6a82e9014e5ce35b7ce2bffe3e9d02641fd594b6c30570201343170868e5fe59`).
- Development Release workflow `42790879267` passed: feature tests, all Development JavaScript syntax checks, eBay weekend-dispatch contract, retained contracts, repository/CSS/release contracts, SEO self-test/generation/output validation, and package integrity.
- Development Pages build/deploy workflow `42790925157` completed successfully for the manifest commit.
- SQL/database/RLS/Edge Function change required: No.
- Refactoring: reviewed; no application-code refactor warranted. The release workflow now rebases its manifest commit before pushing, preventing a concurrent SEO refresh from rejecting a completed release record.
- Validation limitations: interactive desktop/mobile/Safari browser testing was not performed.

## Historical Development release record (2026-11-03-v01)
Development release at time of this record: `2026-11-03-v01`
Previous Development: `2026-11-02-v03`
Development release manifest: `release-manifests/2026-11-03-v01.txt`
Development v01 package source commit: `8d7a606445ce485a484235136902efdc4a0d7147`
Development v01 manifest commit: `e1eb3109a8eab4fade3293214c375649adb38d1b`

### Development package record — 2026-11-03-v01
- Full ZIP: `Collect-TCG-Dev-2026-11-03-v01-full.zip`
- Full SHA256: `f9fcde33367e3183e7abf1e8515e1050a9a14a1ad19eb28a49f5a5b9cd659867`
- Patch ZIP: `Collect-TCG-Dev-2026-11-02-v03-to-2026-11-03-v01-patch.zip`
- Patch SHA256: `728a8e4fb80cdfdadc702e0fb64ee8d187cd959e0e76c7e1b69a8382e6024e2e`

Current Development behavior:
- Owner Inventory Tools has a dedicated `eBay` category consolidating `eBay Messages`, `eBay Ban List`, and `eBay Listing Status`.
- eBay Messages contains separate `After Purchase` and `After Shipped` templates. The After Shipped template asks a satisfied buyer to leave positive feedback for the store.
- The legacy Buyer Messages Activity link is removed from the rendered Inventory Tools navigation by the consolidated eBay tools module.
- The existing eBay Ban List remains Owner-only and Supabase/RLS protected; its old route redirects into `Inventory Tools > eBay > eBay Ban List`.
- Existing Listed on eBay status, optional eBay URL, public On eBay badge and Owner `On eBay only` inventory filter remain retained.
- MYR below RM400 continues current-rate USD/SGD conversion rounded to the nearest whole amount; RM400+ retains the established upward pricing rule.
- Development SEO refresh remains release-agnostic, was regenerated/validated for this release, and retains `noindex,nofollow,noarchive`.
- Owner-only AI Card Scanner, QR Generator, generators, private analytics and established Owner Inventory Tools remain retained.
- SQL/schema/RLS/Edge Function change required by `2026-11-03-v01`: No.

Development v01 validation completed:
- feature regression tests passed;
- all Development JavaScript syntax checks passed;
- eBay tools/messages/ban-list/listing-status contracts passed;
- retained FX and HEIC contracts passed;
- repository/CSS/release contracts passed;
- SEO self-test, generation and output validation passed;
- full/patch ZIPs created and integrity-checked;
- immutable manifest/checksums recorded.

Development validation limitations:
- Interactive desktop/mobile/Safari browser testing was not performed for v01.

## Historical Production release record (2026-11-03-v01)
Production release at time of this record: `2026-11-03-v01`
Previous Production: `2026-11-02-v03`
Development promoted from: `2026-11-03-v01` source `8d7a606445ce485a484235136902efdc4a0d7147`
Production release manifest: `release-manifests/2026-11-03-v01.txt`
Production v01 package source commit: `d5b23f2448bf4b8af35d8bff9d58099fe9531b9a`
Production v01 manifest commit / validated rollback anchor: `c907d0c685ef0e0b6f3b36d82dc997855c44c0ba`

### Production package record — 2026-11-03-v01
- Full ZIP: `Collect-TCG-Production-2026-11-03-v01-full.zip`
- Full SHA256: `97f2c93f24aad47f67943fb85f6ad7069bbb4f03c1804a506aa9214b29ad9636`
- Patch ZIP: `Collect-TCG-Production-2026-11-02-v03-to-2026-11-03-v01-patch.zip`
- Patch SHA256: `272ffed4f7800cc198028d902a954c0dd3def361e8878a20c6a863eb391bcf08`

### Production 2026-11-03-v01
Purpose: consolidate Owner eBay tools under Inventory Tools > eBay, add a separate After Shipped feedback message, and refresh Production SEO output.

Current Production behavior:
- Owner Inventory Tools now exposes a dedicated `eBay` category with `eBay Messages`, `eBay Ban List`, and `eBay Listing Status`.
- eBay Messages contains separate After Purchase and After Shipped copyable templates; After Shipped asks satisfied buyers for positive store feedback.
- eBay Ban List remains Owner-only and protected by existing Supabase RLS; the former standalone route redirects into the consolidated eBay tools area.
- Existing eBay listing-status controls and public On eBay behavior are retained.
- Production-specific QR Generator, scanner endpoint, analytics/privacy boundaries, generators, Contact to Buy, giveaways and stable public URLs remain retained.
- Production SEO was regenerated and validated with index/follow card metadata, sitemap/robots checks and UUID exclusion.
- Below RM400 FX whole-number conversion and RM400+ upward pricing behavior remain unchanged.
- SQL/database/RLS/Edge Function change required by v01: No.

Production v01 validation completed:
- rollback anchor validated;
- all Production JavaScript syntax checks passed;
- Production/retained and consolidated eBay tools contracts passed;
- SEO workflow guard, SEO self-test, regeneration and output validation passed;
- full/patch ZIPs created and integrity-checked;
- immutable `2026-11-03-v01` manifest/checksums recorded;
- GitHub Pages deployment for the release manifest commit completed successfully;
- `production-last-known-good` advanced to `c907d0c685ef0e0b6f3b36d82dc997855c44c0ba` after Pages success.

Production validation limitations:
- Live Production was not manually opened to avoid contaminating Insights.
- Interactive desktop/mobile/Safari browser testing was not performed.

## Historical immutable state retained
- Production `2026-11-02-v03` / Development `2026-11-02-v03` remain immutable and introduced whole-number current-rate FX conversion below RM400.
- Production `2026-11-02-v02` / Development `2026-11-02-v02` remain immutable and introduced normal current-rate FX conversion below RM400 with two-decimal output before v03 changed that low-price output to whole numbers.
- Production `2026-11-02-v01` remains immutable and contains the validated eBay import-duty refusal notice and Buyer Message `Collect TCG` signature promotion.
- Development `2026-11-02-v01` remains immutable as an earlier Development release.
- Production `2026-11-01-v03` remains immutable and contains the release-agnostic SEO/release infrastructure update.
- Production `2026-11-01-v02` remains immutable and contains earlier Buyer Messages/eBay generator messaging promotion.
- Production `2026-11-01-v01` / Development `2026-11-01-v01` remain immutable prior releases containing eBay listing-status and quick-action viewport preservation.
- Production `2026-10-31-v02` / Development `2026-10-31-v02` remain immutable prior releases containing Inventory sorting and responsive toolbar improvements.
- Production `2026-10-31-v01` / Development `2026-10-31-v01` remain immutable prior releases containing Owner image workflow and PSA POP improvements.
- Production `2026-10-30-v04` / Development `2026-10-30-v06` remain immutable prior releases and retain the modern HEIC decoder path.
- Production `2026-10-25-v03` added the Owner eBay Ban List and `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`, applied and verified on Supabase project `cbzytysxtdcqxuckspye`.

## Canonical retained behavior
Preserve public card pages/SEO/stable URLs/SPA history; Related Cards/Trending/discovery attribution; Inventory/Collection/Sold/Reserved/Favorites; Inventory sorting and custom ordering; Owner Mode and Owner-only tools; JPEG/PNG/WebP/HEIC/HEIF listing photos; compact Owner Inventory Tools; Owner categories/Unassigned Owners; inventory value; eBay Messages; private analytics/Buyer Preview; Owner-only AI Card Scanner; eBay Ban List and listing status; QR Generator; Post Generators/giveaways; Contact to Buy; Malaysia/Singapore messaging; Supabase/RLS and analytics boundaries; Safari-safe layout; Development analytics-test exclusion in Development only.

## Intentionally removed / excluded
Do not restore Download Share Preview; V200 inquiry basket; V201 custom Share menu/grid; V202 share-menu experiment; V203/V204 compact-layout experiments; abandoned/superseded scanner/layout experiments; old Beta runtime dependencies; Development-only analytics-test behavior in Production; post-v09 duplicate Inventory Manager/dashboard renderer.

## SQL / database baseline
- Latest relevant Production migration remains `migrations/2026/2026-10-25-v03-EBAY-BANLIST.sql`.
- `public.ebay_banlist` remains Owner-only through RLS.
- Card Owner assignment uses existing private `card_owner_private` metadata and authorization.
- Production `2026-11-03-v01` required no SQL/database/RLS/Edge Function change.

## Release contract
A release is complete only after applicable implementation, validation, regression review, committed-file inspection, package integrity checks, immutable manifest, Pages deployment and rollback protection are confirmed. **Tested** means executed; **Statically verified** means repository/code inspection only; **Not tested** means unavailable/not performed. Do not live-open Production for routine testing without explicit authorization.

## Baseline maintenance
Reconcile this file in both Development and Production repositories after every accepted release or meaningful state change. Preserve historical release facts and retained/removed behavior; never rewrite immutable manifests from assumptions.


## Current working baseline — 2026-11-13 (post-release maintenance; not an immutable release)

This section records subsequent GitHub commits and does **not** supersede the last validated immutable release manifest, change the protected rollback anchor, or imply a successful browser-test matrix.

### Production and Development state
- Card-detail purchase-area Safari mitigation: constrain desktop Contact to Buy / eBay purchase action heights and avoid percentage-height stretching of the right column. Development commits `ad868cec` (CSS) and `1ded49da` (stylesheet cache); Production commits `d4d24f0b` (CSS) and `5c0b0d9b` (stylesheet cache).
- eBay Post Generator **Prepare eBay Listing** now downloads the selected card's image ZIP **without copying** the title, item specifics or description to the clipboard. The separate Copy Title, Copy Item Specifics, Copy Description and Copy All controls retain explicit clipboard behavior. Both repositories received the marketplace module update and import-chain cache refresh on 2026-11-13.
- Production eBay generator final code/cache commit: `151003ef591ec570ea11285edf8f7d60b9ae1989`; Development final code/cache commit: `ced0d43f456f3aa2c2ff4d251b3fb8768d1fb063`.
- Existing eBay image ZIP download behavior, Owner access checks, card selection and listing text fields remain retained.
- The 2026-11-13 maintenance changes require no known SQL, Supabase RLS or Edge Function migration.
- **Verification scope:** GitHub write operations succeeded and source behavior was inspected. No interactive Safari/Chrome/Firefox/Edge/mobile regression run, release-package checksum, new immutable release manifest, Pages deployment confirmation or rollback-anchor advancement is claimed for these maintenance commits.

### Forward maintenance rules
- Do not reintroduce automatic clipboard writes in Prepare eBay Listing. Copying must remain an explicit action on a dedicated Copy button.
- Do not restore the desktop percentage-height purchase CTA behavior that caused Safari's tall yellow panel.
- Preserve Development and Production separation; promote only explicitly approved changes. Keep immutable historical release records and last-known-good rollback anchors unchanged until the full release validation contract is satisfied.


## Development working baseline — 2026-11-13 (Facebook sold-price and Insights; pending verification)

- Facebook Post Generator: sold cards replace the "Price & full details" card URL with **Sold Price: USD [recorded price]**. Uses `price_usd` with `price` fallback. If sold price is missing, prints `Price unavailable` rather than an invented price or the URL. Available cards retain their existing card URL. eBay link remains unchanged.
- Development source commits: `6e5a690d` and `949ad234`; updated Post Generator module import `d2217029`. Regression guard added `cd26f10e`.
- Development Insights: latest qualified card view country and Mobile/PC context implemented, with fallback to unknown when unavailable; tracking database migration applied. Device recording and complete Insights rendering have **not** been verified end-to-end; do not claim operational completeness.
- Development SEO refresh workflow: `.github/workflows/dev-seo.yml` executes `npm test`, repository/CSS checks, generator self-test, then generates and validates noindexed Development card pages. Earlier failure was due to stale regression expectations; tests were updated in commit `5b52205`. This baseline update triggers the SEO workflow, but **a successful current run and generated SEO output are not yet confirmed**.
- Production is unchanged by these Development-only changes. Preserve historical release manifests and rollback anchors.


### Development Facebook sold-price correction and SEO regression repair — 2026-11-13
- Sold-card Facebook sales posts now show `💰 SOLD PRICE: USD N` on **one line**, replacing only the original "Price & full details" card URL. Non-sold listings retain that URL.
- Saved **eBay Listing URL must remain present** independently of the website-card URL on sold and available listings; this is mandatory retained behavior. eBay post wrapper corrected in `1664523d`. Sold price layout corrected in `cc1abdfb`.
- Fixed the earlier regression suite's newly added test that referenced undefined `readFileSync` (the test harness imports `fs` and uses `readSource`); updated test assertions for the retained eBay link and single-line SOLD PRICE in `b05a69a0`.
- Browser module cache refresh committed through `ed4696d`.
- The SEO workflow was previously blocked at the test stage. This correction is committed, but **a successful current SEO workflow run is not yet independently confirmed**. Do not label it validated without seeing passing checks, generated files and successful workflow completion.
- Production is unchanged; immutable release manifests and rollback anchors are untouched.

## Owner Photo Library release — 2026-11-14-v03

- Add Card and Edit Card support uploading, selecting and renaming private library originals. Both environments use the existing private bucket so saved originals are available across the two sites. Listing copies are separate.
- The Owner-only rename migration was applied to shared Supabase and policy definitions were verified. Signed-in browser testing remains pending.
- Development checks and mocked upload, rename and attachment passed. See the [release manifest](release-manifests/2026-11-14-v03.txt) for packaging and validation details.
