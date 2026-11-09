import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { TextField } from "@laputa-systems/ui-dashboard/forms";
import { Button, IconButton } from "@laputa-systems/ui-dashboard";

function Fixture() {
  const [value, setValue] = createSignal("initial");
  const [calls, setCalls] = createSignal(0);
  const [submitted, setSubmitted] = createSignal("");
  const [busy, setBusy] = createSignal(false);
  const [actions, setActions] = createSignal(0);
  return (
    <>
      <form onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get("repository"))); }}>
        <TextField id="repository" label="Repository" hint="Use the repository slug" error="Repository is unavailable" name="repository" required value={value()} onInput={event => { setCalls(count => count + 1); setValue(event.currentTarget.value); }} />
        <button type="submit">Submit</button>
        <button type="button" onClick={() => setValue("parent")}>Update from parent</button>
      </form>
      <output data-testid="calls">{calls()}</output>
      <output data-testid="submitted">{submitted()}</output>
      <Button busy={busy()} onClick={() => { setActions(count => count + 1); setBusy(true); }}>Save changes</Button>
      <button type="button" onClick={() => setBusy(false)}>Finish saving</button>
      <output data-testid="actions">{actions()}</output>
      <Button busy={false} disabled>Disabled action</Button>
      <IconButton ariaLabel="Refresh" busy>R</IconButton>
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
