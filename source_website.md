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

### Out of scope (for now)

- Other product detail pages (`/en_us/home/products/<product>.html`, 160+ overall), except the 40 explicitly authorized Delo and 17 Havoline products above. These will be delivered later via Edge Commerce (Product Bus). Listing-page link updates are not part of the product detail-template change.
