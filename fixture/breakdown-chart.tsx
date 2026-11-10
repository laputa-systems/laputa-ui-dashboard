import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/data.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { BreakdownChart, type BreakdownCategory } from "@laputa-systems/ui-dashboard/data";

const initial: readonly BreakdownCategory[] = [{ id: "first", label: "First", values: [{ seriesId: "built", value: -4 }, { seriesId: "failed", value: 6 }] }, { id: "second", label: "Second", values: [{ seriesId: "built", value: 0 }, { seriesId: "failed", value: null }] }];
const series = [{ id: "built", label: "Built" }, { id: "failed", label: "Failed" }];
function Fixture() {
  const [categories, setCategories] = createSignal(initial);
  return <><button type="button" onClick={() => setCategories([...categories()].reverse().map(category => ({ ...category, values: category.values.map(entry => category.id === "first" && entry.seriesId === "built" ? { ...entry, value: -5 } : { ...entry }) })))}>Refresh values</button><button type="button" onClick={() => setCategories([{ id: "extreme", label: "Extreme", values: [{ seriesId: "built", value: -1e308 }, { seriesId: "failed", value: 1e308 }] }])}>Show extremes</button><button type="button" onClick={() => setCategories([])}>Show empty</button><div data-testid="chart-container" style={{ width: "100%", "max-width": "100%" }}><BreakdownChart label="Builds" series={series} categories={categories()} formatValue={value => `${value} jobs`} /></div></>;
}
render(() => <Fixture />, document.getElementById("root")!);
