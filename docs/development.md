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

## Single local release gate

Run `npm run verify:release` once. It builds and runs all release checks, including the full suite and published Core pin check. Do not run `npm test` separately first. Windows test entry points limit concurrency to two files; CI keeps its normal concurrency.

Publishing calls the reusable Verify workflow and reuses its checked artifact for the exact commit. Commit generated files before requesting a release; CI rejects build drift rather than committing or rebasing during publication. The publisher checks the stored commit and SHA256 checksums and does not rebuild.

Claude, Codex and Antigravity should follow this gate and acknowledge the applicable workflow rules in their next handoff. The workspace AGENTS.md contains the shared routing; completed history belongs in HANDOFF.md, with TASK.md limited to the current assignment.
