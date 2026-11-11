import "../../dist/styles.css";
import "../../dist/styles/forms.css";
import "../../dist/styles/layout.css";
import "../../dist/styles/data.css";
import "../../dist/styles/sortable-header.css";
import "../../dist/styles/feedback.css";
import "../../dist/styles/recipes.css";
import "../../dist/styles/editorial.css";
import "../../dist/themes/dark.css";
import "./tour.css";

import { createSignal, For, Show, onCleanup, type JSX } from "solid-js";
import { render } from "@solidjs/web";
import {
  Badge, Button, CollapsiblePanel, EmptyState, ErrorState, Icon, IconButton,
  Meter, Modal, Notice, PageHeader, Pagination, Panel, Segmented,
  Shell, SideNav, Skeleton, groupId,
} from "../../dist/index.js";
import { ActionStatus, NotificationStack, Progress, Toaster, createToastStore, type ActionState } from "../../dist/feedback.js";
import { IntegrationPicker, ProfileMenu, type IntegrationConnection } from "../../dist/recipes.js";
import { TextField } from "../../dist/forms.js";
import { DataScene, FormsScene, NavigationScene, WorkspacesScene } from "./scenes";

export const chapters = [
  { id: "overview", index: "01", label: "Foundations", subtitle: "An application dashboard and its underlying elements", count: 17 },
  { id: "forms", index: "02", label: "Forms & inputs", subtitle: "A complete, interactive research intake", count: 12 },
  { id: "navigation", index: "03", label: "Navigation", subtitle: "Wayfinding, context, and deliberate disclosure", count: 10 },
  { id: "data", index: "04", label: "Data views", subtitle: "Decision-ready information without chart overload", count: 4 },
  { id: "workspaces", index: "05", label: "Workspaces", subtitle: "Panels, inspectors, settings, and artifacts", count: 6 },
  { id: "feedback", index: "06", label: "Feedback", subtitle: "Clear outcomes, loading, and recovery", count: 4 },
  { id: "recipes", index: "07", label: "Recipes", subtitle: "Ready-to-adapt product compositions", count: 2 },
  { id: "editorial", index: "08", label: "Editorial & themes", subtitle: "One component system; very different atmospheres", count: 0 },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];
export function isChapterId(value: string): value is ChapterId { return chapters.some(chapter => chapter.id === value); }

export function Specimen(props: { readonly title: string; readonly id: string; readonly description: string; readonly children: JSX.Element; readonly wide?: boolean | undefined; readonly class?: string | undefined }): JSX.Element {
  return <article class={["tour-specimen", props.wide && "tour-specimen-wide", props.class].filter(Boolean).join(" ")} id={`specimen-${props.id}`}>
    <div class="tour-specimen-head"><div><span class="tour-specimen-id">{props.id}</span><h3>{props.title}</h3></div><span class="tour-specimen-asterisk" aria-hidden="true">&#10022;</span></div>
    <div class="tour-specimen-body">{props.children}</div>
    <p class="tour-specimen-caption">{props.description}</p>
  </article>;
}

