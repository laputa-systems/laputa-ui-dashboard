# @laputa-systems/ui-dashboard

Compact, editorial design system for dashboards: CSS tokens and styles, plus optional Solid
components that render the same markup in browsers and server rendering. Stats uses the Solid components in its dashboard.
Niceforge uses them in its CI workbench and serves the CSS alone to its server-rendered forge
pages, which ship no JavaScript.

See the [component reference](docs/components.md) and [usage patterns](docs/patterns.md). The [agent evaluation scenarios](docs/agent-evaluation.md) are unexecuted.

The [AffectUI coverage plan](docs/affectui-plan.md) and [catalog gap matrix](docs/affectui-catalog.md)
describe the proposed expansion of layouts, forms, data views, chat, and agent workflows.
They are an implementation backlog, not a list of features already shipped.

## Installation

The package is published to the stuff npm registry. Route the scope there in `.npmrc`:

```ini
@laputa-systems:registry=https://npm.17166969.xyz/current/
```

```sh
pnpm add @laputa-systems/ui-dashboard
```

`solid-js` and `@solidjs/web` (`>=2.0.0-rc.18`) are optional peers. Install them only when you
import the JS entry; a CSS-only consumer needs neither.

## Solid usage

```ts
import "@laputa-systems/ui-dashboard/styles.css";

import {
  Badge,
  Button,
  CollapsiblePanel,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  Meter,
  Modal,
  Notice,
  PageHeader,
  Pagination,
  Panel,
  Segmented,
  Shell,
  SideNav,
  Skeleton
} from "@laputa-systems/ui-dashboard";
```

`Button` and `IconButton` accept `appearance="primary"`, `"danger"`, or `"ghost"` without
changing the existing `variant` sizes. `Button` accepts decorative `leadingIcon` and
`trailingIcon` slots. Both buttons accept `busy` to block activation while keeping their label.

Components render only `ui-*` class names. To style an instance from your app, pass `class`
(and `bodyClass` or `slotClass` on panels) and select that, or select the `ui-*` name.

## Forms

Import `TextField` from `@laputa-systems/ui-dashboard/forms`. Load `styles/forms.css` after
`styles.css`. The field requires a unique `id` and a visible `label`; `hint` and `error`
are linked to the input. Generated description IDs reserve the `ui-field-description-` prefix.
For multiple server-rendered roots, use a distinct Solid `renderId` for each root and its hydration.
The forms entry supports server rendering and browser use. Native input attributes, `value`, `defaultValue`, and input events
are forwarded. Use `defaultValue` for native form reset and `value` for parent-owned state.

```tsx
import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { TextField } from "@laputa-systems/ui-dashboard/forms";

<TextField id="repository" label="Repository" name="repository" hint="Use a slug" required />
```

`Checkbox` from the same entry uses a native checkbox and supports optional hint, error, card,
and mixed presentations. Use `defaultChecked` for local state, or `checked` with
`onCheckedChange` for parent-controlled state. Group related choices with `<fieldset>` and
`<legend>`. The mixed presentation requires JavaScript to set the native indeterminate property.

`Combobox` from `forms` provides a controlled, searchable single selection with optional
option groups. Supply stable option IDs and at most 500 options. The host owns the selected ID;
this slice does not provide multi-select, creation, or an async query contract. It needs
JavaScript and the browser Popover API. Use a native `<select>` when JavaScript or native
required-field validation is needed.

## Progress

Import `Progress` from `@laputa-systems/ui-dashboard/feedback` and load
`styles/feedback.css` after `styles.css`. Supply a label and a finite value between zero
and `max` (100 by default). Omit `value` when progress is unknown. Invalid values throw.
The component uses native `<progress>` semantics and supports server rendering.

```tsx
import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/feedback.css";
import { Progress } from "@laputa-systems/ui-dashboard/feedback";

<Progress label="Upload" value={5} max={10} />
```

`ActionStatus` from the same entry presents host-supplied idle, pending, succeeded, failed,
and unavailable states. A failed state offers Retry only when the host supplies a callback.
The host owns the operation, error details, and acknowledgment.

## Disclosure

Import `Disclosure` from `@laputa-systems/ui-dashboard/layout` and load
`styles/layout.css` after the base stylesheet. `defaultOpen` initializes local state once.
Set `open` and `onOpenChange` together for parent-controlled state. A controlled disclosure
without a callback is read-only. The component uses native `<details>` and `<summary>`. `Accordion` coordinates a single open
item and supports arrow, Home, and End navigation; its unique `id` scopes the native group.

```tsx
import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { Disclosure } from "@laputa-systems/ui-dashboard/layout";

<Disclosure label="Details"><p>More information</p></Disclosure>
```

`ActionMenu` in the layout entry displays locally managed action choices. It needs JavaScript
and the browser Popover API; provide ordinary links or forms when actions must work without
JavaScript. Menu IDs reserve the `ui-action-menu-` prefix.

## CSS-only usage

`tokens.css` and `styles.css` need no JavaScript. Serve
both files and emit the `ui-*` class names the components render. A server resolves the files
from the installed package:

