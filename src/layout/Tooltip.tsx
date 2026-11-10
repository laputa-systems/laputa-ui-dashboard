import { createUniqueId, onCleanup } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createAnchoredPopover } from "../internal/anchoredPopover";

export interface TooltipProps {
  readonly label: string;
  readonly content: string;
  readonly children: JSX.Element;
  readonly class?: string | undefined;
}

export function Tooltip(props: TooltipProps): JSX.Element {
  const id = `ui-tooltip-${createUniqueId()}`;
  let trigger: HTMLButtonElement | undefined;
  let tooltip: HTMLDivElement | undefined;
  let focused = false;
  let hovering = false;
  let dismissed = false;
  let pointerType = "";
  let openOnPointerDown = false;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  const content = () => {
    if (!props.label.trim() || !props.content.trim()) throw new Error("Tooltip label and content must be nonempty");
    return props.content;
  };
  const positioner = createAnchoredPopover(() => trigger, () => tooltip);
  const cancelHide = () => { if (hideTimer !== undefined) { clearTimeout(hideTimer); hideTimer = undefined; } };
  const close = () => {
    cancelHide();
    if (tooltip?.matches(":popover-open")) tooltip.hidePopover();
    positioner.stop();
  };
  const show = () => {
    cancelHide();
    if (!tooltip || dismissed) return;
    if (!tooltip.matches(":popover-open")) tooltip.showPopover();
    positioner.start();
  };
  const leave = () => {
    cancelHide();
    hideTimer = setTimeout(() => { hideTimer = undefined; if (!focused && !hovering) { close(); dismissed = false; } }, 150);
  };
  onCleanup(cancelHide);
  return <span class={["ui-tooltip-anchor", props.class].filter(Boolean).join(" ")} onPointerEnter={event => { if (event.pointerType !== "touch") { hovering = true; show(); } }} onPointerLeave={event => { if (event.pointerType !== "touch") { hovering = false; if (!focused) dismissed = false; leave(); } }}>
    <button type="button" class="ui-btn" aria-label={props.label} aria-describedby={id} ref={element => { trigger = element; }} onFocus={() => { focused = true; show(); }} onBlur={() => { focused = false; if (!hovering) dismissed = false; leave(); }} onPointerDown={event => { pointerType = event.pointerType; openOnPointerDown = tooltip?.matches(":popover-open") ?? false; }} onClick={event => {
      if (event.detail === 0 || pointerType === "touch") {
        if ((event.detail === 0 && tooltip?.matches(":popover-open")) || (pointerType === "touch" && openOnPointerDown)) { dismissed = true; close(); }
        else { dismissed = false; show(); }
      }
      pointerType = "";
    }} onKeyDown={event => { if (event.key === "Escape" && tooltip?.matches(":popover-open")) { event.preventDefault(); event.stopPropagation(); dismissed = true; close(); } }}>{props.children}</button>
    <div id={id} class="ui-popover ui-tooltip" role="tooltip" popover="auto" ref={element => { tooltip = element; }} onToggle={event => { if (event.newState === "closed") { positioner.stop(); if (focused || hovering) dismissed = true; } }} onPointerEnter={event => { if (event.pointerType !== "touch") { hovering = true; cancelHide(); } }} onPointerLeave={event => { if (event.pointerType !== "touch") { hovering = false; if (!focused) dismissed = false; leave(); } }}><span class="ui-tooltip-content">{content()}</span></div>
  </span>;
}
