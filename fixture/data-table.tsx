import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/data.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { DataTable, type DataColumn } from "@laputa-systems/ui-dashboard/data";

type Project = { readonly id: string; readonly name: string; readonly status: string; readonly owner: string };
const projects: readonly Project[] = [{ id: "alpha", name: "Alpha", status: "Ready", owner: "Ada Lovelace" }, { id: "beta", name: "Beta", status: "Waiting", owner: "Grace Hopper" }];
const columns: readonly DataColumn<Project>[] = [{ id: "name", label: "Project", rowHeader: true, cell: project => <a href={`/projects/${project().id}`}>{project().name}</a> }, { id: "status", label: "Status", cell: project => project().status }, { id: "owner", label: "Owner", cell: project => project().owner }];
function Fixture() {
  const [rows, setRows] = createSignal(projects);
  return <><button type="button" onClick={() => setRows([...rows()].reverse().map(project => ({ ...project })))}>Reverse projects</button><button type="button" onClick={() => setRows(rows().map(project => project.id === "alpha" ? { ...project, name: "Alpha updated" } : project))}>Update Alpha</button><button type="button" onClick={() => setRows([])}>Clear projects</button><div data-testid="container" style={{ width: "100%", "max-width": "100%" }}><DataTable caption="Projects" columns={columns} rows={rows()} getRowId={project => project.id} /></div></>;
}
render(() => <Fixture />, document.getElementById("root")!);
