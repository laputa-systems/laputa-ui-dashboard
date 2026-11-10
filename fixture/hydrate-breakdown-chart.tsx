import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/data.css";
import { hydrate } from "@solidjs/web";
import { BreakdownChart } from "@laputa-systems/ui-dashboard/data";

const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <BreakdownChart label="Builds" series={[{ id: "built", label: "Built" }]} categories={[{ id: "first", label: "First", values: [{ seriesId: "built", value: 3 }] }]} formatValue={value => `${value} jobs`} />, root);
document.documentElement.dataset.reused = String(document.querySelector("table") === (window as Window & { initialTable?: Element }).initialTable);
document.documentElement.dataset.hydrated = "yes";
