import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { hydrate } from "@solidjs/web";
import { Popover } from "@laputa-systems/ui-dashboard/layout";

const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <Popover label="Help" trigger="Open help">Help content</Popover>, root);
document.documentElement.dataset.reused = String(document.querySelector("button") === (window as Window & { initialPopoverTrigger?: Element }).initialPopoverTrigger);
document.documentElement.dataset.hydrated = "yes";
