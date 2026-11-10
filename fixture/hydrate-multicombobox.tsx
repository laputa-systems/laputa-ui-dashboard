import { hydrate } from "@solidjs/web";
import { MultiCombobox } from "@laputa-systems/ui-dashboard/forms";

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
hydrate(() => <MultiCombobox id="projects" label="Projects" options={[{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }]} value={["a"]} onChange={ids => { document.documentElement.dataset.selected = ids.join(","); }} />, root);
document.documentElement.dataset.reused = String(document.getElementById("projects") === (window as Window & { initialInput?: Element }).initialInput && document.querySelector(".ui-multi-chip-remove") === (window as Window & { initialChip?: Element }).initialChip);
document.documentElement.dataset.hydrated = "yes";
