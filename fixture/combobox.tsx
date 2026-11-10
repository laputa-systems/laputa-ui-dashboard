import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Combobox, type ComboboxEntry } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [value, setValue] = createSignal<string | null>("beta");
  const [calls, setCalls] = createSignal(0);
  const [submitted, setSubmitted] = createSignal("");
  const [removed, setRemoved] = createSignal(false);
  const [accept, setAccept] = createSignal(true);
  const entries = (): readonly ComboboxEntry[] => [
    { id: "a", label: "Group A", options: [{ id: "alpha", label: "Alpha" }, { id: "beta", label: "Beta" }] },
    { id: "b", label: "Group B", options: [{ id: "disabled", label: "Disabled", disabled: true }, { id: "long", label: "LongProjectName".repeat(12) }, ...(removed() ? [] : [{ id: "gamma space", label: "Gamma" }])] }
  ];
  return (
    <>
      <form onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get("project"))); }}>
        <Combobox id="project-choice" label="Project" name="project" hint="Choose a project" options={entries()} value={value()} onChange={next => { setCalls(count => count + 1); if (accept()) setValue(next); }} />
        <button type="submit">Submit choice</button>
        <button type="reset">Reset choice</button>
      </form>
      <button onClick={() => setValue("alpha")}>Parent selects Alpha</button>
      <button onClick={() => setRemoved(true)}>Remove Gamma</button>
      <button onClick={() => setAccept(false)}>Reject selections</button>
      <output data-testid="combobox-calls">{calls()}</output>
      <output data-testid="combobox-submitted">{submitted()}</output>
      <Combobox id="locked-choice" label="Locked choice" disabled options={entries()} value={null} onChange={() => {}} />
    </>
  );
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
