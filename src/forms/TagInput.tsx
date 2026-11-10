import { createEffect, createMemo, createSignal, createUniqueId, For, onCleanup } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createFieldDescriptions } from "./fieldDescriptions";

export interface Tag {
  readonly id: string;
  readonly label: string;
}

export type TagRequestState =
  | { readonly kind: "idle" }
  | { readonly kind: "pending"; readonly id: string }
  | { readonly kind: "accepted"; readonly id: string }
  | { readonly kind: "failed"; readonly id: string; readonly message: string };

export interface TagAddRequest {
  readonly id: string;
  readonly labels: readonly string[];
}

export interface TagEditRequest {
  readonly id: string;
  readonly tagId: string;
  readonly label: string;
}

export interface TagInputProps {
  readonly id: string;
  readonly label: string;
  readonly value: readonly Tag[];
  readonly onAdd: (request: TagAddRequest) => void;
  readonly onRemove?: ((id: string) => void) | undefined;
  readonly onEdit?: ((request: TagEditRequest) => void) | undefined;
  readonly validate?: ((label: string) => string | undefined) | undefined;
  readonly state: TagRequestState;
  readonly maxTags?: number | undefined;
  readonly maxLength?: number | undefined;
  readonly name?: string | undefined;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly class?: string | undefined;
}

function normalize(label: string): string {
  return label.normalize("NFKC").trim().replace(/\s+/gu, " ");
}

