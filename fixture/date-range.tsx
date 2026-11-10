import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { DateRangePicker, dateRangeComparison, type DateRange, type DateRangeRequestState } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [range, setRange] = createSignal<DateRange>({ start: "2024-02-28", end: "2024-03-01" });
  const [requests, setRequests] = createSignal(0);
  const [accept, setAccept] = createSignal(true);
  const [lastRequest, setLastRequest] = createSignal<DateRange>();
  const [trackRequests, setTrackRequests] = createSignal(false);
  const [requestState, setRequestState] = createSignal<DateRangeRequestState>({ kind: "idle" });
  return <>
    <DateRangePicker label="Reporting dates" value={range()} min="2024-02-01" max="2024-03-31" today="2024-03-01" locale="en-US" weekStartsOn={1} allowComparison requestState={requestState()} onChange={next => { setRequests(count => count + 1); setLastRequest(next); if (accept()) setRange(next); else if (trackRequests()) setRequestState({ kind: "pending" }); }} />
    <DateRangePicker label="Limited dates" value={{ start: "0001-01-01", end: "0001-01-01" }} today="0001-01-01" allowComparison onChange={() => {}} />
    <DateRangePicker label="French dates" value={{ start: "2024-03-31", end: "2024-03-31" }} locale="fr-FR" weekStartsOn={1} onChange={() => {}} />
    <button type="button" onClick={() => setAccept(false)}>Reject requests</button>
    <button type="button" onClick={() => { const last = lastRequest(); if (last) setRange(last); }}>Accept last request</button>
    <button type="button" onClick={() => { setAccept(false); setTrackRequests(true); }}>Track requests</button>
    <button type="button" onClick={() => setRequestState({ kind: "failed", message: "Range update failed" })}>Fail request</button>
    <button type="button" onClick={() => setRange({ start: "2024-03-10", end: "2024-03-12" })}>Parent update</button>
    <output data-testid="range">{range().start} / {range().end}</output>
    <output data-testid="range-requests">{requests()}</output>
    <output data-testid="comparison">{range().comparison ? `${range().comparison}: ${dateRangeComparison(range())?.start} / ${dateRangeComparison(range())?.end}` : "none"}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
