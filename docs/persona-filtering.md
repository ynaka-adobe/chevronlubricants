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

## Select a visitor persona

Add a **Persona Filter** block in DA. Its accessible dropdown offers All and
the four labels; an empty block is sufficient. Multiple controls on one page
reflect the same selection. The control preserves unrelated URL parameters
and the fragment identifier.

- `?p=oem` selects a marketing slug and its B2B parent from the author map.
- `?p=Technical%20Evaluator` selects the coarse role only, retaining the current
  marketing slug. Dropdown changes behave the same way.
- `?persona=Technical%20Evaluator`, `?p=1` and `?persona=1` are compatibility
  aliases. When both parameters exist, the first valid `p` wins; otherwise a
  valid `persona` is used.
- All clears both preferences and removes only `p` and `persona` from the URL.
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
canonical role; it does not crash the block. All still shows that card.

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
source and includes the shared selector. Persona is AND-combined with existing
brand/type facets; All removes only the persona constraint, not checked facets.
Multiple labels in one row are comma-separated. A missing persona is unrestricted.
This block does not inherit from linked pages.

**DA naming compatibility:** a table headed `Cards (filterable)` produces
`cards filterable` classes rather than the hyphenated block name. The loader
routes that exact variant to `cards-filterable`. Its inline rows retain their
full headings, descriptions, bullet lists and CTAs, include the shared selector,
and use explicit-cell/internal-index inheritance. Descriptive copy is not
interpreted as brand/type tags. A JSON-linked table continues to use the
sheet-driven brand/type facets described above. Other Cards variants are not
remapped.

The existing `/en-us/home/learning/resources.json` is a separately authored
resource sheet, not the site query index. It needs its **own** `persona` column
and correctly authored labels. Adding a property to `helix-query.yaml` does not
tag these rows, especially external links.

**cards-resource/cards-insights** apply the active role and show a status message
when no items match. **cards-service/cards-products** remain unfiltered unless
a Persona Filter is present on the page. Product-grid See all limits still apply
to the eligible items. **carousel-square** excludes nonmatches from navigation,
recounts its dots and preserves keyboard/swipe behavior; unrestricted slides
remain eligible. No automatic rotation is introduced.

Filtering progressively enhances authored inline cards: without JavaScript,
no persona code hides them. JSON-fed grids retain their pre-existing source-link
fallback; loading and rendering those remote rows still requires JavaScript.
Single-item blocks and non-US experiences are outside this change.

## Fragment schedules

`/en-us/home/schedules/landing-fragment.json` has `marketingPersona` (fine slug),
`persona` (canonical coarse label), `start`, `end` and `fragment` columns.
The scheduler tries marketing matches first, then coarse matches, then default.
Within each tier, the existing date-window rules and undated fallback apply.
`?start=` remains available for schedule testing.

A coarse-only choice intentionally leaves the marketing tier unchanged:
an earlier `oem` campaign can therefore continue to win fragment selection even
after a coarse dropdown change. All clears that campaign choice. A rendered
default or fetch-fallback fragment never changes the selected visitor role.
Existing legacy sheets without a marketing column can still match their named
rows through the saved marketing slug.

## Consent, analytics and existing Target compatibility

After **Analytics** permission, a real selection change emits one local event:

```js
{ event: 'persona-filter', persona: 'Technical Evaluator', page: location.pathname }
```

All uses `persona: null`. Unchanged selections and query-free restoration do not
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
