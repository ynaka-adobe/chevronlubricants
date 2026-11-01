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

This mapping follows the approved `/en-us/home` URL structure documented below.
The Delo catalog request covers only the confirmed product inventory here, not
root-level DA moves or other brands/category pages. The user subsequently
approved a dedicated detail renderer and scoped styles for these 40 products;
that approval does not extend to the DA product block or global header/footer.

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

## Havoline catalog migration

User authorized all products linked from
`https://www.chevronlubricants.com/en_us/home/products/by_brand/havoline.html?src-tab=products`.
The products tab contains 17 unique available detail pages, including its
expanded cards and deduplicated featured links. All 17 catalog and destination
paths were absent at inventory time; recheck before ingestion.

Each source below is under `/en_us/home/products/`; each destination is under
`/en-us/home/products/` with no `.html` suffix.

| Source filename | Destination slug |
| --- | --- |
| `havoline-2-cycle-engine-oil.html` | `havoline-2-cycle-engine-oil` |
| `havoline-automatic-transmission-fluid-md-3.html` | `havoline-automatic-transmission-fluid-md-3` |
| `havoline-automatic-transmission-fluid-type-f.html` | `havoline-automatic-transmission-fluid-type-f` |
| `havoline-conventional-antifreezecoolant.html` | `havoline-conventional-antifreezecoolant` |
| `havoline-cvt-plus.html` | `havoline-cvt-plus` |
| `havoline-full-synthetic-multi-vehicle-atf.html` | `havoline-full-synthetic-multi-vehicle-atf` |
| `havoline-global-multi-vehicle-atf.html` | `havoline-global-multi-vehicle-atf` |
| `havoline-high-mileage-synblend-motor-oil.html` | `havoline-high-mileage-synblend-motor-oil` |
| `havoline-lifelong-full-synthetic-motor-oil.html` | `havoline-lifelong-full-synthetic-motor-oil` |
| `havoline-motor-oil.html` | `havoline-motor-oil` |
| `havoline-power-steering-fluid.html` | `havoline-power-steering-fluid` |
| `havoline-pro-ds-full-synthetic-euro-motor-oil.html` | `havoline-pro-ds-full-synthetic-euro-motor-oil` |
| `havoline-pro-ds-full-synthetic-motor-oil.html` | `havoline-pro-ds-full-synthetic-motor-oil` |
| `havoline-synblend-dx-motor-oil.html` | `havoline-synblend-dx-motor-oil` |
| `havoline-synblend-motor-oil.html` | `havoline-synblend-motor-oil` |
| `havoline-universal-antifreezecoolant.html` | `havoline-universal-antifreezecoolant` |
| `havoline-xtended-life-antifreezecoolant.html` | `havoline-xtended-life-antifreezecoolant` |

Preserve real source descriptions, equipment, benefits, application tables,
packaging identifiers, documents, hero actions, and Self/Pro Services groups.
Use the established exact-path/SKU-gated detail renderer, adding only Havoline's
source-specific presentation. Do not add prices, checkout, broad routes, or
overwrite EMA-authored pages or existing products.

## Techron catalog migration

User authorized the actual products linked from
`https://www.chevronlubricants.com/en_us/home/products/by_brand/techron.html?src-tab=products`.
There are four distinct linked detail pages. All sources returned 200 and
their catalog/Network/custom destination paths were absent at inventory time.
Sources are under `/en_us/home/products/`; destinations are under
`/en-us/home/products/`, without `.html`.

| Source filename | Destination slug |
| --- | --- |
| `techron-complete-fuel-system-cleaner.html` | `techron-complete-fuel-system-cleaner` |
| `techron-diesel.html` | `techron-diesel` |
| `techron-fuel-injector-cleaner.html` | `techron-fuel-injector-cleaner` |
| `techron-high-mileage-fuel-system-cleaner.html` | `techron-high-mileage-fuel-system-cleaner` |

Preserve source descriptions, images, documents, equipment, benefits,
applications/specifications, packaging identifiers and Self Services.
Reuse the finite SKU-gated renderer with Techron's source gray title/actions
and blue benefit cards. Preserve Delo/Havoline and active EMA work.
No checkout or invented prices. New exact CDN routes need fresh Techron-specific
deployment approval and pipeline-idle confirmation; Havoline approval is not
authorization to deploy Techron.

## Industrial and ISOCLEAN catalog migration

User authorized the actual product listings identified in source navigation:

- https://www.chevronlubricants.com/en_us/home/products/by_brand/industrial_products.html?src-tab=products
- https://www.chevronlubricants.com/en_us/home/products/by_brand/isoclean.html?src-tab=products

