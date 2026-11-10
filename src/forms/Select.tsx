import { createEffect, createSignal, createUniqueId, For, onCleanup } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createAnchoredPopover } from "../internal/anchoredPopover";
import { NativeSelect, type NativeSelectOption } from "./NativeSelect";

export interface SelectOption extends NativeSelectOption {
  readonly description?: string | undefined;
  readonly icon?: JSX.Element | undefined;
}

export interface SelectProps {
  readonly id: string;
  readonly label: string;
  readonly options: readonly SelectOption[];
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly placeholder?: string | undefined;
  readonly name?: string | undefined;
  readonly required?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly class?: string | undefined;
}

export function Select(props: SelectProps): JSX.Element {
  const id = `ui-select-${createUniqueId()}`;
  const [open, setOpen] = createSignal(false);
  const [active, setActive] = createSignal<string>();
  let trigger: HTMLButtonElement | undefined;
  let popup: HTMLDivElement | undefined;
  let prefix = "";
  let lastKey = 0;
  let touch: { readonly pointerId: number; readonly x: number; readonly y: number; moved: boolean } | undefined;
  let suppressClick = false;
  const positioner = createAnchoredPopover(() => trigger, () => popup);
  const options = () => {
    if (props.options.length > 100) throw new RangeError("Select supports at most 100 options");
    return props.options;
  };
  const enabled = () => options().filter(option => !option.disabled);
  const optionId = (value: string) => `${id}-option-${Array.from({ length: value.length }, (_, index) => value.charCodeAt(index).toString(16)).join("-")}`;
  const activeOption = () => enabled().find(option => option.value === active());
  const activate = (value: string | undefined) => {
    setActive(value);
    if (value) queueMicrotask(() => { if (popup?.matches(":popover-open") && active() === value) document.getElementById(optionId(value))?.scrollIntoView({ block: "nearest" }); });
  };
  const close = (focus: boolean) => {
    if (popup?.matches(":popover-open")) popup.hidePopover();
    setOpen(false);
    setActive(undefined);
    prefix = "";
    positioner.stop();
    if (focus && trigger?.isConnected) trigger.focus();
  };
  const show = () => {
    if (props.disabled || !popup) return;
    const choices = enabled();
    prefix = "";
    activate(choices.find(option => option.value === props.value)?.value ?? choices[0]?.value);
    popup.showPopover();
    setOpen(true);
    positioner.start();
    trigger?.focus();
  };
  const select = (option: SelectOption) => {
    if (option.disabled) return;
    if (option.value !== props.value) props.onValueChange(option.value);
    close(true);
  };
  const navigate = (event: KeyboardEvent) => {
    if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "Tab" && open()) { close(false); return; }
    if (event.key === "Escape" && open()) { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (!open() && (event.key === "ArrowDown" || event.key === "ArrowUp")) { event.preventDefault(); show(); return; }
    if (!open()) return;
    const choices = enabled();
    if ((event.key === "Enter" || event.key === " ") && choices.length) {
      event.preventDefault();
      const choice = choices.find(option => option.value === active());
      if (choice) select(choice);
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) && choices.length) {
      event.preventDefault();
      const index = choices.findIndex(option => option.value === active());
      const next = event.key === "Home" ? 0 : event.key === "End" ? choices.length - 1 : event.key === "ArrowDown" ? (index + 1) % choices.length : (index <= 0 ? choices.length - 1 : index - 1);
      activate(choices[next]?.value);
      return;
    }
    if (event.key.length === 1 && event.key !== " ") {
      const key = event.key.toLocaleLowerCase();
      const repeated = event.timeStamp - lastKey <= 700 && prefix === key;
      prefix = event.timeStamp - lastKey > 700 || repeated ? key : prefix + key;
      lastKey = event.timeStamp;
      const start = repeated ? Math.max(0, choices.findIndex(option => option.value === active()) + 1) : 0;
      const match = [...choices.slice(start), ...choices.slice(0, start)].find(option => option.label.toLocaleLowerCase().startsWith(prefix));
      if (match) { event.preventDefault(); activate(match.value); }
    }
  };
  createEffect(() => props.disabled, disabled => { if (disabled) close(false); });
  onCleanup(() => positioner.stop());
  return <div class={["ui-select", props.class].filter(Boolean).join(" ")}>
    <NativeSelect id={props.id} label={props.label} name={props.name} required={props.required} disabled={props.disabled} hint={props.hint} error={props.error} placeholder={props.placeholder} options={options()} value={props.value} onValueChange={props.onValueChange} />
    <button type="button" class="ui-btn ui-btn-small" role="combobox" aria-label={`Browse ${props.label}`} aria-describedby={`${id}-selection`} aria-haspopup="listbox" aria-expanded={open() ? "true" : "false"} aria-controls={`${id}-list`} aria-activedescendant={open() && activeOption() ? optionId(activeOption()!.value) : undefined} disabled={props.disabled} ref={element => { trigger = element; }} onKeyDown={navigate} onClick={() => { if (open()) close(false); else show(); }}>Browse options</button><span id={`${id}-selection`} class="ui-sr-only">{options().find(option => option.value === props.value)?.label ?? "No selection"}</span>
    <div id={`${id}-list`} class="ui-popover ui-select-popup" role="listbox" aria-label={`${props.label} options`} popover="auto" ref={element => { popup = element; }} onToggle={event => { if (event.newState === "closed") { setOpen(false); setActive(undefined); positioner.stop(); } }} onPointerMove={event => { if (touch?.pointerId === event.pointerId && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 8) touch.moved = true; }} onPointerUp={event => { if (touch?.pointerId === event.pointerId) { suppressClick = touch.moved; touch = undefined; } }} onPointerCancel={() => { touch = undefined; suppressClick = false; }}>
      <For each={options()} keyed={option => option.value}>{option => <div id={optionId(option().value)} class="ui-select-option" role="option" aria-selected={props.value === option().value ? "true" : "false"} aria-disabled={option().disabled ? "true" : undefined} data-active={active() === option().value ? "" : undefined} onPointerDown={event => { suppressClick = false; if (event.pointerType === "mouse") event.preventDefault(); else if (event.pointerType === "touch" || event.pointerType === "pen") touch = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false }; }} onClick={() => { if (suppressClick) { suppressClick = false; return; } select(option()); }}>{option().icon && <span aria-hidden="true">{option().icon}</span>}<span><span>{option().label}</span>{option().description && <span class="ui-select-description">{option().description}</span>}</span></div>}</For>
    </div>
  </div>;
}
