# Dashboard library

Read [README.md](README.md), [component reference](docs/components.md), and the affected
source and tests before changes. Preserve public exports, CSS classes, tokens, appearance,
and both Solid and CSS-only use. Keep documentation and behavioral tests with contract changes.
Run `make check` locally. Do not run formatters.
The [agent evaluation scenarios](docs/agent-evaluation.md) are unexecuted prompts, not results.

## Verification

- `make test-ci` runs type-aware lint, type checks, and 68 unit and
  package tests. On macOS ARM64 it took 4.47 s after installation and
  3.38 s on repeat. `pnpm run lint` took 0.31 s and reported 49 warnings.
- `make check` also builds the package and runs 338 Chromium cases.
  The full local command took 18.88 s. Read `.node-version` and
  `package.json` for the runtime and package manager pins.
- `tests/types.ts` checks TSX types. `tests/ui.test.tsx` checks component
  behavior and server rendering. `tests/packed.test.ts` exercises the
  packed JS, declarations, conditional exports, and CSS assets.
- `tests/browser/` checks interaction, focus, geometry, themes, and
  CSS-only editorial usage. Demo coverage exercises the fixture inventory.
- Edit: `pnpm exec playwright test tests/browser/geometry.spec.ts --grep
  'modal confines' --workers=1` checks modal focus and inertness against
  the built `dist`; rebuild after changing source (observed 0.99 s runner time).
- Change: `make test` builds and checks TSX, server rendering and the packed
  consumer. `make test-browser` builds and checks Chromium interactions.
  Full: `make check` runs both plus typecheck (observed 20.20 s under load;
  68 unit/package and 338 browser cases before the focus test).
- Package exports and built files: `tests/packed.test.ts`; modal focus and
  dismissal: `tests/browser/geometry.spec.ts`; popover and forms: `tests/browser/affectui.spec.ts`;
  search: `tests/browser/search-dialog.spec.ts`; tables: `tests/ui.test.tsx`
  and `tests/browser/affectui.spec.ts`; token and theme application:
  `tests/browser/theme.spec.ts`, `themes.spec.ts`, and `theme-dark.spec.ts`.
- Coverage is unmeasured: no `make coverage` target or declared Vitest coverage
  provider. Stryker is not installed. Browser tests exercise built artifacts,
  so rebuilding is essential before fault injection.
- Performance workload is unspecified. The browser cases cover behavior
  and layout. In-scope consumers include Stats, Stuff, and bctl.
