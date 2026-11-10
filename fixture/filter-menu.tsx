import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { FilterMenu, type FilterSelection } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [value, setValue] = createSignal<readonly FilterSelection[]>([{ groupId: "status", optionId: "open" }, { groupId: "owner", optionId: "unknown" }]);
  const [calls, setCalls] = createSignal(0);
  const [accept, setAccept] = createSignal(true);
  return <>
    <FilterMenu label="Filters" groups={[
      { id: "status", label: "Status", options: [{ id: "open", label: "Open" }, { id: "closed", label: "Closed" }, { id: "locked", label: "Locked", disabled: true }] },
      { id: "owner", label: "Owner", options: [{ id: "me", label: "Me" }, { id: "team", label: "Team" }] }
    ]} value={value()} onChange={next => { setCalls(count => count + 1); if (accept()) setValue(next); }} />
    <button type="button" onClick={() => setAccept(false)}>Reject filter requests</button>
    <button type="button" onClick={() => setValue([{ groupId: "status", optionId: "closed" }])}>Parent filter update</button>
    <button type="button" onClick={() => setValue([{ groupId: "owner", optionId: "long".repeat(100) }])}>Long filter</button>
    <button type="button" onClick={() => setValue(Array.from({ length: 500 }, (_, index) => ({ groupId: "missing", optionId: String(index) })))}>Fill filters</button>
    <output data-testid="filter-calls">{calls()}</output>
    <output data-testid="filters" style="display: block; overflow-wrap: anywhere">{JSON.stringify(value())}</output>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);
