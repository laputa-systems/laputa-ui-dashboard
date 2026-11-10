import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { NativeSelect } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [choice, setChoice] = createSignal("");
  const [calls, setCalls] = createSignal(0);
  const [accept, setAccept] = createSignal(true);
  const [submitted, setSubmitted] = createSignal("");
  return <>
    <form onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get("project"))); }}>
      <NativeSelect id="project" label="Project" hint="Choose a project" error="Project required" name="project" required placeholder="Choose" options={[{ value: "alpha", label: "Alpha" }, { value: "beta", label: "Beta" }, { value: "locked", label: "Locked", disabled: true }]} value={choice()} onValueChange={next => { setCalls(count => count + 1); if (accept()) setChoice(next); }} />
      <NativeSelect id="local" label="Local choice" name="local" options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} defaultValue="b" />
      <NativeSelect id="locked" label="Locked choice" name="locked" options={[{ value: "a", label: "A" }]} value="a" />
      <button type="submit">Save project</button><button type="reset">Reset project</button>
    </form>
    <button type="button" onClick={() => setAccept(false)}>Reject select requests</button>
    <button type="button" onClick={() => setChoice("beta")}>Parent selects beta</button>
    <output data-testid="select-calls">{calls()}</output><output data-testid="select-submitted">{submitted()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
