import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { TextField } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [value, setValue] = createSignal("initial");
  const [calls, setCalls] = createSignal(0);
  return <>
    <form><TextField id="controlled" label="Controlled" value={value()} onInput={event => { setCalls(count => count + 1); setValue(event.currentTarget.value); }} /><button type="reset">Reset</button></form>
    <button type="button" onClick={() => setValue("parent")}>Update</button>
    <output data-testid="calls">{calls()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
