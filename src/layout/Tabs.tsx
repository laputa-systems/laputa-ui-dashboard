import { createMemo, createSignal, createUniqueId, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { domIdSuffix } from "../internal/domId";
import { createTabSwipeGuard } from "../internal/tabSwipe";

export interface Tab {
  readonly id: string;
  readonly label: string;
  readonly content: JSX.Element;
  readonly disabled?: boolean | undefined;
  readonly icon?: JSX.Element | undefined;
  readonly count?: number | undefined;
}

export interface TabsProps {
  readonly label: string;
  readonly tabs: readonly Tab[];
  readonly value: string;
  readonly onChange: (id: string) => void;
  readonly activation?: "automatic" | "manual" | undefined;
  readonly class?: string | undefined;
}

export function Tabs(props: TabsProps): JSX.Element {
  const id = `ui-tabs-${createUniqueId()}`;
  const [focused, setFocused] = createSignal<string>();
  const [within, setWithin] = createSignal(false);
  let list: HTMLDivElement | undefined;
  const swipe = createTabSwipeGuard();
  const tabs = createMemo(() => {
    if (props.tabs.length > 100) throw new RangeError("Tabs supports at most 100 tabs");
    const ids = new Set<string>();
    for (const tab of props.tabs) {
      if (!tab.id || ids.has(tab.id)) throw new Error("Tab IDs must be nonempty and unique");
      if (tab.count !== undefined && (!Number.isSafeInteger(tab.count) || tab.count < 0)) throw new RangeError("Tab count must be a nonnegative integer");
      ids.add(tab.id);
    }
    return props.tabs;
  });
  const tabId = (value: string) => `${id}-tab-${domIdSuffix(value)}`;
  const panelId = (value: string) => `${id}-panel-${domIdSuffix(value)}`;
  const enabled = () => tabs().filter(tab => !tab.disabled);
  const roving = () => {
    const candidates = enabled();
    const wanted = within() ? focused() : props.value;
    return candidates.find(tab => tab.id === wanted)?.id ?? candidates[0]?.id;
  };
  const choose = (value: string) => { if (value !== props.value) props.onChange(value); };
  const move = (event: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || event.isComposing) return;
    const choices = enabled();
    if (!choices.length) return;
    const index = choices.findIndex(tab => tab.id === focused());
    const next = event.key === "Home" ? 0 : event.key === "End" ? choices.length - 1 : event.key === "ArrowRight" ? (index + 1) % choices.length : (index <= 0 ? choices.length - 1 : index - 1);
    const target = choices[next];
    if (!target) return;
    event.preventDefault();
    setFocused(target.id);
    [...(list?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])].find(button => button.dataset.tabId === target.id)?.focus();
    if (props.activation !== "manual") choose(target.id);
  };
  return <div class={["ui-tabs", props.class].filter(Boolean).join(" ")}>
    <div class="ui-tabs-list" role="tablist" aria-label={props.label} ref={element => { list = element; }} onKeyDown={move} onFocusOut={event => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setWithin(false); }} onPointerDown={swipe.pointerDown} onPointerMove={swipe.pointerMove} onPointerUp={swipe.pointerUp} onPointerCancel={swipe.pointerCancel}>
      <For each={tabs()} keyed={tab => tab.id}>{tab => <button type="button" role="tab" class="ui-tabs-tab" id={tabId(tab().id)} data-tab-id={tab().id} aria-controls={panelId(tab().id)} aria-selected={props.value === tab().id ? "true" : "false"} disabled={tab().disabled} tabindex={roving() === tab().id ? 0 : -1} onFocus={() => { setWithin(true); setFocused(tab().id); }} onClick={event => { if (swipe.suppress(event)) return; choose(tab().id); }}>{tab().icon && <span aria-hidden="true">{tab().icon}</span>}<span>{tab().label}</span>{tab().count !== undefined && <span>{tab().count}</span>}</button>}</For>
    </div>
    <For each={tabs()} keyed={tab => tab.id}>{tab => <section role="tabpanel" id={panelId(tab().id)} aria-labelledby={tabId(tab().id)} hidden={props.value !== tab().id} tabindex="0">{tab().content}</section>}</For>
  </div>;
}
