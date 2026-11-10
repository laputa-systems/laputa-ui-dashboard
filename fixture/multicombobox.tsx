import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { MultiCombobox, type ComboboxEntry } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [value, setValue] = createSignal<readonly string[]>(["alpha"]);
  const [calls, setCalls] = createSignal(0);
  const [submitted, setSubmitted] = createSignal("");
  const [removed, setRemoved] = createSignal(false);
  const [accept, setAccept] = createSignal(true);
  const [renamed, setRenamed] = createSignal(false);
  const options = (): readonly ComboboxEntry[] => [
    { id: "group", label: "Projects", options: [
      ...(removed() ? [] : [{ id: "alpha", label: renamed() ? "Renamed" : "Alpha" }]),
      { id: "beta", label: "Beta" },
      { id: "locked", label: "Locked", disabled: true },
      { id: "gamma", label: "Gamma" }
    ] }
  ];
  return (
    <>
      <form onSubmit={event => { event.preventDefault(); setSubmitted(new FormData(event.currentTarget).getAll("projects").join(",")); }}>
        <MultiCombobox id="projects" label="Projects" name="projects" hint="Choose projects" options={options()} value={value()} onChange={next => { setCalls(count => count + 1); if (accept()) setValue(next); }} />
        <MultiCombobox id="archived" label="Archived projects" name="archived" options={options()} value={["beta"]} onChange={() => {}} disabled />
        <button type="submit">Submit projects</button>
        <button type="reset">Reset projects</button>
      </form>
      <button onClick={() => setRemoved(true)}>Remove Alpha option</button>
      <button onClick={() => setRenamed(true)}>Rename Alpha option</button>
      <button onClick={() => setAccept(false)}>Reject project changes</button>
      <button onClick={() => setValue(["gamma", "alpha"])}>Parent changes projects</button>
      <button onClick={() => setValue(["long".repeat(100)])}>Set long project ID</button>
      <output data-testid="multi-calls">{calls()}</output>
      <output data-testid="multi-submitted">{submitted()}</output>
    </>
  );
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
