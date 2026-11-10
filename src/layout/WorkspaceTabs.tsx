import { createEffect, createMemo, createSignal, createUniqueId, For, onCleanup, Show } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface WorkspaceTab {
  readonly id: string;
  readonly label: string;
  readonly content: JSX.Element;
  readonly dirty?: boolean | undefined;
  readonly closable?: boolean | undefined;
}

export interface WorkspaceTabsProps {
  readonly label: string;
  readonly tabs: readonly WorkspaceTab[];
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
  readonly onClose?: ((id: string) => void) | undefined;
  readonly returnFocus: () => HTMLElement | null;
  readonly class?: string | undefined;
}

export function WorkspaceTabs(props: WorkspaceTabsProps): JSX.Element {
  const id = `ui-workspace-tabs-${createUniqueId()}`;
  const [focused, setFocused] = createSignal<string>();
  const [within, setWithin] = createSignal(false);
  const [closing, setClosing] = createSignal<{ readonly id: string; readonly origin: HTMLButtonElement }>();
  let root: HTMLElement | undefined;
  let list: HTMLDivElement | undefined;
  let disposed = false;
  let touch: { readonly pointerId: number; readonly x: number; readonly y: number; moved: boolean } | undefined;
  let suppressClick = false;
  const tabs = createMemo(() => {
    if (!props.label.trim()) throw new Error("WorkspaceTabs label must be nonempty");
    if (props.tabs.length > 100) throw new RangeError("WorkspaceTabs supports at most 100 tabs");
    const ids = new Set<string>();
    for (const tab of props.tabs) {
      if (!tab.id || !tab.label.trim() || ids.has(tab.id)) throw new Error("Workspace tab IDs and labels must be nonempty and IDs unique");
      ids.add(tab.id);
    }
    if (props.tabs.length === 0 ? props.selectedId !== null : props.selectedId === null || !ids.has(props.selectedId)) throw new Error("Workspace selectedId must identify an open tab, or be null when empty");
    return props.tabs;
  });
  const selected = () => tabs().find(tab => tab.id === props.selectedId);
  const suffix = (value: string) => Array.from({ length: value.length }, (_, index) => value.charCodeAt(index).toString(16)).join("-");
  const tabId = (value: string) => `${id}-tab-${suffix(value)}`;
  const panelId = (value: string) => `${id}-panel-${suffix(value)}`;
  const roving = () => within() && tabs().some(tab => tab.id === focused()) ? focused() : props.selectedId;
  const choose = (value: string) => { setClosing(undefined); if (value !== props.selectedId) props.onSelect(value); };
  const move = (event: KeyboardEvent) => {
    if (!list || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || event.isComposing) return;
    const items = tabs();
    if (!items.length) return;
    const index = items.findIndex(tab => tab.id === focused());
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowRight" ? (index + 1) % items.length : (index <= 0 ? items.length - 1 : index - 1);
    const target = items[next];
    if (!target) return;
    event.preventDefault();
    setFocused(target.id);
    [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(button => button.dataset.workspaceTabId === target.id)?.focus();
    choose(target.id);
  };
  const close = (origin: HTMLButtonElement) => {
    const tab = selected();
    if (!tab || tab.closable === false || !props.onClose) return;
    origin.focus();
    setClosing({ id: tab.id, origin });
    props.onClose(tab.id);
  };
  createEffect(() => {
    const pending = closing();
    return pending && !tabs().some(tab => tab.id === pending.id) ? pending : undefined;
  }, pending => {
    if (!pending) return;
    queueMicrotask(() => {
      if (disposed || closing() !== pending) return;
      setClosing(undefined);
      if (document.activeElement !== pending.origin && document.activeElement !== document.body) return;
      const tab = [...(list?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])].find(button => button.dataset.workspaceTabId === props.selectedId);
      if (tab) { tab.focus(); return; }
      const target = props.returnFocus();
      if (target?.isConnected && !target.matches(":disabled") && !target.closest("[inert]") && target.getClientRects().length > 0 && getComputedStyle(target).visibility === "visible") target.focus();
      else root?.focus();
    });
  });
  onCleanup(() => { disposed = true; });
  return <section class={["ui-workspace-tabs", props.class].filter(Boolean).join(" ")} aria-label={props.label} tabindex="-1" ref={element => { root = element; }}>
    <Show when={tabs().length > 0} fallback={<p>No open artifacts.</p>}>
      <div class="ui-workspace-tabs-header"><div class="ui-workspace-tablist" role="tablist" aria-label={props.label} ref={element => { list = element; }} onKeyDown={move} onFocusOut={event => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setWithin(false); }} onPointerDown={event => { suppressClick = false; if (event.pointerType === "touch" || event.pointerType === "pen") touch = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false }; }} onPointerMove={event => { if (touch?.pointerId === event.pointerId && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 8) touch.moved = true; }} onPointerUp={event => { if (touch?.pointerId === event.pointerId) { suppressClick = touch.moved; touch = undefined; } }} onPointerCancel={() => { touch = undefined; suppressClick = false; }}>
        <For each={tabs()} keyed={tab => tab.id}>{tab => <button type="button" role="tab" class="ui-workspace-tab" id={tabId(tab().id)} data-workspace-tab-id={tab().id} aria-controls={panelId(tab().id)} aria-selected={props.selectedId === tab().id ? "true" : "false"} tabindex={roving() === tab().id ? 0 : -1} onFocus={() => { setWithin(true); setFocused(tab().id); }} onClick={event => { if (event.detail > 0 && suppressClick) { suppressClick = false; return; } choose(tab().id); }}>{tab().label}{tab().dirty && <span class="ui-workspace-dirty"> Unsaved</span>}</button>}</For>
      </div><Show when={selected()?.closable !== false && props.onClose !== undefined}><button type="button" class="ui-btn ui-btn-small" aria-label={`Close ${selected()?.label ?? ""}`} onClick={event => close(event.currentTarget)}>Close</button></Show></div>
      <For each={tabs()} keyed={tab => tab.id}>{tab => <section role="tabpanel" class="ui-workspace-panel" id={panelId(tab().id)} aria-labelledby={tabId(tab().id)} hidden={props.selectedId !== tab().id} tabindex="0">{tab().content}</section>}</For>
    </Show>
  </section>;
}
