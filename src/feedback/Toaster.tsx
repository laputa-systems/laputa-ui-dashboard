import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { isServer, type JSX } from "@solidjs/web";

export interface Toast {
  readonly id: string;
  readonly title: string;
  readonly detail?: string | undefined;
  readonly durationMs?: number | undefined;
  readonly action?: { readonly label: string; readonly onSelect: () => void } | undefined;
}

export interface ToastPromiseStates<T> {
  readonly pending: Omit<Toast, "id" | "durationMs">;
  readonly succeeded: (value: T) => Omit<Toast, "id">;
  readonly failed: (error: unknown) => Omit<Toast, "id">;
}

export interface ToastStore {
  readonly toasts: () => readonly Toast[];
  readonly add: (toast: Toast) => void;
  readonly update: (id: string, toast: Omit<Toast, "id">) => void;
  readonly dismiss: (id: string) => boolean;
  readonly track: <T>(id: string, operation: PromiseLike<T>, states: ToastPromiseStates<T>) => Promise<T>;
}

export interface ToasterProps {
  readonly label: string;
  readonly store: ToastStore;
  readonly maxVisible?: number | undefined;
  readonly class?: string | undefined;
}

function validateToast(toast: Toast): void {
  if (!toast.id || !toast.title || (toast.action && !toast.action.label)) throw new Error("Toast ID, title and action label must be nonempty");
  if (toast.durationMs !== undefined && (!Number.isInteger(toast.durationMs) || toast.durationMs < 1000 || toast.durationMs > 86400000)) throw new RangeError("Toast durationMs must be between 1000 and 86400000");
}

export function createToastStore(): ToastStore {
  const [signal, setSignal] = createSignal<readonly Toast[]>([]);
  let serverToasts: readonly Toast[] = [];
  const toasts = isServer ? () => serverToasts : signal;
  const setToasts = (next: (items: readonly Toast[]) => readonly Toast[]) => {
    if (isServer) serverToasts = next(serverToasts);
    else setSignal(next);
  };
  const store: ToastStore = {
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
    track: (id, operation, states) => {
      const pending: Toast = { ...states.pending, id };
      store.add(pending);
      const current = () => toasts().some(item => item === pending);
      return Promise.resolve(operation).then(value => {
        if (current()) store.update(id, states.succeeded(value));
        return value;
      }, error => {
        if (current()) store.update(id, states.failed(error));
        throw error;
      });
    },
  };
  return store;
}

function ToastCard(props: { readonly id: string; readonly toast: () => Toast; readonly onDismiss: (id: string, origin: HTMLButtonElement) => void; readonly setPaused: (id: string, paused: boolean) => void }): JSX.Element {
  const [hovered, setHovered] = createSignal(false);
  const [focused, setFocused] = createSignal(false);
  const [focusedAction, setFocusedAction] = createSignal<Toast["action"]>();
  createEffect(() => hovered() || focused(), paused => { props.setPaused(props.id, paused); });
  onCleanup(() => props.setPaused(props.id, false));
  return <div class="ui-toast" role="group" aria-label={props.toast().title} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} onFocusIn={() => setFocused(true)} onFocusOut={event => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <strong>{props.toast().title}</strong><Show when={props.toast().detail}>{detail => <p>{detail()}</p>}</Show>
    <div class="ui-toast-actions"><Show when={props.toast().action ?? focusedAction()}>{action => <button type="button" class="ui-btn ui-btn-small" aria-disabled={!props.toast().action ? "true" : undefined} onFocus={() => setFocusedAction(props.toast().action)} onBlur={() => setFocusedAction(undefined)} onClick={() => props.toast().action?.onSelect()}>{action().label}</button>}</Show><button type="button" class="ui-btn ui-btn-small" aria-label={`Dismiss ${props.toast().title}`} onClick={event => props.onDismiss(props.toast().id, event.currentTarget)}>Dismiss</button></div>
  </div>;
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
  const [paused, setPaused] = createSignal<ReadonlySet<string>>(new Set());
  const [hidden, setHidden] = createSignal(isServer ? false : document.hidden);
  const timers = new Map<string, { toast: Toast; remaining: number }>();
  const setToastPaused = (id: string, value: boolean) => {
    if (isServer || disposed) return;
    setPaused(previous => {
      if (previous.has(id) === value) return previous;
      const next = new Set(previous);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  createEffect(() => true, () => {
    const changed = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", changed);
    return () => document.removeEventListener("visibilitychange", changed);
  });
  createEffect(() => [visible(), paused(), hidden()] as const, ([items, pausedIds, pageHidden]) => {
    const ids = new Set(items.map(item => item.id));
    for (const id of timers.keys()) if (!ids.has(id)) timers.delete(id);
    for (const toast of items) {
      if (timers.get(toast.id)?.toast !== toast) timers.set(toast.id, { toast, remaining: toast.durationMs ?? 0 });
    }
    if (pageHidden) return;
    const running = items.flatMap(toast => {
      const timer = timers.get(toast.id)!;
      return toast.durationMs !== undefined && !pausedIds.has(toast.id) ? [timer] : [];
    });
    if (!running.length) return;
    const delay = Math.min(...running.map(timer => timer.remaining));
    const due = running.filter(timer => timer.remaining <= delay);
    const started = performance.now();
    const handle = setTimeout(() => {
      for (const timer of due) if (props.store.toasts().includes(timer.toast)) props.store.dismiss(timer.toast.id);
    }, delay);
    return () => {
      clearTimeout(handle);
      const elapsed = performance.now() - started;
      for (const timer of running) timer.remaining = Math.max(0, timer.remaining - elapsed);
    };
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
      return <ToastCard id={id} toast={toast} onDismiss={dismiss} setPaused={setToastPaused} />;
    }}</For></div>
  </section>;
}
