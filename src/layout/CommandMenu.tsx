import { createMemo, createSignal, createUniqueId, For, onCleanup, Show, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface Command {
  readonly id: string;
  readonly label: string;
  readonly keywords?: readonly string[] | undefined;
  readonly disabled?: boolean | undefined;
}

export interface CommandGroup {
  readonly id: string;
  readonly label: string;
  readonly commands: readonly Command[];
}

export interface CommandMenuProps {
  readonly label: string;
  readonly groups: readonly CommandGroup[];
  readonly onSelect: (id: string) => void;
  readonly class?: string | undefined;
}

export function CommandMenu(props: CommandMenuProps): JSX.Element {
  const id = `ui-command-menu-${createUniqueId()}`;
  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [active, setActive] = createSignal<string | null>(null);
  let trigger: HTMLButtonElement | undefined;
  let dialog: HTMLDialogElement | undefined;
  let input: HTMLInputElement | undefined;
  let frame: number | undefined;
  let disposed = false;
  let composing = false;
  let touch: { id: string; pointerId: number; x: number; y: number; moved: boolean } | undefined;
  let suppressClick = false;
  const groups = createMemo(() => {
    const groupIds = new Set<string>();
    const ids = new Set<string>();
    let count = 0;
    for (const group of props.groups) {
      if (groupIds.has(group.id)) throw new Error(`Duplicate command group ID: ${group.id}`);
      groupIds.add(group.id);
      for (const command of group.commands) {
        if (ids.has(command.id)) throw new Error(`Duplicate command ID: ${command.id}`);
        ids.add(command.id);
        if (++count > 500) throw new RangeError("CommandMenu supports at most 500 commands");
      }
    }
    return props.groups;
  });
  const visible = createMemo(() => {
    const text = query().trim().toLocaleLowerCase();
    return groups().map(group => ({ ...group, commands: group.commands.filter(command => [command.label, ...(command.keywords ?? [])].some(value => value.toLocaleLowerCase().includes(text))) })).filter(group => group.commands.length > 0);
  });
  const enabled = () => visible().flatMap(group => group.commands).filter(command => !command.disabled);
  const current = () => enabled().find(command => command.id === active());
  const optionId = (commandId: string) => `${id}-option-${Array.from({ length: commandId.length }, (_, index) => commandId.charCodeAt(index).toString(16)).join("-")}`;
  const close = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    if (dialog?.open) dialog.close();
    setOpen(false);
    setActive(null);
    touch = undefined;
    if (trigger?.isConnected) trigger.focus();
  };
  const show = () => { setQuery(""); setActive(null); setOpen(true); };
  const present = (element: HTMLDialogElement) => {
    dialog = element;
    const mount = () => {
      if (disposed) return;
      if (!element.isConnected) { frame = requestAnimationFrame(() => { if (untrack(open)) mount(); }); return; }
      if (!element.open) element.showModal();
      input?.focus();
    };
    mount();
  };
  const select = (command: Command) => { if (!command.disabled) { close(); props.onSelect(command.id); } };
  const escape = () => { if (query() !== "") { setQuery(""); setActive(null); } else close(); };
  onCleanup(() => { disposed = true; if (frame !== undefined) cancelAnimationFrame(frame); });
  return <span class={["ui-command-menu", props.class].filter(Boolean).join(" ")}>
    <button type="button" class="ui-btn" aria-haspopup="dialog" aria-expanded={open() ? "true" : "false"} aria-controls={`${id}-dialog`} ref={element => { trigger = element; }} onClick={show}>{props.label}</button>
    <Show when={open()}>
      <dialog id={`${id}-dialog`} class="ui-command-menu-dialog" aria-label={props.label} ref={present} onPointerMove={event => { if (touch?.pointerId === event.pointerId && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 8) touch.moved = true; }} onPointerCancel={() => { touch = undefined; }} onCancel={event => { event.preventDefault(); escape(); }}>
        <button type="button" class="ui-command-menu-close ui-btn ui-btn-small" onClick={close}>Close</button>
        <label class="ui-sr-only" for={`${id}-search`}>Search commands</label>
        <input id={`${id}-search`} class="ui-command-menu-search" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls={`${id}-list`} aria-activedescendant={current() ? optionId(current()!.id) : undefined} value={query()} ref={element => { input = element; }} onInput={event => { setQuery(event.currentTarget.value); setActive(null); }} onCompositionStart={() => { composing = true; }} onCompositionEnd={() => { composing = false; }} onKeyDown={event => {
          if (event.isComposing || composing) return;
          if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); escape(); return; }
          if (event.key === "Enter") { event.preventDefault(); const command = current(); if (command) select(command); return; }
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          const choices = enabled();
          if (choices.length === 0) { setActive(null); return; }
          const index = choices.findIndex(command => command.id === active());
          const next = event.key === "ArrowDown" ? (index + 1) % choices.length : (index <= 0 ? choices.length - 1 : index - 1);
          const command = choices[next];
          if (!command) return;
          setActive(command.id);
          queueMicrotask(() => { if (!disposed) document.getElementById(optionId(command.id))?.scrollIntoView({ block: "nearest" }); });
        }} />
        <div id={`${id}-list`} class="ui-command-menu-list" role="listbox" aria-label="Commands">
          <For each={visible()} keyed={group => group.id}>{group => <div role="group" aria-label={group().label}>
            <div class="ui-command-menu-group" aria-hidden="true">{group().label}</div>
            <For each={group().commands} keyed={command => command.id}>{command => <div id={optionId(command().id)} role="option" class="ui-command-menu-option" aria-selected="false" aria-disabled={command().disabled ? "true" : undefined} data-active={active() === command().id ? "" : undefined} onPointerDown={event => { suppressClick = false; if (event.pointerType === "mouse") event.preventDefault(); else if (event.pointerType === "touch" || event.pointerType === "pen") touch = { id: untrack(command).id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false }; }} onPointerUp={event => { if ((event.pointerType !== "touch" && event.pointerType !== "pen") || touch?.pointerId !== event.pointerId || touch.id !== untrack(command).id) return; const moved = touch.moved; touch = undefined; if (moved) suppressClick = true; else if (!untrack(command).disabled) { event.preventDefault(); suppressClick = true; select(untrack(command)); } }} onClick={() => { if (suppressClick) { suppressClick = false; return; } select(untrack(command)); }}>{command().label}</div>}</For>
          </div>}</For>
        </div>
        {visible().length === 0 ? <div role="status" class="ui-command-menu-empty">No matching commands</div> : null}
      </dialog>
    </Show>
  </span>;
}
