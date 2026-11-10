import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal, Show } from "solid-js";
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
  const pixel = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a0sAAAAASUVORK5CYII="), char => char.charCodeAt(0));
  const [previewFiles, setPreviewFiles] = createSignal<readonly DropzoneFile[]>([
    { id: "one", file: new File([pixel], "one.png", { type: "image/png" }) },
    { id: "two", file: new File([pixel], "two.png", { type: "image/png" }) },
    { id: "svg", file: new File(["<svg/>"], "unsafe.svg", { type: "image/svg+xml" }) },
    { id: "large", file: new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", { type: "image/png" }) }
  ]);
  const [showPreviews, setShowPreviews] = createSignal(true);
  const [showMany, setShowMany] = createSignal(false);
  return <>
    <Dropzone label="Attachments" files={files()} accept={["image/png", ".txt"]} maxFiles={2} maxFileBytes={8} onFiles={selected => { setCalls(count => count + 1); setFiles(existing => [...existing, ...selected.map((file, index) => ({ id: `${existing.length + index}`, file }))]); }} />
    <Dropzone label="Unavailable upload" files={[]} maxFiles={2} maxFileBytes={8} />
    <Dropzone label="Rejected files" files={[]} maxFiles={2} maxFileBytes={8} onFiles={() => setRejectedCalls(count => count + 1)} />
    <Dropzone label="Upload queue" files={uploads()} maxFiles={5} maxFileBytes={8} onFiles={() => {}} onCancel={id => setActions(`cancel ${id}`)} onRetry={id => setActions(`retry ${id}`)} onRemove={id => { setActions(`remove ${id}`); setUploads(current => current.filter(item => item.id !== id)); }} />
    <Dropzone label="Read-only queue" files={[{ id: "failed", file: new File(["x"], "failed.txt"), state: { kind: "failed", message: "Unavailable" } }]} maxFiles={2} maxFileBytes={8} />
    <Show when={showPreviews()}><Dropzone label="Preview queue" files={previewFiles()} maxFiles={5} maxFileBytes={6 * 1024 * 1024} imagePreviews onRemove={id => setPreviewFiles(current => current.filter(item => item.id !== id))} /></Show>
    <Show when={showMany()}><Dropzone label="Many previews" files={Array.from({ length: 11 }, (_, index) => ({ id: String(index), file: new File([pixel], `${index}.png`, { type: "image/png" }) }))} maxFiles={11} maxFileBytes={1024} imagePreviews /></Show>
    <button type="button" onClick={() => setPreviewFiles(current => current.map(item => item.id === "two" ? { ...item, file: new File([pixel], "replacement.png", { type: "image/png" }) } : item))}>Replace preview</button>
    <button type="button" onClick={() => setShowPreviews(false)}>Unmount previews</button>
    <button type="button" onClick={() => setShowMany(true)}>Show many previews</button>
    <button type="button" onClick={() => setUploads(current => current.map(item => item.id === "first" ? { ...item, state: { kind: "complete" } } : item))}>Finish first upload</button>
    <output data-testid="upload-calls">{calls()}</output>
    <output data-testid="rejected-calls">{rejectedCalls()}</output>
    <output data-testid="upload-actions">{actions()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
