import { createEffect, createMemo, createSignal, createUniqueId, Show } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface WorkbenchPane {
  readonly label: string;
  readonly content: JSX.Element;
}

export interface WorkbenchProps {
  readonly navigation: JSX.Element;
  readonly secondaryNavigation?: JSX.Element | undefined;
  readonly workspace?: WorkbenchPane | undefined;
  readonly diagnostics?: WorkbenchPane | undefined;
  readonly appearance?: "flat" | "inset" | undefined;
  readonly navigationDrawer?: { readonly label: string } | undefined;
  readonly class?: string | undefined;
  readonly children: JSX.Element;
}

export function Workbench(props: WorkbenchProps): JSX.Element {
  const drawerId = `ui-workbench-navigation-${createUniqueId()}`;
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const [ready, setReady] = createSignal(false);
  const [narrow, setNarrow] = createSignal(false);
  let container: HTMLDivElement | undefined;
  let grid: HTMLDivElement | undefined;
  let navigation: HTMLDivElement | undefined;
  let drawer: HTMLDialogElement | undefined;
  let opener: HTMLButtonElement | undefined;
  let closeButton: HTMLButtonElement | undefined;
  const drawerLabel = () => {
    const label = props.navigationDrawer?.label;
    if (label !== undefined && !label.trim()) throw new Error("Workbench drawer label must be nonempty");
    return label;
  };
  const closeDrawer = () => {
    if (drawer?.open) drawer.close();
    setDrawerOpen(false);
    if (opener?.isConnected) opener.focus();
  };
  const hasDrawer = createMemo(() => props.navigationDrawer !== undefined);
  let drawerEnabled = false;
  createEffect(() => { drawerEnabled = hasDrawer(); return drawerEnabled; }, enabled => {
    if (!enabled || !container || !grid || !navigation || !drawer) return;
    const host = container;
    const parent = grid;
    const contents = navigation;
    const modal = drawer;
    let current: boolean | undefined;
    const resize = (width: number) => {
      const next = width <= 900;
      if (next === current) return;
      current = next;
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
      const inside = active !== undefined && contents.contains(active);
      const closingControl = active === closeButton;
      if (next) {
        modal.appendChild(contents);
        setNarrow(true);
        setReady(true);
        if (inside) { modal.showModal(); setDrawerOpen(true); active?.focus(); }
      } else {
        if (modal.open) modal.close();
        setDrawerOpen(false);
        parent.insertBefore(contents, modal);
        setNarrow(false);
        setReady(true);
        if (inside) active?.focus();
        else if (closingControl) contents.querySelector<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])')?.focus();
      }
    };
    let frame: number | undefined;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width === undefined) return;
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { frame = undefined; resize(width); });
    });
    observer.observe(host);
    resize(host.clientWidth);
    return () => {
      observer.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
      const inside = active !== undefined && contents.contains(active);
      if (modal.open) modal.close();
      if (parent.isConnected) parent.insertBefore(contents, modal);
      if (parent.isConnected && !drawerEnabled) {
        if (inside) active?.focus();
        else if (active === closeButton) contents.querySelector<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])')?.focus();
      }
    };
  });
  const paneLabel = (pane: WorkbenchPane) => {
    if (!pane.label.trim()) throw new Error("Workbench pane labels must be nonempty");
    return pane.label;
  };
  return <div class={["ui-workbench-container", props.class].filter(Boolean).join(" ")} ref={element => { container = element; }}>
    <div class="ui-workbench" data-secondary={props.secondaryNavigation !== undefined ? "" : undefined} data-workspace={props.workspace !== undefined ? "" : undefined} data-appearance={props.appearance ?? "flat"} ref={element => { grid = element; }}>
      <button type="button" class="ui-btn ui-workbench-open" hidden={!hasDrawer() || !ready() || !narrow()} aria-haspopup="dialog" aria-controls={drawerId} aria-expanded={drawerOpen() ? "true" : "false"} ref={element => { opener = element; }} onClick={() => { if (drawer && !drawer.open) { drawer.showModal(); setDrawerOpen(true); closeButton?.focus(); } }}>Open {drawerLabel()}</button>
      <div class="ui-workbench-navigation-group" ref={element => { navigation = element; }}><div class="ui-workbench-navigation">{props.navigation}</div>
        <Show when={props.secondaryNavigation !== undefined}><div class="ui-workbench-secondary">{props.secondaryNavigation}</div></Show>
      </div>
      <dialog id={drawerId} class="ui-workbench-drawer" aria-label={drawerLabel()} onClose={() => { if (drawer?.isConnected) setDrawerOpen(drawer.open); }} ref={element => { drawer = element; }} onCancel={event => { event.preventDefault(); closeDrawer(); }} onClick={event => { if (event.target === event.currentTarget) closeDrawer(); }}><button type="button" class="ui-btn" ref={element => { closeButton = element; }} onClick={closeDrawer}>Close {drawerLabel()}</button></dialog>
      <main class="ui-workbench-main">{props.children}</main>
      <Show when={props.workspace}>{pane => <aside class="ui-workbench-workspace" aria-label={paneLabel(pane())}>{pane().content}</aside>}</Show>
      <Show when={props.diagnostics}>{pane => <section class="ui-workbench-diagnostics" aria-label={paneLabel(pane())}>{pane().content}</section>}</Show>
    </div>
  </div>;
}
