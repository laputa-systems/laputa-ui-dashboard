# Make Laputa UI a multi-product design system

## Status

- **State:** Planned 2026-11-10. Not started. Gate 0 is the open Stats acceptance in the [AffectUI plan](affectui-plan.md). It runs in parallel with T1–T4 under **Lanes**. Gate 0 must close, or the owner must settle it, before any release and before T6.
- **Revisions reviewed:** library `add1733`, Stats `6f12fb4`, Discover `c90f80d`, Niceforge `apps/forge` and `web` on `@laputa-systems/ui-dashboard@0.5.0`.
- **Running (2026-11-10):** lanes A–E launched. A from library `0e93aaf` and Stats `6f12fb4`; B from library `0e93aaf`; C from Discover `26bc96c`; D from Stats `6f12fb4`; E from repomod `999b111`. The Stats lane worktrees use `node_modules` cloned from the main checkout, because the lockfile names the unpublished 0.6.0 registry entry and a frozen install fails verification. C and E install the 0.6.0 tarball through a `file:` specifier and cannot land until a version is published.
- **Next:** review each lane as it reports. Then B continues with T3, C with T5's fixture input, and A with a quiet window for paired timings.
- **Resume:** "Run the multi-product campaign in `docs/multi-product-plan.md` from **Status**." First command: `git status && git log --oneline -5`, then the same in `~/d/discover` and `~/d/stats`.

## Goal

Stats, Discover and Niceforge share one implementation of controls, interaction and accessibility, and each keeps its own visual character. The library owns reusable semantics, components, interaction, accessibility and layout mechanics. Each consumer owns its domain content, state, art direction and page composition. Measure success by distinct visual character, little duplicated UI behavior, and minimal performance cost. More components do not count.

## Charter

This plan is not an execution grant. It applies the AffectUI plan's Charter for slicing, commits, failure handling, performance gates and verification, with the boundaries below and the parallel lanes in **Lanes**, which replace that Charter's single-writer default for these owners. Each slice lands with its code, behavior tests, docs and measurements. Run `make check` at each slice exit in this library, and the consumer's own check in the consumer.

## Execution boundary

- **repomod:** work only in `.work/wt/ui-deps` on `feat/ui-deps`. Follow repomod's AGENTS.md constraints. Land on `master` locally after review; do not push.
- **Library:** edit and commit locally. Do not push or publish. Do not rename the package. Add no mandatory runtime, CSS framework, theming runtime or token compiler.
- **Discover:** work only in the worktree `~/d/discover/.work/wt/ui-pilot` on branch `ui-pilot`. Never merge it into `main`, push, or deploy. Leave `cloudflare/`, `src/research-core/`, storage, publication, MCP and Access code alone. DSC-33 owns `main` and those paths, and its next lanes (H3 admin mode and H4 `make dev`) own `/admin` and the desk. Rebase the pilot onto `main` before each acceptance run. The owner decides adoption into `main` after DSC-33 releases the touched files.
- **Stats:** the AffectUI plan's grant covers Gate 0 only. After Gate 0, a theme change is checked by screenshots against the installed tarball and committed in Stats only when its appearance would otherwise change.
- **Niceforge:** read-only. Install a packed tarball in a disposable copy under this library's `.work/tmp` to check the CSS-only forge pages and the workbench. Record any required Niceforge change instead of making it.

## Findings at the reviewed revisions

These facts shape the decisions below. Recheck them before each slice.

1. All tokens live on `:root` in `src/tokens.css`. The derived tokens (`--ui-accent-soft`, `--ui-ok-soft`, `--ui-warn-soft`, `--ui-bad-soft`, `--ui-head-height`, `--ui-inset`, `--ui-ok`/`--ui-warn`/`--ui-bad`) resolve their `var()` references on `:root`, and descendants inherit those resolved values. Redefining `--ui-accent` on a container therefore leaves `--ui-accent-soft` on the old accent. Today a theme cannot be scoped correctly.
2. Library CSS is unlayered. Discover's 1,974-line `site/site.css` is entirely in `@layer site`, so any unlayered library rule beats every Discover rule regardless of specificity.
3. Component CSS has no hex colors and one `rgb()`, but 142 literal `px` values: 54 in `layout.css`, 27 in `forms.css` and 12 in `data.css`. Container-query breakpoints are literal because custom properties cannot appear in query conditions. Media queries use build-time custom media.
4. `color-scheme: light` is set on `:root`. The CSS builder rejects `prefers-color-scheme`, comments, `!important` and unexpanded custom media in `dist/styles.css`.
5. Discover renders its public and desk pages as server-side template strings (`src/site/pages.ts`, `src/site/desk.ts`). Solid is used only for client islands. It has its own token vocabulary (`--paper`, `--ink`, `--rule`, `--link`, `--serif`) and colored entity-link marks. Shared components therefore reach Discover pages as a CSS and markup contract, not as Solid components.
6. Discover's search island (`site/client/search.tsx`) implements its own modal dialog, listbox, active option and global `/` shortcut. These behaviors overlap the library's `CommandMenu`, `Combobox` and overlay policy. It is the clearest duplicated behavior. DSC-33 records 26 KB of gzipped reader JS and 18 KB of desk JS.
7. Niceforge pins 0.5.0, two minor versions behind. Its forge pages ship CSS alone.

