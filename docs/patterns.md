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

## Review a queue without JavaScript

Render one native `POST` form per queue row. Link a visible field error with `aria-describedby`
and `aria-invalid`, and keep the server's hidden values. Approve and Reject share a `name` and
differ by `value`, so the server reads one `status` field. The page owns the row gap and action
row; library components set no outer margin.

```html
<form method="post" action="/admin/review">
  <input type="hidden" name="csrf" value="...">
  <input type="hidden" name="subject_id" value="artist:ada-lovelace">
  <input type="hidden" name="expected_data_epoch" value="...">
  <input type="hidden" name="idempotency_key" value="...">
  <div class="ui-field">
    <label class="ui-field-label" for="review-score">Score</label>
    <input class="ui-text-field" id="review-score" name="score" type="number" min="1" max="10" step="0.1" inputmode="decimal" aria-describedby="review-score-hint review-score-error" aria-invalid="true">
    <div class="ui-field-hint" id="review-score-hint">1 to 10, one decimal place.</div>
    <div class="ui-field-error" id="review-score-error">Enter a score between 1 and 10.</div>
  </div>
  <div class="ui-field">
    <label class="ui-field-label" for="review-note">Note</label>
    <textarea class="ui-text-field ui-textarea" id="review-note" name="note" rows="2" maxlength="4000"></textarea>
  </div>
  <div class="review-actions">
    <button class="ui-btn ui-button-primary" type="submit" name="status" value="approved">Approve</button>
    <button class="ui-btn ui-button-danger" type="submit" name="status" value="rejected">Reject</button>
  </div>
</form>
```

For a setting, wrap a `fieldset.ui-radio-group` in `ui-settings-row-container` and
`ui-settings-row` markup and submit it with an ordinary button. The
[review fixture](../fixture/review-static.html) is the complete CSS-only page;
`tests/browser/review.spec.ts` checks its labels, error association, keyboard order, live-region
roles, and narrow-screen overflow.

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
