# CLAUDE.md – Project Rules for chevronlubricants

## Project context

- Source website:  https://www.chevronlubricants.com/
- GitHub repo: https://github.com/ynaka-adobe/chevronlubricants
- DA project: https://da.live/#/ynaka-adobe/chevronlubricants
- Purpose: Migrate selected pages from chevronlubricants.com into an Edge Delivery / DA project.

## File conventions

1. `source_website.md`
   - Canonical list of source URLs and migration scope.
   - Before planning or executing migration tasks, read this file and prefer URLs listed as in-scope.
   - Do not crawl or migrate URLs marked out-of-scope unless explicitly instructed.

2. `pr.md`
   - Single source of truth for pull request descriptions and status.
   - Before composing a PR description or summarizing changes, read and update `pr.md`.
   - Maintain “Open PRs” and “Merged PRs” sections with branch, status, and notes.

## General behavior

- Prefer editing existing Markdown files (`*.md`) rather than creating ad-hoc notes elsewhere.
- When in doubt about URLs or scope, consult `source_website.md` instead of guessing.
- When working on code or content destined for review, ensure `pr.md` has an up-to-date entry.

## Confirmed product migration scope

| Source | Destination | Delivery |
| --- | --- | --- |
| https://www.chevronlubricants.com/en_us/home/products/delo-syn-trans-xe.html | https://chevronlubricants.ynaka-adobe.com/en-us/home/products/delo-syn-trans-xe | Edge Commerce product, explicitly selected by the user |

This mapping intentionally changes `en_us` to `en-us` and removes `.html`, as
requested for this product. The subsequent Delo catalog request extends that
product-path convention only to the confirmed inventory below. It does not
authorize moving root-level DA content or changing other brands, categories,
listing pages, blocks, styles or shared scripts.

## Delo catalog migration

User-requested scope:
https://www.chevronlubricants.com/en_us/home/products/by_brand/delo.html?src-tab=products

The 2026-10-30 listing contains 41 distinct product links. Forty source pages
are available and migrated to Edge Commerce, including the previously migrated
Syn-Trans XE. Duplicate cards and responsive/featured copies are not separate
products.

Source filenames below are under
`https://www.chevronlubricants.com/en_us/home/products/`. Destination slugs are
under `https://chevronlubricants.ynaka-adobe.com/en-us/home/products/`, without
`.html`. This is a finite product inventory, not authorization for wildcard
routing of that hierarchy.

| Source filename | Destination slug |
| --- | --- |
| `delo-100-motor-oils.html` | `delo-100-motor-oils` |
| `delo-1000-marine.html` | `delo-1000-marine` |
| `delo-400.html` | `delo-400` |
| `delo-400-sng.html` | `delo-400-sng` |
| `delo-400-xle-sae-10w-30.html` | `delo-400-xle-sae-10w-30` |
| `delo-400-xle-sb-15w-40.html` | `delo-400-xle-sb-15w-40` |
| `delo-400-xsp-15w-40.html` | `delo-400-xsp-15w-40` |
| `delo-400-xsp-fa-5w-30.html` | `delo-400-xsp-fa-5w-30` |
| `delo-400-xsp-sae-5w-30.html` | `delo-400-xsp-sae-5w-30` |
| `delo-400-xsp-sae-5w-40.html` | `delo-400-xsp-sae-5w-40` |
| `delo-400-zfa-sae-10w-30.html` | `delo-400-zfa-sae-10w-30` |
| `delo-600-adf-10w-30.html` | `delo-600-adf-10w-30` |
| `delo-600-adf-15w-40.html` | `delo-600-adf-15w-40` |
| `delo-710-ls.html` | `delo-710-ls` |
| `delo-elc-advanced-antifreezecoolant-5050.html` | `delo-elc-advanced-antifreezecoolant-5050` |
| `delo-elc-antifreeze-coolant.html` | `delo-elc-antifreeze-coolant` |
| `delo-elc-pg-antifreezecoolant.html` | `delo-elc-pg-antifreezecoolant` |
| `delo-eli-corrosion-inhibitor.html` | `delo-eli-corrosion-inhibitor` |
| `delo-extreme-ep-5.html` | `delo-extreme-ep-5` |
| `delo-gear-esi-sae-80w-90.html` | `delo-gear-esi-sae-80w-90` |
| `delo-gear-esi-sae-85w-140.html` | `delo-gear-esi-sae-85w-140` |
| `delo-syn--thf-xc.html` | `delo-syn-thf-xc` |
| `delo-syn-amt-xdt-sae-75w-90.html` | `delo-syn-amt-xdt-sae-75w-90` |
| `delo-syn-atf-668.html` | `delo-syn-atf-668` |
| `delo-syn-atf-hd.html` | `delo-syn-atf-hd` |
| `delo-syn-gear-hd-sae-75w-90.html` | `delo-syn-gear-hd-sae-75w-90` |
| `delo-syn-gear-xda.html` | `delo-syn-gear-xda` |
| `delo-syn-gear-xdm-sae-75w-90-80w-140.html` | `delo-syn-gear-xdm-sae-75w-90-80w-140` |
| `delo-syn-grease-sfe-ep-0.html` | `delo-syn-grease-sfe-ep-0` |
| `delo-syn-tdl-75w-90.html` | `delo-syn-tdl-75w-90` |
| `delo-syn-trans-hd-sae-50.html` | `delo-syn-trans-hd-sae-50` |
| `delo-syn-trans-xe.html` | `delo-syn-trans-xe` |
| `delo-syn-trans-xv-sae-75w-80.html` | `delo-syn-trans-xv-sae-75w-80` |
| `delo-torqforce.html` | `delo-torqforce` |
| `delo-torqforce-fd.html` | `delo-torqforce-fd` |
| `delo-torqforce-mp.html` | `delo-torqforce-mp` |
| `delo-torqforce-syn.html` | `delo-torqforce-syn` |
| `delo-torqforce-syn-fd-1.html` | `delo-torqforce-syn-fd-1` |
| `delo-xlc-antifreeze-coolant.html` | `delo-xlc-antifreeze-coolant` |
| `delo-xli-corrosion-inhibitor-concentrate.html` | `delo-xli-corrosion-inhibitor-concentrate` |

The THF single-hyphen destination was explicitly approved by the user after
the catalog API rejected the source's double-hyphen path.

Excluded broken source link:
`https://www.chevronlubricants.com/en_us/home/products/delo-syn-gear-xdm-sae-80w-140.html`
returns HTTP 404. No replacement page or redirect was invented. The available
combined XDM page above preserves its source description, applications and SKUs
for the grades already documented there. The featured 75W-90 card has no link
in the source listing; it does not justify another guessed product page.