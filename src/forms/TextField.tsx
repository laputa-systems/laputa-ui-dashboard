import { createUniqueId, omit } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface TextFieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "id"> {
  readonly id: string;
  readonly label: string;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
}

export function TextField(props: TextFieldProps): JSX.Element {
  const descriptionId = `ui-field-description-${createUniqueId()}`;
  const hintId = `${descriptionId}-hint`;
  const errorId = `${descriptionId}-error`;
  const native = omit(props, key => key === "label" || key === "hint" || key === "error" || key === "class" || key === "aria-describedby" || key === "aria-invalid");
  const describedBy = () => [props["aria-describedby"], props.hint ? hintId : undefined, props.error ? errorId : undefined].filter(Boolean).join(" ") || undefined;
  return (
    <div class="ui-field">
      <label class="ui-field-label" for={props.id}>{props.label}</label>
      <input {...native} class={["ui-text-field", props.class].filter(Boolean).join(" ")} aria-describedby={describedBy()} aria-invalid={props.error ? "true" : props["aria-invalid"]} />
      {props.hint && <div class="ui-field-hint" id={hintId}>{props.hint}</div>}
      {props.error && <div class="ui-field-error" id={errorId}>{props.error}</div>}
    </div>
  );
}
