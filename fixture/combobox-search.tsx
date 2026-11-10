import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Combobox, MultiCombobox, type ComboboxSearchRequest, type ComboboxSearchState } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [value, setValue] = createSignal<string | null>("alpha");
  const [multi, setMulti] = createSignal<readonly string[]>(["alpha"]);
  const [state, setState] = createSignal<ComboboxSearchState>({ kind: "idle" });
  const [multiState, setMultiState] = createSignal<ComboboxSearchState>({ kind: "idle" });
  const [create, setCreate] = createSignal("");
  const [calls, setCalls] = createSignal(0);
  let first: ComboboxSearchRequest | undefined;
  let latest: ComboboxSearchRequest | undefined;
  const options = [{ id: "alpha", label: "Alpha" }];
  return <>
    <form onSubmit={event => { event.preventDefault(); document.documentElement.dataset.submitted = String(new FormData(event.currentTarget).get("project")); }}>
      <Combobox id="search" label="Project" name="project" options={options} value={value()} onChange={setValue} create={{ state: { kind: "idle" }, onCreate: setCreate }} search={{ state: state(), onSearch: request => { if (request.query === "a" && !first) first = request; latest = request; setCalls(count => count + 1); setState({ kind: "pending", request }); } }} />
      <button type="submit">Submit</button>
    </form>
    <button onClick={() => { if (latest) setState({ kind: "ready", request: latest, options: [{ id: "remote", label: "Remote result" }] }); }}>Resolve latest</button>
    <button onClick={() => { if (first) setState({ kind: "ready", request: first, options: [{ id: "old", label: "Old result" }] }); }}>Resolve old</button>
    <button onClick={() => { if (latest) setState({ kind: "failed", request: latest, message: "Search failed" }); }}>Fail latest</button>
    <MultiCombobox id="multi-search" label="Projects" options={options} value={multi()} onChange={setMulti} search={{ state: multiState(), onSearch: request => setMultiState({ kind: "ready", request, options: [{ id: "alpha", label: "Alpha" }, { id: "remote", label: "Remote result" }] }) }} />
    <output data-testid="search-create">{create()}</output>
    <output data-testid="search-calls">{calls()}</output>
  </>;
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
