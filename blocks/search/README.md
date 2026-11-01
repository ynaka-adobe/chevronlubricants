# Search

Site search results page, rebuilt for `/en_us/home/search-results.html` (customer decision
2026-10-31: build site search instead of linking to chevronlubricants.com's search).

The block reads the site query index (`helix-query.yaml`, index `site` →
`/query-index.json`: `path`, `title`, `description`, `image`, `content`) and matches every
search word against the title, description and page text. Title matches rank first.

## Content model

Library convention: one column, one row with a link to the query index to search. Without
it, `/query-index.json` is used. 8 results per page (as on the source).

| Search             |
| ------------------ |
| /query-index.json  |

## Behaviour

- Query from `?q=` (the header search form submits `q` to this page) or the block's own form.
- Heading `Search "term"`, then the results: title link, description (or a text snippet around
  the first match), and the page URL, with the search words in bold.
- Status line (`role="status"`): `1 - 8 of N results`, "No results" or a prompt.
- Pagination: Prev, up to 10 page numbers, Next (`?page=`).

The index only covers pages that have been previewed or published after the `site` index was
added; results update as pages are published.
