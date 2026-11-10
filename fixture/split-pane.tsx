import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal, Show } from "solid-js";
import { render } from "@solidjs/web";
import { SplitPane } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [show, setShow] = createSignal(true);
  const [size, setSize] = createSignal(240);
  const [accept, setAccept] = createSignal(true);
  const [calls, setCalls] = createSignal(0);
  const [width, setWidth] = createSignal(800);
  return <>
    <Show when={show()}><div data-testid="split-container" style={{ width: `${width()}px`, "max-width": "100%", height: "300px" }}>
      <SplitPane label="Project split" axis="horizontal" minSize={120} maxSize={600} minOtherSize={160} defaultSize={240} size={size()} onSizeChange={value => { setCalls(count => count + 1); if (accept()) setSize(value); }} primary={<p>Project list</p>} secondary={<p>Project detail</p>} />
    </div></Show>
    <div style={{ width: "400px", "max-width": "100%", height: "350px" }}><SplitPane label="Timeline split" axis="vertical" minSize={50} maxSize={200} minOtherSize={50} defaultSize={100} primary={<p>Timeline</p>} secondary={<p>Output</p>} /></div>
    <div style={{ width: "400px", "max-width": "100%", height: "200px" }}><SplitPane label="Locked split" axis="horizontal" minSize={50} maxSize={200} minOtherSize={50} defaultSize={100} size={100} primary={<p>Locked first</p>} secondary={<p>Locked second</p>} /></div>
    <button type="button" onClick={() => setShow(false)}>Unmount split</button>
    <button type="button" onClick={() => setAccept(false)}>Reject resize</button>
    <button type="button" onClick={() => setWidth(320)}>Narrow split</button>
    <button type="button" onClick={() => setWidth(80)}>Constrain split</button>
    <button type="button" onClick={() => setWidth(800)}>Expand split</button>
    <output data-testid="split-calls">{calls()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
