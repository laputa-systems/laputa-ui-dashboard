import type { JSX } from "@solidjs/web";

export interface ProgressProps {
  readonly label: string;
  readonly value?: number | undefined;
  readonly max?: number | undefined;
  readonly class?: string | undefined;
}

export function Progress(props: ProgressProps): JSX.Element {
  const max = () => {
    const limit = props.max ?? 100;
    if (!Number.isFinite(limit) || limit <= 0) throw new RangeError("Progress max must be a positive finite number");
    return limit;
  };
  const value = () => {
    const current = props.value;
    if (current !== undefined && (!Number.isFinite(current) || current < 0 || current > max())) {
      throw new RangeError("Progress value must be finite and between zero and max");
    }
    return current;
  };
  return (
    <label class={["ui-progress", props.class].filter(Boolean).join(" ")}>
      <span class="ui-progress-label">{props.label}</span>
      <progress class="ui-progress-bar" value={value()} max={max()} />
    </label>
  );
}
