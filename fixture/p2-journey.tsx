import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import "@laputa-systems/ui-dashboard/styles/feedback.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createMemo, createSignal, For, Show } from "solid-js";
import { render } from "@solidjs/web";
import { ActionStatus, type ActionState } from "@laputa-systems/ui-dashboard/feedback";
import { Checkbox, DateRangePicker, Dropzone, TextField, type DateRange } from "@laputa-systems/ui-dashboard/forms";
import { FilterMenu, type FilterSelection } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [name, setName] = createSignal("Workspace");
  const [save, setSave] = createSignal<ActionState>({ kind: "idle" });
  const [checked, setChecked] = createSignal(false);
  const [mixed, setMixed] = createSignal(true);
  const [range, setRange] = createSignal<DateRange>({ start: "2024-02-28", end: "2024-03-01" });
  const [filters, setFilters] = createSignal<readonly FilterSelection[]>([]);
  const [query, setQuery] = createSignal("");
  const records = [{ name: "Alpha", status: "open" }, { name: "Beta", status: "closed" }];
  const visible = createMemo(() => records.filter(record => record.name.toLowerCase().includes(query().toLowerCase()) && (!filters().length || filters().some(filter => filter.optionId === record.status))));
  return <main style={{ display: "grid", gap: "1rem", "max-width": "48rem", "min-width": "0" }}>
    <section aria-label="Workspace settings"><h1>Workspace settings</h1>
      <form style={{ display: "grid", gap: "0.75rem" }} onSubmit={event => { event.preventDefault(); setSave({ kind: "failed", message: "Save failed. Try again." }); }}>
        <TextField id="journey-name" label="Workspace name" name="name" value={name()} onInput={event => setName(event.currentTarget.value)} copyable />
        <fieldset><legend>Notifications</legend><Checkbox id="journey-all" label="Select all notifications" checked={checked()} indeterminate={mixed()} onCheckedChange={value => { setChecked(value); setMixed(false); }} /></fieldset>
        <DateRangePicker label="Reporting period" value={range()} today="2024-03-01" onChange={setRange} />
        <Dropzone label="Attach files" files={[]} maxFiles={2} maxFileBytes={1024} />
        <button class="ui-btn" type="submit">Save settings</button>
        <ActionStatus state={save()} />
      </form>
    </section>
    <section aria-label="Repositories"><h2>Repositories</h2>
      <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.5rem", "min-width": "0" }}>
        <TextField id="journey-search" label="Search repositories" value={query()} onInput={event => setQuery(event.currentTarget.value)} />
        <FilterMenu label="Filters" groups={[{ id: "status", label: "Status", options: [{ id: "open", label: "Open" }, { id: "closed", label: "Closed" }] }]} value={filters()} onChange={setFilters} />
      </div>
      <Show when={visible().length > 0} fallback={<p>No repositories match.</p>}><ul><For each={visible()}>{record => <li>{record.name}</li>}</For></ul></Show>
    </section>
  </main>;
}

render(() => <Fixture />, document.getElementById("root")!);
