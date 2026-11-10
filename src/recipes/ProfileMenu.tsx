import type { JSX } from "@solidjs/web";
import { Progress, type ProgressProps } from "../feedback/Progress";
import { ActionMenu, type ActionMenuItem } from "../layout/ActionMenu";

export interface ProfileAccount {
  readonly name: string;
  readonly detail?: string | undefined;
  readonly avatar?: JSX.Element | undefined;
}

export interface ProfileMenuProps {
  readonly label: string;
  readonly account: ProfileAccount;
  readonly items: readonly ActionMenuItem[];
  readonly progress?: ProgressProps | undefined;
  readonly onSelect?: ((id: string) => void) | undefined;
  readonly class?: string | undefined;
}

export function ProfileMenu(props: ProfileMenuProps): JSX.Element {
  return <ActionMenu class={["ui-profile-menu", props.class].filter(Boolean).join(" ")} label={props.label} items={props.items.map(item => item.href === undefined && !props.onSelect ? { ...item, disabled: true } : item)} onSelect={id => props.onSelect?.(id)} header={<div class="ui-profile-header">
    {props.account.avatar && <span class="ui-profile-avatar" aria-hidden="true">{props.account.avatar}</span>}
    <div class="ui-profile-account"><strong>{props.account.name}</strong>{props.account.detail && <span>{props.account.detail}</span>}</div>
    {props.progress && <Progress {...props.progress} />}
  </div>} />;
}
