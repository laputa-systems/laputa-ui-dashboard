import { createEffect, createMemo, createSignal, For, onCleanup } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface FilterOption {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean | undefined;
}

export interface FilterGroup {
  readonly id: string;
  readonly label: string;
  readonly options: readonly FilterOption[];
}

export interface FilterSelection {
  readonly groupId: string;
  readonly optionId: string;
}

export interface FilterMenuProps {
  readonly label: string;
  readonly groups: readonly FilterGroup[];
  readonly value: readonly FilterSelection[];
  readonly onChange: (selection: readonly FilterSelection[]) => void;
  readonly class?: string | undefined;
}

function selectionKey(selection: FilterSelection): string {
  return JSON.stringify([selection.groupId, selection.optionId]);
}

export function FilterMenu(props: FilterMenuProps): JSX.Element {
  let summary: HTMLElement | undefined;
  let disposed = false;
  const [error, setError] = createSignal("");
  const [removal, setRemoval] = createSignal<{ readonly key: string | null; readonly origin: HTMLElement; readonly next?: HTMLElement | undefined; readonly previous?: HTMLElement | undefined }>();
  const groups = createMemo(() => {
    if (props.groups.length > 50) throw new RangeError("FilterMenu supports at most 50 groups");
    const ids = new Set<string>();
    let count = 0;
    for (const group of props.groups) {
      if (!group.id || ids.has(group.id)) throw new Error("Filter group IDs must be nonempty and unique");
      ids.add(group.id);
      const options = new Set<string>();
      for (const option of group.options) {
        if (!option.id || options.has(option.id)) throw new Error("Filter option IDs must be nonempty and unique within a group");
        options.add(option.id);
        if (++count > 500) throw new RangeError("FilterMenu supports at most 500 options");
      }
    }
    return props.groups;
  });
  const selection = createMemo(() => {
    if (props.value.length > 500) throw new RangeError("FilterMenu supports at most 500 selected options");
    const keys = new Set<string>();
    for (const item of props.value) {
      const key = selectionKey(item);
      if (!item.groupId || !item.optionId || keys.has(key)) throw new Error("Filter selections must have nonempty unique IDs");
      keys.add(key);
    }
    return keys;
  });
  const checked = (groupId: string, optionId: string) => selection().has(selectionKey({ groupId, optionId }));
  const enabled = (group: FilterGroup) => group.options.filter(option => !option.disabled);
  const selectedCount = (group: FilterGroup) => enabled(group).filter(option => checked(group.id, option.id)).length;
  const all = (group: FilterGroup) => enabled(group).length > 0 && selectedCount(group) === enabled(group).length;
  const mixed = (group: FilterGroup) => selectedCount(group) > 0 && !all(group);
  const label = (item: FilterSelection) => {
    const group = groups().find(candidate => candidate.id === item.groupId);
    const option = group?.options.find(candidate => candidate.id === item.optionId);
    return `${group?.label ?? item.groupId}: ${option?.label ?? item.optionId}${!group || !option ? " (unavailable)" : ""}`;
  };
  const toggleOption = (group: FilterGroup, option: FilterOption, input: HTMLInputElement) => {
    setRemoval(undefined);
    const selected = checked(group.id, option.id);
    const next = selected ? props.value.filter(item => item.groupId !== group.id || item.optionId !== option.id) : [...props.value, { groupId: group.id, optionId: option.id }];
    if (next.length > 500) setError("Select at most 500 filters."); else { setError(""); props.onChange(next); }
    input.checked = checked(group.id, option.id);
  };
  const toggleGroup = (group: FilterGroup, input: HTMLInputElement) => {
    setRemoval(undefined);
    const available = enabled(group);
    const ids = new Set(available.map(option => option.id));
    const retained = props.value.filter(item => item.groupId !== group.id || !ids.has(item.optionId));
    const next = all(group) ? retained : [...retained, ...available.map(option => ({ groupId: group.id, optionId: option.id }))];
    if (next.length > 500) setError("Select at most 500 filters."); else { setError(""); props.onChange(next); }
    input.checked = all(group);
    input.indeterminate = mixed(group);
  };
  const remove = (key: string | null, origin: HTMLButtonElement) => {
    setError("");
    origin.focus();
    const buttons = [...(origin.closest("ul")?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
    const index = buttons.indexOf(origin);
    setRemoval({ key, origin, next: buttons[index + 1], previous: buttons[index - 1] });
    props.onChange(key === null ? [] : props.value.filter(item => selectionKey(item) !== key));
  };
  createEffect(() => {
    const pending = removal();
    const keys = selection();
    return pending && (pending.key === null ? keys.size === 0 : !keys.has(pending.key)) ? pending : undefined;
  }, pending => {
    if (!pending) return;
    queueMicrotask(() => {
      if (disposed || removal() !== pending) return;
      setRemoval(undefined);
      if (document.activeElement !== pending.origin && document.activeElement !== document.body) return;
      const target = pending.next?.isConnected ? pending.next : pending.previous?.isConnected ? pending.previous : summary;
      target?.focus();
    });
  });
  onCleanup(() => { disposed = true; });
  return <div class={["ui-filter-menu", props.class].filter(Boolean).join(" ")}>
    <details class="ui-filter-disclosure" onKeyDown={event => { if (event.key === "Escape" && event.currentTarget.open) { event.preventDefault(); event.stopPropagation(); event.currentTarget.open = false; summary?.focus(); } }}>
      <summary class="ui-btn" ref={element => { summary = element; }}>{props.label}</summary>
      <div class="ui-filter-groups"><For each={groups()} keyed={group => group.id}>{group => <details class="ui-filter-group" open>
        <summary>{group().label}</summary>
        <fieldset><legend class="ui-sr-only">{group().label}</legend>
          <label><input type="checkbox" checked={all(group())} prop:indeterminate={mixed(group())} aria-checked={mixed(group()) ? "mixed" : undefined} disabled={enabled(group()).length === 0} onChange={event => toggleGroup(group(), event.currentTarget)} /> All {group().label}</label>
          <For each={group().options} keyed={option => option.id}>{option => <label><input type="checkbox" checked={checked(group().id, option().id)} disabled={option().disabled} onChange={event => toggleOption(group(), option(), event.currentTarget)} /> {option().label}</label>}</For>
        </fieldset>
      </details>}</For></div>
    </details>
    <ul class="ui-filter-chips" aria-label="Selected filters" onKeyDown={event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (index < 0) return;
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : event.key === "ArrowRight" ? (index + 1) % buttons.length : (index - 1 + buttons.length) % buttons.length;
      event.preventDefault();
      buttons[next]?.focus();
    }}><For each={props.value} keyed={selectionKey}>{item => <li><button type="button" class="ui-filter-chip" aria-label={`Remove ${label(item())}`} onClick={event => remove(selectionKey(item()), event.currentTarget)}>{label(item())} <span aria-hidden="true">×</span></button></li>}</For></ul>
    <button type="button" class="ui-btn ui-btn-small" disabled={selection().size === 0} onClick={event => remove(null, event.currentTarget)}>Clear all</button>
    {error() && <span role="alert" class="ui-filter-error">{error()}</span>}
  </div>;
}
