import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Dropzone, type DropzoneFile } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [files, setFiles] = createSignal<readonly DropzoneFile[]>([]);
  const [calls, setCalls] = createSignal(0);
  const [rejectedCalls, setRejectedCalls] = createSignal(0);
  const [uploads, setUploads] = createSignal<readonly DropzoneFile[]>([
    { id: "first", file: new File(["one"], "first.txt"), state: { kind: "uploading", progress: { value: 0, max: 3 } } },
    { id: "second", file: new File(["two"], "second.txt"), state: { kind: "failed", message: "Connection lost" } },
    { id: "third", file: new File(["three"], "third.txt"), state: { kind: "uploading" } },
    { id: "fourth", file: new File(["four"], "fourth.txt"), state: { kind: "cancelled" } }
  ]);
  const [actions, setActions] = createSignal("");
  return <>
    <Dropzone label="Attachments" files={files()} accept={["image/png", ".txt"]} maxFiles={2} maxFileBytes={8} onFiles={selected => { setCalls(count => count + 1); setFiles(existing => [...existing, ...selected.map((file, index) => ({ id: `${existing.length + index}`, file }))]); }} />
    <Dropzone label="Unavailable upload" files={[]} maxFiles={2} maxFileBytes={8} />
    <Dropzone label="Rejected files" files={[]} maxFiles={2} maxFileBytes={8} onFiles={() => setRejectedCalls(count => count + 1)} />
    <Dropzone label="Upload queue" files={uploads()} maxFiles={5} maxFileBytes={8} onFiles={() => {}} onCancel={id => setActions(`cancel ${id}`)} onRetry={id => setActions(`retry ${id}`)} onRemove={id => { setActions(`remove ${id}`); setUploads(current => current.filter(item => item.id !== id)); }} />
    <Dropzone label="Read-only queue" files={[{ id: "failed", file: new File(["x"], "failed.txt"), state: { kind: "failed", message: "Unavailable" } }]} maxFiles={2} maxFileBytes={8} />
    <button type="button" onClick={() => setUploads(current => current.map(item => item.id === "first" ? { ...item, state: { kind: "complete" } } : item))}>Finish first upload</button>
    <output data-testid="upload-calls">{calls()}</output>
    <output data-testid="rejected-calls">{rejectedCalls()}</output>
    <output data-testid="upload-actions">{actions()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
