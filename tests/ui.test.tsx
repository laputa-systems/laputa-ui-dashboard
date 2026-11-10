import { describe, expect, it, vi } from "vitest";
import { BreakdownChart, DataTable } from "../src/data";
import { renderToString } from "@solidjs/web";
import { Checkbox, Combobox, dateRangeComparison, DateRangePicker, Dropzone, MultiCombobox, NativeSelect, RadioGroup, Select, Switch, TagInput, TextArea, TextField } from "../src/forms";
import { ActionStatus, createToastStore, NotificationStack, Progress, Toaster } from "../src/feedback";
import { Accordion, ActionMenu, ArtifactPreview, Breadcrumbs, Disclosure, FilterMenu, Popover, SaveBar, SettingsRow, SplitPane, Tabs, Tooltip, Workbench, WorkspaceTabs } from "../src/layout";
import { IntegrationPicker, ProfileMenu } from "../src/recipes";
import {
  Badge,
  Button,
  CollapsiblePanel,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  Meter,
  Modal,
  Notice,
  PageHeader,
  Pagination,
  Panel,
  Segmented,
  Shell,
  Skeleton
} from "../src/index";

function classTokens(html: string): string[] {
  return [...html.matchAll(/class="([^"]*)"/gu)].flatMap(match => (match[1] ?? "").split(/\s+/u)).filter(token => token !== "");
}

