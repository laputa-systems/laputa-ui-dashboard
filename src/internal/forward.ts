import { assign, effect, readShallow, ref } from "@solidjs/web";

export type OmittedProp = (key: string) => boolean;

type ElementRef = (element: Element) => void;

function isElementRef(value: unknown): value is ElementRef | ElementRef[] {
  return typeof value === "function" || Array.isArray(value);
}

export function restProps(props: object, omitted: OmittedProp): Record<string, unknown> {
  const rest: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (omitted(key)) continue;
    const value = (props as Record<string, unknown>)[key];
    rest[key] = import.meta.env.SSR || key !== "style" ? value : readShallow(value);
  }
  return rest;
}

export function forwardProps(node: HTMLElement, props: object, omitted: OmittedProp): void {
  const previous: Record<string, unknown> = {};
  effect(() => restProps(props, omitted), next => {
    const consumerRef = next.ref;
    if (consumerRef !== previous.ref && isElementRef(consumerRef)) ref(() => consumerRef, node);
    assign(node, next, true, previous, true);
  });
}
