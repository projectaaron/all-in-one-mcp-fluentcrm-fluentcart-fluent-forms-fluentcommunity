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

Please keep PRs focused, add a test when behaviour changes, run
`npm run build && npm run gen:catalog` before committing so the generated docs
stay in sync, and add a line to `CHANGELOG.md` under the next version.

Design rationale lives in `docs/TOOL_DESIGN.md` and the decision log in
`docs/DECISIONS.md` — if you are changing how something works rather than
what, add to the log.

## Code of conduct

Be kind, assume good faith, and keep it about the code.
