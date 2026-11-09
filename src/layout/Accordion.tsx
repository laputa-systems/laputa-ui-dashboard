import { createSignal, For, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface AccordionItem {
  readonly id: string;
  readonly label: string;
  readonly children: JSX.Element;
  readonly disabled?: boolean | undefined;
}

export interface AccordionProps {
  readonly id: string;
  readonly items: readonly AccordionItem[];
  readonly openId?: string | null | undefined;
  readonly defaultOpenId?: string | null | undefined;
  readonly onOpenChange?: ((id: string | null) => void) | undefined;
  readonly class?: string | undefined;
}

export function Accordion(props: AccordionProps): JSX.Element {
  const [localOpen, setLocalOpen] = createSignal(untrack(() => props.defaultOpenId ?? null));
  const openId = () => props.openId === undefined ? localOpen() : props.openId;
  const locked = () => props.openId !== undefined && props.onOpenChange === undefined;
  const items = () => {
    const ids = new Set<string>();
    for (const item of props.items) {
      if (ids.has(item.id)) throw new Error(`Duplicate accordion item ID: ${item.id}`);
      ids.add(item.id);
    }
    return props.items;
  };
  const toggle = (event: MouseEvent, item: AccordionItem) => {
    event.preventDefault();
    if (locked() || item.disabled) return;
    const next = openId() === item.id ? null : item.id;
    if (props.openId === undefined) setLocalOpen(next);
    props.onOpenChange?.(next);
  };
  return (
    <div class={["ui-accordion", props.class].filter(Boolean).join(" ")}>
      <For each={items()}>{item => (
        <details class="ui-disclosure" name={props.id} open={openId() === item.id}>
          <summary
            class="ui-disclosure-summary"
            aria-disabled={locked() || item.disabled ? "true" : undefined}
            data-disabled={item.disabled ? "" : undefined}
            onClick={event => toggle(event, item)}
            onKeyDown={event => {
              if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
              const root = event.currentTarget.parentElement?.parentElement;
              const summaries = [...(root?.querySelectorAll<HTMLElement>(":scope > details > summary:not([data-disabled])") ?? [])];
              const index = summaries.indexOf(event.currentTarget);
              if (index < 0 || summaries.length === 0) return;
              event.preventDefault();
              const target = event.key === "Home" ? 0 : event.key === "End" ? summaries.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + summaries.length) % summaries.length;
              summaries[target]?.focus();
            }}
          >{item.label}</summary>
          <div class="ui-disclosure-body">{item.children}</div>
        </details>
      )}</For>
    </div>
  );
}