function FoundationsScene(): JSX.Element {
  const [range, setRange] = createSignal<"today" | "week" | "month">("week");
  const [page, setPage] = createSignal(1);
  const [open, setOpen] = createSignal(false);
  const [alert, setAlert] = createSignal(false);
  const [load, setLoad] = createSignal(false);
  const [retries, setRetries] = createSignal(0);
  return <div class="tour-scene">
    <div class="tour-feature tour-feature-blue">
      <div class="tour-feature-top"><span>FIELD NOTES / SYSTEM OVERVIEW</span><Badge tone="ok" dot>Operational</Badge></div>
      <PageHeader title="Infrastructure overview" mark={<Icon name="activity" size={20} />} titleExtra={<Badge tone="accent">Live sample</Badge>}>
        <Segmented label="Time period" value={range()} options={[["today", "Today"], ["week", "7 days"], ["month", "30 days"]]} onChange={setRange} />
      </PageHeader>
      <div class="tour-metrics">
        <div><small>HEALTHY PROJECTS</small><strong>24<span> / 25</span></strong><p>Across 6 regions</p></div>
        <div><small>MEDIAN LATENCY</small><strong>82<span> ms</span></strong><p>Down 12% vs. prior</p></div>
        <div><small>SUCCESS RATE</small><strong>99.8<span>%</span></strong><p>Rolling {range() === "week" ? "7 days" : range() === "today" ? "24 hours" : "30 days"}</p></div>
      </div>
      <div class="tour-inline-row"><Button appearance="primary" leadingIcon={<Icon name="arrowRight" />} onClick={() => setOpen(true)}>Inspect activity</Button><Button appearance="ghost" onClick={() => setAlert(value => !value)}>Toggle advisory</Button><IconButton ariaLabel="Refresh overview" onClick={() => setLoad(value => !value)}><Icon name="refresh" /></IconButton></div>
      <Show when={alert()}><Notice tone="warn">One region is operating at reduced capacity. This is local demo data.</Notice></Show>
      <Show when={load()}><div aria-busy="true" class="tour-loading"><Skeleton rows={2} chart /></div></Show>
    </div>
    <div class="tour-gallery-grid">
      <Specimen id="Panel / CollapsiblePanel" title="A signal worth expanding" description="A compact panel that can collapse or expand without changing the surrounding page structure.">
        <Panel title="Worker utilization" meta={<Badge tone="info">Service alpha</Badge>}><div class="tour-stack"><div class="tour-spread"><span>CPU budget</span><strong>68%</strong></div><Meter value={68} warn={75} bad={92} /><div class="tour-spread"><span>Memory budget</span><strong>91%</strong></div><Meter value={91} warn={75} bad={92} /></div></Panel>
        <CollapsiblePanel id="tour-panel" title="Show traces" collapsible defaultCollapsed meta={<span>3 recent events</span>}><ul class="tour-compact-list"><li>09:32 · Request completed</li><li>09:29 · Deployment healthy</li><li>09:17 · Snapshot captured</li></ul></CollapsiblePanel>
      </Specimen>
      <Specimen id="Badge / Notice / Icon" title="Semantic signals" description="Colors communicate state, but every status also has a readable label.">
        <div class="tour-inline-row">{(["ok", "warn", "bad", "neutral", "info", "accent"] as const).map(tone => <Badge tone={tone} dot>{tone}</Badge>)}</div>
        <Notice tone="info">Collection is current. Next refresh is user controlled.</Notice>
        <Notice tone="bad">A sample datasource is unavailable; historical data remains readable.</Notice>
        <div class="tour-inline-row"><Icon name="host" /><Icon name="network" /><Icon name="disk" /><Icon name="search" /><Icon name="alert" /><Icon name="check" /></div>
      </Specimen>
      <Specimen id="EmptyState / ErrorState / Skeleton" title="Every data state" description="Useful interfaces show zero, failure and loading as different states—not one generic blank panel.">
        <div class="tour-inline-row"><Button variant="small" onClick={() => setLoad(false)}>Clear loading</Button><Button variant="small" onClick={() => setLoad(true)}>Show loading</Button></div>
        <Show when={load()} fallback={<EmptyState title="No alerts in this period" detail="Choose another range to explore historical alerts." action={<Button variant="small" onClick={() => setRange("month")}>Last 30 days</Button>} />}><div aria-busy="true"><Skeleton rows={2} chart /></div></Show>
        <ErrorState compact detail={`The test endpoint timed out. Retries: ${retries()}`} retry={() => setRetries(n => n + 1)} />
      </Specimen>
      <Specimen id="Pagination / Meter / Segmented" title="A bounded event feed" description="Controlled pagination, compact indicators, and a simple pressed-button range selector.">
        <ul class="tour-compact-list"><li>Deploy finished <Badge tone="ok">Complete</Badge></li><li>Resource audit <Badge tone="warn">Queued</Badge></li><li>Cache refresh <Badge tone="neutral">Idle</Badge></li></ul>
        <Pagination page={page()} pages={4} from={(page()-1)*3+1} to={page()*3} total={12} onChange={setPage}/>
      </Specimen>
      <Specimen id="Shell / SideNav / groupId" title="Server-friendly application shell" description="The original sticky sidebar and accessible nav groups work as semantic HTML without a router." wide>
        <div class="tour-shell-preview"><Shell brand={{ href: "#overview", name: "Acme operations", mark: <Icon name="host" /> }} nav={[{ label: "Main", items: [{ href: "#overview", label: "Overview", current: true }, { href: "#data", label: "Insights" }] }]} foot={<span class="tour-muted">Read-only example</span>}><div class="tour-mini-layout"><h3>Projects</h3><p>Keep the familiar navigation while the content changes.</p><SideNav index={1} group={{ label: "Related", heading: true, items: [{ href: "#workspaces", label: "Workbench" }] }} /><small>Group heading: <code>{groupId(1)}</code></small></div></Shell></div>
      </Specimen>
    </div>
    <Show when={open()}><Modal title="Activity insight" label="Activity insight" onClose={() => setOpen(false)}><div class="tour-stack"><Badge tone="ok">Everything nominal</Badge><p>Panels and dialogs are real shared components. The event data in this tour is intentionally local.</p><Button onClick={() => setOpen(false)}>Return to overview</Button></div></Modal></Show>
  </div>;
}

