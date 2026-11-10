import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { TextArea } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [value, setValue] = createSignal("");
  const [submissions, setSubmissions] = createSignal(0);
  const [narrow, setNarrow] = createSignal(false);
  const [blockShortcut, setBlockShortcut] = createSignal(false);
  const [acceptEdits, setAcceptEdits] = createSignal(true);
  const [autosize, setAutosize] = createSignal(true);
  return <>
    <form onSubmit={event => { event.preventDefault(); setSubmissions(count => count + 1); }}>
      <div data-testid="textarea-container" style={{ width: narrow() ? "160px" : "400px", "max-width": "100%" }}>
        <TextArea id="notes" label="Notes" name="notes" hint="Write notes" error="Review notes" value={value()} onInput={event => { if (acceptEdits()) setValue(event.currentTarget.value); }} onKeyDown={event => { if (blockShortcut() && event.ctrlKey && event.key === "Enter") event.preventDefault(); }} autosize={autosize() ? { minRows: 2, maxRows: 5 } : undefined} expandRows={autosize() ? 8 : undefined} showCount maxlength={200} submitShortcut="ControlEnter" />
      </div>
      <TextArea id="local-notes" label="Local notes" name="local" defaultValue="Initial" showCount />
      <TextArea id="readonly-notes" label="Read-only notes" value="Read only" readonly submitShortcut="ControlEnter" />
      <TextArea id="disabled-notes" label="Disabled notes" disabled autosize={{ minRows: 2, maxRows: 3 }} expandRows={4} />
      <button type="submit">Save notes</button><button type="reset">Reset notes</button>
    </form>
    <button type="button" onClick={() => setNarrow(value => !value)}>Toggle width</button>
    <button type="button" onClick={() => setBlockShortcut(true)}>Block shortcut</button>
    <button type="button" onClick={() => setAcceptEdits(false)}>Reject text edits</button>
    <button type="button" onClick={() => setAutosize(false)}>Disable autosize</button>
    <output data-testid="note-submissions">{submissions()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
