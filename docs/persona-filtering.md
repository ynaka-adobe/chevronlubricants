# Persona filtering: authoring and delivery

The US site uses two related preferences: a **B2B persona** for collection
filtering and a **marketing persona** for campaign fragments. These preferences
do not change the persona metadata describing a page.

## Exact B2B labels

Copy these strings exactly, including casing and the ampersand:

| B2B persona / content key | Existing Target profile value |
| --- | --- |
| Technical Evaluator | `1` |
| Business Decision Maker | `2` |
| Procurement & Sourcing Manager | `3` |
| Industry Researcher | `4` |

Use the full labels in metadata, card cells, resource sheets and the scheduler's
coarse `persona` column. Numeric values remain supported as visitor URL aliases
and are sent only at the existing, separately consented Target boundary.
Do not use numeric keys instead of the canonical labels in new authored content.

## Automatic visitor personalization

Persona is resolved automatically from the URL and the current tab's saved
preferences. There is **no public persona dropdown, segmented control or All
button**. This user-directed behavior supersedes the original backlog's
selector requirement and service/product selector-presence guard. Do not add a
Persona Filter table: existing copies are removed during decoration, including
their child controls, rather than CSS-hiding focusable UI.

- `?p=oem` selects a marketing slug and its B2B parent from the author map.
- `?p=Technical%20Evaluator` selects the coarse role only, retaining the current
  marketing slug.
- `?persona=Technical%20Evaluator`, `?p=1` and `?persona=1` are compatibility
  aliases. When both parameters exist, the first valid `p` wins; otherwise a
  valid `persona` is used.
- No saved role means unrestricted content, not a visitor-facing All control.
- Without either parameter, the current tab's saved preferences are restored.
  Without a preference, all collection items remain eligible.
- Unknown inputs log a diagnostic and leave the current page unfiltered without
  replacing a saved valid preference. A later query-free navigation can restore
  that saved choice. An unknown `p` does not defeat a valid `persona` alias.

The exact sessionStorage keys are `b2bPersona` and `marketingPersona`.
These are functional **per-tab** preferences, available without optional
measurement consent. They survive same-tab navigation/reload, not deliberate
cross-tab synchronization. Duplicating a tab or opening through an opener can
copy its initial storage; subsequent changes remain independent. Browsers can
restore tab storage when restoring sessions: browser close is not a guaranteed
expiry boundary. Different hostnames have separate storage.

There is no persona localStorage fallback or shared persona cookie. The old
`chevron-target-persona` cookie is cleared, not migrated. If tab storage is
blocked, the selection applies only to the current page with an explicit
diagnostic and page-only status.

## Map marketing slugs without a code deploy

Edit and then **Preview and Publish** the DA sheet
`/en-us/home/schedules/persona-map.json`:

| marketingPersona | b2bPersona |
| --- | --- |
| oem | Technical Evaluator |
| fleet-managers | Business Decision Maker |
| safety | Procurement & Sourcing Manager |

These are examples of the provisioned sheet, not a hardcoded JavaScript map.
The map is read at most once per page when a marketing input needs resolution.
Use unique lowercase, hyphenated slugs. Its special rollup value `default`
means no coarse B2B restriction; the marketing slug can still select a fragment.
Invalid/duplicate rows and unavailable sheets produce diagnostics, not invented
role mappings. Existing named deep links work when their slug is in this sheet.

## Author Sidekick Persona app

