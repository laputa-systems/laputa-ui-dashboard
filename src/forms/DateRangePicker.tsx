import { createEffect, createMemo, createSignal, createUniqueId, For, onCleanup, Show, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface DateRange {
  readonly start: string;
  readonly end: string;
  readonly comparison?: "previous" | "year" | undefined;
}

export type DateRangeRequestState =
  | { readonly kind: "idle" }
  | { readonly kind: "pending" }
  | { readonly kind: "failed"; readonly message: string };

export interface DateRangePickerProps {
  readonly label: string;
  readonly value: DateRange;
  readonly min?: string | undefined;
  readonly max?: string | undefined;
  readonly today?: string | undefined;
  readonly locale?: string | undefined;
  readonly weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  readonly allowComparison?: boolean | undefined;
  readonly requestState?: DateRangeRequestState | undefined;
  readonly onChange: (range: DateRange) => void;
  readonly class?: string | undefined;
}

function shiftDate(value: string, days: number): string | undefined {
  const date = new Date(0);
  date.setUTCFullYear(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)));
  date.setUTCDate(date.getUTCDate() + days);
  const result = date.toISOString().slice(0, 10);
  return validDate(result) ? result : undefined;
}

function dateObject(value: string): Date {
  const date = new Date(0);
  date.setUTCFullYear(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)));
  return date;
}

function shiftMonth(value: string, offset: number): string | undefined {
  const index = (Number(value.slice(0, 4)) - 1) * 12 + Number(value.slice(5, 7)) - 1 + offset;
  if (index < 0 || index >= 9999 * 12) return undefined;
  return `${String(Math.floor(index / 12) + 1).padStart(4, "0")}-${String(index % 12 + 1).padStart(2, "0")}-01`;
}

function shiftDateMonth(value: string, offset: number): string | undefined {
  const first = shiftMonth(value, offset);
  if (!first) return undefined;
  const following = shiftMonth(first, 1);
  const last = following ? Number(shiftDate(following, -1)!.slice(8, 10)) : 31;
  return `${first.slice(0, 8)}${String(Math.min(Number(value.slice(8, 10)), last)).padStart(2, "0")}`;
}

function validDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= (days[month - 1] ?? 0);
}

function comparisonDates(range: DateRange): DateRange | undefined {
  if (range.comparison === "year") {
    const start = shiftDateMonth(range.start, -12);
    const end = shiftDateMonth(range.end, -12);
    return start && end ? { start, end } : undefined;
  }
  if (range.comparison === "previous") {
    const days = (dateObject(range.end).getTime() - dateObject(range.start).getTime()) / 86_400_000 + 1;
    const start = shiftDate(range.start, -days);
    const end = shiftDate(range.start, -1);
    return start && end ? { start, end } : undefined;
  }
  return undefined;
}

export function dateRangeComparison(range: DateRange): DateRange | null {
  if (!validDate(range.start) || !validDate(range.end) || range.start > range.end) throw new RangeError("Invalid date range value");
  if (range.comparison === undefined) return null;
  if (range.comparison !== "previous" && range.comparison !== "year") throw new RangeError("Invalid date comparison");
  const result = comparisonDates(range);
  if (!result) throw new RangeError("Date comparison is outside the supported range");
  return result;
}

