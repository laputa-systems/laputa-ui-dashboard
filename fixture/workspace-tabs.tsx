import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { WorkspaceTabs, type WorkspaceTab, type WorkspaceCloseState } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  let opener: HTMLButtonElement | undefined;
  const [draft, setDraft] = createSignal("");
  const [selected, setSelected] = createSignal<string | null>("first");
  const [accept, setAccept] = createSignal(true);
  const [requests, setRequests] = createSignal(0);
  const [defer, setDefer] = createSignal(false);
  const [pending, setPending] = createSignal<string>();
  const [acceptSelection, setAcceptSelection] = createSignal(true);
  const [track, setTrack] = createSignal(false);
  const [closeState, setCloseState] = createSignal<WorkspaceCloseState>({ kind: "idle" });
  const [tabs, setTabs] = createSignal<readonly WorkspaceTab[]>([
    { id: "first", label: "notes.txt", content: <label>Draft <input value={draft()} onInput={event => setDraft(event.currentTarget.value)} /></label>, dirty: true },
    { id: "second", label: "very-long-artifact-filename-that-must-remain-fully-available.txt", content: <p>Second artifact</p> }
  ]);
  const remove = (id: string) => {
    const current = tabs();
    const index = current.findIndex(tab => tab.id === id);
    const remaining = current.filter(tab => tab.id !== id);
    if (selected() === id) setSelected(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
    setTabs(remaining);
  };
  const close = (id: string) => {
    setRequests(count => count + 1);
    if (!accept()) return;
    if (track()) { setPending(id); setCloseState({ kind: "pending", tabId: id }); }
    else if (defer()) setPending(id); else remove(id);
  };
  return <>
    <button type="button" ref={element => { opener = element; }}>Open workspace</button>
    <button type="button" onClick={() => setAccept(false)}>Reject close</button>
    <button type="button" onClick={() => setAcceptSelection(false)}>Reject selection</button>
    <button type="button" onClick={() => setDefer(true)}>Defer close</button>
    <button type="button" onClick={() => setTrack(true)}>Track close</button>
    <button type="button" onClick={() => setCloseState({ kind: "pending", tabId: "first" })}>Force pending close</button>
    <button type="button" onClick={() => { const id = pending(); if (id) setCloseState({ kind: "failed", tabId: id, message: "Could not close artifact" }); }}>Fail tracked close</button>
    <button type="button" onClick={() => { const id = pending(); if (id) { remove(id); setPending(undefined); setCloseState({ kind: "idle" }); } }}>Confirm close</button>
    <button type="button" onClick={() => setTabs(current => [...current].reverse())}>Reverse tabs</button>
    <div style={{ width: "400px", "max-width": "100%" }}><WorkspaceTabs label="Artifacts" tabs={tabs()} selectedId={selected()} onSelect={id => { if (acceptSelection()) setSelected(id); }} onClose={close} closeState={track() ? closeState() : undefined} returnFocus={() => opener ?? null} /></div>
    <output data-testid="close-requests">{requests()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
