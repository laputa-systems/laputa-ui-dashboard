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
}

export function TextField(props: TextFieldProps): JSX.Element {
  const descriptions = createFieldDescriptions(props);
  const countId = `ui-text-field-${createUniqueId()}-count`;
  const [length, setLength] = createSignal(untrack(() => String(props.value ?? props.defaultValue ?? "").length));
  let input: HTMLInputElement | undefined;
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  const native = omit(props, key => key === "label" || key === "hint" || key === "error" || key === "leadingContent" || key === "trailingContent" || key === "showCount" || key === "class" || key === "ref" || key === "aria-describedby" || key === "aria-invalid");
  createEffect(() => props.value, value => { if (value !== undefined) setLength(String(value).length); });
  createEffect(() => [props.showCount, props.form] as const, ([enabled]) => {
    if (!enabled || !input) return;
    const element = input;
    const update = () => setLength(element.value.length);
    const form = element.form;
    const reset = (event: Event) => {
      if (resetTimer !== undefined) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { resetTimer = undefined; if (!disposed && !event.defaultPrevented) update(); }, 0);
    };
    element.addEventListener("input", update);
    form?.addEventListener("reset", reset);
    return () => { element.removeEventListener("input", update); form?.removeEventListener("reset", reset); };
  });
  onCleanup(() => { disposed = true; if (resetTimer !== undefined) clearTimeout(resetTimer); });
  const control = <input {...native} {...(props.value === undefined ? {} : { defaultValue: props.value })} class={["ui-text-field", props.class].filter(Boolean).join(" ")} aria-describedby={[descriptions.describedBy(), props.showCount ? countId : undefined].filter(Boolean).join(" ") || undefined} aria-invalid={props.error ? "true" : props["aria-invalid"]} ref={[props.ref, element => { input = element; }]} />;
  return (
    <div class="ui-field">
      <label class="ui-field-label" for={props.id}>{props.label}</label>
      {props.leadingContent !== undefined || props.trailingContent !== undefined ? <div class="ui-text-field-control">{props.leadingContent !== undefined && <span class="ui-text-field-affix" aria-hidden="true">{props.leadingContent}</span>}{control}{props.trailingContent !== undefined && <span class="ui-text-field-affix" aria-hidden="true">{props.trailingContent}</span>}</div> : control}
      {props.hint && <div class="ui-field-hint" id={descriptions.hintId}>{props.hint}</div>}
      {props.error && <div class="ui-field-error" id={descriptions.errorId}>{props.error}</div>}
      {props.showCount && <span class="ui-field-hint" id={countId}>{length()}{props.maxlength !== undefined && props.maxlength !== false ? ` / ${props.maxlength}` : ""}</span>}
    </div>
  );
}
