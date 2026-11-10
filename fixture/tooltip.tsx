import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { render } from "@solidjs/web";
import { Tooltip } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  let dialog: HTMLDialogElement | undefined;
  return <>
    <button type="button" onClick={() => dialog?.showModal()}>Open settings</button>
    <button type="button">Outside tooltip</button>
    <dialog ref={element => { dialog = element; }} aria-label="Settings">
      <button type="button">Other setting</button>
      <Tooltip label="Retention information" content="Files are retained for thirty days.">?</Tooltip>
    </dialog>
    <Tooltip label="Storage information" content="The current plan includes storage. An-extraordinarily-long-project-identifier-must-remain-readable-inside-the-viewport-and-wrap-naturally.">Info</Tooltip>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
