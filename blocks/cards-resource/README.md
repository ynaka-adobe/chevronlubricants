# cards-resource

Custom **cards** block. Purpose: resource downloads, videos and case studies.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 row per card: [image | bold title + text + CTA link].

## Supported variations

| Variation | Option class |
| --- | --- |
| Blue caption | `blue-caption` |
| Unboxed customer grid (blue name, bold company line, no tile shadow); auto-applied when every card image is linked | `unboxed` |
| Logo list (retailer rows: logo, text, Visit button on a grey panel); auto-applied when every card CTA reads "Visit" | `logo-list` |

Cards whose CTA is a download (PDF link, or link text starting with "Download") render as centred tiles with a blue button CTA; other CTAs render as bold underlined text links. Auto-decorated button classes on links inside the block are removed so the block controls the CTA look.

## Universal Editor fields

N/A (Document Authoring project)

## Notes

1 row per card: [image (optionally linked: YouTube watch URL / case study / PDF) | optional bold title or name, text, CTA link last]. Append #_dnb to YouTube links so they stay links (otherwise the youtube auto-block embeds them).
