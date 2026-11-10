import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";

export type ButtonAppearance = "default" | "primary" | "danger" | "ghost";

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "default" | "small" | "icon" | undefined;
  readonly appearance?: ButtonAppearance | undefined;
  readonly leadingIcon?: JSX.Element | undefined;
  readonly trailingIcon?: JSX.Element | undefined;
  readonly ariaLabel?: string | undefined;
  readonly busy?: boolean | undefined;
}

export function Button(props: ButtonProps): JSX.Element {
  const classes = () => [
    "ui-btn",
    props.variant === "small" ? "ui-btn-small" : props.variant === "icon" ? "ui-btn-icon" : undefined,
    props.appearance !== undefined && props.appearance !== "default" ? `ui-button-${props.appearance}` : undefined,
    props.leadingIcon != null || props.trailingIcon != null ? "ui-btn-with-icons" : undefined,
    props.class
  ].filter(Boolean).join(" ");

  const native = omit(props, key => key === "variant" || key === "appearance" || key === "leadingIcon" || key === "trailingIcon" || key === "busy" || key === "ariaLabel" || key === "class" || key === "children");

  return (
    <button
      {...native}
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

export interface IconButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ariaLabel: string;
  readonly appearance?: ButtonAppearance | undefined;
  readonly busy?: boolean | undefined;
  readonly children: JSX.Element;
}

export function IconButton(props: IconButtonProps): JSX.Element {
  const classes = () => ["ui-icon-btn", props.appearance !== undefined && props.appearance !== "default" ? `ui-button-${props.appearance}` : undefined, props.class].filter(Boolean).join(" ");
  const native = omit(props, key => key === "appearance" || key === "busy" || key === "ariaLabel" || key === "class" || key === "children");
  return (
    <button
      {...native}
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
