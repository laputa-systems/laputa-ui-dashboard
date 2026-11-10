# Execute the AffectUI coverage plan

## Status

- **Goal:** Improve the investigation workflows in `joshuarli/stats` using this library, with verified package integration and preserved frontend efficiency. The [catalog](affectui-catalog.md) remains the long-term inventory.
- **Starting revisions:** Library `6d093c74ff9d6354f88238d05e4576a7ba71ff94`; Stats `5fedff5c00f004280adcd858fc00889174d5a131`. The earlier review used library `916c17e` and Stats `dcda2b9`; refresh every finding against the current source.
- **Accepted library slices:** F01, M06, C024, C027, C030, C031, C040, C045, C050, C052, C059, C064, C073, C074, C078, C079, C080, C081, C085, P1-progress, P1-disclosure, P1-accordion, P1-action, nested-dialog P1-overlays, P1-journey, P2-breadcrumbs, P2-popover, P2-tooltip, P2-journey-a, P2-journey-b, P2-journey-c, P2-journey-d, P2-static-forge, S10-a, S10-b, S16-a, S17-split-a, S17-split-b, S17-tabs-a, S17-tabs-b, S17-preview-a, S17-journey, P3-tab-mechanics, P3-settings-a, P3-description-a, P3-page-frame-a, P3-page-grid-a, P3-canvas-journey, P3-collapse-a, P3 exit, C039-table-a, C039-table-sort, C023-a, C023-b, C025-a, P1-field-ids, P1-focus and P1-menu are accepted. Nested mixed-axis SplitPane ownership and controlled Workbench drawers have focused coverage. `make check` passed 67 unit and packed tests and 272 browser tests after the latest slice.
- **Stats progress:** The fresh baseline and captured screenshots are recorded in Stats `docs/dashboard-integration-baseline.md`; the candidate comparisons and remaining gaps are in `docs/dashboard-integration-milestone.md`. The packed 0.6.0 candidate from `b7a15ae` was installed locally. Issue-to-trace navigation retains section state, fits mobile trace details, and reports resolve/reopen outcomes with focus preserved. Ledger details expose the full selected identity and comparison context at desktop and mobile widths and link an exactly matched route to Requests; service operation names remain readable. Host and project lists restore their filters, sort, and focus after investigation; project search suspends hidden charts without refetching. The mobile project list keeps its comparison basis readable and signals real horizontal overflow. Deployment comparisons show their actual windows and source coverage, and issue-to-trace navigation restores focus to the deployment evidence. Service work distinguishes unavailable rates and latency from measured zero. Explicit time ranges and deployment deep links survive navigation and history. The controlled sortable header now serves both the paginated fleet table and the selectable route table while Stats owns sorting and selection. The 213-test Stats dashboard suite passed with the ledger CSS and filtered-chart lifecycle changes; focused checks, a 200% Chromium zoom review, and the package registry dry run also passed. pnpm warned that the unpublished archive could not be verified against public registry metadata; the suite used the already installed archive. Registry installation remains unverified because 0.6.0 is unpublished.
- **Next:** The unrelated Button payload remains open: its native-attribute forwarding pulls Solid support into initial routes even though Gallery is lazy. Proxy forwarding, preserved package modules, and common-chunk inlining did not solve the problem without other costs; their disposable experiments were not integrated. Retry when a symbol-level chunking approach or a smaller forwarding implementation can preserve native attributes, reactivity, and hydration. Runtime chunking removed an extra request and reduced compressed graphs, but Fleet, Projects, Services and Service still exceed the initial JavaScript review threshold. Five accepted timing pairs on the current candidate found cold readiness regressions beyond the observed spread on all eight routes; warm differences stayed within the spread. Remeasure after addressing the payload. Extend the shared table only for another demonstrated Stats need.
- **Deferred:** C034 compact breakdown is unfinished and parked in local Git stash `f458c2bc1eeacf960cf0b4629a4fa2081174ff6d`. Resume only if a Stats journey needs it. Other unneeded catalog rows, editable spreadsheet, and agent, chat, or admin screens remain open because they do not yet serve a named Stats need. P1 announcement sharing also remains open until another consumer needs it.

## Charter

This plan is not an execution grant. Once the owner explicitly starts the campaign, work locally within this plan without waiting for another approval. Do not push or publish. Park an item that needs outside-the-repository effects, an unauthorized destructive action, or a loop that cannot check the item. Continue independent items. Missing browsers, hardware, services, and external consumer access go in **Needs environment**, with a reproducible command or procedure.

Work one slice at a time. After each accepted slice and on resume, run the parent steering checkpoint in `~/usr/dotfiles/base/.agents/skills/orchestrate/references/campaigns.md`. The parent may change methods and slice order inside the decisions and acceptance here. Default to one writer. Do not run parallel writers: every slice touches shared fixture, test, export, or catalog files. If later changes remove those overlaps, the parent may name disjoint ownership pairs here before launching through the Pi bridge. Worktrees belong under `.work/wt/`; use the orchestrate worktree lifecycle. Keep scratch under `.work/tmp`, ensure `.work/` is excluded in `.git/info/exclude` before writing, and set `TMPDIR` to `.work/tmp` for spilling commands.

Commit each green slice with a Conventional Commit scoped to its workstream and its item ID in the body. Include code, behavior tests, docs, and relevant catalog evidence in the same slice. Do not add code comments that point to this plan. Do not run formatters or modify CI. Run the slice acceptance on the integrated tree, then the narrowest affected suite. Run `make check` at each phase exit and close; this repository requires it. Red work never lands on the integration branch.

On failure, reproduce narrowly and establish the cause before changing code. After two failed hypotheses, bisect the input, code, or environment. After three unsuccessful fixes, park the slice on its branch, state the cause or unresolved hypothesis and exact retry condition in Status, and continue independent work. One parent owns each shared environment blocker. Do not retry a flaky test to green or weaken it.

Fix a defect encountered on the path in its own commit when it causes incorrect user-visible data, an inaccessible required action, loss of a draft, or an existing check failure. A verification loop taking over five minutes on two consecutive comparable runs is an execution blocker: find the cause and fix it before continuing, preserving the same evidence. Record other unrelated issues without expanding scope. Check performance as each consumer journey is adopted; catalog parity is not a prerequisite for performance acceptance. Size and memory checks still run where relevant. Time-based performance gates require `perf-gate-ready` before and `perf-gate-ready -1` immediately after each measurement; discard overlaps. If busy, defer the gate and report `perf gate deferred: host busy`; do not call the campaign complete or release it.

## Decisions

