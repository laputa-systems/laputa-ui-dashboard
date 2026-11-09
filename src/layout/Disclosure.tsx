import { createSignal, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface DisclosureProps {
  readonly label: string;
  readonly children: JSX.Element;
  readonly open?: boolean | undefined;
  readonly defaultOpen?: boolean | undefined;
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  readonly class?: string | undefined;
}

export function Disclosure(props: DisclosureProps): JSX.Element {
  const [localOpen, setLocalOpen] = createSignal(untrack(() => props.defaultOpen ?? false));
  const open = () => props.open ?? localOpen();
  const locked = () => props.open !== undefined && props.onOpenChange === undefined;
  const toggle = (event: MouseEvent) => {
    event.preventDefault();
    if (locked()) return;
    const next = !open();
    if (props.open === undefined) setLocalOpen(next);
    props.onOpenChange?.(next);
  };
  return (
    <details class={["ui-disclosure", props.class].filter(Boolean).join(" ")} open={open()}>
      <summary class="ui-disclosure-summary" aria-disabled={locked() ? "true" : undefined} onClick={toggle}>{props.label}</summary>
      <div class="ui-disclosure-body">{props.children}</div>
    </details>
  );
}