Industrial has 125 distinct product links; ISOCLEAN has 47. Their 39 shared
links yield 133 distinct sources, not separate duplicated ISOCLEAN products.
Of these, 34 already-migrated Delo records are preserved without enrichment
or replacement, 97 are new available products, and two source links return 404:
`cetus-hipersyn.html` and `delo-syn-gear-xdm-sae-80w-140.html`.
The available combined XDM page is already migrated; do not fabricate a
replacement for the broken standalone source.

The user explicitly approved source
`hdax-pf-antifreezecoolant--premixed-5050.html` mapping to single-hyphen
`hdax-pf-antifreezecoolant-premixed-5050`; the exact double-hyphen path is
rejected by the catalog API. Retain the previously approved THF mapping too.

New product inventory below uses source `/en_us/home/products/` filenames and
destination `/en-us/home/products/` slugs without `.html`.

| Source filename | Destination slug |
| --- | --- |
| `aries.html` | `aries` |
| `black-pearl-grease-ep-1-2.html` | `black-pearl-grease-ep-1-2` |
| `black-pearl-grease-hm-1.html` | `black-pearl-grease-hm-1` |
| `black-pearl-grease-sri-2.html` | `black-pearl-grease-sri-2` |
| `bright-cut-metalworking-fluid.html` | `bright-cut-metalworking-fluid` |
| `capella-p.html` | `capella-p` |
| `capella-wf.html` | `capella-wf` |
| `cetus-advantage.html` | `cetus-advantage` |
| `cetus-de.html` | `cetus-de` |
| `cetus-elitesyn-mgx.html` | `cetus-elitesyn-mgx` |
| `cetus-pao-hc.html` | `cetus-pao-hc` |
| `chevron-1000-thf.html` | `chevron-1000-thf` |
| `chevron-atf-hd-389.html` | `chevron-atf-hd-389` |
| `chevron-compressor-oil.html` | `chevron-compressor-oil` |
| `chevron-cylinder-oil-w.html` | `chevron-cylinder-oil-w` |
| `chevron-form-oil-22.html` | `chevron-form-oil-22` |
| `chevron-gear-oil-gl-1.html` | `chevron-gear-oil-gl-1` |
| `chevron-glass-machine-oil-mv.html` | `chevron-glass-machine-oil-mv` |
| `chevron-htf-e-100.html` | `chevron-htf-e-100` |
| `chevron-htf-p-150.html` | `chevron-htf-p-150` |
| `chevron-htf-p-200.html` | `chevron-htf-p-200` |
| `chevron-hydraulic-oil-5606a.html` | `chevron-hydraulic-oil-5606a` |
| `chevron-open-gear-grease.html` | `chevron-open-gear-grease` |
| `chevron-open-gear-lubricant.html` | `chevron-open-gear-lubricant` |
| `chevron-paper-machine-oil-premium.html` | `chevron-paper-machine-oil-premium` |
| `chevron-red-chain-bar-oils.html` | `chevron-red-chain-bar-oils` |
| `chevron-shingle-oil.html` | `chevron-shingle-oil` |
| `chevron-soluble-oil-b.html` | `chevron-soluble-oil-b` |
| `chevron-tmgl-premium.html` | `chevron-tmgl-premium` |
| `chevron-tractor-fluid.html` | `chevron-tractor-fluid` |
| `chevron-vartech-industrial-system-cleaner.html` | `chevron-vartech-industrial-system-cleaner` |
| `chevron-way-lubricant.html` | `chevron-way-lubricant` |
| `clarity-aw.html` | `clarity-aw` |
| `clarity-bio-elitesyn-aw.html` | `clarity-bio-elitesyn-aw` |
| `clarity-elitesyn-aw-sae-32-46-68.html` | `clarity-elitesyn-aw-sae-32-46-68` |
| `clarity-machine-oils.html` | `clarity-machine-oils` |
| `clarity-saw-guide-oils.html` | `clarity-saw-guide-oils` |
| `clarity-synthetic-hydraulic-oil-aw.html` | `clarity-synthetic-hydraulic-oil-aw` |
| `clarity-synthetic-machine-oil.html` | `clarity-synthetic-machine-oil` |
| `delo-400-sp-0w-30.html` | `delo-400-sp-0w-30` |
| `delo-710-hb-rt-sae-20w-40.html` | `delo-710-hb-rt-sae-20w-40` |
| `delo-gear-ls.html` | `delo-gear-ls` |
| `gst-2190-ep.html` | `gst-2190-ep` |
| `gst-advantage-ep.html` | `gst-advantage-ep` |
| `gst-advantage-ro.html` | `gst-advantage-ro` |
| `gst-oil.html` | `gst-oil` |
| `hdax-3100-ashless-gas-engine-oils.html` | `hdax-3100-ashless-gas-engine-oils` |
| `hdax-3200-low-ash-gas-engine-oils.html` | `hdax-3200-low-ash-gas-engine-oils` |
| `hdax-5100-ashless-gas-engine-oil.html` | `hdax-5100-ashless-gas-engine-oil` |
| `hdax-5200-low-ash-gas-engine-oils.html` | `hdax-5200-low-ash-gas-engine-oils` |
| `hdax-5300-medium-ash-gas-engine-oil.html` | `hdax-5300-medium-ash-gas-engine-oil` |
| `hdax-6500-lfg.html` | `hdax-6500-lfg` |
| `hdax-9200-low-ash-gas-engine-oil.html` | `hdax-9200-low-ash-gas-engine-oil` |
| `hdax-9500-gas-engine-oil.html` | `hdax-9500-gas-engine-oil` |
| `hdax-9700.html` | `hdax-9700` |
| `hdax-pf-antifreezecoolant--premixed-5050.html` | `hdax-pf-antifreezecoolant-premixed-5050` |
| `meropa.html` | `meropa` |
| `meropa-elitesyn-wl.html` | `meropa-elitesyn-wl` |
| `meropa-elitesyn-xm.html` | `meropa-elitesyn-xm` |
| `meropa-synthetic-wm.html` | `meropa-synthetic-wm` |
| `meropa-xl.html` | `meropa-xl` |
| `multifak-cg-grease.html` | `multifak-cg-grease` |
| `multifak-ep-00-0-1-2-greases.html` | `multifak-ep-00-0-1-2-greases` |
| `paralux-process-oils.html` | `paralux-process-oils` |
| `rando-hd.html` | `rando-hd` |
| `rando-hd-premium-oil-mv.html` | `rando-hd-premium-oil-mv` |
| `rando-hdz.html` | `rando-hdz` |
| `rando-wm-32.html` | `rando-wm-32` |
| `regal-hd-57.html` | `regal-hd-57` |
| `regal-hh.html` | `regal-hh` |
| `regal-ro.html` | `regal-ro` |
| `regal-sgt.html` | `regal-sgt` |
| `rykon-ep-2-grease.html` | `rykon-ep-2-grease` |
| `rykon-hd-2-grease.html` | `rykon-hd-2-grease` |
| `rykon-hd-2-m5-grease.html` | `rykon-hd-2-m5-grease` |
| `starplex-ep-0-00-1-2-greases.html` | `starplex-ep-0-00-1-2-greases` |
| `starplex-hd-1-2-greases.html` | `starplex-hd-1-2-greases` |
| `starplex-hd-1-2-m5-greases.html` | `starplex-hd-1-2-m5-greases` |
| `starplex-hd-m3.html` | `starplex-hd-m3` |
| `starplex-syn-grease-ep-1-m5.html` | `starplex-syn-grease-ep-1-m5` |
| `starplex-syn-grease-hd-15.html` | `starplex-syn-grease-hd-15` |
| `starplex-syn-grease-xd-15.html` | `starplex-syn-grease-xd-15` |
| `talcor-ogp-4-gear-oil.html` | `talcor-ogp-4-gear-oil` |
| `talcor-ogp-6-gear-oil.html` | `talcor-ogp-6-gear-oil` |
| `taro-20-dp.html` | `taro-20-dp` |
| `taro-30-dp.html` | `taro-30-dp` |
| `taro-40-xl.html` | `taro-40-xl` |
| `taro-50-xl.html` | `taro-50-xl` |
| `taro-ultra-20-40-70-100-140.html` | `taro-ultra-20-40-70-100-140` |
| `tegra-synthetic-barrier-fluid.html` | `tegra-synthetic-barrier-fluid` |
| `texclad-2.html` | `texclad-2` |
| `ultra-duty-hd-0-1-2-greases.html` | `ultra-duty-hd-0-1-2-greases` |
| `ultra-duty-xd-00.html` | `ultra-duty-xd-00` |
| `ursa-hydraulic-oil-10w.html` | `ursa-hydraulic-oil-10w` |
| `ursa-super-plus-ec-sae-15w-40.html` | `ursa-super-plus-ec-sae-15w-40` |
| `veritas-800-marine-oil.html` | `veritas-800-marine-oil` |
| `way-oils-vistac.html` | `way-oils-vistac` |

