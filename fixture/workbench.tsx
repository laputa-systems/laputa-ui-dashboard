import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal, Show } from "solid-js";
import { render } from "@solidjs/web";
import { Popover, Workbench } from "@laputa-systems/ui-dashboard/layout";
import { Icon } from "@laputa-systems/ui-dashboard";

function Fixture() {
  const [enabled, setEnabled] = createSignal(true);
  const [mounted, setMounted] = createSignal(true);
  const [label, setLabel] = createSignal("Navigation");
  return <>
    <button type="button" onClick={() => setEnabled(false)}>Disable drawer</button>
    <button type="button" onClick={() => setLabel("Workspace navigation")}>Rename drawer</button>
    <button type="button" onClick={() => setMounted(false)}>Unmount workbench</button>
    <Show when={mounted()}><Workbench navigationDrawer={enabled() ? { label: label() } : undefined} navigation={<nav aria-label="Primary"><a href="/projects" aria-label="Projects" aria-current="page"><Icon name="host" /></a><a href="/settings" aria-label="Settings"><Icon name="info" /></a></nav>} secondaryNavigation={<nav aria-label="Project"><a href="/projects/alpha">Alpha</a><a href="/projects/beta">Beta</a><Popover label="Project help" trigger="Help">Help content</Popover></nav>} workspace={{ label: "Workspace", content: <p>Artifact details</p> }} diagnostics={{ label: "Diagnostics", content: <p>Run output</p> }}><h1>Conversation</h1><p>Current project</p></Workbench></Show>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
