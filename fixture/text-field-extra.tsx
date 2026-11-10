import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { TextField } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [value, setValue] = createSignal("abc");
  const [submitted, setSubmitted] = createSignal("");
  return <>
    <form onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get("name"))); }}>
      <TextField id="decorated" label="Project name" name="name" prefix="schema: https://schema.org/" leadingContent="https://" trailingContent=".test" value={value()} onInput={event => setValue(event.currentTarget.value)} hint="Use a slug" error="Name unavailable" maxlength={10} showCount />
      <TextField id="local-decorated" label="Local name" defaultValue="start" showCount />
      <button type="submit">Save name</button><button type="reset">Reset name</button>
    </form>
    <button type="button" onClick={() => setValue("parent")}>Update name</button>
    <output data-testid="name-submitted">{submitted()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
