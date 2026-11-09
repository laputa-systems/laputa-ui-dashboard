import "@laputa-systems/ui-dashboard/styles.css";
import { createSignal, Show } from "solid-js";
import { render } from "@solidjs/web";
import { Button, Modal } from "@laputa-systems/ui-dashboard";

function Fixture() {
  const [outer, setOuter] = createSignal(false);
  const [inner, setInner] = createSignal(false);
  const [outerOpener, setOuterOpener] = createSignal<HTMLButtonElement>();
  const [innerOpener, setInnerOpener] = createSignal<HTMLButtonElement>();
  const [outerCloses, setOuterCloses] = createSignal(0);
  const [innerCloses, setInnerCloses] = createSignal(0);
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