- **Prescribed — reference and parity:** The 2026-11-09 [catalog](affectui-catalog.md) is the frozen functional reference, not a claim of pixel or React API parity. Its row descriptions and the contracts below are the oracle where a runnable reference is unavailable. Original Solid/CSS implementations are required; do not copy Pro source or branded assets. Preserve each row's distinct success, failure, keyboard, accessibility, responsive, and data cases. Maintain the catalog's row-to-source, fixture, and behavioral-test mapping as slices land. An untested behavior is open. A deliberate difference needs a reason in that row. Do not silently refresh the snapshot or make its raw count the target. This freezes the reference for unattended execution instead of the draft's phase-by-phase inventory refresh; catalog changes after the snapshot are separately scoped.
- **Prescribed — sequencing:** Use Stats journeys to choose library work. Integrate, review usability, and verify performance before completing the catalog. Keep unused rows open with a reason. The editable grid and unrelated agent, chat, admin, commerce, scheduling, and graph-authoring features wait for a named consumer.
- **Prescribed — compatibility:** Preserve existing exports, prop meanings, classes, tokens, default geometry, light appearance, `Shell` markup and mobile behavior, `Segmented` semantics, `Button.variant`, and the two-file base CSS contract. Add semantic tabs and radio groups separately. `Meter` stays decorative. Solid and `@solidjs/web` remain optional peers. Existing instances get no new behavior without opt-in.
- **Prescribed — public surface:** Add feature exports through explicit package subpaths and matching declarations, starting with `./forms`; add feature CSS subpaths loaded after the existing base sheet. The root entry and its existing exports remain intact; do not re-export feature entries from root. Update package exports, Vite entries, declaration emission, CSS builder, packed tests, and documentation together. Each feature family must be independently usable from the packed tarball. Keep no-JS native markup for static functions and label interactive-only behavior. New exports, prop and callback types, CSS classes and tokens are additive public contracts and must be surfaced in the final report.
- **Prescribed — Stats integration:** Preserve Hosts, Projects, and Services as global navigation and retain the project sections Overview, Deployments, Errors, Requests, and Signals. Prioritize returning to a filtered and sorted list, cost-to-request investigation, deployment evidence, and issue-to-trace investigation. Keep telemetry time windows and domain calculations in Stats. Preserve Solid, the router, query lifecycle, binary history, ETags, bounded caches, lazy boundaries, and in-place uPlot updates.
- **Prescribed — evidence and release:** Compare the actual installed tarball against the fresh per-route Stats baseline. Attribute any initial JavaScript growth over 5% to a user benefit. Check requests and retained work separately. Prepare a new immutable library version and Stats manifest and lockfile changes without publishing or deploying.
- **Prescribed — state and effects:** Views accept explicit data and callbacks; hosts own routing, storage, network, authority, command idempotency, revisions, and reconciliation. Controlled changes notify once per user request, never on parent updates. Require stable IDs. Represent pending, rejected, expired, superseded and acknowledged operations distinctly; a request never implies success. Retain drafts on failure and stale results. Keep runtime permissions separate from visual approval. Do not add a provider, router, automatic storage, fake upload, autonomous scheduler, or network call to the library. Use one visibility-aware clock per live scene, bound queues and payload previews, and clean up listeners, timers and object URLs on unmount.
- **Prescribed — dependencies:** Prefer native controls, SVG/CSS and existing dependencies. A new dependency is allowed only when a documented behavior cannot reasonably be delivered with those; vet license, maintenance, transitive size, and report build-time and artifact-size impact. It must meet the optimization-phase build-time, memory, runtime, and bundle-size gates. Keep React, Tailwind, router, animation framework, query client, provider SDK and rich editor out of the base package. Never change the pinned Node or pnpm versions to work around a check.
- **Prescribed — security and data:** Treat tool output, messages, links, files, and preview payloads as untrusted. Render text without raw HTML by default, bound payloads and queues, validate URL schemes, and sandbox rich previews. Consumers validate authorization and external records. Distinguish missing from zero, estimated from measured, exclusive from inclusive cost, dates from instants, and draft plans from executed steps.
- **Delegated — local design:** Choose names and exact component boundaries from existing conventions. Split a catalog row into the smallest coherent user capabilities when its implementation cannot be reviewed and verified in minutes; retain every row requirement and leave the row open until all parts pass. Choose bounded data limits from fixtures and document them. Prefer the simpler native behavior when reference behavior is ambiguous. Record only decisions later slices depend on in this section. No API removal, public behavior change, new persistence format, or outside service action is authorized by this delegation.

## Baseline

At `62eb56a`, Node `26.13.0`, pnpm `12.18.0`, and `jaq` were available. `make check` passed on 2026-11-09: 24 unit/packed tests and 23 Chromium tests; wall time 5.09 seconds on this host. The focused existing CSS-only and runtime-export browser checks passed in 1.03 seconds. These are single loop timings, not performance claims. The source build has one JS entry and emits `styles.css` importing sibling `tokens.css`. A disposable Vite build using the actual Solid plugin and `Badge.tsx` succeeded as a separate library entry. It does not prove packed feature exports, declarations, CSS ordering or isolation; F01 must prove those. Current external Stats and Niceforge integrations were not checked.

