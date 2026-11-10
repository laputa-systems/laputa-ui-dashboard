export interface ComboboxOption {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean | undefined;
}

export interface ComboboxGroup {
  readonly id: string;
  readonly label: string;
  readonly options: readonly ComboboxOption[];
}

export type ComboboxEntry = ComboboxOption | ComboboxGroup;

export function validatedComboboxOptions(entries: readonly ComboboxEntry[]): readonly ComboboxOption[] {
  const ids = new Set<string>();
  const groupIds = new Set<string>();
  const result: ComboboxOption[] = [];
  for (const entry of entries) {
    const grouped = "options" in entry;
    if (grouped && groupIds.has(entry.id)) throw new Error(`Duplicate combobox group ID: ${entry.id}`);
    if (grouped) groupIds.add(entry.id);
    for (const option of grouped ? entry.options : [entry]) {
      if (ids.has(option.id)) throw new Error(`Duplicate combobox option ID: ${option.id}`);
      ids.add(option.id);
      result.push(option);
      if (result.length > 500) throw new RangeError("Combobox supports at most 500 options");
    }
  }
  return result;
}
