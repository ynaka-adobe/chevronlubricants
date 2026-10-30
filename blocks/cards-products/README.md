# cards-products

Custom **cards** block. Purpose: featured-products.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: N rows (6 on source) x 2 cells: image cell + text cell.

## Supported variations

| Variation | Option class |
| --- | --- |
| Grid | `grid` |

Default (no option): horizontal carousel with prev/next arrows and dots, one card per step. In a section that also holds a `grid` block (listing and brand pages), the carousel uses the listing tile style: 1140px row, white 269x328 tiles, copy clamped to 4 lines. The homepage carousel is unchanged.

`grid` (author as `Cards-Products (grid)`): wrapping listing grid in the page text column (1116px at >= 1200px), 1 / 2 / 3 / 4 columns at < 768 / 768-991 / 992-1199 / >= 1200px, no carousel controls. Same rows and cells as the default. When there are more than 4 cards, the first 4 show and a "See all (N) >" button (`aria-expanded`, `aria-controls`) reveals the rest. The button goes inline at the end of the category heading (h2-h4) directly before the block, which gets the class `cards-products-heading`; with no such heading it goes below the grid. After it is clicked it hides and moves focus to the first revealed card. Tiles keep the "Learn More" link and the button (last link) at the bottom. A short paragraph with no link directly before the bullet list (e.g. "Benefits") renders as the list label.

## Universal Editor fields

N/A (Document Authoring project)
