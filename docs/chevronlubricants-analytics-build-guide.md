# Chevron Lubricants — Adobe Analytics Build Guide

Analytics implementation guide for the Chevron Lubricants Edge Delivery (EDS) site
`chevronlubricants.com` (Edge: `https://chevronlubricants.ynaka-adobe.com/`, repo
`github.com/ynaka-adobe/chevronlubricants`). Models the measurement design on the
**3M TEBG** report suite (`acsmarketingtebg`) so Chevron reporting lines up 1:1 with TEBG.

**Scope note:** The report suite `acsmarketingb2bcontentexperiences` (Site Title
"B2B Content Led Experience") has been created as a duplicate of 3M. However, as of
this guide it is a **generic template suite** — the content-experience variables and
events are **not yet configured**. Section 2 is therefore both the target spec **and**
a required configuration step: complete Section 2 before wiring up tracking.

This build is scoped to **US only**. Other locales/templates use different CNAMEs and
a non-traditional (non-locale/language) design; they are out of scope here and should
be handled as separate builds.

Hand-off: this guide is written to be executed by GitHub Copilot against the
`ynaka-adobe/chevronlubricants` repo (instrumentation) plus the Adobe Analytics admin
UI / Tags (suite config + collection).

---

## 1. Architecture overview

Chevron Lubricants runs on **AEM Edge Delivery Services** and is **Adobe Analytics-only**
(no AEP, no Target). A lightweight client dataLayer emits **block-level engagement events**
sent to Adobe Analytics via **AppMeasurement + Tags**. The unit of measurement is the
**block** (EDS calls it a block; Analytics calls it a *Component*). The measurement
*model* mirrors the 3M TEBG report suite so reporting lines up; the *block set* is
Chevron's own and is discovered generically at runtime (Section 4).

```
EDS page → block decorate() → pushes to window.adobeDataLayer
                 │
   IntersectionObserver ─────────── component impression
   click listener ───────────────── component / CTA click
                 ▼
   AppMeasurement (s.tl / s.t) ──→ Adobe Analytics (acsmarketingb2bcontentexperiences)
```

Every event carries a **Component ID** (eVar3/prop3) and **Block Name** (eVar4/prop4),
plus **Position** (eVar5) and **Section Index** (eVar6) — the join keys between the DOM,
the dataLayer, and the Analytics variable map.

> Migration status: the Edge site is ~75% migrated. Because instrumentation is generic
> (Section 6 auto-discovers blocks from their class list), it works on partially-migrated
> templates and automatically covers blocks added as migration completes — no per-block
> code changes.

---

## 2. Report suite configuration (REQUIRED — `acsmarketingb2bcontentexperiences`)

**This is a prerequisite, not just a spec.** I verified `acsmarketingb2bcontentexperiences`
live: it currently holds generic/default variables (eVar1 "Internal Promotion", eVar2
"Internal Search Terms", eVar3 "Self-Service Event Type"; props at default names; **no**
event1–event6). The values below are the **exact live configuration of 3M TEBG**
(`acsmarketingtebg`) and are the target. Configure the new suite to match **before**
wiring up tracking (Analytics → Admin → Report Suites → Edit Settings, and
Components → Calculated Metrics).

> To honor "reuse existing values to minimize change," the guide keeps the **same slot
> numbers** as TEBG (event1–6, eVar1–6/10–14, prop1/3/4/10). You are renaming/enabling
> these existing slots, not allocating new numbers.

### 2.1 Success Events (Admin → Edit Settings → Conversion → Success Events)
Set type **Counter**, polarity **Up**. These do not exist yet — enable and name them.

| Event | Name |
|-------|------|
| event1 | Component Impression |
| event2 | CTA Click |
| event3 | Download |
| event4 | Form Start |
| event5 | Form Submit |
| event6 | Scroll Milestone |

### 2.2 Conversion Variables (eVars) — allocation **Most Recent (Last)**, expiration **Visit** unless noted
(Admin → Edit Settings → Conversion → Conversion Variables)

