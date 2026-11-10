import { createEffect, createMemo, createSignal, createUniqueId, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface SplitPaneProps {
  readonly label: string;
  readonly axis: "horizontal" | "vertical";
  readonly primary: JSX.Element;
  readonly secondary: JSX.Element;
  readonly minSize: number;
  readonly maxSize: number;
  readonly minOtherSize: number;
  readonly defaultSize: number;
  readonly size?: number | undefined;
  readonly onSizeChange?: ((size: number) => void) | undefined;
  readonly class?: string | undefined;
}

export function SplitPane(props: SplitPaneProps): JSX.Element {
  const id = `ui-split-primary-${createUniqueId()}`;
  const initial = untrack(() => props.defaultSize);
  const [local, setLocal] = createSignal(initial);
  const [extent, setExtent] = createSignal<number>();
  const [handleSize, setHandleSize] = createSignal(0);
  let panes: HTMLDivElement | undefined;
  let separator: HTMLDivElement | undefined;
  let frame: number | undefined;
  const limits = createMemo(() => {
    if (!props.label.trim()) throw new Error("SplitPane label must be nonempty");
    if (props.axis !== "horizontal" && props.axis !== "vertical") throw new Error("Invalid SplitPane axis");
    if (![props.minSize, props.maxSize, props.minOtherSize, initial, ...(props.size === undefined ? [] : [props.size])].every(value => Number.isSafeInteger(value) && value >= 0) || props.minSize > props.maxSize || initial < props.minSize || initial > props.maxSize) throw new RangeError("Invalid SplitPane sizes");
    const available = extent();
    const max = available === undefined ? props.maxSize : Math.min(props.maxSize, Math.max(0, available - handleSize() - props.minOtherSize));
    const min = Math.min(props.minSize, max);
    return { min, max };
  });
  const value = createMemo(() => Math.max(limits().min, Math.min(limits().max, props.size ?? local())));
  const disabled = () => props.size !== undefined && props.onSizeChange === undefined;
  const request = (next: number) => {
    if (disabled()) return;
    const bounded = Math.max(limits().min, Math.min(limits().max, next));
    if (bounded === value()) return;
    if (props.size === undefined) setLocal(bounded);
    props.onSizeChange?.(bounded);
  };
  createEffect(() => props.axis, axis => {
    if (!panes || !separator) return;
    const element = panes;
    const handle = separator;
    const measure = () => {
      setExtent(Math.floor(axis === "horizontal" ? element.clientWidth : element.clientHeight));
      setHandleSize(Math.round(axis === "horizontal" ? handle.getBoundingClientRect().width : handle.getBoundingClientRect().height));
    };
    const observer = new ResizeObserver(() => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { frame = undefined; measure(); });
    });
    observer.observe(element);
    measure();
    return () => { observer.disconnect(); if (frame !== undefined) { cancelAnimationFrame(frame); frame = undefined; } };
  });
  return <div class={["ui-split", props.class].filter(Boolean).join(" ")} data-axis={props.axis}>
    <div class="ui-split-controls"><button type="button" class="ui-btn ui-btn-small" aria-label={`Reset ${props.label}`} hidden={extent() === undefined} disabled={disabled()} onClick={() => { separator?.focus(); request(initial); }}>Reset</button></div>
    <div class="ui-split-panes" style={{ "--_ui-split-primary": `${value()}px` }} ref={element => { panes = element; }}>
      <div id={id} class="ui-split-primary">{props.primary}</div>
      <div class="ui-split-separator" role="separator" tabindex={extent() === undefined ? undefined : 0} aria-label={props.label} aria-orientation={props.axis === "horizontal" ? "vertical" : "horizontal"} aria-controls={id} aria-valuemin={limits().min} aria-valuemax={limits().max} aria-valuenow={value()} aria-valuetext={`${value()} pixels`} aria-disabled={disabled() || extent() === undefined ? "true" : undefined} ref={element => { separator = element; }} onKeyDown={event => {
        if (event.isComposing || disabled()) return;
        const horizontal = props.axis === "horizontal";
        const reverse = horizontal && panes !== undefined && getComputedStyle(panes).direction === "rtl";
        const increase = horizontal ? (reverse ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
        const decrease = horizontal ? (reverse ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
        const amount = event.shiftKey ? 50 : 10;
        let next: number;
        if (event.key === "Home") next = limits().min;
        else if (event.key === "End") next = limits().max;
        else if (event.key === increase) next = value() + amount;
        else if (event.key === decrease) next = value() - amount;
        else return;
        event.preventDefault();
        request(next);
      }} />
      <div class="ui-split-secondary">{props.secondary}</div>
    </div>
  </div>;
}