## Decisions

- **Theme contract.** The public contract is the existing semantic `--ui-*` tokens, plus only the new tokens the T1 audit justifies. Raw palette values are not a separate public tier. A theme is a rule that sets tokens on a scope: `:root` for a page, or a consumer-chosen element for a region. The library declares every derived token on the same selector list as its inputs, so a scoped override recomputes them. The default token values and the light appearance stay unchanged; the existing WebP goldens are the proof.
- **Cascade order.** The base and family sheets stay unlayered for existing consumers. Consumers that use layers import them with `@import url(…) layer(ui)` and declare `@layer ui, <app layers>;` first. T2 proves this in the packed tarball with Discover's Vite build and a plain CSS-only page. Add a separately built layered entry only if a supported pipeline drops `layer()`.
- **Structural invariants.** Hit areas, focus-ring presence and contrast floor, overlay stacking, the scroll ownership of panes and tables, reduced-motion and forced-colors paths, and container-query breakpoints are structural. Themes may not change them. Colors, type families and scale, radii, shadows, control and row density, spacing scale, side-navigation width and panel chrome are design choices and become tokens where a consumer needs them.
- **No global element styles.** Library CSS selects only `ui-*` classes and its own `:root` tokens. T1 lists any exception, and T2 removes it or scopes it under a class.
- **Themes live in consumers first.** The Discover editorial theme lives in Discover's CSS on the pilot branch. The library ships the contract, its docs and a fixture-only second theme for isolation tests. Promote a theme sheet to an export (`./themes/<name>.css`) only when a second consumer would load it.
- **Editorial primitives.** Promote a primitive into the library only when Discover and one other consumer would render it, or the primitive is pure mechanics without art direction. Initial candidates: citation reference and reference list, figure with caption and credit, fact or definition list, taxonomy term link, and native-language name with `lang`. The maker dossier, home index, timeline, gallery composition and entity-link marks stay in Discover.
- **Shared behavior in the reader.** The search island may adopt a library component only if its packed, per-component chunk fits the reader budget. The budget is no more than 5% growth in initial reader JS, with zero growth in JS for pages that do not open search. Otherwise extract the shared mechanics into a smaller entry or keep Discover's search and record the duplication.
- **Shell, Workbench and DataTable** are not used on public Discover pages. The research review surface may use them only where its layout already needs them.

## Lanes

Five writers run at once, each in its own worktree and each launched through the Pi bridge. The parent scopes each lane, reviews it, rebases it onto the integration branch, reruns its acceptance there, and lands it. Lanes update neither plan's Status; the parent does.

| Lane | Work | Worktree | Owns | Must not touch |
| --- | --- | --- | --- | --- |
| A | Gate 0: Button payload and paired readiness | library `.work/wt/gate0`; Stats `.work/wt/gate0` | `src/components/*.tsx`, `src/index.ts`, `src/internal/`, `vite.config.ts`; Stats build config and route entries | `src/tokens.css`, `src/css/`, Stats cost code |
| B | T1, T2, T3, then the T5 fixture | library `.work/wt/theming` | `src/tokens.css`, `src/css/`, `scripts/build-css.mjs`, `docs/theming.md`, new theme fixture pages and their tests | component TSX, package exports, existing goldens |
| C | T4 on the 0.6.0 tarball, then the 0.6.x tarball with T2 | Discover `.work/wt/ui-pilot` | Discover `site/site.css`, `site/client/search.css`, presentational markup in `src/site/pages.ts` | the paths DSC-33 owns (**Execution boundary**) |
| D | Stats data: storage inputs and partially covered series | Stats `.work/wt/coverage` | Stats cost and series code with their tests | Stats build config, route entries, library |
| E | repomod dependency dashboard on 0.6.0 CSS-only | repomod `.work/wt/ui-deps` | `src/repomod/dependencies/` UI, assets and browser TS, render tests, `package.json`, `Makefile` vendoring | inventory data, `catalog.toml`, canonical checkouts |

- **Shared files.** `package.json`, `playwright.config.ts`, `vitest.config.ts`, the fixture server and `tests/` helpers belong to the parent. A lane that needs one of them stops and asks. Lane B adds no package export; an exported theme waits for its second consumer.
- **Why C need not wait for B.** A page-wide theme on `:root` and `@import … layer(ui)` both work with the current tarball. Only themes scoped to a region need T2. C rebases onto T2's tarball before its isolation acceptance.
- **Timing windows.** Lane A's paired cold-readiness runs need a quiet host. The parent pauses browser suites and builds in B, C and D for each measurement window and records whether `perf-gate-ready` passed. Byte and size gates run at any time. If no quiet window opens, report "perf gate deferred: host busy"; Gate 0 cannot close until a window opens.
- **Serial points.** T5's Discover adoption waits for DSC-33 H3. T6 waits for Gate 0, because both are the same per-entry chunking problem. A release waits for Gate 0 and T2.
- **Throughput.** Another lane goes in only after the parent measures that integration review, not lane work, is the bottleneck.

