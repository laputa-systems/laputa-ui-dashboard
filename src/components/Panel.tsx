import { createEffect, createSignal, Show, type ParentProps } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Icon } from "./Icon";

export interface PanelProps {
  readonly title: string | JSX.Element;
  readonly meta?: JSX.Element | undefined;
  readonly class?: string | undefined;
  readonly bodyClass?: string | undefined;
  readonly flush?: boolean | undefined;
  readonly id?: string | undefined;
  readonly children: JSX.Element;
}

export function Panel(props: PanelProps): JSX.Element {
  const classes = () => ["ui-panel", props.class].filter(Boolean).join(" ");
  const bodyClasses = () => [
    "ui-panel-body",
    props.flush === true ? "ui-panel-flush" : undefined,
    props.bodyClass
  ].filter(Boolean).join(" ");

  return (
    <section class={classes()} id={props.id}>
      <header class="ui-panel-head">
        <div class="ui-panel-title">
          {typeof props.title === "string" ? <h2>{props.title}</h2> : props.title}
        </div>
        <Show when={props.meta !== undefined}>
          <div class="ui-panel-meta">{props.meta}</div>
        </Show>
      </header>
      <div class={bodyClasses()}>{props.children}</div>
    </section>
  );
}

export interface CollapsiblePanelProps extends ParentProps {
  readonly title: string | JSX.Element;
  readonly meta?: JSX.Element | undefined;
  readonly class?: string | undefined;
  readonly bodyClass?: string | undefined;
  readonly slotClass?: string | undefined;
  readonly flush?: boolean | undefined;
  readonly id?: string | undefined;
  readonly label?: string | undefined;
  readonly expandable?: boolean | undefined;
  readonly expanded?: boolean | undefined;
  readonly onToggleExpanded?: (() => void) | undefined;
  readonly collapsible?: boolean | undefined;
  readonly collapsed?: boolean | undefined;
  readonly onToggleCollapsed?: (() => void) | undefined;
}

export function CollapsiblePanel(props: CollapsiblePanelProps): JSX.Element {
  const [localExpanded, setLocalExpanded] = createSignal(false);
  const [localCollapsed, setLocalCollapsed] = createSignal(false);
  const [slotHeight, setSlotHeight] = createSignal(0);
  let section: HTMLElement | undefined;

  const isExpanded = () => props.expanded ?? localExpanded();
  const isCollapsed = () => props.collapsed ?? localCollapsed();

  const toggleExpanded = () => {
    if (!isExpanded()) setSlotHeight(section?.getBoundingClientRect().height ?? 0);
    if (props.expanded === undefined) setLocalExpanded(open => !open);
    props.onToggleExpanded?.();
  };

  const toggleCollapsed = () => {
    if (props.collapsed === undefined) setLocalCollapsed(collapsed => !collapsed);
    props.onToggleCollapsed?.();
  };

  createEffect(isExpanded, open => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || document.querySelector("dialog:modal") !== null ||
          (props.expanded !== undefined && props.onToggleExpanded === undefined)) return;
      event.stopPropagation();
      toggleExpanded();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  });

  const titleString = () => (props.label ?? (typeof props.title === "string" ? props.title : "panel"));
  const classes = () => [
    "ui-panel",
    props.class,
    isExpanded() ? "ui-panel-expanded" : undefined,
    isCollapsed() ? "ui-panel-collapsed" : undefined
  ].filter(Boolean).join(" ");

  const bodyClasses = () => [
    "ui-panel-body",
    props.flush === true ? "ui-panel-flush" : undefined,
    props.bodyClass
  ].filter(Boolean).join(" ");

  return (
    <>
      <Show when={isExpanded()}>
        <button
          class="ui-panel-veil"
          type="button"
          aria-label="Close expanded panel"
          tabindex="-1"
          disabled={props.expanded !== undefined && props.onToggleExpanded === undefined}
          onClick={toggleExpanded}
        />
      </Show>
      <Show when={isExpanded()}>
        <div
          class={["ui-panel-slot", props.slotClass].filter(Boolean).join(" ")}
          style={`height:${slotHeight()}px`}
          aria-hidden="true"
        />
      </Show>
      <section class={classes()} id={props.id} ref={(element) => { section = element; }}>
        <header class="ui-panel-head">
          <div class="ui-panel-title">
            {typeof props.title === "string" ? <h2>{props.title}</h2> : props.title}
          </div>
          <div class="ui-panel-meta">
            {props.meta}
            <Show when={props.expandable === true}>
              <button
                class="ui-icon-btn ui-panel-expand"
                type="button"
                aria-label={`${isExpanded() ? "Collapse" : "Expand"} ${titleString()}`}
                aria-pressed={isExpanded() ? "true" : "false"}
                disabled={isCollapsed() || (props.expanded !== undefined && props.onToggleExpanded === undefined)}
                onClick={toggleExpanded}
              >
                <Icon name="expand" size={12} />
              </button>
            </Show>
            <Show when={props.collapsible === true || props.onToggleCollapsed !== undefined}>
              <button
                class="ui-icon-btn ui-panel-collapse"
                type="button"
                aria-label={`${isCollapsed() ? "Show" : "Hide"} ${titleString()}`}
                aria-expanded={isCollapsed() ? "false" : "true"}
                disabled={props.collapsed !== undefined && props.onToggleCollapsed === undefined}
                onClick={toggleCollapsed}
              >
                <Icon name={isCollapsed() ? "chevronRight" : "sortDown"} size={14} />
              </button>
            </Show>
          </div>
        </header>
        <Show when={!isCollapsed()}>
          <div class={bodyClasses()}>{props.children}</div>
        </Show>
      </section>
    </>
  );
}
