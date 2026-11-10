import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { hydrate } from "@solidjs/web";
import { SaveBar, SettingsRow, type SaveBarState } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [state, setState] = createSignal<SaveBarState>({ kind: "dirty" });
  return <SettingsRow label="Identity" description="Help"><SaveBar state={state()} onSave={() => setState({ kind: "saving" })} /></SettingsRow>;
}
const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <Fixture />, root);
document.documentElement.dataset.reused = String(document.querySelector('[role="group"]') === (window as Window & { initialGroup?: Element }).initialGroup);
document.documentElement.dataset.hydrated = "yes";