function FeedbackScene(): JSX.Element {
  const [progress, setProgress] = createSignal(38);
  const [action, setAction] = createSignal<ActionState>({ kind: "idle" });
  const [notices, setNotices] = createSignal([{ id: "review", title: "Awaiting review", detail: "Two submissions need a decision.", action: "Review" }, { id: "sync", title: "Catalog synchronized", detail: "27 records ready to browse." }]);
  const [latest, setLatest] = createSignal("No action selected");
  const store = createToastStore();
  let toastId = 0;
  const addToast = (kind: "success" | "failure") => {
    const id = `demo-toast-${++toastId}`;
    store.add({ id, title: kind === "success" ? "Changes saved" : "Connection interrupted", detail: kind === "success" ? "Your local specimen state was updated." : "This simulated operation can be retried.", durationMs: 6500, action: { label: "Dismiss", onSelect: () => store.dismiss(id) } });
  };
  return <div class="tour-scene"><div class="tour-feature tour-feature-green"><span class="tour-eyebrow">SYSTEM MESSAGES / HUMAN RESPONSE</span><h2>Feedback should explain what happened.</h2><p>Every interaction has a distinct state. Success isn't inferred from clicking a button; in this demo the local state is the deliberate acknowledgment.</p></div>
    <div class="tour-gallery-grid">
      <Specimen id="Progress" title="A job with known progress" description="Native progress semantics and a number users can inspect; omit a value when the amount is unknown.">
        <Progress label="Document ingestion" value={progress()} max={100} /><div class="tour-spread"><span>{progress()} of 100 complete</span><Button variant="small" onClick={() => setProgress(value => value >= 100 ? 0 : Math.min(100, value + 17))}>Advance</Button></div><Progress label="Waiting for worker" />
      </Specimen>
      <Specimen id="ActionStatus" title="A trustworthy outcome" description="Pending, success, failure and unavailable use separate semantic states.">
        <div class="tour-inline-row"><Button onClick={() => setAction({ kind: "pending", message: "Applying changes…" })}>Start</Button><Button onClick={() => setAction({ kind: "succeeded", message: "Acknowledged by the demo host." })}>Confirm</Button><Button onClick={() => setAction({ kind: "failed", message: "Request rejected.", retry: () => setAction({ kind: "pending", message: "Retrying…" }) })}>Fail</Button></div><ActionStatus state={action()} />
      </Specimen>
      <Specimen id="NotificationStack" title="A durable inbox" description="Persistent notices don't disappear on a timeout; resolve or dismiss them explicitly.">
        <NotificationStack label="Research notifications" notices={notices()} total={notices().length} onDismiss={id => setNotices(items => items.filter(item => item.id !== id))} onAction={id => {setLatest(`Opened ${id}`);setNotices(items => items.filter(item => item.id !== id));}} /><p class="tour-muted" role="status">{latest()}</p><Button variant="small" onClick={() => setNotices([{ id: `new-${Date.now()}`, title: "New review task", detail: "Added to this session." }])}>Add notice</Button>
      </Specimen>
      <Specimen id="Toaster / createToastStore" title="Ephemeral feedback" description="A queue with pause-on-focus, bounded presentation and optional actions.">
        <div class="tour-inline-row"><Button onClick={() => addToast("success")}>Show success</Button><Button appearance="ghost" onClick={() => addToast("failure")}>Show failure</Button></div><p class="tour-muted">Toasts appear above the page without shifting the content.</p><Toaster label="Tour toasts" store={store} maxVisible={3} />
      </Specimen>
    </div>
  </div>;
}

