import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { NativeSelect, Select } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [choice, setChoice] = createSignal("");
  const [calls, setCalls] = createSignal(0);
  const [accept, setAccept] = createSignal(true);
  const [submitted, setSubmitted] = createSignal("");
  const [rich, setRich] = createSignal("");
  const [richCalls, setRichCalls] = createSignal(0);
  const [richSubmitted, setRichSubmitted] = createSignal("");
  const [richDisabled, setRichDisabled] = createSignal(false);
  const [richAccept, setRichAccept] = createSignal(true);
  const [showBeta, setShowBeta] = createSignal(true);
  return <>
    <form onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get("project"))); }}>
      <NativeSelect id="project" label="Project" hint="Choose a project" error="Project required" name="project" required placeholder="Choose" options={[{ value: "alpha", label: "Alpha" }, { value: "beta", label: "Beta" }, { value: "locked", label: "Locked", disabled: true }]} value={choice()} onValueChange={next => { setCalls(count => count + 1); if (accept()) setChoice(next); }} />
      <NativeSelect id="local" label="Local choice" name="local" options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} defaultValue="b" />
      <NativeSelect id="locked" label="Locked choice" name="locked" options={[{ value: "a", label: "A" }]} value="a" />
      <button type="submit">Save project</button><button type="reset">Reset project</button>
    </form>
    <form onSubmit={event => { event.preventDefault(); setRichSubmitted(String(new FormData(event.currentTarget).get("rich"))); }}>
      <Select id="rich" label="Rich project" name="rich" required disabled={richDisabled()} placeholder="Choose" value={rich()} options={[{ value: "alpha", label: "Alpha", description: "First project", icon: <span>A</span> }, { value: "locked", label: "Locked", disabled: true }, ...(showBeta() ? [{ value: "beta", label: "Beta", description: "Second project" }] : [])]} onValueChange={next => { setRichCalls(count => count + 1); if (richAccept()) setRich(next); }} />
      <button type="submit">Save rich project</button><button type="reset">Reset rich project</button>
    </form>
    <button type="button" onClick={() => setRichDisabled(true)}>Disable rich project</button>
    <button type="button" onClick={() => setRichAccept(false)}>Reject rich project</button>
    <button type="button" onClick={() => setShowBeta(value => !value)}>Toggle beta option</button>
    <button type="button" onClick={() => setAccept(false)}>Reject select requests</button>
    <button type="button" onClick={() => setChoice("beta")}>Parent selects beta</button>
    <output data-testid="select-calls">{calls()}</output><output data-testid="select-submitted">{submitted()}</output>
    <output data-testid="rich-calls">{richCalls()}</output><output data-testid="rich-submitted">{richSubmitted()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
