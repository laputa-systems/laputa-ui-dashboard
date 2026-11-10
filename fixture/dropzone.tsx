import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Dropzone, type DropzoneFile } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [files, setFiles] = createSignal<readonly DropzoneFile[]>([]);
  const [calls, setCalls] = createSignal(0);
  const [rejectedCalls, setRejectedCalls] = createSignal(0);
  return <>
    <Dropzone label="Attachments" files={files()} accept={["image/png", ".txt"]} maxFiles={2} maxFileBytes={8} onFiles={selected => { setCalls(count => count + 1); setFiles(existing => [...existing, ...selected.map((file, index) => ({ id: `${existing.length + index}`, file }))]); }} />
    <Dropzone label="Unavailable upload" files={[]} maxFiles={2} maxFileBytes={8} />
    <Dropzone label="Rejected files" files={[]} maxFiles={2} maxFileBytes={8} onFiles={() => setRejectedCalls(count => count + 1)} />
    <output data-testid="upload-calls">{calls()}</output>
    <output data-testid="rejected-calls">{rejectedCalls()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
