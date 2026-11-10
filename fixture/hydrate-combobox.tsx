import { hydrate } from "@solidjs/web";
import { Combobox } from "@laputa-systems/ui-dashboard/forms";

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
hydrate(() => <Combobox id="project" label="Project" options={[{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }]} value="b" onChange={id => { document.documentElement.dataset.selected = id ?? ""; }} />, root);
document.documentElement.dataset.reused = String(document.getElementById("project") === (window as Window & { initialCombobox?: Element }).initialCombobox);
document.documentElement.dataset.hydrated = "yes";
