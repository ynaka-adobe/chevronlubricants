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
- [ ] The migrated `/en-us/home` has no `persona` block, so the `?persona=` parameter currently has no effect (the old `/home` used it to swap fragments).
- [x] Local workspace synced from DA (2026-10-30): the 113 DA pages/fragments (`/en-us/home/**`, `/nav`, `/footer`) were mirrored locally from the aem.page preview (identical text/links to DA source; images absolutized to aem.page media; DA metadata block kept). Pre-sync backup: `migration-work/local-before-da-sync-2026-10-30/`.
- [ ] DA content issues found during the sync:
  - The upload made every chevronlubricants.com link relative: 3,275 links on 104 pages point to `/en-us/home/...` pages that don't exist (product detail pages and non-migrated marketing pages).
  - [x] Fixed 2026-10-30: the `cards-filterable` sheet link (mangled to `/en-us/home/learning/resources-json`) is restored to `/en-us/home/learning/resources.json` on both learning-for-you pages, uploaded to DA (DA source = local). The pre-fix DA source is backed up in `migration-work/da-backups/`.
  - [x] Uploaded 2026-10-30: the `resources` sheet to DA at `/en-us/home/learning/resources.json` (45 rows; identical to `content/en-us/home/learning/resources.json`).
  - [ ] Preview/publish in DA: the 2 learning-for-you pages + the resources sheet.
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

### Remove orphaned root files

**Branch:** `cleanup-root-files` → `main`, [PR #2](https://github.com/ynaka-adobe/chevronlubricants/pull/2)
**Status:** Merged 2026-10-30.

### Summary
- Removed unreferenced repo-root files: `phase1-preview.png`, `phase2-preview.png`, `pr.html`, `pr.plain.html`, and the old `fragments/` folder (7 header-menu/landing-page fragments; the header uses `content/nav`).
- Content pages are not in git; the old-structure local orphans are tracked in the URL restructure entry under Open PRs.

### Testing
- [x] `git grep` finds no references to any removed file.