import { createEffect, createMemo, createSignal, createUniqueId, For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface DropzoneFile {
  readonly id: string;
  readonly file: File;
  readonly state?: DropzoneUploadState | undefined;
}

export type DropzoneUploadState =
  | { readonly kind: "queued" }
  | { readonly kind: "uploading"; readonly progress?: { readonly value: number; readonly max: number } | undefined }
  | { readonly kind: "cancelling" }
  | { readonly kind: "cancelled" }
  | { readonly kind: "failed"; readonly message: string }
  | { readonly kind: "complete" };

export interface DropzoneProps {
  readonly label: string;
  readonly files: readonly DropzoneFile[];
  readonly maxFiles: number;
  readonly maxFileBytes: number;
  readonly accept?: readonly string[] | undefined;
  readonly imagePreviews?: boolean | undefined;
  readonly onFiles?: ((files: readonly File[]) => void) | undefined;
  readonly onCancel?: ((id: string) => void) | undefined;
  readonly onRetry?: ((id: string) => void) | undefined;
  readonly onRemove?: ((id: string) => void) | undefined;
  readonly class?: string | undefined;
}

function fileName(file: File): string {
  return file.name.length > 255 ? `${file.name.slice(0, 254)}…` : file.name;
}

function ImagePreview(props: { readonly file: File }): JSX.Element {
  const [url, setUrl] = createSignal<string>();
  createEffect(() => props.file, file => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  });
  return <Show when={url()}>{source => <img class="ui-dropzone-preview" src={source()} alt="" />}</Show>;
}

function UploadRow(props: { readonly item: DropzoneFile; readonly preview: boolean; readonly onCancel?: ((id: string) => void) | undefined; readonly onRetry?: ((id: string) => void) | undefined; readonly onRemove?: ((id: string) => void) | undefined; readonly focusQueue: () => void }): JSX.Element {
  let row: HTMLDivElement | undefined;
  const state = () => props.item.state ?? { kind: "queued" as const };
  const uploading = () => { const current = state(); return current.kind === "uploading" ? current : undefined; };
  const failure = () => { const current = state(); return current.kind === "failed" ? current.message.slice(0, 500) : undefined; };
  const status = () => {
    switch (state().kind) {
      case "queued": return "Waiting for upload";
      case "uploading": return "Uploading";
      case "cancelling": return "Cancelling upload";
      case "cancelled": return "Upload cancelled";
      case "failed": return "Upload failed";
      case "complete": return "Upload complete";
    }
  };
  const request = (callback: ((id: string) => void) | undefined) => { row?.focus(); callback?.(props.item.id); };
  return <li><div class="ui-dropzone-file" role="group" aria-label={fileName(props.item.file)} tabindex="-1" ref={element => { row = element; }}>
    <Show when={props.preview}><ImagePreview file={props.item.file} /></Show>
    <span>{fileName(props.item.file)}</span>
    <span role="status" class="ui-field-hint">{status()}</span>
    <Show when={uploading()}>{upload => <progress class="ui-dropzone-progress" aria-label={`Uploading ${fileName(props.item.file)}`} value={upload().progress?.value} max={upload().progress?.max} />}</Show>
    <Show when={failure()}>{message => <span role="alert" class="ui-field-error">{message()}</span>}</Show>
    <div class="ui-dropzone-actions">
      <Show when={state().kind === "uploading"}><button type="button" class="ui-btn ui-btn-small" aria-label={`Cancel ${fileName(props.item.file)}`} disabled={!props.onCancel} onClick={() => request(props.onCancel)}>Cancel</button></Show>
      <Show when={state().kind === "failed" || state().kind === "cancelled"}><button type="button" class="ui-btn ui-btn-small" aria-label={`Retry ${fileName(props.item.file)}`} disabled={!props.onRetry} onClick={() => request(props.onRetry)}>Retry</button></Show>
      <button type="button" class="ui-btn ui-btn-small" aria-label={`Remove ${fileName(props.item.file)}`} disabled={!props.onRemove} onClick={() => { props.focusQueue(); props.onRemove?.(props.item.id); }}>Remove</button>
    </div>
  </div></li>;
}

