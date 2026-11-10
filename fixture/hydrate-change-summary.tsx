import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/data.css";
import { createSignal } from "solid-js";
import { hydrate } from "@solidjs/web";
import { ChangeSummary, type ChangeSummaryItem } from "@laputa-systems/ui-dashboard/data";

function Fixture() {
  const [items, setItems] = createSignal<readonly ChangeSummaryItem[]>([{ id: "latency", label: "Latency", value: "120 ms", change: { kind: "known", direction: "decrease", amount: "10 ms", interpretation: "good" } }]);
  (window as Window & { clearSummary?: () => void }).clearSummary = () => { setItems([]); };
  return <ChangeSummary label="Build health" period="Last week" items={items()} />;
}
const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <Fixture />, root);
document.documentElement.dataset.reused = String(document.querySelector("dl") === (window as Window & { initialList?: Element }).initialList);
document.documentElement.dataset.hydrated = "yes";
