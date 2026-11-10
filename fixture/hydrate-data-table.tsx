import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/data.css";
import { createSignal } from "solid-js";
import { hydrate } from "@solidjs/web";
import { DataTable, type DataColumn } from "@laputa-systems/ui-dashboard/data";

type Project = { readonly id: string; readonly name: string };
const columns: readonly DataColumn<Project>[] = [{ id: "name", label: "Name", rowHeader: true, cell: row => row().name }];
function Fixture() {
  const [rows, setRows] = createSignal<readonly Project[]>([{ id: "one", name: "Alpha" }]);
  (window as Window & { updateDataTable?: () => void }).updateDataTable = () => { setRows([{ id: "one", name: "Beta" }]); };
  return <DataTable caption="Projects" columns={columns} rows={rows()} getRowId={row => row.id} />;
}
const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
hydrate(() => <Fixture />, root);
document.documentElement.dataset.reused = String(document.querySelector("table") === (window as Window & { initialTable?: Element }).initialTable);
document.documentElement.dataset.hydrated = "yes";
