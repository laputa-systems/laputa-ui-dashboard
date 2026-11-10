import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { TextField } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [value, setValue] = createSignal("controlled");
  const [accept, setAccept] = createSignal(true);
  const [events, setEvents] = createSignal(0);
  return <>
    <form>
      <TextField id="controlled-action" label="Project" name="project" value={value()} clearable copyable showCount onInput={event => { setEvents(n => n + 1); if (accept()) setValue(event.currentTarget.value); }} />
      <TextField id="local-action" label="Local" defaultValue="local" clearable />
      <TextField id="password-action" label="Password" type="password" defaultValue="secret" revealable />
      <TextField id="readonly-action" label="Read only" value="locked" readonly clearable />
      <button type="reset">Reset</button>
    </form>
    <button type="button" onClick={() => setAccept(false)}>Reject edits</button>
    <button type="button" onClick={() => setValue("parent")}>Set parent</button>
    <output data-testid="input-events">{events()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
