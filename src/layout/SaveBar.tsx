import { createRenderEffect, createMemo } from "solid-js";
import type { JSX } from "@solidjs/web";

export type SaveBarState =
  | { readonly kind: "clean" }
  | { readonly kind: "dirty" }
  | { readonly kind: "saving" }
  | { readonly kind: "failed"; readonly message: string }
  | { readonly kind: "saved"; readonly message: string };

export interface SaveBarProps {
  readonly state: SaveBarState;
  readonly onSave?: (() => void) | undefined;
  readonly onDiscard?: (() => void) | undefined;
  readonly class?: string | undefined;
}

export function SaveBar(props: SaveBarProps): JSX.Element {
  let region: HTMLDivElement | undefined;
  let saveButton: HTMLButtonElement | undefined;
  let discardButton: HTMLButtonElement | undefined;
  const state = createMemo(() => {
    const value = props.state;
    if ((value.kind === "failed" || value.kind === "saved") && !value.message.trim()) throw new Error("SaveBar state message must be nonempty");
    return value;
  });
  createRenderEffect(() => state().kind, kind => {
    if ((kind === "clean" || kind === "saving" || kind === "saved") && (document.activeElement === saveButton || document.activeElement === discardButton)) region?.focus();
  });
  const editable = () => state().kind === "dirty" || state().kind === "failed";
  const status = () => {
    const value = state();
    if (value.kind === "dirty") return "Unsaved changes";
    if (value.kind === "saving") return "Saving changes";
    return value.kind === "saved" ? value.message : "";
  };
  const failure = () => { const value = state(); return value.kind === "failed" ? value.message : ""; };
  const invoke = (callback: (() => void) | undefined) => {
    if (!editable() || !callback) return;
    region?.focus();
    callback();
  };
  return <div class={["ui-save-bar", props.class].filter(Boolean).join(" ")} tabindex="-1" ref={element => { region = element; }}>
    <div class="ui-save-bar-message"><span role="status">{status()}</span><span role="alert" class="ui-save-bar-error">{failure()}</span></div>
    <div class="ui-save-bar-actions"><button type="button" class="ui-btn ui-btn-small" ref={element => { discardButton = element; }} disabled={!editable() || !props.onDiscard} onClick={() => invoke(props.onDiscard)}>Discard changes</button><button type="button" class="ui-btn ui-btn-small" ref={element => { saveButton = element; }} disabled={!editable() || !props.onSave} onClick={() => invoke(props.onSave)}>Save changes</button></div>
  </div>;
}
