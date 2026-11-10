import { getOwner, runWithOwner } from "solid-js";
import { runHydrationEvents, type JSX } from "@solidjs/web";
import { forwardProps, restProps } from "../internal/forward";

export type ButtonAppearance = "default" | "primary" | "danger" | "ghost";

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "default" | "small" | "icon" | undefined;
  readonly appearance?: ButtonAppearance | undefined;
  readonly leadingIcon?: JSX.Element | undefined;
  readonly trailingIcon?: JSX.Element | undefined;
  readonly ariaLabel?: string | undefined;
  readonly busy?: boolean | undefined;
}

const buttonOmitted = (key: string) =>
  key === "variant" ||
  key === "appearance" ||
  key === "leadingIcon" ||
  key === "trailingIcon" ||
  key === "busy" ||
  key === "ariaLabel" ||
  key === "class" ||
  key === "children" ||
  key === "type" ||
  key === "disabled" ||
  key === "aria-busy" ||
  key === "aria-label";

export function Button(props: ButtonProps): JSX.Element {
  const classes = () => [
    "ui-btn",
    props.variant === "small" ? "ui-btn-small" : props.variant === "icon" ? "ui-btn-icon" : undefined,
    props.appearance !== undefined && props.appearance !== "default" ? `ui-button-${props.appearance}` : undefined,
    props.leadingIcon != null || props.trailingIcon != null ? "ui-btn-with-icons" : undefined,
    props.class
  ].filter(Boolean).join(" ");
  const owner = getOwner();

  if (import.meta.env.SSR) {
    return (
      <button
        {...restProps(props, buttonOmitted)}
        type={props.type ?? "button"}
        disabled={props.disabled || props.busy}
        aria-busy={props.busy ? "true" : props["aria-busy"]}
        class={classes()}
        aria-label={props.ariaLabel ?? props["aria-label"]}
      >
        {props.leadingIcon != null ? <span class="ui-btn-icon-slot" aria-hidden="true">{props.leadingIcon}</span> : null}
        {props.children}
        {props.trailingIcon != null ? <span class="ui-btn-icon-slot" aria-hidden="true">{props.trailingIcon}</span> : null}
      </button>
    );
  }

  const element = (
    <button
      ref={node => runWithOwner(owner, () => forwardProps(node, props, buttonOmitted))}
      type={props.type ?? "button"}
      disabled={props.disabled || props.busy}
      aria-busy={props.busy ? "true" : props["aria-busy"]}
      class={classes()}
      aria-label={props.ariaLabel ?? props["aria-label"]}
    >
      {props.leadingIcon != null ? <span class="ui-btn-icon-slot" aria-hidden="true">{props.leadingIcon}</span> : null}
      {props.children}
      {props.trailingIcon != null ? <span class="ui-btn-icon-slot" aria-hidden="true">{props.trailingIcon}</span> : null}
    </button>
  );
  runHydrationEvents();
  return element;
}

export interface IconButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ariaLabel: string;
  readonly appearance?: ButtonAppearance | undefined;
  readonly busy?: boolean | undefined;
  readonly children: JSX.Element;
}

const iconButtonOmitted = (key: string) =>
  key === "appearance" ||
  key === "busy" ||
  key === "ariaLabel" ||
  key === "class" ||
  key === "children" ||
  key === "type" ||
  key === "disabled" ||
  key === "aria-busy" ||
  key === "aria-label";

export function IconButton(props: IconButtonProps): JSX.Element {
  const classes = () => ["ui-icon-btn", props.appearance !== undefined && props.appearance !== "default" ? `ui-button-${props.appearance}` : undefined, props.class].filter(Boolean).join(" ");
  const owner = getOwner();

  if (import.meta.env.SSR) {
    return (
      <button
        {...restProps(props, iconButtonOmitted)}
        type={props.type ?? "button"}
        disabled={props.disabled || props.busy}
        aria-busy={props.busy ? "true" : props["aria-busy"]}
        class={classes()}
        aria-label={props.ariaLabel}
      >
        {props.children}
      </button>
    );
  }

  const element = (
    <button
      ref={node => runWithOwner(owner, () => forwardProps(node, props, iconButtonOmitted))}
      type={props.type ?? "button"}
      disabled={props.disabled || props.busy}
      aria-busy={props.busy ? "true" : props["aria-busy"]}
      class={classes()}
      aria-label={props.ariaLabel}
    >
      {props.children}
    </button>
  );
  runHydrationEvents();
  return element;
}