Preserve source grades/subtitles and ISOCLEAN badge imagery where present,
documents, equipment, benefits, applications/tables and Self/Pro Services.
Source-empty sections stay absent: TMGL Premium and Regal HD 57 have no
equipment; Clarity Bio EliteSyn AW, Delo 710 HB RT and HDAX 6500 LFG have no
support cards; Chevron 1000 THF has benefits prose but no benefit cards.
Only these finite product paths are added to the renderer. No editorial/service
page migration, fabricated products/prices/checkout or broad route changes.
Fresh batch deployment approval and current pipeline idle are mandatory before
publishing the scoped CDN addition.

## Guides document pilot

The user approved a single English Syn-Trans XE PDS conversion demo on
2026-10-30, followed by use of the existing Guides environment in program
154856, environment 1944736. Source:
https://cglapps.chevron.com/sdspds/PDSDetailPage.aspx?docDataId=470254&docFormat=PDF

Preserve the original PDF; prepare structured DITA for genuine Guides PDF and
HTML publishing. New content is isolated under
`/content/dam/chevron-guides-demo`; existing dealer documents, shared templates,
EMA content and live product routes are not to be changed. Converted content
must be labeled as an unapproved demo, not an official PDS replacement.
SDS conversion and bulk document ingestion are not included.