F01 baseline on Darwin arm64, Node 26.13.0 and pnpm 12.18.0: `gzip -n -c` measured 2,901 bytes for `dist/styles.css`, 879 for `dist/tokens.css`, 362 for `dist/styles/forms.css`, 319 for `fixture/forms-static.html`, and 708 for `dist/ssr/forms.js`. Separate Vite library builds of consumers importing and using only `Badge`, `Shell`, and `TextField` measured 454, 938, and 661 gzip bytes respectively, excluding external Solid peers. Recreate each consumer under `.work/tmp` as `import { Badge } from '../../../dist/index.js'; console.log(Badge);` and substitute the symbol and entry for the others. Build each separately with Vite 8.3.6 in ES library mode, externalizing `solid-js`, `solid-js/web`, `@solidjs/web`, and `@solidjs/web/jsx-runtime`; use `gzip -n -c` on its output. `/usr/bin/time -l pnpm run build` reported 135,921,664 bytes maximum resident set size. These are single measurements, not speed claims. P1-progress added feedback artifacts of 542 bytes (browser JS), 551 bytes (server JS), and 268 bytes (CSS), measured with `gzip -n -c`; `/usr/bin/time -l pnpm run build` reported 137,068,544 bytes maximum resident set size. P1-disclosure added layout artifacts of 602 bytes (browser JS), 530 bytes (server JS), and 224 bytes (CSS), measured with `gzip -n -c`; `/usr/bin/time -l pnpm run build` reported 137,838,592 bytes maximum resident set size. After P1-accordion the layout browser JS, server JS and CSS measure 1,281, 1,021 and 242 gzip bytes; `/usr/bin/time -l pnpm run build` reported 136,609,792 bytes maximum resident set size. After P1-action the feedback browser JS, server JS and CSS measure 877, 846 and 359 gzip bytes; `/usr/bin/time -l pnpm run build` reported 138,018,816 bytes maximum resident set size. P1-field-ids enables hydration-aware Solid compilation; `@P1-field-ids` verifies that server IDs and input nodes survive hydration in Chromium and WebKit. After that change `gzip -n -c` measured root, forms, feedback and layout browser entries at 5,675, 756, 954 and 1,320 bytes respectively; `/usr/bin/time -l pnpm run build` reported 137,740,288 bytes maximum resident set size. After P1-menu the layout browser JS, server JS and CSS measure 2,614, 1,611 and 526 gzip bytes; `/usr/bin/time -l pnpm run build` reported 139,231,232 bytes maximum resident set size. After C024, the root Badge consumer is 515 gzip bytes and the base stylesheet is 3,053 gzip bytes; `/usr/bin/time -l pnpm run build` reported 138,592,256 bytes maximum resident set size. After C027 the forms browser JS, server JS and CSS measure 1,420, 1,352 and 492 gzip bytes; `/usr/bin/time -l pnpm run build` reported 139,132,928 bytes maximum resident set size. After C030-a, forms browser JS, server JS, CSS and the shared browser popover chunk measure 4,329, 3,548, 650 and 451 gzip bytes. `/usr/bin/time -l pnpm run build` reported 141,623,296 bytes maximum resident set size. After C030-b, forms browser JS, server JS, CSS and the shared browser popover chunk measure 5,501, 4,655, 765 and 451 gzip bytes; `/usr/bin/time -l pnpm run build` reported 141,279,232 bytes maximum resident set size. After C030-c, forms browser JS, server JS, CSS and the shared browser popover chunk measure 6,019, 5,203, 778 and 451 gzip bytes; `/usr/bin/time -l pnpm run build` reported 143,261,696 bytes maximum resident set size. After C030-d, forms browser JS, server JS, CSS and the shared browser popover chunk measure 6,574, 5,807, 778 and 451 gzip bytes; `/usr/bin/time -l pnpm run build` reported 144,490,496 bytes maximum resident set size. After C031-a, layout browser JS, server JS and CSS measure 4,329, 2,884 and 674 gzip bytes; `/usr/bin/time -l pnpm run build` reported 144,605,184 bytes maximum resident set size. After C031-b, layout browser JS, server JS and CSS measure 4,691, 3,028 and 682 gzip bytes; `/usr/bin/time -l pnpm run build` reported 145,506,304 bytes maximum resident set size. After C031-c, layout browser JS, server JS and CSS measure 5,164, 3,566 and 682 gzip bytes; `/usr/bin/time -l pnpm run build` reported 145,358,848 bytes maximum resident set size. A separately bundled TextField consumer was 871 gzip bytes and contained no popover or listbox code. After C040-a, forms browser JS, server JS and CSS measure 7,874, 6,753 and 899 gzip bytes; `/usr/bin/time -l pnpm run build` reported 146,227,200 bytes maximum resident set size. After C040-b, forms browser JS, server JS and CSS measure 8,271, 7,149 and 914 gzip bytes; `/usr/bin/time -l pnpm run build` reported 146,440,192 bytes maximum resident set size. After C040-c, forms browser JS, server JS and CSS measure 9,842, 8,509 and 1,155 gzip bytes; `/usr/bin/time -l pnpm run build` reported 148,062,208 bytes maximum resident set size. After C040-d, forms browser JS, server JS and CSS measure 10,665, 9,611 and 1,168 gzip bytes; `/usr/bin/time -l pnpm run build` reported 148,537,344 bytes maximum resident set size. After C045-a, forms browser JS, server JS and CSS measure 11,791, 10,667 and 1,253 gzip bytes; `/usr/bin/time -l pnpm run build` reported 146,800,640 bytes maximum resident set size. After C045-b, forms browser JS, server JS and CSS measure 12,570, 11,615 and 1,293 gzip bytes; `/usr/bin/time -l pnpm run build` reported 148,144,128 bytes maximum resident set size. After C045-c, forms browser JS, server JS and CSS measure 12,855, 11,993 and 1,322 gzip bytes; `/usr/bin/time -l pnpm run build` reported 150,962,176 bytes maximum resident set size. After C050-a, layout browser JS, server JS and CSS measure 6,819, 4,949 and 888 gzip bytes; `/usr/bin/time -l pnpm run build` reported 152,616,960 bytes maximum resident set size. After C052-a, recipes browser JS, server JS and CSS measure 2,872, 2,713 and 624 gzip bytes. Separate bundled Badge and IntegrationPicker consumers measure 511 and 2,885 gzip bytes; `/usr/bin/time -l pnpm run build` reported 155,041,792 bytes maximum resident set size. Consumer builds use Vite ES library mode with Solid peers external, as in F01. After C059-a, feedback browser JS, server JS and CSS measure 2,632, 2,719 and 554 gzip bytes; `/usr/bin/time -l pnpm run build` reported 154,861,568 bytes maximum resident set size. After C064-a, recipes browser JS, server JS and CSS measure 3,287, 3,233 and 692 gzip bytes. Shared ActionMenu browser/server chunks measure 2,146/1,574 bytes and shared Progress chunks 561/583 bytes; `/usr/bin/time -l pnpm run build` reported 156,401,664 bytes maximum resident set size. After C073-a/b, forms browser JS, server JS and CSS measure 13,364, 12,574 and 1,372 gzip bytes, and layout browser JS, server JS and CSS measure 6,999, 5,384 and 1,029 gzip bytes. The shared chunks noted for C064 remain separate; `/usr/bin/time -l pnpm run build` reported 158,302,208 bytes maximum resident set size. After C074-a, forms browser JS, server JS and CSS measure 14,049, 13,421 and 1,372 gzip bytes; `/usr/bin/time -l pnpm run build` reported 158,859,264 bytes maximum resident set size. After C074-b, forms browser JS, server JS and CSS measure 15,689, 14,498 and 1,483 gzip bytes; `/usr/bin/time -l pnpm run build` reported 159,694,848 bytes maximum resident set size. After C078-a, forms browser JS, server JS and CSS measure 16,066, 15,039 and 1,710 gzip bytes; `/usr/bin/time -l pnpm run build` reported 159,301,632 bytes maximum resident set size. After C079-a, forms browser JS, server JS and CSS measure 17,754, 16,287 and 1,739 gzip bytes; `/usr/bin/time -l pnpm run build` reported 162,168,832 bytes maximum resident set size. After C079-b, forms browser JS, server JS and CSS measure 18,746, 16,708 and 1,744 gzip bytes; `/usr/bin/time -l pnpm run build` reported 162,021,376 bytes maximum resident set size. After C080-a, forms browser JS, server JS and CSS measure 20,338, 17,516 and 1,798 gzip bytes; `/usr/bin/time -l pnpm run build` reported 162,955,264 bytes maximum resident set size. After C081-a, the forms browser and server bundles gzip to 20,944 and 17,999 bytes, forms CSS to 1,826 bytes, and the build peaks at 162,496,512 bytes RSS. After C081-b, the forms browser and server bundles gzip to 21,599 and 18,557 bytes, forms CSS to 1,830 bytes, and the build peaks at 162,447,360 bytes RSS. After C085-a, feedback browser and server bundles gzip to 3,199 and 3,268 bytes, feedback CSS to 600 bytes, and the build peaks at 166,379,520 bytes RSS. After C085-b, feedback browser and server bundles gzip to 3,699 and 3,819 bytes, feedback CSS to 600 bytes, and the build peaks at 162,840,576 bytes RSS. After C085-c, feedback browser and server bundles gzip to 3,805 and 3,956 bytes, feedback CSS to 600 bytes, and the build peaks at 163,217,408 bytes RSS. After C085-clock, feedback browser and server bundles gzip to 4,024 and 4,228 bytes, feedback CSS to 600 bytes, and the build peaks at 162,938,880 bytes RSS. After P2-breadcrumbs, layout browser and server bundles gzip to 7,293 and 5,757 bytes, layout CSS to 1,118 bytes, and the build peaks at 163,725,312 bytes RSS. After P2-popover, layout browser and server bundles gzip to 7,846 and 5,985 bytes, layout CSS to 1,146 bytes, and the build peaks at 164,675,584 bytes RSS. After P2-tooltip, layout browser and server bundles gzip to 8,295 and 6,166 bytes, layout CSS to 1,268 bytes, and the build peaks at 161,038,336 bytes RSS. After S10-a, layout browser and server bundles gzip to 8,658 and 6,653 bytes, layout CSS to 1,627 bytes, and the build peaks at 167,526,400 bytes RSS. After S10-b, layout browser and server bundles gzip to 9,377 and 6,904 bytes, layout CSS to 1,732 bytes, and the build peaks at 165,658,624 bytes RSS. After S16-a, layout browser and server bundles gzip to 10,092 and 8,253 bytes, layout CSS to 1,791 bytes, and the build peaks at 165,609,472 bytes RSS. After S17-split-a, layout browser and server bundles gzip to 11,061 and 8,966 bytes, layout CSS to 1,946 bytes, and the build peaks at 165,822,464 bytes RSS. After S17-split-b, layout browser and server bundles gzip to 11,461 and 9,090 bytes, layout CSS to 2,055 bytes, and the build peaks at 165,625,856 bytes RSS. After S17-tabs-a, layout browser and server bundles gzip to 12,624 and 10,091 bytes, layout CSS to 2,164 bytes, and the build peaks at 166,756,352 bytes RSS. After S17-tabs-b, layout browser and server bundles gzip to 13,007 and 10,480 bytes, layout CSS to 2,184 bytes, and the build peaks at 166,789,120 bytes RSS. After S17-preview-a, layout browser and server bundles gzip to 13,497 and 11,169 bytes, layout CSS to 2,278 bytes, and the build peaks at 168,869,888 bytes RSS. After P3-tab-mechanics, layout browser/server gzip sizes are 13,450/11,113 bytes, forms browser/server sizes are 21,512/18,529 bytes, the shared ID chunk is 152/171 bytes, layout CSS is 2,278 bytes, and the build peaks at 170,377,216 bytes RSS. After P3-settings-a, layout browser and server bundles gzip to 14,032 and 11,682 bytes, layout CSS to 2,400 bytes, and the build peaks at 170,868,736 bytes RSS. After P3-description-a, layout CSS gzips to 2,465 bytes and the build peaks at 169,852,928 bytes RSS. The fixture server now serves built styles to static pages; the static browser checks pass with those styles in Chromium and WebKit. After P3-page-frame-a, layout CSS gzips to 2,533 bytes and the build peaks at 169,181,184 bytes RSS. After P3-page-grid-a, layout CSS gzips to 2,618 bytes and the build peaks at 169,574,400 bytes RSS. After P3-collapse-a, layout browser and server bundles gzip to 14,319 and 11,896 bytes, layout CSS to 2,698 bytes, and the build peaks at 170,426,368 bytes RSS. After C039-table-a, the new data browser and server bundles gzip to 1,135 and 1,496 bytes, data CSS to 284 bytes, and the build peaks at 173,342,720 bytes RSS. After C023-a, data browser and server bundles gzip to 2,991 and 3,660 bytes, data CSS to 546 bytes, and the build peaks at 171,163,648 bytes RSS. After C023-b, data browser and server bundles gzip to 3,916 and 4,776 bytes, data CSS to 702 bytes, and the build peaks at 175,030,272 bytes RSS. After C025-a, data browser and server bundles gzip to 4,635 and 5,677 bytes, data CSS to 838 bytes, and the build peaks at 171,851,776 bytes RSS. The source-level SSR test and packed forms server entry pass; the root and forms entries now select server code in Node and browser code for browser-aware bundlers.

