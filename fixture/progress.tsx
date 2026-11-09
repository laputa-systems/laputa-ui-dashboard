import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/feedback.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Progress } from "@laputa-systems/ui-dashboard/feedback";

function Fixture() {
  const [value, setValue] = createSignal<number | undefined>(undefined);
  return (
    <>
      <Progress label="Upload" value={value()} max={10} />
      <button type="button" onClick={() => setValue(0)}>Start</button>
      <button type="button" onClick={() => setValue(5)}>Half done</button>
      <button type="button" onClick={() => setValue(undefined)}>Unknown</button>
    </>
  );
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
