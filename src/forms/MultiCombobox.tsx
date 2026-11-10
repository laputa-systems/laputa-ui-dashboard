import { createMemo, For, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Combobox } from "./Combobox";
import { validatedComboboxOptions, type ComboboxEntry } from "./comboboxOptions";

export interface MultiComboboxProps {
  readonly id: string;
  readonly label: string;
  readonly options: readonly ComboboxEntry[];
  readonly value: readonly string[];
  readonly onChange: (ids: readonly string[]) => void;
  readonly name?: string | undefined;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly class?: string | undefined;
}

export function MultiCombobox(props: MultiComboboxProps): JSX.Element {
  let container: HTMLDivElement | undefined;
  const options = createMemo(() => new Map(validatedComboboxOptions(props.options).map(option => [option.id, option])));
  const selected = createMemo(() => {
    const ids = new Set<string>();
    if (props.value.length > 500) throw new RangeError("MultiCombobox supports at most 500 selections");
    return props.value.map(id => {
      if (ids.has(id)) throw new Error(`Duplicate selected combobox ID: ${id}`);
      ids.add(id);
      const option = options().get(id);
      return { id, label: option?.label, missing: option === undefined };
    });
  });
  const available = createMemo(() => {
    const chosen = new Set(selected().map(item => item.id));
    return props.options.flatMap(entry => {
      if ("options" in entry) return [{ ...entry, options: entry.options.filter(option => !chosen.has(option.id)) }];
      return chosen.has(entry.id) ? [] : [entry];
    });
  });
  const input = () => container?.querySelector<HTMLInputElement>('input[role="combobox"]') ?? undefined;
  const chips = () => [...(container?.querySelectorAll<HTMLButtonElement>(".ui-multi-chip-remove:not(:disabled)") ?? [])];
  const remove = (id: string) => {
    input()?.focus();
    props.onChange(props.value.filter(value => value !== id));
  };
  const add = (id: string | null) => {
    if (id !== null && !props.value.includes(id)) props.onChange([...props.value, id]);
  };
  return (
    <div
      class={["ui-multi-combobox", props.class].filter(Boolean).join(" ")}
      ref={element => { container = element; }}
      onKeyDown={event => {
        if (event.isComposing) return;
        const target = event.target;
        const text = input();
        const choices = chips();
        if (target === text && text !== undefined && choices.length > 0 && text.selectionStart === 0 && text.selectionEnd === 0 && (event.key === "ArrowLeft" || (event.key === "Backspace" && text.value === ""))) {
          event.preventDefault();
          choices[choices.length - 1]?.focus();
          return;
        }
        const index = choices.findIndex(choice => choice === target);
        if (index < 0) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          if (event.key === "ArrowRight" && index === choices.length - 1) text?.focus();
          else choices[Math.max(0, index + (event.key === "ArrowLeft" ? -1 : 1))]?.focus();
        }
      }}
    >
      <ul class="ui-multi-values" aria-label={`${props.label} selected`}>
        <For each={selected()} keyed={item => item.id}>{item => (
          <li class="ui-multi-chip">
            <span>{item().missing ? `Unavailable: ${item().id}` : item().label}</span>
            <button
              type="button"
              class="ui-multi-chip-remove"
              aria-label={item().missing ? `Remove unavailable ${item().id} from ${props.label}` : `Remove ${item().label} (${item().id}) from ${props.label}`}
              disabled={props.disabled}
              onClick={() => remove(untrack(item).id)}
              onKeyDown={event => { if (event.key === "Backspace" || event.key === "Delete") { event.preventDefault(); remove(untrack(item).id); } }}
            >×</button>
          </li>
        )}</For>
      </ul>
      <span class="ui-sr-only" role="status">{selected().length} selected</span>
      <Combobox id={props.id} label={props.label} options={available()} value={null} onChange={add} hint={[props.hint, "Press Left Arrow at the start to review selections."].filter(Boolean).join(" ")} error={props.error} disabled={props.disabled} />
      {props.name ? <For each={props.value}>{id => <input type="hidden" name={props.name} value={id} disabled={props.disabled} />}</For> : null}
    </div>
  );
}
