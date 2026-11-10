import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import "@laputa-systems/ui-dashboard/styles/data.css";
import "@laputa-systems/ui-dashboard/styles/feedback.css";
import "@laputa-systems/ui-dashboard/themes/dark.css";
import { createSignal, Show } from "solid-js";
import { render } from "@solidjs/web";
import { Badge, Button, IconButton, Modal, Notice, Pagination } from "@laputa-systems/ui-dashboard";
import { Checkbox, NativeSelect, RadioGroup, Switch, TextField } from "@laputa-systems/ui-dashboard/forms";
import { Disclosure, Popover, SearchDialog, Tabs, Tooltip } from "@laputa-systems/ui-dashboard/layout";
import { BreakdownChart, SortableHeader, type BreakdownCategory } from "@laputa-systems/ui-dashboard/data";
import { NotificationStack, Progress, Toaster, createToastStore } from "@laputa-systems/ui-dashboard/feedback";

const series = [
  { id: "built", label: "Built" },
  { id: "cached", label: "Cached" },
  { id: "skipped", label: "Skipped" },
  { id: "failed", label: "Failed" },
  { id: "retried", label: "Retried" }
];

const categories: readonly BreakdownCategory[] = [
  { id: "first", label: "First", values: series.map(entry => ({ seriesId: entry.id, value: 4 })) },
  { id: "second", label: "Second", values: series.map(entry => ({ seriesId: entry.id, value: 2 })) }
];

const searchResults = [{ id: "one", href: "/targets/one" }, { id: "two", href: "/targets/two" }];

const lightToasts = createToastStore();
lightToasts.add({ id: "light-toast", title: "Toast saved", detail: "The change is stored." });
const darkToasts = createToastStore();
darkToasts.add({ id: "dark-toast", title: "Toast saved", detail: "The change is stored." });

function Controls(props: { readonly id: string }) {
  const [dialog, setDialog] = createSignal(false);
  const [search, setSearch] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [tab, setTab] = createSignal("overview");
  const [radio, setRadio] = createSignal<string | null>("daily");
  const [select, setSelect] = createSignal("alpha");
  const toasts = props.id === "dark" ? darkToasts : lightToasts;

  return (
    <div class="fixture-stack">
      <p class="fixture-body">Body copy for the {props.id} region.</p>

      <div class="fixture-row">
        <Button>Default action</Button>
        <Button appearance="primary">Primary action</Button>
        <Button appearance="danger">Danger action</Button>
        <Button appearance="ghost">Ghost action</Button>
        <Button variant="small">Small action</Button>
        <Button busy>Busy action</Button>
        <Button disabled>Disabled action</Button>
        <IconButton ariaLabel="More actions">···</IconButton>
      </div>

      <div class="fixture-row">
        <Badge tone="ok" dot>Healthy</Badge>
        <Badge tone="warn">Warning</Badge>
        <Badge tone="bad">Failed</Badge>
        <Badge tone="neutral">Unknown</Badge>
        <Badge tone="info">Info</Badge>
        <Badge tone="accent">Accent</Badge>
      </div>

      <Notice tone="info">Informational notice.</Notice>
      <Notice tone="warn">Warning notice.</Notice>
      <Notice tone="bad">Failure notice.</Notice>
      <Notice tone="ok">Success notice.</Notice>

      <TextField id={`${props.id}-query`} label="Query" hint="Search the archive" />
      <TextField id={`${props.id}-repository`} label="Repository" error="Repository is unavailable" />

      <div class="fixture-row">
        <Checkbox id={`${props.id}-notify`} label="Email updates" defaultChecked />
        <NativeSelect id={`${props.id}-project`} label="Project" value={select()} onValueChange={setSelect} options={[{ value: "alpha", label: "Alpha" }, { value: "beta", label: "Beta" }]} />
        <Switch id={`${props.id}-switch`} label="Sync automatically" name={`${props.id}-switch`} defaultChecked />
      </div>

      <RadioGroup label="Frequency" name={`${props.id}-frequency`} value={radio()} options={[{ id: "daily", label: "Daily" }, { id: "weekly", label: "Weekly" }]} onChange={setRadio} />

      <Tabs label="Sections" value={tab()} tabs={[{ id: "overview", label: "Overview", content: "Overview panel" }, { id: "activity", label: "Activity", content: "Activity panel" }]} onChange={setTab} />

      <Disclosure label="Details" defaultOpen>
        <p>Details body</p>
      </Disclosure>

      <div class="ui-data-table-scroll">
        <table class="ui-data-table">
          <caption>Projects</caption>
          <thead>
            <tr>
              <SortableHeader label="Project" direction="ascending" onSort={() => {}} />
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Alpha</td><td>Ready</td></tr>
            <tr><td>Beta</td><td>Waiting</td></tr>
          </tbody>
        </table>
      </div>

      <Pagination page={1} pages={3} from={1} to={2} total={6} onChange={() => {}} />

      <Progress label="Upload" value={6} max={10} />

      <NotificationStack label="Notifications" notices={[{ id: `${props.id}-notice`, title: "Build finished", detail: "Review the result." }]} onDismiss={() => {}} />
      <Toaster label="Toasts" store={toasts} />

      <div class="fixture-row">
        <Tooltip label="Storage information" content="Files are retained for thirty days.">Info</Tooltip>
        <Popover label="Filter options" trigger="Open options"><button type="button">Popover action</button></Popover>
      </div>

      <div class="ui-panel">
        <div class="ui-panel-body" style={{ padding: "var(--ui-space-md)" }}>
          <BreakdownChart label="Builds" series={series} categories={categories} formatValue={value => `${value} jobs`} />
        </div>
      </div>

      <div class="fixture-row">
        <Button onClick={() => setDialog(true)}>Open dialog</Button>
        <Button onClick={() => setSearch(true)}>Open search</Button>
      </div>

      <Show when={dialog()}>
        <Modal title="Details" label={`${props.id} details`} onClose={() => setDialog(false)}>
          <p>Dialog body</p>
        </Modal>
      </Show>

      <SearchDialog label={`Search ${props.id}`} open={search()} onOpenChange={setSearch} query={query()} onQueryChange={setQuery} state={{ kind: "results", results: searchResults }} renderResult={item => <span>{item.id}</span>} />
    </div>
  );
}

function Fixture() {
  return (
    <main class="theme-dark-page">
      <section class="fixture-region" data-testid="region-light">
        <h2 class="fixture-region-title">Default light</h2>
        <Controls id="light" />
      </section>
      <section class="ui-theme ui-theme-dark fixture-region" data-testid="region-dark">
        <h2 class="fixture-region-title">Dark theme</h2>
        <Controls id="dark" />
      </section>
    </main>
  );
}

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
