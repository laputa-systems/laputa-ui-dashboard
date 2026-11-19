Prefix: DSLP
Next: 11

Deslop campaign backlog ([plan](https://github.com/laputa-systems/stuff/blob/main/docs/campaigns/deslop.md), tier B). One agent works this file with the `deslop` skill: take the lowest-numbered open ticket whose area does not start with `Needs owner ·`. After DSLP-5, work the open P1 and P2 findings, then fill in `## Report` below.

## Report

Bench audit at `a59cfa7c` (2026-11-19): no runnable performance workload or
size budget was found in this worktree, so no bench entrypoint or tiers were
added. The build scripts produce CSS and check demo inventory; packed tests
check exports and rendering, and Chromium tests check behavior and geometry.
Vite prints gzip sizes for build chunks, but does not compare them against a
budget. Test timeouts and runner durations are not performance measurements.
`docs/affectui-plan.md` records historical gzip snapshots and refers to Stats
benchmark scripts; `docs/multi-product-plan.md` records a past Stats timing
and a proposed Discover reader budget. These are not local runnable gates or
current comparisons. No regression is demonstrated by this audit.

Ranked outcomes without local performance evidence:

1. **Dashboard rendering and interaction** (DSLP-10, P3): representative
   Solid and CSS-only pages, large tables and interactive controls have no
   measured completion latency, layout/CPU cost or memory footprint. Existing
   functional assertions provide correctness examples, not a representative
   completed-work benchmark. A browser performance trace and allocation
   profile can attribute a future slowdown; instrumented runs should be
   separate from timed comparisons.
2. **Delivered CSS and JavaScript** (DSLP-9, P3): stylesheet transfers and
   selective consumer bundles have no current compressed-size comparison.
   Packed tests verify presence and entry resolution, not byte budgets. A
   bundle graph and compressed per-entry byte counts can attribute growth.

There are no local samples, host gates, reference comparisons, regression
thresholds or benchmark result records to assess for these outcomes. The
smallest next action is to define representative consumer fixtures and their
correctness/completion oracles, then establish reviewed baselines before
building a tiered runner. No Full performance run was made.

Dead code (DSLP-5): tsrs with `--noUnusedLocals --noUnusedParameters`
reported no source findings; Oxlint `--deny no-unused-vars` over `src`,
`tests`, `fixture`, and `scripts` found three unused imports in the tour.
Removed `Show`, `Notice`, and `Panel` from `fixture/demo/scenes.tsx`: no
references existed in that module. The registered entry is `fixture/demo.html`
through `fixture/demo/main.tsx`, which imports the four scenes; the demo
coverage script reads both modules, and `tests/browser/demo.spec.ts` exercises
the tour. The fixture is not in the package `files` list. No public export,
class, token, or runtime behavior was removed. `make check` passed on macOS
ARM64 with Node 26.13.1 and pnpm 12.21.0: 68 unit/package and 339 Chromium
cases, including the demo. External consumers and other browser engines were
not run; this fixture-only import cleanup does not alter the built package.

The source declaration search found no exported declaration with only one
source occurrence. The six Vite entries map to the package exports, and
internal forwarding, ID, popover, swipe, field-description and combobox
helpers have source callers. A CSS class comparison found 202 of 278 `ui-`
names absent from the component reference; published styles also support
CSS-only consumers, so this is not evidence of dead CSS. All eight dev
dependencies have imports or script/config uses. The scans are clean with no
allowlist; lexical export and CSS searches cannot prove external usage. Knip
was not installed because this task forbids new dependencies. A debloat review
of the entry points, shared helpers, demo, build scripts and test configuration
found no further proven behavior-preserving cut; a complete structural review
of every component was not performed. The helper layers retain shared browser,
SSR, accessibility and interaction behavior. No walk-back was proposed.

Tests (DSLP-4): the critical contracts map to existing tests: the package
exports and built `dist` files (`tests/packed.test.ts`), popover, table and
form behavior (`tests/browser/affectui.spec.ts`), search navigation
(`tests/browser/search-dialog.spec.ts`) and scoped theme tokens
(`tests/browser/theme.spec.ts`). Modal focus confinement had no test; the new
`geometry.spec.ts` case checks Tab and Shift+Tab stay inside the dialog and
outside controls are inert. Replacing `showModal()` with `show()` fails it at
the outside-focus assertion (0.17 runner-minutes). No mutation tool or
coverage provider is declared, so coverage is not measured; DSLP-8 tracks
that owner decision. `make check` passed 68 unit and package cases and 339
Chromium cases.

Ground at `0e7e9937`, 2026-11-19. The hosted workflow ran
`make test-ci` with Node 26.13.1 and pnpm 12.21.0. All 68 unit
and package cases passed. [Hosted default](https://github.com/laputa-systems/laputa-ui-dashboard/actions/runs/44477817928)

The local npm mirror lacked the pinned pnpm package. On macOS
ARM64, the exact native executable came from
`npm pack @pnpm/exe.darwin-arm64@12.21.0 --registry=https://registry.npmjs.org --ignore-scripts`.
The project then installed through its configured registry. Its
package manager metadata now matches the existing manifest pin.
The application dependency document is identical after YAML
normalization. A second frozen install preserved the full lock.

With the pinned tools, `make test-ci` took 4.47 s after
installation and 3.38 s on repeat. `pnpm run lint` exited
successfully with 49 warnings in 0.31 s. `make check` passed
all 68 unit and package cases and 338 Chromium cases in 18.88 s.
The browser fixture emitted Solid runtime warnings. These are
observed costs on the shared host.

Diagnose reviewed package exports, build and release configuration, documentation,
and sampled form, overlay, navigation, data and feedback components against their
tests. The Chromium suite and packed tests passed. It did not exhaustively inspect
every component, external consumer, browser engine, or assistive technology.
No product defect was filed; the local lint gate and a portable documentation link
remain as DSLP-6 and DSLP-7.


Types at `952d0524`: measured with tsrs 0.25.0-ts7.1.0-beta and
Oxlint 1.93.0. Compiler diagnostics count source under `tsconfig.json`;
lint counts below cover `src`, `tests`, `scripts`, and `fixture` (source-only
counts are shown alongside them). Each compiler candidate was enabled separately
against the existing profile. Retained settings were already enabled, so zero
new diagnostics does not measure what they caught when originally introduced.

| Candidate | Diagnostics | Decision |
| --- | ---: | --- |
| `strict` | 0 | Retained existing profile; includes catch variables as unknown. |
| `noUncheckedIndexedAccess` | 0 | Retained existing profile. |
| `exactOptionalPropertyTypes` | 0 | Retained existing profile. |
| `noImplicitOverride` | 0 | Retained existing profile. |
| `verbatimModuleSyntax` | 0 | Retained existing profile. |
| `useUnknownInCatchVariables` | 0 | Already implied by strict; no new witness. |
| `noPropertyAccessFromIndexSignature` | 7 | Rejected: all seven demand bracket spelling for dynamic `ref` or dataset keys, not a defect. |
| `noUncheckedSideEffectImports` | 0 | Rejected: no defect or escape hatch identified. |
| `no-explicit-any` | 7 (src 0) | Rejected: browser test doubles use seven `any` annotations; no source finding. |
| `no-unsafe-argument` | 36 (src 0) | Rejected: test configuration produces error-typed dependency values; no source finding. |
| `no-unsafe-assignment` | 319 (src 0) | Rejected: test configuration produces error-typed dependency values; no source finding. |
| `no-unsafe-call` | 406 (src 0) | Rejected: test configuration produces error-typed dependency values; no source finding. |
| `no-unsafe-member-access` | 368 (src 0) | Rejected: test configuration produces error-typed dependency values; no source finding. |
| `no-unsafe-return` | 364 (src 0) | Rejected: test configuration produces error-typed dependency values; no source finding. |
| `no-non-null-assertion` | 137 (src 18) | Rejected as a blanket rule: fixture and test invariants produce many findings; source assertions require individual contract review. |
| `no-floating-promises` | 0 | Rejected: no defect or escape hatch identified. |
| `switch-exhaustiveness-check` | 1 | Rejected: Notice's default intentionally handles `info`. |

No new setting met the adoption threshold and no contract was changed; witnesses
for changed contracts therefore do not apply. The Toaster timer assertion follows
initialization in the same effect; its reactive lookup assertion and other source
assertions remain leads for individual review rather than demonstrated defects.
Escape-hatch baseline and result are identical: Oxlint reports 7 explicit `any`
and 137 non-null assertions; `rg` finds 8 `as unknown`/`as any` occurrences
(including the seven `as any`) and 0 TypeScript suppression directives. The
deslop reference's broader line-based expression reports 162 matching lines,
including ordinary assertions and a string literal. Scope: first-party TypeScript
and JavaScript in `src`, `tests`, `scripts`, and `fixture`.


## Tickets







### DSLP-6 · P3 · Provide a local lint gate

- **Area:** development checks
- **Where:** Makefile:32-48; package.json:76-79; .github/workflows/ci.yml:35-36
- **Problem:** make check and make test omit type-aware lint, and make lint has no target; contributors following the local check command can miss warnings or errors that make test-ci reports.
- **Recommendation:** Expose a local lint target and include lint in the documented local check path, preserving the existing type-aware lint configuration.
- **Fix with:** none
- **Effort:** S


### DSLP-9 · P3 · Detect shipped dashboard payload growth

- **Area:** performance · payload
- **Where:** package.json:15-71; scripts/build-css.mjs:19-50; tests/packed.test.ts:11-26; docs/affectui-plan.md:44
- **Problem:** Packed tests check that CSS and JavaScript entries exist but impose no size comparison; growth in shipped styles or consumer bundles can slow page loads without a local check noticing. Historical gzip figures are snapshots, not a current gate.
- **Recommendation:** Measure compressed CSS and representative packed consumer bundles against an appropriate reviewed baseline, including CSS-only and selective imports; report attribution and scope.
- **Fix with:** bench-pyramid
- **Effort:** M


### DSLP-10 · P3 · Measure representative dashboard rendering and interaction

- **Area:** performance · runtime
- **Where:** tests/browser/geometry.spec.ts:31-56; tests/packed.test.ts:95-108; playwright.config.ts:5-13; docs/multi-product-plan.md:13
- **Problem:** Browser and SSR tests assert behavior with small fixtures but do not measure rendering, layout, interaction latency or resource cost on representative dashboards. A user-visible slowdown can pass these checks; the historical Stats timing is not a local repeatable workload.
- **Recommendation:** Define representative consumer journeys and completed-work checks, then add repeatable timing and resource measurements with a valid baseline and browser profiling for attribution.
- **Fix with:** bench-pyramid
- **Effort:** M


### DSLP-7 · P4 · Replace machine-specific Stats report link

- **Area:** documentation
- **Where:** docs/affectui-plan.md:7
- **Problem:** The paused plan links to an absolute path under a developer home directory, so readers without that checkout cannot open the referenced integration evidence; mdtool check reports L001.
- **Recommendation:** Replace the local link with a stable repository URL for the referenced report if available, or describe where the evidence can be found.
- **Fix with:** technical-writing
- **Effort:** S


### DSLP-8 · P4 · Decide whether to add a coverage provider for make coverage

- **Area:** Needs owner · tests
- **Where:** package.json devDependencies; Makefile
- **Problem:** No Vitest coverage provider or mutation tool is declared, so the deslop Tests step cannot measure line or branch coverage; adding one is a new dependency.
- **Recommendation:** Decide whether to add a pinned coverage provider served by the stuff registries and a make coverage target, or record coverage as out of scope.
- **Fix with:** deslop
- **Effort:** S

