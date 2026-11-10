import { Show } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface WorkbenchPane {
  readonly label: string;
  readonly content: JSX.Element;
}

export interface WorkbenchProps {
  readonly navigation: JSX.Element;
  readonly secondaryNavigation?: JSX.Element | undefined;
  readonly workspace?: WorkbenchPane | undefined;
  readonly diagnostics?: WorkbenchPane | undefined;
  readonly appearance?: "flat" | "inset" | undefined;
  readonly class?: string | undefined;
  readonly children: JSX.Element;
}

export function Workbench(props: WorkbenchProps): JSX.Element {
  const paneLabel = (pane: WorkbenchPane) => {
    if (!pane.label.trim()) throw new Error("Workbench pane labels must be nonempty");
    return pane.label;
  };
  return <div class={["ui-workbench-container", props.class].filter(Boolean).join(" ")}>
    <div class="ui-workbench" data-secondary={props.secondaryNavigation !== undefined ? "" : undefined} data-workspace={props.workspace !== undefined ? "" : undefined} data-appearance={props.appearance ?? "flat"}>
      <div class="ui-workbench-navigation">{props.navigation}</div>
      <Show when={props.secondaryNavigation !== undefined}><div class="ui-workbench-secondary">{props.secondaryNavigation}</div></Show>
      <main class="ui-workbench-main">{props.children}</main>
      <Show when={props.workspace}>{pane => <aside class="ui-workbench-workspace" aria-label={paneLabel(pane())}>{pane().content}</aside>}</Show>
      <Show when={props.diagnostics}>{pane => <section class="ui-workbench-diagnostics" aria-label={paneLabel(pane())}>{pane().content}</section>}</Show>
    </div>
  </div>;
}
