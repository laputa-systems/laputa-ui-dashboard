import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { hydrate } from "@solidjs/web";
import { Workbench } from "@laputa-systems/ui-dashboard/layout";

const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <Workbench navigationDrawer={{ label: "Navigation" }} navigation="Navigation content">Main content</Workbench>, root);
document.documentElement.dataset.reused = String(document.querySelector(".ui-workbench-navigation") === (window as Window & { initialNavigation?: Element }).initialNavigation);
document.documentElement.dataset.hydrated = "yes";
