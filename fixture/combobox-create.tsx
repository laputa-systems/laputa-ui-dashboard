import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Combobox, MultiCombobox, type ComboboxCreateState, type ComboboxEntry } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [value, setValue] = createSignal<string | null>("alpha");
  const [options, setOptions] = createSignal<readonly ComboboxEntry[]>([{ id: "alpha", label: "Alpha" }]);
  const [state, setState] = createSignal<ComboboxCreateState>({ kind: "idle" });
  const [requested, setRequested] = createSignal("");
  const [multiCreate, setMultiCreate] = createSignal("");
  const [calls, setCalls] = createSignal(0);
  return <>
    <form onSubmit={event => { event.preventDefault(); document.documentElement.dataset.submitted = String(new FormData(event.currentTarget).get("project")); }}>
      <Combobox id="project" label="Project" name="project" options={options()} value={value()} onChange={setValue} create={{ state: state(), onCreate: query => { setRequested(query); setCalls(count => count + 1); setState({ kind: "pending", query }); } }} />
      <button type="submit">Submit</button>
    </form>
    <button onClick={() => setState({ kind: "failed", query: requested(), message: "Creation failed" })}>Fail creation</button>
    <button onClick={() => { setOptions([{ id: "alpha", label: "Alpha" }, { id: "new-id", label: requested() }]); setValue("new-id"); setState({ kind: "idle" }); }}>Acknowledge creation</button>
    <MultiCombobox id="projects" label="Projects" options={options()} value={["alpha"]} onChange={() => {}} create={{ state: { kind: "idle" }, onCreate: setMultiCreate }} />
    <output data-testid="multi-create">{multiCreate()}</output>
    <output data-testid="create-request">{requested()}</output>
    <output data-testid="create-calls">{calls()}</output>
  </>;
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
