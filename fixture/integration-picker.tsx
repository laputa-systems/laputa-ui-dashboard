import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/recipes.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { IntegrationPicker, type IntegrationConnection } from "@laputa-systems/ui-dashboard/recipes";

function Fixture() {
  const [connection, setConnection] = createSignal<IntegrationConnection>({ kind: "disconnected" });
  const [calls, setCalls] = createSignal(0);
  const [showAlpha, setShowAlpha] = createSignal(true);
  return <>
    <IntegrationPicker label="Add integration" integrations={[
      ...(showAlpha() ? [{ id: "alpha", label: "Alpha", description: "Connect an alpha service", keywords: ["metrics"], connection: connection() }] : []),
      { id: "beta", label: "Beta", description: "Connect a beta service", connection: { kind: "connected" } },
      { id: "gamma", label: "Gamma", description: "A service requiring attention", connection: { kind: "expired", message: "Authorization expired" } },
      { id: "long", label: "Long service", description: "long".repeat(100), connection: { kind: "disconnected" } }
    ]} onConnect={() => setCalls(count => count + 1)} />
    <IntegrationPicker label="Browse only" integrations={[{ id: "locked", label: "Locked", description: "No connection action", connection: { kind: "disconnected" } }]} />
    <button type="button" onClick={() => setShowAlpha(value => !value)}>Toggle Alpha</button>
    <button type="button" onClick={() => setConnection({ kind: "pending" })}>Mark connection pending</button>
    <button type="button" onClick={() => setConnection({ kind: "failed", message: "Connection failed" })}>Fail connection</button>
    <button type="button" onClick={() => setConnection({ kind: "connected" })}>Acknowledge connection</button>
    <output data-testid="connection-calls">{calls()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
