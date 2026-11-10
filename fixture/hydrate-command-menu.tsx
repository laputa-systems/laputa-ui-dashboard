import { hydrate } from "@solidjs/web";
import { CommandMenu } from "@laputa-systems/ui-dashboard/layout";

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
hydrate(() => <CommandMenu label="Commands" groups={[{ id: "actions", label: "Actions", commands: [{ id: "open", label: "Open" }] }]} onSelect={id => { document.documentElement.dataset.selected = id; }} />, root);
document.documentElement.dataset.reused = String(document.querySelector(".ui-command-menu > button") === (window as Window & { initialTrigger?: Element }).initialTrigger);
document.documentElement.dataset.hydrated = "yes";
