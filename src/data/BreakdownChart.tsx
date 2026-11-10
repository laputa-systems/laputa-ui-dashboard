import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { DataTable, type DataColumn } from "./DataTable";

export interface BreakdownSeries {
  readonly id: string;
  readonly label: string;
}

export interface BreakdownValue {
  readonly seriesId: string;
  readonly value: number | null;
}

export interface BreakdownCategory {
  readonly id: string;
  readonly label: string;
  readonly values: readonly BreakdownValue[];
}

export interface BreakdownDimensionOption {
  readonly id: string;
  readonly label: string;
}

export interface BreakdownDimension {
  readonly label: string;
  readonly value: string;
  readonly options: readonly BreakdownDimensionOption[];
  readonly onChange?: ((value: string) => void) | undefined;
}

export interface BreakdownDimensions {
  readonly measure: BreakdownDimension;
  readonly category: BreakdownDimension;
  readonly stack: BreakdownDimension;
}

export interface BreakdownSeriesSelection {
  readonly selectedIds: readonly string[];
  readonly onChange?: ((ids: readonly string[]) => void) | undefined;
}

export interface BreakdownChartProps {
  readonly label: string;
  readonly series: readonly BreakdownSeries[];
  readonly categories: readonly BreakdownCategory[];
  readonly formatValue: (value: number) => string;
  readonly dimensions?: BreakdownDimensions | undefined;
  readonly seriesSelection?: BreakdownSeriesSelection | undefined;
  readonly class?: string | undefined;
}

type Bar = { readonly series: BreakdownSeries; readonly value: number; readonly start: number; readonly end: number; readonly index: number };

