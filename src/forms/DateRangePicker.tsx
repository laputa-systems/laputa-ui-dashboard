import { createMemo, createSignal, createUniqueId, onCleanup, Show, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface DateRange {
  readonly start: string;
  readonly end: string;
}

export interface DateRangePickerProps {
  readonly label: string;
  readonly value: DateRange;
  readonly min?: string | undefined;
  readonly max?: string | undefined;
  readonly onChange: (range: DateRange) => void;
  readonly class?: string | undefined;
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

export function DateRangePicker(props: DateRangePickerProps): JSX.Element {
  const id = `ui-date-range-${createUniqueId()}`;
  const [open, setOpen] = createSignal(false);
  const [start, setStart] = createSignal("");
  const [end, setEnd] = createSignal("");
  const [error, setError] = createSignal("");
  let trigger: HTMLButtonElement | undefined;
  let dialog: HTMLDialogElement | undefined;
  let startInput: HTMLInputElement | undefined;
  let frame: number | undefined;
  let disposed = false;
  const value = createMemo(() => {
    const { min, max, value: range } = props;
    if ((min !== undefined && !validDate(min)) || (max !== undefined && !validDate(max)) || (min !== undefined && max !== undefined && min > max)) throw new RangeError("Invalid date range bounds");
    if (!validDate(range.start) || !validDate(range.end) || range.start > range.end || (min !== undefined && range.start < min) || (max !== undefined && range.end > max)) throw new RangeError("Invalid date range value");
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
    setStart(range.start);
    setEnd(range.end);
    setError("");
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
    close();
    props.onChange({ start: first, end: last });
  };
  onCleanup(() => { disposed = true; if (frame !== undefined) cancelAnimationFrame(frame); });
  return <div class={["ui-date-range", props.class].filter(Boolean).join(" ")}>
    <button type="button" class="ui-btn" aria-label={props.label} aria-describedby={`${id}-value`} aria-haspopup="dialog" aria-expanded={open() ? "true" : "false"} aria-controls={`${id}-dialog`} ref={element => { trigger = element; }} onClick={show}>
      <span id={`${id}-value`}>{value().start} – {value().end}</span>
    </button>
    <Show when={open()}>
      <dialog id={`${id}-dialog`} class="ui-date-range-dialog" aria-label={props.label} ref={present} onCancel={event => { event.preventDefault(); close(); }}>
        <div class="ui-date-range-fields">
          <label class="ui-field" for={`${id}-start`}><span class="ui-field-label">Start date</span><input id={`${id}-start`} class="ui-text-field" type="date" min={props.min} max={props.max} value={start()} aria-invalid={error() ? "true" : undefined} aria-describedby={error() ? `${id}-error` : undefined} ref={element => { startInput = element; }} onInput={event => { setStart(event.currentTarget.value); setError(""); }} /></label>
          <label class="ui-field" for={`${id}-end`}><span class="ui-field-label">End date</span><input id={`${id}-end`} class="ui-text-field" type="date" min={props.min} max={props.max} value={end()} aria-invalid={error() ? "true" : undefined} aria-describedby={error() ? `${id}-error` : undefined} onInput={event => { setEnd(event.currentTarget.value); setError(""); }} /></label>
        </div>
        <Show when={error()}><div id={`${id}-error`} role="alert" class="ui-field-error">{error()}</div></Show>
        <div class="ui-date-range-actions"><button type="button" class="ui-btn" onClick={close}>Cancel</button><button type="button" class="ui-btn" onClick={apply}>Apply</button></div>
      </dialog>
    </Show>
  </div>;
}
