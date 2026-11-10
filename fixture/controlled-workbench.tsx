import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Workbench } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [navigationOpen, setNavigationOpen] = createSignal(false);
  const [inspectorOpen, setInspectorOpen] = createSignal(false);
  const [acceptNavigation, setAcceptNavigation] = createSignal(true);
  const [requests, setRequests] = createSignal(0);
  const [selected, setSelected] = createSignal("Alpha");
  const inspector = <p>Selected: {selected()}</p>;
  return <Workbench navigationDrawer={{ label: "Navigation", control: { open: navigationOpen(), onOpenChange: value => { setRequests(count => count + 1); if (acceptNavigation()) setNavigationOpen(value); } } }} navigation={<nav aria-label="Nodes"><button type="button" onClick={() => { setSelected("Beta"); setNavigationOpen(false); setInspectorOpen(true); }}>Select Beta</button></nav>} workspace={{ label: "Inspector", content: inspector, drawer: { open: inspectorOpen(), onOpenChange: setInspectorOpen } }}>
    <h1>Controlled workspace</h1><button type="button" onClick={() => setInspectorOpen(true)}>Inspect selection</button><button type="button" onClick={() => setInspectorOpen(false)}>Dismiss inspector</button><button type="button" onClick={() => setAcceptNavigation(false)}>Reject navigation changes</button><output data-testid="navigation-requests">{requests()}</output>
  </Workbench>;
}
render(() => <Fixture />, document.getElementById("root")!);
