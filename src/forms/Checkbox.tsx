import { omit, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createFieldDescriptions } from "./fieldDescriptions";

type CheckboxState =
  | { readonly checked: boolean; readonly defaultChecked?: never }
  | { readonly checked?: undefined; readonly defaultChecked?: boolean | undefined };

export type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "checked" | "defaultChecked" | "onChange" | "children" | "aria-checked" | "readonly" | "prop:indeterminate"> & CheckboxState & {
  readonly id: string;
  readonly label: string;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly card?: boolean | undefined;
  readonly indeterminate?: boolean | undefined;
  readonly onCheckedChange?: ((checked: boolean) => void) | undefined;
};

export function Checkbox(props: CheckboxProps): JSX.Element {
  const descriptions = createFieldDescriptions(props);
  const initial = untrack(() => props.defaultChecked ?? false);
  const state = () => props.checked === undefined ? { defaultChecked: initial } : { defaultChecked: props.checked, checked: props.checked };
  const native = omit(props, key => key === "label" || key === "hint" || key === "error" || key === "class" || key === "card" || key === "indeterminate" || key === "onCheckedChange" || key === "checked" || key === "defaultChecked" || key === "aria-describedby" || key === "aria-invalid");
  const change = (event: Event & { currentTarget: HTMLInputElement }) => {
    const input = event.currentTarget;
    props.onCheckedChange?.(input.checked);
    if (props.checked !== undefined) input.checked = props.checked;
    input.indeterminate = props.indeterminate === true;
  };
  return (
    <label class={["ui-choice", props.card ? "ui-choice-card" : undefined, props.class].filter(Boolean).join(" ")} for={props.id}>
      <input {...native} {...state()} type="checkbox" class="ui-checkbox" disabled={props.disabled || (props.checked !== undefined && props.onCheckedChange === undefined)} prop:indeterminate={props.indeterminate === true} aria-checked={props.indeterminate ? "mixed" : undefined} aria-describedby={descriptions.describedBy()} aria-invalid={props.error ? "true" : props["aria-invalid"]} onChange={change} />
      <span class="ui-choice-content">
        <span class="ui-field-label">{props.label}</span>
        {props.hint && <span class="ui-field-hint" id={descriptions.hintId}>{props.hint}</span>}
        {props.error && <span class="ui-field-error" id={descriptions.errorId}>{props.error}</span>}
      </span>
    </label>
  );
}