function RecipesScene(): JSX.Element {
  const [connected, setConnected] = createSignal<IntegrationConnection>({ kind: "disconnected" });
  const [status, setStatus] = createSignal("No profile action yet");
  return <div class="tour-scene"><div class="tour-feature tour-feature-blue"><span class="tour-eyebrow">COMPOSITIONAL PATTERNS / PRODUCTION PRIMITIVES</span><h2>From controls to workflows.</h2><p>Recipes combine established components without owning credentials, backend policy or application navigation.</p></div>
    <div class="tour-gallery-grid">
      <Specimen id="IntegrationPicker" title="Connect a workspace" description="Search a service directory, inspect its capability, and request a connection through a host-owned callback.">
        <div class="tour-stack"><IntegrationPicker label="Browse integrations" integrations={[{ id: "github", label: "GitHub", description: "Link repository activity and reviews", keywords: ["code"], connection: connected() }, { id: "calendar", label: "Calendar", description: "See upcoming events in context", connection: { kind: "connected" } }, { id: "storage", label: "Storage", description: "Archive artifacts and source documents", connection: { kind: "expired", message: "Reauthentication required" } }]} onConnect={() => setConnected({ kind: "connected" })}/><p class="tour-muted">Current example connection: {connected().kind}</p><Button variant="small" onClick={() => setConnected({kind:"disconnected"})}>Reset local connection</Button></div>
      </Specimen>
      <Specimen id="ProfileMenu" title="A consistent account surface" description="Action menu, identity and setup progress in one accessible composition.">
        <ProfileMenu label="Research account" account={{ name: "Mira Chen", detail: "Editor · Archive team", avatar: <span class="tour-avatar">MC</span> }} items={[{ id: "preferences", label: "Preferences" }, { id: "profile", label: "View profile" }, { id: "signout", label: "Sign out", disabled: true }]} progress={{ label: "Workspace setup", value: 3, max: 4 }} onSelect={setStatus}/><p role="status" class="tour-muted">Selected action: {status()}</p>
      </Specimen>
    </div></div>;
}

