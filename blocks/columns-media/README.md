# columns-media

Custom **columns** block. Purpose: feature / explainer.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 row x 2 cells: [photo | heading + paragraph + button].

## Supported variations

- *(default)*: no frame; photo at its intrinsic width (max 60% on desktop), text panel fills the rest. 24px bold dark-blue heading, 16px black copy, left aligned (Delo simplify-your-fleet-protection, Havoline, Techron).
- `card`: each column is its own shadowed card (source `.multi-column__item--card-shadow`), centred #0066b2 heading and button, #333 copy (ISOCLEAN landing, mining, construction, Techron FAQs).
- `centered`: centred heading and button without the shadow (ISOCLEAN waste-hauling, Delo field-trial).

## Universal Editor fields

N/A (Document Authoring project)

## Notes

1 row, 2 cells: [photo | heading + paragraph + button]. Cells render in authored order (photo left or right on desktop, first or second on mobile); empty spacer paragraphs are dropped. A single standalone link paragraph renders as the button (#0066b2, square); two or more link paragraphs stay text links.
