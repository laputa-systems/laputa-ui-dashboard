import { createSignal } from "solid-js";
import { hydrate } from "@solidjs/web";
import { Button } from "../../dist/index.js";

interface FixtureWindow extends Window {
  initialButton?: Element | null;
  hydratedClicks?: number;
  updateHydrated?: () => void;
}

function Fixture() {
  const [title, setTitle] = createSignal<string | undefined>("server title");
  const win = window as FixtureWindow;
  win.updateHydrated = () => setTitle("hydrated title");
  return (
    <Button
      data-testid="target"
      title={title()}
      form="editor"
      name="action"
      value="save"
      aria-describedby="hint"
      style={{ color: "red" }}
      leadingIcon="*"
      onClick={() => { win.hydratedClicks = (win.hydratedClicks ?? 0) + 1; }}
    >
      Hydrate
    </Button>
  );
}

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
const win = window as FixtureWindow;
win.initialButton = root.querySelector("button");
hydrate(() => <Fixture />, root);
document.documentElement.dataset.reused = String(root.querySelector("button") === win.initialButton);
document.documentElement.dataset.hydrated = "yes";
