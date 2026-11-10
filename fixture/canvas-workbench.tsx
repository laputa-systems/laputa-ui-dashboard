import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { SplitPane, Workbench } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [selected, setSelected] = createSignal("Alpha");
  const [navigationOpen, setNavigationOpen] = createSignal(false);
  const [inspectorOpen, setInspectorOpen] = createSignal(false);
  const choose = (name: string) => {
    setSelected(name);
    setNavigationOpen(false);
    setInspectorOpen(true);
  };
  const inspector = <div><h2>Selected node</h2><p data-testid="inspector-selection">{selected()}</p></div>;
  const canvas = <section aria-label="Canvas"><h2>Canvas</h2><p data-testid="canvas-selection">Selected: {selected()}</p><button type="button" onClick={() => choose("Alpha")}>Select Alpha on canvas</button><button type="button" onClick={() => choose("Beta")}>Select Beta on canvas</button></section>;
  const trace = <section aria-label="Run trace"><h2>Run trace</h2><p data-testid="trace-selection">Trace for {selected()}</p></section>;
  return <Workbench navigationDrawer={{ label: "Navigation", control: { open: navigationOpen(), onOpenChange: setNavigationOpen } }} navigation={<nav aria-label="Primary"><a href="/projects">Projects</a></nav>} secondaryNavigation={<nav aria-label="Nodes"><button type="button" onClick={() => choose("Alpha")}>Alpha</button><button type="button" onClick={() => choose("Beta")}>Beta</button></nav>} workspace={{ label: "Inspector", content: inspector, drawer: { open: inspectorOpen(), onOpenChange: setInspectorOpen } }}>
    <h1>Canvas workbench</h1><div style={{ height: "420px", "max-width": "100%" }}><SplitPane label="Canvas and trace" axis="vertical" minSize={100} maxSize={300} minOtherSize={100} defaultSize={220} primary={canvas} secondary={trace} /></div>
  </Workbench>;
}
render(() => <Fixture />, document.getElementById("root")!);
