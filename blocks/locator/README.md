# locator

Custom **locator** block. Purpose: store / distributor / installer finder.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: N rows x 2 cells: [key | value].

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Keys

Only `Type` is required. Every other row overrides a default. Key names are matched case-insensitively, with spaces read as hyphens.

| Key | Default / notes |
| --- | --- |
| Type | `distributor` \| `installer` \| `retailer` |
| Brands | distributor: none (brand field hidden); installer: `Havoline` (preselected); retailer: `Delo, Havoline, Techron` (required choice) |
| Radius options | `10, 20, 30, 40, 50, 60, 70, 80, 90, 100` |
| Default radius | distributor `100`, installer `40`, retailer empty (user must choose) |
| Certified filter label | `Certified marketers only` (distributor only, adds `isoclean=1`) |
| Placeholder | `Zip or City,State` |
| Button label | `Search >` (a trailing `>` becomes an icon) |
| My location label | `Use my location` |
| Required message | `*required field` |
| No results message | `No locations found.` (retailer) |
| Searched again message | distributor/installer 200-mile retry found results. Tokens `[RADIUS]` `[SEARCH_AGAIN_RADIUS]` `[RADIUS_UNITS]` |
| Searched again empty message | the retry was empty too (same tokens) |
| Error message | `Error getting data. Please try again.` (service failure or 15 s timeout) |
| Geocode error message, No key notice, Location denied message, Location unsupported message, Searching message | see `contentPattern.keys` in metadata.json |
| Results heading / Results heading single | `[COUNT] locations found` / `1 location found` |
| Badge certified / Badge elite / Badge first source / Badge preferred | `Certified Marketer` / `Chevron 1st Source Elite` / `Chevron 1st Source` / `Chevron Preferred` |

## Google Maps key

ZIP/city search and the map need a key. Add a `google-maps-api-key` row to the site configuration sheet (`/configuration.json`, columns `key` and `value`). Restrict the key by HTTP referrer, and to the Maps JavaScript API and the Geocoding API.

Without a key, the block hides the ZIP field and the map. It searches from the browser location ("Use my location") and shows the no-key notice.

## Entry links

`?zip=77002&brand=delo&radius=50` pre-fills the form. The search runs automatically when a key is configured, or when location permission was already granted.

## Styling assets

`images/` holds the source locator icons (`square-directions`, `square-call`, `square-website`, `isoclean-small`, `cvx-preferred-star`, `isoclean-inverse`). The CSS applies them as backgrounds, so the block JS emits no image markup. On mobile the phone link shows the call icon; from 768px the website link shows the website icon and the phone renders as plain black text, as on the source.
