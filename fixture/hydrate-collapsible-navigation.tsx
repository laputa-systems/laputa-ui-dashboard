import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { hydrate } from "@solidjs/web";
import { Workbench } from "@laputa-systems/ui-dashboard/layout";

const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <Workbench navigation="Navigation" secondaryNavigation="Project links" secondaryNavigationCollapse={{ label: "Project navigation", defaultOpen: false }}>Main content</Workbench>, root);
document.documentElement.dataset.reused = String(document.querySelector(".ui-workbench-secondary-disclosure") === (window as Window & { initialDetails?: Element }).initialDetails);
document.documentElement.dataset.hydrated = "yes";
