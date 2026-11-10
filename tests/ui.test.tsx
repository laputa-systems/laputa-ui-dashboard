import { describe, expect, it } from "vitest";
import { renderToString } from "@solidjs/web";
import { Checkbox, Combobox, dateRangeComparison, DateRangePicker, Dropzone, MultiCombobox, TextField } from "../src/forms";
import { ActionStatus, Progress } from "../src/feedback";
import { Accordion, ActionMenu, Disclosure } from "../src/layout";
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
