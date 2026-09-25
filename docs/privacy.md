# Privacy

SHIFT processes page structure and computed styles locally in the browser. It does not send page contents, settings, browsing history, theme/profile names, or diagnostics to ExtraPotions or another service.

There is no telemetry, analytics, cloud backup, advertising identifier, or remote executable loading.

Quiet update notifications are disabled by default. If explicitly enabled, SHIFT requests `https://api.github.com/repos/ExtraPotions/SHIFT/releases/latest` at most once daily to compare release version metadata. It does not send page data or settings and never downloads or executes update code itself.

Copied diagnostics include product/Core versions, lifecycle and adapter states, bounded performance counts, and sanitized error codes/messages. They exclude page text, user-entered record names, selectors, query strings, credentials, tokens, and browsing history.

Export and import are explicit local user actions. Export creates a local JSON file; import reads the file selected by the user and validates product ownership, generation, schema, types, and allowed values before committing.
