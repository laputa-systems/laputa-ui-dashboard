import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal, Show } from "solid-js";
import { render } from "@solidjs/web";
import { ActionMenu } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [selection, setSelection] = createSignal("");
  const [disabled, setDisabled] = createSignal(false);
  const [visible, setVisible] = createSignal(true);
  return (
    <>
      <label>Search <input /></label>
      <Show when={visible()}><div data-testid="menu-clip" style="width: 200px; height: 50px; overflow: auto;">
        <ActionMenu label="Actions" items={[
          { id: "open", label: "Open", disabled: disabled() },
          { id: "locked", label: "Unavailable", disabled: true },
          { id: "rename", label: "Rename", disabled: disabled() },
          { id: "remove", label: "Remove", disabled: disabled() }
        ]} onSelect={setSelection} />
        <div style="height: 120px"></div>
      </div></Show>
      <button type="button" onClick={() => setVisible(!visible())}>Toggle menu mount</button>
      <button type="button" onClick={() => setDisabled(true)}>Disable all</button>
      <label>Next input <input /></label>
      <output data-testid="selection">{selection()}</output>
    </>
  );
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
