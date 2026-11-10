import { hydrate } from "@solidjs/web";
import { Checkbox } from "@laputa-systems/ui-dashboard/forms";

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
hydrate(() => <Checkbox id="all" label="Select all" hint="All records" checked={false} indeterminate onCheckedChange={checked => { document.documentElement.dataset.requested = String(checked); }} />, root);
document.documentElement.dataset.reused = String(document.getElementById("all") === (window as Window & { initialCheckbox?: Element }).initialCheckbox);
document.documentElement.dataset.hydrated = "yes";