## Sequence

The catalog and the reference sections describe long-term behavior. A row is complete only when its full contract has evidence. The following sequence governs the current milestone:

1. Read both repositories and refresh the reviewed findings against their current revisions. Record complete per-route import graphs, compressed asset sizes, preview transfers, requests, screenshots, and chart lifecycle on the default and large captured fixtures.
2. Choose one investigation journey and state its user-visible improvement. Reproduce relevant correctness and readability failures. Install a real library tarball in Stats and complete that journey with focused regressions and reviewed screenshots.
3. Use the working journey to guide the next one. Fix mixed-axis nested SplitPane ownership and add an explicit responsive-inspector contract before relying on those capabilities. Keep application code out of library DOM internals.
4. Validate any shared table capability against two materially different Stats tables. Keep sorting, selection, pagination, status, metric meaning, and exact domain relationships under the appropriate host authority.
5. Compare the candidate against the fresh baseline. Exercise inactive sections, deep links, large-fleet global metric sorting, chart lifecycle, and both Cloudflare and Node asset serving. Prepare a new immutable library version and the corresponding Stats dependency update.
6. Report the artifact and revisions, improved journeys and evidence, public contracts, payloads, requests, lifecycle, checks, and remaining work ranked by consumer benefit.

## Acceptance

- **Journey:** Preserve list filters, sort and meaningful focus across navigation. Show complete selected identities, units, time windows and comparison coverage. Keep mutation feedback truthful and data missing distinct from zero. Exercise controls inside Stats, including shortcut isolation.
- **Package:** Test a packed tarball, its declared entry points and documented CSS imports. Record its source revision and immutable version. Source aliases or workspace links alone do not prove integration.
- **Efficiency:** Use the fresh per-route baseline and the existing benchmark scripts. Report compressed bundle graphs separately from raw preview transfers. Investigate initial JavaScript growth above 5% per route and attribute it to user benefit. Unrelated routes must not acquire optional families. Check requests, deferred imports, and retained chart work independently. Use repeated comparable runs for timing claims and follow the Charter's host-load gate.
- **Responsive and accessibility:** Inspect desktop, tablet and mobile screenshots with captured data. Test keyboard, focus restoration, narrow containers and 200% zoom where affected. Update WebP goldens only for intentional, reviewed visual changes. Record real assistive-technology gaps under Needs environment.
- **Verification:** Run narrow checks during each slice, then the required library and Stats integrated checks at the milestone. Verify both deployment targets locally. Do not weaken tests or change deployment and publication boundaries.

## Needs environment

P4 chart assistive-technology verification is unassigned and unrun: use `/breakdown-controls.html` and `/breakdown-chart.html` with a named tester, OS, browser and screen reader to inspect focused bar names, linked table values, dimension controls and selected legend states.

P3 exit: `TMPDIR="$PWD/.work/tmp" make check` passed 63 unit/packed and 252 Chromium browser tests. Focused WebKit coverage includes the P3 workbench, split panes, drawers, tabs, page frames, static fixtures, collapse and canvas journey. The canvas host explicitly restores focus after programmatic drawer closure. Real assistive-technology verification remains unassigned and unrun; test the workbench drawers, resizing, tab closure, save states and canvas selection with a named tester and environment.

P2 exit: `TMPDIR="$PWD/.work/tmp" make check` passed 57 unit/packed and 178 Chromium browser tests. Focused WebKit runs covered the P2 settings journey, static forge, date and file inputs, menus, field actions, toaster, popover and tooltip. The binaries under `.work` are disposable and may need reinstalling. WebKit touch drag remains unverified: the automated touch-drag injection uses Chromium DevTools Protocol; WebKit mouse/pointer and touch-tap checks pass. Real assistive-technology verification is unassigned and unrun: record the named tester, OS, browser and screen reader; use `/p2-journey.html`, `/toaster.html`, `/tooltip.html`, `/date-range.html` and `/combobox.html` to check keyboard focus, mixed selection, errors, live announcements and nested Escape. Stats integration is authorized locally. Install a packed tarball and record the consumer checks. Publication and deployment remain outside this campaign.

## Execution boundary and non-goals

Execution may edit and commit locally in this library and the Stats checkout, including their fixtures, tests, docs, and package metadata. It may not push, publish, deploy, modify CI, acquire paid source, activate real credentials, or send external commands. Destructive user data operations and API removals require a separate owner grant and are parked. Existing API contracts remain stable; additive feature exports, new CSS and new typed callback/state contracts are planned changes. No backend, editor engine, scheduler, real speech, billing authority or permission enforcement is implemented by a view.

## Reference use

The detailed sections below specify behaviors, not additional sequencing or work packets. The Sequence and Decisions above supersede their former phase ordering and packet order. The [catalog](affectui-catalog.md) remains the detailed row-level acceptance source. Existing implementation claims in the reference describe the baseline; recheck current source before each slice.

## Reference: existing surface and compatibility

There are **17 component exports plus `groupId`**, implemented in 14 TSX files. These are useful building blocks, but they do not constitute the larger workflows in the reference catalog. The authoritative inventory is [the component reference](components.md) and [`src/index.ts`](../src/index.ts).