| Var | Name | Expiration |
|-----|------|-----------|
| eVar1 | Template | Visit |
| eVar2 | Locale | Visit |
| eVar3 | Component ID | Hit |
| eVar4 | Block Name | Hit |
| eVar5 | Position | Hit |
| eVar6 | Section Index | Hit |
| eVar10 | Link Text | Hit |
| eVar11 | Link URL | Hit |
| eVar12 | Download File | Hit |
| eVar13 | Scroll Depth | Hit |
| eVar14 | Form Name | Hit |

> Reality check for Chevron US: eVar2 "Locale" exists in the model but Chevron US is a
> single-locale build; populate it with a constant (e.g. `us`) or leave unset. Keep the
> slot named for parity with TEBG.

### 2.3 Traffic Variables (props)
(Admin → Edit Settings → Traffic → Traffic Variables). prop1/3/4 enable **pathing off**,
list **on** as in TEBG.

| Prop | Name |
|------|------|
| prop1 | Page Path |
| prop3 | Component ID |
| prop4 | Block Name |
| prop10 | Region : Link Type |

### 2.4 Calculated metrics (Components → Calculated Metrics — create against this suite)

| Metric | Formula | Format |
|--------|---------|--------|
| Component CTR (%) | CTA Click ÷ Component Impression | Percent (relative ranking; can exceed 100% because impressions count once per component/view while clicks count per link) |
| CTA Clicks per Visit | CTA Click ÷ Visits | Decimal |
| Downloads per Visit | Download ÷ Visits | Decimal |
| Form Completion Rate (%) | Form Submit ÷ Form Start | Percent |
| Form Abandonment Rate (%) | 1 − (Form Submit ÷ Form Start) | Percent |
| Impression-to-Submit Rate (%) | Form Submit ÷ Component Impression | Percent |

> Chevron US reality check: Component Impression, CTA Click, Scroll Milestone, and
> Download apply today. The form funnel (event4/event5, eVar14) stays empty until a form
> block ships — Chevron US templates have no on-page forms yet, so build the form
> calculated metrics but expect them dormant.

---

## 3. Data collection path (Analytics-only — AppMeasurement + Tags)

**Decision:** Analytics-only (no AEP). Recommended path is classic **AppMeasurement +
Tags (Launch)**, sending hits straight to the report suite — no datastream, no Edge
Network, no AEP required. The measurement design (Sections 2, 4, 5) is identical
regardless of transport.

### 3.1 Recommended — AppMeasurement + Tags (Launch)

1. In **Data Collection → Tags**, create a property **Chevron Lubricants** with the
   site domain(s) (`chevronlubricants.com`, and the Edge host
   `chevronlubricants.ynaka-adobe.com` for pre-prod validation).
2. Add the **Adobe Analytics** extension. Set the report suite to
   **`acsmarketingb2bcontentexperiences` for all environments** (prod suite used for both
   prod and non-prod per project decision — no separate dev suite). Set the tracking
   server to your 1st-party CNAME `«TRACKING_SERVER — e.g. metrics.chevronlubricants.com»`
   *(confirm before go-live; placeholder)*.
3. Create data elements for each dataLayer key in Section 5, then a rule that maps them to
   `s.eVarN` / `s.events` and fires:
   - `s.t()` on page view (page metrics).
   - `s.tl()` on component impression / CTA click / download / scroll events.
4. Build + publish the Tags library and load it from the EDS `head.html`.

```js
// in a Tags rule, per adobeDataLayer event (component impression):
s.linkTrackVars = 'eVar1,eVar2,eVar3,eVar4,eVar5,eVar6,prop1,prop3,prop4,events';
s.linkTrackEvents = 'event1';
s.eVar1 = ev.page.template;       // Template
s.eVar2 = ev.page.locale;         // Locale (US build: constant, e.g. 'us')
s.eVar3 = ev.component.id;         // Component ID (also prop3)
s.eVar4 = ev.component.block;      // Block Name  (also prop4)
s.eVar5 = ev.component.position;   // Position
s.eVar6 = ev.component.sectionIndex; // Section Index
s.prop1 = ev.page.path; s.prop3 = s.eVar3; s.prop4 = s.eVar4;
s.events = 'event1';               // Component Impression
s.tl(true, 'o', 'component-impression');
```

