import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { hydrate } from "@solidjs/web";
import { TextArea } from "@laputa-systems/ui-dashboard/forms";

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
hydrate(() => <TextArea id="notes" label="Notes" hint="Help" defaultValue="Start" showCount autosize={{ minRows: 2, maxRows: 4 }} onInput={event => { document.documentElement.dataset.edited = event.currentTarget.value; }} />, root);
document.documentElement.dataset.reused = String(document.getElementById("notes") === (window as Window & { initialTextArea?: Element }).initialTextArea);
document.documentElement.dataset.hydrated = "yes";
