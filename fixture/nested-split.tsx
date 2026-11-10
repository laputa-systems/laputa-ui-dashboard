import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { render } from "@solidjs/web";
import { SplitPane } from "@laputa-systems/ui-dashboard/layout";

render(() => <>
  <div style={{ width: "800px", height: "420px" }}>
    <SplitPane label="Outer horizontal" axis="horizontal" minSize={200} maxSize={500} minOtherSize={150} defaultSize={380} primary={<SplitPane label="Inner vertical" axis="vertical" minSize={80} maxSize={250} minOtherSize={80} defaultSize={150} primary={<div>Top</div>} secondary={<div>Bottom</div>} />} secondary={<div>Right</div>} />
  </div>
  <div style={{ width: "800px", height: "420px" }}>
    <SplitPane label="Outer vertical" axis="vertical" minSize={150} maxSize={300} minOtherSize={80} defaultSize={240} primary={<SplitPane label="Inner horizontal" axis="horizontal" minSize={120} maxSize={400} minOtherSize={120} defaultSize={250} primary={<div>Left</div>} secondary={<div>Right</div>} />} secondary={<div>Bottom</div>} />
  </div>
</>, document.getElementById("root")!);
