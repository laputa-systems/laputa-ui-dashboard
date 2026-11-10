import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { SearchDialog, type SearchDialogState, type SearchResult } from "@laputa-systems/ui-dashboard/layout";

interface RichResult {
  readonly before: string;
  readonly match: string;
  readonly after: string;
  readonly meta: string;
  readonly excerpt: string;
}

const thumbnail = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23dde3ee'/%3E%3C/svg%3E";

const richResults: Record<string, RichResult> = {
  alpha: { before: "Alpha ", match: "Studio", after: "", meta: "Artist · Berlin", excerpt: "Painting, sculpture and installation." },
  beta: { before: "Beta ", match: "Gallery", after: "", meta: "Venue · Paris", excerpt: "Contemporary exhibitions." },
  gamma: { before: "Gamma ", match: "Archive", after: "", meta: "Collection · Lisbon", excerpt: "Works on paper." },
  delta: { before: "Delta ", match: "Press", after: "", meta: "Publisher · Oslo", excerpt: "Artist books and editions." },
  epsilon: { before: "Epsilon ", match: "Studio", after: "", meta: "Artist · Kyoto", excerpt: "Ceramics and video." }
};

const result = (id: string): SearchResult => ({ id, href: `/targets/${id}` });
const forIds = (...ids: string[]): SearchResult[] => ids.map(result);
const richFor = (id: string): RichResult => richResults[id] ?? { before: "", match: id, after: "", meta: `Result ${id}`, excerpt: `Excerpt for ${id}` };

function renderResult(item: SearchResult, state: { readonly active: boolean }) {
  const data = richFor(item.id);
  return <span data-testid={`result-${item.id}`} data-active-render={state.active ? "true" : "false"} style={{ display: "flex", gap: "8px" }}>
    <img src={thumbnail} alt="" width="40" height="40" />
    <span style={{ display: "grid", gap: "2px" }}>
      <span data-testid={`title-${item.id}`}>{data.before}<mark>{data.match}</mark>{data.after}</span>
      <span data-testid={`meta-${item.id}`}>{data.meta}</span>
      <span data-testid={`excerpt-${item.id}`}>{data.excerpt}</span>
    </span>
  </span>;
}

function Fixture() {
  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [state, setState] = createSignal<SearchDialogState>({ kind: "results", results: forIds("alpha", "beta", "gamma") });
  const [openRequests, setOpenRequests] = createSignal(0);
  const [queryRequests, setQueryRequests] = createSignal(0);
  const requestOpen = (value: boolean) => { setOpenRequests(count => count + 1); setOpen(value); };
  const requestQuery = (value: string) => { setQueryRequests(count => count + 1); setQuery(value); };
  const fallback = () => document.querySelector<HTMLElement>('[data-testid="focus-fallback"]');
  const probe = (kind: "unsafe" | "many") => {
    const probeResults: SearchResult[] = kind === "unsafe" ? [{ id: "unsafe", href: "javascript:alert(1)" }] : Array.from({ length: 201 }, (_, index) => ({ id: `result-${index}`, href: `/targets/${index}` }));
    const container = document.createElement("div");
    try {
      const dispose = render(() => <SearchDialog label="Probe" open={true} onOpenChange={() => {}} query="" onQueryChange={() => {}} state={{ kind: "results", results: probeResults }} renderResult={item => <span>{item.id}</span>} />, container);
      dispose();
      return "no error";
    } catch (error) {
      return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
  };
  Object.assign(window, {
    searchFixture: {
      setOpen: (value: boolean) => setOpen(value),
      setQuery: (value: string) => setQuery(value),
      setState: (value: SearchDialogState) => setState(value),
      replaceSame: () => setState(previous => ({ kind: "results", results: previous.kind === "results" ? forIds(...previous.results.map(item => item.id)) : forIds("alpha", "beta", "gamma") })),
      replaceNew: () => setState({ kind: "results", results: forIds("delta", "epsilon") }),
      setLoading: () => setState({ kind: "loading" }),
      setError: () => setState({ kind: "error", message: "Search unavailable" }),
      setNoResults: () => setState({ kind: "results", results: [] }),
      probe
    }
  });
  return <>
    <p><button type="button" data-testid="opener" onClick={() => setOpen(true)}>Open search</button></p>
    <p><button type="button" data-open-search onClick={() => setOpen(true)}>Open from search button</button></p>
    <p><button type="button" data-testid="focus-fallback">Fallback target</button></p>
    <p><label>Outside input <input data-testid="outside-input" /></label></p>
    <div contentEditable tabindex="0" role="textbox" aria-label="Outside editor" data-testid="outside-editor">Editable</div>
    <p><button type="button" data-testid="close-externally" onClick={() => setOpen(false)}>Close externally</button></p>
    <p><button type="button" data-testid="query-externally" onClick={() => setQuery("external")}>Set query externally</button></p>
    <output data-testid="open-requests">{openRequests()}</output>
    <output data-testid="query-requests">{queryRequests()}</output>
    <output data-testid="open-state">{open() ? "open" : "closed"}</output>
    <output data-testid="query-state">{query()}</output>
    <SearchDialog label="Search the archive" open={open()} onOpenChange={requestOpen} query={query()} onQueryChange={requestQuery} state={state()} shortcut={{ key: "/", scope: "document" }} returnFocus={fallback} renderResult={renderResult} />
  </>;
}

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);
