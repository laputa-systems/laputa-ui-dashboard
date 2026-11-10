import { createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface Notification {
  readonly id: string;
  readonly title: string;
  readonly detail?: string | undefined;
  readonly action?: string | undefined;
}

export interface NotificationStackProps {
  readonly label: string;
  readonly notices: readonly Notification[];
  readonly total?: number | undefined;
  readonly inbox?: { readonly href: string; readonly label: string } | undefined;
  readonly onDismiss?: ((id: string) => void) | undefined;
  readonly onAction?: ((id: string) => void) | undefined;
  readonly class?: string | undefined;
}

export function NotificationStack(props: NotificationStackProps): JSX.Element {
  const [choice, setChoice] = createSignal<{ readonly id: string }>();
  const [dismissal, setDismissal] = createSignal<{ readonly id: string; readonly origin: HTMLElement }>();
  let region: HTMLElement | undefined;
  let card: HTMLElement | undefined;
  let disposed = false;
  const notices = createMemo(() => {
    if (props.notices.length > 100) throw new RangeError("NotificationStack supports at most 100 notices");
    const ids = new Set<string>();
    for (const notice of props.notices) {
      if (!notice.id || ids.has(notice.id)) throw new Error("Notification IDs must be nonempty and unique");
      ids.add(notice.id);
    }
    const total = props.total ?? props.notices.length;
    if (!Number.isSafeInteger(total) || total < props.notices.length) throw new RangeError("Notification total must include all shown notices");
    if (total > props.notices.length && !props.inbox) throw new Error("An inbox link is required for additional notifications");
    if (props.inbox) {
      const href = props.inbox.href;
      if (!href || href !== href.trim() || !["http:", "https:"].includes(new URL(href, "https://ui.invalid").protocol)) throw new Error("Invalid notification inbox URL");
    }
    return props.notices;
  });
  const active = createMemo((previous: { readonly request: { readonly id: string } | undefined; readonly notice: Notification; readonly index: number } | undefined) => {
    const items = notices();
    const request = choice();
    if (!items.length) return undefined;
    const wanted = request !== previous?.request ? request?.id : previous?.notice.id;
    const found = wanted === undefined ? -1 : items.findIndex(item => item.id === wanted);
    const index = found >= 0 ? found : Math.min(previous?.index ?? 0, items.length - 1);
    return { request, notice: items[index]!, index };
  });
  const move = (offset: number) => {
    const current = active();
    if (!current) return;
    const next = notices()[current.index + offset];
    if (next) { setDismissal(undefined); setChoice({ id: next.id }); }
  };
  const dismiss = (id: string, origin: HTMLButtonElement) => {
    origin.focus();
    setDismissal({ id, origin });
    props.onDismiss?.(id);
  };
  createEffect(() => {
    const pending = dismissal();
    return pending && !notices().some(notice => notice.id === pending.id) ? pending : undefined;
  }, pending => {
    if (!pending) return;
    queueMicrotask(() => {
      if (disposed || dismissal() !== pending) return;
      setDismissal(undefined);
      if (document.activeElement !== pending.origin && document.activeElement !== document.body) return;
      (card?.isConnected ? card : region)?.focus();
    });
  });
  onCleanup(() => { disposed = true; });
  return <section class={["ui-notification-stack", props.class].filter(Boolean).join(" ")} aria-label={props.label} tabindex="-1" ref={element => { region = element; }}>
    <div class="ui-notification-heading"><strong>{props.label}</strong><Show when={props.inbox}>{inbox => <a href={inbox().href}>{inbox().label}</a>}</Show></div>
    <Show when={active()} fallback={<div>No notifications in this stack.</div>}>{current => <>
      <div class="ui-notification-card" role="group" aria-label={current().notice.title} aria-live="polite" tabindex="-1" ref={element => { card = element; }}>
        <strong>{current().notice.title}</strong><Show when={current().notice.detail}>{detail => <p>{detail()}</p>}</Show>
        <div class="ui-notification-actions"><Show when={current().notice.action}>{action => <button type="button" class="ui-btn ui-btn-small" disabled={!props.onAction} onClick={() => { card?.focus(); props.onAction?.(current().notice.id); }}>{action()}</button>}</Show>
          <button type="button" class="ui-btn ui-btn-small" aria-label={`Dismiss ${current().notice.title}`} disabled={!props.onDismiss} onClick={event => dismiss(current().notice.id, event.currentTarget)}>Dismiss</button></div>
      </div>
      <div class="ui-notification-navigation"><button type="button" class="ui-btn ui-btn-small" aria-label="Previous notice" aria-disabled={current().index === 0 ? "true" : undefined} onClick={() => move(-1)}>Previous</button><span>{current().index + 1} of {notices().length}{(props.total ?? notices().length) > notices().length ? ` shown · ${props.total} total` : ""}</span><button type="button" class="ui-btn ui-btn-small" aria-label="Next notice" aria-disabled={current().index === notices().length - 1 ? "true" : undefined} onClick={() => move(1)}>Next</button></div>
    </>}</Show>
  </section>;
}