| Current surface | Useful coverage | Remaining work |
| --- | --- | --- |
| `Button`, `IconButton`, `Badge`, `Icon` | Native actions, accessible icon labels, status tones, small inline SVG set | Busy actions, semantic appearance choices, richer slots, field-associated controls. Preserve existing button variants. |
| `Panel`, `CollapsiblePanel` | Framed content, controlled/local disclosure and expanded presentation | Accordion, inspector, resizable panes, tabs, review workspace. Expanded panels are not an implemented modal focus trap. |
| `Modal` | Conditionally mounted native dialog, labelled controls, native dismissal | Shared overlay coordination, anchored popovers, menus, tooltips, mobile drawer behavior. CSS alone does not open a dialog. |
| `Segmented` | Controlled group of pressed buttons | Separate radio/tab semantics, roving focus, arrow navigation, counts/icons, overflow. |
| `EmptyState`, `ErrorState`, `Notice`, `Skeleton` | Static empty/error/notice and decorative loading presentations | Async operation states, toast queue, progress, reconnect/stale states, reduced motion. |
| `Pagination`, `Meter` | Page navigation and decorative threshold bar | Controlled table selection/sorting, accessible progress/usage, charts, aggregation. |
| `PageHeader` | Page title and actions | Breadcrumbs, page tabs, sticky collection toolbar, descriptions and secondary navigation. |
| `Shell`, `SideNav`, `groupId` | Real links, named navigation, sticky desktop sidebar, inset main area, stacked mobile navigation | Flat and multi-pane workspace frames, collapsible rail, drawers, local settings nav, artifact tabs, resizable inspector/bottom panel. |
| `.ui-data-table`, `.ui-table-scroll`, `.ui-table-toolbar`, `.ui-search` CSS | Semantic static table and server GET-filter pattern | No `DataTable` TSX export or editable grid exists. Selection, editing, copy/paste, undo, sorting and async data are separate behavior work. |

### Compatibility requirements

1. Preserve all current exports, prop meanings, class names, token names, default geometry, and the absence of component-owned outer margins. Existing consumers must not acquire new behavior by upgrading.
2. Keep `Button.variant` as `default | small | icon`. Add an orthogonal appearance/busy API when needed; do not reinterpret `variant="small"` or substitute AffectUI's variant vocabulary.
3. Keep `Segmented`'s current named button-group contract. Introduce `Tabs` and `RadioGroup` as separate semantic controls. Similar visual treatment does not make their keyboard behavior interchangeable.
4. Keep `Shell`'s existing markup and <=720px stacked-navigation fallback. Introduce an opt-in `Workbench` composition for interactive layouts; do not replace the static shell with drawers.
5. Keep the **one light scheme** as the default. Dark theme parity is an optional later theme pack, not a prerequisite or a change to OS-theme behavior. Existing tests intentionally assert the light scheme.
6. Preserve the two-file CSS-only contract: existing `styles.css` imports only sibling `tokens.css`. New feature styles must not force graph/chat/editor assets onto static consumers.
7. Keep Solid 2 and `@solidjs/web` optional peers. New work does not justify React, Tailwind, a router, an animation framework, a query client, or a provider SDK in the base package.
8. Treat [agent evaluation scenarios](agent-evaluation.md) as unexecuted prompts until actual results are recorded.

## Reference: architecture and package boundaries

### 3.1 Layers

| Layer | Owns | Does not own |
| --- | --- | --- |
| Tokens and CSS | Color, typography, density, spacing, focus, layout, meaningful motion, semantic static markup | Data fetching, application routes, credentials, business policy |
| Primitive components | Fields, menus, tabs, disclosure, buttons, progress, tables, panes, stable focus | Scheduling, model selection policy, persistence or autonomous actions |
| Feature views | Chart, grid, transcript, tool call, decision, run tree, timeline, memory list | Provider connections, hidden global data stores, fabricated outcomes |
| Recipes | Coordinated layouts and shared selected IDs/filters across views | A mandatory application architecture or one backend schema |
| Consumer adapters | Parse external data, normalize IDs/time/money, execute commands, reconcile updates, connect routes | Reimplementing view-specific focus/layout mechanics |

Keep interaction helpers private until at least two real components establish their contract. A private focus utility is useful; a new generalized application framework is not required.

### 3.2 Proposed files and imports

Use the existing repository and toolchain. Proposed additions are deliberately incremental:

| Location | Intended contents |
| --- | --- |
| `src/components/` | Existing primitives and small compatible additions |
| `src/internal/` | Stable IDs, controlled-state helpers, focus/collection navigation, overlay coordination, visibility-aware clock, announcements |
| `src/forms/`, `src/layout/`, `src/data/` | Family entrypoints and reusable primitives |
| `src/chat/`, `src/agents/`, `src/collaboration/` | Optional feature entrypoints and typed view models |
| `src/css/` | Namespaced component/family CSS with existing ordering conventions |
| `fixture/catalog/`, `fixture/recipes/` | Navigable state specimens and complete deterministic compositions |
| `docs/recipes/` | Data boundaries, markup, callbacks, keyboard behavior, responsive rules and integration examples |

Add explicit package subpaths such as `./forms`, `./layout`, `./data`, `./chat`, `./agents`, and later `./collaboration`, with matching declarations. Preserve the existing root entry. Start new feature exports on these subpaths; root re-exports are a deliberate later compatibility decision, not an automatic step.

Add optional family CSS exports, for example `./styles/forms.css` and `./styles/agents.css`. Preserve `./styles.css` and `./tokens.css` unchanged as import paths. Document that a feature consumer loads the base CSS plus the selected family sheet; define shared dependency order once and avoid duplicated token declarations. CSS-only examples must show the exact files to serve. Vite entries, declaration emission, the CSS builder, package exports, tarball tests and CSS side-effect metadata must all agree before adding the first family.

Do not create many npm packages initially. One repository and package with explicit subpaths keeps releases and tokens coherent while allowing payload isolation. Do not claim tree shaking until a packed consumer build proves it. Heavy optional graph/editor code must be absent from an ordinary `Badge` consumer, not merely unused at runtime.

### 3.3 Public component conventions

- Continue `class`, native Solid attribute/event forwarding where appropriate, JSX slots, `ui-*` classes and `--ui-*` tokens. Do not copy React-specific `className`, child introspection or hooks.
- Specify controlled and local modes precisely. A supplied controlled value renders as given; a user request calls its callback once; a parent update never echoes the callback. Defaults are read once. Controlled state without a handler is read-only or disabled with a reason.
- Keep data status separate from presentation status. `open`, `selectedId` and local draft text differ from a run's authoritative status or an acknowledged save.
- Require stable IDs; do not key state by labels, array position, filename alone, or a translated string. Document selection when records disappear, filters hide them, or ordering changes.
- Use discriminated unions and `unknown` at external payload boundaries. Parse external records in an adapter before rendering; do not use broad `any` or assertion casts to conceal an incompatible event shape.
- Expose renderer slots for code, documents, tables, images and files. Begin with safe, bounded previews. Rich document editing, formula evaluation, embedded terminals/browsers and media playback are separate adapters.
- No network calls, imported sample customer data, random API keys, fake microphone output, simulated uploads, auto-approvals or autonomous schedulers in production exports. Deterministic demonstration playback belongs in `fixture/`.

## Reference: shared behavior contracts

These are proposed Laputa requirements, not claims that AffectUI or the current package already satisfies them.

### 4.1 Layout and navigation

Build eight reusable layout families: simple page, responsive dashboard, collection/detail, settings, conversation/workspace, review queue/detail, board/list, and canvas/inspector. Screens select a family and supply slots.

`Workbench` composes navigation, optional secondary navigation, main content, optional work pane and optional bottom diagnostics. Flat/inset is presentation; panes and selected artifacts are independent state. Use real links for routes and button actions for local controls. Preserve ordinary browser open-in-new-tab and URL/deep-link behavior.

