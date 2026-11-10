import { Show } from "solid-js";
import type { JSX } from "@solidjs/web";

export type SortDirection = "ascending" | "descending";

export interface SortableHeaderProps {
  readonly label: string;
  readonly direction?: SortDirection | undefined;
  readonly onSort: () => void;
  readonly indicator?: ((direction: SortDirection) => JSX.Element) | undefined;
  readonly class?: string | undefined;
  readonly buttonClass?: string | undefined;
}

export function SortableHeader(props: SortableHeaderProps): JSX.Element {
  return <th scope="col" class={props.class} aria-sort={props.direction}><button class={["ui-sort-header", props.buttonClass].filter(Boolean).join(" ")} type="button" onClick={() => props.onSort()}>{props.label}<Show when={props.direction} keyed>{direction => props.indicator === undefined ? <span aria-hidden="true">{direction === "ascending" ? "↑" : "↓"}</span> : props.indicator(direction)}</Show></button></th>;
}
