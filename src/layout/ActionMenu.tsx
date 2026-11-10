import { createEffect, createSignal, createUniqueId, For, onCleanup, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createAnchoredPopover } from "../internal/anchoredPopover";

export interface ActionMenuItem {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean | undefined;
}

export interface ActionMenuProps {
  readonly label: string;
  readonly items: readonly ActionMenuItem[];
  readonly onSelect: (id: string) => void;
  readonly class?: string | undefined;
}

export function ActionMenu(props: ActionMenuProps): JSX.Element {
  const id = `ui-action-menu-${createUniqueId()}`;
  const [open, setOpen] = createSignal(false);
  let trigger: HTMLButtonElement | undefined;
  let menu: HTMLDivElement | undefined;
  let disposed = false;
  let openOnPointerDown = false;
  const items = () => {
    const ids = new Set<string>();
    for (const item of props.items) {
      if (ids.has(item.id)) throw new Error(`Duplicate action menu item ID: ${item.id}`);
      ids.add(item.id);
    }
    return props.items;
  };
  const enabled = () => props.items.some(item => !item.disabled);
  const buttons = () => [...(menu?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [])];
  const positioner = createAnchoredPopover(() => trigger, () => menu);
  const close = (restore: boolean) => {
    if (menu?.matches(":popover-open")) menu.hidePopover();
    setOpen(false);
    positioner.stop();
    if (restore && trigger?.isConnected) trigger.focus();
  };
  const show = (last = false) => {
    if (menu === undefined || !enabled()) return;
    if (!menu.matches(":popover-open")) menu.showPopover();
    setOpen(true);
    positioner.start();
    const choices = buttons();
    choices[last ? choices.length - 1 : 0]?.focus();
  };
  createEffect(enabled, hasActions => {
    if (!hasActions && untrack(open)) close(true);
  });
  onCleanup(() => { disposed = true; });
  return (
    <span class={["ui-action-menu", props.class].filter(Boolean).join(" ")}>
      <button
        class="ui-btn"
        type="button"
        id={`${id}-trigger`}
        aria-haspopup="menu"
        aria-expanded={open() ? "true" : "false"}
        aria-controls={id}
        aria-disabled={enabled() ? undefined : "true"}
        ref={element => { trigger = element; }}
        onPointerDown={event => { if (event.button === 0) openOnPointerDown = menu?.matches(":popover-open") ?? false; }}
        onClick={event => {
          const wasOpen = event.detail > 0 && openOnPointerDown;
          openOnPointerDown = false;
          if (wasOpen || open()) close(false); else show();
        }}
        onKeyDown={event => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          show(event.key === "ArrowUp");
        }}
      >{props.label}</button>
      <div
        class="ui-popover ui-action-menu-popup"
        id={id}
        role="menu"
        aria-labelledby={`${id}-trigger`}
        popover="auto"
        ref={element => { menu = element; }}
        onToggle={event => { if (event.newState === "closed") { setOpen(false); positioner.stop(); } }}
        onFocusOut={event => {
          const next = event.relatedTarget;
          if (next instanceof Node && menu?.contains(next)) return;
          queueMicrotask(() => {
            if (!disposed && open() && menu !== undefined && !menu.contains(document.activeElement)) close(!enabled());
          });
        }}
        onKeyDown={event => {
          if (event.isComposing) return;
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            close(true);
            return;
          }
          const choices = buttons();
          const index = choices.indexOf(document.activeElement as HTMLButtonElement);
          if (choices.length === 0 || index < 0) return;
          let target = -1;
          if (event.key === "Home") target = 0;
          else if (event.key === "End") target = choices.length - 1;
          else if (event.key === "ArrowDown") target = (index + 1) % choices.length;
          else if (event.key === "ArrowUp") target = (index - 1 + choices.length) % choices.length;
          else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
            const key = event.key.toLocaleLowerCase();
            for (let offset = 1; offset <= choices.length; offset++) {
              const candidate = (index + offset) % choices.length;
              if (choices[candidate]?.textContent?.trim().toLocaleLowerCase().startsWith(key)) { target = candidate; break; }
            }
          }
          if (target >= 0) { event.preventDefault(); choices[target]?.focus(); }
        }}
      >
        <For each={items()}>{item => <button type="button" role="menuitem" class="ui-action-menu-item" tabindex="-1" disabled={item.disabled} onClick={() => { close(true); props.onSelect(item.id); }}>{item.label}</button>}</For>
      </div>
    </span>
  );
}
