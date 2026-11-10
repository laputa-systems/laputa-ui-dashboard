import { For } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface Breadcrumb {
  readonly label: string;
  readonly href: string;
}

export interface BreadcrumbsProps {
  readonly ancestors: readonly Breadcrumb[];
  readonly current: string;
  readonly label?: string | undefined;
  readonly class?: string | undefined;
}

export function Breadcrumbs(props: BreadcrumbsProps): JSX.Element {
  const ancestors = () => {
    if (!props.current.trim() || (props.label !== undefined && !props.label.trim())) throw new Error("Breadcrumb labels must be nonempty");
    for (const item of props.ancestors) {
      if (!item.label.trim() || !item.href || item.href !== item.href.trim() || !["http:", "https:"].includes(new URL(item.href, "https://ui.invalid").protocol)) throw new Error("Invalid breadcrumb label or URL");
    }
    return props.ancestors;
  };
  return <nav class={["ui-breadcrumbs", props.class].filter(Boolean).join(" ")} aria-label={props.label ?? "Breadcrumb"}>
    <ol><For each={ancestors()}>{item => <li><a href={item.href}>{item.label}</a><span class="ui-breadcrumb-separator" aria-hidden="true">/</span></li>}</For><li><span aria-current="page">{props.current}</span></li></ol>
  </nav>;
}
