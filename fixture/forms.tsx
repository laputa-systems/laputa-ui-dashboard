import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { TextField } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [value, setValue] = createSignal("initial");
  const [calls, setCalls] = createSignal(0);
  const [submitted, setSubmitted] = createSignal("");
  return (
    <>
      <form onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get("repository"))); }}>
        <TextField id="repository" label="Repository" hint="Use the repository slug" error="Repository is unavailable" name="repository" required value={value()} onInput={event => { setCalls(count => count + 1); setValue(event.currentTarget.value); }} />
        <button type="submit">Submit</button>
        <button type="button" onClick={() => setValue("parent")}>Update from parent</button>
      </form>
      <output data-testid="calls">{calls()}</output>
      <output data-testid="submitted">{submitted()}</output>
      <form>
        <TextField id="nickname" label="Nickname" name="nickname" defaultValue="first" />
        <button type="reset">Reset</button>
      </form>
    </>
  );
}

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
