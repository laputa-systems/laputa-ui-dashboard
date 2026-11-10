import { createEffect, createMemo, createSignal, createUniqueId, Show } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface WorkbenchPane {
  readonly label: string;
  readonly content: JSX.Element;
}

export interface WorkbenchProps {
  readonly navigation: JSX.Element;
  readonly secondaryNavigation?: JSX.Element | undefined;
  readonly workspace?: (WorkbenchPane & { readonly drawer?: boolean | undefined }) | undefined;
  readonly diagnostics?: WorkbenchPane | undefined;
  readonly appearance?: "flat" | "inset" | undefined;
  readonly navigationDrawer?: { readonly label: string } | undefined;
  readonly class?: string | undefined;
  readonly children: JSX.Element;
}

function createWorkbenchDrawer(enabled: () => boolean, present: () => boolean, container: () => HTMLDivElement | undefined, grid: () => HTMLDivElement | undefined, fallback: () => HTMLElement | undefined) {
  const id = `ui-workbench-drawer-${createUniqueId()}`;
  const [open, setOpen] = createSignal(false);
  const [ready, setReady] = createSignal(false);
  const [narrow, setNarrow] = createSignal(false);
  const active = createMemo(enabled);
  const exists = createMemo(present);
  const refs: { content?: HTMLElement; modal?: HTMLDialogElement; opener?: HTMLButtonElement; closer?: HTMLButtonElement } = {};
  let enabledSnapshot = false;
  let presentSnapshot = false;
  const firstControl = (element: HTMLElement) => [...element.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])')].find(control => control.getClientRects().length > 0 && getComputedStyle(control).visibility === "visible" && !control.closest('[inert], [aria-disabled="true"]'));
  const close = () => {
    if (refs.modal?.open) refs.modal.close();
    setOpen(false);
    if (refs.opener?.isConnected) refs.opener.focus();
  };
  const show = () => {
    if (refs.modal && !refs.modal.open) { refs.modal.showModal(); setOpen(true); refs.closer?.focus(); }
  };
  const closed = () => { if (refs.modal?.isConnected) setOpen(refs.modal.open); };
  createEffect(() => { enabledSnapshot = active(); presentSnapshot = exists(); return enabledSnapshot; }, isEnabled => {
    if (!isEnabled || !container() || !grid() || !refs.content || !refs.modal) return;
    const host = container()!;
    const parent = grid()!;
    const contents = refs.content;
    const modal = refs.modal;
    let current: boolean | undefined;
    let hadFocus = false;
    let openerHadFocus = false;
    const openerFocusIn = () => { openerHadFocus = true; };
    const openerFocusOut = (event: FocusEvent) => { if (event.relatedTarget instanceof Node) openerHadFocus = false; };
    refs.opener?.addEventListener("focusin", openerFocusIn);
    refs.opener?.addEventListener("focusout", openerFocusOut);
    const focusIn = () => { hadFocus = true; };
    const focusOut = (event: FocusEvent) => { if (event.relatedTarget instanceof Node && !contents.contains(event.relatedTarget)) hadFocus = false; };
    contents.addEventListener("focusin", focusIn);
    contents.addEventListener("focusout", focusOut);
    const resize = () => {
      const state = getComputedStyle(parent).getPropertyValue("--_ui-workbench-narrow").trim();
      if (state !== "0" && state !== "1") throw new Error("Workbench layout stylesheet is required for drawers");
      const next = state === "1";
      if (next === current) return;
      current = next;
      const focused = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
      const inside = focused !== undefined && contents.contains(focused);
      const closingControl = focused === refs.closer;
      if (next) {
        modal.appendChild(contents);
        setNarrow(true);
        setReady(true);
        if (inside) { modal.showModal(); setOpen(true); focused?.focus(); }
      } else {
        if (modal.open) modal.close();
        setOpen(false);
        parent.insertBefore(contents, modal);
        setNarrow(false);
        setReady(true);
        if (inside) focused?.focus();
        else if (closingControl) (firstControl(contents) ?? fallback())?.focus();
      }
    };
    let frame: number | undefined;
    const observer = new ResizeObserver(entries => {
      if (!entries.length) return;
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { frame = undefined; resize(); });
    });
    observer.observe(host);
    resize();
    return () => {
      observer.disconnect();
      refs.opener?.removeEventListener("focusin", openerFocusIn);
      refs.opener?.removeEventListener("focusout", openerFocusOut);
      contents.removeEventListener("focusin", focusIn);
      contents.removeEventListener("focusout", focusOut);
      if (frame !== undefined) cancelAnimationFrame(frame);
      const focused = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
      const inside = focused !== undefined && contents.contains(focused);
      if (modal.open) modal.close();
      if (parent.isConnected && modal.parentNode === parent && presentSnapshot) parent.insertBefore(contents, modal);
      if (parent.isConnected && !enabledSnapshot) {
        const lostOpener = focused === refs.opener || (focused === document.body && openerHadFocus);
        if (!presentSnapshot && (inside || focused === refs.closer || lostOpener || (focused === document.body && hadFocus))) fallback()?.focus();
        else if (inside) focused?.focus();
        else if (focused === refs.closer || lostOpener) (firstControl(contents) ?? fallback())?.focus();
      }
    };
  });
  return { id, refs, open, ready, narrow, active, close, show, closed };
}

