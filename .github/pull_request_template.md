## What this changes

<!-- One or two sentences. Link the issue if there is one. -->

## Why

<!-- The problem or the field report that motivated it. -->

## Checklist

- [ ] `npm test` passes and I added or updated a test for the behaviour that changed
- [ ] If I touched `tool-map.json` or `endpoints.json`: ran `npm run gen:maps && npm run build && npm run gen:catalog` and committed the result
- [ ] Added a line to `CHANGELOG.md` under the next version
- [ ] Destructive or privilege-changing operations I added are confirm-gated (`destructive: true`)
- [ ] No credentials, site URLs, or personal data in the diff
