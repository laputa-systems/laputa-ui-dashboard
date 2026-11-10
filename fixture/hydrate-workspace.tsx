import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { hydrate } from "@solidjs/web";
import { Workbench } from "@laputa-systems/ui-dashboard/layout";

const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <Workbench navigation="Navigation content" workspace={{ label: "Workspace", content: "Workspace content", drawer: true }}>Main content</Workbench>, root);
document.documentElement.dataset.reused = String(document.querySelector(".ui-workbench-workspace") === (window as Window & { initialWorkspace?: Element }).initialWorkspace);
document.documentElement.dataset.hydrated = "yes";
