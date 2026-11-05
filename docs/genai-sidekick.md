# Generate with AI Sidekick app

Chevron includes DuPont's actual in-page GenAI integration. **Generate with AI** fires
`custom:aem-genai-variations-sidekick` and loads Adobe's hosted Sidekick client
only on the author's first click. The client opens its panel on that page,
supports content selection/preview, and handles closing/reopening the panel.

Install/configure the [AEM Sidekick extension](https://www.aem.live/docs/sidekick-extension)
for `ynaka-adobe/chevronlubricants`, reload its project configuration, and open an
authored preview, live page, or `chevronlubricants.ynaka-adobe.com`. Both
`aem-sidekick` (V2) and `helix-sidekick` (V1) events are supported, including
Sidekicks announced after page load. Click **Generate with AI**.

The integration does not infer owner/site from the custom hostname or rewrite
`.html`, encoded product paths, queries, or fragments. Adobe's client passes the
current browser URL as `pageUrl`, with `source=plugin` and the browser locale,
to its hosted panel. The extension's project configuration remains responsible
for Sidekick's preview/live/production context.

No GenAI module, client, or panel is loaded for a page without an injected
Sidekick. An injected Sidekick initializes the local event adapter; Adobe's
external client is still click-only. Scheduler and Quick Edit retain their
existing non-production gates, and open Sidekick visibility does not depend on
`is-ready`. Visitor consent/analytics are unchanged. The user subsequently
requested removal of the old **Generate Variations** navigation entry;
**Generate with AI** remains the in-page GenAI app alongside **Persona**.

## Authentication and external dependencies

The client and panel are hosted by Adobe:

- [Sidekick client](https://experience.adobe.com/solutions/aem-sites-genai-aem-genai-variations-mfe/static-assets/resources/sidekick/client.js?source=plugin)
- [Sidekick panel](https://experience.adobe.com/solutions/aem-sites-genai-aem-genai-variations-mfe/static-assets/resources/sidekick.html)
- [Adobe access prerequisites](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/ai-in-aem/generate-variations/generate-variations#access-prerequisites)

Generation requires the author's Adobe sign-in, an entitled AEM as a Cloud
Service with Edge Delivery Services product profile, available generative
actions, and acceptance of Adobe's Generative AI guidelines. Image generation
additionally requires Adobe Express entitlement. The repository supplies no
tokens, tenant IDs, new backend, or simulated AI responses. A sign-in or
entitlement screen is not proof that generation succeeded.

If the client fails to load, an explicit console error is logged and the next
button click retries without duplicate scripts or panels. Adobe owns the
panel's authentication and service errors.

This is a rendered-page Sidekick app, not a DA editor plugin. No DA app sheet,
CDN configuration, or content deployment is changed.

## Reference

DuPont main was inspected at
[`ebc0c907`](https://github.com/ynaka-adobe/dupont/commit/ebc0c90714f47aa690c88c3d4ffd6a399fe44ce0):
[configuration](https://github.com/ynaka-adobe/dupont/blob/ebc0c90714f47aa690c88c3d4ffd6a399fe44ce0/tools/sidekick/config.json),
[event adapter](https://github.com/ynaka-adobe/dupont/blob/ebc0c90714f47aa690c88c3d4ffd6a399fe44ce0/tools/sidekick/aem-genai-variations.js),
and [lazy wiring](https://github.com/ynaka-adobe/dupont/blob/ebc0c90714f47aa690c88c3d4ffd6a399fe44ce0/scripts/scripts.js).
Only the integration contract is reused; DuPont content, branding, and
tenant-specific integrations are not copied.
