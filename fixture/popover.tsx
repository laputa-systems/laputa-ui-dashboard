import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { render } from "@solidjs/web";
import { Popover } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  let dialog: HTMLDialogElement | undefined;
  return <>
    <button type="button" onClick={() => dialog?.showModal()}>Open dialog</button>
    <button type="button" onClick={event => event.currentTarget.focus()}>Outside</button>
    <dialog ref={element => { dialog = element; }} aria-label="Settings">
      <Popover label="Filter options" trigger="Choose options"><button type="button" style={{ visibility: "hidden" }}>Hidden action</button><button type="button" aria-disabled="true">Unavailable action</button><label for="popover-query">Search options</label><input id="popover-query" /><button type="button">Apply options</button></Popover>
    </dialog>
    <Popover label="Quick help" trigger="Open help"><p>Help content</p></Popover>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
