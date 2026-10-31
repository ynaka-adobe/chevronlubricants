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

- Product detail pages (`/en_us/home/products/<product>.html`, 160+). These will be delivered later via Edge Commerce (Product Bus). Product links on migrated listing pages keep pointing to the live site until then.
