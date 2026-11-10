import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface DropzoneFile {
  readonly id: string;
  readonly file: File;
}

export interface DropzoneProps {
  readonly label: string;
  readonly files: readonly DropzoneFile[];
  readonly maxFiles: number;
  readonly maxFileBytes: number;
  readonly accept?: readonly string[] | undefined;
  readonly onFiles?: ((files: readonly File[]) => void) | undefined;
  readonly class?: string | undefined;
}

function fileName(file: File): string {
  return file.name.length > 255 ? `${file.name.slice(0, 254)}…` : file.name;
}

export function Dropzone(props: DropzoneProps): JSX.Element {
  const id = `ui-dropzone-${createUniqueId()}`;
  const [rejections, setRejections] = createSignal<readonly string[]>([]);
  const [announcement, setAnnouncement] = createSignal("");
  const files = createMemo(() => {
    if (!Number.isInteger(props.maxFiles) || props.maxFiles < 1 || props.maxFiles > 100) throw new RangeError("Dropzone maxFiles must be between 1 and 100");
    if (!Number.isSafeInteger(props.maxFileBytes) || props.maxFileBytes < 0) throw new RangeError("Dropzone maxFileBytes must be a nonnegative safe integer");
    if (props.accept?.some(item => !/^(?:\.[a-z0-9][a-z0-9._+-]*|[a-z0-9!#$&^_.+-]+\/(?:\*|[a-z0-9!#$&^_.+-]+))$/iu.test(item))) throw new Error("Invalid Dropzone accept type");
    if (props.files.length > props.maxFiles) throw new RangeError("Dropzone files exceed maxFiles");
    const ids = new Set<string>();
    for (const item of props.files) {
      if (!item.id || ids.has(item.id)) throw new Error("Dropzone file IDs must be nonempty and unique");
      ids.add(item.id);
    }
    return props.files;
  });
  const disabled = () => props.onFiles === undefined || files().length >= props.maxFiles;
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
  return <div class={["ui-dropzone", props.class].filter(Boolean).join(" ")} role="group" aria-label={props.label} onDragOver={event => { if (event.dataTransfer?.types.includes("Files")) event.preventDefault(); }} onDrop={event => { if (!event.dataTransfer?.types.includes("Files")) return; event.preventDefault(); if (event.dataTransfer.files.length) select(event.dataTransfer.files); else setRejections(["No files were provided."]); }}>
    <label class="ui-field ui-file-field" for={id}><span class="ui-field-label">{props.label}</span><input id={id} type="file" multiple accept={props.accept?.join(",")} disabled={disabled()} onChange={event => { const selected = event.currentTarget.files; if (selected) select(selected); event.currentTarget.value = ""; }} /></label>
    <Show when={props.onFiles === undefined}><div class="ui-field-hint">File selection unavailable</div></Show>
    <Show when={props.onFiles !== undefined && files().length >= props.maxFiles}><div class="ui-field-hint">File limit reached</div></Show>
    <div role="status" class="ui-field-hint">{announcement()}</div>
    <Show when={rejections().length}><div role="alert" class="ui-field-error"><For each={rejections()}>{message => <div>{message}</div>}</For></div></Show>
    <Show when={files().length}><ul class="ui-dropzone-files"><For each={files()} keyed={item => item.id}>{item => <li>{fileName(item().file)}</li>}</For></ul></Show>
  </div>;
}
