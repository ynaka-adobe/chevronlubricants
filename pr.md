# Pull Requests Log

## Template

```md
### Title
<short, imperative PR title>

### Summary
- What changed
- Why it changed
- Any notable constraints

### Affected pages / blocks
- /content/chevronlubricants/...

### Testing
- [ ] Local `hlx up` / `aem up`
- [ ] Checked Lighthouse scores
- [ ] Visual comparison to source URL

### Related tickets
- JIRA: XYZ-123
- Slack: link-to-thread
```

---

## Open PRs

### Migrate Industrial and ISOCLEAN product listings

**Branch:** `ynaka-adobe-chevron-edge-commerce`
**Status:** 97 new products ingested, 34 existing records preserved unchanged,
two broken source links excluded. Network and source-aligned renderer verified;
new custom-domain routes pending scoped deployment approval. No PR requested.

- Actual navigation listings: Industrial `industrial_products.html` (125),
  ISOCLEAN `isoclean.html` (47); 39 shared links yield 133 distinct products.
  ISOCLEAN service/editorial pages are not products in this scope.
- Broken sources: `cetus-hipersyn.html` and standalone
  `delo-syn-gear-xdm-sae-80w-140.html` return 404. No replacements fabricated.
- User approved HDAX PF double-hyphen source mapping to
  `/en-us/home/products/hdax-pf-antifreezecoolant-premixed-5050`, because the
  source-exact double-hyphen catalog path returns 400.
- All 34 existing records are kept exactly as read, not re-enriched or replaced.
  New records retain source brand tags, listing membership, grades/subtitles,
  ISOCLEAN badge images, documents, equipment, benefits, specifications,
  packaging identifiers and Self/Pro Services. No invented prices/checkout.
- Source-empty equipment/support/card sections remain absent only for their
  exact verified products. New default-site details use source navy title/actions
  and blue benefit cards. Prior 61 product presentation remains unchanged.
- Latest EMA header/warranty/document navigation main `2261818` is preserved.
  Only finite product renderer/scoped CSS and directly related docs/tests change.
- Existing CDN session will prepare only necessary exact new product/media
  paths. Fresh ISOCLEAN/Industrial-specific approval and current pipeline
  `60291285` idle required before any auto-triggering push; no prior approvals
  reused.
- All 131 available Network pages preserve checked text/links/documents,
  canonical and media; 272 image responses pass. All 34 shared stored records
  exactly match their pre-migration JSON. Only 97 absent records were written.
- New route manifest: 97 products and 85 unique generated media (182 paths).
  One media path is already routed; exact uncovered CDN count is checked
  against current config, not inferred from the source product count.
- All 131 batch fixtures and previous Delo/Havoline/Techron fixtures preserve
  text, links and source category with no desktop/mobile overflow. Image zoom,
  section navigation and equipment scrolling work. Focused suite:
  16 browser tests pass; ESLint/Stylelint and diff check pass.

---

### Migrate the four linked Techron products

**Branch:** `ynaka-adobe-chevron-edge-commerce`
**Status:** All four records and source-aligned renderer are published;
custom-domain content/media and live layout independently verified.
No PR requested.

- Actual listing scope: four unique Techron detail links, all source 200,
  catalog/Network/custom 404 before ingestion.
- Destinations use `/en-us/home/products/{slug}`, without `.html`.
- Preserve descriptions, images, documents, equipment, benefits, applications,
  specifications, packaging identifiers and the two Self Services cards.
- Extend only the finite product renderer and scoped CSS; reuse retailer actions
  with source gray title/actions and blue benefits. Preserve latest EMA
  image-loading fixes from main `d5a51cb` and all Delo/Havoline behavior.
- GET before full-replacement PUT; existing records are never blindly replaced.
- Prepare only necessary exact product/media CDN routes in the existing CDN
  session. Fresh Techron deployment approval and pipeline idle are required
  before an auto-triggering push. No Havoline approval reuse.
- All four catalog readbacks match expected records; eight exact Helix paths
  added with all prior configuration preserved. All four Network pages and
  15 generated/supporting image responses pass.
- All four Techron, 17 Havoline and 40 Delo real fixtures preserve source
  text/links/category and responsive layout; zoom, equipment scrolling and
  section links work. Focused browser suite: 14 passed; ESLint/Stylelint pass.
  The fixture checker scopes its dialog to the product (EMA also has a dialog)
  and waits for the existing EMA lead-image visibility gate.
- CDN-only commit `b5eb9d9453cc2d7ab9f3ed7c1db5ce67e46bb511` is published:
  19 added lines/eight exact product-media paths, zero overlaps,
  1068 scope/control cases pass; all prior config byte-preserved.
- Renderer code `02b8cf9` published using selected `@ynakagawa`; custom-domain
  JavaScript/CSS exactly match the committed source after decompression.
- User specifically approved the eight-route Techron deployment and freshly
  confirmed pipeline `60291285` idle at 09:12 PDT on 31 October 2026.
  The CDN session rechecked identity, remote parent and baseline config bytes
  immediately before its nonforce push. No separate execution was triggered.
- Early checks saw partial propagation; subsequent verification passed all
  four custom products and all eight image responses (four images, plain and
  `format=webply`). Source content, links, documents, canonical, SKU and media
  match. Eight existing-page/negative-path controls pass.
- Live browser checks pass across all four Techron, 17 Havoline and 40 Delo
  products: content/category, desktop layout/no overflow; representative mobile
  ordering, image zoom, navigation and equipment scrolling also pass.
- Final Cloud Manager execution status/ID and deployed revision remain
  independently inaccessible; verified live delivery is not a claim of
  pipeline completion.

---


### Migrate the 17 linked Havoline products

**Branch:** `ynaka-adobe-chevron-edge-commerce`
**Status:** All 17 records ingested and independently verified on Network;
renderer published to main in `15b5614` using user-selected `@ynakagawa`.
Custom-domain product/media delivery independently verified after CDN publication.
No PR requested.

- Scope: all 17 distinct products from the supplied Havoline products tab,
  including expanded cards; destination `/en-us/home/products/{slug}`.
- Every source returned 200; all catalog/Network/custom paths returned 404
  before preparation. Recheck records before full-replacement writes.
- Preserve documents, equipment, benefits, applications and packaging values.
  Also preserve both source hero actions and Self Services/Pro Services groups.
- Source display title whitespace is normalized, not rewritten. Source CVT+
  contains a malformed `Find%20a%20retailer` link and a self-link labeled
  `Buy Online`; preserve these source URLs rather than inventing a purchase flow.
- Only the finite detail renderer and its scoped stylesheet are extended.
  Havoline titles/actions use source red; benefit cards remain source blue.
  Existing 40 Delo products and concurrent EMA blocks/pages remain intact.
- CDN work stays in the existing coordinated CDN session and waits for the
  exact generated product/media manifest and deployment authorization.
- All 17 full catalog readbacks match expected records. Helix has 34 added
  exact product/media routes, with all prior configuration preserved.
  All 17 Network pages preserve checked source text, links, documents and
  images; all 49 generated/supporting image responses succeeded.
- Current loader/renderer preserves every fixture text/link and source category
  across all 17 Havoline and all 40 Delo products. Responsive hero, zoom,
  equipment scrolling and section links work. Focused browser suite:
  13 passed; targeted ESLint and Stylelint pass.
- Published custom-domain JavaScript and CSS, after HTTP decompression, exactly
  match the committed renderer/style files. CDN commit
  `a9a7072114eaebad5090803be081332a59d0c220` was published by the CDN session
  using selected `@ynakagawa`, after explicit deployment approval, fresh
  user-confirmed pipeline idle and remote/config concurrency checks.
- Initial post-push requests returned 404; one bounded propagation recheck
  verified all 17 custom products and all 34 image/query responses (17 generated
  images, each plain and `format=webply`). Source text, links, documents,
  canonical, SKU and expected media match.
- Live custom-domain browser checks cover all 17 Havoline and all 40 Delo
  products: content/category preservation, desktop layout and no overflow;
  representative mobile ordering, zoom, section links and equipment scrolling
  also pass. Eight existing-page/negative-path controls pass.
- User observed pipeline `60291285` Running. Its final execution result/ID and
  deployed revision are not independently observable from the signed-out
  session UI; live delivery success is not a claim of pipeline completion.

---

### Prepare an isolated Chevron PDS-to-Guides pilot

**Branch:** `ynaka-adobe-chevron-edge-commerce`
**Status:** Imported into AEM; PDF/HTML generation queued. No PR requested.
Original PDF and DITA/map binary checksums match their local sources. Guides
recognizes the content, and two map-local presets were created without changing
the shared dealer presets/templates. Both generation jobs remain `Waiting`
after a bounded recheck; no generated output or live-site publication is claimed.

- User approved one Syn-Trans XE PDS demo and the existing Guides environment
  in program 154856, environment 1944736, with a separate
  `/content/dam/chevron-guides-demo` folder.
- Source: Chevron PDS `docDataId=470254`, product `223079`, printed revision
  1 September 2026 (`TTF-29`); two pages, 240156 bytes.
- Preserve the original, technical values, qualification distinctions and axle
  warning. The conversion carries an explicit unapproved-demo notice.
- No SDS conversion, bulk ingestion, dealer-document/template modifications,
  live product replacement or EMA code/content changes are included.
- The dealer service code confirms genuine Guides PDF generation, but its
  frontend HTML export is browser-generated. This pilot must independently
  verify real Guides output for both requested formats.
- DITA topic/map pass official DITA 1.3 DTD validation. All 41 converted source
  text units, nine technical-data rows, nine benefits, eight qualification
  entries, source checksum and axle warning were checked against the PDF.
- Browser tools do not provide local-file upload, and the browser-to-local
  transfer attempt failed. The user uploaded the original PDF and DITA topic/map
  through Assets, keeping filenames and their relative reference intact.
- PDF preset `Chevron Demo PDF` uses the existing Basic template read-only,
  writes to `/content/dam/chevron-guides-demo/outputs/pdf` and names its output
  `delo-syn-trans-xe-demo.pdf`. The map-local preset ID is
  `3fa8f4a9-fa0e-4c09-ac50-20c348e1cb84`.
- HTML5/DITA-OT preset `Chevron Demo HTML` (`chevrondemohtml`) writes to
  `/content/dam/chevron-guides-demo/outputs/html`.
- A Guides UI application error prevented reliable output-path editing; only
  these existing map-local nodes were updated through authenticated Sling
  requests, and saved destinations were independently read back.
- PDF job `4e60bfb7-faec-45be-8684-6298f36d0168` and HTML job
  `7571a28e-c3dc-4f9f-bcf5-c5605aeca034` reached the Guides queue. Requests
  timed out at the browser, so status was checked before any retry; no duplicate
  generation requests were sent. Both were still waiting after 90 seconds.
  Inspect these same jobs before retrying or marking either output complete.

---

### Resolve PR #7 conflicts with current main

**Branch:** `aem-20261030-1905`
**Status:** Open PR #7; conflicts resolved against `main` at `de3f5ce` in the existing PR branch. The PR itself is not merged.

### Summary
- Resolved the overlapping additions in this log by retaining both the Services and Support migration entry and all Edge Commerce entries.
- Preserved the PR's EMA blocks, importer, link map and Services scope alongside main's Delo catalog inventory, scoped product renderer, styles and regression tests.
- Kept both the new block registrations in `scripts/ak.js` and the SKU-gated product hook in `scripts/scripts.js`; no authored content, catalog data or routing changed.

