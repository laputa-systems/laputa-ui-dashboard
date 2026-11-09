# AffectUI coverage and implementation plan

Status: **proposed implementation backlog; this change is documentation only.**

Research snapshot: **2026-11-09**. Repository baseline: [`2fd9866c2ef28e27815cb6586bf65e31a96013d1`](https://github.com/laputa-systems/laputa-ui-dashboard/commit/2fd9866c2ef28e27815cb6586bf65e31a96013d1), package version **0.5.0**.

## 1. Objective and recommendation

Expand this package from a small dashboard primitive set into a coherent library of forms, workspace layouts, data views, chat surfaces, and agent workflows, using AffectUI's public catalog as a coverage reference. Keep Laputa's compact editorial appearance, Solid 2 implementation, explicit state, and useful CSS-only mode.

The highest-return work is a set of reusable layout and interaction foundations. AffectUI's many screens share navigation, panes, tabs, collections, inspectors, fields, and action states. Implementing those once makes the screen catalog achievable without putting a separate application into every component.

The companion [catalog and gap matrix](affectui-catalog.md) accounts for **172 reference items**:

| Catalog section | Items | Treatment |
| --- | ---: | --- |
| Components | 90 | Map every item to an existing partial primitive, new primitive, feature module, or specialized recipe. |
| Screens | 34 | Compose reusable page layouts and demonstrate each named screen family. |
| Blocks | 14 | Reuse the same components and state across larger compositions. |
| Motion | 8 | Add useful state transitions selectively; explicitly defer decorative effects. |
| Illustrations | 26 | Inventory explicitly; optional art does not become a prerequisite for functional dashboard coverage. |

Every catalog row has a stable ID, source link, proposed implementation destination, delivery phase, and observable acceptance requirement. These IDs are planning identifiers, not public API names. They should survive later renames. Nothing in the matrix is marked implemented merely because this plan exists.

### Research method and limits

The audit read the public detail documentation for all 90 components, 34 screens, 14 blocks, and eight motion effects, including props, keyboard, accessibility, and responsive sections where supplied. It enumerated all 26 illustrations and examined Model Wheel and Voice Orb more closely. The initial text index returned 33 screens; a refreshed index and the live site showed 34, including **AI Chat / Progress**. The matrix uses the later snapshot.

Live browser inspection covered the catalog, App Shell Inset, Data Table, and Mission Control previews. In App Shell Inset, the labelled sidebar separator changed from 272 to 288 after a right-arrow keypress. This is representative visual/interaction evidence, not an assertion that every demo, viewport, keyboard path, or accessibility claim was independently tested. The public documentation is a design specification to learn from, not a conformance report.

The source audit covered the repository's components, CSS, exports, build, fixtures, documentation, and tests. Stats and Niceforge usage is documented by this repository; their current integrations were not separately audited in this task.

Public pages label some examples MIT/free and others Pro. The plan calls for original Solid/CSS implementations of useful behaviors. It does not depend on acquiring or redistributing Pro source, copying branded assets, or translating an entire React file. If a future change reuses any source, record its exact provenance and applicable license in that change. No paid source was obtained for this audit.

## 2. Baseline: what already exists

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

## 3. Architecture and package boundaries

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

## 4. Shared behavior contracts

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

## 5. Delivery phases and concrete work packets

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

### P0 — baseline and delivery structure

**P0.1: Record compatibility and payload baselines.** Capture the published/tarball export surface, SSR markup, existing fixture geometry and compressed JS/CSS sizes using the pinned toolchain. Measure a CSS-only page, a root `Badge` consumer, and a representative existing shell. Record environment and build commands; do not invent a size baseline from source-line count.

**P0.2: Establish family packaging.** Implement one small family entry and its CSS sheet through the real package/build pipeline. Test packed declarations, optional peers, CSS imports and isolation. Existing root imports and CSS-only pages must continue working.

**P0.3: Make implemented states discoverable.** Add a lightweight fixture catalog using existing Vite infrastructure: searchable component/recipe list, source and catalog ID, state selector, container width and reduced-motion controls. Keep static examples available without JS. Avoid adding Storybook, a documentation service, a registry CLI or a second site framework solely for this plan.

Exit: one reproducible baseline report and a packed consumer proving the proposed boundaries. The catalog marks planned versus implemented explicitly.

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

## 6. Verification and acceptance

### Current gate

Follow `AGENTS.md`: no formatters, and run **`make check`** with the pinned toolchain. It covers typecheck, build, declaration checks, packed-package/SSR tests and Chromium browser tests. `pnpm run check` is a different, narrower command (lint, typecheck and unit tests); it does not replace the Makefile gate. Run the lint script as appropriate alongside the required gate.

The planning task attempted `make check` on the baseline. It stopped at `node-ready` with **`use the Node version in .node-version`**. This environment has Node 24.22.1; the repository requires 26.13.0 and pnpm 12.18.0. `jaq` is also absent here. No gate passed, no pins were changed, and no implementation or test behavior was changed by this plan. Future implementation must use the required environment.

### Required checks for implementation packets

| Risk | Evidence required |
| --- | --- |
| Existing consumers regress | Existing SSR/classes, root export array, exact prop/type checks, geometry and no-JS fixture stay green. Intentional additions update assertions explicitly. |
| Optional features enlarge the core | Packed consumer builds for CSS-only, base component, forms, analytics, chat and agents; compare compressed output/import graphs to P0 baseline. No graph/editor/provider code in the base consumer. |
| CSS shipping differs from dev | Serve the packed CSS and tokens in static and Solid fixtures; test feature-sheet order, every token reference, no unintended imports/resets and unchanged base paths. |
| Controlled state lies or duplicates effects | Callback once per user action; parent updates do not echo; pending failure retains context; duplicate/late results and stale revisions do not settle the wrong request. |
| Keyboard/focus breaks | Menu/list/tree/tab/grid paths, nested Escape, focus after deletion/resolve/close, modal versus docked pane, no hidden tabbable content, IME and editable-field shortcut exceptions. |
| Layout breaks | Existing viewport widths plus narrow embedded containers, long text, many tabs, 200% zoom, touch-sized controls and internal scrolling without page overflow. |
| Data is misleading | Empty/zero/missing/negative/unknown cases, timezone/date boundaries, planned versus actual time, overlapping durations, credits and exclusive/inclusive costs. |
| Live UI overwhelms readers or CPU | Bounded rows/payloads; coalesced semantic announcements; one shared clock; hidden/completed scenes stop unnecessary work; reduced motion preserves all information. |
| Static usage is lost | No-JS shell, forms, GET filters, tables, settings and read-only snapshots have usable examples. Interactive-only features are labelled honestly. |
| Browser-sensitive behavior is assumed | Chromium remains the current gate. Add targeted Firefox/WebKit/manual assistive-tech evidence for native popover/dialog, clipboard, IME, touch and calendar behavior when these features are introduced; record untested coverage explicitly. |

Do not add superficial tests that restate a prop or mirror the implementation. Test the shared mechanisms and the assembled user journeys where bugs cross component boundaries. Accessibility documentation is not a substitute for executing those paths.

### Performance acceptance policy

Measure before setting numeric budgets. P0 records bytes, environment and representative rendering/update measurements; the first implementation packet proposes explicit limits using that baseline. Report meaningful regressions and their cause. Do not claim a frame-rate, bundle size, scalability limit or full browser support that has not been measured.

Default safeguards are architectural: optional subpaths, zero provider/network dependencies in views, bounded data, virtual/paged alternatives for large collections, no offscreen playback, no per-row clocks and no rich editors bundled into Shell. The benchmark fixtures should include a large collection, live trace, long transcript and repeated mounted/unmounted panes so memory/listener cleanup is visible.

### Shared acceptance journeys

1. **Static forge:** shell + GET-filtered table + record detail/settings work with JavaScript disabled and unchanged base CSS imports.
2. **Analytics:** range/filter changes update metrics, charts and table from one dataset; unknown/missing/zero values and lower-is-better comparisons remain accurate.
3. **CI workbench:** list -> run inspector -> artifact tabs; resize by keyboard, close the last tab, filter out a selected row and recover focus correctly.
4. **Conversation:** compose with IME, attach/fail/retry, stream/stop, scroll into history, receive new output, inspect citations, return to live and retain drafts.
5. **Decision:** open the same request from inbox and run view; show exact payload; acknowledge, reject, expire or supersede it; no duplicate command or local false success.
6. **Multi-agent diagnosis:** tree, timeline, cost and trace refer to the same IDs; parallel duration and cost totals remain correct through delayed/out-of-order data.
7. **Review/history:** compare versions, accept/reject edits, preserve unsaved drafts, preview compensation dependencies, handle failed/expired undo and retain the audit record.
8. **Board/schedule:** complete every move/assignment with buttons or keyboard; reject a move without losing the item; schedule dates and capacities remain authoritative.

## 7. First shipments and work allocation

Start with three useful, reviewable shipments:

1. **Foundation:** P0/P1 plus native fields, semantic tabs/menu, reduced motion and a complete settings form. Proves the public contracts and packaging.
2. **Dashboard/workbench:** P3 plus read-only collections and P4 analytics. Delivers the biggest immediate layout gain for the documented Stats/Niceforge use cases.
3. **Agent run loop:** P5/P6 with composer, tool calls, plan/progress, decision/permission/approval and a shared inbox/inspector. Then expand to P7 operational views.

Parallelize by stable contracts: one workstream owns fields/selection; one owns layout/focus; one owns data/visualization after the contracts land. Chat and agent streams can proceed once the overlay, input and pane APIs stabilize. Assign one owner to shared CSS/token/export changes. Avoid concurrent edits to the same root barrel, CSS manifest or state schema without coordination.

Each handoff should name the catalog IDs, prerequisites, allowed files, public contracts to preserve, one complete user journey and the required checks. Require a single coherent diff per packet and a short result describing implemented versus fixture-only behavior. An example handoff for P3.2 is: implement Workbench and SplitPane in the layout subpath, preserve Shell, demonstrate keyboard/pointer resizing plus narrow drawer/focus behavior, verify packed CSS and no-JS baseline, and stop before rich editor work.

## 8. Completion and maintenance

For every implemented catalog row, record the component/recipe source, documentation, fixture states, relevant tests and actual verification result. If one primitive satisfies several rows, link those rows to the same source and demonstrate the distinct compositions. A screenshot-only imitation is not completion of an interaction contract; a backend placeholder is not a working adapter.

P0-P8 are complete when the relevant matrix rows have equivalent implemented behavior, the shared journeys pass, package boundaries are measured, CSS-only coverage is preserved, and consumer integration evidence exists. P9 rows remain individually scoped until their adapters and acceptance checks exist. Decorative deferrals remain explicit decisions, not accidental omissions.

Refresh the AffectUI inventory when beginning a new phase, recording added/renamed/removed entries rather than changing the 2026-11-09 baseline silently. Do not pursue an ever-changing raw component count at the expense of a consistent library. Reassess each addition by reusable behavior and concrete consumer need.

### Primary references

- AffectUI [components](https://www.affectui.com/components), [screens](https://www.affectui.com/screens), [blocks](https://www.affectui.com/blocks), [motion](https://www.affectui.com/motion), [illustrations](https://www.affectui.com/illustrations); exact item sources are linked in the [catalog matrix](affectui-catalog.md).
- Layout evidence: [App Shell Inset](https://www.affectui.com/screens/app-shell), [App Shell Flat](https://www.affectui.com/screens/app-shell-flat), [AI Chat / Progress](https://www.affectui.com/screens/agent-chat-progress), [Mission Control](https://www.affectui.com/blocks/mission-control).
- Interaction evidence: [Text Field](https://www.affectui.com/components/text-field), [Data Table](https://www.affectui.com/components/data-table), [Toaster](https://www.affectui.com/components/toaster), [Tool Call Card](https://www.affectui.com/components/tool-call-card). Source recommendations are translated into the original Laputa contracts above, not adopted blindly.
- Pinned repository evidence: [README](https://github.com/laputa-systems/laputa-ui-dashboard/blob/2fd9866c2ef28e27815cb6586bf65e31a96013d1/README.md), [components](https://github.com/laputa-systems/laputa-ui-dashboard/blob/2fd9866c2ef28e27815cb6586bf65e31a96013d1/docs/components.md), [package](https://github.com/laputa-systems/laputa-ui-dashboard/blob/2fd9866c2ef28e27815cb6586bf65e31a96013d1/package.json), [CSS builder](https://github.com/laputa-systems/laputa-ui-dashboard/blob/2fd9866c2ef28e27815cb6586bf65e31a96013d1/scripts/build-css.mjs), [packed tests](https://github.com/laputa-systems/laputa-ui-dashboard/blob/2fd9866c2ef28e27815cb6586bf65e31a96013d1/tests/packed.test.ts), [browser tests](https://github.com/laputa-systems/laputa-ui-dashboard/blob/2fd9866c2ef28e27815cb6586bf65e31a96013d1/tests/browser/geometry.spec.ts), [Makefile](https://github.com/laputa-systems/laputa-ui-dashboard/blob/2fd9866c2ef28e27815cb6586bf65e31a96013d1/Makefile).
