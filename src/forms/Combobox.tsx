import { createEffect, createMemo, createSignal, createUniqueId, For, onCleanup, Show, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createAnchoredPopover } from "../internal/anchoredPopover";
import { createFieldDescriptions } from "./fieldDescriptions";

import { validatedComboboxOptions, type ComboboxEntry, type ComboboxOption } from "./comboboxOptions";
export type { ComboboxEntry, ComboboxGroup, ComboboxOption } from "./comboboxOptions";

export type ComboboxCreateState =
  | { readonly kind: "idle" }
  | { readonly kind: "pending"; readonly query: string }
  | { readonly kind: "failed"; readonly query: string; readonly message: string };

export interface ComboboxCreate {
  readonly state: ComboboxCreateState;
  readonly onCreate: (query: string) => void;
}

export interface ComboboxProps {
  readonly id: string;
  readonly label: string;
  readonly options: readonly ComboboxEntry[];
  readonly value: string | null;
  readonly onChange: (id: string | null) => void;
  readonly create?: ComboboxCreate | undefined;
  readonly name?: string | undefined;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly class?: string | undefined;
}

export function Combobox(props: ComboboxProps): JSX.Element {
  return <ComboboxControl {...props} />;
}

export function ComboboxControl(props: ComboboxProps & { readonly creationOptions?: readonly ComboboxEntry[] | undefined }): JSX.Element {
  const popupId = `ui-combobox-${createUniqueId()}`;
  const listId = `${popupId}-list`;
  const missingId = `${popupId}-missing`;
  const descriptions = createFieldDescriptions(props);
  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [active, setActive] = createSignal<string | null>(null);
  let input: HTMLInputElement | undefined;
  let popup: HTMLDivElement | undefined;
  let createButton: HTMLButtonElement | undefined;
  let disposed = false;
  let composing = false;
  let openOnPointerDown = false;
  let pointerInPopup = false;
  let touch: { id: string; pointerId: number; x: number; y: number; moved: boolean } | undefined;
  let suppressClick = false;
  const positioner = createAnchoredPopover(() => input, () => popup);
  const allOptions = createMemo(() => validatedComboboxOptions(props.options));
  const groups = createMemo(() => {
    allOptions();
    return props.options.map(entry => "options" in entry ? { key: `group:${entry.id}`, label: entry.label, options: entry.options } : { key: `option:${entry.id}`, label: undefined, options: [entry] });
  });
  const selected = () => allOptions().find(option => option.id === props.value);
  const missing = () => props.value !== null && selected() === undefined;
  const visible = createMemo(() => {
    const text = query().trim().toLocaleLowerCase();
    return groups().map(group => ({ ...group, options: group.options.filter(option => option.label.toLocaleLowerCase().includes(text)) })).filter(group => group.options.length > 0);
  });
  const creationQuery = () => query().trim();
  const canCreate = () => props.create !== undefined && creationQuery() !== "" && !(props.creationOptions ? validatedComboboxOptions(props.creationOptions) : allOptions()).some(option => option.label.trim().toLocaleLowerCase() === creationQuery().toLocaleLowerCase());
  const creationState = () => {
    const state = props.create?.state;
    return state && state.kind !== "idle" && state.query === creationQuery() ? state : undefined;
  };
  const creationError = () => { const state = creationState(); return state?.kind === "failed" ? state.message : undefined; };
  const enabled = () => visible().flatMap(group => group.options).filter(option => !option.disabled);
  const activeOption = () => enabled().find(option => option.id === active());
  const optionId = (id: string) => `${popupId}-option-${Array.from({ length: id.length }, (_, index) => id.charCodeAt(index).toString(16)).join("-")}`;
  const activeDescendant = () => {
    const option = activeOption();
    return open() && option ? optionId(option.id) : undefined;
  };
  const selectedText = () => selected()?.label ?? props.value ?? "";
  const display = () => open() ? query() : selectedText();
  const describedBy = () => [descriptions.describedBy(), missing() ? missingId : undefined].filter(Boolean).join(" ") || undefined;
  const close = () => {
    pointerInPopup = false;
    touch = undefined;
    if (popup?.matches(":popover-open")) popup.hidePopover();
    setOpen(false);
    setActive(null);
    positioner.stop();
  };
  const show = (resetQuery: boolean) => {
    if (props.disabled || popup === undefined) return;
    suppressClick = false;
    if (resetQuery) setQuery("");
    if (!popup.matches(":popover-open")) popup.showPopover();
    setOpen(true);
    setActive(null);
    positioner.start();
  };
  const select = (option: ComboboxOption) => {
    if (option.disabled) return;
    props.onChange(option.id);
    close();
    input?.focus();
  };
  const renderOption = (option: () => ComboboxOption) => (
    <div
      id={optionId(option().id)}
      role="option"
      class="ui-combobox-option"
      aria-selected={props.value === option().id ? "true" : "false"}
      aria-disabled={option().disabled ? "true" : undefined}
      data-active={active() === option().id ? "" : undefined}
      onPointerDown={event => {
        suppressClick = false;
        if (event.pointerType === "mouse") event.preventDefault();
        else if (event.pointerType === "touch" || event.pointerType === "pen") touch = { id: untrack(option).id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
      }}
      onPointerUp={event => {
        if ((event.pointerType !== "touch" && event.pointerType !== "pen") || touch?.pointerId !== event.pointerId || touch.id !== untrack(option).id) return;
        const moved = touch.moved;
        touch = undefined;
        if (moved) suppressClick = true;
        else if (!untrack(option).disabled) { event.preventDefault(); suppressClick = true; select(untrack(option)); }
      }}
      onClick={() => { pointerInPopup = false; if (suppressClick) { suppressClick = false; return; } select(untrack(option)); }}
    >{option().label}</div>
  );
  const CreateAction = () => {
    onCleanup(() => { if (typeof document !== "undefined" && document.activeElement === createButton && !disposed) input?.focus(); });
    return <div class="ui-combobox-create">
      <button type="button" class="ui-btn ui-btn-small" ref={element => { createButton = element; }} aria-disabled={creationState()?.kind === "pending" ? "true" : undefined} onClick={() => { if (creationState()?.kind !== "pending") props.create?.onCreate(creationQuery()); }} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); input?.focus(); } }}>Create {creationQuery()}</button>
      {creationState()?.kind === "pending" ? <span role="status">Creating…</span> : null}
      {creationState()?.kind === "failed" ? <span role="alert">{creationError()}</span> : null}
    </div>;
  };
  createEffect(() => [props.options, query()] as const, () => {
    if (untrack(open)) queueMicrotask(() => { if (!disposed) positioner.position(); });
  });
  createEffect(() => props.disabled, disabled => { if (disabled && untrack(open)) close(); });
  createEffect(() => true, () => {
    const form = input?.form;
    if (form === null || form === undefined) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (disposed || event.defaultPrevented) return;
        close();
        if (input !== undefined) input.value = selectedText();
      });
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  });
  onCleanup(() => { disposed = true; });
  return (
    <div class={["ui-field", props.class].filter(Boolean).join(" ")}>
      <label class="ui-field-label" for={props.id}>{props.label}</label>
      <div class="ui-combobox-control">
        <input
          id={props.id}
          type="text"
          class="ui-text-field"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open() ? "true" : "false"}
          aria-controls={listId}
          aria-activedescendant={activeDescendant()}
          aria-describedby={describedBy()}
          aria-invalid={props.error || missing() ? "true" : undefined}
          disabled={props.disabled}
          defaultValue={selectedText()}
          value={display()}
          ref={element => { input = element; }}
          onFocus={() => { pointerInPopup = false; }}
          onPointerDown={event => { if (event.button === 0) openOnPointerDown = popup?.matches(":popover-open") ?? false; }}
          onClick={event => {
            const wasOpen = event.detail > 0 && openOnPointerDown;
            openOnPointerDown = false;
            if (!popup?.matches(":popover-open")) show(!wasOpen);
          }}
          onInput={event => { setQuery(event.currentTarget.value); setActive(null); if (!open()) show(false); }}
          onCompositionStart={() => { composing = true; }}
          onCompositionEnd={() => { composing = false; }}
          onBlur={() => { queueMicrotask(() => { if (!disposed && !pointerInPopup && open() && document.activeElement !== input && !popup?.contains(document.activeElement)) close(); }); }}
          onKeyDown={event => {
            if (event.isComposing || composing) return;
            if (event.key === "Tab") {
              pointerInPopup = false;
              if (open() && !event.shiftKey && canCreate() && createButton !== undefined) { event.preventDefault(); createButton.focus(); return; }
            }
            if (event.key === "Escape" && open()) { event.preventDefault(); event.stopPropagation(); close(); return; }
            const current = activeOption();
            if (event.key === "Enter" && open()) { event.preventDefault(); if (current) select(current); return; }
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            if (!open()) show(true);
            const choices = enabled();
            if (choices.length === 0) { setActive(null); return; }
            const index = choices.findIndex(option => option.id === active());
            const next = event.key === "ArrowDown" ? (index + 1) % choices.length : (index <= 0 ? choices.length - 1 : index - 1);
            const option = choices[next];
            if (option === undefined) return;
            setActive(option.id);
            queueMicrotask(() => { if (!disposed) document.getElementById(optionId(option.id))?.scrollIntoView({ block: "nearest" }); });
          }}
        />
        {props.value !== null && !props.disabled ? <button type="button" class="ui-btn ui-btn-small" aria-label={`Clear ${props.label}`} onClick={() => { props.onChange(null); close(); input?.focus(); }}>Clear</button> : null}
      </div>
      {props.name ? <input type="hidden" name={props.name} value={props.value ?? ""} disabled={props.disabled || props.value === null} /> : null}
      {props.hint && <div class="ui-field-hint" id={descriptions.hintId}>{props.hint}</div>}
      {props.error && <div class="ui-field-error" id={descriptions.errorId}>{props.error}</div>}
      {missing() && <div class="ui-field-error" id={missingId}>Selection is unavailable</div>}
      <div
        class="ui-popover ui-combobox-popup"
        popover="auto"
        ref={element => { popup = element; }}
        onFocusOut={() => { queueMicrotask(() => { if (!disposed && open() && document.activeElement !== input && !popup?.contains(document.activeElement)) close(); }); }}
        onPointerDown={() => { pointerInPopup = true; }}
        onPointerMove={event => { if (touch?.pointerId === event.pointerId && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 8) touch.moved = true; }}
        onPointerCancel={() => { touch = undefined; }}
        onToggle={event => { if (event.newState === "closed" && !popup?.matches(":popover-open")) { setOpen(false); setActive(null); pointerInPopup = false; touch = undefined; positioner.stop(); } }}
      >
        <div id={listId} role="listbox" aria-label={props.label}>
          <For each={visible()} keyed={group => group.key}>{group => <Show when={group().label !== undefined} fallback={<For each={group().options} keyed={option => option.id}>{renderOption}</For>}><div role="group" aria-label={group().label}><div class="ui-combobox-group-label" aria-hidden="true">{group().label}</div><For each={group().options} keyed={option => option.id}>{renderOption}</For></div></Show>}</For>
        </div>
        {visible().length === 0 ? <div role="status" class="ui-combobox-empty">No matching options</div> : null}
        <Show when={canCreate()}><CreateAction /></Show>
      </div>
    </div>
  );
}
