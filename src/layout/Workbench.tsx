import { createEffect, createMemo, createRenderEffect, createSignal, createUniqueId, Show, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface WorkbenchPane {
  readonly label: string;
  readonly content: JSX.Element;
}

export interface WorkbenchNavigationCollapse {
  readonly label: string;
  readonly open?: boolean | undefined;
  readonly defaultOpen?: boolean | undefined;
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
}

export interface WorkbenchDrawerControl {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export interface WorkbenchProps {
  readonly navigation: JSX.Element;
  readonly secondaryNavigation?: JSX.Element | undefined;
  readonly secondaryNavigationCollapse?: WorkbenchNavigationCollapse | undefined;
  readonly workspace?: (WorkbenchPane & { readonly drawer?: boolean | WorkbenchDrawerControl | undefined }) | undefined;
  readonly diagnostics?: WorkbenchPane | undefined;
  readonly appearance?: "flat" | "inset" | undefined;
  readonly navigationDrawer?: { readonly label: string; readonly control?: WorkbenchDrawerControl | undefined } | undefined;
  readonly class?: string | undefined;
  readonly children: JSX.Element;
}

function createWorkbenchDrawer(enabled: () => boolean, present: () => boolean, control: () => WorkbenchDrawerControl | undefined, container: () => HTMLDivElement | undefined, grid: () => HTMLDivElement | undefined, fallback: () => HTMLElement | undefined) {
  const id = `ui-workbench-drawer-${createUniqueId()}`;
  const controlled = createMemo(control);
  const controlledOpen = createMemo(() => controlled()?.open);
  const [localOpen, setLocalOpen] = createSignal(false);
  const open = () => controlledOpen() ?? localOpen();
  const setOpen = (value: boolean) => { if (untrack(controlled) === undefined) setLocalOpen(value); };
  const [ready, setReady] = createSignal(false);
  const [narrow, setNarrow] = createSignal(false);
  const active = createMemo(enabled);
  const exists = createMemo(present);
  const refs: { content?: HTMLElement; modal?: HTMLDialogElement; opener?: HTMLButtonElement; closer?: HTMLButtonElement } = {};
  let enabledSnapshot = false;
  let presentSnapshot = false;
  let ignoredCloseEvents = 0;
  const firstControl = (element: HTMLElement) => [...element.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])')].find(control => control.getClientRects().length > 0 && getComputedStyle(control).visibility === "visible" && !control.closest('[inert], [aria-disabled="true"]'));
  const closeModal = () => { if (refs.modal?.open) { ignoredCloseEvents += 1; refs.modal.close(); } };
  const closeNow = () => {
    const focusedInside = refs.modal?.contains(document.activeElement) === true;
    closeModal();
    setOpen(false);
    if (focusedInside) (refs.opener?.getClientRects().length ? refs.opener : fallback())?.focus();
  };
  const showNow = () => {
    if (refs.modal && !refs.modal.open) { refs.modal.showModal(); setOpen(true); refs.closer?.focus(); }
  };
  const close = () => { const current = untrack(controlled); if (current === undefined) closeNow(); else current.onOpenChange(false); };
  const show = () => { const current = untrack(controlled); if (current === undefined) showNow(); else current.onOpenChange(true); };
  const closed = () => {
    if (ignoredCloseEvents > 0) { ignoredCloseEvents -= 1; return; }
    if (!refs.modal?.isConnected) return;
    setOpen(refs.modal.open);
    if (!refs.modal.open && untrack(controlledOpen) === true) untrack(controlled)?.onOpenChange(false);
  };
  createEffect(() => ({ open: controlledOpen(), active: active(), ready: ready(), narrow: narrow() }), state => {
    if (state.open === undefined || !state.active || !state.ready || !state.narrow) return;
    if (state.open) showNow(); else closeNow();
  });
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
        if (inside && untrack(controlledOpen) !== false) { modal.showModal(); setOpen(true); focused?.focus(); }
        else if (inside) (refs.opener ?? fallback())?.focus();
      } else {
        closeModal();
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
      closeModal();
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
  let secondaryDetails: HTMLDetailsElement | undefined;
  let secondarySummary: HTMLElement | undefined;
  const [localSecondaryOpen, setLocalSecondaryOpen] = createSignal(untrack(() => props.secondaryNavigationCollapse?.defaultOpen ?? true));
  const hasSecondary = () => {
    const present = props.secondaryNavigation !== undefined;
    if (!present && props.secondaryNavigationCollapse !== undefined) throw new Error("Workbench navigation collapse requires secondary navigation");
    return present;
  };
  const secondaryOpen = () => props.secondaryNavigationCollapse?.open ?? localSecondaryOpen();
  const secondaryLocked = () => props.secondaryNavigationCollapse?.open !== undefined && props.secondaryNavigationCollapse?.onOpenChange === undefined;
  const secondaryLabel = () => {
    const label = props.secondaryNavigationCollapse?.label;
    if (label !== undefined && !label.trim()) throw new Error("Workbench navigation collapse label must be nonempty");
    return label;
  };
  createRenderEffect(secondaryOpen, open => {
    if (!open && secondaryDetails?.contains(document.activeElement) && document.activeElement !== secondarySummary) secondarySummary?.focus();
  });
  const toggleSecondary = (event: MouseEvent) => {
    event.preventDefault();
    if (secondaryLocked()) return;
    const next = !secondaryOpen();
    if (props.secondaryNavigationCollapse?.open === undefined) setLocalSecondaryOpen(next);
    props.secondaryNavigationCollapse?.onOpenChange?.(next);
  };
  const navigation = createWorkbenchDrawer(() => props.navigationDrawer !== undefined, () => true, () => props.navigationDrawer?.control, () => container, () => grid, () => main);
  const workspaceControl = () => typeof props.workspace?.drawer === "object" ? props.workspace.drawer : undefined;
  const workspace = createWorkbenchDrawer(() => props.workspace?.drawer === true || workspaceControl() !== undefined, () => props.workspace !== undefined, workspaceControl, () => container, () => grid, () => main);
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
    <div class="ui-workbench" data-secondary={hasSecondary() ? "" : undefined} data-workspace={props.workspace !== undefined ? "" : undefined} data-appearance={props.appearance ?? "flat"} ref={element => { grid = element; }}>
      <button type="button" class="ui-btn ui-workbench-open" hidden={!navigation.active() || !navigation.ready() || !navigation.narrow()} aria-haspopup="dialog" aria-controls={navigation.id} aria-expanded={navigation.open() ? "true" : "false"} ref={element => { navigation.refs.opener = element; }} onClick={navigation.show}>Open {drawerLabel()}</button>
      <div class="ui-workbench-navigation-group" ref={element => { navigation.refs.content = element; }}><div class="ui-workbench-navigation">{props.navigation}</div>
        <Show when={hasSecondary()}><div class="ui-workbench-secondary"><Show when={props.secondaryNavigationCollapse !== undefined} fallback={props.secondaryNavigation}><details class="ui-workbench-secondary-disclosure" open={secondaryOpen()} ref={element => { secondaryDetails = element; }}><summary aria-disabled={secondaryLocked() ? "true" : undefined} ref={element => { secondarySummary = element; }} onClick={toggleSecondary}>{secondaryLabel()}</summary>{props.secondaryNavigation}</details></Show></div></Show>
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