Resizing boundaries have a name, orientation, min/max/current size, keyboard arrows, larger-step modifier, Home/End and reset. Clamp saved sizes when the container shrinks. A desktop inspector is a labelled region without a focus trap; its narrow modal presentation uses dialog behavior and returns focus to its opener. Closed surfaces are unmounted or inert. Closing a focused artifact tab selects a predictable neighbor; closing the last tab returns focus to the pane opener.

Use container width for reusable embedded compositions and existing centralized media definitions for page-wide behavior. Do not copy every reference breakpoint into global tokens. Test 320/390/768/1440px viewports, narrow nested panels, long identifiers, 200% zoom and both pointer and touch-style interaction. Wide tables/boards/timelines scroll internally; page chrome remains reachable. Specify scroll ownership so a sticky composer, pane or bottom trace does not create a wheel/keyboard trap.

### 4.2 Fields, menus and overlays

Start with real inputs, labels, fieldsets, legends, selects and textareas. The shared field treatment owns IDs for labels, hints, errors and counters. An error is both visible and associated with its control. Require an accessible name; a placeholder is not the naming strategy. Preserve browser autofill, form submission/reset, read-only state and native validation where supported.

Keep native select and enhanced select/combobox as distinct documented choices. A hidden input does not by itself provide native required-field validation or disabled-field behavior. Search/picking, menu actions, radio groups and tabs must have their respective semantics; do not apply `role=menu` to every list.

One overlay policy handles dismissal, Escape priority, focus return, clipping and modal nesting. Adopt native dialog/popover capabilities where they meet the supported browser contract, with tested positioning/fallback behavior. Tooltip information must be available to keyboard users and must not be the only name or required instruction. Preserve IME composition and normal text editing when implementing Enter/Escape/number shortcuts.

### 4.3 Asynchronous actions

Define a small reusable action presentation state: idle, pending, succeeded, failed, and unavailable. Host domain data adds expired, stale, superseded or cancelled when relevant. A callback can return an explicit result or promise; rejection retains the input/context and exposes retry. Do not make a UI delay proof of a successful operation.

For mutating agent/administrative actions, the adapter carries command ID, target ID, expected revision and capability. Disable duplicate submissions while pending. A late result must not settle a newer request. The application decides idempotency and reconciliation; the view exposes those states. Display optimistic changes only where rollback is specified, and keep irreversible/approval outcomes pending until acknowledged.

Separate approval of one action, a grant of future permission, connection to a service, and execution of the action. No UI control enforces a runtime permission by itself. A countdown displays server expiry; pausing animation or hiding a tab must not extend real authorization. Show undo only when a real reversal/compensation capability is supplied, including expiry and partial failure.

### 4.4 Data, charts and collections

Implement a semantic `DataTable` for reading, sorting, selecting and paging. Implement an optional `EditableGrid` separately for cell navigation, edit/commit/cancel, ranges, TSV clipboard and bounded undo/redo. The former must remain usable as server-rendered HTML; the latter has a larger interaction contract. Avoid promising spreadsheet formulas, thousands of mounted rows, or a new general spreadsheet engine as part of the first table release.

Keep filtering, sort direction, selected IDs, paging and saved views host-controlled and URL-compatible. Include zero results, loading, partial/stale data and errors. Preserve selection by ID through sorting; define whether hidden selected records remain selected. Clipboard parsing is bounded, pasted values are validated by column, and a rejected edit does not silently erase its draft.

Chart primitives share scales, formatters, legend selection, empty states and focusable readouts. Values carry units and comparison meaning. Missing samples are gaps, zero remains a real value, and a negative delta is not inherently bad. Cost may be unknown or estimated. Handle all-zero, constant, negative, mixed-sign and one-point data explicitly. Each chart has a readable table/list equivalent; critical values never require hover or color discrimination.

Use simple SVG/CSS for bounded charts first. Add a specialized dependency only for a measured unmet requirement. Establish documented limits for each view; aggregate, paginate or virtualize large data rather than letting a compact demo accidentally become an unbounded production viewer.

### 4.5 Chat and live activity

Use one transcript model with stable message/version IDs, typed parts, source references, attachments and explicit streaming status. Keep transport/reconnect/durable queue logic in the consumer. The UI renders queued, sending, streaming, interrupted, failed, retrying and completed states without inventing text or success.

Follow the live edge only while the reader is at it. Reading history disables auto-follow and reveals a jump-to-latest count. Preserve text selection, scroll anchor and drafts during streaming and pane resizing. The composer handles IME, multiline input, disabled/busy send, stop, attachments, model/options slots and contextual decisions without covering the transcript. A draft field is not replaced by an approval card.

Citations use stable source IDs, not array indexes as identity. Preview, keyboard focus and source navigation agree; unavailable sources have an explicit state. Render text safely, keep raw HTML disabled by default and bound large code/tool payloads. Validate citation/attachment URL schemes and sandbox untrusted rich previews; an image, link or embed slot is not authority to execute supplied content. Thinking/progress labels describe supplied observable activity; demonstration timers do not manufacture agent reasoning. Speech, dictation and audio playback are opt-in host capabilities.

### 4.6 Agent entities and projections

Start with minimal feature-local types; avoid a single mandatory agent SDK. Agree shared identities for runs, tasks, agent instances, plan revisions/steps, spans/tool calls, decisions, grants, messages, artifacts and activity. Add context snapshots, memory, ledger changes, checkpoints, workers and schedule placements when their phases need them.

| Concern | Required distinction |
| --- | --- |
| Time | Epoch timestamps, run-relative offsets and durations are distinct. Shared clock has an explicit origin/unit. Wall elapsed time differs from the sum of overlapping span durations. |
| Money and tokens | Per-node exclusive amounts differ from inclusive rollups. Never sum an already aggregated parent again. Preserve currency, precision, measured/estimated/final state, credits and unknown values. |
| Progress | Measured, estimated and indeterminate progress are distinct; retries are attempts of a logical task. |
| Topology | Spawn tree, dependency DAG, communication network, handoff sequence, checkpoint history and undo dependencies are separate relationships. |
| Read state | Last-seen cursor/recap dismissal differs from resolving a task or decision. |
| Plan | Editable draft, accepted plan revision and observed execution are separate; steering is an instruction with its own acknowledgment and consumed-step reference. |
| Results | Recommendation, selected candidate and applied result are separate. A high score does not execute a winner. |

Tree, Fleet, Inbox, Running Now, Recap and timeline views consume projections of the same records. A selected run/span/request should identify the same object in every pane. Validate cycles, orphan references, duplicate/out-of-order updates and stale revisions in adapters/selectors. The library need not prescribe an event store, but its fixtures must expose these conditions.

Use one visibility-aware sampled clock per live scene, not an interval per row. Do not tick completed/hidden scenes. Bound rendered history, payload previews and announcements. Compact views show omitted counts and a full-detail path.

### 4.7 Visual design, motion and theme

Retain compact typography, restrained borders, neutral surfaces, semantic accents and existing spacing tokens. Add only needed semantic tokens for focus, control density, pane limits and motion. Do not copy every style variant or introduce a parallel token system. Existing instances retain their appearance; new touch-friendly controls use explicit density/hit-area treatment.

First add a reduced-motion path for the existing Skeleton pulse. Use short transitions for a disclosed section, active tab, pending-to-result state or moved item. Exact text and numbers appear immediately. Continuous gradient, tilt, reveal and marquee effects remain optional examples. Pause unnecessary animation offscreen and when the document is hidden. Never animate every live timestamp or table cell by default.

If a later consumer needs dark mode, provide an explicit opt-in semantic theme sheet and validate all statuses, chart colors, overlays, disabled controls and focus. Do not change `color-scheme: light` behavior for existing consumers or rely on `prefers-color-scheme` rules that the current CSS builder forbids.

