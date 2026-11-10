import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { hydrate } from "@solidjs/web";
import { WorkspaceTabs } from "@laputa-systems/ui-dashboard/layout";

const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <WorkspaceTabs label="Artifacts" tabs={[{ id: "first", label: "notes.txt", content: "Artifact body" }]} selectedId="first" onSelect={() => {}} returnFocus={() => null} />, root);
document.documentElement.dataset.reused = String(document.querySelector('[role="tab"]') === (window as Window & { initialTab?: Element }).initialTab);
document.documentElement.dataset.hydrated = "yes";
