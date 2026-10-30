# cards-service

Custom **cards** block. Purpose: service / benefit links.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 row per tile: [icon | linked h3 title + description].

## Supported variations

No authored variations. Layout is chosen by the block JS from the content:

- tiles with a description paragraph: icon left (25%), centred title + description right
  (delo self / pro services, gf-7 benefits)
- title-only tiles: image on top, centred title below (`cards-service-stacked`, added
  automatically; contact-us, industrial-products)
- inside a `black-bg` section: unboxed white tiles with 4px white dividers

## Universal Editor fields

N/A (Document Authoring project)

## Notes

1 row per tile: [icon image (~80px) | title (h3, optionally linked) + description paragraph].
1-4 tiles per row on desktop (50% / 33% / 25% wide); a single tile is centred at one third.
