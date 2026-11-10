import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/data.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { BreakdownChart } from "@laputa-systems/ui-dashboard/data";

const series = [{ id: "built", label: "Built" }, { id: "failed", label: "Failed" }];
function Fixture() {
  const [measure, setMeasure] = createSignal("jobs");
  const [category, setCategory] = createSignal("project");
  const [stack, setStack] = createSignal("status");
  const [selected, setSelected] = createSignal<readonly string[]>(["built", "failed"]);
  const [requests, setRequests] = createSignal(0);
  const [accept, setAccept] = createSignal(true);
  const categories = () => [{ id: category(), label: category() === "team" ? "Team Alpha" : "Project Alpha", values: [{ seriesId: "built", value: measure() === "seconds" ? (stack() === "runner" ? 24 : 12) : 3 }, { seriesId: "failed", value: measure() === "seconds" ? 2 : 1 }] }];
  const choose = (update: (value: string) => void) => (value: string) => { setRequests(count => count + 1); update(value); };
  return <><button type="button" onClick={() => setAccept(false)}>Reject changes</button><button type="button" onClick={() => setMeasure("jobs")}>Set measure externally</button><button type="button" onClick={() => setSelected(["failed"])}>Select failed externally</button><output data-testid="requests">{requests()}</output><BreakdownChart label="Builds" series={series} categories={categories()} formatValue={value => `${value} ${measure()}`} dimensions={{ measure: { label: "Measure", value: measure(), options: [{ id: "jobs", label: "Jobs" }, { id: "seconds", label: "Seconds" }], onChange: value => { setRequests(count => count + 1); if (accept()) setMeasure(value); } }, category: { label: "Group by", value: category(), options: [{ id: "project", label: "Project" }, { id: "team", label: "Team" }], onChange: choose(setCategory) }, stack: { label: "Stack by", value: stack(), options: [{ id: "status", label: "Status" }, { id: "runner", label: "Runner" }], onChange: choose(setStack) } }} seriesSelection={{ selectedIds: selected(), onChange: ids => { setRequests(count => count + 1); if (accept()) setSelected(ids); } }} /></>;
}
render(() => <Fixture />, document.getElementById("root")!);
