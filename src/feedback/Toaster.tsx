import { createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { isServer, type JSX } from "@solidjs/web";

export interface Toast {
  readonly id: string;
  readonly title: string;
  readonly detail?: string | undefined;
  readonly action?: { readonly label: string; readonly onSelect: () => void } | undefined;
}

export interface ToastStore {
  readonly toasts: () => readonly Toast[];
  readonly add: (toast: Toast) => void;
  readonly update: (id: string, toast: Omit<Toast, "id">) => void;
  readonly dismiss: (id: string) => boolean;
}

export interface ToasterProps {
  readonly label: string;
  readonly store: ToastStore;
  readonly maxVisible?: number | undefined;
  readonly class?: string | undefined;
}

function validateToast(toast: Toast): void {
  if (!toast.id || !toast.title || (toast.action && !toast.action.label)) throw new Error("Toast ID, title and action label must be nonempty");
}

export function createToastStore(): ToastStore {
  const [signal, setSignal] = createSignal<readonly Toast[]>([]);
  let serverToasts: readonly Toast[] = [];
  const toasts = isServer ? () => serverToasts : signal;
  const setToasts = (next: (items: readonly Toast[]) => readonly Toast[]) => {
    if (isServer) serverToasts = next(serverToasts);
    else setSignal(next);
  };
  return {
    toasts,
    add: toast => {
      validateToast(toast);
      if (toasts().length >= 100) throw new RangeError("Toast queue supports at most 100 notices");
      if (toasts().some(item => item.id === toast.id)) throw new Error("Toast IDs must be unique");
      setToasts(items => [...items, toast]);
    },
    update: (id, toast) => {
      const next = { ...toast, id };
      validateToast(next);
      if (!toasts().some(item => item.id === id)) throw new Error("Toast ID is not in the queue");
      setToasts(items => items.map(item => item.id === id ? next : item));
    },
    dismiss: id => {
      if (!toasts().some(item => item.id === id)) return false;
      setToasts(items => items.filter(item => item.id !== id));
      return true;
    },
  };
}

export function Toaster(props: ToasterProps): JSX.Element {
  let region: HTMLElement | undefined;
  let previousFocus: HTMLElement | undefined;
  let disposed = false;
  const visible = createMemo(() => {
    const limit = props.maxVisible ?? 3;
    if (!Number.isInteger(limit) || limit < 1 || limit > 10) throw new RangeError("Toaster maxVisible must be between 1 and 10");
    return props.store.toasts().slice(0, limit);
  });
  const dismiss = (id: string, origin: HTMLButtonElement) => {
    const focused = region?.contains(document.activeElement) ?? false;
    const target = previousFocus;
    props.store.dismiss(id);
    if (!focused || !target) return;
    queueMicrotask(() => {
      if (!disposed && target.isConnected && (document.activeElement === document.body || document.activeElement === origin)) target.focus();
    });
  };
  onCleanup(() => { disposed = true; });
  return <section class={["ui-toaster", props.class].filter(Boolean).join(" ")} aria-label={props.label} ref={element => { region = element; }} onFocusIn={event => {
    const previous = event.relatedTarget;
    if (previous instanceof HTMLElement && !event.currentTarget.contains(previous)) previousFocus = previous;
  }}>
    <div aria-live="polite" aria-relevant="additions text"><For each={visible().map(toast => toast.id)}>{id => {
      const toast = () => visible().find(item => item.id === id)!;
      return <div class="ui-toast" role="group" aria-label={toast().title}>
        <strong>{toast().title}</strong><Show when={toast().detail}>{detail => <p>{detail()}</p>}</Show>
        <div class="ui-toast-actions"><Show when={toast().action}>{action => <button type="button" class="ui-btn ui-btn-small" onClick={() => action().onSelect()}>{action().label}</button>}</Show><button type="button" class="ui-btn ui-btn-small" aria-label={`Dismiss ${toast().title}`} onClick={event => dismiss(id, event.currentTarget)}>Dismiss</button></div>
      </div>;
    }}</For></div>
  </section>;
}
