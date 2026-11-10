import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { hydrate } from "@solidjs/web";
import { SplitPane } from "@laputa-systems/ui-dashboard/layout";

const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <SplitPane label="Split" axis="horizontal" minSize={20} maxSize={200} minOtherSize={20} defaultSize={100} primary="First" secondary="Second" />, root);
document.documentElement.dataset.reused = String(document.querySelector('[role="separator"]') === (window as Window & { initialSeparator?: Element }).initialSeparator);
document.documentElement.dataset.hydrated = "yes";