export function Workbench(props: WorkbenchProps): JSX.Element {
  let container: HTMLDivElement | undefined;
  let grid: HTMLDivElement | undefined;
  let main: HTMLElement | undefined;
  const navigation = createWorkbenchDrawer(() => props.navigationDrawer !== undefined, () => true, () => container, () => grid, () => main);
  const workspace = createWorkbenchDrawer(() => props.workspace?.drawer === true, () => props.workspace !== undefined, () => container, () => grid, () => main);
  const drawerLabel = () => {
    const label = props.navigationDrawer?.label;
    if (label !== undefined && !label.trim()) throw new Error("Workbench drawer label must be nonempty");
    return label;
  };
  const paneLabel = (pane: WorkbenchPane) => {
    if (!pane.label.trim()) throw new Error("Workbench pane labels must be nonempty");
    return pane.label;
  };
  return <div class={["ui-workbench-container", props.class].filter(Boolean).join(" ")} ref={element => { container = element; }}>
    <div class="ui-workbench" data-secondary={props.secondaryNavigation !== undefined ? "" : undefined} data-workspace={props.workspace !== undefined ? "" : undefined} data-appearance={props.appearance ?? "flat"} ref={element => { grid = element; }}>
      <button type="button" class="ui-btn ui-workbench-open" hidden={!navigation.active() || !navigation.ready() || !navigation.narrow()} aria-haspopup="dialog" aria-controls={navigation.id} aria-expanded={navigation.open() ? "true" : "false"} ref={element => { navigation.refs.opener = element; }} onClick={navigation.show}>Open {drawerLabel()}</button>
      <div class="ui-workbench-navigation-group" ref={element => { navigation.refs.content = element; }}><div class="ui-workbench-navigation">{props.navigation}</div>
        <Show when={props.secondaryNavigation !== undefined}><div class="ui-workbench-secondary">{props.secondaryNavigation}</div></Show>
      </div>
      <dialog id={navigation.id} class="ui-workbench-drawer" aria-label={drawerLabel()} onClose={navigation.closed} ref={element => { navigation.refs.modal = element; }} onCancel={event => { event.preventDefault(); navigation.close(); }} onClick={event => { if (event.target === event.currentTarget) navigation.close(); }}><button type="button" class="ui-btn" ref={element => { navigation.refs.closer = element; }} onClick={navigation.close}>Close {drawerLabel()}</button></dialog>
      <main class="ui-workbench-main" tabindex="-1" ref={element => { main = element; }}>{props.children}</main>
      <button type="button" class="ui-btn ui-workbench-workspace-open" hidden={!workspace.active() || !workspace.ready() || !workspace.narrow()} aria-haspopup="dialog" aria-controls={workspace.id} aria-expanded={workspace.open() ? "true" : "false"} ref={element => { workspace.refs.opener = element; }} onClick={workspace.show}>Open {props.workspace?.label}</button>
      <Show when={props.workspace !== undefined}><aside class="ui-workbench-workspace" aria-label={paneLabel(props.workspace!)} ref={element => { workspace.refs.content = element; }}>{props.workspace?.content}</aside></Show>
      <dialog id={workspace.id} class="ui-workbench-drawer ui-workbench-drawer-end" aria-label={props.workspace?.label} onClose={workspace.closed} ref={element => { workspace.refs.modal = element; }} onCancel={event => { event.preventDefault(); workspace.close(); }} onClick={event => { if (event.target === event.currentTarget) workspace.close(); }}><button type="button" class="ui-btn" ref={element => { workspace.refs.closer = element; }} onClick={workspace.close}>Close {props.workspace?.label}</button></dialog>
      <Show when={props.diagnostics}>{pane => <section class="ui-workbench-diagnostics" aria-label={paneLabel(pane())}>{pane().content}</section>}</Show>
    </div>
  </div>;
}