The **Persona** Sidekick button opens an author-only palette on preview, live,
and the Chevron custom domain. It adapts
[DuPont's Persona app](https://github.com/ynaka-adobe/dupont/blob/ebc0c90714f47aa690c88c3d4ffd6a399fe44ce0/tools/persona/persona.js)
to Chevron's existing two-tier model. The replacement uses the source's dark
profile-card layout, role descriptions, interest bars, intent radar, summary,
metrics and trajectory. These static demonstration profiles/scores are clearly
labeled **illustrative, not measured visitor data**.

At the user's explicit choice, **Logged in** and **Region** remain visible as
**app-only simulations**: they update only a preview label inside this iframe,
never authenticate anyone, grant consent, change the page URL, write a
`demoProfile`/cookie, or influence page filtering, Analytics or Target. They are
not persisted across page reloads. Reset also clears these local controls.
The source's cross-tab storage/cookie model and `p`/`li`/`region` navigation are
not imported; Apply still uses Chevron's canonical shared per-tab selection.
No controls or app downloads are added to ordinary visitor pages.

The palette reads the content page's shared helpers through a source- and
origin-checked message bridge. This works when Sidekick serves the palette from
the preview host while the content page uses a different live/custom origin;
the app never reads or writes the iframe origin's persona storage. Sidekick's
`referrer` parameter supplies the parent origin; the bridge reports the actual
current page URL, retaining `.html`, encoded paths, and fragments.

Changing controls previews the selection without modifying the page. Choosing
a marketing slug selects its author-map B2B rollup; a subsequent manual B2B
choice can override that rollup while retaining the marketing tier, matching
the existing coarse-selection behavior. **Apply** updates both tiers atomically,
using the same `persona:change` event and tab storage as visitor URL inputs.
Existing card/hero/scheduled-fragment filtering and Insights/Target listeners
therefore receive the same canonical state.

Apply removes only `p`/`persona` URL aliases so a stale query cannot undo the
selection on reload. Other raw query bytes, duplicate parameters, `.html`
suffixes, encoded product paths and hashes are preserved. The page does not
navigate, and the palette stays open. A query-free reload restores the saved
tab preference. **Reset** clears both tiers; **Refresh** rereads current state.
If storage is unavailable the palette explicitly reports a page-only preference.

The displayed Analytics and Personalization consent values are read-only.
Selecting a persona is a functional preference, not consent: no optional
Analytics or numeric Target profile transmission occurs until the respective
existing consent is granted. The app does not alter Target audiences/activities
or DA content. Native Sidekick handles closing/reopening its palette.

After deploying an update, refresh the extension's project configuration and
hard-reload an already-open content page if its static modules are cached.
The final Sidekick entries are **Generate with AI** and **Persona**; the old
standalone **Generate Variations** link was removed at the user's request.

## Inline cards: explicit cell or automatic inheritance

Applies to **cards-resource, cards-insights, cards-service, cards-products** and
**carousel-square**. Resolution is locked in this order:

1. A final `persona:` cell, even an empty one, overrides inheritance.
2. Otherwise, the primary internal linked page supplies its indexed persona.
3. Otherwise, the card has no restriction and always remains eligible.

### Worked example: override a linked page

Before, an ordinary card links to an internal learning page:

| Image cell | Title/body cell |
| --- | --- |
| Existing image | Existing title, description and link to an internal learning page |

If that page's published metadata is `Technical Evaluator`, the card inherits
that role automatically. Authors do not add another cell for inheritance.

After, add one final cell to override the linked page:

| Image cell | Title/body cell | Final cell |
| --- | --- | --- |
| Same image | Same title, description and link | `persona: Business Decision Maker, Procurement & Sourcing Manager` |

The card now matches either of those two roles, regardless of the linked
page's Technical Evaluator tag. The final cell is removed during decoration:
its text is not part of the rendered title, description or CTA.
The resolved labels are available as `data-persona` on the rendered item.

An empty `persona:` cell explicitly makes a card unrestricted, even when its
link points to a tagged page. A misspelled nonempty label does not match a
canonical role; it does not crash the block. An unrestricted visitor still sees that card.

External PDFs, videos and other sites cannot inherit. Use the final cell to
tag them, or leave them unrestricted. Inheritance uses the primary text link,
or the image link if no text link exists; queries/fragments, `.html`,
`/content` and trailing slashes are normalized. Same-project preview/live
URLs and the Chevron custom domain are recognized as internal.

### Page metadata and the query index

In the linked page's DA Metadata table, add:

| Metadata | Value |
| --- | --- |
| persona | Technical Evaluator, Procurement & Sourcing Manager |

Preview and Publish the page, then confirm its delivered head contains
`<meta name="persona" content="Technical Evaluator, Procurement &amp; Sourcing Manager">`.
The HTML escaping of `&` is normal; the browser reads the canonical label.
The `helix-query.yaml` property exposes the comma-separated string as `persona`
in `/query-index.json`. Inheritance requires **published metadata and a current
index**, not just a saved DA draft or a deployed YAML change.

The index is fetched once per page (`/query-index.json?limit=1000`), never once
per card. Missing, incomplete or unpopulated index data is diagnosed; cards
without an explicit restriction remain visible. Inspect the console diagnostics
and actual indexed row when inheritance is missing. Do not guess its role.

## Collection-specific behavior

**cards-filterable** reads the persona column directly from its configured JSON
source. Automatic persona matching is AND-combined with existing visitor-selectable
brand/type facets; an unrestricted persona removes only the persona constraint,
not checked facets.
Multiple labels in one row are comma-separated. A missing persona is unrestricted.
This block does not inherit from linked pages.

**DA naming compatibility:** a table headed `Cards (filterable)` produces
`cards filterable` classes rather than the hyphenated block name. The loader
routes that exact variant to `cards-filterable`. Its inline rows retain their
full headings, descriptions, bullet lists and CTAs, expose no persona selector,
and use explicit-cell/internal-index inheritance. Descriptive copy is not
interpreted as brand/type tags. A JSON-linked table continues to use the
sheet-driven brand/type facets described above. Other Cards variants are not
remapped.

The existing `/en-us/home/learning/resources.json` is a separately authored
resource sheet, not the site query index. It needs its **own** `persona` column
and correctly authored labels. Adding a property to `helix-query.yaml` does not
tag these rows, especially external links.

**cards-resource/cards-insights** apply the active role and show a status message
when no items match. **cards-service/cards-products** automatically personalize
from the same state without a selector-presence requirement. Product-grid See all limits still apply
to the eligible items. **carousel-square** excludes nonmatches from navigation,
recounts its dots and preserves keyboard/swipe behavior; unrestricted slides
remain eligible. No automatic rotation is introduced.

Filtering progressively enhances authored inline cards: without JavaScript,
no persona code hides them. JSON-fed grids retain their pre-existing source-link
fallback; loading and rendering those remote rows still requires JavaScript.
Other single-item blocks and non-US experiences are outside this change, except
the explicitly user-approved hero-banner extension below.

## Hero banner variations (user-approved extension)

Author a **hero-banner (filterable)** table. Each row is a complete variation:
the first cell contains the heading, paragraph and any existing links; the final
cell contains the B2B ID. This is automatic personalization, not a public filter.
The loader recognizes the delivered `hero-banner filterable` classes directly,
without using the unrelated hero-overlay layout.

| Complete variation content | Final metadata cell |
| --- | --- |
| H1 and paragraph for Technical Evaluator | `1` |
| H1 and paragraph for Business Decision Maker | `2` |
| H1 and paragraph for Procurement & Sourcing Manager | `3` |
| H1 and paragraph for Industry Researcher | `4` |
| Populated general-purpose H1 and paragraph | Empty, or omit the metadata cell |

Bare comma-separated IDs such as `1, 3` and the optional `persona: 1, 3` form
also work. The numeric mapping uses the same canonical persona resolver as URL
selection; there is no separate persona store. Metadata cells are removed during
decoration and never become part of the rendered heading/body.

The renderer shows the first **populated** row matching the current B2B role,
otherwise the first populated untagged default. Empty cells, blank paragraphs
and empty headings do not make a variation populated. With no selected role
and no default, the first populated row is shown as a fail-open fallback.
With a selected role but neither a populated match nor a populated default,
the hero is hidden and an explicit authoring diagnostic is logged; it never
substitutes a different role's targeted copy. Add an untagged default if the hero
must remain visible for every visitor.

Saved DA edits can differ from preview content. Populate and Preview the desired
rows before expecting their role-specific copy. This code deployment does not
publish the draft or fill in the suggestions below. Existing heading/link nodes remain
intact, and only the active variation participates in keyboard navigation and
the accessibility tree. Without JavaScript the authored content remains visible;
metadata removal and variation selection require JavaScript.

### Suggested copy for author review

| ID / role | Suggested H1 | Suggested paragraph |
| --- | --- | --- |
| 1 / Technical Evaluator | Find the Right Lubricant for Your Equipment | Explore product specifications, performance data, and technical resources to assess lubricant suitability for your equipment and operating conditions. |
| 2 / Business Decision Maker | Keep Your Business Moving Forward | Explore lubrication solutions and expert insights to support equipment reliability, manage operating costs, and plan for long-term performance. |
| 3 / Procurement & Sourcing Manager | Source Lubricants with Greater Confidence | Compare product information, review supporting documentation, and find supply options that meet your operational and procurement requirements. |
| 4 / Industry Researcher | Explore Lubrication Insights for Your Industry | Discover articles, application guidance, and product information to understand lubrication technologies and industry challenges. |
| Untagged default | Lubricant Solutions Built for Your Business | Explore product information, technical resources, and expert insights for your equipment, operations, and industry. |

Keep the existing industry links in each variation if useful, preserving their
real destinations. The current `href="#"` entries are placeholders: the hero does
not implement industry filtering or turn them into real destination pages.
Suggested replacement for the separate introductory sentence "Select a persona
above..." is: **"Explore lubrication solutions and resources for your equipment,
operations, and industry."** This is copy for review, not an automatic DA edit.

## Fragment schedules

`/en-us/home/schedules/landing-fragment.json` has `marketingPersona` (fine slug),
`persona` (canonical coarse label), `start`, `end` and `fragment` columns.
The scheduler tries marketing matches first, then coarse matches, then default.
Within each tier, the existing date-window rules and undated fallback apply.
`?start=` remains available for schedule testing.

A coarse-only choice intentionally leaves the marketing tier unchanged:
an earlier `oem` campaign can therefore continue to win fragment selection even
after a coarse role change. Clearing both session preferences clears that campaign choice. A rendered
default or fetch-fallback fragment never changes the selected visitor role.
Existing legacy sheets without a marketing column can still match their named
rows through the saved marketing slug.

## Consent, analytics and existing Target compatibility

After **Analytics** permission, a real selection change emits one local event:

```js
{ event: 'persona-filter', persona: 'Technical Evaluator', page: location.pathname }
```

A cleared role uses `persona: null`. Unchanged selections and query-free restoration do not
emit another selection event. Pre-consent changes are not queued or replayed.
The existing consent-gated instrumentation owns this hook; blocks do not call
AppMeasurement. Normal local events distinguish actual `page.persona` metadata
from `visitor.b2bPersona` / `visitor.marketingPersona`. No eVar7, report-suite,
Tags rule or AEP ingestion is provisioned by this feature.

The existing Target client separately requires **Personalization** permission
and a current canonical B2B role. It maps the role to the string digit in the
first table before the initial and subsequent eligible requests
(`execute.pageLoad.profileParameters.persona`, and `profile.persona` through
`targetPageParamsAll`). Audience/activity configuration is unchanged.
GPC, sale opt-out and revocation stop optional Target delivery; revocation
does not delete the functional per-tab content preference.

Target's identity cookies are still shared across same-origin tabs.
Different per-tab choices do **not** create separate server visitor profiles:
each request supplies that tab's current role, and the retained server attribute
is last-writer-wins. Target can retain it after tab storage ends. Without a
current local role this client does not evaluate Target, and it does not write
an unapproved expiry/sentinel value. A successful response proves delivery,
not independent audience membership or Analytics reporting configuration.
