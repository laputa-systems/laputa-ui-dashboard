import { createUniqueId } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface FieldDescriptionProps extends Pick<JSX.InputHTMLAttributes<HTMLInputElement>, "aria-describedby"> {
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
}

export function createFieldDescriptions(props: FieldDescriptionProps) {
  const id = `ui-field-description-${createUniqueId()}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = () => [props["aria-describedby"], props.hint ? hintId : undefined, props.error ? errorId : undefined].filter(Boolean).join(" ") || undefined;
  return { hintId, errorId, describedBy };
}
