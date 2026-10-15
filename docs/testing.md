# Testing and Support Evidence

Automated tests cover:

- Core lifecycle order/idempotency, missing-capability failure, compatible-version selection, and incompatible-protocol isolation;
- inert Original first run;
- menu tab structure and absence of checkbox controls;
- appearance live-commit on swatch/select change with immediate engine effects;
- host CSS on SPA app shells, stylesheet reattach after node theft, and open shadow painting;
- artwork protection;
- narrow viewport containment and launcher reachability;
- supported-site adapter control visibility, persistence, page classification, and style effect, with each switch checked against a neighbouring element it must leave alone;
- the per-site image and video blur: applied before page load, revealed on hover and keyboard focus, saved for one site only, and cleared by Reset this site;
- userscript metadata, package/version agreement, absence of remote executable dependencies/dynamic execution, and clean-generation storage rules.

README screenshots in `docs/screenshots/` provide the current visual evidence for menu layout and palette presentation. Refresh them with `npm run screenshots` (needs exp-core checked out beside SHIFT).

Tested locally with the bundled Playwright Chromium for the Windows development host. Other browsers and userscript managers remain unverified rather than declared unsupported.

Live-site testing is supplemental. Deterministic fixtures are authoritative because live markup changes without notice.
