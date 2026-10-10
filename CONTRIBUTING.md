# Contributing

Thanks for looking. `main` is protected: nobody pushes to it directly, every
change arrives as a pull request, CI must pass, and the maintainer reviews
and merges. That is not a gate to keep people out; it is how a connector
that can refund orders and delete contacts stays trustworthy.

## How to contribute a change

1. **Fork** the repository and create a branch in your fork
   (`fix/forms-integrations-readback`, `feat/fluentbooking`).
2. Make the change, add or update a test, run `npm test`, and if you
   touched `tool-map.json` or `endpoints.json`, run
   `npm run gen:maps && npm run build && npm run gen:catalog` and commit
   the regenerated files.
3. Add a line to `CHANGELOG.md` under the next version.
4. Open a pull request against `main`. The template asks for what changed
   and why; CI runs the tests and checks the generated files are in sync.
5. The maintainer reviews. Small, focused PRs get merged fastest; a PR that
   adds a product or changes safety classification will get questions,
   because those are the decisions recorded in `docs/DECISIONS.md`.
6. This repository is published from the maintainer's main UpFluent
   repository. An accepted PR is applied there (you stay the commit's
   co-author) and arrives here with the next publish, which then closes it.

The fastest way to be useful:

1. **Bugs against a real site** — open an issue with the tool name, the exact
   arguments (redact anything private), the response, and what you expected.
   `verify_setup` output is helpful.
2. **A wrong or missing tool** — the tool surface is generated. Fix the map,
   not the tool: `docs/api-reference/<product>/endpoints.json` (what exists) →
   `src/products/<product>/tool-map.json` (area assignment, destructive
   overrides, body notes, read-back guards) → `npm run gen:maps`.
3. **A new WPManageNinja product** — follow `docs/EXTENDING.md`; the
   table-driven test suites pick it up automatically.

## Working locally

```bash
npm install
npm test                  # vitest, mocked HTTP — no site needed
npm run build
npm run gen:catalog       # regenerates TOOL_MAP.md / TOOL_CATALOG.md / manifest sync
node --env-file=.env scripts/smoke-test.mjs   # optional: read-only checks against a real site
```

Keep changes focused, add a test when behaviour changes, run
`npm run build && npm run gen:catalog` before committing so the generated docs
stay in sync, and add a line to `CHANGELOG.md` under the next version.

## Releasing

Releases are published from the maintainer's main repository, which pushes
the release commit here as `upfluent-bot` together with a `v<version>` tag.

1. Bump `version` in `package.json` and `SERVER_VERSION` in `src/version.ts`
   (a test keeps them equal), run `npm run gen:catalog` so `manifest.json`
   follows, and move the `CHANGELOG.md` entries under the new version.
2. The `v1.2.3` tag starts the **Release** workflow here: it builds and
   tests, packs `fluentmcp-1.2.3.mcpb`, the end-user download
   `all-in-one-mcp-for-fluent-suite-1.2.3.zip` (the `.mcpb` plus
   `packaging/readme.txt` and the license) and `fluentmcp-1.2.3-source.zip`,
   and attaches all three to a GitHub release.
3. Every release also uploads two fixed-name copies,
   `all-in-one-mcp-for-fluent-suite-latest.zip` and `fluentmcp-latest.mcpb`,
   so these URLs always serve the newest version:
   `https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity/releases/latest/download/all-in-one-mcp-for-fluent-suite-latest.zip`
   and `.../fluentmcp-latest.mcpb`. The download on upfluent.io links to the
   first one, so it serves each new release with nothing to update by hand.
4. When the release job succeeds, the same run deploys that commit to the
   Cloudflare Worker (it calls `deploy-cloudflare.yml`), so the hosted
   connector and the download always match. The deploy workflow still runs
   on its own from the Actions tab for a hotfix or a rollback: run it on an
   older `v*` tag to put that version back.

## Code of conduct

Be kind, assume good faith, and keep it about the code.

Design rationale lives in `docs/TOOL_DESIGN.md` and the decision log in
`docs/DECISIONS.md` — if you are changing how something works rather than
what, add to the log.
