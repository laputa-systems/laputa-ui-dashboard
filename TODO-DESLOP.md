Prefix: DSLP
Next: 11

Deslop campaign backlog ([plan](https://github.com/laputa-systems/stuff/blob/main/docs/campaigns/deslop.md), tier B). One agent works this file with the `deslop` skill: take the lowest-numbered open ticket whose area does not start with `Needs owner ·`. After DSLP-5, work the open P1 and P2 findings, then fill in `## Report` below.

## Report

DSLP-1 base: `0e7e993726137d56c83b07b28bbfd0c21dd16733` (ancestor of
`40fee16a24aa09535dad0ac0ee62d82b34be2dc4`). The cumulative review covered
all six merged changes #14–#19, including the lock metadata, dark-theme docs,
demo entry and modal implementation and fixture. No new demonstrated defect or
supported deferred finding was found. The review did not exercise external
consumers, other browsers, or assistive technology.

**Scorecard**

| Measure | Before | After |
| --- | --- | --- |
| Tracked lines, `src/` | 5,342 | 5,342 |
| Tracked lines, `tests/` | 7,512 | 7,528 |
| Warm `make check` | 18.88 s, 68 unit/package + 338 Chromium | 24.13 s, 68 unit/package + 339 Chromium |
| Warm `make test` | Not recorded separately | Not recorded separately |
| Line and branch coverage | Not measured | Not measured; DSLP-8 |
| Mutation | Not measured | One injected fault proves one modal focus behavior; 0.17 runner-minutes. No systematic caught/missed/timeout/unviable counts. |
| Escape hatches | 7 `any`, 137 non-null assertions, 8 `as unknown`/`as any` casts | Unchanged; 0 suppressions. Scope: first-party TS/JS in `src`, `tests`, `scripts`, `fixture`. |
| Dead code | Three unused demo imports | Removed three imports, zero net lines and zero dependencies (#18). |
| Findings | Campaign started | Filed P1: 0, P2: 0, P3: 3 (DSLP-6, 9, 10), P4: 2 (DSLP-7, 8); fixed P1: 0, P2: 0, P3: 0, P4: 0. One broken dark-theme documentation anchor was repaired without a ticket; no product defects fixed. |
| Performance | No defined workload or budget | No regression established; #19 audit filed DSLP-9 and DSLP-10. |
| Escaped regressions | Unknown | None observed in the checks; untested consumers and browsers remain unknown. |

Line counts include all tracked files under the named directories, counting newline
characters. Check durations are single observations on a shared macOS ARM64 host,
not comparable performance gates. The focus test protects keyboard confinement and
background inertness; no product defect was found by the injected fault.

**Steps and cost**

- **Ground #14:** aligned generated pnpm metadata to the existing pin; frozen
  install retained application dependencies. `make test-ci` took 4.47 s after
  installation and 3.38 s warm; lint took 0.31 s with 49 warnings; `make check`
  took 18.88 s. Hosted test passed 68 cases. Total step wall and CI minutes were
  not recorded.
- **Diagnose #15:** sampled package boundaries, build, themes and components;
  repaired the dark-theme anchor and filed DSLP-6 and DSLP-7. No product defect
  found. Full check passed; step wall and CI minutes not recorded.
- **Types #16:** retained the existing strict profile; no candidate met the
  defect/escape-hatch threshold. Seven index-signature diagnostics were spelling
  changes; type-aware unsafe rules flagged test dependency types, not source.
  Escape hatches were unchanged. Full check passed; step wall and CI minutes not
  recorded.
- **Tests #17:** added one modal focus/inertness behavior test. Replacing
  `showModal()` with `show()` made it fail; the proof cost 0.17 runner-minutes.
  No coverage or systematic mutation run was available (DSLP-8). Full check
  passed; total step wall and CI minutes not recorded.
- **Dead code #18:** compiler unused checks found no source findings; Oxlint
  found `Show`, `Notice`, and `Panel` unused in the demo scene. Checked its
  registered entry and demo consumers; removed only those imports. Knip was not
  installed under the no-new-dependency constraint. Full check passed; step wall
  and CI minutes not recorded.
- **Bench #19:** no runnable workload, size budget, baseline or threshold;
  functional checks and historical snapshots are not benchmarks. Filed P3
  DSLP-9 for payload and DSLP-10 for representative runtime. No Full performance
  run. Full check passed; step wall and CI minutes not recorded.

**Method feedback**

A boundary checklist that explicitly includes modal focus confinement would have
caught the missing assertion earlier; the injected fault verified the new test.
Type-aware unsafe lint misfired on error-typed test dependencies. Types found no
candidate worth adopting, and the dead-code search could not infer external CSS
usage. The review found no new defect. A single fault proof is not a mutation audit.

**Shared-file gaps**

The shared deslop recipe asks for coverage and mutation dependencies and a
qualified CI lane, but this task forbade new dependencies and CI changes; DSLP-8
holds the coverage decision. The shared report format assumes mutation outcome
counts and performance workloads exist; allow explicit unmeasured outcomes and
record per-step wall and CI cost as each step runs. No shared files were changed.

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

