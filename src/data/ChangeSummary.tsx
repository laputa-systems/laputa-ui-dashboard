import { createMemo, For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";

export type ChangeSummaryChange =
  | { readonly kind: "known"; readonly amount: string; readonly direction: "increase" | "decrease"; readonly interpretation: "good" | "bad" | "neutral" }
  | { readonly kind: "known"; readonly direction: "unchanged"; readonly interpretation: "good" | "bad" | "neutral" }
  | { readonly kind: "unavailable"; readonly message: string };

export interface ChangeSummaryItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly change: ChangeSummaryChange;
}

export interface ChangeSummaryProps {
  readonly label: string;
  readonly period: string;
  readonly items: readonly ChangeSummaryItem[];
  readonly class?: string | undefined;
}

const directions = { increase: "Increased", decrease: "Decreased", unchanged: "Unchanged" } as const;
const interpretations = { good: "Good", bad: "Bad", neutral: "Neutral" } as const;

export function ChangeSummary(props: ChangeSummaryProps): JSX.Element {
  const items = createMemo(() => {
    if (!props.label.trim() || !props.period.trim()) throw new Error("ChangeSummary label and period must be nonempty");
    if (props.items.length > 50) throw new RangeError("ChangeSummary supports at most 50 items");
    const ids = new Set<string>();
    for (const item of props.items) {
      if (!item.id.trim() || !item.label.trim() || !item.value.trim()) throw new Error("ChangeSummary IDs, labels and values must be nonempty");
      if (ids.has(item.id)) throw new Error("ChangeSummary item IDs must be unique");
      ids.add(item.id);
      if (item.change.kind === "known") {
        if (!Object.hasOwn(directions, item.change.direction) || !Object.hasOwn(interpretations, item.change.interpretation)) throw new Error("Invalid ChangeSummary direction or interpretation");
        if (item.change.direction !== "unchanged" && !item.change.amount.trim()) throw new Error("ChangeSummary change amount must be nonempty");
      } else if (item.change.kind === "unavailable") {
        if (!item.change.message.trim()) throw new Error("ChangeSummary unavailable message must be nonempty");
      } else throw new Error("Invalid ChangeSummary change kind");
    }
    return props.items;
  });
  return <section class={["ui-change-summary", props.class].filter(Boolean).join(" ")} aria-label={props.label}><strong>{props.label}</strong><div class="ui-change-summary-period">{props.period}</div><Show when={items().length > 0} fallback={<p>No data.</p>}><dl class="ui-change-summary-list"><For each={items()}>{item => <div class="ui-change-summary-item"><dt>{item.label}</dt><dd><span>{item.value}</span><Show when={item.change.kind === "known"} fallback={<span class="ui-change-summary-unavailable">{item.change.kind === "unavailable" ? item.change.message : ""}</span>}><span class="ui-change-summary-change" data-interpretation={item.change.kind === "known" ? item.change.interpretation : undefined}>{item.change.kind === "known" ? `${directions[item.change.direction]}${item.change.direction === "unchanged" ? "" : ` ${item.change.amount}`} · ${interpretations[item.change.interpretation]}` : ""}</span></Show></dd></div>}</For></dl></Show></section>;
}
