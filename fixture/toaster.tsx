import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/feedback.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { createToastStore, Toaster } from "@laputa-systems/ui-dashboard/feedback";

function Fixture() {
  const notices = createToastStore();
  const other = createToastStore();
  const [mounted, setMounted] = createSignal(true);
  let resolveSave: (() => void) | undefined;
  let rejectSave: (() => void) | undefined;
  return <>
    <button type="button" onClick={() => { notices.add({ id: "one", title: "First", detail: "Saved", action: { label: "Undo", onSelect: () => { document.documentElement.dataset.undo = "yes"; } } }); notices.add({ id: "two", title: "Second" }); notices.add({ id: "three", title: "Third" }); }}>Add notices</button>
    <button type="button" onClick={() => notices.update("one", { title: "Updated", detail: "Complete" })}>Update notice</button>
    <button type="button" onClick={() => notices.dismiss("one")}>Dismiss externally</button>
    <button type="button" onClick={() => other.add({ id: "one", title: "Separate" })}>Add separate</button>
    <button type="button" onClick={() => notices.add({ id: "timed", title: "Timed", durationMs: 1000 })}>Add timed</button>
    <button type="button" onClick={() => { notices.add({ id: "timed-a", title: "Timed A", durationMs: 5000 }); notices.add({ id: "timed-b", title: "Timed B", durationMs: 6000 }); }}>Add two timed</button>
    <button type="button" onClick={() => notices.update("timed", { title: "Refreshed", durationMs: 1000 })}>Refresh timed</button>
    <button type="button" onClick={() => {
      const operation = new Promise<string>((resolve, reject) => { resolveSave = () => resolve("Saved"); rejectSave = () => reject(new Error("Rejected")); });
      void notices.track("save", operation, { pending: { title: "Saving" }, succeeded: title => ({ title }), failed: () => ({ title: "Save failed" }) }).catch(() => {});
    }}>Start save</button>
    <button type="button" onClick={() => resolveSave?.()}>Resolve save</button>
    <button type="button" onClick={() => rejectSave?.()}>Reject save</button>
    <button type="button" onClick={() => setMounted(value => !value)}>Toggle toaster</button>
    {mounted() && <Toaster label="Notices" store={notices} maxVisible={2} />}
    <Toaster label="Other notices" store={other} />
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
