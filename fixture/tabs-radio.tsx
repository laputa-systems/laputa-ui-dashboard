import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Tabs } from "@laputa-systems/ui-dashboard/layout";
import { RadioGroup } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [tab, setTab] = createSignal("overview");
  const [tabCalls, setTabCalls] = createSignal(0);
  const [manualTab, setManualTab] = createSignal("first");
  const [radio, setRadio] = createSignal<string | null>("daily");
  const [radioCalls, setRadioCalls] = createSignal(0);
  const [accept, setAccept] = createSignal(true);
  const [submitted, setSubmitted] = createSignal("");
  return <>
    <Tabs label="Workspace" value={tab()} tabs={[{ id: "overview", label: "Overview", content: "Overview panel" }, { id: "locked", label: "Locked", disabled: true, content: "Locked panel" }, { id: "activity", label: "Activity", count: 0, content: "Activity panel" }]} onChange={next => { setTabCalls(count => count + 1); if (accept()) setTab(next); }} />
    <Tabs label="Manual tabs" value={manualTab()} activation="manual" tabs={[{ id: "first", label: "First", content: "First panel" }, { id: "second", label: "Second", content: "Second panel" }]} onChange={setManualTab} />
    <form onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get("frequency"))); }}>
      <RadioGroup label="Frequency" name="frequency" value={radio()} options={[{ id: "daily", label: "Daily" }, { id: "weekly", label: "Weekly" }, { id: "locked", label: "Locked", disabled: true }]} required onChange={next => { setRadioCalls(count => count + 1); if (accept()) setRadio(next); }} />
      <button type="submit">Save frequency</button><button type="reset">Reset frequency</button>
    </form>
    <button type="button" onClick={() => setAccept(false)}>Reject choices</button>
    <button type="button" onClick={() => { setTab("overview"); setRadio("daily"); }}>Parent choices</button>
    <output data-testid="tab-calls">{tabCalls()}</output><output data-testid="radio-calls">{radioCalls()}</output><output data-testid="radio-submitted">{submitted()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
