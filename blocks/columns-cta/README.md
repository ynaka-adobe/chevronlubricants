# columns-cta

Custom **columns** block. Purpose: call-to-action.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 row x N cells, each a single link (optional icon image) or plain text.

## Supported variations

| Variation | Option class |
| --- | --- |
| Links | `links` |
| Red | `red` |
| Icons | `icons` |

## Universal Editor fields

N/A (Document Authoring project)

## Notes

One row of N cells (4 on source), one link per cell rendered as a pill button. Pair with section style 'blue-bg' and a default-content heading above; inside blue-bg/grey-bg bands the pill row widens past the band padding, elsewhere it stays inside the 1176px container. A cell with no link renders as plain text: with button cells this is the panel-with-button band (text + white square button, two equal halves from 768px). An image before the link text renders as an icon: multi-cell icon rows render as social links (30px icon above a 10px label), a single icon link renders inline (20px icon + 16px label). Option links: underlined inline text links (filter rows).

Option red ("Columns-Cta (red)"): Havoline jump links (gf-7 landing page). Each link is a #b5121b square button with a white bold label, and the hover is #870d14. The buttons are stacked 15px apart until 1200px, then sit in one row of equal columns. The first button aligns to the end of its column, the last to the start and the middle ones are centered, as on the source.

Option icons ("Columns-Cta (icons)"): icon-only social rows (Techron and Havoline "Connect with us"). Author each cell as an icon image plus a link whose text is the network name. The icons render at 78px, centered in 1/6-width columns inside a light 1px box, and stack below 1200px. The link text stays as the link's accessible name but is visually hidden. The image alt is cleared so the name isn't read twice.