## Migration scope

### URL structure on the new site (decided 2026-10-30)

- Mirror the source structure under `/en-us/home` (EDS paths can't contain underscores, so `en_us` → `en-us`, `by_brand` → `by-brand`; `.html` dropped).
- Homepage: `/en-us/home` (source `/` and `/en_us/home.html`). The site root `/` redirects to `/en-us/home`.
- Example: `https://www.chevronlubricants.com/en_us/home/products/by_brand/delo.html` → `/en-us/home/products/by-brand/delo`.

### In scope

- Homepage: https://www.chevronlubricants.com/ (migrated to `/home`)
- Products listing pages (69), from the Products menu. Added 2026-10-29:
  - https://www.chevronlubricants.com/en_us/home/products/by_brand/delo.html
  - https://www.chevronlubricants.com/en_us/home/products/by_brand/havoline.html
  - https://www.chevronlubricants.com/en_us/home/products/by_brand/industrial_products.html
  - https://www.chevronlubricants.com/en_us/home/products/by_brand/isoclean.html
  - https://www.chevronlubricants.com/en_us/home/products/by_brand/techron.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/gasoline_fleets_oil_change_service_centers/automobile_fleets.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/gasoline_fleets_oil_change_service_centers/oil_change_service_centers.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/gasoline_fleets_oil_change_service_centers/truck_fleets.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/cement_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/circulating_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/compressors.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/conveyors.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/injection_molding_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/lifts.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/manufacturing_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/mining_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/oil_gas_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/paper_machines.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/power_generation_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/steel_mills.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/off_highway_heavy_duty/agriculture_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/off_highway_heavy_duty/construction_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/off_highway_heavy_duty/forestry_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/off_highway_heavy_duty/inland_marine_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/off_highway_heavy_duty/mining_equipment.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/on_highway_heavy_duty/buses.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/on_highway_heavy_duty/light_duty_and_diesel_pick_up_trucks.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/on_highway_heavy_duty/medium_large_trucks.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/on_highway_heavy_duty/waste_hauler.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/atvs_utvs_snowmobiles.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/boats.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/cars_suvs.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/motorcycles.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/pick_up_trucks_sprinter_vans_diesel.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/pick_up_trucks_sprinter_vans_gasoline.html
  - https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/professional_lawn_care.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/coolants_antifreezes/gasoline_fleets.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/coolants_antifreezes/industrial.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/coolants_antifreezes/off_highway_heavy_duty.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/coolants_antifreezes/on_highway_heavy_duty.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/coolants_antifreezes/personal_rec_vehicles.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/engine_oils/gasoline_fleets.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/engine_oils/industrial.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/engine_oils/off_highway_heavy_duty.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/engine_oils/on_highway_heavy_duty.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/engine_oils/personal_rec_vehicles.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/fuel_additives/personal_rec_vehicles.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/greases/gasoline_fleets.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/greases/industrial.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/greases/off_highway_heavy_duty.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/greases/on_highway_heavy_duty.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/greases/personal_rec_vehicles.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/hydraulic_oils/industrial.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/hydraulic_oils/off_highway_heavy_duty.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/hydraulic_oils/on_highway_heavy_duty.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/circulating_oils.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/compressor_oils.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/gear_box_oils.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/hydraulic_oils.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/metal_working_equipment_oils.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/mining_equipment_oils.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/paper_machine_oils.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/specialty_oils.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/turbine_oils.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/transmission_gear_oils/gasoline_fleets.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/transmission_gear_oils/industrial.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/transmission_gear_oils/off_highway_heavy_duty.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/transmission_gear_oils/on_highway_heavy_duty.html
  - https://www.chevronlubricants.com/en_us/home/products/product_category/transmission_gear_oils/personal_rec_vehicles.html

- Our Expertise menu pages (37). Added 2026-10-29:
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/coolant-landing-page.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/emissions-control-center/on-hwy-the-solution.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/simplify-your-fleet-protection.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/the-delo-difference.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/tractor-restoration-competition.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/havoline.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/havoline/business.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/havoline/drivers.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/havoline/gf-7-landing-page.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/havoline/havoline-customer-stories.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/choosing-industrial-engine-oil.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/clarity-landing-page.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/greaseportfolio.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/how-hydraulic-oils-impact-efficiency.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/industrial-products-faqs.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/learning-for-you.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/vartech-isc.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/construction-new-oil-is-costing-you.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/customer-success.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/isoclean-faqs.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/learning-for-you.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/mining-did-you-check-the-third-spec.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/oil-and-gas-svcs-the-impact-of-dirty-oil.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/waste-hauling-does-your-new-oil-meet-the-third-spec.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/techron.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/techron/faqs.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/techron/history.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/xpress-lube.html
  - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/xpress-lube/drivers.html
  - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/chevron-lubematters-blog-landing.html
  - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/get-more-efficiency-from-the-workhorse-fuel.html
  - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/smaller-eservoirs-and-hotter-operating-temps-change-hydraulic-fluid-selection.html
  - https://www.chevronlubricants.com/en_us/home/services/pro-services/personal-rec-vehicles/xpress-lube-contact-us.html

- Where to buy menu pages (4). Added 2026-10-30. The three locators are rebuilt as a `locator` block that calls Chevron's locator service (chevrondelo.chevron.com/api):
  - https://www.chevronlubricants.com/en_us/home/where-to-buy/find-a-distributor.html
  - https://www.chevronlubricants.com/en_us/home/where-to-buy/find-an-installer.html
  - https://www.chevronlubricants.com/en_us/home/where-to-buy/find-a-retailer.html
  - https://www.chevronlubricants.com/en_us/home/contact-us.html

- Services and Support menu pages (24). Added 2026-10-30. Customer decisions: embedded external tools stay embedded (embed block); the built-in ISOCLEAN calculator is rebuilt as a block; the PitPack sign-up form links to the live form on chevronlubricants.com (same as the Xpress Lube contact page). Already migrated and not repeated here: the Xpress Lube contact page and the two blog articles linked from the menu.
  - Embedded external tools (iframe):
    - https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/heavy-duty-product-selector.html (earlweb.net)
    - https://www.chevronlubricants.com/en_us/home/services/self-services/personal-rec-vehicles/chevron-products-selector.html (earlweb.net)
    - https://www.chevronlubricants.com/en_us/home/services/self-services/industrial-machinery/heavy-duty-product-selector.html (earlweb.net)
    - https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/delo-smartchoice.html (delosmartchoice.com; its X-Frame-Options asks for chevronlubricants.com only, but browsers ignore ALLOW-FROM)
    - https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/fuel-economy-calculator.html (delocalculator.com)
    - https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/benchmark-calculator.html (delocalculator.com)
    - https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/coolants-freezepoint-calculator.html (delocalculator.com)
    - https://www.chevronlubricants.com/en_us/home/services/self-services/personal-rec-vehicles/coolants-freezepoint-calculator.html (delocalculator.com)
    - https://www.chevronlubricants.com/en_us/home/services/self-services/industrial-machinery/coolants-freezepoint-calculator.html (delocalculator.com)
    - https://www.chevronlubricants.com/en_us/home/services/self-services/industrial-machinery/best-in-class.html (delocalculator.com)
  - Built-in tool, rebuilt as a block:
    - https://www.chevronlubricants.com/en_us/home/services/self-services/industrial-machinery/isoclean-calculator.html
  - Content pages:
    - https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/best-in-class-assessment.html
    - https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/delo-promotions.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/heavy-duty-diesel-vehicles-equipment/delo-warranty-plus.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/heavy-duty-diesel-vehicles-equipment/lubewatch.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/personal-rec-vehicles/havoline-oil-change-pros.html (PitPack form → live form)
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/personal-rec-vehicles/havoline-education-learning.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/industrial-machinery/isoclean-program.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/industrial-machinery/lubewatch-oil-analysis.html
    - https://www.chevronlubricants.com/en_us/home/lubetek.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/preferred-vendors.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/preferred-vendors/checkfluid.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/preferred-vendors/des-case.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/trade-shows-and-events.html

- Become a distributor (1). Added 2026-10-31 (customer request; linked from the footer "Work With Us" and "Become a Chevron lubricants distributor"). Imported with the expertise-services template (same AEM components). Requested together with re-imports of havoline/business (expertise-marketing) and havoline-oil-change-pros (expertise-services).
  - https://www.chevronlubricants.com/en_us/home/become-distributor.html

- Chevron Warranty (1). Added 2026-10-31 (customer request; linked from the header top bar "Chevron Warranty" and the Products menu "Review the Chevron warranty", and the footer "Product Warranty", all relinked). Imported with the expertise-services template (banner image, title, rich text).
  - https://www.chevronlubricants.com/en_us/home/chevron-warranty.html

- Remaining site pages (160). Added 2026-10-31 (customer request: "search for and migrate any remaining pages"). Found by crawling the US-English site from the homepage (no sitemap on the source): 498 unique `/en_us/home` pages, minus the 137 already migrated and 180 product detail pages (out of scope, below); plus the 3 Lube Matters category pages, which the crawl only reached through mangled `.html.html` links. Customer decisions: build site search on the new site (the search results page is imported with a new `search` block over the site query index, `helix-query.yaml` index `site`, and the header search submits to it); earlier decisions apply (embedded tools stay embedded, Salesforce forms link to the live form, store locators reuse the `locator` block).
  - Not migrated:
    - Duplicate or mangled addresses (6; the canonical page is migrated): `/en_us/home/learning/about-our-brands/delo/the-delo-difference/off-highway-choose-delo.html.html`, `/en_us/home/learning/about-our-brands/isoclean/mining-start-clean-monitor-stay-clean.html-clean-stay-clean.html`, `/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment.html.html`, `/en_us/home/learning/from-chevron/industrial-machinery.html.html`, `/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment.html.html`, `/en_us/home/where-to-buy/find-a-distributor.html.html`.
    - Redirects on the source (14; candidates for the redirects sheet): `/en_us/home/learning/about-our-brands/havoline/havoline-pcmo-products.html` → `/en_us/home/learning/about-our-brands/havoline/gf-7-landing-page.html`; `/en_us/home/learning/about-our-brands/industrial-products/vartech.html` → `/en_us/home/learning/about-our-brands/industrial-products/gst-advantage.html`; `/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/are-you-optimizing-your-fleet-or-compromising-it.html` → `/en_us/home/learning/from-chevron/chevron-lubematters-blog-landing.html`; `/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/consolidation-without-compromise-a-single-solution-for-light-duty-equipment.html` → `/en_us/home/learning/from-chevron/chevron-lubematters-blog-landing.html`; `/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/axles-and-transmission-are-evolving.html` → `/en_us/home/learning/from-chevron/chevron-lubematters-blog-landing.html`; `/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/break-the-25000-mile-habit.html` → `/en_us/home/learning/from-chevron/chevron-lubematters-blog-landing.html`; `/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/fuel-economy-retention-just-what-does-it-mean.html` → `/en_us/home/learning/from-chevron/chevron-lubematters-blog-landing.html`; `/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/risk-of-excluding-routine-oil-analysis.html` → `/en_us/home/learning/from-chevron/chevron-lubematters-blog-landing.html`; `/en_us/home/learning/from-chevron/industrial-machinery/back-to-basics-understanding-oem-oil-cleanliness-standards.html` → `/en_us/home/learning/from-chevron/chevron-lubematters-blog-landing.html`; `/en_us/home/learning/from-chevron/industrial-machinery/managing-change-for-turbine-engine-oils.html` → `/en_us/home/learning/from-chevron/industrial-machinery/chevron-vartech-industrial-system-cleaner.html`; `/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/winterizing-your-vehicle.html` → `/en_us/home/learning/from-chevron/chevron-lubematters-blog-landing.html`; `/en_us/home/services/pro-services/personal-rec-vehicles/chevron-xpress-lube-become-an-xpress-lube-owner.html` → `/en_us/home/learning/about-our-brands/havoline/business.html`; `/en_us/home/services/pro-services/personal-rec-vehicles/havoline-xpress-lube-hear-from-real-xpress-lube-owners.html` → `/en_us/home/learning/about-our-brands/havoline/business.html`; `/en_us/home/services/pro-services/personal-rec-vehicles/havoline-xpress-lube-become-an-xpress-lube-owner.html` → `/en_us/home/learning/about-our-brands/havoline/business.html`.
    - Not found on the source (4): `/en_us/home/learning/about-our-brands/delo/tractor-restoration-competition/enter-2022-competition.html`, `/en_us/home/learning/about-our-brands/industrial-products/clarity-bio-elitesyn-aw.html`, `/en_us/home/learning/about-our-brands/industrial-products/gas-compression-and-processing.html`, `/en_us/home/learning/from-chevron/industrial-machinery/simple-solutions-for-meeting-equipment-manufacturers-oil-cleanliness-specifications-part-2-monitor.html`.
  - Pages:
    - https://www.chevronlubricants.com/en_us/home/search-results.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/ce-family.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/brenny-transportation-pdf.html
    - https://www.chevronlubricants.com/en_us/home/chevron-accessibility.html
    - https://www.chevronlubricants.com/en_us/home/landing-pages/special-offers-and-promotions.html
    - https://www.chevronlubricants.com/en_us/home/landing-pages/selecting-lubricants.html
    - https://www.chevronlubricants.com/en_us/home/chevron-products-selector.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/ecology-auto-parts/ecology-auto-parts-pdf.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/ecology-auto-parts.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/ce-family/ce-family-pdf.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/cox-construction-limited-pdf.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/deep-south-crane-rentals-inc/deep-south-crane-rentals-inc-pdf.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/deep-south-crane-rentals-inc.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/southeastern-stages-inc.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/harlow-s-bus-and-trucking-pdf.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/landwehr-construction-pdf.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/johnston-trucking-inc/johnston-trucking--inc-pdf.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/johnston-trucking-inc.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/ozark-motor-lines-pdf.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/toppen-family-farms-pdf.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/emissions-control-center/on-hwy-the-impact.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/emissions-control-center/on-hwy-the-proof.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/western-transport-pdf.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/emissions-control-center.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories/testimonials-delo-600-adf.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/the-delo-difference/off-highway-choose-delo.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/the-delo-difference/off-highway-true-cost-of-oil-operational-efficiency.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/the-delo-difference/off-highway-why-oil-matters.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/the-delo-difference/off-highway-true-cost-of-oil-equipment-durability.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/the-delo-difference/off-highway-true-cost-of-oil-equipment-reliability.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/the-delo-difference/on-highway-choose-delo.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/the-delo-difference/on-highway-true-cost-of-oil-equipment-reliability.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/the-delo-difference/on-highway-true-cost-of-oil-operational-efficiency.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/the-delo-difference/on-highway-true-cost-of-oil-equipment-durability.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/delo/the-delo-difference/on-highway-why-oil-matters.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/choosing-industrial-engine-oil/gas-gathering-compression-challenges.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/havoline/havoline-smart-change.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/havoline/havoline-promotions.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/havoline/faqs.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/havoline/drivers/products.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/clarity-aw.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/choosing-industrial-engine-oil/power-generation-impact.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/choosing-industrial-engine-oil/gas-gathering-compression-impact.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/choosing-industrial-engine-oil/power-generation-challenges.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/choosing-industrial-engine-oil/power-generation-solutions.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/choosing-industrial-engine-oil/gas-gathering-compression-solutions.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/clarity-elitesyn-aw.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/clarity-bio-elitetsyn-aw.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/greaseportfolio/condition.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/greaseportfolio/applications.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/greasethickeners.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/vartech-isc/vartech-isc-learn-more.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/greaseportfolio/moly.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/power-generation.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/plastics-products-manufacturing.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/greaseportfolio/thickener-type.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/mining-dont-assume-new-means-clean.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/construction-looking-ahead-to-isoclean.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/industrial-products/wood-products.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/construction-new-doesnt-mean-clean-enough.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/construction-start-clean-stay-clean.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/techron/promotions.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/mining-elevate-your-program-with-isoclean.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/waste-hauling-elevate-your-maintenance-program-with-isoclean-lubricants.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/mining-start-clean-monitor-stay-clean.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/isoclean/oil-and-gas-svcs-is-dirty-oil-impacting-your-business.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/arent-all-heavy-duty-oils-low-ash.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/techron/where-to-buy.html
    - https://www.chevronlubricants.com/en_us/home/learning/about-our-brands/techron/treat-rate-calculator.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/a-pc-12-progress-report.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/coolant-maintenance-best-practices.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/breaking-with-convention.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/chevrons-heavy-duty-natural-gas-engine-demo-program.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/fd-1-versus-to-4-for-heavy-duty-final-drives-whats-the-difference.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/coolant-maintenance-isnt-just-a-winter-thing.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/ecology-transportation-sees-dramatic-results-with-chevron-delo-600-adf.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/do-you-need-synthetics-everywhere.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/delo-600-adf-ultra-low-ash-diesel-oil-is-approved-for-cummins-natural-gas-engines.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/jump-starting-the-hydrogen-economy.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/how-light-duty-diesel-trucks-and-pickups-can-benefit-from-synthetic-oils.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/lubricating-final-drives-in-heavy-equipment-it-pays-to-follow-the-right-specifications.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/lets-dispel-some-common-misconceptions-about-fluid-analysis.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/just-what-does-viscosity-mean.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/hydrogen-fuel-for-internal-combustion-engines.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/lubrication-requirements-for-mobile-natural-gas-engines.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/one-answer-to-soaring-diesel-fuel-prices-a-different-engine-oil.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/more-complex-aftertreatment-systems-require-rethinking-oil-formulations.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/making-the-transition-to-synthetics.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/now-a-synthetic-solution-for-the-caterpillar-fd-1-final-drive-lubricant-spec.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/moving-hydrogen-ice-technology-forward.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/pc-12-update.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/the-future-of-axle-lubrication-is-evolving.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/the-cold-truth-synthetic-oils-shine-in-winter.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/registration-open-for-2024-tractor-restoration-competition.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/outlook-for-2026.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/the-future-of-cummins-natural-gas-engines.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/a-construction-managers-guide-to-summer-lubrication.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/the-road-ahead-is-clear-for-pc-12.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/think-a-grease-is-a-grease-think-again.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/what-the-volvo-vds-5-oil-specification-means-for-your-fleet.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/buy-in-to-buy-in.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/a-new-more-precise-approach-to-varnish-testing.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/ash-in-stationary-natural-gas-engines.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/addressing-grease-shortages-starts-with-soap-thickeners.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/avoiding-the-pitfalls-of-lubricant-incompatibility.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/can-on-site-filtration-damage-new-lubricants.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/dirt-dust-and-moisture-drive-hidden-equipment-costs.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/choosing-hydraulic-fluid-for-mining-and-construction-equipment.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/clean-hydraulic-oil-optimizes-equipment-performance.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/defect-elimination-from-a-lubrication-perspective.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/clean-living-how-to-improve-oil-cleanliness-throughout-your-operation.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/managing-oil-consumption-in-landfill-gas-engines.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/introducing-a-new-line-of-greases-to-keep-equipment-humming.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/does-a-change-of-season-mean-a-change-of-greases.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/generating-savings-through-lubricants-evaluation.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/looking-to-boost-operating-efficiency-look-at-your-hydraulic-fluid.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/measuring-lubricant-cleanliness-with-particle-counting.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/steps-to-a-lubrication-best-practice-program.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/nitrited-or-nitrite-free-coolants.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/not-all-coolants-are-alike.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/rising-demand-for-biodegradable-eals.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/varnish-removal-in-hydraulic-systems-a-real-world-test-case.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/the-top-10-factors-in-choosing-the-optimal-lubricant.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/varnish-removal-answers-to-frequently-asked-questions.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/the-importance-of-taking-a-data-rich-oil-sample-for-analysis.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/understanding-varnish.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/the-importance-of-natural-gas-engine-nge-coolant.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/zinc-free-synthetic-hydraulic-oils-environmental-protection-meets-operating-efficiency.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/why-proper-coolant-maintenance-matters.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/varnish-removal-solutions-how-effective-are-they.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/what-your-grease-is-already-telling-you.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/industrial-machinery/with-grease-appearances-can-be-deceiving.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/for-newer-cars-a-new-automatic-transmission-fluid.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/how-to-keep-your-gdi-engine-clean-and-efficient.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/coolants-101.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/difference-between-2t-motorcycle-oil-and-tc-w3-oil.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/choosing-the-right-viscosity-for-your-car-light-truck-or-suv.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/european-vs-american-engine-oils.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/protecting-your-vehicles-engine-as-it-ages.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/preparing-for-gf-7-specification.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/impact-of-gasoline-particulate-filters-on-fuel-economy.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/introducing-new-chevron-gf-7-products.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/new-havoline-lifelong-protects-both-new-and-high-mileage-vehicles.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/keeping-your-vehicle-longer-or-driving-it-more.html
    - https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery.html
    - https://www.chevronlubricants.com/en_us/home/products/equipment_type/off_highway_heavy_duty.html
    - https://www.chevronlubricants.com/en_us/home/products.html
    - https://www.chevronlubricants.com/en_us/home/products/equipment_type/gasoline_fleets_oil_change_service_centers.html
    - https://www.chevronlubricants.com/en_us/home/learning/from-chevron/personal-rec-vechicles-and-equipment/understanding-the-new-api-sq-category.html
    - https://www.chevronlubricants.com/en_us/home/products/equipment_type/on_highway_heavy_duty.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/personal-rec-vehicles.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/industrial-machinery/isoclean-program/reliability.html
    - https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles.html
    - https://www.chevronlubricants.com/en_us/home/services/pro-services/industrial-machinery/isoclean-program/start-clean.html
    - https://www.chevronlubricants.com/en_us/home/where-to-buy.html
    - https://www.chevronlubricants.com/en_us/home/subscribe.html
    - https://www.chevronlubricants.com/en_us/home/where-to-buy/find-a-product.html

### Out of scope (for now)

- Other product detail pages (`/en_us/home/products/<product>.html`, 160+ overall), except the explicitly authorized Delo, Havoline, Techron and deduplicated Industrial/ISOCLEAN inventories above. These will be delivered later via Edge Commerce (Product Bus). Listing-page link updates are not part of the product detail-template change.
