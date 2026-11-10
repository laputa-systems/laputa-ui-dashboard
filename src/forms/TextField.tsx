import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createFieldDescriptions } from "./fieldDescriptions";

export interface TextFieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "id"> {
  readonly id: string;
  readonly label: string;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
}

export function TextField(props: TextFieldProps): JSX.Element {
  const descriptions = createFieldDescriptions(props);
  const native = omit(props, key => key === "label" || key === "hint" || key === "error" || key === "class" || key === "aria-describedby" || key === "aria-invalid");
  return (
    <div class="ui-field">
      <label class="ui-field-label" for={props.id}>{props.label}</label>
      <input {...native} class={["ui-text-field", props.class].filter(Boolean).join(" ")} aria-describedby={descriptions.describedBy()} aria-invalid={props.error ? "true" : props["aria-invalid"]} />
      {props.hint && <div class="ui-field-hint" id={descriptions.hintId}>{props.hint}</div>}
      {props.error && <div class="ui-field-error" id={descriptions.errorId}>{props.error}</div>}
    </div>
  );
}
