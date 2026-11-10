import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { hydrate } from "@solidjs/web";
import { Tooltip } from "@laputa-systems/ui-dashboard/layout";

const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <Tooltip label="Information" content="Additional detail">Info</Tooltip>, root);
document.documentElement.dataset.reused = String(document.querySelector("button") === (window as Window & { initialTooltipTrigger?: Element }).initialTooltipTrigger);
document.documentElement.dataset.hydrated = "yes";
