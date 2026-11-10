import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import "@laputa-systems/ui-dashboard/styles/feedback.css";
import { createSignal, Show } from "solid-js";
import { render } from "@solidjs/web";
import { Button, Modal } from "@laputa-systems/ui-dashboard";
import { Combobox, TextField } from "@laputa-systems/ui-dashboard/forms";
import { ActionMenu, Disclosure } from "@laputa-systems/ui-dashboard/layout";
import { ActionStatus, type ActionState } from "@laputa-systems/ui-dashboard/feedback";

function Fixture() {
  const [outer, setOuter] = createSignal(false);
  const [inner, setInner] = createSignal(false);
  const [outerOpener, setOuterOpener] = createSignal<HTMLButtonElement>();
  const [innerOpener, setInnerOpener] = createSignal<HTMLButtonElement>();
  const [outerCloses, setOuterCloses] = createSignal(0);
  const [innerCloses, setInnerCloses] = createSignal(0);
  const [draft, setDraft] = createSignal("");
  const [attempts, setAttempts] = createSignal(0);
  const [action, setAction] = createSignal<ActionState>({ kind: "idle" });
  const retry = () => { setAttempts(value => value + 1); setAction({ kind: "pending", message: "Retrying" }); };
  return (
    <>
      <Button onClick={event => { setOuterOpener(event.currentTarget); setOuter(true); }}>Open outer</Button>
      <output data-testid="overlay-counts">{outerCloses()}:{innerCloses()}</output>
      <Show when={outer()}>
        <Modal title="Outer" label="Outer" returnFocus={outerOpener()} onClose={() => { setOuterCloses(value => value + 1); setOuter(false); }}>
          <Button onClick={event => { setInnerOpener(event.currentTarget); setInner(true); }}>Open inner</Button>
          <Show when={inner()}>
            <Modal title="Inner" label="Inner" size="compact" returnFocus={innerOpener()} onClose={() => { setInnerCloses(value => value + 1); setInner(false); }}>
              <label>Notes <input /></label>
              <Combobox id="inner-choice" label="Inner choice" options={[{ id: "a", label: "Alpha" }]} value={null} onChange={() => {}} />
              <ActionMenu label="Inner actions" items={[{ id: "refresh", label: "Refresh" }]} onSelect={() => {}} />
              <Disclosure label="Request details">
                <TextField id="request" label="Request" value={draft()} onInput={event => setDraft(event.currentTarget.value)} />
                <Button onClick={() => setAction({ kind: "failed", message: "Request rejected", retry })}>Submit request</Button>
                <ActionStatus state={action()} />
                <Button onClick={() => setAction({ kind: "succeeded", message: "Acknowledged" })}>Acknowledge</Button>
                <output data-testid="journey-attempts">{attempts()}</output>
              </Disclosure>
            </Modal>
          </Show>
        </Modal>
      </Show>
    </>
  );
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
