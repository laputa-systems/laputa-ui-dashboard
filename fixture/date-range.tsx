import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { DateRangePicker, type DateRange } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [range, setRange] = createSignal<DateRange>({ start: "2024-02-28", end: "2024-03-01" });
  const [requests, setRequests] = createSignal(0);
  const [accept, setAccept] = createSignal(true);
  return <>
    <DateRangePicker label="Reporting dates" value={range()} min="2024-02-01" max="2024-03-31" onChange={next => { setRequests(count => count + 1); if (accept()) setRange(next); }} />
    <button type="button" onClick={() => setAccept(false)}>Reject requests</button>
    <button type="button" onClick={() => setRange({ start: "2024-03-10", end: "2024-03-12" })}>Parent update</button>
    <output data-testid="range">{range().start} / {range().end}</output>
    <output data-testid="range-requests">{requests()}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
