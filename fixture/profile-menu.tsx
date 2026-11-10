import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/feedback.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import "@laputa-systems/ui-dashboard/styles/recipes.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { ProfileMenu } from "@laputa-systems/ui-dashboard/recipes";

function Fixture() {
  const [action, setAction] = createSignal("");
  return <>
    <ProfileMenu label="Account menu" account={{ name: "Ada Lovelace", detail: "ada@example.test", avatar: <span>AL</span> }} progress={{ label: "Setup", value: 2, max: 4 }} items={[{ id: "settings", label: "Settings", href: "/account" }, { id: "signout", label: "Sign out" }, { id: "locked", label: "Unavailable", disabled: true }]} onSelect={setAction} />
    <ProfileMenu label="Read-only profile" account={{ name: "long".repeat(100) }} items={[{ id: "settings", label: "Settings", href: "/account" }, { id: "signout", label: "Sign out" }]} />
    <ProfileMenu label="Profile without actions" account={{ name: "No actions" }} items={[]} />
    <output data-testid="profile-action">{action()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
