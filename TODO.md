Prefix: LUD
Next: 10

### LUD-5 · P3 · Provide a local lint gate

- **Area:** development checks
- **Where:** Makefile:32-48; package.json:76-79; .github/workflows/ci.yml:35-36
- **Problem:** make check and make test omit type-aware lint, and make lint has no target; contributors following the local check command can miss warnings or errors that make test-ci reports.
- **Recommendation:** Expose a local lint target and include lint in the documented local check path, preserving the existing type-aware lint configuration.
- **Fix with:** none
- **Effort:** S

### LUD-6 · P3 · Detect shipped dashboard payload growth

- **Area:** performance · payload
- **Where:** package.json:15-71; scripts/build-css.mjs:19-50; tests/packed.test.ts:11-26; docs/affectui-plan.md:44
- **Problem:** Packed tests check that CSS and JavaScript entries exist but impose no size comparison; growth in shipped styles or consumer bundles can slow page loads without a local check noticing. Historical gzip figures are snapshots, not a current gate.
- **Recommendation:** Measure compressed CSS and representative packed consumer bundles against an appropriate reviewed baseline, including CSS-only and selective imports; report attribution and scope.
- **Fix with:** bench-pyramid
- **Effort:** M

### LUD-7 · P3 · Measure representative dashboard rendering and interaction

- **Area:** performance · runtime
- **Where:** tests/browser/geometry.spec.ts:31-56; tests/packed.test.ts:95-108; playwright.config.ts:5-13; docs/multi-product-plan.md:13
- **Problem:** Browser and SSR tests assert behavior with small fixtures but do not measure rendering, layout, interaction latency or resource cost on representative dashboards. A user-visible slowdown can pass these checks; the historical Stats timing is not a local repeatable workload.
- **Recommendation:** Define representative consumer journeys and completed-work checks, then add repeatable timing and resource measurements with a valid baseline and browser profiling for attribution.
- **Fix with:** bench-pyramid
- **Effort:** M

### LUD-8 · P4 · Replace machine-specific Stats report link

- **Area:** documentation
- **Where:** docs/affectui-plan.md:7
- **Problem:** The paused plan links to an absolute path under a developer home directory, so readers without that checkout cannot open the referenced integration evidence; mdtool check reports L001.
- **Recommendation:** Replace the local link with a stable repository URL for the referenced report if available, or describe where the evidence can be found.
- **Fix with:** technical-writing
- **Effort:** S

### LUD-9 · P4 · Decide whether to add a coverage provider for make coverage

- **Area:** Needs owner · tests
- **Where:** package.json devDependencies; Makefile
- **Problem:** No Vitest coverage provider or mutation tool is declared, so the deslop Tests step cannot measure line or branch coverage; adding one is a new dependency.
- **Recommendation:** Decide whether to add a pinned coverage provider served by the stuff registries and a make coverage target, or record coverage as out of scope.
- **Fix with:** deslop
- **Effort:** S

