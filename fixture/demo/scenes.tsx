import { createMemo, createSignal, For, Show, type JSX } from "solid-js";
import {
  Badge, Button, Icon, Notice, Panel,
} from "../../dist/index.js";
import {
  Checkbox, Combobox, DateRangePicker, Dropzone, MultiCombobox, NativeSelect,
  RadioGroup, Select, Switch, TagInput, TextArea, TextField,
  dateRangeComparison, type DateRange, type DropzoneFile, type Tag,
  type TagRequestState,
} from "../../dist/forms.js";
import {
  Accordion, ActionMenu, ArtifactPreview, Breadcrumbs, CommandMenu, Disclosure,
  FilterMenu, Popover, SaveBar, SearchDialog, SettingsRow, SplitPane, Tabs, Tooltip,
  Workbench, WorkspaceTabs, type FilterSelection, type SearchDialogState,
  type WorkspaceTab, type SaveBarState,
} from "../../dist/layout.js";
import { BreakdownChart, ChangeSummary, DataTable, SortableHeader, type SortDirection } from "../../dist/data.js";
import { Specimen, chapters, type ChapterId } from "./main";

const subjects = [
  { id: "japan", label: "Japan" }, { id: "korea", label: "Korea" },
  { id: "france", label: "France" }, { id: "united-states", label: "United States" },
];