export function DateRangePicker(props: DateRangePickerProps): JSX.Element {
  const id = `ui-date-range-${createUniqueId()}`;
  const [open, setOpen] = createSignal(false);
  const [start, setStart] = createSignal("");
  const [end, setEnd] = createSignal("");
  const [error, setError] = createSignal("");
  const [month, setMonth] = createSignal("0001-01-01");
  const [cursor, setCursor] = createSignal("");
  const [choosingEnd, setChoosingEnd] = createSignal(false);
  const [comparison, setComparison] = createSignal<"previous" | "year" | undefined>();
  const [request, setRequest] = createSignal<DateRange>();
  let trigger: HTMLButtonElement | undefined;
  let dialog: HTMLDialogElement | undefined;
  let startInput: HTMLInputElement | undefined;
  let frame: number | undefined;
  let disposed = false;
  const value = createMemo(() => {
    const { min, max, today, value: range } = props;
    if ((min !== undefined && !validDate(min)) || (max !== undefined && !validDate(max)) || (min !== undefined && max !== undefined && min > max)) throw new RangeError("Invalid date range bounds");
    if (today !== undefined && !validDate(today)) throw new RangeError("Invalid today date");
    if (props.weekStartsOn !== undefined && (!Number.isInteger(props.weekStartsOn) || props.weekStartsOn < 0 || props.weekStartsOn > 6)) throw new RangeError("Invalid first weekday");
    new Intl.DateTimeFormat(props.locale ?? "en-US");
    if (!validDate(range.start) || !validDate(range.end) || range.start > range.end || (min !== undefined && range.start < min) || (max !== undefined && range.end > max)) throw new RangeError("Invalid date range value");
    dateRangeComparison(range);
    return range;
  });
  const close = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    if (dialog?.open) dialog.close();
    setOpen(false);
    if (trigger?.isConnected) trigger.focus();
  };
  const show = () => {
    const range = value();
    setRequest(undefined);
    setStart(range.start);
    setEnd(range.end);
    setError("");
    setMonth(`${range.start.slice(0, 7)}-01`);
    setCursor(range.start);
    setChoosingEnd(false);
    setComparison(range.comparison);
    setOpen(true);
  };
  const present = (element: HTMLDialogElement) => {
    dialog = element;
    const mount = () => {
      if (disposed) return;
      if (!element.isConnected) { frame = requestAnimationFrame(() => { if (untrack(open)) mount(); }); return; }
      if (!element.open) element.showModal();
      startInput?.focus();
    };
    mount();
  };
  const apply = () => {
    const first = start();
    const last = end();
    if (!validDate(first) || !validDate(last)) { setError("Enter both dates in the required format."); return; }
    if ((props.min && (first < props.min || last < props.min)) || (props.max && (first > props.max || last > props.max))) { setError("Dates must be between the allowed bounds."); return; }
    if (first > last) { setError("End date must be on or after start date."); return; }
    const selected = comparison();
    const next: DateRange = selected === undefined ? { start: first, end: last } : { start: first, end: last, comparison: selected };
    if (selected && !comparisonDates(next)) { setError("Comparison is outside the supported date range."); return; }
    setRequest(next);
    props.onChange(next);
  };
  const presetStart = (days: number) => props.today === undefined ? undefined : shiftDate(props.today, 1 - days);
  const presetAvailable = (days: number) => {
    const first = presetStart(days);
    const last = props.today;
    return first !== undefined && last !== undefined && (props.min === undefined || first >= props.min) && (props.max === undefined || last <= props.max);
  };
  const selectPreset = (days: number) => {
    const first = presetStart(days);
    if (!presetAvailable(days) || first === undefined || props.today === undefined) return;
    setStart(first);
    setEnd(props.today);
    setError("");
    setMonth(`${first.slice(0, 7)}-01`);
    setCursor(first);
    setChoosingEnd(false);
    setRequest(undefined);
  };
  const formatter = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(props.locale ?? "en-US", { ...options, calendar: "gregory", timeZone: "UTC" });
  const monthLabel = (date: string) => formatter({ month: "long", year: "numeric" }).format(dateObject(date));
  const dayLabel = (date: string) => formatter({ weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(dateObject(date));
  const weekdays = () => Array.from({ length: 7 }, (_, index) => {
    const day = ((props.weekStartsOn ?? 0) + index) % 7;
    return formatter({ weekday: "short" }).format(dateObject(`2024-01-0${day === 0 ? 7 : day}`));
  });
  const available = (date: string) => (props.min === undefined || date >= props.min) && (props.max === undefined || date <= props.max);
  const months = () => [month(), shiftMonth(month(), 1)].filter((item): item is string => item !== undefined);
  const weeks = (first: string) => {
    const offset = (dateObject(first).getUTCDay() - (props.weekStartsOn ?? 0) + 7) % 7;
    const next = shiftMonth(first, 1);
    const count = next ? Number(shiftDate(next, -1)!.slice(8, 10)) : 31;
    const cells = Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
      const day = index - offset + 1;
      return day > 0 && day <= count ? `${first.slice(0, 8)}${String(day).padStart(2, "0")}` : undefined;
    });
    return Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  };
  const monthAvailable = (candidate: string | undefined) => candidate !== undefined && (props.min === undefined || `${candidate.slice(0, 7)}-31` >= props.min) && (props.max === undefined || candidate <= props.max);
  const moveMonth = (offset: number) => {
    const next = shiftMonth(month(), offset);
    if (!monthAvailable(next) || next === undefined) return;
    setMonth(next);
    const focusDate = props.min && next < props.min ? props.min : next;
    setCursor(focusDate);
  };
  const focusDay = (date: string | undefined) => {
    if (!date || !available(date)) return;
    setCursor(date);
    if (date.slice(0, 7) !== month().slice(0, 7)) setMonth(`${date.slice(0, 7)}-01`);
    queueMicrotask(() => { if (!disposed) dialog?.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)?.focus(); });
  };
  const selectDay = (date: string) => {
    setRequest(undefined);
    if (!choosingEnd()) { setStart(date); setEnd(date); setChoosingEnd(true); }
    else { const first = start(); setStart(date < first ? date : first); setEnd(date < first ? first : date); setChoosingEnd(false); }
    setError("");
  };
  const navigateDay = (event: KeyboardEvent, date: string) => {
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      focusDay(shiftDateMonth(date, (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1)));
      return;
    }
    const weekday = dateObject(date).getUTCDay();
    const startOffset = (weekday - (props.weekStartsOn ?? 0) + 7) % 7;
    const offset = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" ? -7 : event.key === "ArrowDown" ? 7 : event.key === "Home" ? -startOffset : event.key === "End" ? 6 - startOffset : undefined;
    if (offset === undefined) return;
    event.preventDefault();
    focusDay(shiftDate(date, offset));
  };
  const editDate = (part: "start" | "end", date: string) => {
    setRequest(undefined);
    if (part === "start") setStart(date); else setEnd(date);
    setChoosingEnd(false);
    setError("");
    if (validDate(date) && available(date)) { setMonth(`${date.slice(0, 7)}-01`); setCursor(date); }
  };
  const comparisonPreview = () => {
    const first = start();
    const last = end();
    const selected = comparison();
    if (!selected || !validDate(first) || !validDate(last) || first > last) return undefined;
    return comparisonDates({ start: first, end: last, comparison: selected });
  };
  createEffect(() => {
    const pending = request();
    const current = value();
    return pending !== undefined && pending.start === current.start && pending.end === current.end && pending.comparison === current.comparison;
  }, acknowledged => { if (acknowledged && untrack(open)) close(); });
  onCleanup(() => { disposed = true; if (frame !== undefined) cancelAnimationFrame(frame); });
  return <div class={["ui-date-range", props.class].filter(Boolean).join(" ")}>
    <button type="button" class="ui-btn" aria-label={props.label} aria-describedby={`${id}-value`} aria-haspopup="dialog" aria-expanded={open() ? "true" : "false"} aria-controls={`${id}-dialog`} ref={element => { trigger = element; }} onClick={show}>
      <span id={`${id}-value`}>{value().start} – {value().end}<Show when={value().comparison}> ({value().comparison === "previous" ? "previous period" : "previous year"})</Show></span>
    </button>
    <Show when={open()}>
      <dialog id={`${id}-dialog`} class="ui-date-range-dialog" aria-label={props.label} ref={present} onCancel={event => { event.preventDefault(); close(); }}>
        <Show when={props.today !== undefined}>
          <div class="ui-date-range-presets" role="group" aria-label="Date presets">
            <button type="button" class="ui-btn ui-btn-small" disabled={!presetAvailable(1)} onClick={() => selectPreset(1)}>Today</button>
            <button type="button" class="ui-btn ui-btn-small" disabled={!presetAvailable(7)} onClick={() => selectPreset(7)}>Last 7 days</button>
            <button type="button" class="ui-btn ui-btn-small" disabled={!presetAvailable(30)} onClick={() => selectPreset(30)}>Last 30 days</button>
          </div>
        </Show>
        <div class="ui-date-range-calendar">
          <div class="ui-field-hint" role="status">{choosingEnd() ? "Choose an end date." : "Choose a start date."}</div>
          <div class="ui-date-range-month-navigation"><button type="button" class="ui-btn ui-btn-small" disabled={!monthAvailable(shiftMonth(month(), -1))} onClick={() => moveMonth(-1)}>Previous month</button><button type="button" class="ui-btn ui-btn-small" disabled={!monthAvailable(shiftMonth(month(), 1))} onClick={() => moveMonth(1)}>Next month</button></div>
          <div class="ui-date-range-months">
            <For each={months()}>{item => <table class="ui-date-range-month" role="grid" aria-label={monthLabel(item)}>
              <caption>{monthLabel(item)}</caption>
              <thead><tr><For each={weekdays()}>{weekday => <th scope="col">{weekday}</th>}</For></tr></thead>
              <tbody><For each={weeks(item)}>{week => <tr><For each={week}>{day => <td><Show when={day}>{date => <button type="button" data-date={date()} aria-label={dayLabel(date())} aria-pressed={date() >= start() && date() <= end() ? "true" : "false"} aria-current={date() === props.today ? "date" : undefined} disabled={!available(date())} tabindex={date() === cursor() ? 0 : -1} onFocus={() => setCursor(date())} onClick={() => selectDay(date())} onKeyDown={event => navigateDay(event, date())}>{Number(date().slice(8, 10))}</button>}</Show></td>}</For></tr>}</For></tbody>
            </table>}</For>
          </div>
        </div>
        <div class="ui-date-range-fields">
          <label class="ui-field" for={`${id}-start`}><span class="ui-field-label">Start date</span><input id={`${id}-start`} class="ui-text-field" type="date" min={props.min} max={props.max} value={start()} aria-invalid={error() ? "true" : undefined} aria-describedby={error() ? `${id}-error` : undefined} ref={element => { startInput = element; }} onInput={event => editDate("start", event.currentTarget.value)} /></label>
          <label class="ui-field" for={`${id}-end`}><span class="ui-field-label">End date</span><input id={`${id}-end`} class="ui-text-field" type="date" min={props.min} max={props.max} value={end()} aria-invalid={error() ? "true" : undefined} aria-describedby={error() ? `${id}-error` : undefined} onInput={event => editDate("end", event.currentTarget.value)} /></label>
        </div>
        <Show when={props.allowComparison}>
          <label class="ui-field ui-date-range-comparison"><span class="ui-field-label">Compare with</span><select class="ui-text-field" value={comparison() ?? ""} onChange={event => { const selected = event.currentTarget.value; setRequest(undefined); setComparison(selected === "previous" || selected === "year" ? selected : undefined); setError(""); }}><option value="">No comparison</option><option value="previous">Previous period</option><option value="year">Previous year</option></select></label>
          <Show when={comparisonPreview()}>{range => <div class="ui-field-hint">{range().start} – {range().end}</div>}</Show>
        </Show>
        <Show when={error()}><div id={`${id}-error`} role="alert" class="ui-field-error">{error()}</div></Show>
        <Show when={props.requestState?.kind === "pending"}><div role="status" class="ui-field-hint">Applying date range…</div></Show>
        <Show when={props.requestState?.kind === "failed" ? props.requestState.message : undefined}>{message => <div role="alert" class="ui-field-error">{message()}</div>}</Show>
        <div class="ui-date-range-actions"><button type="button" class="ui-btn" onClick={close}>Cancel</button><button type="button" class="ui-btn" disabled={props.requestState?.kind === "pending"} onClick={apply}>Apply</button></div>
      </dialog>
    </Show>
  </div>;
}
