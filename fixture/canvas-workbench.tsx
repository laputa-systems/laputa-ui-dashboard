import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { SplitPane, Workbench } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [selected, setSelected] = createSignal("Alpha");
  const choose = (name: string, button: HTMLButtonElement) => {
    setSelected(name);
    const dialog = button.closest("dialog");
    if (dialog) {
      dialog.close();
      document.querySelector<HTMLButtonElement>(`[aria-controls="${dialog.id}"]`)?.focus();
    }
  };
  const inspector = <div><h2>Selected node</h2><p data-testid="inspector-selection">{selected()}</p></div>;
  const canvas = <section aria-label="Canvas"><h2>Canvas</h2><p data-testid="canvas-selection">Selected: {selected()}</p><button type="button" onClick={event => choose("Alpha", event.currentTarget)}>Select Alpha on canvas</button><button type="button" onClick={event => choose("Beta", event.currentTarget)}>Select Beta on canvas</button></section>;
  const trace = <section aria-label="Run trace"><h2>Run trace</h2><p data-testid="trace-selection">Trace for {selected()}</p></section>;
  return <Workbench navigationDrawer={{ label: "Navigation" }} navigation={<nav aria-label="Primary"><a href="/projects">Projects</a></nav>} secondaryNavigation={<nav aria-label="Nodes"><button type="button" onClick={event => choose("Alpha", event.currentTarget)}>Alpha</button><button type="button" onClick={event => choose("Beta", event.currentTarget)}>Beta</button></nav>} workspace={{ label: "Inspector", content: inspector, drawer: true }}>
    <h1>Canvas workbench</h1><div style={{ height: "420px", "max-width": "100%" }}><SplitPane label="Canvas and trace" axis="vertical" minSize={100} maxSize={300} minOtherSize={100} defaultSize={220} primary={canvas} secondary={trace} /></div>
  </Workbench>;
}
render(() => <Fixture />, document.getElementById("root")!);