## Reference: phase requirements

Phases describe dependency order, not a claim of equal effort or a calendar commitment. Complete one reviewable work packet at a time. Each packet updates its catalog IDs, docs, specimen and meaningful tests together. Do not implement all 172 entries in one change.

| Phase | Outcome | Dependencies | Relative size |
| --- | --- | --- | --- |
| P0 | Baseline, package boundaries and traceable fixture catalog | None | Small |
| P1 | Shared interaction, status and accessibility foundations | P0 | Medium |
| P2 | Complete field, navigation and feedback families | P1 | Large |
| P3 | Workspace and page layout families | P1; selected P2 controls | Large |
| P4 | Collections, editable grid and analytical views | P2, P3 | Large |
| P5 | Chat, citations and document review | P2, P3; selected P4 analytics for Overview | Large |
| P6 | A complete everyday agent task/review loop | P5 and needed P4 collection/progress primitives; editable grid is independent | Large |
| P7 | Multi-agent inspection and operations | P6; P4 visualization primitives | Very large |
| P8 | Administration, onboarding and complete screen recipes | Relevant P2-P7 modules | Large; parallel by recipe |
| P9 | Specialized editors, commerce and optional presentation | Relevant earlier modules; concrete consumer | Separate scoped projects |

### P0 — baseline and delivery structure (superseded by the pilot above)

**P0.1: Record compatibility and payload baselines.** Capture the published/tarball export surface, SSR markup, existing fixture geometry and compressed JS/CSS sizes using the pinned toolchain. Measure a CSS-only page, a root `Badge` consumer, and a representative existing shell. Record environment and build commands; do not invent a size baseline from source-line count.

**P0.2: Establish family packaging.** Implement one small family entry and its CSS sheet through the real package/build pipeline. Test packed declarations, optional peers, CSS imports and isolation. Existing root imports and CSS-only pages must continue working.

**P0.3: Make implemented states discoverable.** Follow the final-phase fixture catalog slice above. Keep static examples available without JS. Do not add Storybook, a documentation service, a registry CLI or a second site framework solely for this plan.

Exit: the pilot proves the proposed boundaries. Add the catalog in the final phase.

### P1 — shared mechanics and basic semantics

**P1.1: Interaction infrastructure.** Stable IDs safe across multiple instances and SSR/hydration; controlled-state convention; focus/roving navigation; overlay dismissal/return; focus-scoped shortcuts; private announcement helper. Test nested overlays and editable-field exceptions before building many menus.

**P1.2: Action and status foundations.** Add busy button behavior without changing `variant`, semantic progress (determinate/indeterminate), labelled status, disclosure/accordion and a generic inline async error/retry treatment. Preserve `Meter` as decorative; use a new semantic component where appropriate.

**P1.3: Motion/focus baseline.** Reduced-motion fallback for Skeleton and new components, visible focus in scrollers, forced-color review, no hidden tabbable panels, explicit disabled/busy differences. Ensure a state change is understandable with all animation removed.

Exit: a native-input/dialog/disclosure specimen where nested Escape, pending rejection and focus restoration work with keyboard only; existing geometry and exports remain stable. The complete field family follows in P2.

### P2 — fields, menus, navigation and notifications

**P2.1: Native forms.** `Field`, `TextField`, `TextArea`, checkbox, switch, radio group/card choice and native select. Labels, hints/errors, optional prefix/suffix, copy/reveal/clear, counter, textarea sizing and submit shortcut. Support long/RTL text, form reset, autofill and disabled/read-only semantics. Extend existing button appearances orthogonally.

**P2.2: Enhanced selection and navigation.** Popover/menu/tooltip, enhanced select, searchable single/multi combobox, tag input, command menu, filter chips/groups, semantic tabs and breadcrumbs. Add profile/integration picker recipes using these pieces. Typing, IME, active descendant, grouped options, disabled entries and empty results share tested mechanics.

**P2.3: Date and upload inputs.** Date-range selection with draft/apply/cancel, presets and optional comparison; explicit locale, week start, date-only/timezone boundaries, min/max and typed entry. Dropzone uses a real file picker and host upload/progress/cancel/retry callbacks; rejection is visible and never faked as completion.

**P2.4: Notification family.** Scoped toast store/host, promise result presentation, action/undo affordance and persistent notification stack. Pause visual timeout on hover/focus/hidden document and preserve reading time. Restore focus only after deliberately dismissing a focused toast, to a still-valid destination; timeout, background completion and unfocused dismissal never steal focus. Keep SSR requests isolated; no process-global cross-request toast state.

Exit: a settings form and filterable collection toolbar exercise the whole family, including failed submission, clipboard failure, unavailable upload, invalid range and mixed checkbox selection. OTP input remains a P8 identity-flow addition.

### P3 — layouts and application chrome

**P3.1: CSS-first page frames.** Responsive grid, section/toolbar, reading column, full-width collection, settings frame/row/save bar, master/detail layout and secondary navigation. Document no-JS markup and semantic headings/landmarks. Preserve the old Shell default.

**P3.2: Interactive workbench.** Add flat/inset presentation, collapsible navigation/rail, optional second nav, accessible split panes, inspector/drawer and bottom diagnostics. Pane widths/open state are controlled or locally initialized; persistence is a consumer callback, not automatic localStorage.

**P3.3: Workspace tabs and artifacts.** Open/select/close tabs with stable artifact identity, overflow, full filename access and predictable focus. Preview text/code/image/table/files through slots. Add action menus and loading/error/not-found/dirty preview states. Closing a tab does not implicitly destroy the application's draft.

Exit: static shell, flat workbench, double-sidebar chat frame, collection/detail and canvas/bottom-panel specimens at all widths. Keyboard resize, last-tab close, mobile Escape and selection routing work. Rich editors are not hidden inside this milestone.

### P4 — tables, collections and analytics

**P4.1: Readable collections.** DataTable, controlled sort/select/page, bulk toolbar, empty/loading/error/stale states, record/card grid, resource cards and list/grid toggle. Share records across views. Provide no-JS GET/filter/navigation examples.

**P4.2: Editable grid.** Separate optional entry with active cell/range, edit/cancel/commit, TSV copy/paste, validation, bounded undo/redo, row operations and pending/rejected edits. Document row/column limits. Start without formulas; richer spreadsheet behavior belongs to an explicit adapter.

**P4.3: Metric vocabulary.** Metric/change cards, line/spark/bar/stacked breakdown, compact ranked breakdown, usage/budget/progress, comparison periods and keyboard readout. Reuse Panel, Badge and semantic progress. Add a shared formatter/scale contract and accessible numeric list/table.

**P4.4: Dashboard compositions.** Analytics, KPI Board, Metrics Dashboard and usage overview from the same primitives. Add activity grid/heatmap only with date labels, missing-data semantics and an alternative list. Project and experiment cards reuse disclosure, selection and chart pieces.

Exit: Stats-style analytics and Niceforge-style run/artifact collection recipes work with data ranges, filters, zero/missing samples, negative deltas, narrow panels and keyboard-only inspection. A grid failure cannot change the read-only table contract.

### P5 — conversation and review surfaces

**P5.1: Conversation primitives.** Transcript/message parts, streaming response, composer, message actions/version selection, stop/retry, source cards/citation previews, model-picker slot and prompt-template form. Build one long-history fixture with scroll anchoring and preserved drafts.

**P5.2: Progress and artifacts.** Thinking/status labels, tool-call card/group, bounded payload inspector, attachment chips, progress/output/resource sidebar, away marker and artifact work area. Tool events are explicit data, not playback timers.

