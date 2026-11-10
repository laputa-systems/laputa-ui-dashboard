import { createUniqueId, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Checkbox, type CheckboxProps } from "./Checkbox";

export type SwitchRequestState =
  | { readonly kind: "idle" }
  | { readonly kind: "pending" }
  | { readonly kind: "failed"; readonly message: string };

type SwitchValue =
  | { readonly checked: boolean; readonly defaultChecked?: never }
  | { readonly checked?: undefined; readonly defaultChecked?: boolean | undefined };

export type SwitchProps = Omit<CheckboxProps, "checked" | "defaultChecked" | "indeterminate" | "card" | "role" | "onClick" | "aria-checked" | "aria-disabled"> & SwitchValue & {
  readonly placement?: "start" | "end" | undefined;
  readonly state?: SwitchRequestState | undefined;
};

export function Switch(props: SwitchProps): JSX.Element {
  const id = `ui-switch-${createUniqueId()}-status`;
  const native = omit(props, key => key === "placement" || key === "state" || key === "class" || key === "aria-describedby" || key === "checked" || key === "defaultChecked") as Omit<CheckboxProps, "checked" | "defaultChecked">;
  const value = (): SwitchValue => props.checked === undefined ? { defaultChecked: props.defaultChecked } : { checked: props.checked };
  const message = () => {
    if (props.state?.kind === "failed" && !props.state.message) throw new Error("Switch failure requires a message");
    return props.state?.kind === "pending" ? "Saving…" : props.state?.kind === "failed" ? props.state.message : undefined;
  };
  return <div class="ui-switch-field">
    <Checkbox {...native} {...value()} class={["ui-switch", props.placement === "end" ? "ui-switch-end" : undefined, props.class].filter(Boolean).join(" ")} role="switch" aria-disabled={props.state?.kind === "pending" ? "true" : undefined} aria-describedby={[props["aria-describedby"], message() ? id : undefined].filter(Boolean).join(" ") || undefined} onClick={event => { if (props.state?.kind === "pending") event.preventDefault(); }} />
    {message() && <div id={id} class={props.state?.kind === "failed" ? "ui-field-error" : "ui-field-hint"} role={props.state?.kind === "failed" ? "alert" : "status"}>{message()}</div>}
  </div>;
}
