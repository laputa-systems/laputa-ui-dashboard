import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { ArtifactPreview, SplitPane, Workbench, WorkspaceTabs, type WorkspaceTab } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  let opener: HTMLButtonElement | undefined;
  const [workspaceOpen, setWorkspaceOpen] = createSignal(true);
  const [size, setSize] = createSignal(220);
  const [draft, setDraft] = createSignal("");
  const [selected, setSelected] = createSignal<string | null>("notes");
  const closeWorkspace = () => { setWorkspaceOpen(false); queueMicrotask(() => opener?.focus()); };
  const notes = <ArtifactPreview label="Notes preview" state={{ kind: "ready", dirty: true, content: <label>Notes draft <input value={draft()} onInput={event => setDraft(event.currentTarget.value)} /></label> }} actions={<button type="button" onClick={closeWorkspace}>Close workspace</button>} />;
  const log = <ArtifactPreview label="Log preview" state={{ kind: "ready", content: <pre>Build passed</pre> }} />;
  const [tabs, setTabs] = createSignal<readonly WorkspaceTab[]>([{ id: "notes", label: "notes.txt", dirty: true, content: notes }, { id: "log", label: "build.log", content: log }]);
  const workspaceContent = <WorkspaceTabs label="Artifacts" tabs={tabs()} selectedId={selected()} onSelect={setSelected} onClose={id => {
    const current = tabs();
    const index = current.findIndex(tab => tab.id === id);
    const remaining = current.filter(tab => tab.id !== id);
    if (selected() === id) setSelected(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
    setTabs(remaining);
    if (remaining.length === 0) closeWorkspace();
  }} returnFocus={() => opener ?? null} />;
  return <Workbench appearance="inset" navigationDrawer={{ label: "Navigation" }} navigation={<nav aria-label="Primary"><a href="/projects" aria-current="page">Projects</a></nav>} secondaryNavigation={<nav aria-label="Project"><a href="/projects/alpha">Alpha</a></nav>} workspace={workspaceOpen() ? { label: "Workspace", content: workspaceContent, drawer: true } : undefined}>
    <h1>Project workbench</h1>
    <button type="button" ref={element => { opener = element; }} onClick={() => setWorkspaceOpen(true)}>Open workspace area</button>
    <div style={{ height: "350px", "max-width": "100%" }}><SplitPane label="Project columns" axis="horizontal" minSize={80} maxSize={400} minOtherSize={100} defaultSize={220} size={size()} onSizeChange={setSize} primary={<p>Project list</p>} secondary={<p>Project details</p>} /></div>
  </Workbench>;
}

render(() => <Fixture />, document.getElementById("root")!);