**P5.3: Text collaboration.** Inline prose diff with accept/reject/undo, comment thread/feed, resolved state, and a compact writing-assistant recipe. Rich editor integration and real speech remain adapters. A code line diff is separate from word-level prose review.

Exit: AI Chat Start, Overview and Progress recipes share a composer and workspace; the Run specimen covers transcript/tool/artifact presentation, with its complete plan/approval loop following in P6. A transcript can stream, disconnect, retain a partial response, retry, inspect a source and review a suggested edit. No browser speech/network behavior activates without a supplied capability.

### P6 — complete everyday agent workflow

**P6.1: Shared task/run views.** Status and typed run records, Plan/Trail/Monitor, findings, Inbox/Tasks, Running Now and recap/away summaries. Preserve draft plan versus execution and one selected task ID.

**P6.2: Human decisions.** Decision card/inbox, single approval, scoped permission request and steering input. Implement pending, rejected, expired, superseded and resolved states with exact action/payload access and focus-scoped shortcuts. Deferring a question is not declining it.

**P6.3: Context and policy basics.** Compact context accounting, read/locked/removable sections and a configurable autonomy-policy recipe. Removal/compaction/policy saves request real actions. Unknown token usage and unsupported controls are explicit.

**P6.4: Connected task loop.** One deterministic fixture starts a run, emits calls/findings, requests a choice and one permission, waits for an approval, receives steering, fails/retries, completes and produces an artifact. Opening it from Inbox, Running Now or recap selects the same task. Rejecting any command preserves context.

Exit: Agent Thread, Agent Inbox, Agent Tasks, the full AI Chat Run loop and basic activity/usage recipes are coherent, usable and ready for consumer adapters. They do not require an editable spreadsheet or graph editor to become useful.

### P7 — multi-agent inspection and operations

**P7.1: Hierarchy and time.** Shared tree navigation/selection, Tree/Fleet, actual-time Lanes, Trace Waterfall and Cost Waterfall. Define common origin, explicit exclusive cost, indeterminate spans, bounded history and text alternatives before animation.

**P7.2: Context and collaboration.** Context Map, Memory Panel, handoff detail and collaboration stream with provenance, recipients, safe attachment previews, editable drafts and acknowledged changes. Use the existing inspector and conversation controls.

**P7.3: Operations and review.** Queue, assignment/delegate board, fallback chain, fan-out progress, parallel attempts, Approval Gates and Review Center. Server controls concurrency, assignment and retries; views expose capacity/estimates and rejection.

**P7.4: History and consequences.** Checkpoints, Ledger, Plan vs Actual and Tool Access Map. Define real fork/restore, compensation, dependency impact and replay semantics with adapters. The baseline plan and original calls remain visible after retries/rewinds.

**P7.5: Coordinated workspaces.** Run Inspector, Mission Control, Mission Timeline, Live Session, Agent Orchestration and the memory screen. Shared filtering updates every applicable pane; selecting a call in one lens reveals the same call elsewhere. The complete permissions settings screen follows in P8 using the P6 policy controls.

Exit: one multi-agent fixture covers concurrent work, missing-end spans, delayed costs, failed permission/retry, invalid/orphan references, reconnect and expired undo. Large inputs follow documented grouping/paging limits. A slow visualization cannot block the review actions.

### P8 — administration, setup and recipe completion

**P8.1: Setup.** Stepper form, progress checklist, grouped setup guide, tips and OTP input. Preserve form values through Back/Edit; focus the first invalid field; completion follows acknowledged submission. OTP uses a single accessible field, paste/autofill and externally supplied verification/resend state.

**P8.2: Settings.** General, profile, preferences, notifications, teams, integrations, model/provider settings, Agent Permissions and privacy/security presentations. Use one settings frame, field rows, save/discard bar, tables and pending/error model. External refreshes and late save acknowledgments preserve dirty local edits or expose a revision conflict rather than overwriting them. Real verification, auth, session revocation, notification scheduling and secret creation stay in consumer adapters.

**P8.3: Resource and workflow recipes.** Folders overview/detail, integration directory, record/CRM collection, board/list and evaluations. Share search/filter/view controls. Evals exposes run provenance, changed inputs and case results; choosing a winner does not imply statistical or operational correctness.

**P8.4: Catalog reconciliation.** Every non-specialized screen/block row has a working recipe or a documented mapping to an equivalent composition, source files, state fixtures and verification evidence. Reuse one implementation for equivalent surfaces; demonstrate the differences instead of exporting near-duplicates.

Exit: the common application layouts are available as concise, editable recipes with static/interactive boundaries stated. No inert demo button implies a connected backend.

### P9 — separately scoped capabilities and presentation

These rows remain visible in the matrix. Each requires a named consumer and its own acceptance gate before entering production exports; they are not lost from the plan.

- **Advanced graph/decision views:** Agent Graph, Decision Tree, Root Cause Tree and Judge Bracket. Supply explicit relationships, evidence and unknown/tied/failed states; reuse bounded canvas/inspector/tree primitives and a complete list alternative.
- **Authoring and collaborative editing:** Workflow Builder, Agent Cursors and Conflict Radar. Scope document/range revisions, presence, graph validation, connect/move keyboard operations, undo and merge confirmation. Prefer consumer editor adapters to building an editor or Git merge engine into the dashboard package.
- **Scheduling:** Scheduled Runs needs timezone/DST, capacity, splittable-task semantics and acknowledged scheduling commands. Start with a read-only schedule/list and explicit move requests; do not copy a demo packing heuristic as a scheduler.
- **Commerce/communications:** Billing Schedule, billing settings, invoice/credit example, Pricing Plans and Email Draft. Reuse fields/tables/review; exact monetary arithmetic, billing authority and message delivery belong to adapters. Sending an email has no unconditional UI-only undo.
- **Optional presentation:** Agent Gallery, Logo Marquee, Testimonial Wall, decorative motion and the 26 illustrations. Keep static equivalents and reduced motion; no effect is imported by normal dashboard styles. Model Wheel is an illustration, not a real model selector. Voice Orb must represent supplied activity if ever used functionally.
- **Optional theme pack:** Dark tokens and full-state verification only when a consumer needs them. Default light appearance stays stable.

Exit is per feature. Completing P0-P8 does not entitle the project to claim every P9 behavior is implemented; the matrix retains its exact status and rationale.


### Shared acceptance journeys

1. **Static forge:** shell + GET-filtered table + record detail/settings work with JavaScript disabled and unchanged base CSS imports. `fixture/static-forge-server.ts` supplies an ephemeral local fixture backend; `@P2-static-forge` covers filtering, navigation, settings POST, HTML escaping and narrow layout in Chromium and WebKit.
2. **Analytics:** range/filter changes update metrics, charts and table from one dataset; unknown/missing/zero values and lower-is-better comparisons remain accurate.
3. **CI workbench:** list -> run inspector -> artifact tabs; resize by keyboard, close the last tab, filter out a selected row and recover focus correctly.
4. **Conversation:** compose with IME, attach/fail/retry, stream/stop, scroll into history, receive new output, inspect citations, return to live and retain drafts.
5. **Decision:** open the same request from inbox and run view; show exact payload; acknowledge, reject, expire or supersede it; no duplicate command or local false success.
6. **Multi-agent diagnosis:** tree, timeline, cost and trace refer to the same IDs; parallel duration and cost totals remain correct through delayed/out-of-order data.
7. **Review/history:** compare versions, accept/reject edits, preserve unsaved drafts, preview compensation dependencies, handle failed/expired undo and retain the audit record.
8. **Board/schedule:** complete every move/assignment with buttons or keyboard; reject a move without losing the item; schedule dates and capacities remain authoritative.
