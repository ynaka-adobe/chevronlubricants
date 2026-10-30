# carousel-square

Custom **carousel** block. Purpose: featured customers showcase.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 row per slide: [square image | linked title paragraph + caption paragraph].

## Supported variations

- `side-by-side`: equal, unscaled 190px tiles (160px on mobile) in a five-tile strip, 14px titles, no caption. Applied automatically when no slide has a caption paragraph (techron, isoclean pages).
- Slides whose links point to YouTube/Vimeo/mp4 get a play-button overlay on the image (`is-video`).

## Universal Editor fields

N/A (Document Authoring project)

## Notes

1 row per slide: [square image (optionally linked) | linked company-name paragraph + optional person-name caption paragraph]. Caption shows below the strip for the centred slide.

Accessibility: region with `aria-roledescription="carousel"` named after the heading just above the block; slides are `div[role=group][aria-roledescription=slide]` (not `li`, which axe flags as a broken list); off-centre slides are `aria-hidden` with their links removed from the tab order; arrows/dots are labelled buttons with 24px+ targets; Left/Right arrow keys work while a control has focus; transitions are disabled under `prefers-reduced-motion`.
