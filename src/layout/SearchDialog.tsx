import { createEffect, createMemo, createRenderEffect, createSignal, createUniqueId, For, onCleanup, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { domIdSuffix } from "../internal/domId";

export interface SearchResult {
  readonly id: string;
  readonly href: string;
}

export type SearchDialogState =
  | { readonly kind: "idle" }
  | { readonly kind: "loading" }
  | { readonly kind: "results"; readonly results: readonly SearchResult[] }
  | { readonly kind: "error"; readonly message: string };

export interface SearchResultRenderState {
  readonly active: boolean;
}

export interface SearchDialogShortcut {
  readonly key: string;
  readonly scope: "document";
}

export interface SearchDialogProps {
  readonly label: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
  readonly state: SearchDialogState;
  readonly renderResult: (result: SearchResult, state: SearchResultRenderState) => JSX.Element;
  readonly shortcut?: SearchDialogShortcut | undefined;
  readonly returnFocus?: (() => HTMLElement | null) | undefined;
  readonly class?: string | undefined;
}

const noResults: readonly SearchResult[] = [];

export function SearchDialog(props: SearchDialogProps): JSX.Element {
  const id = `ui-search-dialog-${createUniqueId()}`;
  const listId = `${id}-list`;
  const [active, setActive] = createSignal<string | null>(null);
  let dialog: HTMLDialogElement | undefined;
  let input: HTMLInputElement | undefined;
  let opener: HTMLElement | undefined;
  let wasOpen = false;
  let composing = false;
  let disposed = false;
  let frame: number | undefined;
  const label = () => {
    if (!props.label.trim()) throw new Error("SearchDialog label must be nonempty");
    return props.label;
  };
  const shortcut = () => {
    const value = props.shortcut;
    if (value !== undefined && Array.from(value.key).length !== 1) throw new Error("SearchDialog shortcut key must be one character");
    return value;
  };
  const state = createMemo(() => {
    const value = props.state;
    if (value.kind === "error") {
      if (!value.message.trim()) throw new Error("SearchDialog error message must be nonempty");
      return value;
    }
    if (value.kind !== "results") return value;
    if (value.results.length > 200) throw new RangeError("SearchDialog supports at most 200 results");
    const ids = new Set<string>();
    for (const result of value.results) {
      if (!result.id || ids.has(result.id)) throw new Error("Search result IDs must be nonempty and unique");
      ids.add(result.id);
      if (!result.href || result.href !== result.href.trim() || !["http:", "https:"].includes(new URL(result.href, "https://ui.invalid").protocol)) throw new Error("Invalid search result URL");
    }
    return value;
  });
  const results = createMemo(() => {
    const value = state();
    return value.kind === "results" ? value.results : noResults;
  });
  let lastResults: readonly SearchResult[] | undefined;
  let invalidated: string | null = null;
  const activeId = createMemo(() => {
    const list = results();
    const current = active();
    if (list !== lastResults) {
      lastResults = list;
      if (current !== null && !list.some(result => result.id === current)) invalidated = current;
    }
    if (list.length === 0) return null;
    return current !== null && current !== invalidated && list.some(result => result.id === current) ? current : list[0]?.id ?? null;
  });
  const optionId = (resultId: string) => `${id}-option-${domIdSuffix(resultId)}`;
  const activeDescendant = () => {
    const current = activeId();
    return current === null ? undefined : optionId(current);
  };
  const statusMessage = () => {
    const value = state();
    if (value.kind === "loading") return "Searching…";
    if (value.kind === "error") return value.message;
    return value.kind === "results" && value.results.length === 0 ? "No results" : undefined;
  };
  const restoreFocus = () => {
    const target = opener?.isConnected ? opener : props.returnFocus?.();
    opener = undefined;
    if (target?.isConnected) target.focus();
  };
  const requestClose = () => {
    if (props.open) props.onOpenChange(false);
  };
  const move = (key: "ArrowDown" | "ArrowUp" | "Home" | "End") => {
    const list = results();
    if (list.length === 0) return false;
    const index = list.findIndex(result => result.id === activeId());
    const next = key === "Home" ? 0 : key === "End" ? list.length - 1 : key === "ArrowDown" ? (index + 1) % list.length : index <= 0 ? list.length - 1 : index - 1;
    const result = list[next];
    if (result === undefined) return false;
    invalidated = null;
    setActive(result.id);
    queueMicrotask(() => { if (!disposed) document.getElementById(optionId(result.id))?.scrollIntoView({ block: "nearest" }); });
    return true;
  };
  createRenderEffect(() => props.open, open => {
    if (open === wasOpen) return;
    wasOpen = open;
    if (open) {
      const focused = document.activeElement;
      opener = focused instanceof HTMLElement && focused !== document.body && focused !== document.documentElement ? focused : undefined;
      composing = false;
      queueMicrotask(() => {
        if (disposed || !props.open) return;
        if (dialog?.isConnected && !dialog.open) dialog.showModal();
        frame = requestAnimationFrame(() => {
          frame = undefined;
          if (!disposed && props.open) input?.focus();
        });
      });
      return;
    }
    if (frame !== undefined) { cancelAnimationFrame(frame); frame = undefined; }
    if (dialog?.open) dialog.close();
    restoreFocus();
  });
  createEffect(() => true, () => {
    const handler = (event: KeyboardEvent) => {
      const current = shortcut();
      if (current === undefined || props.open || event.defaultPrevented || event.isComposing || event.repeat) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key !== current.key) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])"))) return;
      event.preventDefault();
      props.onOpenChange(true);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });
  onCleanup(() => { disposed = true; if (frame !== undefined) cancelAnimationFrame(frame); });
  return <div class={["ui-search-dialog", props.class].filter(Boolean).join(" ")}>
    <Show when={props.open}><dialog id={`${id}-dialog`} class="ui-search-dialog-dialog" aria-label={label()} ref={element => { dialog = element; }} onCancel={event => { event.preventDefault(); if (composing) return; requestClose(); }} onClick={event => { if (event.target === event.currentTarget) requestClose(); }}>
      <div class="ui-search-dialog-panel">
        <div class="ui-search-dialog-bar"><button type="button" class="ui-btn ui-btn-small ui-search-dialog-close" onClick={requestClose}>Close</button></div>
        <input id={`${id}-input`} type="search" class="ui-search-dialog-search" role="combobox" aria-label={label()} aria-autocomplete="list" aria-expanded={results().length > 0 ? "true" : "false"} aria-controls={listId} aria-activedescendant={activeDescendant()} autocomplete="off" spellcheck={false} value={props.query} ref={element => { input = element; }} onInput={event => { props.onQueryChange(event.currentTarget.value); }} onCompositionStart={() => { composing = true; }} onCompositionEnd={() => { composing = false; }} onKeyDown={event => {
          if (event.isComposing || composing) return;
          if (event.key === "Enter") {
            if (activeId() === null) return;
            event.preventDefault();
            const option = document.getElementById(activeDescendant() ?? "");
            if (option instanceof HTMLAnchorElement) option.click();
            return;
          }
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
          if (move(event.key)) event.preventDefault();
        }} />
        <Show when={statusMessage()}>{message => <div role="status" class="ui-search-dialog-status">{message()}</div>}</Show>
        <div id={listId} class="ui-search-dialog-list" role="listbox" aria-label="Results"><For each={results()} keyed={result => result.id}>{result => {
          const selected = () => activeId() === result().id;
          return <a id={optionId(result().id)} class="ui-search-dialog-option" role="option" href={result().href} tabindex="-1" aria-selected={selected() ? "true" : "false"} data-active={selected() ? "" : undefined}>{props.renderResult(result(), { active: selected() })}</a>;
        }}</For></div>
      </div>
    </dialog></Show>
  </div>;
}
