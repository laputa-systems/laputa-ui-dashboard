import { createMemo, createSignal, createUniqueId, For, onCleanup, Show, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";

export type IntegrationConnection =
  | { readonly kind: "disconnected" }
  | { readonly kind: "pending" }
  | { readonly kind: "connected" }
  | { readonly kind: "expired"; readonly message: string }
  | { readonly kind: "failed"; readonly message: string };

export interface Integration {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly keywords?: readonly string[] | undefined;
  readonly connection: IntegrationConnection;
}

export interface IntegrationPickerProps {
  readonly label: string;
  readonly integrations: readonly Integration[];
  readonly onConnect?: ((id: string) => void) | undefined;
  readonly class?: string | undefined;
}

export function IntegrationPicker(props: IntegrationPickerProps): JSX.Element {
  const id = `ui-integration-picker-${createUniqueId()}`;
  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [selectionRequest, setSelectionRequest] = createSignal<{ readonly id: string }>();
  let trigger: HTMLButtonElement | undefined;
  let dialog: HTMLDialogElement | undefined;
  let search: HTMLInputElement | undefined;
  let details: HTMLElement | undefined;
  let frame: number | undefined;
  let disposed = false;
  let composing = false;
  const integrations = createMemo(() => {
    if (props.integrations.length > 500) throw new RangeError("IntegrationPicker supports at most 500 integrations");
    const ids = new Set<string>();
    for (const item of props.integrations) {
      if (!item.id || ids.has(item.id)) throw new Error("Integration IDs must be nonempty and unique");
      ids.add(item.id);
      if ((item.connection.kind === "failed" || item.connection.kind === "expired") && !item.connection.message) throw new Error("Integration connection state requires a message");
    }
    return props.integrations;
  });
  const selection = createMemo((previous: { readonly request: { readonly id: string }; readonly item: Integration | undefined } | undefined) => {
    const request = selectionRequest();
    if (!request) return undefined;
    if (previous?.request === request && previous.item === undefined) return previous;
    return { request, item: integrations().find(item => item.id === request.id) };
  });
  const selected = () => selection()?.item;
  const visible = () => {
    const text = query().trim().toLocaleLowerCase();
    return integrations().filter(item => [item.label, item.description, ...(item.keywords ?? [])].some(value => value.toLocaleLowerCase().includes(text)));
  };
  const close = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    if (dialog?.open) dialog.close();
    setOpen(false);
    if (trigger?.isConnected) trigger.focus();
  };
  const show = () => { setQuery(""); setSelectionRequest(undefined); setOpen(true); };
  const present = (element: HTMLDialogElement) => {
    dialog = element;
    const mount = () => {
      if (disposed) return;
      if (!element.isConnected) { frame = requestAnimationFrame(() => { if (untrack(open)) mount(); }); return; }
      if (!element.open) element.showModal();
      search?.focus();
    };
    mount();
  };
  const back = () => { setSelectionRequest(undefined); search?.focus(); };
  const options = () => [...(dialog?.querySelectorAll<HTMLButtonElement>(".ui-integration-list button") ?? [])];
  const move = (event: KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || event.isComposing || composing) return;
    if (event.currentTarget === search && (event.key === "Home" || event.key === "End")) return;
    const buttons = options();
    if (!buttons.length) return;
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : event.key === "ArrowDown" ? (index + 1) % buttons.length : (index <= 0 ? buttons.length - 1 : index - 1);
    event.preventDefault();
    buttons[next]?.focus();
  };
  const actionLabel = (item: Integration) => item.connection.kind === "expired" ? "Reconnect" : item.connection.kind === "failed" ? "Retry" : "Connect";
  const connectionMessage = (item: Integration, kind: "expired" | "failed") => {
    const connection = item.connection;
    return (connection.kind === "expired" || connection.kind === "failed") && connection.kind === kind ? connection.message : undefined;
  };
  onCleanup(() => { disposed = true; if (frame !== undefined) cancelAnimationFrame(frame); });
  return <div class={["ui-integration-picker", props.class].filter(Boolean).join(" ")}>
    <button type="button" class="ui-btn" aria-haspopup="dialog" aria-expanded={open() ? "true" : "false"} aria-controls={`${id}-dialog`} aria-describedby={`${id}-count`} ref={element => { trigger = element; }} onClick={show}>{props.label}</button><span id={`${id}-count`} class="ui-sr-only">{integrations().length} {integrations().length === 1 ? "integration" : "integrations"}</span>
    <Show when={open()}><dialog id={`${id}-dialog`} class="ui-integration-dialog" aria-label={props.label} ref={present} onKeyDown={event => { if (event.key === "Escape" && !event.isComposing && !composing) { event.preventDefault(); event.stopPropagation(); if (selected()) back(); else close(); } }} onCancel={event => { event.preventDefault(); if (selected()) back(); else close(); }}>
      <div class="ui-integration-header"><h2>{props.label}</h2><button type="button" class="ui-btn ui-btn-small" onClick={close}>Close</button></div>
      <div class="ui-integration-container"><div class="ui-integration-columns">
        <div class="ui-integration-list"><label for={`${id}-search`}>Search integrations</label><input id={`${id}-search`} type="search" value={query()} ref={element => { search = element; }} onInput={event => { if (!composing && !event.isComposing) setQuery(event.currentTarget.value); }} onCompositionStart={() => { composing = true; }} onCompositionEnd={event => { composing = false; setQuery(event.currentTarget.value); }} onKeyDown={move} />
          <div class="ui-integration-options" onKeyDown={move}><For each={visible()} keyed={item => item.id}>{item => <button type="button" class="ui-integration-option" aria-pressed={selected()?.id === item().id ? "true" : "false"} onClick={() => setSelectionRequest({ id: item().id })}>{item().label}</button>}</For></div>
          <Show when={visible().length === 0}><div role="status">No matching integrations</div></Show>
        </div>
        <Show when={selected()} fallback={<div class="ui-integration-details">Select an integration to see details.</div>}>{item => <section class="ui-integration-details" role="region" aria-label={item().label} tabindex="-1" ref={element => { details = element; }}>
          <button type="button" class="ui-btn ui-btn-small" onClick={back}>Back</button><h3>{item().label}</h3><p>{item().description}</p>
          <Show when={item().connection.kind === "disconnected"}><div role="status">Not connected</div></Show>
          <Show when={item().connection.kind === "pending"}><div role="status">Connecting</div></Show>
          <Show when={item().connection.kind === "connected"}><div role="status">Connected</div></Show>
          <Show when={connectionMessage(item(), "expired")}>{message => <div role="status">{message()}</div>}</Show>
          <Show when={connectionMessage(item(), "failed")}>{message => <div role="alert">{message()}</div>}</Show>
          <Show when={item().connection.kind !== "connected"}><button type="button" class="ui-btn" aria-label={`${actionLabel(item())} ${item().label}`} disabled={!props.onConnect || item().connection.kind === "pending"} onClick={() => { details?.focus(); props.onConnect?.(item().id); }}>{actionLabel(item())}</button></Show>
          <Show when={!props.onConnect && item().connection.kind !== "connected"}><div>Connection unavailable</div></Show>
        </section>}</Show>
      </div></div>
    </dialog></Show>
  </div>;
}
