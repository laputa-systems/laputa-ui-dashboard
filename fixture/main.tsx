import "../dist/styles.css";
import "./fixture.css";
import { createSignal, Show } from "solid-js";
import { render } from "@solidjs/web";
import {
  Badge,
  Button,
  CollapsiblePanel,
  EmptyState,
  ErrorState,
  Icon,
  Meter,
  Modal,
  Notice,
  PageHeader,
  Pagination,
  Panel,
  Segmented,
  Shell,
  Skeleton
} from "../dist/index.js";

function Fixture() {
  const [collapsed, setCollapsed] = createSignal<ReadonlySet<string>>(new Set());
  const [range, setRange] = createSignal<"1h" | "24h">("1h");
  const [modal, setModal] = createSignal(false);
  const [modalCloses, setModalCloses] = createSignal(0);
  const [localToggles, setLocalToggles] = createSignal(0);
  const [initialCollapsed, setInitialCollapsed] = createSignal(true);
  const [expandedToggles, setExpandedToggles] = createSignal(0);
  const [controlled, setControlled] = createSignal(false);
  const [controlledToggles, setControlledToggles] = createSignal(0);
  const [initialExpanded, setInitialExpanded] = createSignal(false);
  const toggle = (id: string) => () => {
    const next = new Set(collapsed());
    if (next.has(id)) next.delete(id); else next.add(id);
    setCollapsed(next);
  };
  return (
    <Shell
      brand={{ href: "/", name: "fixture", mark: <Icon name="activity" size={16} /> }}
      nav={[
        { label: "Main", items: [{ href: "/", label: "Overview", current: true }, { href: "/hosts", label: "Hosts" }] },
        { label: "CI", heading: true, items: [{ href: "/runs", label: "Runs" }] }
      ]}
      foot={<button type="button">Sign out</button>}
    >
      <div class="fixture-page">
      <PageHeader title="Overview" mark={<Icon name="host" />} titleExtra={<Badge tone="ok" dot>Healthy</Badge>}>
        <Segmented label="Range" value={range()} options={[["1h", "1 hour"], ["24h", "24 hours"]]} onChange={setRange} />
      </PageHeader>
      <div class="fixture-column">
        <CollapsiblePanel id="cpu" title="CPU" meta={<span>Live</span>} expandable collapsible collapsed={collapsed().has("cpu")} onToggleCollapsed={toggle("cpu")}>
          <Meter value={82} warn={70} bad={90} />
        </CollapsiblePanel>
        <CollapsiblePanel id="memory" title="Memory" collapsible collapsed={collapsed().has("memory")} onToggleCollapsed={toggle("memory")}>
          <Skeleton rows={2} chart />
        </CollapsiblePanel>
        <CollapsiblePanel id="locked" title="Locked" expandable expanded={false} collapsible collapsed={false}>Locked content</CollapsiblePanel>
        <div>
          <Button onClick={() => setInitialExpanded(true)}>Mount expanded</Button>
          <Button onClick={() => setInitialCollapsed(false)}>Change default</Button>
          <Button onClick={() => setControlled(value => !value)}>Change controlled state</Button>
          <output data-testid="panel-counts">{localToggles()}:{expandedToggles()}:{controlledToggles()}</output>
          <output data-testid="modal-closes">{modalCloses()}</output>
        </div>
        <Show when={initialExpanded()}><CollapsiblePanel id="initial-expanded" title="Initially expanded" expandable defaultExpanded onToggleExpanded={() => setExpandedToggles(n => n + 1)}>Expanded content</CollapsiblePanel></Show>
        <CollapsiblePanel id="initial-collapsed" title="Initially collapsed" collapsible defaultCollapsed={initialCollapsed()} onToggleCollapsed={() => setLocalToggles(n => n + 1)}>Initially hidden</CollapsiblePanel>
        <CollapsiblePanel id="controlled" title="Controlled" collapsible collapsed={controlled()} onToggleCollapsed={() => setControlledToggles(n => n + 1)}>Controlled content</CollapsiblePanel>
        <CollapsiblePanel id="local" title={<h2>Local</h2>} label="Local" expandable collapsible>Local content <Button onClick={() => setModal(true)}>Panel details</Button></CollapsiblePanel>
        <Panel id="plain" title="Plain" meta={<span>meta</span>}>
          <Notice tone="warn">Check configuration <span class="ui-sr-only" data-testid="sr-only">hidden label</span></Notice>
        </Panel>
        <Panel id="flush" title="Flush" flush>
          <div class="ui-table-toolbar">
            <div class="ui-search"><Icon name="search" /><input type="search" aria-label="Search" placeholder="Search" /></div>
          </div>
          <div class="ui-table-scroll">
            <table class="ui-data-table">
              <thead><tr><th>Host</th><th class="numeric">CPU</th></tr></thead>
              <tbody><tr><td>alpha</td><td class="numeric">12%</td></tr><tr><td>beta</td><td class="numeric">40%</td></tr></tbody>
            </table>
          </div>
          <Pagination page={1} pages={3} from={1} to={2} total={6} onChange={() => {}} />
        </Panel>
        <EmptyState title="No records" detail="Try a wider range" action={<Button>Reset</Button>} />
        <ErrorState title="Failed" detail="Network timeout" retry={() => {}} />
        <div><Button onClick={() => setModal(true)} name="operation" value="open" data-fixture="open">Open modal</Button></div>
      </div>
      </div>
      <Show when={modal()}>
        <Modal title="Trace" label="Trace" onBack={() => {}} onClose={() => { setModalCloses(n => n + 1); setModal(false); }}>
          <p>Body</p>
        </Modal>
      </Show>
    </Shell>
  );
}

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