describe("@laputa-systems/ui-dashboard", () => {
  it("distinguishes missing, zero, and signed breakdown values", () => {
    const series = [{ id: "built", label: "Built" }, { id: "failed", label: "Failed" }];
    const categories = [{ id: "first", label: "First", values: [{ seriesId: "built", value: 0 }, { seriesId: "failed", value: null }] }, { id: "second", label: "Second", values: [{ seriesId: "built", value: -4 }, { seriesId: "failed", value: 6 }] }];
    const render = (items: typeof categories) => renderToString(() => <BreakdownChart label="Builds" series={series} categories={items} formatValue={value => `${value} jobs`} />);
    const html = render(categories);
    expect(html).toContain("0 jobs");
    expect(html).toContain("Unavailable");
    expect(html).toContain("-4 jobs");
    expect(html).toContain("6 jobs");
    expect(() => render([{ id: "first", label: "First", values: [{ seriesId: "built", value: 1 }, { seriesId: "built", value: 2 }] }])).toThrow("unique");
    expect(() => render([{ id: "first", label: "First", values: [{ seriesId: "built", value: Number.NaN }, { seriesId: "failed", value: null }] }])).toThrow("finite");
    expect(() => render([{ id: "first", label: "First", values: [{ seriesId: "built", value: 1 }] }])).toThrow("every series");
    expect(() => render([{ id: "first", label: "First", values: [{ seriesId: "unknown", value: 1 }] }])).toThrow("unknown series");
    expect(() => render([{ id: "first", label: "First", values: [{ seriesId: "built", value: 1e308 }, { seriesId: "failed", value: 1e308 }] }])).toThrow(RangeError);
    expect(() => render(Array.from({ length: 41 }, (_, index) => ({ ...categories[0]!, id: String(index) })))).toThrow(RangeError);
    expect(() => renderToString(() => <BreakdownChart label="Builds" series={series} categories={categories} formatValue={() => " "} />)).toThrow("nonempty");
  });
  it("validates breakdown dimension choices and legend selection", () => {
    const dimension = { label: "Measure", value: "one", options: [{ id: "one", label: "One" }] };
    const series = [{ id: "built", label: "Built" }];
    const render = (measure: typeof dimension, selectedIds: readonly string[]) => renderToString(() => <BreakdownChart label="Builds" series={series} categories={[]} formatValue={String} dimensions={{ measure, category: { ...dimension, label: "Category" }, stack: { ...dimension, label: "Stack" } }} seriesSelection={{ selectedIds }} />);
    const html = render(dimension, ["built"]);
    expect(html).toContain('aria-pressed="true"');
    expect(() => render({ ...dimension, value: "missing" }, [])).toThrow("identify an option");
    expect(() => render({ ...dimension, options: [...dimension.options, ...dimension.options] }, [])).toThrow("unique");
    expect(() => render(dimension, ["missing"])).toThrow("identify a series");
    expect(() => render(dimension, ["built", "built"])).toThrow("unique");
  });
  it("renders bounded semantic data tables and validates identities", () => {
    const columns = [{ id: "name", label: "Name", rowHeader: true as const, cell: (row: () => { id: string; name: string }) => row().name }];
    const render = (rows: readonly { id: string; name: string }[]) => renderToString(() => <DataTable caption="Projects" columns={columns} rows={rows} getRowId={row => row.id} />);
    const html = render([{ id: "one", name: "<Alpha>" }]);
    expect(html).toContain("<caption");
    expect(html).toContain('scope="col"');
    expect(html).toContain('scope="row"');
    expect(html).toContain("&lt;Alpha>");
    expect(render([])).toContain("No records.");
    expect(() => render([{ id: "one", name: "First" }, { id: "one", name: "Duplicate" }])).toThrow("unique");
    expect(() => render([{ id: " ", name: "Blank" }])).toThrow("nonempty");
    expect(() => render(Array.from({ length: 1001 }, (_, index) => ({ id: String(index), name: "Record" })))).toThrow(RangeError);
    expect(() => renderToString(() => <DataTable caption="Projects" columns={[...columns, ...columns]} rows={[]} getRowId={row => row.id} />)).toThrow("unique");
  });
  it("bounds isolated toast queues and validates updates", () => {
    const first = createToastStore();
    const second = createToastStore();
    first.add({ id: "one", title: "First" });
    expect(second.toasts()).toEqual([]);
    expect(() => first.add({ id: "one", title: "Duplicate" })).toThrow("unique");
    expect(() => first.add({ id: "short", title: "Short", durationMs: 1 })).toThrow(RangeError);
    expect(() => first.add({ id: "long", title: "Long", durationMs: 86400001 })).toThrow(RangeError);
    expect(() => first.update("missing", { title: "Missing" })).toThrow("not in the queue");
    first.update("one", { title: "Updated" });
    expect(renderToString(() => <Toaster label="Notices" store={first} />)).toContain("Updated");
    expect(first.dismiss("missing")).toBe(false);
    expect(first.dismiss("one")).toBe(true);
    for (let i = 0; i < 100; i += 1) first.add({ id: String(i), title: "Notice" });
    expect(() => first.add({ id: "overflow", title: "Overflow" })).toThrow(RangeError);
    expect(() => renderToString(() => <Toaster label="Notices" store={second} maxVisible={0} />)).toThrow(RangeError);
  });
  it("tracks promise results without resurrecting a changed or dismissed toast", async () => {
    const store = createToastStore();
    let resolve!: (value: string) => void;
    const operation = new Promise<string>(done => { resolve = done; });
    const tracked = store.track("save", operation, { pending: { title: "Saving" }, succeeded: value => ({ title: value }), failed: () => ({ title: "Failed" }) });
    expect(store.toasts()[0]?.title).toBe("Saving");
    resolve("Saved");
    await expect(tracked).resolves.toBe("Saved");
    expect(store.toasts()[0]?.title).toBe("Saved");
    const error = new Error("denied");
    await expect(store.track("failure", Promise.reject(error), { pending: { title: "Saving" }, succeeded: () => ({ title: "Saved" }), failed: () => ({ title: "Failed" }) })).rejects.toBe(error);
    expect(store.toasts().find(toast => toast.id === "failure")?.title).toBe("Failed");
    let finish!: (value: string) => void;
    const stale = store.track("stale", new Promise<string>(done => { finish = done; }), { pending: { title: "Waiting" }, succeeded: () => ({ title: "Old result" }), failed: () => ({ title: "Old failure" }) });
    store.dismiss("stale");
    store.add({ id: "stale", title: "New notice" });
    finish("done");
    await stale;
    expect(store.toasts().find(toast => toast.id === "stale")?.title).toBe("New notice");
    let complete!: (value: string) => void;
    const changed = store.track("changed", new Promise<string>(done => { complete = done; }), { pending: { title: "Waiting" }, succeeded: () => ({ title: "Old result" }), failed: () => ({ title: "Old failure" }) });
    store.update("changed", { title: "Host update" });
    complete("done");
    await changed;
    expect(store.toasts().find(toast => toast.id === "changed")?.title).toBe("Host update");
  });
  it("rejects unsafe breadcrumb links and empty labels", () => {
    expect(() => renderToString(() => <Breadcrumbs ancestors={[{ label: "Bad", href: "javascript:alert(1)" }]} current="Here" />)).toThrow("Invalid breadcrumb");
    expect(() => renderToString(() => <Breadcrumbs ancestors={[]} current="  " />)).toThrow("nonempty");
    const html = renderToString(() => <Breadcrumbs ancestors={[{ label: "Projects", href: "/projects" }]} current="Settings" />);
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/projects"');
  });
  it("requires names for a popover and its trigger", () => {
    expect(() => renderToString(() => <Popover label=" " trigger="Open">Content</Popover>)).toThrow("nonempty");
    expect(() => renderToString(() => <Popover label="Options" trigger=" ">Content</Popover>)).toThrow("nonempty");
    expect(renderToString(() => <Popover label="Options" trigger="Open">Content</Popover>)).toContain('popover="auto"');
  });
  it("requires an independent tooltip name and description", () => {
    expect(() => renderToString(() => <Tooltip label=" " content="Detail">Info</Tooltip>)).toThrow("nonempty");
    expect(() => renderToString(() => <Tooltip label="Information" content=" ">Info</Tooltip>)).toThrow("nonempty");
    const html = renderToString(() => <Tooltip label="Information" content="Detail">Info</Tooltip>);
    expect(html).toContain('role="tooltip"');
    expect(html).toContain('aria-describedby=');
  });
  it("renders optional workbench panes and rejects unnamed regions", () => {
    const html = renderToString(() => <Workbench navigation={<nav aria-label="Primary" />} workspace={{ label: "Workspace", content: "Details" }}>Main</Workbench>);
    expect(html).toContain('aria-label="Workspace"');
    expect(html).toContain("Details");
    expect(html).not.toContain("ui-workbench-secondary");
    expect(() => renderToString(() => <Workbench navigation={<nav />} workspace={{ label: " ", content: "Details" }}>Main</Workbench>)).toThrow("nonempty");
    expect(() => renderToString(() => <Workbench navigation={<nav />} navigationDrawer={{ label: " " }}>Main</Workbench>)).toThrow("nonempty");
  });
  it("validates collapsible secondary navigation", () => {
    expect(() => renderToString(() => <Workbench navigation="Primary" secondaryNavigationCollapse={{ label: "Project" }}>Main</Workbench>)).toThrow("requires secondary navigation");
    expect(() => renderToString(() => <Workbench navigation="Primary" secondaryNavigation="Links" secondaryNavigationCollapse={{ label: " " }}>Main</Workbench>)).toThrow("nonempty");
    const html = renderToString(() => <Workbench navigation="Primary" secondaryNavigation="Links" secondaryNavigationCollapse={{ label: "Project", open: false }}>Main</Workbench>);
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain("Links");
  });
  it("requires meaningful settings labels and save messages", () => {
    expect(() => renderToString(() => <SettingsRow label=" ">Content</SettingsRow>)).toThrow("nonempty");
    expect(() => renderToString(() => <SaveBar state={{ kind: "failed", message: " " }} />)).toThrow("nonempty");
    expect(() => renderToString(() => <SaveBar state={{ kind: "saved", message: " " }} />)).toThrow("nonempty");
    const html = renderToString(() => <SettingsRow label="Identity" description="Help">Content</SettingsRow>);
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-describedby=');
  });

  it("validates split pane bounds before rendering", () => {
    const render = (minSize: number, maxSize: number, defaultSize: number) => renderToString(() => <SplitPane label="Split" axis="horizontal" minSize={minSize} maxSize={maxSize} minOtherSize={20} defaultSize={defaultSize} primary="First" secondary="Second" />);
    expect(render(20, 200, 100)).toContain('role="separator"');
    expect(() => render(200, 20, 100)).toThrow(RangeError);
    expect(() => render(20, 200, 201)).toThrow(RangeError);
    expect(() => render(20, 200, Number.NaN)).toThrow(RangeError);
  });
  it("validates workspace identities and selection", () => {
    const render = (tabs: readonly { id: string; label: string; content: string }[], selectedId: string | null) => renderToString(() => <WorkspaceTabs label="Artifacts" tabs={tabs} selectedId={selectedId} onSelect={() => {}} returnFocus={() => null} />);
    expect(render([{ id: "one", label: "First", content: "Body" }], "one")).toContain('role="tabpanel"');
    expect(render([], null)).toContain("No open artifacts.");
    expect(() => render([{ id: "one", label: "First", content: "Body" }, { id: "one", label: "Second", content: "Body" }], "one")).toThrow("unique");
    expect(() => render([{ id: "one", label: "First", content: "Body" }], null)).toThrow("selectedId");
    expect(() => render([], "one")).toThrow("selectedId");
    expect(() => renderToString(() => <WorkspaceTabs label="Artifacts" tabs={[{ id: "one", label: "First", content: "Body" }]} selectedId="one" onSelect={() => {}} returnFocus={() => null} closeState={{ kind: "failed", tabId: "one", message: " " }} />)).toThrow("Invalid workspace close state");
  });
  it("validates artifact preview states and escapes text", () => {
    const html = renderToString(() => <ArtifactPreview label="Artifact" state={{ kind: "ready", content: "<script>bad()</script>", dirty: true }} />);
    expect(html).toContain("&lt;script>bad()&lt;/script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("Unsaved changes");
    expect(() => renderToString(() => <ArtifactPreview label="Artifact" state={{ kind: "failed", message: " " }} />)).toThrow("nonempty");
    expect(() => renderToString(() => <ArtifactPreview label=" " state={{ kind: "loading", message: "Loading" }} />)).toThrow("nonempty");
  });
  it("validates date-only range values and bounds", () => {
    const render = (start: string, end: string, min?: string, max?: string) => renderToString(() => <DateRangePicker label="Dates" value={{ start, end }} min={min} max={max} onChange={() => {}} />);
    expect(render("2000-02-29", "2000-02-29")).toContain("2000-02-29");
    for (const range of [["1900-02-29", "1900-03-01"], ["0000-01-01", "0001-01-01"], ["2024-03-02", "2024-03-01"], ["2024-02-01T00:00:00Z", "2024-02-02"]]) {
      expect(() => render(range[0]!, range[1]!)).toThrow(RangeError);
    }
    expect(() => render("2024-02-01", "2024-02-02", "2024-02-02")).toThrow(RangeError);
    expect(() => render("2024-02-01", "2024-02-02", "2024-03-01", "2024-02-01")).toThrow(RangeError);
    expect(() => renderToString(() => <DateRangePicker label="Dates" value={{ start: "2024-01-01", end: "2024-01-01" }} today="2023-02-29" onChange={() => {}} />)).toThrow(RangeError);
  });
  it("derives inclusive date comparisons without a timezone or overflow", () => {
    expect(dateRangeComparison({ start: "2024-03-09", end: "2024-03-11", comparison: "previous" })).toEqual({ start: "2024-03-06", end: "2024-03-08" });
    expect(dateRangeComparison({ start: "2024-02-29", end: "2024-03-01", comparison: "year" })).toEqual({ start: "2023-02-28", end: "2023-03-01" });
    expect(dateRangeComparison({ start: "2024-01-01", end: "2024-01-01" })).toBeNull();
    expect(() => dateRangeComparison({ start: "0001-01-01", end: "0001-01-01", comparison: "previous" })).toThrow(RangeError);
    expect(() => dateRangeComparison({ start: "0001-01-01", end: "0001-01-01", comparison: "year" })).toThrow(RangeError);
  });
  it("rejects invalid dropzone limits and duplicate file identities", () => {
    const file = new File(["x"], "a.txt", { type: "text/plain" });
    expect(() => renderToString(() => <Dropzone label="Files" files={[]} maxFiles={101} maxFileBytes={1} />)).toThrow(RangeError);
    expect(() => renderToString(() => <Dropzone label="Files" files={[]} maxFiles={1} maxFileBytes={-1} />)).toThrow(RangeError);
    expect(() => renderToString(() => <Dropzone label="Files" files={[]} maxFiles={1} maxFileBytes={1} accept={["invalid"]} />)).toThrow("Invalid Dropzone accept type");
    expect(() => renderToString(() => <Dropzone label="Files" files={[{ id: "a", file }, { id: "a", file }]} maxFiles={2} maxFileBytes={1} />)).toThrow("Dropzone file IDs must be nonempty and unique");
    expect(() => renderToString(() => <Dropzone label="Files" files={[{ id: "a", file, state: { kind: "uploading", progress: { value: 2, max: 1 } } }]} maxFiles={1} maxFileBytes={1} />)).toThrow(RangeError);
    expect(() => renderToString(() => <Dropzone label="Files" files={[{ id: "a", file, state: { kind: "failed", message: "" } }]} maxFiles={1} maxFileBytes={1} />)).toThrow("Dropzone failure requires a message");
  });
  it("does not create file preview URLs during server rendering", () => {
    const create = vi.spyOn(URL, "createObjectURL");
    try {
      const file = new File(["x"], "image.png", { type: "image/png" });
      const html = renderToString(() => <Dropzone label="Files" files={[{ id: "image", file }]} maxFiles={1} maxFileBytes={1} imagePreviews />);
      expect(html).not.toContain("<img");
      expect(create).not.toHaveBeenCalled();
    } finally {
      create.mockRestore();
    }
  });
  it("validates filter identities and renders mixed selection semantics", () => {
    const group = { id: "status", label: "Status", options: [{ id: "open", label: "Open" }, { id: "closed", label: "Closed" }] };
    const html = renderToString(() => <FilterMenu label="Filters" groups={[group]} value={[{ groupId: "status", optionId: "open" }]} onChange={() => {}} />);
    expect(html).toContain('aria-checked="mixed"');
    expect(() => renderToString(() => <FilterMenu label="Filters" groups={[group, group]} value={[]} onChange={() => {}} />)).toThrow("Filter group IDs must be nonempty and unique");
    expect(() => renderToString(() => <FilterMenu label="Filters" groups={[{ ...group, options: [group.options[0]!, group.options[0]!] }]} value={[]} onChange={() => {}} />)).toThrow("Filter option IDs must be nonempty and unique within a group");
    expect(() => renderToString(() => <FilterMenu label="Filters" groups={[]} value={[{ groupId: "x", optionId: "y" }, { groupId: "x", optionId: "y" }]} onChange={() => {}} />)).toThrow("Filter selections must have nonempty unique IDs");
  });
  it("validates integration identities and connection errors", () => {
    const item = { id: "one", label: "One", description: "Service", connection: { kind: "disconnected" as const } };
    expect(() => renderToString(() => <IntegrationPicker label="Integrations" integrations={[item, item]} />)).toThrow("Integration IDs must be nonempty and unique");
    expect(() => renderToString(() => <IntegrationPicker label="Integrations" integrations={[{ ...item, connection: { kind: "failed", message: "" } }]} />)).toThrow("Integration connection state requires a message");
    const html = renderToString(() => <IntegrationPicker label="Integrations" integrations={[item]} />);
    expect(html).toContain("1 integration");
    expect(html).not.toContain("<dialog");
  });
  it("bounds notification stacks and rejects unsafe inbox links", () => {
    const notice = { id: "one", title: "First" };
    expect(() => renderToString(() => <NotificationStack label="Notices" notices={[notice, notice]} />)).toThrow("Notification IDs must be nonempty and unique");
    expect(() => renderToString(() => <NotificationStack label="Notices" notices={[]} total={1} />)).toThrow("An inbox link is required");
    expect(() => renderToString(() => <NotificationStack label="Notices" notices={[]} inbox={{ href: "javascript:alert(1)", label: "Inbox" }} />)).toThrow("Invalid notification inbox URL");
    const html = renderToString(() => <NotificationStack label="Notices" notices={[notice, { id: "two", title: "Second" }]} />);
    expect(html).toContain("First");
    expect(html).not.toContain("Second");
  });
  it("renders profile account information and rejects unsafe action links", () => {
    const html = renderToString(() => <ProfileMenu label="Account" account={{ name: "Ada" }} items={[{ id: "settings", label: "Settings", href: "/account" }]} progress={{ label: "Setup", value: 0 }} />);
    expect(html).toContain("Ada");
    expect(html).toContain('href="/account"');
    expect(html).toContain('value="0"');
    expect(() => renderToString(() => <ProfileMenu label="Account" account={{ name: "Ada" }} items={[{ id: "bad", label: "Bad", href: "javascript:alert(1)" }]} />)).toThrow("Invalid action menu URL");
  });
  it("validates tab and radio identities and preserves native semantics", () => {
    const tab = { id: "one", label: "One", content: "Content" };
    const option = { id: "one", label: "One" };
    expect(() => renderToString(() => <Tabs label="Sections" value="one" tabs={[tab, tab]} onChange={() => {}} />)).toThrow("Tab IDs must be nonempty and unique");
    expect(() => renderToString(() => <RadioGroup label="Choice" name="choice" value="one" options={[option, option]} onChange={() => {}} />)).toThrow("Radio option IDs must be nonempty and unique");
    const html = renderToString(() => <RadioGroup label="Choice" name="choice" value="one" options={[option]} required onChange={() => {}} />);
    expect(html).toContain('type="radio"');
    expect(html).toContain('name="choice"');
    expect(html).toContain("required");
  });
  it("validates native select options and renders native form markup", () => {
    const option = { value: "one", label: "One" };
    expect(() => renderToString(() => <NativeSelect id="choice" label="Choice" options={[option, option]} />)).toThrow("Select option values must be nonempty and unique");
    expect(() => renderToString(() => <NativeSelect id="choice" label="Choice" options={[option]} value="missing" onValueChange={() => {}} />)).toThrow("Select value is not in the options");
    expect(() => renderToString(() => <NativeSelect id="choice" label="Choice" options={[option]} value="" onValueChange={() => {}} />)).toThrow("An empty select value requires a placeholder");
    const html = renderToString(() => <NativeSelect id="choice" label="Choice" name="choice" options={[option]} required />);
    expect(html).toContain("<select");
    expect(html).toContain('name="choice"');
    expect(html).toContain("required");
  });
  it("bounds enhanced select options and renders a native validation control", () => {
    const options = Array.from({ length: 101 }, (_, index) => ({ value: String(index), label: String(index) }));
    expect(() => renderToString(() => <Select id="choice" label="Choice" options={options} value="0" onValueChange={() => {}} />)).toThrow("Select supports at most 100 options");
    const html = renderToString(() => <Select id="choice" label="Choice" name="choice" options={[{ value: "one", label: "One" }]} value="one" required onValueChange={() => {}} />);
    expect(html).toContain("<select");
    expect(html).toContain('name="choice"');
    expect(html).toContain("required");
  });
  it("renders native switch state and rejects empty failures", () => {
    const html = renderToString(() => <Switch id="sync" label="Sync" name="sync" checked onCheckedChange={() => {}} />);
    expect(html).toContain('role="switch"');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('name="sync"');
    expect(() => renderToString(() => <Switch id="sync" label="Sync" state={{ kind: "failed", message: "" }} />)).toThrow("Switch failure requires a message");
  });
  it("bounds tags and rejects duplicate identities and normalized labels", () => {
    const first = { id: "one", label: "First tag" };
    expect(() => renderToString(() => <TagInput id="tags" label="Tags" value={[first, { id: "two", label: "  FIRST   TAG " }]} state={{ kind: "idle" }} onAdd={() => {}} />)).toThrow("Tag IDs and normalized labels must be nonempty and unique");
    expect(() => renderToString(() => <TagInput id="tags" label="Tags" value={[first]} maxLength={3} state={{ kind: "idle" }} onAdd={() => {}} />)).toThrow("Tag label exceeds maxLength");
    expect(() => renderToString(() => <TagInput id="tags" label="Tags" value={[]} maxTags={101} state={{ kind: "idle" }} onAdd={() => {}} />)).toThrow(RangeError);
  });
  it("validates text area sizing and renders native descriptions", () => {
    expect(() => renderToString(() => <TextArea id="notes" label="Notes" autosize={{ minRows: 3, maxRows: 2 }} />)).toThrow(RangeError);
    expect(() => renderToString(() => <TextArea id="notes" label="Notes" expandRows={8} />)).toThrow(RangeError);
    const html = renderToString(() => <TextArea id="notes" label="Notes" name="notes" hint="Help" defaultValue="Draft" showCount />);
    expect(html).toContain("<textarea");
    expect(html).toContain('name="notes"');
    expect(html).toContain("Draft");
    expect(html).toContain("Help");
  });
  it("renders a retry only when the failed action provides one", () => {
    const withoutRetry = renderToString(() => <ActionStatus state={{ kind: "failed", message: "Save failed" }} />);
    const withRetry = renderToString(() => <ActionStatus state={{ kind: "failed", message: "Save failed", retry: () => {} }} />);
    expect(withoutRetry).toContain('role="alert"');
    expect(withoutRetry).not.toContain("<button");
    expect(withRetry).toContain("Retry");
  });
  it("rejects duplicate action menu identities", () => {
    expect(() => renderToString(() => <ActionMenu label="Actions" items={[{ id: "same", label: "First" }, { id: "same", label: "Second" }]} onSelect={() => {}} />)).toThrow("Duplicate action menu item ID: same");
  });
  it("rejects duplicate accordion identities", () => {
    expect(() => renderToString(() => <Accordion id="settings" items={[{ id: "same", label: "First", children: "One" }, { id: "same", label: "Second", children: "Two" }]} />)).toThrow("Duplicate accordion item ID: same");
  });
  it("renders local and controlled disclosures in their initial state", () => {
    const html = renderToString(() => <><Disclosure label="Open" defaultOpen>Body</Disclosure><Disclosure label="Closed" open={false}>Hidden</Disclosure></>);
    expect(html).toMatch(/<details[^>]*open[^>]*>.*Open/su);
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain("Hidden");
  });
  it("renders named progress and rejects invalid values", () => {
    const html = renderToString(() => <Progress label="Upload" value={0} max={10} />);
    expect(html).toContain("Upload");
    expect(html).toContain('value="0"');
    expect(html).toContain('max="10"');
    expect(() => renderToString(() => <Progress label="Upload" value={11} max={10} />)).toThrow(RangeError);
    expect(() => renderToString(() => <Progress label="Upload" max={0} />)).toThrow(RangeError);
  });
  it("rejects duplicate and oversized combobox option sets", () => {
    const duplicate = [{ id: "same", label: "One" }, { id: "same", label: "Two" }];
    expect(() => renderToString(() => <Combobox id="choice" label="Choice" options={duplicate} value={null} onChange={() => {}} />)).toThrow("Duplicate combobox option ID: same");
    const many = Array.from({ length: 501 }, (_, index) => ({ id: String(index), label: String(index) }));
    expect(() => renderToString(() => <Combobox id="choice" label="Choice" options={many} value={null} onChange={() => {}} />)).toThrow(RangeError);
  });
  it("rejects duplicate selected IDs in a multi combobox", () => {
    expect(() => renderToString(() => <MultiCombobox id="tags" label="Tags" options={[]} value={["same", "same"]} onChange={() => {}} />)).toThrow("Duplicate selected combobox ID: same");
  });
  it("renders combobox option IDs for arbitrary UTF-16 strings", () => {
    const html = renderToString(() => <Combobox id="choice" label="Choice" options={[{ id: "\ud800", label: "Unpaired" }]} value={null} onChange={() => {}} />);
    expect(html).toContain("option-d800");
    expect(html).toContain("Unpaired");
  });
  it("renders a mixed checkbox with its native form contract", () => {
    const html = renderToString(() => <Checkbox id="all" label="Select all" name="selection" checked={false} indeterminate onCheckedChange={() => {}} />);
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('aria-checked="mixed"');
    expect(html).toContain('name="selection"');
    expect(html).toContain("Select all");
  });
  it("namespaces field descriptions across independently rendered roots", () => {
    const first = renderToString(() => <TextField id="first" label="First" hint="Help" />, { renderId: "first" });
    const second = renderToString(() => <TextField id="second" label="Second" hint="Help" />, { renderId: "second" });
    const firstId = first.match(/aria-describedby="([^"]+)"/u)?.[1];
    const secondId = second.match(/aria-describedby="([^"]+)"/u)?.[1];
    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
  });
  it("keeps generated field description IDs distinct from other input IDs", () => {
    const html = renderToString(() => <><TextField id="project" label="Project" hint="Project hint" /><TextField id="project-hint" label="Project note" hint="Note hint" /></>);
    const ids = [...html.matchAll(/\sid="([^"]+)"/gu)].map(match => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("renders a field with accessible hint, error, and native form attributes", () => {
    const html = renderToString(() => <TextField id="repository" label="Repository" hint="Use a slug" error="Already in use" name="repository" required aria-describedby="external" />);
    expect(html).toContain('for="repository"');
    expect(html).toContain('id="repository"');
    const descriptions = html.match(/aria-describedby="external ([^ ]+) ([^"]+)"/u);
    expect(descriptions).not.toBeNull();
    expect(html).toContain(`id="${descriptions?.[1]}"`);
    expect(html).toContain(`id="${descriptions?.[2]}"`);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('name="repository"');
    expect(html).toContain("required");
  });

  it("renders only ui-* classes besides the ones a consumer passes", () => {
    const html = renderToString(() => (
      <>
        <Badge tone="ok" dot>Healthy</Badge>
        <Icon name="check" />
        <Segmented label="Range" value="1h" options={[["1h", "1 Hour"]]} onChange={() => {}} />
        <Modal title="Trace" label="Trace" onBack={() => {}} onClose={() => {}}>Body</Modal>
        <CollapsiblePanel title="CPU" expandable expanded collapsible flush slotClass="app-slot">Chart</CollapsiblePanel>
        <CollapsiblePanel title="Memory" collapsible collapsed>Hidden</CollapsiblePanel>
      </>
    ));
    const foreign = classTokens(html).filter(token => !token.startsWith("ui-") && token !== "app-slot");
    expect(foreign).toEqual([]);
    expect(html).toContain("ui-panel-expanded");
    expect(html).toContain("ui-panel-collapsed");
    expect(html).toContain("ui-modal-body");
  });

  it("renders Badge with tone and dot", () => {
    const html = renderToString(() => <Badge tone="ok" dot>Healthy</Badge>);
    expect(html).toContain("ui-badge");
    expect(html).toContain("ui-badge-ok");
    expect(html).toContain("ui-badge-dot");
    expect(html).toContain("Healthy");
  });

  it("renders Button with variant and disabled", () => {
    const html = renderToString(() => <Button variant="small" disabled>Click</Button>);
    expect(html).toContain("ui-btn");
    expect(html).toContain("ui-btn-small");
    expect(html).toContain("disabled");
    expect(html).toContain("Click");
  });

  it("keeps button appearance separate from size and hides decorative icon slots", () => {
    const html = renderToString(() => <Button variant="small" appearance="primary" leadingIcon={<span>Icon</span>} name="action" value="create">Create</Button>);
    expect(html).toContain("ui-btn-small");
    expect(html).toContain("ui-button-primary");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('name="action"');
    expect(html).not.toContain('appearance="primary"');
  });
  it("renders busy buttons as labelled, disabled controls", () => {
    const html = renderToString(() => <><Button busy>Save</Button><IconButton ariaLabel="Refresh" busy>R</IconButton></>);
    expect(html.match(/aria-busy="true"/gu)).toHaveLength(2);
    expect(html.match(/disabled/gu)).toHaveLength(2);
    expect(html).toContain("Save");
    expect(html).toContain('aria-label="Refresh"');
  });

  it("forwards native button attributes and exposes meaningful icon names", () => {
    const html = renderToString(() => <>
      <Button name="action" value="save" form="editor" aria-describedby="hint">Save</Button>
      <IconButton ariaLabel="Refresh" name="action" value="refresh"><Icon name="refresh" /></IconButton>
      <Icon name="check" label="Complete" />
    </>);
    expect(html).toContain('name="action"');
    expect(html).toContain('form="editor"');
    expect(html).toContain('aria-describedby="hint"');
    expect(html).toContain('aria-label="Refresh"');
    expect(html).toContain('aria-label="Complete"');
    expect(html).toContain('role="img"');
  });

  it("renders Panel with title and meta", () => {
    const html = renderToString(() => (
      <Panel title="System Status" meta={<span>Live</span>}>
        <p>All operational</p>
      </Panel>
    ));
    expect(html).toContain("ui-panel");
    expect(html).toContain("System Status");
    expect(html).toContain("Live");
    expect(html).toContain("All operational");
  });

  it("renders Segmented with options and selection", () => {
    const html = renderToString(() => (
      <Segmented
        label="Range"
        value="1h"
        options={[["1h", "1 Hour"], ["24h", "24 Hours"]]}
        onChange={() => {}}
      />
    ));
    expect(html).toContain("ui-segmented");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("1 Hour");
    expect(html).toContain("24 Hours");
  });

  it("renders EmptyState", () => {
    const html = renderToString(() => (
      <EmptyState title="No records" detail="Try broadening your search" />
    ));
    expect(html).toContain("ui-empty-state");
    expect(html).toContain("No records");
    expect(html).toContain("Try broadening your search");
  });

  it("renders ErrorState with retry", () => {
    const html = renderToString(() => (
      <ErrorState title="Failed" detail="Network timeout" retry={() => {}} />
    ));
    expect(html).toContain("ui-error-state");
    expect(html).toContain("Failed");
    expect(html).toContain("Network timeout");
    expect(html).toContain("Retry");
  });

  it("renders Notice", () => {
    const html = renderToString(() => <Notice tone="warn">Check configuration</Notice>);
    expect(html).toContain("ui-notice");
    expect(html).toContain("ui-notice-warn");
    expect(html).toContain("Check configuration");
  });

  it("renders Skeleton with rows and chart", () => {
    const html = renderToString(() => <Skeleton rows={4} chart />);
    expect(html).toContain("ui-skeleton");
    expect(html).toContain("ui-skeleton-chart");
  });

  it("renders Pagination", () => {
    const html = renderToString(() => (
      <Pagination page={1} pages={5} from={1} to={20} total={100} onChange={() => {}} />
    ));
    expect(html).toContain("ui-pagination");
    expect(html).toContain("Showing");
    expect(html).toContain("100");
    expect(html).toContain("disabled");
  });

  it("renders Meter clamping and tones", () => {
    const html = renderToString(() => <Meter value={85} warn={70} bad={90} />);
    expect(html).toContain("ui-meter");
    expect(html).toContain("ui-meter-warn");
    expect(html).toContain("85.0%");
  });

  it("renders PageHeader", () => {
    const html = renderToString(() => (
      <PageHeader title="Overview" mark={<span>MARK</span>}>
        <button type="button">Action</button>
      </PageHeader>
    ));
    expect(html).toContain("ui-page-header");
    expect(html).toContain("Overview");
    expect(html).toContain("MARK");
    expect(html).toContain("Action");
  });

  it("renders Icon", () => {
    const html = renderToString(() => <Icon name="activity" size={20} />);
    expect(html).toContain("ui-icon");
    expect(html).toContain('width="20"');
  });

  it("renders the Shell markup contract", () => {
    const html = renderToString(() => (
      <Shell
        brand={{ href: "/runs", name: "niceforge" }}
        nav={[
          { label: "Main", items: [{ href: "/runs", label: "Runs", current: true }, { href: "/source", label: "Source" }] },
          { label: "CI", heading: true, items: [{ href: "/runners", label: "Runners" }] }
        ]}
        foot={<button type="submit">Sign out</button>}
      >
        <p>Body</p>
      </Shell>
    ));
    expect(html).toContain('class="ui-shell"');
    expect(html).toContain('class="ui-side-brand"');
    expect(html).toContain('aria-label="Main"');
    expect(html).toContain('aria-current="page"');
    expect(html.match(/aria-current/gu)).toHaveLength(1);
    expect(html).toContain('aria-labelledby="ui-side-group-1"');
    expect(html).toContain('class="ui-side-group" id="ui-side-group-1"');
    expect(html).toContain("ui-side-foot");
    expect(html).toMatch(/<main class="ui-main" id="main" tabindex="-1">.*Body/su);
  });
});
