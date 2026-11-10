import { hydrate } from "@solidjs/web";
import { ActionMenu } from "@laputa-systems/ui-dashboard/layout";

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
hydrate(() => <ActionMenu label="Actions" items={[{ id: "open", label: "Open" }]} onSelect={id => { document.documentElement.dataset.selected = id; }} />, root);
document.documentElement.dataset.reused = String(document.querySelector('[aria-haspopup="menu"]') === (window as Window & { initialTrigger?: Element }).initialTrigger);
document.documentElement.dataset.hydrated = "yes";
