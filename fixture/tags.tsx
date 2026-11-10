import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { TagInput, type Tag, type TagAddRequest, type TagEditRequest, type TagRequestState } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [tags, setTags] = createSignal<readonly Tag[]>([{ id: "one", label: "First tag" }]);
  const [state, setState] = createSignal<TagRequestState>({ kind: "idle" });
  const [accept, setAccept] = createSignal(true);
  const [calls, setCalls] = createSignal(0);
  const [submitted, setSubmitted] = createSignal("");
  const [defer, setDefer] = createSignal(false);
  const [last, setLast] = createSignal<TagAddRequest | TagEditRequest>();
  return <>
    <form onSubmit={event => { event.preventDefault(); setSubmitted(new FormData(event.currentTarget).getAll("tag").join("|")); }}>
      <TagInput id="tags" label="Tags" name="tag" value={tags()} maxTags={3} maxLength={20} state={state()} validate={label => label.includes("#") ? "Tags cannot contain #" : undefined} onAdd={request => { setCalls(count => count + 1); setLast(request); if (defer()) setState({ kind: "pending", id: request.id }); else if (accept()) { setTags(current => [...current, ...request.labels.map((label, index) => ({ id: `${current.length + index}`, label }))]); setState({ kind: "accepted", id: request.id }); } else setState({ kind: "failed", id: request.id, message: "Could not add tags" }); }} onEdit={request => { setCalls(count => count + 1); setLast(request); if (defer()) setState({ kind: "pending", id: request.id }); else if (accept()) { setTags(current => current.map(tag => tag.id === request.tagId ? { ...tag, label: request.label } : tag)); setState({ kind: "accepted", id: request.id }); } else setState({ kind: "failed", id: request.id, message: "Could not edit tag" }); }} onRemove={id => setTags(current => current.filter(tag => tag.id !== id))} />
      <button type="submit">Save tags</button><button type="reset">Reset tag draft</button>
    </form>
    <button type="button" onClick={() => setAccept(false)}>Reject tags</button>
    <button type="button" onClick={() => setDefer(true)}>Defer tags</button>
    <button type="button" onClick={() => { const request = last(); if (request) { if ("labels" in request) setTags(current => [...current, ...request.labels.map((label, index) => ({ id: `${current.length + index}`, label }))]); else setTags(current => current.map(tag => tag.id === request.tagId ? { ...tag, label: request.label } : tag)); setState({ kind: "accepted", id: request.id }); } }}>Acknowledge tags</button>
    <output data-testid="tag-calls">{calls()}</output><output data-testid="tag-submitted">{submitted()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
