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

export interface BreakdownChartProps {
  readonly label: string;
  readonly series: readonly BreakdownSeries[];
  readonly categories: readonly BreakdownCategory[];
  readonly formatValue: (value: number) => string;
  readonly class?: string | undefined;
}

type Bar = { readonly series: BreakdownSeries; readonly value: number; readonly start: number; readonly end: number; readonly index: number };

export function BreakdownChart(props: BreakdownChartProps): JSX.Element {
  let region: HTMLElement | undefined;
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
  const columns = createMemo<readonly DataColumn<BreakdownCategory>[]>(() => [
    { id: "category", label: "Category", rowHeader: true, cell: row => row().label },
    ...props.series.map(series => ({ id: `series:${series.id}`, label: series.label, cell: (row: () => BreakdownCategory) => {
      const value = () => row().values.find(entry => entry.seriesId === series.id)!.value;
      return <span class="ui-breakdown-value" data-active={focused()?.categoryId === row().id && focused()?.seriesId === series.id ? "" : undefined}>{value() === null ? "Unavailable" : format(value()!)}</span>;
    } }))
  ]);
  return <section class={["ui-breakdown", props.class].filter(Boolean).join(" ")} aria-label={props.label} tabindex="-1" ref={element => { region = element; }}>
    <strong>{props.label}</strong>
    <ul class="ui-breakdown-legend"><For each={props.series}>{(series, index) => <li><span class="ui-breakdown-key" style={`background-color:var(--ui-s${index()})`} aria-hidden="true" />{series.label}</li>}</For></ul>
    <Show when={model().rows.length > 0}><div class="ui-breakdown-plot"><For each={model().rowIds}>{id => {
      const row = () => model().rowsById.get(id)!;
      return <div class="ui-breakdown-row"><span>{row().category.label}</span><svg class="ui-breakdown-bars" viewBox="0 0 100 16" preserveAspectRatio="none" role="group" aria-label={`${row().category.label} breakdown`}><line x1={model().position(0)} x2={model().position(0)} y1="0" y2="16" class="ui-breakdown-origin" /><For each={row().bars.map(bar => bar.series.id)}>{seriesId => {
        const bar = () => row().bars.find(item => item.series.id === seriesId)!;
        const start = () => model().position(bar().start);
        const width = () => Math.max(0.6, model().position(bar().end) - start());
        return <rect x={Math.min(start(), 100 - width())} y="2" width={width()} height="12" fill={`var(--ui-s${bar().index})`} tabindex="0" role="img" aria-label={`${row().category.label}, ${bar().series.label}: ${format(bar().value)}`} onFocus={() => setFocused({ categoryId: id, seriesId })} onBlur={() => setFocused(undefined)} />;
      }}</For></svg></div>;
    }}</For></div></Show>
    <DataTable caption={`${props.label} values`} columns={columns()} rows={model().rows.map(row => row.category)} getRowId={row => row.id} />
  </section>;
}
