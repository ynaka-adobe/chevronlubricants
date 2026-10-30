# cards-filterable

Custom **cards** block. Purpose: filterable resource library (knowledge center).

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: Sheet mode: 1 row, 1 cell = link to sheet .json (+ optional preselected-filter row). Static mode: 1 row per item: [thumbnail | linked title + "Brand, Type" tags].

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Notes

Sheet mode: row 1 = one cell with a link to a sheet .json (columns title, link, image, video, brand, type, lastModified; brand/type comma-separated); optional row 2 = preselected filters ("Brand: X" / "Type: A, B"). The link is resolved against the page; on local dev (/content/...) /content is prefixed. Static mode: 1 row per item [thumbnail (video: linked to YouTube, add #_dnb) | linked title + tags paragraph "Brand, Type[, Type]"]. Filter: OR within a group, AND across groups. Static items without tags render as a plain grid (no filter panel), e.g. blog related articles.

Behavior: "Filter by" toggles the blue panel; each group (Brands / Type) is collapsible (expanded by default, +/− sign). Apply Filter applies the checked boxes, collapses the panel and shows removable chips plus a "Clear All" link next to "Filter by". Broken or missing thumbnails are replaced by a neutral 16:9 placeholder (play overlay kept for videos).