### 3.2 Alternative — Web SDK + datastream (only if provisioned)
Web SDK does not require AEP. Use only if your admin grants Manage Datastreams + sandbox
access. Create a datastream with an Adobe Analytics service pointing at
`acsmarketingb2bcontentexperiences`, and configure `alloy` with that `datastreamId` +
`orgId`. The Section 5 variable map is unchanged.

---

## 4. Block inventory (generic auto-discovery)

Per project decision, there is **no hardcoded block table** — the instrumentation in
Section 6 discovers every block generically from its EDS class list, so it covers the
full Chevron block set (home + other US templates) and any block added as the 75%→100%
migration completes, with no code change.

How identity is derived for every block:
- **Block Name** (eVar4/prop4) = the block's first EDS class.
- **Component ID** (eVar3/prop3) = block name joined with any variant classes (`--`).
- **Position** (eVar5) = the block's ordinal within `<main>`.
- **Section Index** (eVar6) = its section's ordinal within `<main>`.

Default instrumentation per block = **impression (event1) + CTA/link click (event2) +
download (event3) + scroll milestones (event6)**, all handled by the generic listeners.

> Optional later refinement: if you want a curated, reviewed block list in reporting
> (e.g. to exclude `header`/`footer`/`fragment` containers from impression analysis, or to
> label slide-change on a carousel), add a classification or a small allowlist here. Not
> required for launch.

Section style and ordinal fold into Position (eVar5) and Section Index (eVar6); the suite
has no dedicated "section style" variable.

---

## 5. DataLayer contract (the join key)

Push to `window.adobeDataLayer`. Keep key names stable — they are the contract between
blocks and the Analytics mapping.

```js
// component impression
{ event: 'component-impression',
  component: { id: 'hero', block: 'hero', position: 1, sectionIndex: 1 },
  page: { path: location.pathname, template: 'home', locale: 'us' } }

// CTA click
{ event: 'cta-click',
  component: { id: 'cards-product', block: 'cards-product', position: 5, sectionIndex: 4 },
  link: { text: 'View all', url: '/products', type: 'internal' } }

// download (asset link)
{ event: 'download', link: { file: 'chevron-delo-pds.pdf', url: '/content/dam/...' } }

// scroll milestone
{ event: 'scroll', depth: 75 }

// form funnel (future — no forms on Chevron US today)
{ event: 'form-start',  form: { name: 'contact' } }
{ event: 'form-submit', form: { name: 'contact' } }
```

### Mapping table (dataLayer → Analytics)

| dataLayer key | Analytics |
|---------------|-----------|
| page.template | eVar1 |
| page.locale | eVar2 |
| component.id | eVar3 + prop3 (+ event1 on impression) |
| component.block | eVar4 + prop4 |
| component.position | eVar5 |
| component.sectionIndex | eVar6 |
| link.text | eVar10 (+ event2 on cta-click) |
| link.url | eVar11 |
| link.file | eVar12 (+ event3 download) |
| depth | eVar13 (+ event6 scroll milestone) |
| form.name | eVar14 (+ event4 start / event5 submit) |
| page.path | prop1 |
| link type / region | prop10 |

---

## 6. Instrumentation pattern (what to add to the repo)

Add a single plugin `scripts/martech/instrument.js`, loaded lazily after LCP, that wires
every block generically — no per-block edits needed.

