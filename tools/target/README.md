# Target author app

Repository import of the actual [DuPont `tools/target` app](https://github.com/ynaka-adobe/dupont/tree/ebc0c90714f47aa690c88c3d4ffd6a399fe44ce0/tools/target),
adapted under the repository's Apache-2.0 license. This is not a link to the
Adobe Target console and does not install a new visitor personalization runtime.

Open `/tools/target/target.html`. The frontend retains the source activity list,
selection, Experience Targeting creation, offer selection/change, and DA
insertion workflow. Other activity types were source "coming soon" alerts, not
implemented creation APIs; only supported XT creation is offered here.

## Current availability

The repository app is available independently of DA configuration access.
`config.json` deliberately has an empty `runtimeUrl`: the app shows an actionable
configuration-required state and makes **no Target API requests**. There are no
sample activities, copied tenant routes, stored tokens or credential defaults.

DA app-menu registration is **not installed by this repository change**. The
existing site configuration could not be authenticated (HTTP 401), so its
`apps`/`prepare`, EMA, credentials and library registrations remain untouched.
Once an authorized DA administrator can inspect those existing registrations,
add the app URL for this site without replacing other rows. Use the official DA
app panel to supply `{org, repo, path}`, the current Adobe author token and
`actions.sendHTML`; this app rejects a different site's context. A standalone
tab cannot supply DA authoring capabilities.

## Approved backend contract

Set `runtimeUrl` only to an **approved Chevron-owned HTTPS backend**. Do not copy
DuPont's shared runtime, tenant, client ID or service secrets. Query parameters,
embedded credentials and URL fragments are rejected.

The backend must authorize the current DA author for Chevron and Target
operations before using any service credentials. A DA token's mere existence is
not Target authorization. Browser requests send the current SDK token only in
the `Authorization: Bearer` header, without cookies or token persistence. The
backend must validate that token, restrict authorized authors/site/operations,
and provide the appropriate CORS policy for the chosen Chevron app origin.
No compatible deployed backend or its authorization has been established.

Read requests are `GET ?resource=activities|offers|audiences|activity`; activity
details also include `id`, `type` and `version=v3`. List responses must contain
the corresponding `activities`, `offers` or `audiences` array. Provider failures
must be non-2xx or explicit JSON errors, not success-shaped empty lists.

Mutations use `POST ?resource=create-xt|update-offer` with JSON:

- `create-xt`: `name`, `mbox`, `offerId`, optional `audienceId`.
- `update-offer`: `id`, `type`, `offerId`.

These are the source app's operations, but **not its unauthenticated mutation
URLs**. The source web action must not be deployed unchanged: an approved
backend must authenticate/authorize requests and parse these POST bodies.
Its server-side Target provisioning needs `TARGET_CLIENT_ID`,
`TARGET_CLIENT_SECRET`, and `TARGET_TENANT`, with the proper Target SDK scopes.
Never put these values in this app, `config.json`, authored HTML or a browser
bundle. The source token-refresh script and public service-credential action
were intentionally not imported. No provider activity was created or changed
while importing or verifying this app.

## DA insertion and visitor delivery

Selected activities with a supported mbox can send an escaped `target-offer`
table and separate metadata table to DA. An intervening paragraph preserves
the source workaround for DA merging adjacent tables. Metadata uses Chevron's
existing `target=1` gate, not DuPont's incompatible `target=on`.

`sendHTML` is an authoring request, not a save acknowledgement. The app tells
the author to review and save, and never claims persistence from an undefined
SDK return. It does not replace or automatically save the document.

The accompanying `blocks/target-offer` provides a stable named slot and fallback
content. **It does not fetch or apply Target offers.** Chevron's existing
consent-gated numeric persona transmission, hero/card filtering and analytics
are unchanged. Live activity/offer delivery and audience matching still require
separately verified visitor-side Target provisioning; this repository-only
author-app import does not claim that delivery works.

Nothing imports this app or the DA SDK into ordinary visitor pages. GenAI,
Persona, production Sidekick visibility and all existing author gates remain
unchanged. Workfront and Personalize are separate apps.
