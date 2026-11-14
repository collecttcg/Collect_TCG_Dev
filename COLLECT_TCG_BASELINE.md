# Collect TCG Current Baseline

<!-- BEGIN AUTOMATED BASELINE STATE -->
## GitHub state

- Development latest non-baseline commit: `1566fdd208dccf54440fbe30cdfa139cf6958ea4`.
- Production latest non-baseline commit: `0ada2d141c1d1c8540f0dc9a14ae6fbf7db54de1`.
- Production rollback ref: `e1047a76f9c6570bf9b6e2f8cd16b3431f2df355`.
- Latest local release manifest: [`2026-11-14-v03`](release-manifests/2026-11-14-v03.txt) from `e23b55ff9b1fc400f50168835ab5d603c15a96ee`.
- Latest local change: `1566fdd208dccf54440fbe30cdfa139cf6958ea4` · Dev 2026-11-14-v04: add On eBay inventory quick filter.

This section records GitHub state. The release manifest and workflow results determine validation and deployment status.
<!-- END AUTOMATED BASELINE STATE -->

Last reconciled against GitHub: 2026-11-14

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

## Current Development release — 2026-11-14-v04

- Previous Development release: `2026-11-14-v03`. [Release manifest and ZIP checksums](release-manifests/2026-11-14-v04.txt).
- On eBay replaces Championship in desktop and mobile listing quick filters. It uses the existing eBay listing marker and persists in the listing URL. Championship landing links retain their existing behavior. No SQL required.
- All 87 tests, Dev release contracts, SEO generator self-test, and both ZIP integrity checks passed. Development desktop browser showed 85 eBay-marked tiles out of 85 results and restored the filter on reload. Mobile markup and CSS were checked without an interactive mobile or Safari session.

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