export function FormsScene(): JSX.Element {
  const [reviewed, setReviewed] = createSignal(true);
  const [updates, setUpdates] = createSignal(true);
  const [priority, setPriority] = createSignal("standard");
  const [kind, setKind] = createSignal("dossier");
  const [region, setRegion] = createSignal("japan");
  const [place, setPlace] = createSignal<string | null>("japan");
  const [regions, setRegions] = createSignal<readonly string[]>(["japan", "korea"]);
  const [tags, setTags] = createSignal<readonly Tag[]>([{ id: "stoneware", label: "Stoneware" }, { id: "wood-firing", label: "Wood-fired" }]);
  const [tagState, setTagState] = createSignal<TagRequestState>({ kind: "idle" });
  const [range, setRange] = createSignal<DateRange>({ start: "2026-11-01", end: "2026-11-11", comparison: "previous" });
  const [files, setFiles] = createSignal<readonly DropzoneFile[]>([]);
  const [formMessage, setFormMessage] = createSignal("Nothing submitted yet");
  let fileSerial = 0;
  const formSubmit = (event: SubmitEvent) => { event.preventDefault(); setFormMessage(`Local preview saved: ${kind()}, ${priority()} priority, ${reviewed() ? "verified" : "unverified"}.`); };
  const acceptTags = (labels: readonly string[], id: string) => {
    setTags(current => [...current, ...labels.map((label, index) => ({ id: `${id}-${index}`, label }))]);
    setTagState({ kind: "accepted", id });
  };
  return <div class="tour-scene">
    <div class="tour-feature tour-feature-green"><span class="tour-eyebrow">FORM LAB / THE HUMAN INPUT LAYER</span><h2>Capture precise intent, with no mystery state.</h2><p>Fields are real HTML controls. Enhanced selection, date ranges, tags and uploads keep their changes visible in host-owned state.</p></div>
    <div class="tour-gallery-grid">
      <Specimen id="TextField / TextArea / NativeSelect / Checkbox" title="A research intake form" description="Labels, hints, reset, and validation live next to native fields; submit acknowledges only local demo state." wide>
        <form class="tour-form-grid" onSubmit={formSubmit}><TextField id="tour-maker" label="Subject" name="subject" placeholder="Artist, craft, or technique" hint="Use the full recorded name" required defaultValue="Ceramic traditions of Seto" />
          <NativeSelect id="tour-kind" label="Task type" name="kind" value={kind()} onValueChange={setKind} options={[{ value: "dossier", label: "Subject dossier" }, { value: "discovery", label: "Discover related sources" }, { value: "verification", label: "Verify an existing claim" }]} />
          <div class="tour-form-span"><TextArea id="tour-research-brief" label="Research brief" name="brief" defaultValue="Locate contemporary sources, confirm attribution, and record uncertain evidence." hint="Describe expected evidence and exclusions" autosize={{ minRows: 3, maxRows: 7 }} showCount /></div>
          <Checkbox id="tour-confirm" label="Sources already verified" hint="Can be revised later" checked={reviewed()} onCheckedChange={setReviewed} card />
          <Switch id="tour-email" label="Updates on completion" hint="Local preference" checked={updates()} onCheckedChange={setUpdates} placement="end" />
          <div class="tour-form-span tour-inline-row"><Button type="submit" appearance="primary">Preview task</Button><Button type="reset" appearance="ghost" onClick={() => setFormMessage("Form reset. Controlled choices remain explicit.")}>Reset fields</Button><span role="status" class="tour-muted">{formMessage()}</span></div>
        </form>
      </Specimen>
      <Specimen id="Select / RadioGroup" title="Choose a scope" description="Use a native select for forms and an enhanced picker only when descriptions genuinely add context.">
        <Select id="tour-source-type" label="Evidence source" value={region()} onValueChange={setRegion} options={[{ value: "japan", label: "Japanese archives", description: "Maker registries and galleries" }, { value: "korea", label: "Korean collections", description: "Museums and written sources" }, { value: "france", label: "French catalogues", description: "Exhibitions and publications" }]} />
        <RadioGroup label="Priority" name="priority" value={priority()} onChange={setPriority} options={[{ id: "standard", label: "Standard" }, { id: "expedited", label: "Expedited" }, { id: "background", label: "Background" }]} />
        <p class="tour-muted">Current: {region()} · {priority()}</p>
      </Specimen>
      <Specimen id="Combobox / MultiCombobox" title="Search a controlled vocabulary" description="Grouped options, single and multiple selection, keyboard movement, and removable choices.">
        <Combobox id="tour-location" label="Primary geography" options={subjects} value={place()} onChange={setPlace} hint="Search by name" />
        <MultiCombobox id="tour-regions" label="Relevant regions" options={subjects} value={regions()} onChange={setRegions} hint="Select multiple places" />
        <p class="tour-muted">Selected: {regions().join(", ") || "none"}</p>
      </Specimen>
      <Specimen id="TagInput" title="A small controlled taxonomy" description="Adding, editing and removing a tag updates this session's explicitly owned list.">
        <TagInput id="tour-tags" label="Practice terms" hint="Press Enter to add; select a chip to edit" value={tags()} state={tagState()} maxTags={6} maxLength={35} validate={name => name.includes("#") ? "Use plain terms without #" : undefined} onAdd={request => acceptTags(request.labels, request.id)} onEdit={request => {setTags(current => current.map(tag => tag.id === request.tagId ? { ...tag, label: request.label } : tag)); setTagState({kind:"accepted",id:request.id});}} onRemove={id => setTags(current => current.filter(tag => tag.id !== id))} />
        <p class="tour-muted">{tags().length} indexed terms</p>
      </Specimen>
      <Specimen id="DateRangePicker / dateRangeComparison" title="Time and comparison" description="Calendar dates are intentionally distinct from precise telemetry instants.">
        <DateRangePicker label="Publication window" value={range()} today="2026-11-11" allowComparison onChange={setRange} />
        <p class="tour-muted">Selected: {range().start} through {range().end}</p>
        <p class="tour-muted">Comparison period: {range().comparison ? JSON.stringify(dateRangeComparison(range())) : "none"}</p>
      </Specimen>
      <Specimen id="Dropzone" title="Evidence attachments" description="The browser supplies real File objects; this demo queues them locally and never uploads anywhere.">
        <Dropzone label="Attach source files" maxFiles={4} maxFileBytes={5_000_000} accept={["image/*", "application/pdf", ".txt"]} imagePreviews files={files()} onFiles={items => setFiles(current => [...current, ...items.map(file => ({ id: `file-${++fileSerial}`, file, state: { kind: "queued" as const } }))])} onRemove={id => setFiles(items => items.filter(item => item.id !== id))} onCancel={id => setFiles(items => items.map(item => item.id === id ? { ...item, state: {kind:"cancelled" as const} } : item))} onRetry={id => setFiles(items => items.map(item => item.id === id ? { ...item, state: {kind:"queued" as const} } : item))} />
        <p class="tour-muted">{files().length} file(s) selected; no network activity.</p>
      </Specimen>
    </div>
  </div>;
}

