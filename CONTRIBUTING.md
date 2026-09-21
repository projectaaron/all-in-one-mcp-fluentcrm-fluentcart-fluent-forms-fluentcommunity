# Contributing

Thanks for looking. The fastest way to be useful:

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

1. Bump `version` in `package.json` and `SERVER_VERSION` in `src/version.ts`
   (a test keeps them equal), run `npm run gen:catalog` so `manifest.json`
   follows, and move the `CHANGELOG.md` entries under the new version.
2. Merge to `main`, then tag: `git tag v1.2.3 && git push origin v1.2.3`.
3. The **Release** workflow (Actions tab → Release → Run workflow, or a
   `v1.2.3` tag) builds and tests, packs `fluentmcp-1.2.3.mcpb`, the
   end-user download `all-in-one-mcp-for-fluent-suite-1.2.3.zip` (the
   `.mcpb` plus `packaging/readme.txt` and the license) and
   `fluentmcp-1.2.3-source.zip`, and attaches all three to a GitHub release.
4. Every release also uploads two fixed-name copies,
   `all-in-one-mcp-for-fluent-suite-latest.zip` and `fluentmcp-latest.mcpb`,
   so these URLs always serve the newest version:
   `https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity/releases/latest/download/all-in-one-mcp-for-fluent-suite-latest.zip`
   and `.../fluentmcp-latest.mcpb`. The Freemius product (39849, type
   "Apps & Software") hands out the first one through its **Download Links**
   setting; Freemius has no version upload for app products, so nothing on
   the Freemius side changes per release. `scripts/publish-freemius.mjs` and
   the **Publish to Freemius** workflow exist for the day Freemius adds
   version uploads for apps; today they report the stable link and exit.

## Code of conduct

Be kind, assume good faith, and keep it about the code.

Design rationale lives in `docs/TOOL_DESIGN.md` and the decision log in
`docs/DECISIONS.md` — if you are changing how something works rather than
what, add to the log.
