Prefix: DSLP
Next: 6

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


## Tickets


### DSLP-2 · P2 · Diagnose: ultrareview into this backlog

- **Area:** deslop · diagnose
- **Where:** whole repository
- **Problem:** No review has ranked this repository's risks for the deslop pass.
- **Recommendation:** Run the deslop Diagnose step. Accept: the diff touches only docs, comments, and this file, and every finding names its Fix with.
- **Fix with:** deslop
- **Effort:** S

### DSLP-3 · P2 · Types: strict profile and typing findings

- **Area:** deslop · types
- **Where:** type checker and lint configuration; TypeScript sources
- **Problem:** The strict-profile candidates in the deslop skill's tools reference have not been measured here.
- **Recommendation:** Run the deslop Types step. Accept: clean at the adopted profile, escape hatches not increased, witnesses recorded.
- **Fix with:** deslop
- **Effort:** M

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

