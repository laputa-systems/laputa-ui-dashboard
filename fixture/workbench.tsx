import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { render } from "@solidjs/web";
import { Workbench } from "@laputa-systems/ui-dashboard/layout";

render(() => <Workbench navigation={<nav aria-label="Primary"><a href="/projects" aria-current="page">Projects</a><a href="/settings">Settings</a></nav>} secondaryNavigation={<nav aria-label="Project"><a href="/projects/alpha">Alpha</a><a href="/projects/beta">Beta</a></nav>} workspace={{ label: "Workspace", content: <p>Artifact details</p> }} diagnostics={{ label: "Diagnostics", content: <p>Run output</p> }}><h1>Conversation</h1><p>Current project</p></Workbench>, document.getElementById("root")!);