export function NavigationScene(props: { readonly navigate: (id: ChapterId) => void }): JSX.Element {
  const [tab, setTab] = createSignal("activity");
  const [filter, setFilter] = createSignal<readonly FilterSelection[]>([{groupId:"status",optionId:"active"}]);
  const [action, setAction] = createSignal("Select an action above");
  const [searchOpen, setSearchOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const results = createMemo(() => chapters.filter(chapter => `${chapter.label} ${chapter.subtitle}`.toLowerCase().includes(query().toLowerCase())).map(chapter => ({id:chapter.id,href:`#${chapter.id}`})));
  const searchState = createMemo((): SearchDialogState => query().trim() ? { kind: "results", results: results() } : {kind:"idle"});
  return <div class="tour-scene">
    <div class="tour-feature tour-feature-blue"><span class="tour-eyebrow">WAYFINDING / INTERACTION PATTERNS</span><h2>Get people where they meant to go.</h2><p>Navigation distinguishes links from local state, remembers focus, and works without a mouse. Try the command menu and search dialog.</p></div>
    <div class="tour-gallery-grid">
      <Specimen id="Breadcrumbs / Tabs" title="Context before controls" description="Semantic ancestor links and an independent tab choice with arrow key navigation." wide>
        <Breadcrumbs ancestors={[{label:"Library",href:"#overview"},{label:"Components",href:"#navigation"}]} current="Navigation examples" />
        <Tabs label="Example activity views" value={tab()} onChange={setTab} tabs={[{id:"activity",label:"Activity",count:4,content:<div class="tour-inner-panel"><Badge tone="ok">Active</Badge><p>Four changes have been recorded this week.</p></div>},{id:"files",label:"Artifacts",count:2,content:<div class="tour-inner-panel"><p>Two files are ready for review.</p></div>},{id:"history",label:"History",content:<div class="tour-inner-panel"><p>Revision history remains stable across tabs.</p></div>}]} />
      </Specimen>
      <Specimen id="Disclosure / Accordion" title="Reveal detail on demand" description="Two disclosure contracts: native independent details and a coordinated one-open accordion.">
        <Disclosure label="What is a source record?" defaultOpen><p>A source documents evidence without automatically establishing an attribution.</p></Disclosure>
        <Accordion id="tour-accordion" defaultOpenId="scope" items={[{id:"scope",label:"Scope and methods",children:<p>Gather independent citations and record contradictory evidence.</p>},{id:"review",label:"Review policy",children:<p>Uncertain findings require human review before publication.</p>},{id:"export",label:"Export formats",children:<p>Records can be presented as readable HTML or structured data.</p>}]} />
      </Specimen>
      <Specimen id="ActionMenu / CommandMenu" title="Actions without surprise" description="Scoped action lists and a searchable command menu; these actions update a local status only.">
        <div class="tour-inline-row"><ActionMenu label="Record actions" items={[{id:"copy",label:"Copy link"},{id:"review",label:"Request review"},{id:"archive",label:"Archive (unavailable)",disabled:true}]} onSelect={id => setAction(`Record: ${id}`)} />
          <CommandMenu label="Quick actions" groups={[{id:"nav",label:"Go to",commands:[{id:"data",label:"Data views",keywords:["charts","tables"]},{id:"forms",label:"Forms",keywords:["input"]}]},{id:"other",label:"Examples",commands:[{id:"confirm",label:"Mark example reviewed"}]}]} onSelect={id => id==="data"||id==="forms" ? props.navigate(id) : setAction("Example reviewed")}><Button appearance="ghost">Open commands</Button></CommandMenu>
        </div><p role="status" class="tour-muted">{action()}</p>
      </Specimen>
      <Specimen id="FilterMenu / Tooltip / Popover" title="Compact, discoverable controls" description="Controlled selections, context that works on focus, and a labelled anchored surface.">
        <FilterMenu label="Filter records" groups={[{id:"status",label:"Status",options:[{id:"active",label:"Active"},{id:"pending",label:"Pending"},{id:"finished",label:"Finished"}]},{id:"kind",label:"Kind",options:[{id:"article",label:"Article"},{id:"source",label:"Source"}]}]} value={filter()} onChange={setFilter} />
        <div class="tour-inline-row"><Popover label="Evidence guidance" trigger="Evidence guide"><p>Prefer primary source material and preserve uncertainty.</p><Button variant="small" onClick={() => setAction("Opened evidence guidance")}>Use this guidance</Button></Popover>
        <Tooltip label="Coverage help" content="A coverage estimate does not replace a source citation."><button type="button" class="ui-btn">Hover or focus for help</button></Tooltip></div><p class="tour-muted">{filter().length} filter(s) selected.</p>
      </Specimen>
      <Specimen id="SearchDialog" title="Search the entire tour" description="The host owns querying, results, and navigation. The library owns dialog, selection, and focus behavior." wide>
        <div class="tour-inline-row"><Button appearance="primary" leadingIcon={<Icon name="search" />} onClick={() => setSearchOpen(true)}>Find a chapter</Button><span class="tour-muted">Search by title or description.</span></div>
        <SearchDialog label="Search tour chapters" open={searchOpen()} onOpenChange={setSearchOpen} query={query()} onQueryChange={setQuery} state={searchState()} renderResult={result => <span class="tour-search-result"><strong>{chapters.find(chapter => chapter.id === result.id)?.label}</strong><small>{chapters.find(chapter => chapter.id === result.id)?.subtitle}</small></span>} />
      </Specimen>
    </div></div>;
}

interface DataRow { readonly id: string; readonly service: string; readonly region: string; readonly requests: number; readonly latency: number; readonly status: "healthy" | "watch" | "incident"; }
const serviceRows: readonly DataRow[] = [
  {id:"collector",service:"Collector API",region:"us-west",requests:125_840,latency:81,status:"healthy"},
  {id:"research",service:"Research queue",region:"eu-west",requests:95_210,latency:118,status:"watch"},
  {id:"render",service:"Wiki renderer",region:"ap-northeast",requests:167_230,latency:43,status:"healthy"},
  {id:"search",service:"Search index",region:"us-east",requests:71_204,latency:204,status:"incident"},
];
export function DataScene(): JSX.Element {
  const [sort, setSort] = createSignal<SortDirection>("descending");
  const [visible, setVisible] = createSignal("all");
  const [series, setSeries] = createSignal<readonly string[]>(["compute","storage","egress"]);
  const selection = createMemo(() => visible() === "all" ? serviceRows : serviceRows.filter(row => row.status === visible()));
  const ordered = createMemo(() => [...selection()].sort((a,b) => sort() === "descending" ? b.requests-a.requests : a.requests-b.requests));
  const categories = [
    { id:"research",label:"Research",values:[{seriesId:"compute",value:182},{seriesId:"storage",value:61},{seriesId:"egress",value:18}] },
    { id:"platform",label:"Platform",values:[{seriesId:"compute",value:121},{seriesId:"storage",value:82},{seriesId:"egress",value:12}] },
    { id:"delivery",label:"Delivery",values:[{seriesId:"compute",value:45},{seriesId:"storage",value:37},{seriesId:"egress",value:60}] },
  ];
  return <div class="tour-scene"><div class="tour-feature tour-feature-blue"><span class="tour-eyebrow">DATA / OBSERVABILITY</span><h2>Dense, but not obscure.</h2><p>Small, readable analytical views that preserve units, source context, and unknown values.</p></div>
    <div class="tour-gallery-grid">
      <Specimen id="ChangeSummary" title="At-a-glance measurements" description="Interpretation is supplied by the application—an increase isn't inherently good or bad." wide>
        <ChangeSummary label="Changes this week" period="Compared with the previous seven days" items={[{id:"latency",label:"P95 latency",value:"118 ms",change:{kind:"known",amount:"11%",direction:"decrease",interpretation:"good"}},{id:"availability",label:"Availability",value:"99.8%",change:{kind:"known",amount:"0.3 pp",direction:"increase",interpretation:"good"}},{id:"cost",label:"Projected compute",value:"$412",change:{kind:"known",amount:"4.2%",direction:"increase",interpretation:"bad"}},{id:"missing",label:"External storage",value:"Unavailable",change:{kind:"unavailable",message:"Meter not connected"}}]} />
      </Specimen>
      <Specimen id="BreakdownChart" title="Where the resource goes" description="Interactive legend and inspectable values, with a readable numeric equivalent." wide>
        <BreakdownChart label="Monthly spend by area" series={[{id:"compute",label:"Compute"},{id:"storage",label:"Storage"},{id:"egress",label:"Egress"}]} categories={categories} formatValue={value => `$${value.toFixed(0)}`} seriesSelection={{selectedIds:series(),onChange:setSeries}} />
      </Specimen>
      <Specimen id="SortableHeader / DataTable" title="An analytical service register" description="Semantic read-only table with controlled ordering. Sorting and filtering remain in the host; no spreadsheet runtime." wide>
        <div class="tour-inline-row"><Button variant="small" appearance={visible()==="all"?"primary":"ghost"} onClick={() => setVisible("all")}>All services</Button><Button variant="small" appearance={visible()==="healthy"?"primary":"ghost"} onClick={() => setVisible("healthy")}>Healthy</Button><Button variant="small" appearance={visible()==="incident"?"primary":"ghost"} onClick={() => setVisible("incident")}>Incidents</Button></div>
        <div class="tour-table-wrap"><table class="ui-data-table"><caption>Request volume by service</caption><thead><tr><th>Service</th><th>Region</th><SortableHeader label="Requests" direction={sort()} onSort={() => setSort(d => d === "ascending" ? "descending" : "ascending")}/><th>Status</th></tr></thead><tbody><For each={ordered()}>{row => <tr><th scope="row">{row.service}</th><td>{row.region}</td><td class="numeric">{row.requests.toLocaleString("en-US")}</td><td><Badge tone={row.status === "healthy" ? "ok" : row.status === "incident" ? "bad" : "warn"}>{row.status}</Badge></td></tr>}</For></tbody></table></div>
        <DataTable caption="Latency detail by service" rows={ordered()} getRowId={row => row.id} columns={[{id:"service",label:"Service",rowHeader:true,cell:row => <strong>{row().service}</strong>},{id:"p95",label:"P95",cell:row => <span>{row().latency} ms</span>},{id:"region",label:"Region",cell:row => <span>{row().region}</span>}]} />
      </Specimen>
    </div>
  </div>;
}

export function WorkspacesScene(): JSX.Element {
  const [drawer, setDrawer] = createSignal(false);
  const [secondary, setSecondary] = createSignal(true);
  const [selected, setSelected] = createSignal<string | null>("report");
  const [tabs, setTabs] = createSignal<readonly WorkspaceTab[]>([
    { id: "report", label: "research-report.md", dirty: true, content: <div class="tour-document"><h4>Research report</h4><p>A short document draft with two cited findings.</p><ul><li>Source verified</li><li>Publication deferred</li></ul></div> },
    { id: "trace", label: "trace-2026-11-11.json", content: <pre class="tour-code">{'{\n  "trace": "task-042",\n  "status": "complete"\n}'}</pre> },
  ]);
  const [preview, setPreview] = createSignal<"ready"|"failed"|"loading">("ready");
  const [settings, setSettings] = createSignal<SaveBarState>({ kind: "clean" });
  let opener: HTMLButtonElement | undefined;
  let nextArtifactId = 0;
  const close = (id:string) => {const t=tabs();const n=t.filter(tab=>tab.id!==id);setSelected(current=>current===id?n[0]?.id??null:current);setTabs(n);};
  return <div class="tour-scene"><div class="tour-feature tour-feature-green"><span class="tour-eyebrow">COMPOSITION / PRODUCT WORKSPACES</span><h2>Every pane has a job.</h2><p>Workbench navigation, shared artifact tabs, resizable regions and inspector details can be composed without an application router or backend.</p></div>
    <div class="tour-gallery-grid">
      <Specimen id="Workbench" title="A review workspace" description="An inset multi-pane shell with optional secondary navigation, a controlled inspector drawer and diagnostics." wide>
        <div class="tour-inline-row"><Button variant="small" onClick={() => setDrawer(true)}>Open inspector on small screens</Button><Button variant="small" onClick={() => setSecondary(open => !open)}>Toggle secondary nav</Button></div>
        <div class="tour-workbench-preview"><Workbench appearance="inset" navigationDrawer={{label:"Workspace navigation"}} navigation={<nav aria-label="Workspace rail" class="tour-workbench-rail"><a href="#workspaces" aria-label="Projects"><Icon name="host" /></a><a href="#data" aria-label="Data views"><Icon name="activity" /></a></nav>} secondaryNavigation={secondary() ? <nav aria-label="Review projects" class="tour-workbench-secondary"><strong>Research desk</strong><a href="#workspaces" aria-current="page">Overview</a><a href="#data">Observability</a><a href="#editorial">Archive</a></nav> : undefined} workspace={{label:"Evidence inspector",drawer:{open:drawer(),onOpenChange:setDrawer},content:<div class="tour-stack"><strong>Current evidence</strong><Badge tone="ok">Verified</Badge><p>Two independent sources support the research statement.</p></div>}} diagnostics={{label:"Recent operations",content:<p>09:32 · Task completed &nbsp; 09:29 · Review requested</p>}}><div class="tour-stack"><h3>Research session</h3><p>The selected research task remains visible alongside its evidence and activity.</p><div class="tour-fake-steps"><span>01 / Scope verified</span><span>02 / Sources collected</span><span>03 / Ready for review</span></div></div></Workbench></div>
      </Specimen>
      <Specimen id="SplitPane" title="A resizable investigation" description="Grab the separator or use arrow keys. Minima protect both content regions." wide>
        <div class="tour-split-frame"><SplitPane label="Source / evidence split" axis="horizontal" minSize={130} maxSize={480} minOtherSize={130} defaultSize={290} primary={<div class="tour-inset-pane"><strong>Selected finding</strong><p>Seven citations found for the subject.</p><Badge tone="accent">Reviewable</Badge></div>} secondary={<div class="tour-inset-pane"><strong>Evidence</strong><p>Maker profile · official exhibition catalogue · publication excerpt.</p><p class="tour-muted">This region is independently scrollable.</p></div>} /></div>
      </Specimen>
      <Specimen id="WorkspaceTabs / ArtifactPreview" title="Stable, inspectable artifacts" description="Select or close real tabs, inspect a typed preview state and restore focus when the last one closes." wide>
        <div class="tour-inline-row"><Button variant="small" ref={el => {opener=el;}} onClick={() => {const id="draft-"+(++nextArtifactId);setTabs(items=>[...items,{id,label:"draft-"+nextArtifactId+".txt",content:<p>New local draft.</p>,closable:true}]);setSelected(id);}}>Add draft tab</Button><Button variant="small" onClick={() => setPreview(p=>p==="ready"?"loading":p==="loading"?"failed":"ready")}>Cycle preview state</Button></div>
        <WorkspaceTabs label="Research artifacts" tabs={tabs()} selectedId={selected()} onSelect={setSelected} onClose={close} returnFocus={() => opener ?? null}/>
        <ArtifactPreview label="Selected evidence preview" state={preview()==="ready"?{kind:"ready",content:<div class="tour-document"><strong>Source synopsis</strong><p>Full, readable evidence is available in the selected artifact tab.</p></div>}:preview()==="loading"?{kind:"loading",message:"Loading evidence preview"}:{kind:"failed",message:"Preview is unavailable",retry:()=>setPreview("ready")}} />
      </Specimen>
      <Specimen id="SettingsRow / SaveBar" title="Preferences with explicit persistence" description="Form rows provide stable layout while a save bar reflects local pending, saved and discard states." wide>
        <div class="tour-stack"><SettingsRow label="Review mode" description="Require a human decision before publishing a new record."><label class="tour-inline-row"><input type="checkbox" defaultChecked onChange={() => setSettings({kind:"dirty"})}/> Enable review requirement</label></SettingsRow><SettingsRow label="Notification language" description="Only the interface locale changes; records keep native names."><select aria-label="Notification language" onChange={() => setSettings({kind:"dirty"})}><option>English</option><option>Japanese</option><option>French</option></select></SettingsRow><SaveBar state={settings()} onSave={() => setSettings({kind:"saved",message:"Saved in this local demo"})} onDiscard={() => setSettings({kind:"clean"})}/></div>
      </Specimen>
    </div>
  </div>;
}
