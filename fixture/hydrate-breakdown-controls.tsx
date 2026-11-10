import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/data.css";
import { createSignal } from "solid-js";
import { hydrate } from "@solidjs/web";
import { BreakdownChart } from "@laputa-systems/ui-dashboard/data";

const options = [{ id: "one", label: "One" }, { id: "two", label: "Two" }];
function Fixture() {
  const [measure, setMeasure] = createSignal("one");
  const [selected, setSelected] = createSignal<readonly string[]>(["built"]);
  return <BreakdownChart label="Builds" series={[{ id: "built", label: "Built" }]} categories={[{ id: "first", label: "First", values: [{ seriesId: "built", value: 3 }] }]} formatValue={value => String(value)} dimensions={{ measure: { label: "Measure", value: measure(), options, onChange: setMeasure }, category: { label: "Category", value: "one", options }, stack: { label: "Stack", value: "one", options } }} seriesSelection={{ selectedIds: selected(), onChange: setSelected }} />;
}
const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <Fixture />, root);
document.documentElement.dataset.reused = String(document.querySelector("table") === (window as Window & { initialTable?: Element }).initialTable);
document.documentElement.dataset.hydrated = "yes";