function EditorialScene(): JSX.Element {
  return <div class="tour-scene">
    <div class="tour-editorial-feature"><span class="tour-eyebrow">RESEARCH ARCHIVE / EDITORIAL SYSTEM</span><h2 class="ui-reading-serif">Objects, materials, and the evidence around them.</h2><p>The same controls can support a very different information experience. Here the page composition, imagery and type—not a new framework—supply the character.</p></div>
    <div class="tour-gallery-grid">
      <Specimen id="styles/editorial.css" title="A research article" description="These are opt-in CSS-only semantic classes. Their DOM remains meaningful without JavaScript." wide>
        <article class="ui-reading-column tour-editorial-article"><p class="tour-kicker">ARCHIVE / STUDY 042</p><h3 class="ui-reading-serif">A vocabulary of firing, ash, and time</h3><p class="ui-reading-serif tour-lede">The surface of a vessel records both the maker's intention and the kiln's unpredictable atmosphere. <sup class="ui-cite"><a href="#tour-reference-1" aria-label="Reference 1">[1]</a></sup></p>
          <div class="ui-figure-grid"><figure class="ui-figure"><div class="tour-artwork tour-artwork-one ui-figure-media" role="img" aria-label="Abstract illustration of a dark ceramic vessel"><div class="tour-vessel" /></div><figcaption class="ui-figure-caption">An ash-glazed profile <span class="ui-figure-credit">Studio study · fictional exhibit</span></figcaption></figure><figure class="ui-figure"><div class="tour-artwork tour-artwork-two ui-figure-media" role="img" aria-label="Abstract illustration of a pale ceramic bowl"><div class="tour-vessel tour-vessel-wide" /></div><figcaption class="ui-figure-caption">Materials and landscape <span class="ui-figure-credit">Archive study · fictional exhibit</span></figcaption></figure></div>
          <p><span class="ui-native-name" lang="ja">自然釉</span> · Natural ash glaze. Connected vocabulary remains readable with ordinary links.</p><ul class="ui-term-list"><li><a class="ui-term" href="#editorial">Ceramics <span class="ui-term-count">24</span></a></li><li><a class="ui-term" href="#editorial">Wood firing <span class="ui-term-count">8</span></a></li><li><a class="ui-term" href="#editorial">Japan <span class="ui-term-count">12</span></a></li></ul>
          <h4 class="ui-reading-serif">References</h4><ol class="ui-references"><li id="tour-reference-1">Demonstration entry: workshop field notes, 2026. All material on this page is sample content.</li></ol>
        </article>
      </Specimen>
      <Specimen id=".ui-theme / themes/dark.css" title="Same primitives, three identities" description="Scoped tokens change color, typography and density without replacing behavior or affecting sibling regions." wide>
        <div class="tour-theme-grid"><div class="tour-mini-theme"><strong>Dashboard</strong><Button variant="small" appearance="primary">Review report</Button><Badge tone="ok">Healthy</Badge><TextField id="theme-default-field" label="Search records" placeholder="Project or host" /></div><div class="tour-mini-theme ui-theme tour-mini-editorial"><strong class="ui-reading-serif">Editorial</strong><Button variant="small" appearance="primary">Review report</Button><Badge tone="ok">Published</Badge><TextField id="theme-editorial-field" label="Search records" placeholder="Artist or technique" /></div><div class="tour-mini-theme ui-theme ui-theme-dark"><strong>Dark (opt-in)</strong><Button variant="small" appearance="primary">Review report</Button><Badge tone="ok">Healthy</Badge><TextField id="theme-dark-field" label="Search records" placeholder="Project or host" /></div></div>
      </Specimen>
    </div>
  </div>;
}

