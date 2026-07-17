# Product module template

Scaffold for adding a new Fluent product — full playbook in
[`docs/EXTENDING.md`](../../../docs/EXTENDING.md).

Usage:

1. `cp -r src/products/_template src/products/<product>`
2. Rename `tool-map.template.json` → `tool-map.json` and fill in the area
   assignments (every docs group → one area; each endpoint in an area
   registers as its own `<area>_<operation>` tool).
3. Rename `index.ts.tpl` → `index.ts`, `summaries.ts.tpl` → `summaries.ts`,
   replace the `__PLACEHOLDERS__`.
4. `node scripts/gen-endpoint-maps.mjs` (generates `endpoints.gen.ts`),
   register the module in `src/products/index.ts`, build, test.

Files ship as `.tpl`/`.template.json` so the compiler and the generators
ignore this folder until a real module is created from it.
