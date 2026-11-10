import { createMemo, Show } from "solid-js";
import type { JSX } from "@solidjs/web";

export type ArtifactPreviewState =
  | { readonly kind: "loading"; readonly message: string }
  | { readonly kind: "failed"; readonly message: string; readonly retry?: (() => void) | undefined }
  | { readonly kind: "not-found"; readonly message: string }
  | { readonly kind: "ready"; readonly content: JSX.Element; readonly dirty?: boolean | undefined };

export interface ArtifactPreviewProps {
  readonly label: string;
  readonly state: ArtifactPreviewState;
  readonly actions?: JSX.Element | undefined;
  readonly class?: string | undefined;
}

export function ArtifactPreview(props: ArtifactPreviewProps): JSX.Element {
  let region: HTMLElement | undefined;
  const state = createMemo(() => {
    if (!props.label.trim()) throw new Error("ArtifactPreview label must be nonempty");
    const value = props.state;
    if (value.kind !== "ready" && !value.message.trim()) throw new Error("ArtifactPreview state message must be nonempty");
    return value;
  });
  const loading = () => { const value = state(); return value.kind === "loading" ? value : undefined; };
  const failure = () => { const value = state(); return value.kind === "failed" ? value : undefined; };
  const missing = () => { const value = state(); return value.kind === "not-found" ? value : undefined; };
  const ready = () => { const value = state(); return value.kind === "ready" ? value : undefined; };
  const retry = () => {
    const value = failure();
    if (!value?.retry) return;
    region?.focus();
    value.retry();
  };
  return <section class={["ui-artifact-preview", props.class].filter(Boolean).join(" ")} aria-label={props.label} tabindex="-1" ref={element => { region = element; }}>
    <div class="ui-artifact-preview-header"><strong>{props.label}</strong><div class="ui-artifact-preview-actions">{props.actions}</div></div>
    <Show when={loading()}>{value => <div role="status">{value().message}</div>}</Show>
    <Show when={failure()}>{value => <div><div role="alert" class="ui-artifact-preview-error">{value().message}</div><Show when={value().retry}><button type="button" class="ui-btn ui-btn-small" onClick={retry}>Retry</button></Show></div>}</Show>
    <Show when={missing()}>{value => <div>{value().message}</div>}</Show>
    <Show when={ready()}>{value => <><Show when={value().dirty}><div class="ui-artifact-preview-dirty">Unsaved changes</div></Show><div class="ui-artifact-preview-content">{value().content}</div></>}</Show>
  </section>;
}
