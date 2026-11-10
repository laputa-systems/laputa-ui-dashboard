import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Workbench } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [open, setOpen] = createSignal(true);
  const [requests, setRequests] = createSignal(0);
  return <>
    <button type="button" onClick={() => setOpen(false)}>Close externally</button>
    <output data-testid="requests">{requests()}</output>
    <Workbench navigationDrawer={{ label: "Navigation" }} navigation={<nav aria-label="Primary"><a href="/projects">Projects</a></nav>} secondaryNavigation={<nav aria-label="Project"><a href="/projects/alpha">Alpha</a></nav>} secondaryNavigationCollapse={{ label: "Project navigation", open: open(), onOpenChange: next => { setRequests(count => count + 1); setOpen(next); } }}><h1>Project</h1></Workbench>
    <Workbench navigation={<nav aria-label="Local primary"><a href="/local">Local</a></nav>} secondaryNavigation={<nav aria-label="Local project"><a href="/local/one">One</a></nav>} secondaryNavigationCollapse={{ label: "Local navigation", defaultOpen: false }}><h2>Local</h2></Workbench>
    <Workbench navigation="Primary" secondaryNavigation={<nav aria-label="Locked project"><a href="/locked">Locked</a></nav>} secondaryNavigationCollapse={{ label: "Locked navigation", open: false }}><h2>Locked</h2></Workbench>
  </>;
}
render(() => <Fixture />, document.getElementById("root")!);
