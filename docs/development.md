# SHIFT development

Suite-wide steps (shared Core changes, release order, screenshots, adding a product) are in [exp-core's maintainer guide](https://github.com/ExtraPotions/exp-core/blob/main/docs/development.md). This page covers what is specific to SHIFT.

## Source layout

- `src/` holds the modules. `scripts/build.cjs` lists them in load order and wraps them, with the vendored Core, into `shift.user.js`. Add a new module to that list.
- `src/release-notes.js` holds the in-app release notes and `QUIET_RELEASES`.
- `vendor/exp-core/` is the bundled Core. Change it only by syncing from exp-core.
- [architecture.md](architecture.md) explains the engine; [testing.md](testing.md) lists what the tests cover.

## Commands

| Task | Command |
|---|---|
| Build | `npm run build` |
| Check the build is current | `npm run build:check` |
| Full suite | `npm test`, or after a build `node --test --test-concurrency=2 tests/*.test.cjs` |
| Release check | `npm run release:check` |
| README screenshots | `npm run screenshots` (exp-core must sit beside SHIFT) |
| Feature release | `RELEASE_NOTES_JSON='["…","…"]' npm run prepare:release:feature` (add `RELEASE_QUIET=1` for a quiet one) |

## Things the release check holds fixed

- The newest changelog heading matches `package.json`, has 2 to 4 bullets, and every bullet appears in the in-app notes.
- `docs/screenshots/` contains exactly two PNG files, matching the README and `docs/screenshots.config.cjs`.
- No `RELEASE-NOTES-*` files and no legacy preview images.
- No remote executable code and no dynamic execution.
