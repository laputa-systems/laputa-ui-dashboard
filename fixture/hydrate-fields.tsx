import { hydrate } from "@solidjs/web";
import { TextField } from "@laputa-systems/ui-dashboard/forms";

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
hydrate(() => <><TextField id="project" label="Project" hint="Project hint" onInput={event => { document.documentElement.dataset.edited = event.currentTarget.value; }} /><TextField id="project-hint" label="Project note" hint="Note hint" /></>, root);
document.documentElement.dataset.reused = String(document.getElementById("project") === (window as Window & { initialField?: Element }).initialField);
document.documentElement.dataset.after = [...document.querySelectorAll("[id]")].map(element => element.id).join("|");
document.documentElement.dataset.hydrated = "yes";
