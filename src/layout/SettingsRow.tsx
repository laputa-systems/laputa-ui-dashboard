import { createUniqueId } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface SettingsRowProps {
  readonly label: string;
  readonly description?: string | undefined;
  readonly children: JSX.Element;
  readonly class?: string | undefined;
}

export function SettingsRow(props: SettingsRowProps): JSX.Element {
  const id = `ui-settings-row-${createUniqueId()}`;
  const label = () => {
    if (!props.label.trim()) throw new Error("SettingsRow label must be nonempty");
    return props.label;
  };
  return <div class={["ui-settings-row-container", props.class].filter(Boolean).join(" ")}><div class="ui-settings-row" role="group" aria-labelledby={`${id}-label`} aria-describedby={props.description ? `${id}-description` : undefined}>
    <div class="ui-settings-row-heading"><strong id={`${id}-label`}>{label()}</strong>{props.description && <div id={`${id}-description`} class="ui-settings-row-description">{props.description}</div>}</div>
    <div class="ui-settings-row-content">{props.children}</div>
  </div></div>;
}
