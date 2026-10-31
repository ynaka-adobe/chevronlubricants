# Author Kit
For projects that want a few more batteries. Built by the team who brought you da.live and adobe.com.

## Chevron Edge Commerce pilot

Production Edge Commerce access is provisioned for org `ynaka-adobe`, site
`chevronlubricants`, at `https://api.adobecommerce.live`.

The approved isolated pilot is
[Delo 600 ADF SAE 15W-40](https://main--chevronlubricants--ynaka-adobe.aem.network/edge-commerce/products/delo-600-adf-15w-40).
It uses the product name, image and three benefit statements already published
on `/home`. The linked original product detail page was not published when the
pilot was created. `demo-delo-600-adf-15w-40` is a demo catalog identifier, not a
manufacturer SKU. No price, availability, checkout or payment integration was
added. The pilot has `noindex, nofollow` metadata.

### Routing and migration isolation

The initial pilot added these two exact Product Bus routes. The Delo migrations
below add their own finite product and image paths; no wildcard product/category
routes were added:

```json
{
  "mixerConfig": {
    "patterns": {
      "/edge-commerce/products/delo-600-adf-15w-40": "adobe_productbus",
      "/edge-commerce/products/media_d8320c16ba6e000b2cb939cd08c2fa9d06c5a5b1.png": "adobe_productbus"
    },
    "backends": {
      "adobe_productbus": {
        "origin": "pipeline-cloudflare.adobecommerce.live",
        "pathPrefix": "/ynaka-adobe/chevronlubricants/main/"
      }
    }
  }
}
```

The image route is necessary because Product Bus generates a media URL separate
from the product URL. If the product image changes, inspect its rendered media
URL and update only the pilot's media routing with approval.

EMA-owned blocks, styles, scripts, authored content and existing product/category
routes were not changed. The homepage, navigation and original product-route
responses remained unchanged on AEM Network and the custom domain after setup.
The catalog record, server-rendered product content and image each returned
successful responses independently.

### Custom-domain delivery

`chevronlubricants.ynaka-adobe.com` currently has a CNAME to
`cdn.adobeaemcloud.com`. The original pilot now returns HTTP 200 on AEM Network
and the custom domain (confirmed 2026-10-30). New products still need their own
scoped CDN rules; this does not enable every product URL automatically.

The user approved a matching two-exact-path CDN change and its deployment in
[`ynaka-adobe/AEM-p154856`](https://github.com/ynaka-adobe/AEM-p154856),
`config-eds/cdn.yaml`. The prepared commit is
`25135abf687a32bb28f6d21adaa08c26ce7ba145`, now confirmed on remote `main`
after the user's push. The agent's earlier push was rejected by GitHub with
HTTP 403; the user resolved that publishing step manually.
It follows Parker's origin-selection pattern, matches only the Chevron custom
domain and the two pilot paths, and selects
`main--chevronlubricants--ynaka-adobe.aem.network`. `forwardHost: false` uses that
backend hostname for Host; the origin domain also supplies TLS SNI and
certificate validation. The matching rule explicitly sets
`X-Forwarded-Host: chevronlubricants.ynaka-adobe.com` and skips CDN caching.
No site-wide origin switch, DNS change or Edge Function deployment is needed.

Cloud Manager program `154856`, Edge Delivery configuration pipeline `60291285`,
uses GitHub repository `AEM-p154856`, branch `main`, code location `/config-eds`
and deployment environment `EDGE-ENVIRONMENT-PUBLISH`. Its trigger is **On Git
Changes**, so a push to the configured source branch can start deployment.
Check for concurrent runs and source changes before pushing. Use this pipeline,
not the similarly named Publish Delivery or full-stack pipelines.

After deployment, check the product HTML, generated image and image query
variants on the custom domain, plus existing-page and nonmatching-route
baselines. A completed pipeline alone is not proof that the pilot works.

Execution `9439178` reports successful Edge Delivery deployment at
2026-10-29 21:23:05 PDT. Initial requests after deployment still returned HTTP
404; a later independent check on 2026-10-30 confirmed the original pilot
working on the custom domain. Do not equate pipeline completion with successful
delivery: verify the actual product and image after each routing deployment.

### Delo Syn-Trans XE migration

The user explicitly requested this source-to-destination mapping and selected
Edge Commerce, not a DA/EMA-authored product page:

- Source: https://www.chevronlubricants.com/en_us/home/products/delo-syn-trans-xe.html
- Destination: https://chevronlubricants.ynaka-adobe.com/en-us/home/products/delo-syn-trans-xe
- Working Network preview: https://main--chevronlubricants--ynaka-adobe.aem.network/en-us/home/products/delo-syn-trans-xe

The stored product preserves the full introduction, all eight equipment
entries/icons, six benefits, applications (including the warning not to use
this fluid in axles), three packaging SKUs, PDS/SDS links, protection-diagram
link, distributor link and advisor content. Existing source support/document
links remain absolute; no unrelated destination pages were invented.
`delo-syn-trans-xe-sae-75w-90` is the page-level catalog identifier; actual
packaging identifiers `223079361`, `223079870` and `223079953` remain separately
recorded and visible. No price, availability or checkout was added.

The catalog record and full server-rendered content are verified. The product
image is ingested into Product Bus; supporting equipment/advisor icons still
use their existing public source URLs. Live Helix `public.json` was merged with
these additional exact routes:

```text
/en-us/home/products/delo-syn-trans-xe
/en-us/home/products/media_8c90e2b40526fb1677b313d1c434513f5dcb7d8c.png
```

Both use the existing `adobe_productbus` backend. No existing product or pilot
was removed or overwritten. The destination's `en-us` and suffixless path are
intentional user requirements, not a global normalization policy.

Custom-domain delivery for this product now works (confirmed 2026-10-30).
Its scoped CDN commit `55bbbd55cce48b303697a9e5ec19730506a84218` is confirmed on
`AEM-p154856/main`; it reuses the existing Network origin. Existing homepage
and pilot response statuses and shared script/style hashes were unchanged by
the catalog/Helix additions. The pre-existing `/home` HTTP 404 observed during
this migration is not part of this product change.

### Delo catalog migration

The user extended the Edge Commerce migration to all products linked from
[the Delo brand listing](https://www.chevronlubricants.com/en_us/home/products/by_brand/delo.html?src-tab=products).
The inventory contains **40 available product pages**: 39 newly created catalog
records plus the existing Syn-Trans XE, which was read back and left unchanged.
The complete source-to-destination inventory is in `source_website.md`.
Destinations use `/en-us/home/products/{source-slug}`, without `.html`, following
the established product destination convention. The source's double-hyphen THF
slug is the sole user-approved exception: `delo-syn-thf-xc`.

All available products preserve their source introductions, equipment entries
and icons, benefit content, applications and warnings, manufacturer packaging
identifiers, document/diagram links, distributor links and unique service cards.
Source formatting and links in these sections are retained as semantic HTML;
responsive duplicate service cards are deduplicated. Product images are
ingested into Product Bus. Supporting icons and linked documents remain at
their public source URLs. Page-level catalog identifiers use destination slugs,
not invented manufacturer SKUs. No prices, availability or checkout were added.

Every product was independently read back from the catalog and rendered on
AEM Network with its full source-section text, document links and exact
custom-domain canonical. All 39 unique generated images return HTTP 200 both
normally and with the browser image query; all 26 unique supporting images
return HTTP 200. Existing homepage/pilot/Syn-Trans and nonmatching route
responses, and shared script/style hashes, are unchanged.

The 40 product and 39 unique media paths are individually mapped to the existing
`adobe_productbus` backend in live Helix `public.json`, preserving all previous
settings. Neither the EMA-owned Delo listing nor category pages, content,
scripts, blocks or styles were edited. One listing link,
`delo-syn-gear-xdm-sae-80w-140.html`, returns HTTP 404 at the source and was
excluded rather than inventing content; the available combined XDM page was
migrated.

The 39 new product URLs still return HTTP 404 on the custom domain until their
separate exact-path CDN configuration is deployed. The existing Syn-Trans XE
product remains HTTP 200. The coordinated CDN change adds only uncovered
product/image paths, not a hierarchy wildcard; do not treat successful Network
rendering as completed custom-domain delivery.

The prepared CDN commit is
`39b8cc259deff17253f53857d0a09602be463ae5`, based on published `55bbbd55`.
It adds the 77 uncovered paths (39 products, 38 images); the existing Syn-Trans
selector already covers the other two inventory paths. Agent repository access
reports `push: false`, so an authorized user must publish it after confirming
configuration pipeline `60291285` is idle:

```bash
git -C /Users/ynaka/copilot-worktrees/AEM-p154856/ynaka-adobe-automatic-goggles \
  push origin 39b8cc259deff17253f53857d0a09602be463ae5:refs/heads/main
```

Do not force-push if the remote advances or a protection rule rejects the push.
The configured On Git Changes trigger can deploy this commit automatically.

### Delo product detail presentation

Catalog ingestion preserves product content but does not reproduce the source
detail-page design by itself. After comparing the generic stacked output with
the source, the user approved a shared detail template for all 40 confirmed Delo
products.

`scripts/commerce-product.js` decorates the existing public Product Bus HTML;
`styles/commerce-product.css` styles only its `.commerce-product` subtree.
The shared page loader has a small, error-logged hook gated on SKU metadata.
The renderer additionally requires an exact inventory path, matching catalog
SKU and structured-data script. Unknown products, categories, unlisted brands and
DA-authored pages without that metadata retain their existing rendering.
No browser ingestion credential, catalog fetch, route rewrite or DA product
block change is required.

The template restores the source's image/details columns, category label,
lead paragraph, PDF panel, protection-diagram area, distributor CTA, sticky
section navigation, equipment carousel, blue benefit cards and service cards.
Mobile puts the category/title before the image and description. Existing
source text, links, warnings, packaging identifiers, canonical and structured
data remain intact. Image enlargement supports a native dialog and Escape;
equipment controls and anchor links remain keyboard accessible.

The EMA-owned header/footer, `blocks/product`, shared brand tokens and global
fonts are unchanged. The project still uses its existing Montserrat/fallback
fonts rather than copying the source's licensed Gotham Narrow fonts; this is
not a claim of pixel-identical typography. Concurrent EMA accessibility and
loading fixes must remain in the page loader when this change is integrated.

The Delo renderer is present in current repository main, and the exact Delo
CDN catalog configuration is published. Representative custom-domain Delo
product/media requests return 200; these checks do not identify the latest
Cloud Manager execution or establish its current idle state.

### Havoline catalog and detail presentation

The authorized Havoline products tab has 17 distinct available products.
All 17 records were created after immediate absent-record checks, then read
back in full. Their 17 product and 17 generated-media paths were merged into
the existing Helix configuration without changing unrelated settings.
Network pages preserve the checked source text, documents, actions, links and
media; all 49 generated/supporting image requests succeeded.

The finite renderer inventory now includes these 17 paths, retaining exact SKU
and structured-data gating. Havoline uses source red for its title and hero
actions, source blue benefit cards, and separate Self Services/Pro Services
groups. Delo presentation and EMA-authored pages remain unchanged.
LIFELONG retains its source Walmart link; no store checkout is added.
CVT+ retains the source's malformed distributor URL and self-link labeled
Buy Online rather than inventing purchase behavior.

Custom-domain Havoline delivery is verified: all 17 product pages and all
17 generated images return 200, including each image's `format=webply` query.
The existing CDN session published only the exact 34-path manifest in
`a9a7072`, after deployment approval and fresh user-confirmed pipeline idle.
Live browser checks preserve source content and category across all 17
Havoline and all 40 Delo pages; existing-page and excluded-path controls pass.
The Havoline renderer is published in main commit `15b5614`; decompressed
custom-domain JavaScript and CSS match the committed files.
The user subsequently observed the pipeline Running; final Cloud Manager
execution status and deployed revision remain unverified by this session.

### Techron catalog and detail presentation

The supplied Techron listing links to four distinct products: Complete Fuel
System Cleaner, Diesel, Fuel Injector Cleaner and High Mileage Fuel System
Cleaner. All four records were created after immediate absent-record checks
and independently read back. Eight exact Helix product/media routes were
merged with all prior configuration preserved. Network content and all 15
generated/supporting image requests are verified.

The finite detail inventory includes only these four Techron paths. The shared
retailer-action layout uses Techron's source gray title/buttons and blue benefit
cards, retaining descriptions, equipment, documents, applications, packaging
identifiers and Self Services. Latest EMA image-loading fixes and all previous
Delo/Havoline rendering remain intact.

Custom-domain delivery is verified for all four Techron products and images,
including plain and `format=webply` image queries. The CDN session published
only the exact eight-path change in `b5eb9d9`, after fresh Techron-specific
deployment approval, user-confirmed pipeline `60291285` idle and concurrency
checks. Live layout/content checks across all 61 migrated products and
existing-page/negative-path controls pass. Renderer code is published in
`02b8cf9`. Final Cloud Manager execution status and deployed revision remain
unverified by this session. No prices, checkout, broad routing or listing-page
changes are included.

### Credentials and ongoing ingestion

The Chevron-specific ingestion service token has only `catalog:read` and
`catalog:write`, expires **2026-11-29 03:31:25 UTC**, and is stored locally in
`~/.config/edge-commerce/ynaka-adobe/chevronlubricants.production-ingestion.json`
with mode `0600`, outside source control. It is not a browser credential or a
shared/deployed secret. Renew or rotate it through a production administrator
before expiry. Administrator sessions expire after 24 hours. Parker's service
token is site-scoped and must not be used for Chevron ingestion.

For future updates, GET the existing catalog record before PUT: PUT replaces
the entire record. The catalog API uses Bearer authorization; Helix Admin
configuration uses `X-Auth-Token` with an authorized org admin key. GET and merge
the current `public.json` before any configuration update; never replace
unrelated settings with the example above. Validate catalog data separately
from rendering on `.aem.network`, not `.aem.page` or `.aem.live`.

To disable the pilot, read the current `public.json`, remove only the two exact
pilot patterns, and remove `adobe_productbus` only if no remaining patterns use
it. Preserve every unrelated setting. The catalog record can remain stored
without affecting existing routes. To roll back the CDN change, remove only its
Chevron-specific selector, and remove the origin only when no remaining
selector references it, then redeploy through the confirmed
configuration pipeline, preserving concurrent shared-config changes. No pull
request was created.

References: [getting started](https://main--edge-commerce-docs--aemsites.aem.page/getting-started),
[administrative access](https://main--edge-commerce-docs--aemsites.aem.page/authentication/setup),
[AEM Network/CDN routing](https://main--edge-commerce-docs--aemsites.aem.page/network).

## Getting started

### 1. Github
1. Use this template to make a new repo.
1. Install [AEM Code Sync](https://da.live/bot).

### 2. DA content
1. Browse to https://da.live/start.
2. Follow the steps.

### 3. Local development
1. Clone your new repo to your computer.
1. Install the AEM CLI using your terminal: `sudo npm install -g @adobe/aem-cli`
1. Start the AEM CLI: `aem up`.
1. Open the `{repo}` folder in your favorite code editor and buil something.
1. **Recommended:** Install common npm packages like linting and testing: `npm i`.

## Features

### Localization & globalization
* Language only support - Ex: en, de, hi, ja
* Region only support - Ex: en-us, en-ca, de-de, de-ch
* Hybrid support - Ex: en, en-us, de, de-ch, de-at
* Fragment-based localized 404s
* Localized Header & Footer
* Do not translate support (#_dnt)

### Flexible section authoring
* Optional containers to constrain content
* Grids: 1-6
* Columns: 1-12
* Color scheme: light, dark
* Gap: xs, s, m, l, xl, xxl
* Spacing: xs, s, m, l, xl, xxl
* Background: token / image / color / gradient

### Base content
* Universal buttons w/ extensive styles
* Images w/ retina breakpoint
* Color scheme support: light, dark
* Modern favicon support
* New window support
* Deep link support
* Modal support

### Header and footer content
* Brand - First link in header
* Main Menu - First list in header
* Actions - Last section of header
* Menu & mega menu support
* Disable header/footer via meta props

### Scheduled content
* Schedule content using spreadsheets

### Sidekick & pre-production
* Quick Edit
* Extensible plumbing for plugins
* Schedule simulator
* Convert production links to relative

### Performance
* Extensible LCP detection

### Developer tools
* Environment detection
* Extensible logging (console, coralogix, splunk, etc.)
* Buildless reactive framework support (Lit)
* Hash utils patterns (#_blank, #_dnt, etc)
* Modern CSS scoping & nesting
* AEM Operational Telemetry

### Operations
* Cloudflare Worker reference implementation

## Patterns
### Page
A page is what holds your content. It can be styled using a metadata property called `template` which will load styles that apply to the entire page.

### Section
A section is a sub-section of your page. It can be styled using a `section-metadata` block. A section will control the layout of blocks.

### Block
Blocks are children of sections. A block adds visual context to parts of a page.

### Auto Block
An auto block is a block generated from a pre-defined piece of content. Often times from a link that matches a particular pattern. Link-based auto blocks can be helpful when additional nesting of content is required.

### Default content
Default content is content that lives outside a block.

## Design System

### Spacing & Gap
XS, S, M, L, XL, XXL

### Emphasis
quiet, default, strong, negative

### Buttons
accent, primary, secondary, negative
(w/ outline variations)

### Columns
1 - 12

### Grid
1 - 6

### Color tokens
blue, gray, green, magenta, organge, red, purple, yellow
(w/ 100-900 variations)

### Color schemes
light, dark
