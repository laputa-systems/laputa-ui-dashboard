import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import "@laputa-systems/ui-dashboard/styles/feedback.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import "@laputa-systems/ui-dashboard/styles/recipes.css";
import { createMemo, createSignal, For, Show } from "solid-js";
import { render } from "@solidjs/web";
import { ActionStatus, createToastStore, NotificationStack, Toaster, type ActionState, type Notification } from "@laputa-systems/ui-dashboard/feedback";
import { Checkbox, Combobox, DateRangePicker, Dropzone, MultiCombobox, NativeSelect, RadioGroup, Select, Switch, TagInput, TextArea, TextField, type DateRange, type Tag, type TagRequestState } from "@laputa-systems/ui-dashboard/forms";
import { CommandMenu, FilterMenu, Tabs, type FilterSelection } from "@laputa-systems/ui-dashboard/layout";
import { IntegrationPicker, ProfileMenu, type IntegrationConnection } from "@laputa-systems/ui-dashboard/recipes";

function Fixture() {
  const toasts = createToastStore();
  const [watched, setWatched] = createSignal<readonly string[]>([]);
  const [connection, setConnection] = createSignal<IntegrationConnection>({ kind: "disconnected" });
  const [owner, setOwner] = createSignal<string | null>(null);
  const [environment, setEnvironment] = createSignal("staging");
  const [view, setView] = createSignal("list");
  const [name, setName] = createSignal("Workspace");
  const [notes, setNotes] = createSignal("");
  const [sync, setSync] = createSignal(false);
  const [frequency, setFrequency] = createSignal<string | null>("daily");
  const [project, setProject] = createSignal("alpha");
  const [tags, setTags] = createSignal<readonly Tag[]>([]);
  const [tagState, setTagState] = createSignal<TagRequestState>({ kind: "idle" });
  const [notices, setNotices] = createSignal<readonly Notification[]>([]);
  const [save, setSave] = createSignal<ActionState>({ kind: "idle" });
  const [checked, setChecked] = createSignal(false);
  const [mixed, setMixed] = createSignal(true);
  const [range, setRange] = createSignal<DateRange>({ start: "2024-02-28", end: "2024-03-01" });
  const [filters, setFilters] = createSignal<readonly FilterSelection[]>([]);
  const [query, setQuery] = createSignal("");
  const records = [{ name: "Alpha", status: "open" }, { name: "Beta", status: "closed" }];
  const visible = createMemo(() => records.filter(record => record.name.toLowerCase().includes(query().toLowerCase()) && (!filters().length || filters().some(filter => filter.optionId === record.status))));
  return <main style={{ display: "grid", gap: "1rem", "max-width": "48rem", "min-width": "0" }}>
    <header style={{ display: "flex", "flex-wrap": "wrap", gap: "0.5rem" }}>
      <ProfileMenu label="Account menu" account={{ name: "Ada" }} items={[{ id: "account", label: "Account settings", href: "/account" }]} />
      <CommandMenu label="Commands" groups={[{ id: "actions", label: "Actions", commands: [{ id: "clear", label: "Clear search" }] }]} onSelect={() => setQuery("")} />
      <IntegrationPicker label="Add integration" integrations={[{ id: "metrics", label: "Metrics", description: "Connect metrics", connection: connection() }]} onConnect={() => setConnection({ kind: "failed", message: "Connection failed" })} />
    </header>
    <section aria-label="Workspace settings"><h1>Workspace settings</h1>
      <form style={{ display: "grid", gap: "0.75rem" }} onSubmit={event => { event.preventDefault(); setSave({ kind: "failed", message: "Save failed. Try again." }); setNotices([{ id: "save", title: "Settings could not be saved" }]); if (toasts.toasts().some(toast => toast.id === "save")) toasts.update("save", { title: "Settings save failed" }); else toasts.add({ id: "save", title: "Settings save failed" }); }}>
        <TextField id="journey-name" label="Workspace name" name="name" value={name()} onInput={event => setName(event.currentTarget.value)} copyable />
        <TextArea id="journey-notes" label="Workspace notes" value={notes()} onInput={event => setNotes(event.currentTarget.value)} autosize={{ minRows: 2, maxRows: 4 }} />
        <Switch id="journey-sync" label="Sync automatically" checked={sync()} onCheckedChange={setSync} />
        <RadioGroup label="Report frequency" name="frequency" value={frequency()} options={[{ id: "daily", label: "Daily" }, { id: "weekly", label: "Weekly" }]} onChange={setFrequency} />
        <NativeSelect id="journey-project" label="Default project" options={[{ value: "alpha", label: "Alpha" }, { value: "beta", label: "Beta" }]} value={project()} onValueChange={setProject} />
        <Combobox id="journey-owner" label="Owner" options={[{ id: "ada", label: "Ada" }, { id: "bea", label: "Beatrice" }]} value={owner()} onChange={setOwner} />
        <MultiCombobox id="journey-watched" label="Projects to watch" options={[{ id: "alpha", label: "Alpha" }, { id: "beta", label: "Beta" }]} value={watched()} onChange={setWatched} />
        <Select id="journey-environment" label="Environment" options={[{ value: "staging", label: "Staging", description: "Test environment" }, { value: "production", label: "Production", description: "Live environment" }]} value={environment()} onValueChange={setEnvironment} />
        <TagInput id="journey-labels" label="Labels" value={tags()} state={tagState()} onAdd={request => { setTags(current => [...current, ...request.labels.map((label, index) => ({ id: `${current.length + index}`, label }))]); setTagState({ kind: "accepted", id: request.id }); }} onRemove={id => setTags(current => current.filter(tag => tag.id !== id))} />
        <fieldset><legend>Notifications</legend><Checkbox id="journey-all" label="Select all notifications" checked={checked()} indeterminate={mixed()} onCheckedChange={value => { setChecked(value); setMixed(false); }} /></fieldset>
        <DateRangePicker label="Reporting period" value={range()} today="2024-03-01" onChange={setRange} />
        <Dropzone label="Attach files" files={[]} maxFiles={2} maxFileBytes={1024} />
        <button class="ui-btn" type="submit">Save settings</button>
        <ActionStatus state={save()} />
      </form>
      <Toaster label="Transient notices" store={toasts} />
      <NotificationStack label="Notifications" notices={notices()} onDismiss={id => setNotices(current => current.filter(notice => notice.id !== id))} />
    </section>
    <section aria-label="Repositories"><h2>Repositories</h2>
      <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.5rem", "min-width": "0" }}>
        <TextField id="journey-search" label="Search repositories" value={query()} onInput={event => setQuery(event.currentTarget.value)} />
        <FilterMenu label="Filters" groups={[{ id: "status", label: "Status", options: [{ id: "open", label: "Open" }, { id: "closed", label: "Closed" }] }]} value={filters()} onChange={setFilters} />
      </div>
      <Tabs label="Repository views" value={view()} tabs={[{ id: "list", label: "List", content: <Show when={visible().length > 0} fallback={<p>No repositories match.</p>}><ul><For each={visible()}>{record => <li>{record.name}</li>}</For></ul></Show> }, { id: "activity", label: "Activity", content: "No recent activity." }]} onChange={setView} />
    </section>
  </main>;
}

render(() => <Fixture />, document.getElementById("root")!);
