# isoclean-calculator

Custom **isoclean-calculator** block. Purpose: ISOCLEAN® Cleanliness Calculator. The visitor picks an industry, an equipment component and the environment their bulk lubricant is stored in, and sees the target ISO cleanliness code for that component next to the current code for that storage environment.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: N rows x 2 cells: [key | value].

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Keys

Only `Data` is required. Key names are matched case-insensitively, with spaces read as hyphens.

| Key | Notes |
| --- | --- |
| Data | Link to the data sheet (see below). |
| *industry name* | A row whose value is an image is the icon for that industry; the key must match the `Industry` column exactly. |
| Intro | Text shown above the result. |
| Note | Footnote under the result (explains the `*` on the target code). |
| More information | Link shown as the main button under the result. |
| Representative | Link or text under the result. |
| Credit | Data credit (logo and text) at the bottom of the result. |
| Step 1, Step 2, Step 3 | Step titles. Defaults: `Select your industry type`, `Select your equipment and component type`, `Select environment of bulk lubricant storage`. |
| Industry label, Equipment label, Environment label | Prefixes in the step bar once a step is done. Defaults: `Industry`, `Equipment`, `Environment`. |
| Component prompt, Select label, Target label, Current label, Code caption, Start over, Loading message, Error message | Other labels; defaults in `isoclean-calculator.js` (`DEFAULTS`). |

## Data sheet

Multi-sheet JSON (a Document Authoring sheet with three tabs):

- `components`: `Industry` | `Group` | `Equipment` | `Component` | `Target`. One row per equipment component; `Target` is the recommended ISO code (e.g. `20/18/15`). `Group` (e.g. `Mobile Equipment`) groups equipment in step 2.
- `scenarios`: `Environment` | `Label` | `Heading` | `Summary` | `Current` | `Photo` | any further columns. One row per storage scenario; rows with the same `Environment` form one tab in step 3. Every further column (e.g. `Storage tank location`) is shown as a detail of the scenario.
- `targets`: `Code` | `Photo`. Oil-sample photo shown next to each target code (optional).

The current site's data (321 components, 12 scenarios) was taken from the source calculator, whose data is provided by Noria.
