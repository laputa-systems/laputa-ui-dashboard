import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Switch, type SwitchRequestState } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [checked, setChecked] = createSignal(false);
  const [state, setState] = createSignal<SwitchRequestState>({ kind: "idle" });
  const [calls, setCalls] = createSignal(0);
  const [submitted, setSubmitted] = createSignal("");
  return <>
    <form onSubmit={event => { event.preventDefault(); setSubmitted(`${String(new FormData(event.currentTarget).get("sync"))}/${String(new FormData(event.currentTarget).get("disabled"))}`); }}>
      <Switch id="sync" label="Sync automatically" hint="Sync changes" name="sync" value="yes" checked={checked()} state={state()} placement="end" onCheckedChange={() => { setCalls(count => count + 1); setState({ kind: "pending" }); }} />
      <Switch id="local-switch" label="Show tips" name="tips" defaultChecked />
      <Switch id="disabled-switch" label="Unavailable switch" name="disabled" value="yes" checked disabled />
      <button type="submit">Save switches</button><button type="reset">Reset switches</button>
    </form>
    <button type="button" onClick={() => setState({ kind: "failed", message: "Could not save" })}>Fail switch</button>
    <button type="button" onClick={() => { setChecked(true); setState({ kind: "idle" }); }}>Confirm switch</button>
    <button type="button" onClick={() => setState({ kind: "pending" })}>Mark switch pending</button>
    <output data-testid="switch-calls">{calls()}</output><output data-testid="switch-submitted">{submitted()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
