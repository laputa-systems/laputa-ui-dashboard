import { createSignal, createUniqueId } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createAnchoredPopover } from "../internal/anchoredPopover";

export interface PopoverProps {
  readonly label: string;
  readonly trigger: string;
  readonly children: JSX.Element;
  readonly class?: string | undefined;
}

export function Popover(props: PopoverProps): JSX.Element {
  const id = `ui-popover-${createUniqueId()}`;
  const [open, setOpen] = createSignal(false);
  let trigger: HTMLButtonElement | undefined;
  let popup: HTMLDivElement | undefined;
  let openOnPointerDown = false;
  const label = () => {
    if (!props.label.trim() || !props.trigger.trim()) throw new Error("Popover labels must be nonempty");
    return props.label;
  };
  const positioner = createAnchoredPopover(() => trigger, () => popup);
  const close = (restore: boolean) => {
    if (popup?.matches(":popover-open")) popup.hidePopover();
    setOpen(false);
    positioner.stop();
    if (restore && trigger?.isConnected) trigger.focus();
  };
  const show = () => {
    if (!popup) return;
    if (!popup.matches(":popover-open")) popup.showPopover();
    setOpen(true);
    positioner.start();
    const focusable = [...popup.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')].find(element => element.getClientRects().length > 0 && getComputedStyle(element).visibility === "visible" && !element.closest("[inert], [aria-disabled=\"true\"]"));
    (focusable ?? popup).focus();
  };
  return <span class={["ui-popover-anchor", props.class].filter(Boolean).join(" ")}>
    <button type="button" class="ui-btn" aria-expanded={open() ? "true" : "false"} aria-controls={id} aria-haspopup="dialog" ref={element => { trigger = element; }} onPointerDown={event => { if (event.button === 0) openOnPointerDown = popup?.matches(":popover-open") ?? false; }} onClick={event => {
      const wasOpen = event.detail > 0 && openOnPointerDown;
      openOnPointerDown = false;
      if (wasOpen || open()) close(false); else show();
    }}>{props.trigger}</button>
    <div id={id} class="ui-popover ui-generic-popover" role="dialog" aria-label={label()} tabindex="-1" popover="auto" ref={element => { popup = element; }} onToggle={event => { if (event.newState === "closed") { setOpen(false); positioner.stop(); } }} onKeyDown={event => {
      if (event.key === "Escape" && !event.isComposing) { event.preventDefault(); event.stopPropagation(); close(true); }
    }}>{props.children}</div>
  </span>;
}
