# Usage patterns

## Render interactive Solid controls

```tsx
import "@laputa-systems/ui-dashboard/styles.css";
import { createSignal, Show } from "solid-js";
import { Button, CollapsiblePanel, Modal } from "@laputa-systems/ui-dashboard";

function Example() {
  const [open, setOpen] = createSignal(false);
  return <>
    <CollapsiblePanel title="Activity" collapsible expandable>Recent activity</CollapsiblePanel>
    <Button onClick={() => setOpen(true)}>Show details</Button>
    <Show when={open()}>
      <Modal title="Details" label="Details" onClose={() => setOpen(false)}>Details</Modal>
    </Show>
  </>;
}
```

For controlled panels, pass the state and update it in the corresponding toggle callback.
Unmount `Modal` in `onClose`. Native dialog behavior moves focus into the modal and returns it on close.

## Render HTML without JavaScript

Serve the built `styles.css` and `tokens.css` together. `styles.css` imports `tokens.css`.

```html
<link rel="stylesheet" href="/ui/styles.css">
<section class="ui-panel">
  <header class="ui-panel-head"><div class="ui-panel-title"><h2>Activity</h2></div></header>
  <div class="ui-panel-body">Recent activity</div>
</section>
```

Use native links and forms for actions. CSS does not implement Solid component state or modal behavior.
See the [shell markup](../README.md#app-shell) for navigation.
