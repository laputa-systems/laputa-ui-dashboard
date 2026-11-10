import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Workbench } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [available, setAvailable] = createSignal(true);
  const [drawer, setDrawer] = createSignal(true);
  const [label, setLabel] = createSignal("Workspace");
  const artifact = <button type="button">Artifact action</button>;
  return <>
    <button type="button" onClick={() => setAvailable(false)}>Remove workspace</button>
    <button type="button" onClick={() => setAvailable(true)}>Restore workspace</button>
    <button type="button" onClick={() => setDrawer(false)}>Disable workspace drawer</button>
    <button type="button" onClick={() => setLabel("Artifact workspace")}>Rename workspace</button>
    <Workbench navigationDrawer={{ label: "Navigation" }} navigation={<nav aria-label="Primary"><a href="/projects">Projects</a></nav>} workspace={available() ? { label: label(), content: artifact, drawer: drawer() } : undefined}><h1>Projects</h1></Workbench>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
