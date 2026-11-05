# Workfront author app

Imported from [DuPont tools/workfront](https://github.com/ynaka-adobe/dupont/tree/ebc0c90714f47aa690c88c3d4ffd6a399fe44ce0/tools/workfront)
under Apache-2.0, adapted for portable configuration, safe rendering and an
authenticated, memory-only OAuth transport.

Entry points:

- `/tools/workfront/workfront.html`: projects, member/owner filters, tasks,
  issues, documents, details, approval readback, task/issue creation and editing.
- `/tools/workfront/approval.html`: the source task-completion author workflow.

## Current state

The repository import does not register these apps in DA. Existing DA app,
prepare, EMA, credential and library settings are untouched; available
configuration access returned HTTP 401. Authorized DA registration must be
completed separately, preserving existing rows. The official SDK supplies
Chevron `{org, repo, path}` when opened in a DA document. Standalone tabs
explicitly report unavailable DA context; Workfront-only features can work
with their own authorized provider session and do not write DA documents.

The four public values in `config.json` are intentionally empty. The app
reports **Workfront setup required** and makes no runtime/provider requests.
No compatible Chevron OAuth/API broker has been established or deployed.
No Workfront records were created or changed during the import.

## Required secure broker

Configure administrator-approved `runtimeUrl`, `workfrontOrigin`,
`oauthClientId` (public ID, never a secret), and `oauthRedirectUri`. URLs must
be HTTPS without embedded credentials, query strings or fragments. The
redirect must belong to the exact runtime origin.

The DuPont action is **not compatible unchanged**: its tokens-in-query and
browser refresh-token storage must not be used. No service action or
token-refresh script is deployed by this import. A provisioned broker must:

1. Handle `GET resource=oauth_start`, validate the public client, exact
   registered redirect and allowed caller origin, and bind the random `state`
   to an OAuth authorization session. Do not treat caller-supplied state or
   origin as authorization without server-side validation.
2. Exchange the provider code server-side using the site's approved Workfront
   credentials and configured redirect; keep the client secret and any refresh
   token server-side.
3. Return a popup `postMessage` from the exact runtime origin to the exact
   allowed caller origin: `{type:"wf_tokens", state, access_token, expires_in}`.
   Do not include a refresh token. The frontend checks origin, popup identity,
   state and expiry (1–86400 seconds), and rejects mismatched messages.
4. Validate and authorize every API request. The browser sends the access token
   **only in the Authorization Bearer header**, never URLs or browser storage.
   Prefer a short-lived broker-scoped token rather than exposing a provider
   token. Enforce site/client/user privileges, allowlisted operations, CORS and
   appropriate server-side validation; never log tokens.
5. Accept read resources as GET query parameters and create/update resources
   as POST JSON. Never put provider credentials into upstream URLs.

Read resources: `projects`, `tasks`, `issues`, `documents`, `approval`,
`current_user`, `search_users`, `task_statuses`, `issue_statuses`.
Mutations: `create_task`, `create_issue`, `update_task`, `update_issue`.
The app's `runtime.js` defines exact parameter allowlists; provider response
lists are arrays, optionally wrapped in `{data: ...}`. Status lists contain
`{key,label}`. Return non-2xx or an explicit `error` on failure.

Tokens expire in memory, are discarded on close/navigation/disconnect, and
require reconnecting. There is deliberately no localStorage, cookie or
browser refresh-token persistence. OAuth verification and provider data
access remain unverified until an approved compatible broker is configured.

Ordinary visitor pages do not import these tools or the DA SDK. GenAI,
Persona, visitor personalization/consent/analytics and production Sidekick
visibility are unchanged.
