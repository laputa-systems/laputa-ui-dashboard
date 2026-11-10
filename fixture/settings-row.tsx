import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { TextField } from "@laputa-systems/ui-dashboard/forms";
import { SaveBar, SettingsRow, type SaveBarState } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [name, setName] = createSignal("Original");
  const [state, setState] = createSignal<SaveBarState>({ kind: "clean" });
  const [requests, setRequests] = createSignal(0);
  return <>
    <div data-testid="settings-container" style={{ width: "700px", "max-width": "100%" }}>
      <SettingsRow label="Workspace identity" description="Shown to collaborators"><TextField id="settings-name" label="Workspace name" value={name()} onInput={event => { setName(event.currentTarget.value); setState({ kind: "dirty" }); }} /></SettingsRow>
      <SaveBar state={state()} onSave={() => { setRequests(count => count + 1); setState({ kind: "saving" }); }} onDiscard={() => { setName("Original"); setState({ kind: "clean" }); }} />
    </div>
    <button type="button" onClick={() => setState({ kind: "saving" })}>Mark saving</button>
    <button type="button" onClick={() => setState({ kind: "failed", message: "Could not save settings" })}>Fail save</button>
    <button type="button" onClick={() => setState({ kind: "saved", message: "Settings saved" })}>Confirm save</button>
    <output data-testid="save-requests">{requests()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
