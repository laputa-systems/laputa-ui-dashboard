import type { JSX } from "@solidjs/web";

export type ActionState =
  | { readonly kind: "idle" }
  | { readonly kind: "pending"; readonly message: string }
  | { readonly kind: "succeeded"; readonly message: string }
  | { readonly kind: "failed"; readonly message: string; readonly retry?: (() => void) | undefined }
  | { readonly kind: "unavailable"; readonly message: string };

export interface ActionStatusProps {
  readonly state: ActionState;
  readonly class?: string | undefined;
}

export function ActionStatus(props: ActionStatusProps): JSX.Element {
  let container: HTMLDivElement | undefined;
  const retry = () => {
    const state = props.state;
    if (state.kind !== "failed" || state.retry === undefined) return;
    container?.focus();
    state.retry();
  };
  return (
    <div class={["ui-action-status", props.class].filter(Boolean).join(" ")} tabindex="-1" ref={element => { container = element; }}>
      <span role={props.state.kind === "failed" ? "alert" : "status"} class={props.state.kind === "failed" ? "ui-action-status-error" : undefined}>
        {props.state.kind === "idle" ? "" : props.state.message}
      </span>
      {props.state.kind === "failed" && props.state.retry !== undefined ? <button type="button" class="ui-btn ui-btn-small" onClick={retry}>Retry</button> : null}
    </div>
  );
}
