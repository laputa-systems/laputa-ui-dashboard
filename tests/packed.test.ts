import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it } from "vitest";

describe("packed artifact contract", () => {
  const uiDir = resolve(import.meta.dirname, "..");
  const distDir = resolve(uiDir, "dist");

  it("produces an npm tarball with expected manifest and distribution files", () => {
    mkdirSync(join(uiDir, ".work/tmp"), { recursive: true });
    const tmp = mkdtempSync(join(uiDir, ".work/tmp/ui-pack-"));
    try {
      const output = execFileSync("npm", ["pack", "--json", "--pack-destination", tmp], { cwd: uiDir, encoding: "utf8" });
      const jsonStart = output.indexOf("{");
      const jsonEnd = output.lastIndexOf("}") + 1;
      const data = JSON.parse(output.slice(jsonStart, jsonEnd)) as Record<string, { filename: string; files: readonly { path: string }[] }>;
      const tarballInfo = data["@laputa-systems/ui-dashboard"] ?? Object.values(data)[0];
      assert.ok(tarballInfo !== undefined, "Expected tarball info in json output");
      assert.equal(tarballInfo.filename, "laputa-systems-ui-dashboard-0.5.0.tgz");

      const paths = tarballInfo.files.map(f => f.path);
      assert.ok(paths.includes("package.json"), "Missing package.json");
      assert.ok(paths.includes("README.md"), "Missing README.md");
      assert.ok(paths.includes("dist/index.js"), "Missing dist/index.js");
      assert.ok(paths.includes("dist/index.d.ts"), "Missing dist/index.d.ts");
      assert.ok(paths.includes("dist/styles.css"), "Missing dist/styles.css");
      assert.ok(paths.includes("dist/tokens.css"), "Missing dist/tokens.css");
      assert.ok(paths.includes("dist/components/Badge.d.ts"), "Missing Badge declaration");
      assert.ok(paths.includes("dist/components/Panel.d.ts"), "Missing Panel declaration");
      assert.ok(paths.includes("dist/components/Modal.d.ts"), "Missing Modal declaration");

      assert.ok(paths.includes("dist/layout.js"), "Missing layout entry");
      assert.ok(paths.includes("dist/layout/index.d.ts"), "Missing layout declarations");
      assert.ok(paths.includes("dist/styles/layout.css"), "Missing layout stylesheet");
      assert.ok(paths.includes("dist/feedback.js"), "Missing feedback entry");
      assert.ok(paths.includes("dist/feedback/index.d.ts"), "Missing feedback declarations");
      assert.ok(paths.includes("dist/styles/feedback.css"), "Missing feedback stylesheet");
      assert.ok(paths.includes("dist/forms.js"), "Missing forms entry");
      assert.ok(paths.includes("dist/forms/index.d.ts"), "Missing forms declarations");
      assert.ok(paths.includes("dist/styles/forms.css"), "Missing forms stylesheet");
      execFileSync("tar", ["-xzf", join(tmp, tarballInfo.filename), "-C", tmp]);
      const scope = join(tmp, "node_modules/@laputa-systems");
      mkdirSync(scope, { recursive: true });
      renameSync(join(tmp, "package"), join(scope, "ui-dashboard"));
      writeFileSync(join(tmp, "package.json"), '{"name":"packed-consumer","type":"module","private":true}');
      const consumer = `import { Accordion, ActionMenu, CommandMenu, Disclosure } from "@laputa-systems/ui-dashboard/layout";
import { ActionStatus, Progress } from "@laputa-systems/ui-dashboard/feedback";
import { Checkbox, Combobox, DateRangePicker, MultiCombobox, TextField } from "@laputa-systems/ui-dashboard/forms";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
if (typeof CommandMenu !== "function") throw new Error("command menu is missing");
if (typeof ActionMenu !== "function") throw new Error("action menu is missing");
if (typeof Accordion !== "function") throw new Error("accordion is missing");
if (typeof Disclosure !== "function" || !import.meta.resolve("@laputa-systems/ui-dashboard/layout").endsWith("/dist/layout.js")) throw new Error("browser layout entry is not selected");
if (typeof ActionStatus !== "function") throw new Error("action status is missing");
if (typeof Progress !== "function" || !import.meta.resolve("@laputa-systems/ui-dashboard/feedback").endsWith("/dist/feedback.js")) throw new Error("browser feedback entry is not selected");
if (!import.meta.resolve("@laputa-systems/ui-dashboard").endsWith("/dist/index.js")) throw new Error("browser root entry is not selected");
if (typeof Combobox !== "function" || typeof MultiCombobox !== "function") throw new Error("combobox is missing");
if (typeof Checkbox !== "function") throw new Error("checkbox is missing");
if (typeof DateRangePicker !== "function") throw new Error("date range picker is missing");
if (typeof TextField !== "function" || !import.meta.resolve("@laputa-systems/ui-dashboard/forms").endsWith("/dist/forms.js")) throw new Error("browser forms entry is not usable");
for (const entry of ["@laputa-systems/ui-dashboard/styles.css", "@laputa-systems/ui-dashboard/tokens.css", "@laputa-systems/ui-dashboard/styles/forms.css", "@laputa-systems/ui-dashboard/styles/feedback.css", "@laputa-systems/ui-dashboard/styles/layout.css"]) require.resolve(entry);
`;
      execFileSync("node", ["--conditions=browser", "--input-type=module", "-e", consumer], { cwd: tmp });
      const serverConsumer = `import { Accordion, ActionMenu, CommandMenu, Disclosure } from "@laputa-systems/ui-dashboard/layout";
import { ActionStatus, Progress } from "@laputa-systems/ui-dashboard/feedback";
import { Badge } from "@laputa-systems/ui-dashboard";
import { Checkbox, Combobox, DateRangePicker, MultiCombobox, TextField } from "@laputa-systems/ui-dashboard/forms";
import { renderToString } from "@solidjs/web";
if (!import.meta.resolve("@laputa-systems/ui-dashboard/forms").endsWith("/dist/ssr/forms.js")) throw new Error("server forms entry is not selected");
if (!import.meta.resolve("@laputa-systems/ui-dashboard").endsWith("/dist/ssr/index.js")) throw new Error("server root entry is not selected");
if (!import.meta.resolve("@laputa-systems/ui-dashboard/feedback").endsWith("/dist/ssr/feedback.js")) throw new Error("server feedback entry is not selected");
if (!import.meta.resolve("@laputa-systems/ui-dashboard/layout").endsWith("/dist/ssr/layout.js")) throw new Error("server layout entry is not selected");
const actionMenu = renderToString(() => ActionMenu({ label: "Actions", items: [{ id: "open", label: "Open" }], onSelect() {} }));
if (!actionMenu.includes('role="menu"') || !actionMenu.includes("Open")) throw new Error(actionMenu);
const accordion = renderToString(() => Accordion({ id: "sections", defaultOpenId: "one", items: [{ id: "one", label: "First", children: "Body" }] }));
if (!accordion.includes('name="sections"') || !accordion.includes("First") || !accordion.includes("open")) throw new Error(accordion);
const disclosure = renderToString(() => Disclosure({ label: "Details", defaultOpen: true, children: "Contents" }));
if (!disclosure.includes("<details") || !disclosure.includes("open") || !disclosure.includes("Contents")) throw new Error(disclosure);
const status = renderToString(() => ActionStatus({ state: { kind: "failed", message: "Save failed" } }));
if (!status.includes('role="alert"') || !status.includes("Save failed")) throw new Error(status);
const commandMenu = renderToString(() => CommandMenu({ label: "Commands", groups: [], onSelect() {} }));
if (!commandMenu.includes("Commands") || commandMenu.includes("<dialog")) throw new Error(commandMenu);
const progress = renderToString(() => Progress({ label: "Upload", value: 0, max: 10 }));
if (!progress.includes("Upload") || !progress.includes('value="0"')) throw new Error(progress);
const badge = renderToString(() => Badge({ children: "Ready" }));
if (!badge.includes("ui-badge") || !badge.includes("Ready")) throw new Error(badge);
const combo = renderToString(() => Combobox({ id: "project", label: "Project", options: [{ id: "a", label: "Alpha" }], value: "a", onChange() {} }));
if (!combo.includes('role="combobox"') || !combo.includes('value="Alpha"')) throw new Error(combo);
const multi = renderToString(() => MultiCombobox({ id: "projects", label: "Projects", name: "project", options: [{ id: "a", label: "Alpha" }], value: ["a"], onChange() {} }));
if (!multi.includes("Remove Alpha") || !multi.includes('name="project"')) throw new Error(multi);
const searched = renderToString(() => Combobox({ id: "search", label: "Search", options: [], value: null, onChange() {}, search: { state: { kind: "idle" }, onSearch() { throw new Error("server initiated a search"); } } }));
if (!searched.includes('role="combobox"')) throw new Error(searched);
const checkbox = renderToString(() => Checkbox({ id: "all", label: "Select all", checked: false, indeterminate: true, onCheckedChange() {} }));
if (!checkbox.includes('aria-checked="mixed"')) throw new Error(checkbox);
const dates = renderToString(() => DateRangePicker({ label: "Dates", value: { start: "2024-02-29", end: "2024-03-01" }, onChange() {} }));
if (!dates.includes("2024-02-29") || dates.includes("<dialog")) throw new Error(dates);
const html = renderToString(() => TextField({ id: "name", label: "Name", hint: "Enter a name" }));
const description = html.match(/aria-describedby="([^"]+)"/);
if (!html.includes('for="name"') || !description || !html.includes('id="' + description[1] + '"')) throw new Error(html);
`;
      execFileSync("node", ["--input-type=module", "-e", serverConsumer], { cwd: tmp, stdio: "inherit" });
      const consumerTypes = join(tmp, "consumer.ts");
      writeFileSync(consumerTypes, 'import { Accordion, type AccordionProps, ActionMenu, type ActionMenuProps, CommandMenu, type CommandMenuProps, type CommandShortcut, type CommandSubmenu, Disclosure, type DisclosureProps } from "@laputa-systems/ui-dashboard/layout";\nimport { ActionStatus, type ActionState, Progress, type ProgressProps } from "@laputa-systems/ui-dashboard/feedback";\nimport { Checkbox, type CheckboxProps, Combobox, type ComboboxProps, DateRangePicker, type DateRangePickerProps, type DateRange, MultiCombobox, type MultiComboboxProps, type ComboboxCreateState, type ComboboxSearchState, TextField, type TextFieldProps } from "@laputa-systems/ui-dashboard/forms";\nconst menu: ActionMenuProps = { label: "Actions", items: [{ id: "open", label: "Open" }], onSelect() {} };\nvoid ActionMenu; void menu;\nconst commands: CommandMenuProps = { label: "Commands", groups: [{ id: "a", label: "Actions", commands: [{ id: "open", label: "Open" }] }], onSelect() {} };\nvoid CommandMenu; void commands;\nconst shortcut: CommandShortcut = { key: "k", modifier: "Control" };\nvoid shortcut;\nconst submenu: CommandSubmenu = { kind: "submenu", id: "integrations", label: "Integrations", commands: [{ id: "connect", label: "Connect" }] };\nvoid submenu;\nconst accordion: AccordionProps = { id: "sections", items: [{ id: "one", label: "First", children: "Body" }] };\nvoid Accordion; void accordion;\nconst disclosure: DisclosureProps = { label: "Details", children: "Contents" };\nvoid Disclosure; void disclosure;\nconst state: ActionState = { kind: "failed", message: "Save failed" };\nvoid ActionStatus; void state;\nconst progress: ProgressProps = { label: "Upload", value: 0 };\nvoid Progress; void progress;\nconst combo: ComboboxProps = { id: "choice", label: "Choice", options: [{ id: "a", label: "Alpha" }], value: null, onChange() {} };\nvoid Combobox; void combo;\nconst multi: MultiComboboxProps = { id: "choices", label: "Choices", options: [], value: [], onChange() {} };\nvoid MultiCombobox; void multi;\nconst creating: ComboboxCreateState = { kind: "pending", query: "new" };\nvoid creating;\nconst searching: ComboboxSearchState = { kind: "pending", request: { id: "1", query: "new" } };\nvoid searching;\nconst range: DateRange = { start: "2024-02-29", end: "2024-03-01" };\nconst dates: DateRangePickerProps = { label: "Dates", value: range, onChange() {} };\nvoid DateRangePicker; void dates;\nconst checkbox: CheckboxProps = { id: "all", label: "Select all", defaultChecked: true };\nvoid Checkbox; void checkbox;\nconst props: TextFieldProps = { id: "name", label: "Name", name: "name" };\nvoid TextField; void props;\n');
      execFileSync(join(uiDir, "node_modules/.bin/tsrs"), ["--ignoreConfig", "--noEmit", "--strict", "--skipLibCheck", "--module", "esnext", "--moduleResolution", "bundler", "--target", "es2022", "--lib", "es2022,dom", consumerTypes], { cwd: tmp, stdio: "inherit" });
      const declarations = readFileSync(join(scope, "ui-dashboard/dist/forms/index.d.ts"), "utf8");
      assert.match(declarations, /TextField/u);
      assert.match(declarations, /DateRangePicker/u);
      const baseCss = readFileSync(join(scope, "ui-dashboard/dist/styles.css"), "utf8");
      const formsCss = readFileSync(join(scope, "ui-dashboard/dist/styles/forms.css"), "utf8");
      assert.deepEqual([...baseCss.matchAll(/@import\s+"([^"]+)"/gu)].map(match => match[1]), ["./tokens.css"]);
      assert.doesNotMatch(formsCss, /@import/u);
      assert.match(formsCss, /\.ui-text-field/u);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("exports all required primitives in compiled ESM index.js", () => {
    const js = readFileSync(resolve(distDir, "index.js"), "utf8");
    const expectedExports = [
      "Badge",
      "Button",
      "IconButton",
      "Panel",
      "CollapsiblePanel",
      "Modal",
      "Segmented",
      "EmptyState",
      "ErrorState",
      "Notice",
      "Skeleton",
      "Pagination",
      "Meter",
      "PageHeader",
      "Icon",
      "Shell",
      "SideNav",
      "groupId"
    ];

    for (const name of expectedExports) {
      assert.match(js, new RegExp(`\\b${name}\\b`, "u"), `Expected export ${name} in index.js`);
    }
  });

  it("provides valid TypeScript declaration files", () => {
    const dts = readFileSync(resolve(distDir, "index.d.ts"), "utf8");
    assert.match(dts, /export \{ Badge/u);
    assert.match(dts, /export \{ Panel, CollapsiblePanel/u);
    assert.match(dts, /export \{ Modal/u);
    assert.match(dts, /export \{ Segmented/u);
    assert.match(dts, /export \{ EmptyState/u);
    assert.match(dts, /export \{ ErrorState/u);
    assert.match(dts, /export \{ Notice/u);
    assert.match(dts, /export \{ Skeleton/u);
    assert.match(dts, /export \{ Pagination/u);
    assert.match(dts, /export \{ Meter/u);
    assert.match(dts, /export \{ PageHeader/u);
    assert.match(dts, /export \{ Icon/u);
  });

  it("ships tokens.css with namespaced --ui-* variables", () => {
    const tokens = readFileSync(resolve(distDir, "tokens.css"), "utf8");
    assert.match(tokens, /--ui-bg:/u);
    assert.match(tokens, /--ui-surface:/u);
    assert.match(tokens, /--ui-text:/u);
    assert.match(tokens, /--ui-line:/u);
    assert.match(tokens, /--ui-accent:/u);
    assert.match(tokens, /--ui-radius-md:/u);
  });

  it("ships styles.css with namespaced .ui-* class rules", () => {
    const styles = readFileSync(resolve(distDir, "styles.css"), "utf8");
    assert.match(styles, /\.ui-btn/u);
    assert.match(styles, /\.ui-badge/u);
    assert.match(styles, /\.ui-panel/u);
    assert.match(styles, /\.ui-modal/u);
    assert.match(styles, /\.ui-segmented/u);
    assert.match(styles, /\.ui-empty-state/u);
    assert.match(styles, /\.ui-error-state/u);
    assert.match(styles, /\.ui-notice/u);
    assert.match(styles, /\.ui-skeleton/u);
    assert.match(styles, /\.ui-pagination/u);
    assert.match(styles, /\.ui-meter/u);
    assert.match(styles, /\.ui-shell/u);
    assert.match(styles, /\.ui-side-nav a\[aria-current\]/u);
  });

  it("declares one light token set and no dark scheme", () => {
    const tokens = readFileSync(resolve(distDir, "tokens.css"), "utf8");
    const styles = readFileSync(resolve(distDir, "styles.css"), "utf8");
    assert.match(tokens, /color-scheme: light;/u);
    assert.doesNotMatch(tokens + styles, /prefers-color-scheme/u);
    const names = [...tokens.matchAll(/(--ui-[\w-]+):/gu)].map(match => match[1]);
    assert.equal(new Set(names).size, names.length, "a token is defined twice");
  });

  it("ships styles.css as one file whose only import is tokens.css", () => {
    const styles = readFileSync(resolve(distDir, "styles.css"), "utf8");
    assert.deepEqual([...styles.matchAll(/@import\s+"([^"]+)"/gu)].map(match => match[1]), ["./tokens.css"]);
    assert.doesNotMatch(styles, /@custom-media|@media \(--/u);
    assert.match(styles, /\.ui-sr-only \{/u);
  });

  it("references only tokens it defines", () => {
    const tokens = readFileSync(resolve(distDir, "tokens.css"), "utf8");
    const styles = readFileSync(resolve(distDir, "styles.css"), "utf8");
    const defined = new Set([...tokens.matchAll(/(--ui-[\w-]+):/gu)].map(match => match[1]));
    const local = new Set([...styles.matchAll(/(--ui-[\w-]+):/gu)].map(match => match[1]));
    const used = new Set([...(tokens + styles).matchAll(/var\((--ui-[\w-]+)/gu)].map(match => match[1]));
    assert.deepEqual([...used].filter(name => !defined.has(name) && !local.has(name)), []);
  });

  it("declares solid-js and @solidjs/web as optional peers", () => {
    const manifest = JSON.parse(readFileSync(resolve(uiDir, "package.json"), "utf8")) as {
      peerDependenciesMeta: Record<string, { optional: boolean }>;
    };
    assert.equal(manifest.peerDependenciesMeta["solid-js"]?.optional, true);
    assert.equal(manifest.peerDependenciesMeta["@solidjs/web"]?.optional, true);
  });
});
