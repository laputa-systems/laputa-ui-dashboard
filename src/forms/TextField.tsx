import { createEffect, createSignal, createUniqueId, omit, onCleanup, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createFieldDescriptions } from "./fieldDescriptions";

export interface TextFieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "id"> {
  readonly id: string;
  readonly label: string;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly leadingContent?: JSX.Element | undefined;
  readonly trailingContent?: JSX.Element | undefined;
  readonly showCount?: boolean | undefined;
  readonly clearable?: boolean | undefined;
  readonly copyable?: boolean | undefined;
  readonly revealable?: boolean | undefined;
}

export function TextField(props: TextFieldProps): JSX.Element {
  const descriptions = createFieldDescriptions(props);
  const countId = `ui-text-field-${createUniqueId()}-count`;
  const [length, setLength] = createSignal(untrack(() => String(props.value ?? props.defaultValue ?? "").length));
  const [revealed, setRevealed] = createSignal(false);
  const [copyState, setCopyState] = createSignal<"idle" | "pending" | "copied" | "failed">("idle");
  let copyRequest = 0;
  let input: HTMLInputElement | undefined;
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  const native = omit(props, key => key === "label" || key === "hint" || key === "error" || key === "leadingContent" || key === "trailingContent" || key === "showCount" || key === "clearable" || key === "copyable" || key === "revealable" || key === "type" || key === "class" || key === "ref" || key === "aria-describedby" || key === "aria-invalid");
  const resetCopy = () => { copyRequest += 1; setCopyState("idle"); };
  const inputType = () => {
    if (props.revealable && props.type !== "password") throw new TypeError("TextField revealable requires type=password");
    return props.revealable && revealed() ? "text" : props.type;
  };
  createEffect(() => props.value, value => { if (value !== undefined) setLength(String(value).length); resetCopy(); });
  createEffect(() => [props.showCount || props.clearable || props.copyable, props.form] as const, ([enabled]) => {
    if (!enabled || !input) return;
    const element = input;
    const update = () => { setLength(element.value.length); resetCopy(); };
    const form = element.form;
    const reset = (event: Event) => {
      if (resetTimer !== undefined) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { resetTimer = undefined; if (!disposed && !event.defaultPrevented) update(); }, 0);
    };
    element.addEventListener("input", update);
    form?.addEventListener("reset", reset);
    return () => { element.removeEventListener("input", update); form?.removeEventListener("reset", reset); };
  });
  onCleanup(() => { disposed = true; copyRequest += 1; if (resetTimer !== undefined) clearTimeout(resetTimer); });
  const clear = () => {
    if (!input || props.disabled || props.readonly) return;
    input.focus();
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    if (props.value !== undefined) input.value = String(props.value);
    setLength(input.value.length);
  };
  const copy = async () => {
    if (!input || props.disabled || copyState() === "pending") return;
    const value = input.value;
    const request = ++copyRequest;
    input.focus();
    setCopyState("pending");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      if (!disposed && request === copyRequest) setCopyState("copied");
    } catch {
      if (!disposed && request === copyRequest) setCopyState("failed");
    }
  };
  const reveal = () => {
    if (!input || props.disabled) return;
    const { selectionStart, selectionEnd, selectionDirection } = input;
    setRevealed(value => !value);
    input.focus();
    if (selectionStart !== null && selectionEnd !== null) input.setSelectionRange(selectionStart, selectionEnd, selectionDirection ?? undefined);
  };
  const control = <input {...native} type={inputType()} {...(props.value === undefined ? {} : { defaultValue: props.value })} class={["ui-text-field", props.class].filter(Boolean).join(" ")} aria-describedby={[descriptions.describedBy(), props.showCount ? countId : undefined].filter(Boolean).join(" ") || undefined} aria-invalid={props.error ? "true" : props["aria-invalid"]} ref={[props.ref, element => { input = element; }]} />;
  return (
    <div class="ui-field">
      <label class="ui-field-label" for={props.id}>{props.label}</label>
      {props.leadingContent !== undefined || props.trailingContent !== undefined || props.clearable || props.copyable || props.revealable ? <div class="ui-text-field-control">{props.leadingContent !== undefined && <span class="ui-text-field-affix" aria-hidden="true">{props.leadingContent}</span>}{control}{props.trailingContent !== undefined && <span class="ui-text-field-affix" aria-hidden="true">{props.trailingContent}</span>}{props.clearable && <button type="button" class="ui-btn ui-btn-small" aria-label={`Clear ${props.label}`} disabled={props.disabled || props.readonly} onClick={clear}>Clear</button>}{props.copyable && <button type="button" class="ui-btn ui-btn-small" aria-label={`Copy ${props.label}`} disabled={props.disabled || copyState() === "pending"} onClick={copy}>Copy</button>}{props.revealable && <button type="button" class="ui-btn ui-btn-small" aria-label={`${revealed() ? "Hide" : "Show"} ${props.label}`} disabled={props.disabled} onPointerDown={event => event.preventDefault()} onClick={reveal}>{revealed() ? "Hide" : "Show"}</button>}</div> : control}
      {props.hint && <div class="ui-field-hint" id={descriptions.hintId}>{props.hint}</div>}
      {props.error && <div class="ui-field-error" id={descriptions.errorId}>{props.error}</div>}
      {props.copyable && <span class="ui-field-hint" role="status">{copyState() === "copied" ? "Copied" : copyState() === "failed" ? "Copy failed" : ""}</span>}
      {props.showCount && <span class="ui-field-hint" id={countId}>{length()}{props.maxlength !== undefined && props.maxlength !== false ? ` / ${props.maxlength}` : ""}</span>}
    </div>
  );
}
