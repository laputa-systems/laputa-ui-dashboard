import { createMemo, createSignal, createUniqueId, For, onCleanup, Show, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";
import { domIdSuffix } from "../internal/domId";

export interface Command {
  readonly id: string;
  readonly label: string;
  readonly keywords?: readonly string[] | undefined;
  readonly disabled?: boolean | undefined;
}

export interface CommandSubmenu extends Command {
  readonly kind: "submenu";
  readonly commands: readonly Command[];
}

export interface CommandGroup {
  readonly id: string;
  readonly label: string;
  readonly commands: readonly (Command | CommandSubmenu)[];
}

export interface CommandShortcut {
  readonly key: string;
  readonly modifier: "Control" | "Meta" | "Alt";
  readonly shift?: boolean | undefined;
}

export interface CommandMenuProps {
  readonly label: string;
  readonly groups: readonly CommandGroup[];
  readonly shortcut?: CommandShortcut | undefined;
  readonly children?: JSX.Element;
  readonly onSelect: (id: string) => void;
  readonly class?: string | undefined;
}

export function CommandMenu(props: CommandMenuProps): JSX.Element {
  const id = `ui-command-menu-${createUniqueId()}`;
  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [active, setActive] = createSignal<string | null>(null);
  const [submenuRequest, setSubmenuRequest] = createSignal<{ readonly id: string }>();
  let parentQuery = "";
  let parentActive: string | null = null;
  let trigger: HTMLButtonElement | undefined;
  let opener: HTMLElement | undefined;
  let dialog: HTMLDialogElement | undefined;
  let input: HTMLInputElement | undefined;
  let frame: number | undefined;
  let disposed = false;
  let composing = false;
  let touch: { id: string; pointerId: number; x: number; y: number; moved: boolean } | undefined;
  let suppressClick = false;
  const shortcutLabel = () => {
    const shortcut = props.shortcut;
    if (!shortcut) return undefined;
    if (!/^[A-Za-z0-9]$/u.test(shortcut.key)) throw new Error("Command shortcut key must be one ASCII letter or digit");
    return [shortcut.modifier, shortcut.shift ? "Shift" : undefined, shortcut.key.toUpperCase()].filter(Boolean).join("+");
  };
  const isSubmenu = (command: Command | CommandSubmenu): command is CommandSubmenu => "kind" in command && command.kind === "submenu";
  const groups = createMemo(() => {
    const groupIds = new Set<string>();
    const ids = new Set<string>();
    let count = 0;
    for (const group of props.groups) {
      if (groupIds.has(group.id)) throw new Error(`Duplicate command group ID: ${group.id}`);
      groupIds.add(group.id);
      for (const command of group.commands) {
        if (isSubmenu(command) && command.commands.some(isSubmenu)) throw new Error("Command submenus cannot contain submenus");
        for (const item of isSubmenu(command) ? [command, ...command.commands] : [command]) {
          if (ids.has(item.id)) throw new Error(`Duplicate command ID: ${item.id}`);
          ids.add(item.id);
          if (++count > 500) throw new RangeError("CommandMenu supports at most 500 commands");
        }
      }
    }
    return props.groups;
  });
  const submenuState = createMemo((previous: { readonly request: { readonly id: string }; readonly command: CommandSubmenu | undefined } | undefined) => {
    const request = submenuRequest();
    if (!request) return undefined;
    if (previous?.request === request && previous.command === undefined) return previous;
    const command = groups().flatMap(group => group.commands).find((item): item is CommandSubmenu => isSubmenu(item) && item.id === request.id && !item.disabled);
    return { request, command };
  });
  const submenu = () => submenuState()?.command;
  const submenuRemoved = () => submenuState() !== undefined && submenu() === undefined;
  const visibleQuery = () => submenuRemoved() ? parentQuery : query();
  const visible = createMemo(() => {
    const selected = submenu();
    const sections: readonly CommandGroup[] = selected ? [{ id: selected.id, label: selected.label, commands: selected.commands }] : groups();
    const text = visibleQuery().trim().toLocaleLowerCase();
    return sections.map(group => ({ ...group, commands: group.commands.filter(command => [command.label, ...(command.keywords ?? [])].some(value => value.toLocaleLowerCase().includes(text))) })).filter(group => group.commands.length > 0);
  });
  const enabled = () => visible().flatMap(group => group.commands).filter(command => !command.disabled);
  const current = () => submenuRemoved() ? undefined : enabled().find(command => command.id === active());
  const optionId = (commandId: string) => `${id}-option-${domIdSuffix(commandId)}`;
  const close = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    if (dialog?.open) dialog.close();
    setOpen(false);
    setActive(null);
    touch = undefined;
    if (opener?.isConnected) opener.focus(); else if (trigger?.isConnected) trigger.focus();
  };
  const show = (target: HTMLElement | undefined) => { opener = target; setSubmenuRequest(undefined); setQuery(""); setActive(null); setOpen(true); };
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
  const back = () => { setSubmenuRequest(undefined); setQuery(parentQuery); setActive(parentActive); input?.focus(); };
  const select = (command: Command | CommandSubmenu) => {
    if (command.disabled) return;
    if (isSubmenu(command)) { parentQuery = query(); parentActive = command.id; setSubmenuRequest({ id: command.id }); setQuery(""); setActive(null); input?.focus(); return; }
    close();
    props.onSelect(command.id);
  };
  const escape = () => { if (submenuRemoved()) { setSubmenuRequest(undefined); setQuery(parentQuery); setActive(null); } else if (query() !== "") { setQuery(""); setActive(null); } else if (submenu()) back(); else close(); };
  onCleanup(() => { disposed = true; if (frame !== undefined) cancelAnimationFrame(frame); });
  return <div class={["ui-command-menu", props.class].filter(Boolean).join(" ")} onKeyDown={event => {
    const shortcut = props.shortcut;
    if (!shortcut || open() || event.defaultPrevented || event.isComposing || event.repeat) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])"))) return;
    if (event.key.toLocaleLowerCase() !== shortcut.key.toLocaleLowerCase() || event.ctrlKey !== (shortcut.modifier === "Control") || event.metaKey !== (shortcut.modifier === "Meta") || event.altKey !== (shortcut.modifier === "Alt") || event.shiftKey !== Boolean(shortcut.shift)) return;
    event.preventDefault();
    event.stopPropagation();
    show(document.activeElement instanceof HTMLElement ? document.activeElement : trigger);
  }}>
    {props.children}
    <button type="button" class="ui-btn" aria-haspopup="dialog" aria-expanded={open() ? "true" : "false"} aria-controls={`${id}-dialog`} aria-keyshortcuts={shortcutLabel()} ref={element => { trigger = element; }} onClick={() => show(trigger)}>{props.label}</button>
    <Show when={open()}>
      <dialog id={`${id}-dialog`} class="ui-command-menu-dialog" aria-label={props.label} ref={present} onPointerMove={event => { if (touch?.pointerId === event.pointerId && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 8) touch.moved = true; }} onPointerCancel={() => { touch = undefined; }} onCancel={event => { event.preventDefault(); escape(); }}>
        <button type="button" class="ui-command-menu-close ui-btn ui-btn-small" onClick={close}>Close</button>
        <Show when={submenu()}><button type="button" class="ui-btn ui-btn-small" onClick={back}>Back to commands</button></Show>
        <label class="ui-sr-only" for={`${id}-search`}>Search commands</label>
        <input id={`${id}-search`} class="ui-command-menu-search" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls={`${id}-list`} aria-activedescendant={current() ? optionId(current()!.id) : undefined} value={visibleQuery()} ref={element => { input = element; }} onInput={event => { if (submenuRemoved()) setSubmenuRequest(undefined); setQuery(event.currentTarget.value); setActive(null); }} onCompositionStart={() => { composing = true; }} onCompositionEnd={() => { composing = false; }} onKeyDown={event => {
          if (event.isComposing || composing) return;
          if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); escape(); return; }
          if (event.key === "Enter") { event.preventDefault(); const command = current(); if (command) select(command); return; }
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          if (submenuRemoved()) { setSubmenuRequest(undefined); setQuery(parentQuery); setActive(null); }
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
            <For each={group().commands} keyed={command => command.id}>{command => <div id={optionId(command().id)} role="option" class="ui-command-menu-option" aria-label={isSubmenu(command()) ? `${command().label}, submenu` : undefined} aria-selected="false" aria-disabled={command().disabled ? "true" : undefined} data-active={active() === command().id ? "" : undefined} onPointerDown={event => { suppressClick = false; if (event.pointerType === "mouse") event.preventDefault(); else if (event.pointerType === "touch" || event.pointerType === "pen") touch = { id: untrack(command).id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false }; }} onPointerUp={event => { if ((event.pointerType !== "touch" && event.pointerType !== "pen") || touch?.pointerId !== event.pointerId || touch.id !== untrack(command).id) return; const moved = touch.moved; touch = undefined; if (moved) suppressClick = true; else if (!untrack(command).disabled) { event.preventDefault(); suppressClick = true; select(untrack(command)); } }} onClick={() => { if (suppressClick) { suppressClick = false; return; } select(untrack(command)); }}>{command().label}{isSubmenu(command()) ? <span aria-hidden="true"> ›</span> : null}</div>}</For>
          </div>}</For>
        </div>
        {visible().length === 0 ? <div role="status" class="ui-command-menu-empty">No matching commands</div> : null}
      </dialog>
    </Show>
  </div>;
}
