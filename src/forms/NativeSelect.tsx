import { createMemo, For, omit, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createFieldDescriptions } from "./fieldDescriptions";

export interface NativeSelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean | undefined;
}

type NativeSelectState =
  | { readonly value: string; readonly defaultValue?: never }
  | { readonly value?: undefined; readonly defaultValue?: string | undefined };

export type NativeSelectProps = Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "id" | "value" | "defaultValue" | "onChange" | "children" | "multiple"> & NativeSelectState & {
  readonly id: string;
  readonly label: string;
  readonly options: readonly NativeSelectOption[];
  readonly placeholder?: string | undefined;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly onValueChange?: ((value: string) => void) | undefined;
};

export function NativeSelect(props: NativeSelectProps): JSX.Element {
  const descriptions = createFieldDescriptions(props);
  const initial = untrack(() => props.defaultValue ?? (props.placeholder !== undefined ? "" : props.options.find(option => !option.disabled)?.value ?? ""));
  const selected = () => props.value ?? initial;
  const options = createMemo(() => {
    if (props.options.length > 500) throw new RangeError("NativeSelect supports at most 500 options");
    const values = new Set<string>();
    for (const option of props.options) {
      if (!option.value || values.has(option.value)) throw new Error("Select option values must be nonempty and unique");
      values.add(option.value);
    }
    if (selected() === "" && props.placeholder === undefined && props.options.length > 0) throw new RangeError("An empty select value requires a placeholder");
    if (selected() !== "" && !values.has(selected())) throw new RangeError("Select value is not in the options");
    return props.options;
  });
  const native = omit(props, key => key === "label" || key === "options" || key === "placeholder" || key === "hint" || key === "error" || key === "class" || key === "value" || key === "defaultValue" || key === "onValueChange" || key === "aria-describedby" || key === "aria-invalid");
  return <div class="ui-field">
    <label class="ui-field-label" for={props.id}>{props.label}</label>
    <select {...native} {...(props.value === undefined ? {} : { value: props.value })} class={["ui-text-field", props.class].filter(Boolean).join(" ")} disabled={props.disabled || (props.value !== undefined && !props.onValueChange)} aria-describedby={descriptions.describedBy()} aria-invalid={props.error ? "true" : props["aria-invalid"]} onChange={event => { props.onValueChange?.(event.currentTarget.value); if (props.value !== undefined) event.currentTarget.value = props.value; }}>
      {props.placeholder !== undefined && <option value="" disabled defaultSelected={selected() === ""}>{props.placeholder}</option>}
      <For each={options()} keyed={option => option.value}>{option => <option value={option().value} disabled={option().disabled} defaultSelected={selected() === option().value}>{option().label}</option>}</For>
    </select>
    {props.hint && <div class="ui-field-hint" id={descriptions.hintId}>{props.hint}</div>}
    {props.error && <div class="ui-field-error" id={descriptions.errorId}>{props.error}</div>}
  </div>;
}