```js
// scripts/martech/instrument.js
window.adobeDataLayer = window.adobeDataLayer || [];
const push = (o) => window.adobeDataLayer.push(o);

// US single-locale build: constant locale. (Switch to a path-derived value if Chevron
// later adds locale-based routing; other locales are out of scope and use other CNAMEs.)
const locale = () => 'us';
const template = () => document.body.dataset.template
  || document.querySelector('main')?.dataset.template || '';

// Component ID + Block Name from the EDS class list. First class = block name;
// extra classes (variants) refine the Component ID.
function ids(block) {
  const parts = [...block.classList].filter((c) => c !== 'block');
  return { id: parts.join('--') || 'unknown', block: parts[0] || 'unknown' };
}

// Position = ordinal of the block within <main>; Section Index = its section ordinal
function coords(block) {
  const blocks = [...document.querySelectorAll('main .block')];
  const sections = [...document.querySelectorAll('main > .section')];
  return { position: blocks.indexOf(block) + 1,
           sectionIndex: sections.indexOf(block.closest('.section')) + 1 };
}

// 1) Impressions — once per block at 50% visibility → event1
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting && !e.target.dataset.impressed) {
      e.target.dataset.impressed = '1';
      const { id, block } = ids(e.target);
      push({ event: 'component-impression',
             component: { id, block, ...coords(e.target) },
             page: { path: location.pathname, template: template(), locale: locale() } });
    }
  });
}, { threshold: 0.5 });

// 2) Link clicks inside blocks → CTA click (event2) or Download (event3)
document.addEventListener('click', (ev) => {
  const a = ev.target.closest('main .block a, main .block button');
  if (!a) return;
  const block = a.closest('.block');
  const { id, block: name } = ids(block);
  const url = a.getAttribute('href') || '';
  const isDownload = /\.(pdf|docx?|xlsx?|pptx?|zip|csv)(\?|$)/i.test(url) || url.includes('/content/dam/');
  if (isDownload) {
    push({ event: 'download',
           component: { id, block: name, ...coords(block) },
           link: { file: url.split('/').pop(), url } });
  } else {
    push({ event: 'cta-click',
           component: { id, block: name, ...coords(block) },
           link: { text: a.textContent.trim(), url,
                   type: a.hostname && a.hostname !== location.hostname ? 'exit' : 'internal' } });
  }
});

// 3) Scroll milestones → event6 (25/50/75/100)
const seen = new Set();
window.addEventListener('scroll', () => {
  const pct = Math.round(((scrollY + innerHeight) / document.body.scrollHeight) * 100);
  [25, 50, 75, 100].forEach((m) => {
    if (pct >= m && !seen.has(m)) { seen.add(m); push({ event: 'scroll', depth: m }); }
  });
}, { passive: true });

// 4) Observe every decorated block
export default function instrument() {
  document.querySelectorAll('main .block').forEach((b) => io.observe(b));
}
```

Wire it in `scripts/scripts.js` after `loadLazy()`:

```js
import instrument from './martech/instrument.js';
// ... after page is decorated / lazy phase:
instrument();
```

