# Usage patterns

Import `@laputa-systems/ui-dashboard/styles.css` in a Solid app. For server-rendered HTML,
serve the built `styles.css` and `tokens.css` together. The stylesheet imports `tokens.css`.
The application owns page layout, data loading, and routes.

## Lay out monitoring panels

Use a grid owned by the page. The columns narrow and wrap without a fixed breakpoint. The
meter is decorative, so show its value as text too.

```tsx
import { Badge, CollapsiblePanel, Meter, PageHeader } from "@laputa-systems/ui-dashboard";

export function Monitoring() {
  return <>
    <PageHeader title="Monitoring" titleExtra={<Badge tone="ok" dot>Healthy</Badge>} />
    <div class="monitoring-grid">
      <CollapsiblePanel title="CPU" collapsible expandable meta="Now">
        <p>CPU usage: 62%</p>
        <Meter value={62} warn={70} bad={90} />
      </CollapsiblePanel>
      <CollapsiblePanel title="Memory" collapsible expandable meta="Now">
        <p>Memory usage: 48%</p>
        <Meter value={48} warn={70} bad={90} />
      </CollapsiblePanel>
    </div>
  </>;
}
```

```css
.monitoring-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: var(--ui-space-md);
  margin-top: var(--ui-space-md);
}
```

## Filter a table without JavaScript

Serve both stylesheets at `/ui/`. The server handles `GET /repositories?q=...`, filters the
rows, and renders the submitted query in the input. Escape rendered values as HTML. This
example shows one matching row; the status text carries the meaning independently of color.
The table scrolls inside its panel on a narrow screen.

```html
<link rel="stylesheet" href="/ui/styles.css">
<section class="ui-panel">
  <header class="ui-panel-head">
    <div class="ui-panel-title"><h2>Repositories</h2></div>
  </header>
  <div class="ui-panel-body ui-panel-flush">
    <form class="ui-table-toolbar" method="get" action="/repositories">
      <label class="ui-search">Search
        <input type="search" name="q" value="api">
      </label>
      <button class="ui-btn" type="submit">Filter</button>
    </form>
    <div class="ui-table-scroll" tabindex="0" role="region" aria-label="Repository results">
      <table class="ui-data-table">
        <thead><tr><th scope="col">Repository</th><th scope="col">Status</th><th scope="col">Updated</th></tr></thead>
        <tbody><tr>
          <td><a href="/repositories/api">api</a></td>
          <td><span class="ui-badge ui-badge-ok">Ready</span></td>
          <td><time datetime="2026-11-01">Nov 1, 2026</time></td>
        </tr></tbody>
      </table>
    </div>
  </div>
</section>
```

## Navigate to details and open a dialog

Use real links for navigation. The current route is marked in the sidebar. Mount the dialog
only while it is open and unmount it in `onClose`; its close button, Escape, and supported
native backdrop dismissal use that callback.

```tsx
import { createSignal, Show } from "solid-js";
import { Badge, Button, Modal, PageHeader, Panel, Shell } from "@laputa-systems/ui-dashboard";

export function RepositoryDetail() {
  const [open, setOpen] = createSignal(false);
  return <Shell
    brand={{ href: "/", name: "Forge" }}
    nav={[{ label: "Main", items: [
      { href: "/repositories", label: "Repositories", current: true },
      { href: "/settings", label: "Settings" }
    ] }]}
  >
    <PageHeader title="api" titleExtra={<Badge tone="ok">Ready</Badge>} />
    <Panel title="Repository">
      <p>Default branch: main</p>
      <Button onClick={() => setOpen(true)}>View clone address</Button>
    </Panel>
    <Show when={open()}>
      <Modal title="Clone address" label="Clone address" onClose={() => setOpen(false)}>
        <p><code>ssh://git@example.test/api.git</code></p>
      </Modal>
    </Show>
  </Shell>;
}
```

`Shell` stacks navigation above content at narrow widths. A server-rendered page can emit the
[shell markup](../README.md#app-shell) instead. CSS alone does not implement the dialog.
