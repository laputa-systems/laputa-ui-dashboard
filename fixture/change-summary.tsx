import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/data.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { ChangeSummary, type ChangeSummaryItem } from "@laputa-systems/ui-dashboard/data";

const initial: readonly ChangeSummaryItem[] = [{ id: "latency", label: "Latency", value: "120 ms", change: { kind: "known", amount: "10 ms", direction: "decrease", interpretation: "good" } }, { id: "coverage", label: "Coverage", value: "80%", change: { kind: "known", amount: "5%", direction: "decrease", interpretation: "bad" } }, { id: "attempts", label: "Attempts", value: "0", change: { kind: "known", direction: "unchanged", interpretation: "neutral" } }, { id: "unknown", label: "An exceptionally long metric identifier that must wrap within the summary", value: "Unavailable", change: { kind: "unavailable", message: "No comparison available" } }];
function Fixture() {
  const [items, setItems] = createSignal(initial);
  return <><button type="button" onClick={() => setItems([])}>Clear summary</button><div data-testid="container" style={{ width: "100%", "max-width": "100%" }}><ChangeSummary label="Build health" period="Compared with the previous week" items={items()} /></div></>;
}
render(() => <Fixture />, document.getElementById("root")!);
