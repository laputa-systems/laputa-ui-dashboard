import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/feedback.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { NotificationStack, type Notification } from "@laputa-systems/ui-dashboard/feedback";

function Fixture() {
  const [notices, setNotices] = createSignal<readonly Notification[]>([
    { id: "one", title: "First notice", detail: "Review the first item", action: "Open first" },
    { id: "two", title: "Second notice", detail: "Review the second item" },
    { id: "three", title: "Third notice", detail: "Review the third item" }
  ]);
  const [accept, setAccept] = createSignal(true);
  const [actions, setActions] = createSignal("");
  return <>
    <NotificationStack label="Notifications" notices={notices()} total={5} inbox={{ href: "/inbox", label: "Open inbox" }} onDismiss={id => { setActions(`dismiss ${id}`); if (accept()) setNotices(items => items.filter(item => item.id !== id)); }} onAction={id => setActions(`action ${id}`)} />
    <button type="button" onClick={() => setAccept(false)}>Reject dismissal</button>
    <button type="button" onClick={() => setNotices(items => items.filter(item => item.id !== "one"))}>Remove first in background</button>
    <output data-testid="notice-actions">{actions()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
