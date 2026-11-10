import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { TagInput, type Tag, type TagAddRequest, type TagRequestState } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [tags, setTags] = createSignal<readonly Tag[]>([{ id: "one", label: "First tag" }]);
  const [state, setState] = createSignal<TagRequestState>({ kind: "idle" });
  const [accept, setAccept] = createSignal(true);
  const [calls, setCalls] = createSignal(0);
  const [submitted, setSubmitted] = createSignal("");
  const [defer, setDefer] = createSignal(false);
  const [last, setLast] = createSignal<TagAddRequest>();
  return <>
    <form onSubmit={event => { event.preventDefault(); setSubmitted(new FormData(event.currentTarget).getAll("tag").join("|")); }}>
      <TagInput id="tags" label="Tags" name="tag" value={tags()} maxTags={3} maxLength={20} state={state()} validate={label => label.includes("#") ? "Tags cannot contain #" : undefined} onAdd={request => { setCalls(count => count + 1); setLast(request); if (defer()) setState({ kind: "pending", id: request.id }); else if (accept()) { setTags(current => [...current, ...request.labels.map((label, index) => ({ id: `${current.length + index}`, label }))]); setState({ kind: "accepted", id: request.id }); } else setState({ kind: "failed", id: request.id, message: "Could not add tags" }); }} onRemove={id => setTags(current => current.filter(tag => tag.id !== id))} />
      <button type="submit">Save tags</button>
    </form>
    <button type="button" onClick={() => setAccept(false)}>Reject tags</button>
    <button type="button" onClick={() => setDefer(true)}>Defer tags</button>
    <button type="button" onClick={() => { const request = last(); if (request) { setTags(current => [...current, ...request.labels.map((label, index) => ({ id: `${current.length + index}`, label }))]); setState({ kind: "accepted", id: request.id }); } }}>Acknowledge tags</button>
    <output data-testid="tag-calls">{calls()}</output><output data-testid="tag-submitted">{submitted()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
