# accordion-drawer

Custom **accordion** block. Purpose: expandable benefit stories with case studies.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 row per drawer: [header photo + title | intro + case-study groups (image, bold title, link)].

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Notes

1 row per drawer: [header photo + title text (paragraph) | intro paragraph(s), then repeated case-study groups: image, bold title paragraph, link paragraph].

- An image with no title/link after it (e.g. the Techron history infographic) renders as a standalone centred panel image, not a tile.
- Case-study links are plain bold text links; the JS strips the auto-decorated `btn` classes.
- The +/- toggle lives inside the `<summary>` but is drawn at the foot of the drawer, so it sits below the panel when open (as on the source).
- Tiles stack below 1200px; from 1200px 3 tiles use 33% columns, 4 tiles 25%, 2 tiles 25% centred.