## Gate 0 — close Stats acceptance

The AffectUI plan's Next remains the first work: unrelated Button code in initial route graphs, and paired cold-readiness measurements. Four Stats routes are above the 5% review threshold, and cold readiness regresses beyond its spread. Four chunking approaches have failed. Give this gate one more bounded attempt, a symbol-level chunking approach or a smaller fully compatible forwarding implementation, then stop. If it fails, the owner chooses one of three outcomes:

1. Accept the growth with its attribution to user benefit, as the AffectUI Acceptance allows.
2. Ship 0.6.x as the Stats baseline and continue the performance work in parallel with T1.
3. Keep this campaign blocked.

Lanes B, C and D run during the attempt.

## Sequence

1. **T1 — styling audit.** Inventory every hard-coded visual decision in `src/tokens.css` and `src/css/*.css`, and every global selector. Classify each as structural or design, name the token it would become, and list the consumers that need it changed. Inventory Discover's tokens and component-like classes against the library's equivalents. Output: the audit table in `docs/theming.md`. No code.
2. **T2 — scoped theme contract.** First write failing browser tests: a scoped theme recomputes derived tokens; an override on one region leaves a sibling region and the page unchanged; a layered consumer rule beats a library rule; the CSS-only fixture renders unchanged. Then redeclare the derived tokens on the theme scope and add only the tokens T1 justifies. Document the contract, cascade order and the structural invariants in `docs/theming.md`. Stats and Niceforge goldens and screenshots must not change.
3. **T3 — two themes on the same controls.** Add one fixture page that renders the same controls, including buttons, fields, tabs, disclosure, notice, table, pagination and a dialog, under the default dashboard theme and a fixture editorial theme modeled on Discover's palette and serif type. Exercise keyboard paths, focus visibility, forced colors and 200% zoom under both. Capture desktop and mobile screenshots.
4. **T4 — Discover pilot, public reader.** On the pilot branch, load the library base CSS in `layer(ui)` beneath `@layer site`, and map Discover's tokens onto the `--ui-*` contract. Replace Discover controls with library classes only where the markup and behavior already match. Render a maker dossier (headshot, gallery, citations, a native-language name) and a browse and search surface (home index, a term page, the search island). Typography, color direction, semantic HTML, server rendering and the no-JS reading path stay as they are.
5. **T5 — Discover pilot, research review.** After H3 lands on Discover `main`, rebase and theme the admin maker review and desk. Until then, build the review surface as a library fixture with Discover's desk markup and the editorial theme, and record that Discover adoption is pending.
6. **T6 — shared search behavior.** Measure the library's dialog and listbox mechanics against `search.tsx` as a packed per-component consumer. Adopt it, extract a smaller shared entry, or record why the duplication stays, according to the reader-budget decision.
7. **T7 — evidence and follow-up.** Write the report and the prioritized follow-up plan.

## Acceptance

- **Distinct character, shared behavior:** desktop (1440px) and mobile (390px) screenshots of the Stats dashboard, the fixture dashboard and editorial themes, a Discover dossier, browse and search, and review. The products look different, and the controls in them are the same implementation with the same keyboard and ARIA behavior.
- **Theme isolation:** the tests from T2 pass in Chromium and WebKit, and a page with both themes in sibling regions shows no leakage.
- **Default appearance:** existing goldens unchanged; Stats screenshots and the Niceforge CSS-only pages unchanged against a packed tarball.
- **CSS-only and no-JS:** the library CSS-only fixture and the Discover dossier are readable with JavaScript disabled, including citations, figures, captions and native-language text.
- **Responsive and images:** 320, 390, 768 and 1440px; long and CJK names; image aspect, lazy loading and missing media; 200% zoom.
- **Payload:** gzipped CSS and JS before and after for the library entries, each Stats route, the Discover reader and desk, and Niceforge's forge CSS. Discover's reader JS grows by no more than 5%, and its CSS growth is attributed. A module scan of the reader chunks finds no Shell, Workbench, DataTable, chart, graph or editor code.
- **Contracts:** new tokens, classes, exports and the cascade-order guidance are listed as additive public contracts in the report.

## Deliverables

- `docs/theming.md`: the theme contract, cascade order, structural invariants, the T1 audit, and the component-versus-consumer responsibility matrix covering Stats, Discover and Niceforge.
- The fixture theme page and its tests in this library.
- The Discover pilot on the `ui-pilot` branch.
- Screenshots and payload tables in the report.
- A prioritized follow-up plan: which candidates to promote, Niceforge's upgrade path from 0.5.0, an optional dark theme, and any layered entry.