function App(): JSX.Element {
  const fromHash = (): ChapterId => { const candidate = location.hash.slice(1); return isChapterId(candidate) ? candidate : "overview"; };
  const [current, setCurrent] = createSignal<ChapterId>(fromHash());
  const [theme, setTheme] = createSignal<"light" | "editorial" | "dark">("light");
  const sync = () => setCurrent(fromHash());
  window.addEventListener("hashchange", sync);
  onCleanup(() => window.removeEventListener("hashchange", sync));
  const navigate = (id: ChapterId) => { if (location.hash !== `#${id}`) location.hash = id; else setCurrent(id); window.scrollTo({ top: 0, behavior: "instant" }); };
  const active = () => chapters.find(item => item.id === current()) ?? chapters[0];
  const position = () => chapters.findIndex(item => item.id === current());
  return <div class={["tour-shell", "ui-theme", theme() === "dark" && "ui-theme-dark"].filter(Boolean).join(" ")} data-theme={theme()}>
    <a class="tour-skip" href="#tour-content">Skip to chapter</a>
    <aside class="tour-sidebar"><div class="tour-brand"><span class="tour-brand-mark" aria-hidden="true">L</span><span><strong>LAPUTA / UI</strong><small>Component field guide</small></span></div><p class="tour-sidebar-label">CHAPTERS / 08</p>
      <nav class="tour-chapter-nav" aria-label="Demo chapters"><For each={chapters}>{chapter => <button type="button" class={current() === chapter.id ? "is-active" : ""} aria-current={current() === chapter.id ? "page" : undefined} onClick={() => navigate(chapter.id)}><span class="tour-nav-index">{chapter.index}</span><span>{chapter.label}</span><span class="tour-nav-arrow" aria-hidden="true">↗</span></button>}</For></nav>
      <div class="tour-sidebar-bottom"><div class="tour-dot"/><p><strong>55 public components</strong><small>Six families, three looks, one library.</small></p><a href="https://github.com/laputa-systems/laputa-ui-dashboard" target="_blank" rel="noopener noreferrer">Source on GitHub ↗</a></div>
    </aside>
    <main id="tour-content" class="tour-main" tabindex="-1"><header class="tour-topbar"><span>LIVE CATALOG <span class="tour-top-separator">/</span> INTERACTIVE</span><div class="tour-theme-switch" role="group" aria-label="Tour color theme"><button aria-pressed={theme()==="light"} onClick={() => setTheme("light")}>Light</button><button aria-pressed={theme()==="editorial"} onClick={() => setTheme("editorial")}>Paper</button><button aria-pressed={theme()==="dark"} onClick={() => setTheme("dark")}>Dark</button></div></header>
      <div class="tour-main-inner"><header class="tour-chapter-head"><div class="tour-chapter-serial">CHAPTER {active().index} <span> / 08</span></div><h1>{active().label}<span class="tour-period">.</span></h1><p>{active().subtitle}</p><div class="tour-chapter-rule"><span>INTERACTIVE / DETERMINISTIC EXAMPLES</span><span>{active().count === 0 ? "CSS & VISUAL LANGUAGE" : `${active().count} COMPONENT EXPORTS`}</span></div></header>
        <Show when={current()==="overview"}><FoundationsScene /></Show>
        <Show when={current()==="forms"}><FormsScene /></Show>
        <Show when={current()==="navigation"}><NavigationScene navigate={navigate} /></Show>
        <Show when={current()==="data"}><DataScene /></Show>
        <Show when={current()==="workspaces"}><WorkspacesScene /></Show>
        <Show when={current()==="feedback"}><FeedbackScene /></Show>
        <Show when={current()==="recipes"}><RecipesScene /></Show>
        <Show when={current()==="editorial"}><EditorialScene /></Show>
        <footer class="tour-footer"><div><small>END OF CHAPTER {active().index}</small><p>Designed for inspection. Change values, test controls, resize the page.</p></div><div class="tour-footer-actions"><Show when={position()>0}><Button appearance="ghost" onClick={() => navigate(chapters[position()-1]!.id)}>← Previous</Button></Show><Show when={position()<chapters.length-1} fallback={<Button appearance="primary" onClick={() => navigate("overview")}>Return to start ↗</Button>}><Button appearance="primary" onClick={() => navigate(chapters[position()+1]!.id)}>Next chapter ↗</Button></Show></div></footer>
      </div>
    </main>
  </div>;
}

const root = document.getElementById("root");
if (!root) throw new Error("Demo mount #root is missing");
render(() => <App />, root);
