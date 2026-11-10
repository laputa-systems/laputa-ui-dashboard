import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal, Show } from "solid-js";
import { render } from "@solidjs/web";
import { Modal } from "@laputa-systems/ui-dashboard";
import { CommandMenu, type CommandGroup } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [scopePresent, setScopePresent] = createSignal(true);
  const [modal, setModal] = createSignal(false);
  const [integrationRemoved, setIntegrationRemoved] = createSignal(false);
  const [removed, setRemoved] = createSignal(false);
  const [selected, setSelected] = createSignal("");
  const groups = (): readonly CommandGroup[] => [
    { id: "navigation", label: "Navigation", commands: [
      { id: "overview", label: "Open overview", keywords: ["home", "summary"] },
      { id: "billing", label: "Open billing", disabled: true },
      ...(removed() ? [] : [{ id: "projects", label: "Open projects", keywords: ["repository"] }])
    ] },
    { id: "actions", label: "Actions", commands: [
      { id: "create", label: "Create project" },
      ...(integrationRemoved() ? [] : [{ kind: "submenu" as const, id: "integrations", label: "Integrations", keywords: ["connect"], commands: [{ id: "github", label: "Connect GitHub", keywords: ["repository"] }, { id: "locked-integration", label: "Connect locked service", disabled: true }, { id: "slack", label: "Connect Slack" }] }])
    ] }
  ];
  return <>
    <label>Outside input <input /></label>
    <CommandMenu label="Commands" groups={groups()} onSelect={setSelected} shortcut={{ key: "k", modifier: "Control" }}><Show when={scopePresent()}><button type="button">Scope action</button></Show><label>Scope input <input /></label><div contentEditable tabindex="0" role="textbox" aria-label="Scope editor">Editable</div></CommandMenu>
    <button type="button" onClick={() => setScopePresent(false)}>Remove scope action</button>
    <button type="button" onClick={() => setRemoved(true)}>Remove projects command</button>
    <button type="button" onClick={() => setIntegrationRemoved(true)}>Remove integrations</button>
    <button type="button" onClick={() => setIntegrationRemoved(false)}>Restore integrations</button>
    <button type="button" onClick={() => setModal(true)}>Open parent</button>
    <Show when={modal()}><Modal title="Parent" label="Parent" onClose={() => setModal(false)}><CommandMenu label="Nested commands" groups={groups()} onSelect={setSelected} /></Modal></Show>
    <output data-testid="command-selected">{selected()}</output>
  </>;
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
