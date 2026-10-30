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
- `head.html`: loads `styles/fonts.css`. Montserrat was never loaded before, so text fell back to system fonts site-wide.

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

(none yet)