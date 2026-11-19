Prefix: DSLP
Next: 8

Deslop campaign backlog ([plan](https://github.com/laputa-systems/stuff/blob/main/docs/campaigns/deslop.md), tier B). One agent works this file with the `deslop` skill: take the lowest-numbered open ticket whose area does not start with `Needs owner ·`. After DSLP-5, work the open P1 and P2 findings, then fill in `## Report` below.

## Report

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




### DSLP-4 · P2 · Tests: coverage, boundary gaps, mutation

- **Area:** deslop · tests
- **Where:** test suites and CI
- **Problem:** Coverage and mutation results are unmeasured; no deslop mutation lane exists.
- **Recommendation:** Run the deslop Tests step. Accept: no undispositioned survivor in critical code, the test cost budget holds, and the lane is green where the tools are mirrored.
- **Fix with:** deslop
- **Effort:** M

### DSLP-5 · P2 · Dead code: tools and debloat

- **Area:** deslop · dead code
- **Where:** whole repository
- **Problem:** No dead-code scan has run.
- **Recommendation:** Run the deslop Dead code step. Accept: tools clean or allowlisted with reasons; walk-backs filed as Needs owner tickets.
- **Fix with:** deslop
- **Effort:** M


### DSLP-6 · P3 · Provide a local lint gate

- **Area:** development checks
- **Where:** Makefile:32-48; package.json:76-79; .github/workflows/ci.yml:35-36
- **Problem:** make check and make test omit type-aware lint, and make lint has no target; contributors following the local check command can miss warnings or errors that make test-ci reports.
- **Recommendation:** Expose a local lint target and include lint in the documented local check path, preserving the existing type-aware lint configuration.
- **Fix with:** none
- **Effort:** S


### DSLP-7 · P4 · Replace machine-specific Stats report link

- **Area:** documentation
- **Where:** docs/affectui-plan.md:7
- **Problem:** The paused plan links to an absolute path under a developer home directory, so readers without that checkout cannot open the referenced integration evidence; mdtool check reports L001.
- **Recommendation:** Replace the local link with a stable repository URL for the referenced report if available, or describe where the evidence can be found.
- **Fix with:** technical-writing
- **Effort:** S

