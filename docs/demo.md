# The component field guide (`make demo`)

Run `make demo` from the repository root. It builds the current package with the pinned Node/pnpm toolchain, starts the local Vite server at <http://127.0.0.1:4320/>, and opens the tour. Stop with Ctrl+C. To use another port: `make demo DEMO_PORT=4321`. The same tour is also served at `/demo.html`. The geometry probe used by the alignment tests is at `/geometry.html`.

Eight chapters present components in representative product layouts rather than a grid of disconnected variants. Chapters are reachable through the persistent navigation, Next/Previous controls, and URL hashes. No credentials, API keys, or backend are required. All interactions update local demonstration state; file attachments are never uploaded and service connections are simulations.

| Chapter | What you can inspect |
| --- | --- |
| Foundations | Buttons, icons, badges, panels, modal, app shell, native states, pagination, meter and segmented control |
| Forms & inputs | Labels, textarea, checkbox/switch, radio, native/enhanced select, single/multiple combobox, tags, calendar range and files |
| Navigation | Breadcrumbs, tabs, accordion/disclosure, action and command menus, filters, popover, tooltip, shared search dialog |
| Data views | Change summaries, signed series breakdown, semantic table and controlled sortable header |
| Workspaces | Workbench, drawers, split panes, artifact tabs and previews, settings row, save bar |
| Feedback | Progress, host action state, persistent notices and transient toast store |
| Recipes | Integration directory and account/profile menu |
| Editorial & themes | Article/citation/reference/figure/taxonomy styles, default and paper appearances, scoped dark theme |

Source: `fixture/demo/main.tsx`, `fixture/demo/scenes.tsx`, and `fixture/demo/tour.css`. The gallery deliberately consumes built family entrypoints and CSS sheets, so packaging failures aren't hidden by source aliases. The page uses the library shell so every chapter stays listed, with the stats dashboard's type, status strip, and panels inside the main column. `tour-*` classes only place those regions. The library keeps component behavior. Type uses the dashboard font stack, with a paper theme that switches the page to a serif face. No external fonts, images, or service requests are needed.

`node scripts/check-demo-coverage.mjs` compares actual JSX component usage with every non-type export from all six public component entrypoints. It checks three public helpers and the editorial/theme hooks, and runs as part of `make test-browser` / `make check`. `tests/browser/demo.spec.ts` covers all chapters, local state, focus, themes, and mobile overflow using the existing fixture Vite server.

Export coverage is an **inventory guard**, not a claim that every documented variant, async edge, or assistive-technology combination has an individual visual example. The focused tests for each public component remain the behavioral oracle.