### Testing
- [x] Targeted ESLint (page loader, product renderer and renderer tests) and Stylelint (product styles) pass.
- [x] Page-loader and Delo-renderer browser tests: 9 passed, 0 failed.
- [x] Exact preservation checks: all 52 non-documentation EMA files match the original PR head; main's README, product renderer, page loader, styles and tests are unchanged.
- [x] Both migration scopes and all pre-existing log entries retained; all PR JavaScript passes syntax checks, importer templates parse as JSON, and `git diff --check` passes.

---

### Migrate Services and Support pages (24) + tool-embed and isoclean-calculator blocks

**Branch:** `aem-20261030-1905` (PR #7)
**Status:** Content imported locally and verified. Not uploaded to DA, not previewed or published. Design pass for the two new blocks still to do.

### Summary
- Scope recorded in `source_website.md` ("Services and Support menu pages (24)"), with the customer decisions: embedded tools stay embedded; the ISOCLEAN calculator is rebuilt; the PitPack sign-up links to the live form.
- New template `expertise-services` in `tools/importer/page-templates.json` (Expertise block set + `tool-embed` + `isoclean-calculator`), import script `tools/importer/import-expertise-services.js`, URL list `urls-expertise-services.txt`. Pages imported to `content/en-us/home/services/...` and `content/en-us/home/lubetek`.
- New block `blocks/tool-embed` (+ parser): external tool in a lazy-loaded, titled iframe; keeps the source height, caps the width at the source width and shrinks on small screens (the source overflows phones). Used on 10 pages (earlweb product selectors, delocalculator.com calculators/assessment, Delo SmartChoice). Named `tool-embed` because `embed` is the library's video/social block.
- New block `blocks/isoclean-calculator` (+ parser): client-side rebuild of the server-rendered 3-step calculator (industry → equipment component → storage environment → target vs current ISO code). Data sheet `content/en-us/home/services/self-services/industrial-machinery/isoclean-calculator-data.json` (sheets `components` 321 rows / 12 industries, `scenarios` 12 rows, `targets` 6 rows), crawled from the source (`migration-work/isoclean-calculator/`). Not rebuilt: the source's life-extension figure (always an empty "x" and a 100% bar on the source), "Email results". "Request more information" → `/en-us/home/contact-us`.
- `chevron-expertise-cleanup.js` (shared by all expertise-* templates; earlier templates not re-imported):
  - Salesforce forms: the `<form>` is swapped for the live-form link before the parsers (a form inside a multi-column was flattened into text); the embed's `<style>`/`<script>` no longer leak as text; `*Required field` notes removed; PitPack added to `FORM_LINKS`; the keep-absolute mark is re-applied after parsing (cleanup strips data attributes).
  - Plain-text check-list item titles (`.check-list__list .item .title`) are kept (bold paragraph) instead of dropped.
  - Images: desktop renditions with an upper-case extension (`adaptive_image.img.JPG|PNG`, 23/23 404 on the source) use the paired original; DAM files with an upper-case extension use `/_jcr_content/renditions/original` (the direct URL 404s on the source too). Both `src` and `data-src` are updated. Null-pair crash fixed.
- `expertise-services` columns-promo selector also excludes items with `.check-list` / `.image-check-list` (the promo parser keeps only images).
- Link map regenerated (137 migrated paths). Local `content/nav.plain.html` (24 Services links) and `content/footer.plain.html` (4 links) relinked to the migrated pages; backups `migration-work/{nav,footer}.before-services-relink.plain.html`.
- `scripts/ak.js` KNOWN_BLOCKS: `tool-embed`, `isoclean-calculator`.

### Testing
- [x] 24/24 imported, 0 transformer errors.
- [x] Line-level text check vs the rendered source (every line of 4+ words): 0 missing, apart from the calculator's 3 step labels (now block defaults).
- [x] 0 broken images (14 were broken on the source too).
- [x] All 10 tools load in the preview at 1440 and 390px, titled, no overflow; console errors on 2 tools also occur on the source (inside the tools).
- [x] Calculator: full flow in the preview (Construction → Backhoe Loader → Engine → Extreme 28/26/23 → target 20/18/15, same as source); step-bar back navigation; tab arrow keys; focus moves to each step; no overflow at 320/390/1440px. 8 random components: target and current codes match fresh source lookups (8/8).
- [x] All 28 Services menu links point to migrated pages.
- [ ] Known gaps: Trade Shows "Event Information" captions over the event images are dropped (the image itself links to the same event page); the menu's "Browse self services" / "Browse pro services" tab labels link to `/en-us/home` (source `#`); calculator photos and icons are hotlinked from chevronlubricants.com (sheet values), not DA media.
- [x] Design pass (2026-10-30):
  - `tool-embed`: left-aligned in the content column like the source (x=132 at 1440px), source sizes kept; a 1200px tool may extend 24px past the 1176px column from 1260px up, as on the source. ~94% match. SmartChoice loads when framed (Chrome only warns about its ALLOW-FROM header).
  - `isoclean-calculator`: all four views refined from source computed styles (step bar states + pointer, 4-col industry grid, 2-col equipment lists, environment tabs, scenario cards, result boxes, buttons, credit box); list-item margins reset. ~90% match. Contrast substitutions: inactive tabs #767676, black text on the orange button, Start over #666, accessible sky-blue. No horizontal scroll at 320–1440px.
  - `columns-promo`: 4-image rows use 25% columns (benchmark-calculator scrolled sideways to 1543px; now 4 x 294px like the source). 3-card rows unchanged.
  - Block gap pass after the re-import: `columns-media` flat grey strips (a grey-bg band holding only columns-media blocks has no band padding; photo column max 50%; several blocks become separate 1px-framed strips 30px apart with a 25/75 logo/copy row at every width, logos within 200x150, plain "Click here" text links) — preferred-vendors logos now 157x150 / 200x104 at the source positions, havoline eLearning photo 588x353 flush like the source. Same rule also flattens lubetek, best-in-class, coolants-freezepoint (x3), delo simplify-your-fleet-protection and coolant-landing-page strips (coolant-landing's photo is inset 48/41px on the source, so it moved from close to flush). `columns-cta` panel-with-button outside a coloured band (isoclean-program) gets the source's #0066b2 band (30px 55px) inside the 1176px container (was x0, 1256px, white button on white). `cards-resource` image + bare-link tiles: lubetek brand tiles are 5 x 235px with 124px product shots and blue buttons; best-in-class video tiles are flat with 14px underlined links. No change on en-us/home, isoclean, delo, havoline/business at 390/768/1440. No horizontal scroll on the 24 pages at 390/768/1024.
- [x] Import restructure (customer choice "fix the import, then style"; site-wide heading sizes kept):
  - New block `blocks/checklist` (+ parser): source `.check-list` / `.image-check-list` → rows of 1–2 cells (title + list, image, button); variants `check` / `bullet`, `grey` (from `.bg-light-gray` or a computed #f5f5f5 background). A multi-column of only check-lists / images / buttons becomes one block, so image | list, list + button | image and list | list stay side by side. Items hidden by the source's broken, empty `.check-list__control` toggle are shown. 10 instances on 8 pages; styled ~92%.
  - New block `blocks/stats-carousel` (+ parser): source `.article-hero-carousel-component` (lubewatch, lubewatch-oil-analysis "Maintenance facts"): one statistic at a time in a CSS progress ring, prev/next + "1 of 4". Styled ~94%. Not used for isoclean-program "Real results" (inside a cards-resource card; stays text).
  - Default-content `.button` links become EDS buttons (`<strong>` primary; red Havoline buttons `<strong><em>` accent) — 35 on the Services pages.
  - cards-resource also takes columns of image + button (lubetek brand tiles), image + video (best-in-class) and stacked image + caption tiles (lubewatch "Standard test packages": 6 tiles; cards-service no longer claims columns that stack several images). cards-products also takes `.featured-products .fp-container .feature-pills` (havoline Featured Products).
  - Salesforce embeds: hidden submit messages ("Thank you!", "Oops! Looks like something went wrong.", loader) removed.
  - cards-resource download links may wrap (lubewatch scrolled sideways at 390/768px).
  - Re-import: 24/24, 0 errors, 0 missing text lines (apart from the calculator's step labels), 0 broken images, no horizontal scroll at 390/768/1024/1440.
  - Note: the transformer changes (buttons, forms, images, check-list titles) also apply to the other expertise-* templates on their next re-import; those pages were not re-imported (local content mirrors DA). CSS changes in shared blocks do affect them now: `columns-cta` band also applies to isoclean/waste-hauling-does-your-new-oil-meet-the-third-spec (its source panel is `bg-delo` too); `columns-media` strips also flatten delo/coolant-landing-page, whose source photo is inset (slightly further from the source there).
- [ ] Page match vs source (1440px), after the restructure: fuel-economy-calculator ~92%; preferred-vendors ~85%; lubetek ~80%; isoclean-program ~78%; havoline-oil-change-pros ~75% (was ~45%: checklists, PitPack button, Featured Products carousel now in place); isoclean-calculator page ~72%; lubewatch ~70%+ (stats carousel, 6 tiles and grey checklist now in place). Remaining gaps: (a) block — lubetek "Where to buy" default columns-cta pills are white on white; havoline eLearning "Watch now" blue vs source red; isoclean-program CTA band 106 vs 132px; best-in-class video rows in one padded band vs two flat strips; (b) import/content — intro paragraphs and some sections left-aligned/coloured differently (section alignment), isoclean-calculator "Program basics | TRUST" two columns stacked, checkfluid brochure cards plain paragraphs (extra wrapper div in the source multi-column), isoclean-program "Real results" stats as text, "Start clean" image sizes, Featured Products promo tile above (not beside) the carousel; (c) intentional — Montserrat, site-wide heading scale, contrast colours, PitPack form as a link, hidden checklist items shown. Screenshots: `migration-work/services-verify/`, `migration-work/checklist/`.
  - Rejected: position-based CSS for the flattened check-list / image-check-list content (would break silently on any authoring change). Kept for reference in `migration-work/services-verify/rejected-checklist-css.diff`.
- [ ] Upload to DA + preview/publish when requested.
---

### Match the Delo Product Bus detail layout to the source

**Branch:** `ynaka-adobe-chevron-edge-commerce`
**Status:** Prepared with a local preview; no PR opened or live publication.
Normal GitHub access reports `push: false`.

### Summary
- User reported that the Syn-Trans XE detail page did not match the source, then explicitly approved applying a matching detail template to all 40 confirmed Delo products.
- The previous ingestion migrated content but left it in the generic stacked Product Bus layout. Added a dedicated renderer in `scripts/commerce-product.js` and scoped styles in `styles/commerce-product.css`, with a small SKU-gated hook in `scripts/scripts.js`.
- Scope is the exact 40-product inventory plus matching SKU metadata and a structured-data script. The DA product block, unrelated pages, categories, other brands, existing header/footer and global typography are not changed.
- Restored the two-column desktop hero, source category and blue title, bold lead, PDF panel, protection-diagram links, distributor CTA, sticky section navigation, equipment carousel, three-column blue benefit cards and service cards. Mobile follows the source heading/image/description order.
- Preserved all original product text, outgoing links, application warnings, packaging identifiers, canonical and structured data. No catalog records or routing were changed for this layout correction.
- Image enlargement is a native accessible dialog (including Escape); equipment scrolling and section links are keyboard accessible. Errors are logged through the existing page logger; missing styles or incomplete markup leave the original content available.
- Retained the project's existing Montserrat/fallback fonts rather than copying proprietary source fonts. The target is the source layout and presentation, not pixel-identical licensed typography.

### Verification and remaining action
- Existing script tests and new renderer regression tests pass. The new tests cover all 40 documented paths, nonmatching/DA isolation, source text/link preservation, idempotency, invalid markup, navigation and image dialog behavior.
- Real Product Bus HTML fixtures for all 40 products preserve all original text/links and source category values; desktop/mobile layout and interactions were exercised in Chrome.
- Local preview uses current remote EMA assets plus a clean three-way merge of the page-loader hook, preserving newer skip-link, link accessibility and loading fixes.
- Publish through authorized repository access after preserving the current remote main revision. Do not overwrite the EMA page loader with an older checkout. The live Syn-Trans XE page remains unchanged until code publication; the catalog CDN deployment remains a separate requirement for the other 39 new products.

---

### Migrate the available Delo product catalog into Edge Commerce

**Branch:** `ynaka-adobe-chevron-edge-commerce`
**Status:** No PR opened. All 40 available products render on AEM Network:
39 newly created records plus the existing, unchanged Syn-Trans XE.
Custom-domain delivery for the 39 new products awaits the prepared CDN commit
`39b8cc259deff17253f53857d0a09602be463ae5` in `ynaka-adobe/AEM-p154856`.
Agent GitHub access still reports `push: false`; no push/deployment was attempted.

### Summary
- User requested all Delo products linked from `https://www.chevronlubricants.com/en_us/home/products/by_brand/delo.html?src-tab=products`.
- Inspected all 41 distinct source product links, including hidden category cards and featured products. Forty source pages are available; the standalone `delo-syn-gear-xdm-sae-80w-140.html` source returns HTTP 404. Migrated the available combined XDM page without inventing a replacement for the broken link.
- Documented the complete finite source/destination inventory in `source_website.md`. Destination paths follow `/en-us/home/products/{source-slug}`. User explicitly approved `delo-syn-thf-xc` for the source double-hyphen path rejected by the catalog API.
- Preserved source introductions, equipment entries/icons, benefits, applications/warnings, packaging identifiers, document links, distributor links and unique service cards. Retained semantic HTML/links; deduplicated responsive copies of service cards.
- Created 39 records only after catalog and destination collision checks; independently read back the stored records. Existing Syn-Trans XE was not PUT or replaced. Product images were ingested; supporting images/documents retain public source URLs.
- Merged 40 exact product and 39 unique generated-image paths into the current Helix `public.json`, preserving previous configuration. No prices, availability, checkout, wildcard routes or other-brand migrations added.
- No EMA-owned authored pages, listing/category pages, blocks, styles or shared scripts were edited.

### Verification and remaining action
- All 40 Network pages return HTTP 200 with all required source-section text, document links, generated images and exact custom-domain canonicals.
- All 39 generated images return HTTP 200 normally and with the browser image query; all 26 unique supporting images return HTTP 200 (104 image responses total).
- Homepage/pilot/Syn-Trans and nonmatching route baselines, plus shared script/style hashes, are unchanged. The full Delo 600 page was also checked in the browser.
- Existing Syn-Trans XE returns HTTP 200 on the custom domain; the 39 new product URLs return HTTP 404 pending their separate CDN deployment.
- Coordinated CDN commit `39b8cc259deff17253f53857d0a09602be463ae5`, parent `55bbbd55cce48b303697a9e5ec19730506a84218`, adds only 77 uncovered exact paths (39 products, 38 images) in one new selector; the existing Syn-Trans selector covers the other two manifest paths. Prior YAML is preserved byte-for-byte; all 79 paths have exactly one selector.
- An authorized user must confirm pipeline `60291285` is idle, then push the prepared CDN commit to its configured `main` branch without force. After deployment, verify the requested custom-domain pages and images before marking delivery complete.

---

### Migrate Delo Syn-Trans XE into Edge Commerce

**Branch:** `ynaka-adobe-chevron-edge-commerce`
**Status:** No PR opened. Catalog ingestion, Network rendering and custom-domain
delivery complete. CDN commit `55bbbd55cce48b303697a9e5ec19730506a84218`
is confirmed on remote `main`, and the custom-domain product returns HTTP 200.

### Summary
- Explicit source: `https://www.chevronlubricants.com/en_us/home/products/delo-syn-trans-xe.html`.
- Explicit destination: `https://chevronlubricants.ynaka-adobe.com/en-us/home/products/delo-syn-trans-xe`; the user chose Edge Commerce delivery.
- Preserved introduction, all eight supported-equipment entries/icons, six benefits, applications and axle-use warning, three actual packaging SKUs, PDS/SDS/diagram links, distributor link and advisor content. No prices or checkout invented.
- Created one catalog record after confirming the destination record did not exist. Independently read back the full record and verified source content in Network HTML.
- Merged only the exact product route and generated image `/en-us/home/products/media_8c90e2b40526fb1677b313d1c434513f5dcb7d8c.png` into current Helix `public.json`, preserving previous routes and settings.
- No EMA-owned page content, blocks, styles or shared scripts changed. No root-level DA moves or other product migrations included.

### Verification and remaining action
- Network product and generated image return HTTP 200; browser confirms the source content and product image.
- All nine supporting source images return HTTP 200.
- Existing homepage/pilot statuses and shared script/style hashes are unchanged; `/home` was already HTTP 404 before this change.
- The CDN session prepared a 13-line rule-only addition in `AEM-p154856/config-eds/cdn.yaml`, reusing the existing origin and matching exactly this product and generated image. The commit is now published; the custom-domain product independently returns HTTP 200 (2026-10-30).

---

### Set up an isolated Chevron Edge Commerce pilot

**Branch:** `ynaka-adobe-chevron-edge-commerce`
**Status:** No PR opened. Production API access and isolated AEM Network pilot
are configured; the separately approved custom-domain CDN patch is prepared
and published in `ynaka-adobe/AEM-p154856`. The original pilot's custom-domain
product now returns HTTP 200 (independently confirmed 2026-10-30).

### Summary
- Confirmed production provisioning and administrator access for `ynaka-adobe/chevronlubricants`.
- Created a Chevron-scoped, 30-day catalog read/write service token, stored privately outside source control; expires 2026-11-29 03:31:25 UTC.
- Ingested one approved Delo 600 ADF SAE 15W-40 pilot using existing homepage copy/image, a clearly identified demo SKU, no price and no checkout.
- Added only the approved exact pilot product and generated-image routes to live Helix `public.json`, using the Product Bus backend. No broad globs, category overrides or existing product-route replacements.
- Preserved EMA-owned content, blocks, styles and shared scripts. Repository changes are documentation only.
- Documented routing, credential rotation, rollback and the remaining CDN action in `README.md`.
- Coordinated the separate 18-line CDN-only patch in `ynaka-adobe/AEM-p154856` (`config-eds/cdn.yaml`, prepared commit `25135abf687a32bb28f6d21adaa08c26ce7ba145`). It matches the exact Chevron domain and two pilot paths, uses Parker's Network-origin pattern and explicitly forwards the custom host.
- Confirmed Cloud Manager program `154856` / Edge Delivery configuration pipeline `60291285` uses GitHub repository `AEM-p154856`, `main`, `/config-eds`, `EDGE-ENVIRONMENT-PUBLISH`, with an On Git Changes trigger. The user authorized deployment; no broad origin change is included.

### Affected pages / blocks
- New isolated route: `/edge-commerce/products/delo-600-adf-15w-40`.
- New isolated media route: `/edge-commerce/products/media_d8320c16ba6e000b2cb939cd08c2fa9d06c5a5b1.png`.
- No existing pages or blocks changed.

### Verification and remaining action
- Authenticated catalog GET confirms the stored product, description and absence of price.
- AEM Network returns HTTP 200 for the product and its image; browser shows the product name and all three existing benefit statements.
- Existing homepage, navigation and original product-route responses remained unchanged on AEM Network and the custom domain.
- The agent's non-force push was rejected by GitHub with HTTP 403. The user subsequently pushed the exact reviewed commit; remote CDN `main` is confirmed at `25135abf687a32bb28f6d21adaa08c26ce7ba145`.
- Execution `9439178` reports successful Edge Delivery deployment at 2026-10-29 21:23:05 PDT. The UI does not expose its source SHA in artifact timing details; the Artifact Preparation log is needed to verify that revision.
- Initial custom-domain requests after deployment returned HTTP 404. A later independent 2026-10-30 check confirmed the original pilot working on the custom domain; the new Syn-Trans product requires its own separate scoped rule.

---

### Restructure URLs to mirror the source (/en-us/home/...)

**Branch:** `main` (uncommitted)
**Status:** Ready for review. Needs the DA redirects sheet updated and the old local copies removed.

### Summary
- Customer decision: everything lives under `/en-us/home` to mirror the source `/en_us/home/...`.
  - Homepage: `/en-us/home`.
  - Other pages, e.g. `/en-us/home/products/by-brand/delo`, `/en-us/home/learning/about-our-brands/isoclean`, `/en-us/home/where-to-buy/find-a-distributor`, `/en-us/home/contact-us`.
- Path rule changed in every import script (`tools/importer/import-*.js`) and in `tools/importer/generate-link-map.mjs`. The `chevron-links.js` map was regenerated (113 source URLs → new paths).
- All 111 pages were re-imported to `content/en-us/home/...`. No internal link uses the old `/home`, `/products`, `/learning` paths anymore. The one intentional absolute link (xpress-lube-contact-us live form) is kept.
- The shared resources sheet moved to `content/en-us/home/learning/resources.json` (DA: `/en-us/home/learning/resources`); the `cards-filterable` parser was updated.
- The header nav (179 links) and footer (9 links) were relinked from their pre-relink backups to the new paths.
- The manual Havoline customer-stories label fix was reapplied at its new path.

### Testing
- [x] 111/111 pages imported, 0 failures.
- [x] Render check on 8 pages across all templates: no errors; the header Where to buy menu points to `/en-us/home/...`; the resources sheet loads 45 items.
- [x] DA `redirects` sheet updated (2026-10-30): `/` → `/en-us/home` (was `/home`). The persona rows (`/persona/*` → `/home?persona=…`) were kept, and no `/home` redirect was added (customer decision). Backup: `migration-work/da-backups/redirects.before-2026-10-30.json`.
- [x] `redirects` sheet previewed and published 2026-10-30 (customer request; `/en-us/home` was already live). Verified on aem.page and aem.live: `/` → 301 → `/en-us/home`.
- [x] Persona rows repointed 2026-10-30 (customer request): `/persona/{fleet-managers,oem,default}` → `/en-us/home?persona=…` (was `/home?persona=…`, a 404). Local copy `content/redirects.json` == DA; uploaded, previewed and published; verified 301 → 200 on aem.page and aem.live. Backup: `migration-work/da-backups/redirects.before-persona-fix-2026-10-30.json`.
- [ ] Persona block on `/en-us/home` (2026-10-30, customer request):
  - [x] `schedules/landing-fragment` sheet: all 16 rows were dated Jan–Apr 2026 (expired), so the block would show nothing. Added 3 undated fallback rows (`default`, `fleet-managers`, `oem` → `/fragments/landing-page/<persona>`); dated rows still take priority. Local copy `content/schedules/landing-fragment.json` == DA; uploaded, previewed and published (19 rows live). Backup: `migration-work/da-backups/landing-fragment.before-fallback-2026-10-30.json`.
  - [x] Local `content/en-us/home.plain.html` = DA source + a new first section with the schedule link (same authoring as the old `/home`). Local preview: the default landing fragment (hero + 3 promos) renders above "Premium Chevron Lubricants". Note: the local file is now the DA source, so its `content.da.live` images don't load in the local preview (they do on aem.page/aem.live). Backups: `migration-work/da-backups/en-us__home.before-persona-2026-10-30.html` (DA) and `…local-before-persona-2026-10-30.plain.html` (local).
  - [x] `/en-us/home` uploaded to DA, previewed and published 2026-10-30 (customer request). DA was unchanged since the backup; DA source == local after upload. Live check: the persona fragment renders at the top for no param, `?persona=default`, `?persona=fleet-managers` and `?persona=oem` (each shows its own hero/promos; images load; the schedule link is gone). The `/persona/*` redirects now land on a working persona view.
  - [x] **Live homepage changed outside this work (2026-10-30):** DA version history shows a save at 16:16:43 GMT that removed only the persona section, published at 16:16:50, then a save at 16:17:06 that restored it (identical to the local copy) but was not published. Customer chose to republish the version with the persona; previewed and published again, link verified on aem.page and aem.live.
  - [ ] Desktop layout shift: see "Keep loading sections hidden" under Open PRs. (An earlier note blamed the persona banner; the cause is a CSS specificity bug, which the banner makes worse.)
  - [ ] The landing fragments still link to `/home#find-resources-by-industry` and `/home?persona=fleet-managers|oem` (404 now) and `/en-us/home/chevron-products-selector` (not migrated). The page also has 2 H1s for `default` and `oem` (fragment hero + "Premium Chevron Lubricants"), as the old `/home` did; the `fleet-managers` fragment has no H1.
- [x] Local workspace synced from DA (2026-10-30): the 113 DA pages/fragments (`/en-us/home/**`, `/nav`, `/footer`) were mirrored locally from the aem.page preview (identical text/links to DA source; images absolutized to aem.page media; DA metadata block kept). Pre-sync backup: `migration-work/local-before-da-sync-2026-10-30/`.
- [ ] DA content issues found during the sync:
  - The upload made every chevronlubricants.com link relative: 3,275 links on 104 pages point to `/en-us/home/...` pages that don't exist (product detail pages and non-migrated marketing pages).
  - [x] Fixed 2026-10-30: the `cards-filterable` sheet link (mangled to `/en-us/home/learning/resources-json`) is restored to `/en-us/home/learning/resources.json` on both learning-for-you pages, uploaded to DA (DA source = local). The pre-fix DA source is backed up in `migration-work/da-backups/`.
  - [x] Uploaded 2026-10-30: the `resources` sheet to DA at `/en-us/home/learning/resources.json` (45 rows; identical to `content/en-us/home/learning/resources.json`).
  - [x] Previewed and published 2026-10-30 (customer request): the 2 learning-for-you pages + the resources sheet (DA source == local copies, checked before publishing). Verified on aem.page and aem.live: pages 200, sheet 45 rows; the live industrial-products page renders the filterable list with "Showing 45 of 45 resources".
- [ ] Delete the 119 local pages that are no longer in DA (old-structure copies, the 7 root pages deleted in DA, test pages). Deletes under content/ are blocked for the assistant.
- [ ] Delete the old local copies (the assistant can't delete under content/): `content/home.plain.html`, `content/index.plain.html`, `content/products/`, `content/learning/`, `content/services/`, `content/where-to-buy/`, `content/contact-us.plain.html`, plus the test pages `content/locator-test.plain.html` and `content/bgen-test/`.
  - Verified 2026-10-30: DA no longer has any of these (DA root = `docs/`, `en-us/`, `fragments/`, `media/`, `nav`, `footer`, `redirects`, `schedules`). All 112 old-structure files have a copy under `content/en-us/home/`. These are local-only orphans; the customer will delete them from the Preview view.
- [x] Removed stale repo-root files (2026-10-30, `git rm`, not referenced anywhere): `phase1-preview.png`, `phase2-preview.png` (old design screenshots), `pr.html`, `pr.plain.html` (old exports of this file). Also removed an empty, untracked `en-us/home/...` folder tree at the repo root (no files; left over from an earlier import run). Removed the unused repo-root `fragments/` folder (7 old header-menu/landing-page `.plain.html` files from commit 165bcf3; the header now reads `content/nav`; no code references).

### Design Phase 3: section/page-level fixes + page verification

**Branch:** `main` (uncommitted)
**Status:** Ready for review

### Summary
- `styles/styles.css`. Every rule is keyed on a block or content pattern that the homepage does not use, so the homepage screenshots are pixel-identical before and after (0 px diff at 1440 and 390).
  - Grey bands on the Our Expertise pages that wrap full-bleed blocks no longer add 24px side padding. Sizes match the source:
    - accordion-drawer: the band is transparent and each drawer is grey, so the 30px gaps between drawers are white again. Drawers are 1176px.
    - carousel-square and cards-filterable (the band holds no default content): the band is 1200px with no padding. cards-filterable keeps 20px above the filter bar.
    - stacked cards-service: no band padding, grey tiles and 30px between rows.
  - Delo video tile pair: a section with intro copy, a portrait quote-testimonial, then a default-content tile now shows the tiles side by side in DOM order. The intro spans both columns and a 1px white divider separates the tiles.
  - Locator pages: the H1 is 30/36 bold and centered, with 10px above it. It is black on the distributor and installer pages and navy on the retailer page, as on the source.
  - Blog landing: each "heading + copy + link" / cards-insights pair is a 1200px insights band, 544px tall and 41px apart. The first two are blue (#0066b2), the third grey (#5c5e60).
  - Contact-us "We're here to help": a lead line followed by link-only paragraphs becomes a row of 254x64 square blue buttons.
  - `a.link-inline` is underlined (fixes the axe `link-in-text-block` failure).
- `scripts/scripts.js`, `decorateDefaultContentLinks()` (runs after `loadArea`):
  - An image-only link with no alt text gets `aria-hidden` and `tabindex=-1` when it repeats a neighbouring text link with the same href (`link-name`).
  - A link inside running text gets the class `.link-inline`.
- `blocks/cards-service/cards-service.js`: heading titles are re-tagged to one level below the closest preceding heading in `<main>` (fixes `heading-order` on techron, where an h3 followed the h1). Titles are styled by `.cards-service-title`, so the techron screenshot is pixel-identical.

### Testing
- [x] Homepage screenshot diff before vs after at 1440 and 390: 0 px.
- [x] Lighthouse a11y is 100 on home, products/by-brand/delo, automobile-fleets, isoclean, learning delo, gf-7, blog landing, find-a-retailer, contact-us, techron, delo-customer-success-stories, industrial-products and industrial-products/learning-for-you. isoclean/customer-success is 97: `target-size` on "Waste"/"Steel", because the Steel thumbnail image does not load (0x0).
- [x] No horizontal overflow at 1440 or 390, and no console errors, on the 9 verification pages.
- [x] stylelint and eslint clean.
- Screenshots: `migration-work/design-verify/` (`*-source-*`, `*-migrated-*`, `*-side-by-side-*` at 1440 and 390; homepage baselines in `baseline/`; Lighthouse JSON in `lighthouse/`).

---

### Migrate Where to buy pages (4) + locator block

**Branch:** `main` (uncommitted)
**Status:** Ready for review. Needs a Google Maps key from Chevron for ZIP/city search and the map.

### Summary
- Pages: `/where-to-buy/find-a-distributor`, `/where-to-buy/find-an-installer`, `/where-to-buy/find-a-retailer`, `/contact-us`. Template `expertise-where-to-buy` = the expertise-marketing mapping + `locator` (`#main-content .retailer-finder`).
- New `blocks/locator`: a functional rebuild of the source retailer-finder.
  - Spec: `migration-work/where-to-buy/locator-spec.{json,md}`.
  - Content: key/value rows (Type, labels, radius…); all UI copy is authorable.
  - Calls Chevron's locator service (`https://chevrondelo.chevron.com/api/…`) via JSONP. The service has no CORS headers but accepts the new domain.
  - Distributor: tiering and de-dup, ISOCLEAN filter, retry at 200 mi. Installer: Havoline. Retailer: Delo/Havoline/Techron, nearest 30.
  - `?zip=`, `?brand=` and `?radius=` URL params, `e_locator` dataLayer events, a11y (Lighthouse 100).
  - Fixes live-site bugs: the retailer search fails on every result set (`bounds` ReferenceError); there's no message when the installer retry is empty; mixed units; HTML-encoded names.
- Google Maps loads only when the site configuration sheet has `google-maps-api-key` (`content/configuration.json` locally, empty for now; DA `/configuration`). Without a key, the block hides the ZIP field and map and searches with "Use my location".
- Parser `tools/importer/parsers/locator.js`: block config from the source, plus the retailer page's "Find online" tab (14 online retailers) as an h2 + `cards-resource`.
- Link handling:
  - The link map now covers 113 migrated pages, and every imported page was re-imported so links to the new pages use new paths.
  - Form-replacement links now point to the migrated `/contact-us`; only xpress-lube-contact-us's self-link stays absolute.
  - Source links to the AEM author host (`author-prod.chevronlubricants.com/editor.html/...`) are normalized.
  - `content/nav.plain.html` (179 links) and `content/footer.plain.html` (9 links) were relinked to new paths (local edits; backups in `migration-work/*.before-relink.plain.html`).
- The manual Havoline customer-stories label fix was reapplied after re-import.

### Testing
- [x] 4/4 pages imported. Contact Us 100% visible text; on the locator pages, only locator UI labels are missing, and the block supplies them.
- [x] Render check: no errors, no broken images.
- [x] Live searches from the imported pages (Houston, location emulated): distributor results, installer 12, retailer 30.
- [x] The header Where to buy menu links to the new pages; 131 header/footer links use new paths; nav/footer content validators pass.
- [ ] Chevron: provide or allow a referrer-restricted Google Maps key (Maps JS + Geocoding) for the new domains, then add it to the `configuration` sheet.
- [ ] Delete leftover test pages `content/locator-test.plain.html` and `content/bgen-test/` (deletes under content/ are blocked for the assistant).
- [ ] Design pass for `locator`.

---

### Migrate Chevron Lubricants design system to EDS

**Branch:** `main`
**Status:** Ready for review

### Summary
- Hero `account-based` + `hero-image-below`: text-first / image-second, overlay scrim, 350px stage, row 1 & 2 max-width 1200px centered.
- Product block: image left / fields right; URL `product-image` as `<img>`; value-only when no friendly label; `product-name`, `short-description`, `product-tag` styles; labeled `product-image` stacks label above image.
- Extracted design tokens from chevronlubricants.com (colors, typography, spacing, sections)
- Updated `styles/styles.css` with Chevron brand palette (blues, greys) and typography (Montserrat as Gotham Narrow substitute)
- Created `styles/fonts.css` for font loading configuration
- Styled all 5 block variants: columns-promo, cards-industry, columns-brands, columns-products, cards-insights
- Added section background variants (blue-bg, grey-bg, light-blue-bg)
- Implemented button system with primary, outline, accent, and light variants including hover/focus/active states
- Importer emits the new block options (re-imported 14 expertise pages): `columns-media` `card` (source `.multi-column__item--card-shadow`), `centered` (`.btn-align-center`, non-card) and source column order (text-first on 6 instances); `accordion-faq` `grey` (`.applications__content.bg-light-gray`, techron/faqs) and `blue` (`.applications__toggle-all.lubricantsFontColorBlue`, industrial-products-faqs). `columns-cta` options below.
- `columns-cta` gets two new options; the default pills, `links`, the text + button band and the labelled social rows are unchanged:
  - `red` ("Columns-Cta (red)"): Havoline jump links, measured on the gf-7 source.
    - #b5121b square buttons, white bold 16/22 labels, 12px 30px padding, 48px tall; hover #870d14.
    - Stacked 15px apart until 1200px, then a row of equal columns about 6px apart.
    - The first button aligns to the end of its column, the last to the start, the middle ones are centered (as on the source).
    - 41px below the hero, 56px (71px stacked) above the next heading.
  - `icons`: icon-only social rows (Techron, Havoline, Havoline drivers / customer stories).
    - 78px icons, six 1/6 columns centered (about 196px apart) inside a 1px #f5f5f5 box; stacked 15px apart below 1200px.
    - The label stays in the link as its accessible name but is visually hidden.
  - Parser (`parsers/columns-cta.js`, multi-column rows) detects both from the source DOM:
    - `red` when every button link has `bg-havoline`/`bg-red`;
    - `icons` when every item is an image-only link with no visible text.
  - Re-imported gf-7-landing-page, techron, havoline, havoline/drivers and havoline/havoline-customer-stories (only the block class changed), then reapplied the customer-stories "Havoline® Conventional Motor Oil" label fix. `import-expertise-blog-landing.bundle.js` was rebuilt; its page output is byte-identical.
  - Testing:
    - [x] Homepage parser output on `migration-work/block-context/columns-cta/source.html` is byte-identical before and after.
    - [x] Parser checked against the live DOM of 10 pages: only the 5 target rows gain an option, and no cells change.
    - [x] Screenshots identical before and after at 1440 and 390 for home, delo, isoclean-faqs, delo-customer-success-stories, isoclean, greaseportfolio and havoline/business.
    - [x] Button and icon positions match the source to within 1px (the substitute font makes the buttons wider).
    - [x] Lighthouse a11y is 100 on gf-7, havoline, havoline/drivers and havoline-customer-stories. Techron scores 99 because of an existing `heading-order` issue (cards-service h3 after the h1); it is unrelated to `columns-cta`.
    - [x] eslint and stylelint clean.
  - Not yet re-imported: xpress-lube, xpress-lube/drivers, techron/faqs, techron/history and havoline/business have the same icon-only social rows. The parser emits `icons` for all five on the live DOM, so they get it on their next re-import.

### Affected pages / blocks
- /styles/styles.css (complete design system rewrite)
- /styles/fonts.css (new: font loading)
- /blocks/columns-promo/columns-promo.css
- /blocks/cards-industry/cards-industry.css
- /blocks/columns-brands/columns-brands.css
- /blocks/columns-products/columns-products.css
- /blocks/cards-insights/cards-insights.css
- /content/index (homepage preview)

### Testing
- [x] Local `aem up` — page renders at localhost:3000/content/index
- [ ] Checked Lighthouse scores
- [x] Visual comparison to source URL

---

### Migrate Products listing pages (69 pages)

**Branch:** `main` (uncommitted)
**Status:** Ready for review. Content is imported; the design pass for the listing layout is still to do.

### Summary
- Scope is recorded in `source_website.md`: 69 listing pages under `/en_us/home/products/` (5 by_brand, 33 product_category, 31 equipment_type).
- Product detail pages (160+) are out of scope and will come later via Edge Commerce (Product Bus). Product links stay absolute to chevronlubricants.com.
- Templates in `tools/importer/page-templates.json`:
  - `products-brand`: the 5 brand pages.
  - `products-listing`: 64 pages, including the transmission_gear_oils/industrial page and the two variant pages that classification put in separate groups.
  - `chevron-homepage` is unchanged.
- Pages map from `/en_us/home/products/...` to `/products/...`, with underscores becoming hyphens (e.g. `/products/by-brand/delo`).
- `cards-products` block gets a new `grid` option, authored as "Cards-Products (grid)":
  - a 4/2/1-column wrapping grid;
  - a "See all (N) >" toggle beyond 4 cards, with `aria-expanded`, that moves focus to the first revealed card.
  - The default carousel is unchanged; homepage output was verified identical.
- Importer:
  - `parsers/cards-products.js` handles three DOM shapes: homepage tiles (unchanged), the listing carousel (skips slick clones, reads `data-bg` images) and group grids (all items, including those behind "See all").
  - New `transformers/chevron-products-cleanup.js` runs only for `products-*` templates.
    - It removes the breadcrumb, the filter panel/modal, the filter and count items, print duplicates and the back-to-all links.
    - It normalizes headings (one H1; H2 for the category and Featured headings; H3 for groups).
    - It turns the brand tagline into a paragraph without the "|".
  - Import scripts: `import-products-listing.js`, `import-products-brand.js`.
- Not migrated: client-side filtering (needs a product index; pairs with Edge Commerce) and breadcrumbs.

### Testing
- [x] 69/69 pages imported, 0 failures.
- [x] Every product title and group heading from each source page is present in its imported page (69/69).
- [x] The importer completeness score (40–89%) is low only because it counts header menu, location selector and filter text that is removed on purpose.
- [x] Preview render check on 6 sample pages (brand, listing, variant):
  - blocks decorate and "See all" toggles work;
  - no broken images and no console errors.
- [ ] Design pass for listing pages (grid tiles, category links bar, brand header)
- [ ] Source quirk carried over: one product bullet reads "Retrieving data. Wait a few seconds and try to cut or copy again." (Delo Syn-Trans HD SAE 50)

---

### Migrate Our Expertise pages (37 pages)

**Branch:** `main` (uncommitted)
**Status:** Ready for review. Content is imported; the design pass for the new blocks is still to do. The two entries below ("block library" and "Import transformers") give the details.

### Summary
- Scope: the 37 pages linked from the Our Expertise menu, recorded in `source_website.md`.
  - 32 brand hubs and sub-pages: Delo, Industrial Products, Techron, Havoline, Xpress Lube, ISOCLEAN.
  - The Lube Matters blog landing page and 2 blog articles.
  - The Xpress Lube contact page.
- Templates: `expertise-marketing` (36 pages) and `expertise-blog-landing` (1). The classifier's smaller groups (feature, hub, article) import correctly with the marketing mapping, so they were folded into it.
- New paths drop `/en_us/home`, e.g. `/learning/about-our-brands/isoclean`.
  - `transformers/chevron-links.js` rewrites links to any migrated page (homepage, Products, Our Expertise) to the new paths. Other chevronlubricants.com links stay absolute.
  - The homepage and Products pages were re-imported. Their output is identical apart from the rewritten links.
  - Re-run `node tools/importer/generate-link-map.mjs` whenever template URLs change.
- Shared resources sheet: `content/learning/resources.json` (DA: `/learning/resources`) holds the 45 resources.
  - The two "Learning for you" pages render it with `cards-filterable`, with Brand/Type filters.
  - Blog articles render their related-posts list as static rows in the same block.
- The blog landing page reuses `cards-insights` for its 3 category carousels.
- All import scripts are regenerated with the same path rule.
- Manual content fix: on `havoline-customer-stories`, the importer had cut the link label to "Havoline® C". It now reads "Havoline® Conventional Motor Oil" (local edit; re-importing restores the truncation).

### Testing
- [x] 37/37 pages imported, 0 failures.
- [x] Visible-text check against the rendered live pages: 96–100% on 34 pages.
  - The two "Learning for you" pages: resource titles load from the sheet at render time.
  - The Xpress Lube contact page: form labels dropped; the form became a link.
- [x] Render check, all 37 pages: every block decorates, no unwanted YouTube embeds, no console errors.
- [x] 90 distinct internal links use the new paths. The Xpress Lube contact page keeps its live form link absolute on purpose.
- [ ] Source issues to flag to Chevron:
  - 21 images that are broken on the live site, carried over as-is (techron, vartech-isc, isoclean, isoclean/customer-success, both learning-for-you pages, one blog article);
  - the Southeastern Stages case-study tile linking to the Ecology Auto Parts page (delo-customer-success-stories).
- [ ] Decisions:
  - white text on `sky-blue-bg` (#04a2d3, ISOCLEAN blue) is ~3:1 contrast and fails WCAG AA;
  - replacements for the 2 Salesforce forms (xpress-lube-contact-us, waste-hauling);
  - `teal-blue-bg` styling (greaseportfolio).
- [ ] Delete the block generator's leftover test page `content/bgen-test/` (deletes under content/ are blocked for the assistant).
- [ ] Design pass for the 11 new blocks and new section styles.

---

### Our Expertise (expertise-marketing): block library

**Branch:** `main` (uncommitted)
**Status:** Done: blocks generated; parsers and import completed (see "Migrate Our Expertise pages" above). The design pass is still to do.

### Summary
- Block mapping for all 28 pages, in the `expertise-marketing` entry of `tools/importer/page-templates.json`. The other templates are unchanged.
  - 14 variants with class/structure selectors. None use `:nth-child` or `:nth-of-type`.
  - All 321 top-level components are accounted for: 111 block instances, 146 default, 68 excluded, 7 containers, 0 unmatched.
  - Checked on the live DOM, the rendered snapshots and the raw server HTML.
  - Coverage table, parser branches, cleanup rules and open questions: `migration-work/expertise/mapping-coverage.json`.
  - Generic section rules (bg class → style, grouping consecutive bands, `centered` derivation): `migration-work/expertise/section-rules.json`. The sections transformer needs a rule-map path for this template.
  - Block context is cached for every variant in `migration-work/block-context/{variant}/`. For `cards-products`, `columns-cta` and `columns-promo`, existing files are kept and examples are added as `instances/expertise-*.html`.
- 11 new blocks, all registered in `KNOWN_BLOCKS` (`scripts/ak.js`):
  - `carousel-banner`, `carousel-square`
  - `columns-media`
  - `cards-resource` (option `blue-caption`), `cards-service`
  - `cards-filterable`: sheet mode plus a static mode
  - `accordion-drawer`, `accordion-faq` (option `load-more`)
  - `quote-testimonial`
  - `hero-callout`, `hero-overlay`
- `columns-cta` gets additive changes:
  - a cell without a link renders as plain text;
  - a social row can show an icon before the link;
  - new option `links` renders underlined text links instead of pills.
  - The default pills are unchanged.
- `styles/styles.css`:
  - new tokens `--color-sky-blue` (#04a2d3) and `--color-cobalt-blue` (#0066b2);
  - new section styles `sky-blue-bg`, `cobalt-blue-bg`, `black-bg`, `grey-gradient` and `right-aligned`;
  - existing section styles are untouched.
- Accessibility:
  - the carousels don't auto-rotate; prev/next buttons have labels and 44px targets, and the dots have 24px targets;
  - the accordions use native `<details>`/`<summary>`;
  - motion stops under `prefers-reduced-motion`.

### Testing
- [x] Block validator passes for all 12 blocks; eslint and stylelint are clean on every touched file.
- [x] Smoke test on a fixture page at 1440 and 375px:
  - every block decorates with no console errors;
  - carousel, filter, load-more, expand-all and drawer interactions all work;
  - the sheet loads from `/content/...json` locally.
- [x] Homepage `columns-cta` pills: same HTML, computed styles and geometry, and identical screenshots at 375 and 1440px.
- [x] Block mapping: the ajv schema check passes, and the selectors give 0 mismatches against the expected classification on all 28 live pages.
- [ ] Section style `teal-blue-bg` (#017da4, greaseportfolio) has no CSS yet.
- [ ] Parsers and import for the expertise-marketing pages
- [ ] Design pass (`excat-complete-design-expert`)
- [ ] White text on `sky-blue-bg` (#04a2d3) has a contrast of about 2.96:1, which fails WCAG AA; decide on a darker shade before the Lighthouse run.

---

### Import transformers: expertise cleanup, expertise sections, site-wide link rewriting

**Branch:** `main` (uncommitted)
**Status:** In progress. The transformers are done and verified; the expertise parsers and import script are still to do.

### Summary
- New `tools/importer/transformers/chevron-expertise-cleanup.js`. It does nothing unless the template name starts with `expertise-`.
  - Removes: breadcrumb, slick clones, print-only slide lists, dividers, spacer items, empty panels and mobile duplicate images.
  - Distributor widget becomes the source text plus a "Find a distributor" link (absolute live URL).
  - Each of the 2 Salesforce forms becomes a link to the live form page:
    - waste-hauling links to `/en_us/home/contact-us.html`;
    - xpress-lube-contact-us links to its own live URL, and that link is kept absolute.
  - Default-content `.video` becomes a YouTube watch link. Text-link videos get `#_dnb`.
  - Headings:
    - title components become h2 (or h1) plus h3 or a paragraph;
    - the gf7 display line becomes h2;
    - exactly one H1 per page; extra source h1s become h2;
    - split h1 pairs are merged;
    - override for industrial-products-faqs.
  - Anchor tags: jump links are pointed at the EDS heading id (github-slugger) of the heading the anchor marks.
  - Unmatched multi-columns and simple-panels are unwrapped.
- New `tools/importer/transformers/chevron-expertise-sections.js`. It implements `migration-work/expertise/section-rules.json`: bg-band grouping plus `centered`.
- `chevron-sections.js` now returns early for `expertise-*`. The homepage and products-* path is unchanged.
- `chevron-cleanup.js`: for `expertise-*` only, a generated h2 keeps the source `style`, so centring survives whatever order the transformers run in.
- New `tools/importer/transformers/chevron-links.js`, used by all templates:
  - migrated pages get EDS paths (drop `/en_us/home`, strip `.html`, `_`→`-`, lowercase, homepage → `/home`), keeping `#hash` and dropping the query;
  - other site links become absolute `https://www.chevronlubricants.com` URLs;
  - for non-homepage templates, YouTube links get `#_dnb` in cards-resource, quote-testimonial, cards-filterable and columns-media thumbnails, and channel links get it everywhere.
- New `tools/importer/generate-link-map.mjs`. It embeds the migrated-URL map in `chevron-links.js`. **Re-run it whenever `templates[].urls` change.**

### Testing
- [x] chevron-homepage: the output is identical to the previous transformers with hrefs masked. Only 12 link hrefs change.
- [x] products-listing and products-brand: the output is identical with hrefs masked. Only links to migrated listing/brand pages change.
- [x] 28 live expertise pages with stub parsers:
  - no transformer errors;
  - the output is identical with the transformer order reversed;
  - 22/28 match the mapping-coverage section styles. The other 6 differ only where `centered` is derived from a container's children, as section-rules.json specifies.
- [x] The heading slug function matches github-slugger on all 170 output headings.
- [ ] Unresolved jump targets: coolant `#rep`; and simplify (4), construction, mining (2) and oil-and-gas, which need the parsers to output headings.
- [ ] Expertise parsers and import script. The output path must use the same `/en_us/home` drop rule.

---

### Accessibility, performance & Lighthouse fixes (homepage)

**Branch:** `main` (uncommitted)
**Status:** Ready for review

### Summary
- Audit run with Lighthouse 13.6 and the Modern Web Guidance plugin on the local preview. Reports are in `migration-work/lighthouse/`.
- Accessibility:
  - `cards-products` dots now have 24px hit areas, keeping the 10px visual dot.
  - Footer consent links are underlined.
  - Skip-to-main-content link added (`scripts/scripts.js` + `styles/styles.css`).
  - Site-wide `prefers-reduced-motion` rule, and the product carousel's JS scrolling respects it.
- SEO: header label-only items render as `<span>`, not `<a>` without `href`.
- Best practices: `cards-insights` images use `object-fit: cover` instead of being stretched.
- Performance (`head.html`, only effective once pushed — the local preview serves the remote head):
  - preload `brand.css`, so the `@import` chain no longer delays rendering.
  - preload `montserrat.woff2`.
  - load `fonts.css` without blocking render (`noscript` fallback).

### Testing
- [x] Before: mobile 74/94/88/92, desktop 90/94/92/83 (performance/accessibility/best practices/SEO)
- [x] After (local CSS/JS; remote head): mobile 75/100/92/92, desktop 100/100/96/92
- [x] Skip link is the first tab stop and moves focus to `main`; desktop megamenu and mobile drill-down still work; no console errors
- [x] stylelint / eslint clean
- [ ] Re-check render-blocking + LCP after the head change is live; mobile LCP (13.2s locally) is dominated by full-size source images that EDS will optimize once the content is published from DA

---

### Homepage design migration

**Branch:** `main` (uncommitted)
**Status:** Ready for review

### Summary
- New `styles/brand.css` (tokens extracted from the source: fonts, colors, 1200px container, band padding, heading sizes), imported at the top of `styles/styles.css`. Brand extraction results are in `migration-work/brand.json` and `default-content-extracted.css`.
- Gotham Narrow is not available from Typekit or Google Fonts, so the existing Montserrat substitute stays (loaded via `styles/fonts.css` in `head.html`).
- `styles/styles.css` changes:
  - EDS button reset.
  - Default-content typography measured from the source (40px bold h1/h2, 30px band titles, 42px regular split titles, 18px navy copy).
  - `centered` alignment.
  - Contained colored bands (1176px centered bands, 1200px blue split band).
  - `split` grid layout: the promo tile's heading and link overlay the image, with the block on the right.
  - Insights pill button.
  - Mobile band alignment.
- Block styling, matched to source computed styles:
  - `columns-cta` (white pills, `#e6e6e6` hover).
  - `cards-products`: horizontal carousel, one card per step, with arrows and dots.
  - `cards-insights`: horizontal scroll and drag carousel with arrow links.
  - `columns-promo`: borderless, centered, black text. Its JS now tags only the image child.
  - `cards-industry`: 5 tiles in a row with overlaid white titles.
  - `columns-brands`: natural-size logos, 15px radius.
- `scripts/ak.js`: `cards-products` and `columns-cta` added to `KNOWN_BLOCKS`. They were never being loaded.

### Testing
- [x] Page height 4490px vs source 4543px at 1440. Every section is within ~30px of its source position.
- [x] Per-block visual match 88–95% (the remaining differences come from Montserrat's wider glyphs)
- [x] 390px mobile check
- [x] stylelint / eslint clean

---

### Import homepage content (chevron-homepage template)

**Branch:** `main` (uncommitted)
**Status:** Ready for review

### Summary
- Re-analyzed https://www.chevronlubricants.com/ and reimported it to `/home` (the site redirects `/` → `/home`). The import replaced the earlier hand-built home page; a copy of the old one is in `migration-work/home.previous.plain.html`. An `/index` copy from the first run also remains in content.
- Six sections: page title + `columns-promo`; "Where to buy" (`blue-bg, centered`) + new `columns-cta`; "Find resources by Industry" + `cards-industry`; brands (`grey-bg, centered`) + `columns-brands`; "Featured Products" (`split`) + new `cards-products`, which shows all 6 products as a carousel (the old `columns-products` kept only 1); insights (`blue-bg, split`) + `cards-insights`.
- New blocks: `blocks/columns-cta`, `blocks/cards-products`.
- Importer: `tools/importer/import-chevron-homepage.js`. Parsers were rewritten against the real source DOM, plus new `columns-cta`/`cards-products` parsers and a new `chevron-sections` transformer. `chevron-cleanup` now drops the tracking pixel and promotes bold-only rich-text paragraphs to section `<h2>`s. Block selectors use `:nth-of-type` so the section-break `<hr>`s don't shift them.
- `scripts/ak.js` `decoratePictures`: skips `<picture>` elements without a `<source>` (local plain HTML), which previously crashed the page in local preview.
- ~~`head.html`: loads `styles/fonts.css`; Montserrat was never loaded before.~~ Correction: the committed `head.html` already loaded `styles/fonts.css` and Montserrat loads fine in the preview; that earlier diagnosis was wrong and the edit changed nothing.

### Testing
- [x] Import completeness 95.4% (validate-imported-pages, threshold 90%)
- [x] Local preview /content/home: 6 sections, 6 blocks decorated, 37 images load, no console errors

---

### Migrate site footer (desktop + mobile)

**Branch:** `main` (uncommitted)
**Status:** Ready for review. Desktop approved by the customer; desktop and mobile registers all pass; Step 11 pre-completion-check passes (9/9).

### Summary
- Content-first footer: `content/footer.plain.html` holds all copy, links, images and the contact-form definition as flat semantic HTML (no form controls, no class/id/style/data attributes).
- `blocks/footer/footer.js` rewritten: fetches `/content/footer.plain.html` and falls back to `/footer.plain.html` (does not use `getMetadata`); resolves relative image paths against the URL it fetched from; picks a layout for each section from its content (tiles, lead form, divider, link columns, bottom bar); builds the contact form from the field lists.
- Contact form rebuilt visually and posts to the source Salesforce endpoint, with the same fields, option labels/values and hidden fields. "Get Started" opens and closes the form with a 400ms slide (open by default). The reCAPTCHA v2 container uses the source sitekey; its script loads only when the form nears the viewport or gets focus. The submit button stays enabled because the key is tied to the source domain.
- `blocks/footer/footer.css` rewritten mobile-first (single `@media (width >= 900px)` block), using the palette variables from styles.css. 1200px content width + 12px gutters (132px at 1440), no hover changes (matches source).
- 6 footer images in `content/images/`.
- Step 6 fixes: "Get Started" is now an `<a role="button" tabindex="0">` with no href (as on the source, so the form section has the same link count). It handles Enter/Space and keeps its white text on hover. Link columns use `column-gap: 36px` at 900px and up, so gaps match the source (36px, columns at x=132/358/584/746/972/1198). Get Started / Submit pill padding changed to 90px / 79px so the pills are 271px / 363px wide, as on the source.

- Mobile (below 900px, matching the source's below-768px layout): each of the 6 link columns is a white card with a collapsed accordion header (54px row with a "+" that changes to "-"). Several can be open at once and they open instantly, as on the source. `footer.js` adds a `footer-column-header` row and a `footer-column-toggle` button (`aria-expanded`/`aria-controls`, labelled with the heading text) to each column. The whole row toggles, and does nothing at 900px and up. Other mobile changes: 30px gutters, tiles stacked 30px apart, centered lead text, full-width Get Started (offset 16px, as on the source), single-column form with a full-width submit button, and the divider moved below the columns as a 2px rule (CSS `order`). The legal links are spread across the row and the copyright is centered. At 900px and up every one of these is reset; the 1440 layout is unchanged (182 footer elements, same boxes as before).

### Affected pages / blocks
- /content/footer.plain.html (new)
- /content/images/footer-*.{png,jpg} (new)
- /blocks/footer/footer.js, /blocks/footer/footer.css

### Testing
- [x] validate-footer-content.js and audit-footer-images.js pass
- [x] eslint / stylelint clean
- [x] Local `aem up` at localhost:3000/content/home, 1440x900 — 5 bands render, images load, form builds, toggle works, no console errors
- [x] Desktop structural compare 100% (schema-register allValidated) and appearance compare validated
- [x] Desktop behavior compare 50/50 after customer approved the social-link fix
- [x] Mobile 375x812: mobile structural compare 100% (mobile-schema-register allValidated), mobile behavior compare 10/10, check-breakpoints passes (min-width only)
- [x] Desktop re-checked at 1440 after the mobile CSS: 5 bands, 6 columns in one row, 2-column form, 132px gutters, link lists visible with no animation
- [x] Step 11 pre-completion-check (enforcement gate 9/9, breakpoints, fetch path, eslint)

---

### Migrate site header / navigation (desktop + mobile)

**Branch:** `main` (uncommitted)
**Status:** Ready for review, with known validation-tool limitations. Desktop (Steps 1–7) is done and confirmed by the customer. Mobile (Steps 8–12a) is built and validated. Step 13 pre-completion-check runs but is BLOCKED by 5 checks: live-panel-comparison, panel-layout-parity, panel-text-parity and panel-screenshot can't find the source panels (they collapse to height 0, with no class the scripts recognize); a manual text comparison of all 5 open panels matched 100%. live-css-comparison fails only on Montserrat vs Gotham Narrow font weight and width. The customer accepted these limitations at desktop confirmation (2026-10-29).

### Summary
- Content-first header: `content/nav.plain.html` holds every piece of header copy, link and image as flat semantic HTML in 5 top-level sections: utility links, locale dialog, brand, main navigation with megamenu panels as nested lists plus the "Close" label, and tools (SDS/PDS CTA + search link). It has no form controls and no class/id/style/data attributes. Relative source URLs are made absolute. A "#_blank" suffix marks links that open in a new tab, and `href="#"` marks label-only headings.
- `blocks/header/header.js` replaced (same `export default async function init(el)` as before). It fetches `/content/nav.plain.html` and falls back to `/nav.plain.html` without using `getMetadata`, and resolves image paths against the URL it fetched from. It works out each section's role from its content and builds:
  - the utility bar, the brand and 5 hover megamenus: instant open, full-width panel at the header bottom, grey tab with a 4px black underline, closed by mouse leave or the Close bar;
  - click drill-down for category boxes: the heading swaps to the category, and clicking the heading goes back;
  - promo tiles, intro blocks with buttons, the SDS/PDS CTA, and a GET search form (action from the link, param `q`, placeholder "Search");
  - a native `<dialog>` locale modal: 50% black backdrop, current-locale box, 27 flag entries, closes on X, Escape or a backdrop click.
  - It also sets aria-expanded/aria-controls, closes panels on Escape and focus-out, and adds a `matchMedia('(width >= 900px)')` reset.
- `blocks/header/header.css` replaced. It is mobile-first with `min-width` breakpoints at 600, 900 and 1200 only, and every selector is scoped under `header`. Values come from the source's computed styles: 30px navy utility bar, 30px gap, 87px main bar, 80x80 logo, 13.92px bold triggers, a #f5f5f5 panel with 50px padding, 396px columns with 1px #dbdcdd dividers (300px in the 4-column panel), and a 50px rgb(0,102,178) Close bar. The global fixed header and body offset are cancelled, because the source header is not sticky.
- 37 header images in `content/images/`: logo, 27 flags, modal close icon, and the 2 promo thumbnails saved once per panel (8 files).
- Desktop validation fixes, each checked against real hover and computed styles on the source:
  - Hover effects now match the source. Global link hover (colour change and underline) is cancelled inside the header. No hover underline on promo tiles, intro buttons, Where-to-buy headings or locale language links (the source has none), and these keep a `:focus-visible` underline. Drill categories keep grey text and show only the 4px blue left bar.
  - The utility bar uses the source's DOM order and layout: locale trigger first, `row-reverse`, a border-box 1200px container with 25px padding, 12px/14.4px text and an 18px locale label line-height.
  - Main bar: `margin-top: 30px` replaces the padding, the bar is 95.19px tall and `position: relative`, and the panel sits at `top: 86.704px`, which is 147px as on the source. Trigger labels have no border at rest and get a 4px border when open (as on the source). Logo, CTA and label use the same box model as the source.
  - SDS/PDS is now the 6th item of the main menu list, as on the source. Its `<strong>` link renders as a `nav-trigger nav-cta` item, and the tools section holds only search.
  - The search form has the source structure: form, then box, then field (25px left margin) plus an action cell (#f5f5f5, 10px padding, 15px right margin) holding the submit button, whose icon is drawn with a `::before` mask.
  - Top-level labels and drill categories are written as label-only links (`<a href="#">`) in nav.plain.html and rendered as anchors without href inside their buttons, as the source uses `<a>` labels. The menu list also has the class `nav-list`.
- Mobile (below 900px; the source switches at 768px), copied from the source at 375x812 using real Playwright clicks:
  - Header bar, 85px: menu toggle on the left, 80px logo, search icon on the right. The navy utility bar is hidden. The toggle switches straight from three bars to a bold cross with no animation, as on the source. Its aria-label ("Main menu") comes from nav content.
  - The menu opens as a full-width white sheet 77px from the top, with no backdrop. It lists the 5 headings (60px rows, 20px bold, chevron on the right), then the SDS/PDS pill, then a grey box. The box holds Contact Us, Chevron Warranty, SDS/PDS and a globe "Location Selector" row, which opens the existing locale dialog. The utility links and CTA are moved into the menu by JS below 900px and moved back at 900px and up, so nothing is duplicated.
  - Slide-in panels, as on the source: each tap replaces the current list instantly with the next level, under a navy "Back to …" bar. The levels are heading → group rows → links or drill categories → category title plus links. The bar reads "Back to Main menu", then "Back to Products", then "Back to Browse by category". The whole row is one tap target (text and chevron do the same thing). A group with a linked title (e.g. Delo) lists that title as its first link. Promo rows open their image tiles. Intro blocks render in place, and Where-to-buy shows its links only. Menu state is kept when the toggle closes and reopens the menu, as on the source.
  - Search: the icon opens a full-screen `<dialog>` with a blue × and an underlined field. The field's placeholder ("What can we help you find?") comes from nav content. Escape, × or a backdrop click closes it.
  - nav.plain.html changes: `<p>Back to <em>Main menu</em></p>` in the menu section supplies the back-bar text and the toggle label. A text paragraph after the search link supplies the mobile search placeholder. Both are recorded in `mobile/missing-content-register.json`, with every item resolved.
  - CSS: all mobile menu rules are scoped to `header.is-mobile-open`, a state that only exists below 900px because the matchMedia handler removes it. The only base-rule changes (utility bar hidden, grid main bar, 80px logo) are reset in the 900px block. The resize handler now also clears mobile drill state, closes the search dialog and moves the utility links and CTA back. Desktop panels keep `animation: none` and `transition: none`.

### Affected pages / blocks
- /content/nav.plain.html (new)
- /content/images/chevron-lubricants-logo.png, flag-*.{jpg,png}, promo-*.jpg, modal-close-icon.png (new)
- /blocks/header/header.js, /blocks/header/header.css
- migration-work/navigation-validation/phase-5-aggregate.json, phase-4-mobile.json, mobile/*

### Testing
- [x] validate-nav-content.js and audit-header-images.js pass (expected 36 slots, 37 on disk)
- [x] eslint / stylelint clean; check-breakpoints and check-fetch-path pass
- [x] localhost:3000/content/home at 1440x900: both rows render (header 147px tall). All 5 megamenus open on real hover with their images loaded. Drill-down works (Engine Oils, Preferred Vendors) and back works. The Close bar works. The locale modal opens, shows 27 entries and 28 links, and closes on Escape, backdrop click and X. The search form builds. No console errors. Widths of 1024 and 375 do not overflow.
- [x] Step 5 megamenu behavior (informational): 224/243 items match. What is left is source-note wording, 6 Our Expertise headings the source notes call underlined but which have no hover change on the live source, and the locale modal position string.
- [x] Step 5a row elements: 13/13 hover and click match (source and migrated both measured with Playwright)
- [x] 6-LIVE content: PASS (0 missing on migrated, 0 missing in nav file)
- [x] 6c-LIVE toggle panels: PASS (no click toggle on the source). 5c-LIVE deep drill desktop: PASS with 0 paths (the script self-skips; all 21 drill categories were checked by hand)
- [ ] 5a-LIVE CSS: 9/14. Every non-font property matches. The 5 failures are the font-weight of the Gotham Narrow Bold face against Montserrat 700, and widths that follow from the wider substitute font (labels, the CTA position, and a narrower search box).
- [ ] Step 6 structural: schema-register allValidated, but similarity is 75%. Source phase-1 rowCount is 1 because the utility bar sits outside `<header>`; the migrated header measures 2.
- [ ] 5-LIVE panels / 6b-LIVE layout / 6e-LIVE text / 6f-LIVE screenshot: these scripts cannot find the source panels (`section.tab-section`, clipped with max-height:0). A separate text-parity check by hand found 100% text parity across all 5 panels (`supplementary-panel-text-check.json`).
- [x] Phase 4 mobile analysis: phase-4-mobile.json passes the schema; detect-mobile-structure on the source finds 1 row with 5 items; phase-5-aggregate mobileMapping is filled in
- [x] Step 10 compare-mobile-structural-schema: 100% (5/5 items; migrated measured with the same detection script)
- [x] Step 11 mobile-heading-coverage: allCovered true. All 5 headings, 13 expandable groups and 21 drill categories were tapped with real clicks, back works at every level, and 143 of 143 megamenu links can be reached
- [x] Step 12 mobile-behavior-register: allValidated true (32 items, split-link included). mobile-dimensional-gate: PASS 18/18 (list, items and containers 375px; 20px/700 labels)
- [x] 12a-LIVE deep-drill mobile: PASS with 0 paths. The script self-skips because it needs `data-depth`/`nav-panel-active` panels; the real-click walk above covers every drill path.
- [ ] live-compare-mobile-panels: content 5/5 MATCH, but the pattern check FAILS. On the source the script's heuristic clicks the SDS/PDS link (it navigates away), so the source is classed "unknown" (40/40). Migrated is detected as slide-in, which matches what was seen on the source.
- [ ] compare-mobile-animation (optional): FAIL. It compares unrelated elements: the source's `.btn` hover transition (150ms) against the footer `.footer-form-panel` (400ms). Header and nav transitions are 0s on both sites.
- [x] Desktop re-check at 1440x900 after the mobile work: screenshots of all 5 hover panels are byte-identical to the pre-change captures. Drill-down (Engine Oils) and the locale modal (27 entries) work. Resizing 375 → 1440 closes the mobile menu and puts the utility bar and CTA back.

---

## Merged PRs

### Show the SDS/PDS button in the header

**Branch:** `warranty-sds-header` → `main`, [PR #11](https://github.com/ynaka-adobe/chevronlubricants/pull/11)
**Status:** Merged 2026-10-31. Code change verified in the local preview. No content change: the published nav already has the `<li><p><strong><a href="https://cglapps.chevron.com/">SDS/PDS</a></strong></p></li>` item.

### Summary
- `blocks/header/header.js`: a main-nav call-to-action is also found when DA wraps it in a paragraph (`li > p > strong > a`). Before, the SDS/PDS item rendered as an empty `<li>`.
- `blocks/header/header.css`:
  - Desktop top-level label padding is 16px per side at ≥1200px (source 25px) and 6px at 900–1199px (source 10px). Montserrat labels are ~126px wider than the source's Gotham, so with the button the search box was squeezed to 147px ("Sea").
  - 16px gap between the button and the search, like the source.
  - The button is hidden at 900–999px, where the source wraps its labels; the top bar SDS/PDS link remains.

### Testing
- [x] Desktop: navy 12px pill beside "Products selector" (source: navy, 6px radius, 12px), linking to `https://cglapps.chevron.com/` like the source. Search box 221px at 1440/1280 (source 281), 171px at 1024, 147px at 1000, 213/153px at 960/900 without the button.
- [x] Mobile 390px: the button appears in the slide-in menu under the main items, as before for CTAs.
- [x] Products megamenu opens and lines up at 1440; no horizontal scroll at 1024/1440. ESLint / Stylelint clean.

---

### Migrate the Chevron Warranty page and relink the header and footer

**Branch:** `warranty-sds-header` → `main`, [PR #11](https://github.com/ynaka-adobe/chevronlubricants/pull/11)
**Status:** Merged 2026-10-31. Page, header and footer imported/edited locally; not uploaded to DA, not previewed or published.

### Summary
- `chevron-warranty.html` added to the `expertise-services` template (`page-templates.json`, `urls-expertise-services.txt`). The link map now has 139 migrated paths. Page: `/en-us/home/chevron-warranty`.
- Header (local `content/nav.plain.html`): the top bar "Chevron Warranty" and the Products menu "Review the Chevron warranty" now link to `/en-us/home/chevron-warranty`. Backup: `migration-work/nav.before-relink-warranty-2026-10-31.plain.html`.
- Footer (local `content/footer.plain.html`): "Product Warranty" now links to `/en-us/home/chevron-warranty` in the same tab, like the other migrated footer links. It was the live page with `#_blank`. Backup: `migration-work/footer.before-relink-warranty-2026-10-31.plain.html`.
- `styles/styles.css`: default content gets `overflow-wrap: break-word`. The page's plain-text specifications URL made phones scroll sideways (scroll width 470 at 390px); it only affects words longer than a line.

### Testing
- [x] Imported with no errors, content completeness 99.2%. Source has no links in the body (the specifications URL is plain text there too).
- [x] Preview at 1440 and 390px: no errors, 0 broken images, no horizontal scroll; both header links resolve to the new page.
- [ ] Known gaps vs source: site-wide heading sizes (H1 40px left vs source 16px centered); "LIMITED PRODUCT WARRANTY" imports as a centered H2 (source: bold paragraph); no space between the last three paragraphs (site-wide `p` margin 0); banner image hotlinked from chevronlubricants.com until DA upload.

---

### Fix the layout shift on ISOCLEAN third-spec and Havoline business pages

**Branch:** `fix-image-cls` → `main`, [PR #10](https://github.com/ynaka-adobe/chevronlubricants/pull/10) (follow-up agreed when PR #8's check failed on this shift)
**Status:** Merged 2026-10-31. Code only, no content changes.

### Summary
- Cause: published pages carry no image `width`/`height`. The DA source has them, but the delivered HTML does not (0 of 60 images sized on en-us/home, delo and waste-hauling). So an image has no height until it loads, and the copy below it jumps when the image appears. This hits pages whose first section starts with several default-content images: logo, banner, infographic, or a columns-media photo.
- `scripts/scripts.js` (`holdForLeadImages`, called from `decorateArea` for the document only): the first section's first 4 images without `height` load eagerly. `body[data-lead-images]` keeps `main` and the footer hidden until they have loaded or failed, for at most 3s.
- `styles/styles.css`: `body[data-lead-images] :is(main, footer) { display: none; }`.
- Not changed: the 0.02 header settle (`main` y135→170) seen on every page. A 0.045 columns-media text-column shift on isoclean/construction was seen in one earlier run but not after the hold covered block images.

### Testing
- [x] Desktop cold-load CLS (1350x940, 3 runs, main → branch):
  - waste-hauling: 0.32–0.48 → 0.022
  - construction: up to 0.65 → 0.022
  - mining: up to 0.38 → ≤0.022
  - oil-and-gas: up to 0.36 → 0
  - havoline/business: up to 0.40 → ≤0.022
- [x] Unchanged on en-us/home, delo, learning-for-you and customer-success (≤0.023).
- [x] Mobile (390x844): 0 before and after.
- [x] LCP unchanged or lower (for example, waste-hauling 224–264ms → 152–180ms). The hold was always released, and the page height was identical.
- [x] ESLint / Stylelint clean.
- [x] aem-psi-check on the PR: success, Lighthouse 100 (desktop CLS 0, mobile 0.037).

---

### Become a distributor + re-import of havoline/business and havoline-oil-change-pros

**Branch:** `distributor-page` → `main`, [PR #9](https://github.com/ynaka-adobe/chevronlubricants/pull/9) (replaces closed PR #8)
**Status:** Merged 2026-10-31. Code/import changes ready; pages imported locally and verified. Not uploaded to DA, not previewed or published.

### Summary
- New page `/en-us/home/become-distributor` (template `expertise-services`; URL added to `page-templates.json` and `urls-expertise-services.txt`; link map 138 paths): H1, subheading, "Request additional information / Email us today" panel (`columns-cta` in a cobalt band; mailto link). Local footer "Work With Us" and "Become a Chevron lubricants distributor" relinked to it (backup `migration-work/footer.before-relink-distributor-2026-10-31.plain.html`).
- Re-imported `/en-us/home/learning/about-our-brands/havoline/business` (expertise-marketing): same blocks, section styles, metadata and text as the DA-mirrored copy; images now from the source instead of DA media on aem.page; the Havoline FAQs link now goes to the live page (the DA copy pointed to the non-migrated `/en-us/home/.../havoline/faqs`).
- Re-imported `/en-us/home/services/pro-services/personal-rec-vehicles/havoline-oil-change-pros` (output unchanged).
- Note: the Services and Support code had looked lost from this working copy on 2026-10-31; it was already on `main` (763aed9 "Preserve current EMA services migration alongside Guides pilot", ddc6e97). A restore from the session record (`services-migration`, PR #8) was therefore redundant and slightly older for `checklist.css` / `isoclean-calculator.css`; PR #8 was closed unmerged and this branch starts from `main`.

### Testing
- [x] 3/3 imported, 0 transformer/parser errors; line-level text check 0 missing; no broken images; render ok at 1440 and 390px.
- [ ] Upload to DA + preview/publish when requested.

### Keep loading sections hidden (desktop layout shift)

**Branch:** `fix-loading-cls` → `main`, [PR #6](https://github.com/ynaka-adobe/chevronlubricants/pull/6)
**Status:** Merged 2026-10-30.

### Summary
- Cause: `styles/styles.css` hides a section while it loads with `div[data-status] { display: none; }`, but three section styles set their own `display` with a more specific selector: the insights band at ≥900px (`grid`), `split` (`grid`) and `banner` (`flex`). On desktop the "Stay informed with Our Latest Insights" band could show at the top of the homepage before the sections above it, then get pushed off screen when they loaded.
- Measured on live `/en-us/home` at 1350×940, cold cache: 1 run in 5 shifted by 0.87 (the band at y=150, 790px tall, pushed off screen); other runs 0.02–0.06. Mobile 0.04. The persona banner makes the top section slower, so the band shows more often; it is not the cause.
- Fix: `main > .section[data-status] { display: none !important; }` next to the framework visibility rule, so any section style is hidden while loading.

### Testing
- [x] stylelint passes.
- [x] Local preview, homepage at 1350px: the insights band and the split section compute `display: none` while `data-status` is set and `grid` after; all 6 sections are visible after load.
- [x] Branch, cold-cache desktop 1350×940: 5/5 runs CLS 0.023 (persona loaded each time); mobile 0.038.
- [x] aem-psi-check: passed, Lighthouse 98. Desktop performance 99 (was 81), CLS 0.023 (was 0.42); mobile 98, CLS 0.038. Accessibility 96 (persona fragment content: unnamed image link, second H1); SEO 61 unchanged.

### Log homepage persona block

**Branch:** `pr-log-persona` → `main`, [PR #5](https://github.com/ynaka-adobe/chevronlubricants/pull/5)
**Status:** Merged 2026-10-30.

### Summary
- `pr.md` only: records the landing-fragment schedule fallback rows, the persona block on `/en-us/home` (uploaded, previewed, published) and the live check of all three personas (see the URL restructure entry under Open PRs).

### Log learning-for-you pages and sheet publish

**Branch:** `pr-log-learning` → `main`, [PR #4](https://github.com/ynaka-adobe/chevronlubricants/pull/4)
**Status:** Merged 2026-10-30.

### Summary
- `pr.md` only: records the preview/publish of the 2 learning-for-you pages and the `resources` sheet (see the URL restructure entry under Open PRs).

### Log redirects sheet publish and persona fix

**Branch:** `pr-log-redirects` → `main`, [PR #3](https://github.com/ynaka-adobe/chevronlubricants/pull/3)
**Status:** Merged 2026-10-30.

### Summary
- `pr.md` only: records the redirects sheet preview/publish and the persona rows repointed to `/en-us/home?persona=…` (see the URL restructure entry under Open PRs).

### Remove orphaned root files

**Branch:** `cleanup-root-files` → `main`, [PR #2](https://github.com/ynaka-adobe/chevronlubricants/pull/2)
**Status:** Merged 2026-10-30.

### Summary
- Removed unreferenced repo-root files: `phase1-preview.png`, `phase2-preview.png`, `pr.html`, `pr.plain.html`, and the old `fragments/` folder (7 header-menu/landing-page fragments; the header uses `content/nav`).
- Content pages are not in git; the old-structure local orphans are tracked in the URL restructure entry under Open PRs.

### Testing
- [x] `git grep` finds no references to any removed file.