**Form funnel (future — not on Chevron US today).** Current US templates have no embedded
forms, so this is dormant. When a form block ships (e.g. a contact or Marketo form), push
`form-start` on first field focus and `form-submit` on confirmed success (use the
provider's success callback, not button click), with `form.name` from the form's data
attribute — reproducing the TEBG Form Start → Form Submit funnel.

---

## 7. Validation checklist

- [ ] **Section 2 completed**: `acsmarketingb2bcontentexperiences` now has event1–6,
      eVar1–6/10–14, prop1/3/4/10, and the 6 calculated metrics — matching TEBG. (These
      were NOT present at duplication; confirm before expecting any content report to populate.)
- [ ] Tags property + Adobe Analytics extension live (suite `acsmarketingb2bcontentexperiences`);
      hits visible in the Adobe Experience Cloud debugger / Analytics real-time.
- [ ] Tracking server (1st-party CNAME) confirmed and set in the AA extension.
- [ ] Every block on each US template fires exactly one impression (event1) per view.
- [ ] Component ID (eVar3/prop3) + Block Name (eVar4/prop4) + Position (eVar5) +
      Section Index (eVar6) populate on every hit.
- [ ] CTA clicks set Link Text/URL (eVar10/11) and increment event2; asset links fire
      Download (event3) with Download File (eVar12).
- [ ] Scroll milestones fire event6 with Scroll Depth (eVar13).
- [ ] Calculated metrics (Component CTR, CTA Clicks per Visit, Downloads per Visit) resolve
      in a Chevron Workspace project.
- [ ] Partially-migrated templates instrument correctly; re-validate blocks added as
      migration reaches 100%.

*(Form funnel checks are N/A until Chevron US ships a form block.)*

---

## 8. Open items for you / Copilot to confirm

1. **Tracking server / 1st-party CNAME** — placeholder `metrics.chevronlubricants.com`
   used in §3; set the real value before go-live.
2. **Curated block list (optional)** — launch uses generic auto-discovery. If you want a
   reviewed block table or container exclusions (header/footer/fragment) in reporting,
   provide the `/blocks` folder list and I'll add Section 4 detail.
3. **Locale handling** — US build uses a constant `locale = 'us'`. Other locales/templates
   are separate builds on different CNAMEs and are out of scope here.

---

*Measurement model captured live from the 3M TEBG report suite (`acsmarketingtebg`) and
the Parker reference build; block handling is generic for the Chevron Lubricants EDS repo
`ynaka-adobe/chevronlubricants`. Scoped to US.*

---

## Appendix A — Report-suite configuration via the Admin API

This appendix lets Copilot (or a script) apply all of Section 2 programmatically instead
of clicking through Admin → Edit Settings. Apply in order: **A.2 events → A.3 eVars →
A.4 props → A.5 calculated metrics → A.6 verify**.

> **Which API for what.** Variable/event *provisioning* (enabling and naming success
> events, eVars, props, and setting eVar allocation/expiration) is **only** available in
> the **Analytics 1.4 Admin API** (`ReportSuite.saveSuccessEvents`, `saveEVars`,
> `saveProps`). The modern **Analytics 2.0 API** does **not** expose report-suite variable
> provisioning — but it **is** the API for **calculated metrics** (A.5). So this appendix
> uses both: 1.4 for A.2–A.4, 2.0 for A.5.

### A.1 Prerequisites and auth

- **Admin access** to report suite `acsmarketingb2bcontentexperiences` under company
  `adobec8b` (login company "Adobe Customer Solutions Services Marketing"), IMS org
  `21BD487E5F2280130A495ECC@AdobeOrg`.
- An **OAuth Server-to-Server** (or legacy JWT) integration in Adobe Developer Console
  with the **Adobe Analytics** API added, granting the admin scope. Obtain a bearer token.
- Common headers for **all** calls below:
  ```
  Authorization: Bearer <ACCESS_TOKEN>
  x-api-key: <CLIENT_ID>
  Content-Type: application/json
  ```

**1.4 endpoint (A.2–A.4):** method is passed as a query param.
```
POST https://api.omniture.com/admin/1.4/rest/?method=<Method>
```
`<rsid>` throughout = `acsmarketingb2bcontentexperiences`.

**2.0 endpoint (A.5):** company-scoped.
```
POST https://analytics.adobe.io/api/adobec8b/calculatedmetrics
```
(Some tenants route 2.0 via `https://analytics.adobe.io/api/<globalcompanyid>/...` — if
`adobec8b` returns 403, confirm the exact global company id from the Analytics UI → API
access, and use it in the path.)

> **Safety.** `saveSuccessEvents` / `saveEVars` / `saveProps` **replace the full list**
> for the suite. Call `ReportSuite.getSuccessEvents` / `getEVars` / `getProps` first,
> merge your changes into the returned array, and send the **merged** array back — do not
> send only the rows below or you will wipe the suite's other variables. The bodies below
> show the content rows to merge in; keep every pre-existing row you are not changing.

### A.2 Success events — `ReportSuite.saveSuccessEvents`

Enable event1–event6 as counters, polarity up. Merge these into the existing event list.

```json
{
  "rsid_list": ["acsmarketingb2bcontentexperiences"],
  "success_events": [
    { "id": "event1", "name": "Component Impression", "type": "counter", "polarity": "positive", "visibility": "yes" },
    { "id": "event2", "name": "CTA Click",            "type": "counter", "polarity": "positive", "visibility": "yes" },
    { "id": "event3", "name": "Download",             "type": "counter", "polarity": "positive", "visibility": "yes" },
    { "id": "event4", "name": "Form Start",           "type": "counter", "polarity": "positive", "visibility": "yes" },
    { "id": "event5", "name": "Form Submit",          "type": "counter", "polarity": "positive", "visibility": "yes" },
    { "id": "event6", "name": "Scroll Milestone",     "type": "counter", "polarity": "positive", "visibility": "yes" }
  ]
}
```

### A.3 eVars — `ReportSuite.saveEVars`

Allocation **Most Recent (Last)** = `"linear"` is **wrong**; "most recent/last" maps to
`allocation_type: "most_recent"`. Expiration per Section 2.2. Merge into the existing eVar list.

```json
{
  "rsid_list": ["acsmarketingb2bcontentexperiences"],
  "evars": [
    { "id": "evar1",  "name": "Template",      "type": "text", "enabled": true, "allocation_type": "most_recent", "expiration_type": "visit" },
    { "id": "evar2",  "name": "Locale",        "type": "text", "enabled": true, "allocation_type": "most_recent", "expiration_type": "visit" },
    { "id": "evar3",  "name": "Component ID",  "type": "text", "enabled": true, "allocation_type": "most_recent", "expiration_type": "page_view" },
    { "id": "evar4",  "name": "Block Name",    "type": "text", "enabled": true, "allocation_type": "most_recent", "expiration_type": "page_view" },
    { "id": "evar5",  "name": "Position",      "type": "text", "enabled": true, "allocation_type": "most_recent", "expiration_type": "page_view" },
    { "id": "evar6",  "name": "Section Index", "type": "text", "enabled": true, "allocation_type": "most_recent", "expiration_type": "page_view" },
    { "id": "evar10", "name": "Link Text",     "type": "text", "enabled": true, "allocation_type": "most_recent", "expiration_type": "page_view" },
    { "id": "evar11", "name": "Link URL",      "type": "text", "enabled": true, "allocation_type": "most_recent", "expiration_type": "page_view" },
    { "id": "evar12", "name": "Download File", "type": "text", "enabled": true, "allocation_type": "most_recent", "expiration_type": "page_view" },
    { "id": "evar13", "name": "Scroll Depth",  "type": "text", "enabled": true, "allocation_type": "most_recent", "expiration_type": "page_view" },
    { "id": "evar14", "name": "Form Name",     "type": "text", "enabled": true, "allocation_type": "most_recent", "expiration_type": "page_view" }
  ]
}
```

> `expiration_type` values in 1.4: `page_view` (= Hit in the UI), `visit`, `purchase`,
> `day`/`week`/`month`/`quarter`/`year`, or `never`. Section 2.2 "Hit" → `page_view`;
> "Visit" → `visit`.

### A.4 props — `ReportSuite.saveProps`

prop1/3/4 are content props with pathing off; prop10 captures region:link type. Merge
into the existing prop list.

```json
{
  "rsid_list": ["acsmarketingb2bcontentexperiences"],
  "props": [
    { "id": "prop1",  "name": "Page Path",          "enabled": true, "pathing_enabled": false, "list_enabled": false },
    { "id": "prop3",  "name": "Component ID",        "enabled": true, "pathing_enabled": false, "list_enabled": false },
    { "id": "prop4",  "name": "Block Name",          "enabled": true, "pathing_enabled": false, "list_enabled": false },
    { "id": "prop10", "name": "Region : Link Type",  "enabled": true, "pathing_enabled": false, "list_enabled": false }
  ]
}
```

### A.5 Calculated metrics — Analytics 2.0 API

One `POST .../calculatedmetrics` per metric. Replace `<...>` component ids only if your
event ids differ (they won't, if A.2 ran). `rsid` is the target suite.

**Component CTR (%)** — CTA Click ÷ Component Impression:
```json
{
  "name": "Component CTR (%)",
  "description": "CTA Click (event2) / Component Impression (event1). Relative ranking; can exceed 100%.",
  "rsid": "acsmarketingb2bcontentexperiences",
  "format": "percent",
  "definition": {
    "formula": { "func": "divide",
      "col1": { "func": "metric", "name": "metrics/event2" },
      "col2": { "func": "metric", "name": "metrics/event1" } },
    "func": "calc-metric", "version": [1, 0, 0] }
}
```

**CTA Clicks per Visit** — CTA Click ÷ Visits:
```json
{
  "name": "CTA Clicks per Visit",
  "rsid": "acsmarketingb2bcontentexperiences", "format": "decimal",
  "definition": { "formula": { "func": "divide",
      "col1": { "func": "metric", "name": "metrics/event2" },
      "col2": { "func": "metric", "name": "metrics/visits" } },
    "func": "calc-metric", "version": [1, 0, 0] }
}
```

**Downloads per Visit** — Download ÷ Visits:
```json
{
  "name": "Downloads per Visit",
  "rsid": "acsmarketingb2bcontentexperiences", "format": "decimal",
  "definition": { "formula": { "func": "divide",
      "col1": { "func": "metric", "name": "metrics/event3" },
      "col2": { "func": "metric", "name": "metrics/visits" } },
    "func": "calc-metric", "version": [1, 0, 0] }
}
```

**Form Completion Rate (%)** — Form Submit ÷ Form Start:
```json
{
  "name": "Form Completion Rate (%)",
  "rsid": "acsmarketingb2bcontentexperiences", "format": "percent",
  "definition": { "formula": { "func": "divide",
      "col1": { "func": "metric", "name": "metrics/event5" },
      "col2": { "func": "metric", "name": "metrics/event4" } },
    "func": "calc-metric", "version": [1, 0, 0] }
}
```

**Form Abandonment Rate (%)** — 1 − (Form Submit ÷ Form Start):
```json
{
  "name": "Form Abandonment Rate (%)",
  "rsid": "acsmarketingb2bcontentexperiences", "format": "percent",
  "definition": { "formula": { "func": "subtract",
      "col1": 1,
      "col2": { "func": "divide",
        "col1": { "func": "metric", "name": "metrics/event5" },
        "col2": { "func": "metric", "name": "metrics/event4" } } },
    "func": "calc-metric", "version": [1, 0, 0] }
}
```

**Impression-to-Submit Rate (%)** — Form Submit ÷ Component Impression:
```json
{
  "name": "Impression-to-Submit Rate (%)",
  "rsid": "acsmarketingb2bcontentexperiences", "format": "percent",
  "definition": { "formula": { "func": "divide",
      "col1": { "func": "metric", "name": "metrics/event5" },
      "col2": { "func": "metric", "name": "metrics/event1" } },
    "func": "calc-metric", "version": [1, 0, 0] }
}
```

### A.6 Verify

- 1.4 read-backs: `ReportSuite.getSuccessEvents`, `getEVars`, `getProps` for
  `acsmarketingb2bcontentexperiences` return the names/numbers above.
- 2.0 read-back: `GET https://analytics.adobe.io/api/adobec8b/calculatedmetrics?rsids=acsmarketingb2bcontentexperiences`
  lists all six metrics.
- Then run Section 7's validation checklist end-to-end.

> **Caveats for Copilot.**
> 1. The 1.4 save-methods are **full-array replacements** — always get-merge-save (see the
>    A.1 safety note). 2. Variable **enablement/renames are not instantaneous** across all
>    reporting surfaces; allow processing time before read-back. 3. Renaming a slot that
>    already holds data relabels historical data in that slot — fine for a pre-launch suite,
>    but confirm this suite isn't already live. 4. If `allocation_type`/`expiration_type`
>    enum values are rejected, fetch the suite's current eVars via `getEVars` and mirror the
>    exact string casing that tenant returns.
