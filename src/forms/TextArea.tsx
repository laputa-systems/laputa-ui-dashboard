import { createEffect, createMemo, createSignal, createUniqueId, omit, onCleanup, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createFieldDescriptions } from "./fieldDescriptions";

export interface TextAreaProps extends Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "children"> {
  readonly id: string;
  readonly label: string;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly showCount?: boolean | undefined;
  readonly autosize?: { readonly minRows: number; readonly maxRows: number } | undefined;
  readonly expandRows?: number | undefined;
  readonly submitShortcut?: "ControlEnter" | "MetaEnter" | undefined;
}

function invoke<E extends Event>(handler: JSX.EventHandlerUnion<HTMLTextAreaElement, E> | undefined, event: E & { currentTarget: HTMLTextAreaElement; target: Element }): void {
  if (!handler) return;
  if (typeof handler === "function") handler(event);
  else handler[0](handler[1], event);
}

export function TextArea(props: TextAreaProps): JSX.Element {
  const id = `ui-textarea-${createUniqueId()}`;
  const descriptions = createFieldDescriptions(props);
  const initialDefault = untrack(() => props.defaultValue);
  const [length, setLength] = createSignal(untrack(() => String(props.value ?? props.defaultValue ?? "").length));
  const [expanded, setExpanded] = createSignal(false);
  let textarea: HTMLTextAreaElement | undefined;
  let frame: number | undefined;
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let composing = false;
  const config = createMemo(() => {
    const value = props.autosize;
    if (value && (!Number.isInteger(value.minRows) || !Number.isInteger(value.maxRows) || value.minRows < 1 || value.maxRows < value.minRows || value.maxRows > 100)) throw new RangeError("TextArea autosize rows must be between 1 and 100");
    if (props.expandRows !== undefined && (!value || !Number.isInteger(props.expandRows) || props.expandRows <= value.maxRows || props.expandRows > 100)) throw new RangeError("TextArea expandRows must exceed autosize maxRows and be at most 100");
    return value;
  });
  const resize = () => {
    const element = textarea;
    const size = config();
    if (!element || !size || !element.isConnected) return;
    const style = getComputedStyle(element);
    const computedLine = Number.parseFloat(style.lineHeight);
    const line = Number.isFinite(computedLine) ? computedLine : Number.parseFloat(style.fontSize) * 1.2;
    const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    const border = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth);
    const expandedRows = expanded() ? props.expandRows : undefined;
    const minRows = expandedRows ?? size.minRows;
    const maxRows = expandedRows ?? size.maxRows;
    const min = line * minRows + padding + border;
    const max = line * maxRows + padding + border;
    element.style.height = "auto";
    const content = element.scrollHeight + border;
    element.style.height = `${Math.max(min, Math.min(max, content))}px`;
    element.style.overflowY = content > max ? "auto" : "hidden";
  };
  const schedule = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { frame = undefined; if (!disposed) resize(); });
  };
  createEffect(() => [props.value, config(), expanded()] as const, ([value, size]) => {
    if (value !== undefined) setLength(String(value).length);
    if (textarea && size) schedule();
  });
  createEffect(() => config() !== undefined, enabled => {
    if (!enabled) { setExpanded(false); return; }
    if (!textarea) return;
    const element = textarea;
    const height = element.style.height;
    const overflowY = element.style.overflowY;
    let width = -1;
    const observer = new ResizeObserver(entries => {
      const next = entries[0]?.contentRect.width;
      if (next !== undefined && next !== width) { width = next; schedule(); }
    });
    observer.observe(element);
    return () => { observer.disconnect(); element.style.height = height; element.style.overflowY = overflowY; };
  });
  createEffect(() => true, () => {
    const form = textarea?.form;
    if (!form) return;
    const reset = (event: Event) => {
      if (resetTimer !== undefined) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { resetTimer = undefined; if (!disposed && !event.defaultPrevented && textarea) { setLength(textarea.value.length); if (config()) schedule(); } }, 0);
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  });
  onCleanup(() => { disposed = true; if (frame !== undefined) cancelAnimationFrame(frame); if (resetTimer !== undefined) clearTimeout(resetTimer); });
  const native = omit(props, key => key === "label" || key === "hint" || key === "error" || key === "showCount" || key === "autosize" || key === "expandRows" || key === "submitShortcut" || key === "class" || key === "ref" || key === "value" || key === "defaultValue" || key === "aria-describedby" || key === "aria-invalid" || key === "onInput" || key === "onKeyDown" || key === "onCompositionStart" || key === "onCompositionEnd");
  const toggle = () => {
    const element = textarea;
    const start = element?.selectionStart;
    const end = element?.selectionEnd;
    const direction = element?.selectionDirection;
    setExpanded(value => !value);
    element?.focus();
    if (element && start !== undefined && end !== undefined) element.setSelectionRange(start, end, direction ?? undefined);
  };
  return <div class="ui-field">
    <label class="ui-field-label" for={props.id}>{props.label}</label>
    <textarea {...native} {...(props.value === undefined ? { defaultValue: initialDefault } : { value: props.value, defaultValue: props.value })} class={["ui-text-field", "ui-textarea", props.class].filter(Boolean).join(" ")} data-autosize={config() ? "" : undefined} aria-describedby={[descriptions.describedBy(), props.showCount ? `${id}-count` : undefined].filter(Boolean).join(" ") || undefined} aria-invalid={props.error ? "true" : props["aria-invalid"]} ref={[props.ref, element => { textarea = element; }]} onInput={event => { if (props.onInput) { if (typeof props.onInput === "function") props.onInput(event); else props.onInput[0](props.onInput[1], event); } if (props.value !== undefined && !composing && !event.isComposing && event.currentTarget.value !== String(props.value)) { const start = event.currentTarget.selectionStart; const end = event.currentTarget.selectionEnd; event.currentTarget.value = String(props.value); event.currentTarget.setSelectionRange(Math.min(start, event.currentTarget.value.length), Math.min(end, event.currentTarget.value.length)); } setLength(event.currentTarget.value.length); if (config()) schedule(); }} onCompositionStart={event => { composing = true; invoke(props.onCompositionStart, event); }} onCompositionEnd={event => { composing = false; invoke(props.onCompositionEnd, event); }} onKeyDown={event => { invoke(props.onKeyDown, event); if (event.defaultPrevented || event.isComposing || composing || event.key !== "Enter" || event.altKey || event.shiftKey || event.currentTarget.disabled || event.currentTarget.readOnly) return; const shortcut = props.submitShortcut; if ((shortcut === "ControlEnter" && event.ctrlKey && !event.metaKey) || (shortcut === "MetaEnter" && event.metaKey && !event.ctrlKey)) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
    {props.hint && <div class="ui-field-hint" id={descriptions.hintId}>{props.hint}</div>}{props.error && <div class="ui-field-error" id={descriptions.errorId}>{props.error}</div>}
    {props.showCount && <span id={`${id}-count`} class="ui-field-hint">{length()}{props.maxlength !== undefined && props.maxlength !== false ? ` / ${props.maxlength}` : ""}</span>}
    {props.expandRows !== undefined && <button type="button" class="ui-btn ui-btn-small ui-textarea-expand" aria-controls={props.id} aria-expanded={expanded() ? "true" : "false"} disabled={props.disabled} onClick={toggle}>{expanded() ? `Collapse ${props.label}` : `Expand ${props.label}`}</button>}
  </div>;
}
