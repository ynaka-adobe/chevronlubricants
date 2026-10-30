# hero-overlay

Custom **hero** block. Purpose: banner with overlaid intro text.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 rows: [photo] [text].

## Supported variations

No authored variations. The block JS picks the overlay style from the text row:

| Text row | Class | Desktop (>= 900px) |
| --- | --- | --- |
| a link only | `hero-overlay-cta` | red pill button, bottom-left (source `.buttonOverlay`) |
| short text (<= 60 chars), all bold | `hero-overlay-label` | 30px bold, centered, one line per bold run |
| short text (<= 60 chars) | `hero-overlay-display` | 50px tagline |
| anything longer | (none) | 16px body copy in a 563px box |

## Universal Editor fields

N/A (Document Authoring project)

## Notes

- 2 rows: [background photo] [text: paragraph, optional heading and CTA].
- Desktop overlay geometry scales with the image (container query units; 1176px = source size).
- Below 900px the text stacks under the photo in brand copy blue.
- Text overlays get a soft blurred scrim behind the copy so white text keeps >= 4.5:1 on light spots of the photo.
