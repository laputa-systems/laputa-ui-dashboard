import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/sortable-header.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { SortableHeader, type SortDirection } from "@laputa-systems/ui-dashboard/data";

function Fixture() {
  const [direction, setDirection] = createSignal<SortDirection | undefined>();
  const [requests, setRequests] = createSignal(0);
  return <><button type="button" onClick={() => setDirection("ascending")}>Set externally</button><output aria-label="Sort requests">{requests()}</output><table><caption>Hosts</caption><thead><tr><SortableHeader label="Host" direction={direction()} indicator={value => <span aria-hidden="true" data-direction={value}>sort</span>} onSort={() => { setRequests(requests() + 1); setDirection(direction() === "ascending" ? "descending" : "ascending"); }} /><th scope="col">CPU</th></tr></thead><tbody><tr><th scope="row">alpha</th><td>2%</td></tr></tbody></table></>;
}
render(() => <Fixture />, document.getElementById("root")!);
