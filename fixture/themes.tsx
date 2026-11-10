import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import "@laputa-systems/ui-dashboard/styles/data.css";
import { createSignal, Show } from "solid-js";
import { render } from "@solidjs/web";
import { Badge, Button, IconButton, Modal, Notice, Pagination } from "@laputa-systems/ui-dashboard";
import { Checkbox, NativeSelect, RadioGroup, TextField } from "@laputa-systems/ui-dashboard/forms";
import { Disclosure, Tabs } from "@laputa-systems/ui-dashboard/layout";
import { DataTable, type DataColumn } from "@laputa-systems/ui-dashboard/data";

type Project = { readonly id: string; readonly name: string; readonly status: string };

const projects: readonly Project[] = [
  { id: "alpha", name: "Alpha", status: "Ready" },
  { id: "beta", name: "Beta", status: "Waiting" }
];

const columns: readonly DataColumn<Project>[] = [
  { id: "name", label: "Project", rowHeader: true, cell: project => <a href={`/projects/${project().id}`}>{project().name}</a> },
  { id: "status", label: "Status", cell: project => project().status }
];

function Controls(props: { readonly id: string }) {
  const [query, setQuery] = createSignal("catalogue");
  const [notify, setNotify] = createSignal(true);
  const [frequency, setFrequency] = createSignal<string | null>("daily");
  const [project, setProject] = createSignal("alpha");
  const [tab, setTab] = createSignal("overview");
  const [dialog, setDialog] = createSignal(false);
  const [opener, setOpener] = createSignal<HTMLButtonElement>();

  return (
    <div class="fixture-stack" data-testid={`controls-${props.id}`}>
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

      <Notice tone="warn">Check the configuration.</Notice>

      <TextField id={`${props.id}-query`} label="Query" hint="Search the archive" value={query()} onInput={event => setQuery(event.currentTarget.value)} />

      <div class="fixture-row">
        <Checkbox id={`${props.id}-notify`} label="Email updates" checked={notify()} onCheckedChange={setNotify} />
        <NativeSelect id={`${props.id}-project`} label="Project" value={project()} onValueChange={value => setProject(value)} options={[{ value: "alpha", label: "Alpha" }, { value: "beta", label: "Beta" }]} />
      </div>

      <RadioGroup label="Frequency" name={`${props.id}-frequency`} value={frequency()} options={[{ id: "daily", label: "Daily" }, { id: "weekly", label: "Weekly" }]} onChange={value => setFrequency(value)} />

      <Tabs label="Sections" value={tab()} tabs={[{ id: "overview", label: "Overview", content: "Overview panel" }, { id: "activity", label: "Activity", content: "Activity panel" }]} onChange={value => setTab(value)} />

      <Disclosure label="Details" defaultOpen>
        <p>Details body</p>
      </Disclosure>

      <DataTable caption="Projects" columns={columns} rows={projects} getRowId={item => item.id} />

      <Pagination page={1} pages={3} from={1} to={2} total={6} onChange={() => {}} />

      <div class="fixture-row">
        <Button onClick={event => { setOpener(event.currentTarget); setDialog(true); }}>Open dialog</Button>
      </div>

      <Show when={dialog()}>
        <Modal title="Details" label="Details" onClose={() => setDialog(false)} returnFocus={opener()}>
          <p>Dialog body</p>
        </Modal>
      </Show>
    </div>
  );
}

function Fixture() {
  return (
    <main class="themes-page">
      <section class="fixture-region" data-testid="region-default">
        <h2 class="fixture-region-title">Dashboard theme</h2>
        <Controls id="default" />
      </section>
      <section class="ui-theme fixture-region fixture-editorial" data-testid="region-editorial">
        <h2 class="fixture-region-title">Editorial theme</h2>
        <Controls id="editorial" />
      </section>
    </main>
  );
}

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
