import { createMemo, For } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface RadioOption {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean | undefined;
  readonly icon?: JSX.Element | undefined;
  readonly count?: number | undefined;
}

export interface RadioGroupProps {
  readonly label: string;
  readonly name: string;
  readonly value: string | null;
  readonly options: readonly RadioOption[];
  readonly onChange: (id: string) => void;
  readonly required?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly class?: string | undefined;
}

export function RadioGroup(props: RadioGroupProps): JSX.Element {
  let group: HTMLFieldSetElement | undefined;
  const options = createMemo(() => {
    if (!props.name) throw new Error("RadioGroup requires a name");
    if (props.options.length > 100) throw new RangeError("RadioGroup supports at most 100 options");
    const ids = new Set<string>();
    for (const option of props.options) {
      if (!option.id || ids.has(option.id)) throw new Error("Radio option IDs must be nonempty and unique");
      if (option.count !== undefined && (!Number.isSafeInteger(option.count) || option.count < 0)) throw new RangeError("Radio count must be a nonnegative integer");
      ids.add(option.id);
    }
    return props.options;
  });
  const sync = () => { for (const input of group?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []) input.checked = input.value === props.value; };
  return <fieldset class={["ui-radio-group", props.class].filter(Boolean).join(" ")} disabled={props.disabled} ref={element => { group = element; }}>
    <legend>{props.label}</legend><div class="ui-radio-options"><For each={options()} keyed={option => option.id}>{option => <label class="ui-radio-option"><input type="radio" name={props.name} value={option().id} checked={props.value === option().id} defaultChecked={props.value === option().id} required={props.required} disabled={option().disabled} onChange={() => { if (option().id !== props.value) props.onChange(option().id); sync(); }} />{option().icon && <span aria-hidden="true">{option().icon}</span>}<span>{option().label}</span>{option().count !== undefined && <span>{option().count}</span>}</label>}</For></div>
  </fieldset>;
}
