# tool-embed

Custom **tool-embed** block. Purpose: show an external web tool (product selector, calculator, assessment) inside the page, as the source pages do with an iframe.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: N rows x 2 cells: [key | value].

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Keys

Only `URL` is required. Key names are matched case-insensitively, with spaces read as hyphens.

| Key | Notes |
| --- | --- |
| URL | Address of the tool. Must start with `https://`, otherwise the block is removed. |
| Title | Name read out by screen readers for the embedded tool. Defaults to the tool's host name. |
| Width | Maximum width in pixels. The tool shrinks to fit narrower screens. Default: full width. |
| Height | Height in pixels. Default: `600`. |

The tool loads when the block scrolls into view. The tool's owner must allow it to be embedded on this site.
