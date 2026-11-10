import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { hydrate } from "@solidjs/web";
import { TextField } from "@laputa-systems/ui-dashboard/forms";

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
hydrate(() => <TextField id="project" label="Project" defaultValue="abc" leadingContent="https://" hint="Help" showCount onInput={event => { document.documentElement.dataset.edited = event.currentTarget.value; }} />, root);
document.documentElement.dataset.reused = String(document.getElementById("project") === (window as Window & { initialField?: Element }).initialField);
document.documentElement.dataset.hydrated = "yes";