export function BreakdownChart(props: BreakdownChartProps): JSX.Element {
  let region: HTMLElement | undefined;
  const [interactive, setInteractive] = createSignal(false);
  createEffect(() => true, () => { setInteractive(true); });
  const [focused, setFocused] = createSignal<{ categoryId: string; seriesId: string } | undefined>();
  const model = createMemo(() => {
    if (!props.label.trim()) throw new Error("BreakdownChart label must be nonempty");
    if (props.series.length > 5 || props.categories.length > 40) throw new RangeError("BreakdownChart supports at most 5 series and 40 categories");
    if (props.categories.length && !props.series.length) throw new Error("BreakdownChart categories require series");
    const seriesIds = new Set<string>();
    for (const series of props.series) {
      if (!series.id.trim() || !series.label.trim()) throw new Error("BreakdownChart series IDs and labels must be nonempty");
      if (seriesIds.has(series.id)) throw new Error("BreakdownChart series IDs must be unique");
      seriesIds.add(series.id);
    }
    if (props.dimensions) {
      for (const dimension of [props.dimensions.measure, props.dimensions.category, props.dimensions.stack]) {
        if (!dimension.label.trim()) throw new Error("BreakdownChart dimension labels must be nonempty");
        if (dimension.options.length < 1 || dimension.options.length > 100) throw new RangeError("BreakdownChart dimensions require 1 to 100 options");
        const ids = new Set<string>();
        for (const option of dimension.options) {
          if (!option.id.trim() || !option.label.trim()) throw new Error("BreakdownChart dimension option IDs and labels must be nonempty");
          if (ids.has(option.id)) throw new Error("BreakdownChart dimension option IDs must be unique");
          ids.add(option.id);
        }
        if (!ids.has(dimension.value)) throw new Error("BreakdownChart dimension value must identify an option");
      }
    }
    if (props.seriesSelection) {
      const selected = new Set<string>();
      for (const id of props.seriesSelection.selectedIds) {
        if (!seriesIds.has(id)) throw new Error("BreakdownChart selected ID must identify a series");
        if (selected.has(id)) throw new Error("BreakdownChart selected IDs must be unique");
        selected.add(id);
      }
    }
    const categoryIds = new Set<string>();
    let min = 0;
    let max = 0;
    const rows = props.categories.map(category => {
      if (!category.id.trim() || !category.label.trim()) throw new Error("BreakdownChart category IDs and labels must be nonempty");
      if (categoryIds.has(category.id)) throw new Error("BreakdownChart category IDs must be unique");
      categoryIds.add(category.id);
      const values = new Map<string, number | null>();
      for (const entry of category.values) {
        if (!seriesIds.has(entry.seriesId)) throw new Error("BreakdownChart value references an unknown series");
        if (values.has(entry.seriesId)) throw new Error("BreakdownChart values must have unique series IDs");
        if (entry.value !== null && !Number.isFinite(entry.value)) throw new Error("BreakdownChart values must be finite or null");
        values.set(entry.seriesId, entry.value);
      }
      if (values.size !== props.series.length) throw new Error("BreakdownChart requires a value for every series");
      let positive = 0;
      let negative = 0;
      const bars: Bar[] = [];
      props.series.forEach((series, index) => {
        const value = values.get(series.id)!;
        if (value === null) return;
        const start = value < 0 ? negative + value : positive;
        const end = value < 0 ? negative : positive + value;
        if (!Number.isFinite(start) || !Number.isFinite(end)) throw new RangeError("BreakdownChart stacked totals must be finite");
        if (value < 0) negative = start;
        else positive = end;
        bars.push({ series, value, start, end, index });
      });
      min = Math.min(min, negative);
      max = Math.max(max, positive);
      return { category, bars };
    });
    const magnitude = Math.max(-min, max);
    const lower = magnitude === 0 ? 0 : min / magnitude;
    const span = magnitude === 0 ? 1 : max / magnitude - lower;
    const position = (value: number) => magnitude === 0 ? 50 : ((value / magnitude - lower) / span) * 100;
    return { rows, rowIds: rows.map(row => row.category.id), rowsById: new Map(rows.map(row => [row.category.id, row])), position };
  });
  createEffect(() => {
    const value = focused();
    return value !== undefined && !model().rowsById.get(value.categoryId)?.bars.some(bar => bar.series.id === value.seriesId);
  }, removed => {
    if (!removed) return;
    setFocused(undefined);
    if (document.activeElement === document.body) region?.focus();
  });
  const format = (value: number) => {
    const text = props.formatValue(value);
    if (!text.trim()) throw new Error("BreakdownChart formatted values must be nonempty");
    return text;
  };
  const selected = (id: string) => props.seriesSelection?.selectedIds.includes(id) ?? true;
  const requestSelection = (id: string) => {
    const selection = props.seriesSelection;
    if (!selection?.onChange) return;
    const next = new Set(selection.selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selection.onChange(props.series.filter(series => next.has(series.id)).map(series => series.id));
  };
  const columns = createMemo<readonly DataColumn<BreakdownCategory>[]>(() => [
    { id: "category", label: "Category", rowHeader: true, cell: row => row().label },
    ...props.series.map(series => ({ id: `series:${series.id}`, label: series.label, cell: (row: () => BreakdownCategory) => {
      const value = () => row().values.find(entry => entry.seriesId === series.id)!.value;
      return <span class="ui-breakdown-value" data-active={focused()?.categoryId === row().id && focused()?.seriesId === series.id ? "" : undefined} data-selected={props.seriesSelection && selected(series.id) ? "" : undefined}>{value() === null ? "Unavailable" : format(value()!)}</span>;
    } }))
  ]);
  return <section class={["ui-breakdown", props.class].filter(Boolean).join(" ")} aria-label={props.label} tabindex="-1" ref={element => { region = element; }}>
    <strong>{props.label}</strong>
    <Show when={props.dimensions}><div class="ui-breakdown-dimensions"><For each={["measure", "category", "stack"] as const}>{key => {
      const dimension = () => props.dimensions![key];
      return <label>{dimension().label}<select value={dimension().value} disabled={!interactive() || !dimension().onChange} onChange={event => { dimension().onChange?.(event.currentTarget.value); if (props.dimensions) event.currentTarget.value = props.dimensions[key].value; }}><For each={dimension().options} keyed={option => option.id}>{option => <option value={option().id} defaultSelected={dimension().value === option().id}>{option().label}</option>}</For></select></label>;
    }}</For></div></Show>
    <ul class="ui-breakdown-legend"><For each={props.series} keyed={series => series.id}>{(series, index) => <li><Show when={props.seriesSelection} fallback={<><span class="ui-breakdown-key" style={`background-color:var(--ui-s${index()})`} aria-hidden="true" />{series().label}</>}><button type="button" aria-pressed={selected(series().id) ? "true" : "false"} disabled={!interactive() || !props.seriesSelection?.onChange} onClick={() => requestSelection(series().id)}><span class="ui-breakdown-key" style={`background-color:var(--ui-s${index()})`} aria-hidden="true" />{series().label}</button></Show></li>}</For></ul>
    <Show when={model().rows.length > 0}><div class="ui-breakdown-plot"><For each={model().rowIds}>{id => {
      const row = () => model().rowsById.get(id)!;
      return <div class="ui-breakdown-row"><span>{row().category.label}</span><svg class="ui-breakdown-bars" viewBox="0 0 100 16" preserveAspectRatio="none" role="group" aria-label={`${row().category.label} breakdown`}><line x1={model().position(0)} x2={model().position(0)} y1="0" y2="16" class="ui-breakdown-origin" /><For each={row().bars.map(bar => bar.series.id)}>{seriesId => {
        const bar = () => row().bars.find(item => item.series.id === seriesId)!;
        const start = () => model().position(bar().start);
        const width = () => Math.max(0.6, model().position(bar().end) - start());
        return <rect x={Math.min(start(), 100 - width())} y="2" width={width()} height="12" fill={`var(--ui-s${bar().index})`} data-dimmed={props.seriesSelection && !selected(seriesId) ? "" : undefined} tabindex="0" role="img" aria-label={`${row().category.label}, ${bar().series.label}: ${format(bar().value)}`} onFocus={() => setFocused({ categoryId: id, seriesId })} onBlur={() => setFocused(undefined)} />;
      }}</For></svg></div>;
    }}</For></div></Show>
    <DataTable caption={`${props.label} values`} columns={columns()} rows={model().rows.map(row => row.category)} getRowId={row => row.id} />
  </section>;
}
