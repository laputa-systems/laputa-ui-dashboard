import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/feedback.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { ActionStatus, type ActionState } from "@laputa-systems/ui-dashboard/feedback";

function Fixture() {
  const [attempts, setAttempts] = createSignal(0);
  const [state, setState] = createSignal<ActionState>({ kind: "idle" });
  const retry = () => {
    setAttempts(count => count + 1);
    setState({ kind: "pending", message: "Saving" });
  };
  return (
    <>
      <label>Draft <input value="Original draft" /></label>
      <button onClick={() => setState({ kind: "pending", message: "Saving" })}>Start save</button>
      <button onClick={() => setState({ kind: "failed", message: "Save failed", retry })}>Reject save</button>
      <button onClick={() => setState({ kind: "succeeded", message: "Saved" })}>Acknowledge save</button>
      <button onClick={() => setState({ kind: "unavailable", message: "Saving unavailable" })}>Disable saving</button>
      <ActionStatus state={state()} />
      <output data-testid="retry-attempts">{attempts()}</output>
    </>
  );
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
