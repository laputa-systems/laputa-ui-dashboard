import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/feedback.css";
import { render } from "@solidjs/web";
import { createToastStore, Toaster } from "@laputa-systems/ui-dashboard/feedback";

function Fixture() {
  const notices = createToastStore();
  const other = createToastStore();
  return <>
    <button type="button" onClick={() => { notices.add({ id: "one", title: "First", detail: "Saved", action: { label: "Undo", onSelect: () => { document.documentElement.dataset.undo = "yes"; } } }); notices.add({ id: "two", title: "Second" }); notices.add({ id: "three", title: "Third" }); }}>Add notices</button>
    <button type="button" onClick={() => notices.update("one", { title: "Updated", detail: "Complete" })}>Update notice</button>
    <button type="button" onClick={() => notices.dismiss("one")}>Dismiss externally</button>
    <button type="button" onClick={() => other.add({ id: "one", title: "Separate" })}>Add separate</button>
    <Toaster label="Notices" store={notices} maxVisible={2} />
    <Toaster label="Other notices" store={other} />
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
