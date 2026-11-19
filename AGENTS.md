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
- Performance workload is unspecified. The browser cases cover behavior
  and layout. In-scope consumers include Stats, Stuff, and bctl.