export function TagInput(props: TagInputProps): JSX.Element {
  const id = `ui-tag-input-${createUniqueId()}`;
  const descriptions = createFieldDescriptions(props);
  const [draft, setDraft] = createSignal("");
  const [error, setError] = createSignal("");
  const [pending, setPending] = createSignal<({ readonly kind: "add"; readonly rejected: readonly string[]; readonly rejectionMessage: string } & TagAddRequest | { readonly kind: "edit" } & TagEditRequest) & { readonly draft: string }>();
  const [editing, setEditing] = createSignal<{ readonly tagId: string; readonly savedDraft: string }>();
  let container: HTMLDivElement | undefined;
  let input: HTMLInputElement | undefined;
  let disposed = false;
  let composing = false;
  let requestNumber = 0;
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  const maxTags = () => props.maxTags ?? 50;
  const maxLength = () => props.maxLength ?? 80;
  const tags = createMemo(() => {
    if (!Number.isInteger(maxTags()) || maxTags() < 1 || maxTags() > 100) throw new RangeError("TagInput maxTags must be between 1 and 100");
    if (!Number.isInteger(maxLength()) || maxLength() < 1 || maxLength() > 256) throw new RangeError("TagInput maxLength must be between 1 and 256");
    if (props.value.length > maxTags()) throw new RangeError("TagInput value exceeds maxTags");
    if (props.state.kind === "failed" && !props.state.message) throw new Error("Tag request failure requires a message");
    const ids = new Set<string>();
    const labels = new Set<string>();
    for (const tag of props.value) {
      const key = normalize(tag.label).toLowerCase();
      if (!tag.id || ids.has(tag.id) || !key || labels.has(key)) throw new Error("Tag IDs and normalized labels must be nonempty and unique");
      if (normalize(tag.label).length > maxLength()) throw new RangeError("Tag label exceeds maxLength");
      ids.add(tag.id);
      labels.add(key);
    }
    return props.value;
  });
  const currentState = () => props.state.kind !== "idle" && props.state.id === pending()?.id ? props.state : { kind: "idle" as const };
  const message = () => { const state = currentState(); return [error(), state.kind === "failed" ? state.message : ""].filter(Boolean).join(" "); };
  const chips = () => [...(container?.querySelectorAll<HTMLButtonElement>(".ui-tag-remove:not(:disabled)") ?? [])];
  const cancelEdit = () => {
    const edit = editing();
    if (!edit) return;
    setPending(undefined);
    setEditing(undefined);
    setDraft(edit.savedDraft);
    setError("");
    input?.focus();
  };
  const beginEdit = (tag: Tag) => {
    if (props.disabled || !props.onEdit) return;
    setPending(undefined);
    setEditing({ tagId: tag.id, savedDraft: editing()?.savedDraft ?? draft() });
    setDraft(tag.label);
    setError("");
    input?.focus();
    input?.select();
  };
  const add = (text = draft()) => {
    if (props.disabled || currentState().kind === "pending") return;
    if (text.length > 32768) { setError("Tag draft must be at most 32768 characters."); return; }
    const edit = editing();
    const current = edit ? tags().find(tag => tag.id === edit.tagId) : undefined;
    if (edit && !current) { setError("The tag is no longer available."); return; }
    const parts = edit ? [text] : text.split(/[,;\n\r]+/u);
    const labels: string[] = [];
    const rejected: string[] = [];
    const reasons = new Set<string>();
    const existing = new Set(tags().filter(tag => tag.id !== edit?.tagId).map(tag => normalize(tag.label).toLowerCase()));
    for (const part of parts) {
      const label = normalize(part);
      if (!label) continue;
      const key = label.toLowerCase();
      const validation = props.validate?.(label);
      const reason = label.length > maxLength() ? `Tags must be at most ${maxLength()} characters.` : validation || (existing.has(key) ? "This tag is already selected." : !edit && tags().length + labels.length >= maxTags() ? `Select at most ${maxTags()} tags.` : "");
      if (reason) { rejected.push(part.trim()); reasons.add(reason); } else { labels.push(label); existing.add(key); }
    }
    if (!labels.length) { setError([...reasons].join(" ") || "Enter a tag."); return; }
    if (pending()?.draft === text && currentState().kind !== "failed") return;
    const rejectionMessage = rejected.length ? `Some tags were rejected: ${[...reasons].join(" ")}` : "";
    setError(rejectionMessage);
    const requestId = `${id}-request-${++requestNumber}`;
    if (edit && current) {
      const label = labels[0]!;
      if (label === current.label) { cancelEdit(); return; }
      const request = { id: requestId, tagId: edit.tagId, label };
      setPending({ ...request, kind: "edit", draft: text });
      props.onEdit?.(request);
    } else {
      const request = { id: requestId, labels };
      setPending({ ...request, kind: "add", draft: text, rejected, rejectionMessage });
      props.onAdd(request);
    }
  };
  const remove = (tag: Tag) => { input?.focus(); props.onRemove?.(tag.id); };
  createEffect(() => {
    const request = pending();
    const labels = new Set(tags().map(tag => normalize(tag.label).toLowerCase()));
    const state = currentState();
    if (!request || state.kind !== "accepted") return undefined;
    return request.kind === "add" ? request.labels.every(label => labels.has(label.toLowerCase())) ? request : undefined : tags().some(tag => tag.id === request.tagId && tag.label === request.label) ? request : undefined;
  }, request => {
    if (!request) return;
    queueMicrotask(() => {
      if (disposed || pending() !== request) return;
      if (draft() === request.draft) {
        if (request.kind === "add") { setDraft(request.rejected.join(", ")); setError(request.rejectionMessage); }
        else { setDraft(editing()?.savedDraft ?? ""); setEditing(undefined); setError(""); }
      }
      setPending(undefined);
    });
  });
  createEffect(() => true, () => {
    const form = input?.form;
    if (!form) return;
    const reset = (event: Event) => {
      const before = draft();
      if (resetTimer !== undefined) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { resetTimer = undefined; if (!disposed && !event.defaultPrevented && draft() === before) { setPending(undefined); setEditing(undefined); setDraft(""); setError(""); } }, 0);
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  });
  onCleanup(() => { disposed = true; if (resetTimer !== undefined) clearTimeout(resetTimer); });
  return <div class={["ui-tag-input", props.class].filter(Boolean).join(" ")} ref={element => { container = element; }} onKeyDown={event => {
    if (event.isComposing || composing) return;
    const choices = chips();
    if (event.target === input && input && input.selectionStart === 0 && input.selectionEnd === 0 && (event.key === "ArrowLeft" || (event.key === "Backspace" && input.value === ""))) { if (choices.length) { event.preventDefault(); choices[choices.length - 1]?.focus(); } return; }
    const index = choices.findIndex(choice => choice === event.target);
    if (index < 0) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); if (event.key === "ArrowRight" && index === choices.length - 1) input?.focus(); else choices[Math.max(0, index + (event.key === "ArrowLeft" ? -1 : 1))]?.focus(); }
  }}>
    <ul class="ui-multi-values" aria-label={`${props.label} selected`}><For each={tags()} keyed={tag => tag.id}>{tag => <li class="ui-multi-chip"><span>{tag().label}</span><button type="button" class="ui-multi-chip-remove" aria-label={`Edit ${tag().label}`} disabled={props.disabled || !props.onEdit} onClick={() => beginEdit(tag())}>Edit</button><button type="button" class="ui-multi-chip-remove ui-tag-remove" aria-label={`Remove ${tag().label}`} disabled={props.disabled || !props.onRemove} onClick={() => remove(tag())} onKeyDown={event => { if (event.key === "Backspace" || event.key === "Delete") { event.preventDefault(); remove(tag()); } }}>×</button></li>}</For></ul>
    <span class="ui-sr-only" role="status">{tags().length} selected</span>
    <div class="ui-field"><label class="ui-field-label" for={props.id}>{props.label}</label>{editing() && <div id={`${id}-editing`} class="ui-field-hint" role="status">Editing {tags().find(tag => tag.id === editing()?.tagId)?.label ?? "unavailable tag"}</div>}<div class="ui-tag-control"><input id={props.id} class="ui-text-field" value={draft()} disabled={props.disabled} aria-describedby={[descriptions.describedBy(), editing() ? `${id}-editing` : undefined, currentState().kind === "pending" ? `${id}-pending` : undefined, message() ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined} aria-invalid={message() || props.error ? "true" : undefined} ref={element => { input = element; }} onInput={event => { setDraft(event.currentTarget.value); setPending(undefined); setError(""); }} onPaste={event => { const pasted = event.clipboardData?.getData("text/plain"); if (composing || editing() || !pasted || !/[,;\r\n]/u.test(pasted)) return; event.preventDefault(); const target = event.currentTarget; const text = `${target.value.slice(0, target.selectionStart ?? 0)}${pasted}${target.value.slice(target.selectionEnd ?? 0)}`.replace(/\r\n?|\n/gu, ", "); setPending(undefined); setDraft(text); setError(""); add(text); }} onCompositionStart={() => { composing = true; }} onCompositionEnd={() => { composing = false; }} onKeyDown={event => { if (event.key === "Enter" && !event.isComposing && !composing) { event.preventDefault(); add(); } }} /><button type="button" class="ui-btn ui-btn-small" disabled={props.disabled || currentState().kind === "pending"} onClick={() => { input?.focus(); add(); }}>{editing() ? "Save tag" : "Add tag"}</button>{editing() && <button type="button" class="ui-btn ui-btn-small" onClick={cancelEdit}>Cancel edit</button>}</div>
      {currentState().kind === "pending" && <div id={`${id}-pending`} class="ui-field-hint" role="status">Saving tag…</div>}
      {props.hint && <div class="ui-field-hint" id={descriptions.hintId}>{props.hint}</div>}{props.error && <div class="ui-field-error" id={descriptions.errorId}>{props.error}</div>}{message() && <div id={`${id}-error`} class="ui-field-error" role="alert">{message()}</div>}
    </div>
    {props.name && <For each={tags()} keyed={tag => tag.id}>{tag => <input type="hidden" name={props.name} value={tag().label} disabled={props.disabled} />}</For>}
  </div>;
}