export function Dropzone(props: DropzoneProps): JSX.Element {
  const id = `ui-dropzone-${createUniqueId()}`;
  const [rejections, setRejections] = createSignal<readonly string[]>([]);
  const [announcement, setAnnouncement] = createSignal("");
  let zone: HTMLDivElement | undefined;
  const files = createMemo(() => {
    if (!Number.isInteger(props.maxFiles) || props.maxFiles < 1 || props.maxFiles > 100) throw new RangeError("Dropzone maxFiles must be between 1 and 100");
    if (!Number.isSafeInteger(props.maxFileBytes) || props.maxFileBytes < 0) throw new RangeError("Dropzone maxFileBytes must be a nonnegative safe integer");
    if (props.accept?.some(item => !/^(?:\.[a-z0-9][a-z0-9._+-]*|[a-z0-9!#$&^_.+-]+\/(?:\*|[a-z0-9!#$&^_.+-]+))$/iu.test(item))) throw new Error("Invalid Dropzone accept type");
    if (props.files.length > props.maxFiles) throw new RangeError("Dropzone files exceed maxFiles");
    const ids = new Set<string>();
    for (const item of props.files) {
      if (!item.id || ids.has(item.id)) throw new Error("Dropzone file IDs must be nonempty and unique");
      ids.add(item.id);
      if (item.state?.kind === "failed" && !item.state.message) throw new Error("Dropzone failure requires a message");
      if (item.state?.kind === "uploading" && item.state.progress) {
        const { value, max } = item.state.progress;
        if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0 || value < 0 || value > max) throw new RangeError("Invalid upload progress");
      }
    }
    return props.files;
  });
  const disabled = () => props.onFiles === undefined || files().length >= props.maxFiles;
  const previewIds = createMemo(() => new Set(props.imagePreviews ? files().filter(item => item.file.size <= 5 * 1024 * 1024 && ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(item.file.type.toLowerCase())).slice(0, 10).map(item => item.id) : []));
  const accepts = (file: File) => {
    const allowed = props.accept;
    if (!allowed || allowed.length === 0) return true;
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return allowed.some(item => {
      const rule = item.toLowerCase();
      if (rule.startsWith(".")) return name.endsWith(rule);
      if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
  };
  const select = (selected: FileList | readonly File[]) => {
    if (disabled()) return;
    setAnnouncement("");
    if (selected.length > 100) { setRejections(["Choose no more than 100 files at once."]); return; }
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(selected)) {
      if (file.size > props.maxFileBytes) rejected.push(`${fileName(file)}: file is too large.`);
      else if (!accepts(file)) rejected.push(`${fileName(file)}: file type is not allowed.`);
      else if (files().length + accepted.length >= props.maxFiles) rejected.push(`${fileName(file)}: file limit reached.`);
      else accepted.push(file);
    }
    setRejections(rejected);
    if (accepted.length) { setAnnouncement(`Requested ${accepted.length} ${accepted.length === 1 ? "file" : "files"}.`); props.onFiles?.(accepted); }
  };
  return <div class={["ui-dropzone", props.class].filter(Boolean).join(" ")} role="group" aria-label={props.label} tabindex="-1" ref={element => { zone = element; }} onDragOver={event => { if (event.dataTransfer?.types.includes("Files")) event.preventDefault(); }} onDrop={event => { if (!event.dataTransfer?.types.includes("Files")) return; event.preventDefault(); if (event.dataTransfer.files.length) select(event.dataTransfer.files); else setRejections(["No files were provided."]); }}>
    <label class="ui-field ui-file-field" for={id}><span class="ui-field-label">{props.label}</span><input id={id} type="file" multiple accept={props.accept?.join(",")} disabled={disabled()} onChange={event => { const selected = event.currentTarget.files; if (selected) select(selected); event.currentTarget.value = ""; }} /></label>
    <Show when={props.onFiles === undefined}><div class="ui-field-hint">File selection unavailable</div></Show>
    <Show when={props.onFiles !== undefined && files().length >= props.maxFiles}><div class="ui-field-hint">File limit reached</div></Show>
    <div role="status" class="ui-field-hint">{announcement()}</div>
    <Show when={rejections().length}><div role="alert" class="ui-field-error"><For each={rejections()}>{message => <div>{message}</div>}</For></div></Show>
    <Show when={files().length}><ul class="ui-dropzone-files"><For each={files()} keyed={item => item.id}>{item => <UploadRow item={item()} preview={previewIds().has(item().id)} onCancel={props.onCancel} onRetry={props.onRetry} onRemove={props.onRemove} focusQueue={() => zone?.focus()} />}</For></ul></Show>
  </div>;
}