```ts
const styles = fileURLToPath(import.meta.resolve("@laputa-systems/ui-dashboard/styles.css"));
const tokens = fileURLToPath(import.meta.resolve("@laputa-systems/ui-dashboard/tokens.css"));
```

```html
<link rel="stylesheet" href="/ui/styles.css">
```

`styles.css` imports `./tokens.css`, so serve both from the same directory. For forms, also
serve `styles/forms.css` and load it after `styles.css`. The same field needs no JavaScript:

```html
<div class="ui-field">
  <label class="ui-field-label" for="repository">Repository</label>
  <input class="ui-text-field" id="repository" name="repository" aria-describedby="repository-hint" required>
  <div class="ui-field-hint" id="repository-hint">Use a slug</div>
</div>
```

## Tokens

All tokens are `--ui-*` custom properties on `:root`, each defined once in `tokens.css`:
color (`bg`, `surface`, `text`, `text-2`, `muted`, `line`, `line-strong`, `hover`, `accent`,
`good`/`ok`, `serious`/`warn`, `critical`/`bad`, tinted backgrounds `accent-soft`, `ok-soft`,
`warn-soft` and `bad-soft`, the `scrim` behind modals and expanded panels, `viz-blue`,
`viz-ghost`, and the series colors `s0` to `s4`), type (`font`, `mono`, `fs-*`, `weight-*`,
`tracking-*`), spacing (`space-*`, `inset`), sizes (`control*`, `head-height`, `icon-size`,
`row-height`, `dot*`, `side-*`), radius, shadow and z-index.

There is one light scheme. `tokens.css` declares `color-scheme: light` and has no dark
values, so a page renders the same whatever the operating system prefers.

## Spacing

Components set no outer margin. The page or container that places them owns the space
between them, for example with a grid or flex `gap`.

## Visually hidden text

`ui-sr-only` keeps text in the document for screen readers and removes it from layout:

```html
<span class="ui-sr-only">3 failing checks</span>
```

## App shell

A sidebar and a main panel. It works without JavaScript: above 720px the sidebar is sticky
and 236px wide (`--ui-side-width`). At 720px and below the sidebar stacks above the content
and its nav links wrap in a row, with no horizontal overflow at 390px.

The Solid `Shell` renders exactly this markup. Server-rendered pages must emit the same
structure:

```html
<div class="ui-shell">
  <aside class="ui-side">
    <div class="ui-side-top">
      <a class="ui-side-brand" href="/">[optional svg mark]niceforge</a>
    </div>
    <div class="ui-side-body">
      <nav class="ui-side-nav" aria-label="Main">
        <a href="/repositories" aria-current="page">Repositories</a>
        <a href="/settings">Settings</a>
      </nav>
      <nav class="ui-side-nav" aria-labelledby="ui-side-group-1">
        <span class="ui-side-group" id="ui-side-group-1">CI</span>
        <a href="/runs">Runs</a>
      </nav>
      <div class="ui-side-foot">
        <form method="post" action="/session/logout"><button type="submit">Sign out</button></form>
      </div>
    </div>
  </aside>
  <main class="ui-main" id="main" tabindex="-1">...</main>
</div>
```

- Mark the current page with `aria-current` (`page`) on its `<a>`; it is the only current styling.
- Each `ui-side-nav` is named either by `aria-label` or, when it shows a heading, by a
  `ui-side-group` span inside it referenced through `aria-labelledby` (unique id).
- `ui-side-foot` is optional. Direct `<a>` and `<button>` descendants (also inside a form) are
  styled as nav links.
- Icons inside nav links and the brand are `<svg>` elements sized to 16px.

```tsx
<Shell
  brand={{ href: "/runs", name: "niceforge", mark: <Icon name="activity" size={16} /> }}
  nav={[
    { label: "Main", items: [{ href: "/runs", label: "Runs", current: true }] },
    { label: "CI", heading: true, items: [{ href: "/runners", label: "Runners" }] }
  ]}
  foot={<button type="button">Sign out</button>}
>
  {page}
</Shell>
```

`heading: true` renders the visible group label; the group's id is `ui-side-group-<index>`
(`groupId(index)`). `SideNav` renders one nav group on its own.


## Development

Node and pnpm versions are pinned in `.node-version` and `packageManager`.

```sh
pnpm install --frozen-lockfile
make check            # typecheck, build, unit and browser tests
make publish-dry-run  # pack into .work/tmp/pack and show the stuff publish plan
make publish          # publish the packed tarball to the stuff npm registry
```

Each component's CSS lives in `src/css/<component>.css` with its responsive rules inline;
`src/styles.css` lists them in cascade order, and the named breakpoints live once in
`src/css/media.css`. `make build` inlines them into the single `dist/styles.css` that imports
only `dist/tokens.css`, so a CSS-only consumer serves exactly those two files.
`make test-browser` checks layout invariants in Chromium against the app in `fixture/`.

A published `name@version` is immutable, so bump `version` before publishing a change.
