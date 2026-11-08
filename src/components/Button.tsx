import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "default" | "small" | "icon" | undefined;
  readonly ariaLabel?: string | undefined;
}

export function Button(props: ButtonProps): JSX.Element {
  const classes = () => [
    "ui-btn",
    props.variant === "small" ? "ui-btn-small" : props.variant === "icon" ? "ui-btn-icon" : undefined,
    props.class
  ].filter(Boolean).join(" ");

  const native = omit(props, key => key === "variant" || key === "ariaLabel" || key === "class" || key === "children");

  return (
    <button
      {...native}
      type={props.type ?? "button"}
      class={classes()}
      aria-label={props.ariaLabel ?? props["aria-label"]}
    >
      {props.children}
    </button>
  );
}

export interface IconButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ariaLabel: string;
  readonly children: JSX.Element;
}

export function IconButton(props: IconButtonProps): JSX.Element {
  const classes = () => ["ui-icon-btn", props.class].filter(Boolean).join(" ");
  const native = omit(props, key => key === "ariaLabel" || key === "class" || key === "children");
  return (
    <button
      {...native}
      type={props.type ?? "button"}
      class={classes()}
      aria-label={props.ariaLabel}
    >
      {props.children}
    </button>
  );
}
