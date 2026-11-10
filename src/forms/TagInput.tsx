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

export interface TagInputProps {
  readonly id: string;
  readonly label: string;
  readonly value: readonly Tag[];
  readonly onAdd: (request: TagAddRequest) => void;
  readonly onRemove?: ((id: string) => void) | undefined;
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
  const [pending, setPending] = createSignal<TagAddRequest & { readonly draft: string }>();
  let container: HTMLDivElement | undefined;
  let input: HTMLInputElement | undefined;
  let disposed = false;
  let composing = false;
  let requestNumber = 0;
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
  const message = () => { const state = currentState(); return error() || (state.kind === "failed" ? state.message : ""); };
  const chips = () => [...(container?.querySelectorAll<HTMLButtonElement>(".ui-tag-remove:not(:disabled)") ?? [])];
  const add = () => {
    if (props.disabled || currentState().kind === "pending") return;
    const text = draft();
    const label = normalize(text);
    if (!label) { setError("Enter a tag."); return; }
    if (label.length > maxLength()) { setError(`Tags must be at most ${maxLength()} characters.`); return; }
    const validation = props.validate?.(label);
    if (validation) { setError(validation); return; }
    if (tags().some(tag => normalize(tag.label).toLowerCase() === label.toLowerCase())) { setError("This tag is already selected."); return; }
    if (tags().length >= maxTags()) { setError(`Select at most ${maxTags()} tags.`); return; }
    if (pending()?.draft === text && currentState().kind !== "failed") return;
    setError("");
    const request = { id: `${id}-request-${++requestNumber}`, labels: [label] };
    setPending({ ...request, draft: text });
    props.onAdd(request);
  };
  const remove = (tag: Tag) => { input?.focus(); props.onRemove?.(tag.id); };
  createEffect(() => {
    const request = pending();
    const labels = new Set(tags().map(tag => normalize(tag.label).toLowerCase()));
    const state = currentState();
    return request && state.kind === "accepted" && request.labels.every(label => labels.has(label.toLowerCase())) ? request : undefined;
  }, request => {
    if (!request) return;
    queueMicrotask(() => {
      if (disposed || pending() !== request) return;
      if (draft() === request.draft) setDraft("");
      setPending(undefined);
    });
  });
  onCleanup(() => { disposed = true; });
  return <div class={["ui-tag-input", props.class].filter(Boolean).join(" ")} ref={element => { container = element; }} onKeyDown={event => {
    if (event.isComposing || composing) return;
    const choices = chips();
    if (event.target === input && input && input.selectionStart === 0 && input.selectionEnd === 0 && (event.key === "ArrowLeft" || (event.key === "Backspace" && input.value === ""))) { if (choices.length) { event.preventDefault(); choices[choices.length - 1]?.focus(); } return; }
    const index = choices.findIndex(choice => choice === event.target);
    if (index < 0) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); if (event.key === "ArrowRight" && index === choices.length - 1) input?.focus(); else choices[Math.max(0, index + (event.key === "ArrowLeft" ? -1 : 1))]?.focus(); }
  }}>
    <ul class="ui-multi-values" aria-label={`${props.label} selected`}><For each={tags()} keyed={tag => tag.id}>{tag => <li class="ui-multi-chip"><span>{tag().label}</span><button type="button" class="ui-multi-chip-remove ui-tag-remove" aria-label={`Remove ${tag().label}`} disabled={props.disabled || !props.onRemove} onClick={() => remove(tag())} onKeyDown={event => { if (event.key === "Backspace" || event.key === "Delete") { event.preventDefault(); remove(tag()); } }}>×</button></li>}</For></ul>
    <span class="ui-sr-only" role="status">{tags().length} selected</span>
    <div class="ui-field"><label class="ui-field-label" for={props.id}>{props.label}</label><div class="ui-tag-control"><input id={props.id} class="ui-text-field" value={draft()} disabled={props.disabled} aria-describedby={[descriptions.describedBy(), message() ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined} aria-invalid={message() || props.error ? "true" : undefined} ref={element => { input = element; }} onInput={event => { setDraft(event.currentTarget.value); setPending(undefined); setError(""); }} onCompositionStart={() => { composing = true; }} onCompositionEnd={() => { composing = false; }} onKeyDown={event => { if (event.key === "Enter" && !event.isComposing && !composing) { event.preventDefault(); add(); } }} /><button type="button" class="ui-btn ui-btn-small" disabled={props.disabled || currentState().kind === "pending"} onClick={() => { input?.focus(); add(); }}>Add tag</button></div>
      {props.hint && <div class="ui-field-hint" id={descriptions.hintId}>{props.hint}</div>}{props.error && <div class="ui-field-error" id={descriptions.errorId}>{props.error}</div>}{message() && <div id={`${id}-error`} class="ui-field-error" role="alert">{message()}</div>}
    </div>
    {props.name && <For each={tags()} keyed={tag => tag.id}>{tag => <input type="hidden" name={props.name} value={tag().label} disabled={props.disabled} />}</For>}
  </div>;
}
