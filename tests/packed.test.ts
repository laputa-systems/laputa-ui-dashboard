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
      const consumer = `import { Progress } from "@laputa-systems/ui-dashboard/feedback";
import { TextField } from "@laputa-systems/ui-dashboard/forms";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
if (typeof Progress !== "function" || !import.meta.resolve("@laputa-systems/ui-dashboard/feedback").endsWith("/dist/feedback.js")) throw new Error("browser feedback entry is not selected");
if (!import.meta.resolve("@laputa-systems/ui-dashboard").endsWith("/dist/index.js")) throw new Error("browser root entry is not selected");
if (typeof TextField !== "function" || !import.meta.resolve("@laputa-systems/ui-dashboard/forms").endsWith("/dist/forms.js")) throw new Error("browser forms entry is not usable");
for (const entry of ["@laputa-systems/ui-dashboard/styles.css", "@laputa-systems/ui-dashboard/tokens.css", "@laputa-systems/ui-dashboard/styles/forms.css", "@laputa-systems/ui-dashboard/styles/feedback.css"]) require.resolve(entry);
`;
      execFileSync("node", ["--conditions=browser", "--input-type=module", "-e", consumer], { cwd: tmp });
      const serverConsumer = `import { Progress } from "@laputa-systems/ui-dashboard/feedback";
import { Badge } from "@laputa-systems/ui-dashboard";
import { TextField } from "@laputa-systems/ui-dashboard/forms";
import { renderToString } from "@solidjs/web";
if (!import.meta.resolve("@laputa-systems/ui-dashboard/forms").endsWith("/dist/ssr/forms.js")) throw new Error("server forms entry is not selected");
if (!import.meta.resolve("@laputa-systems/ui-dashboard").endsWith("/dist/ssr/index.js")) throw new Error("server root entry is not selected");
if (!import.meta.resolve("@laputa-systems/ui-dashboard/feedback").endsWith("/dist/ssr/feedback.js")) throw new Error("server feedback entry is not selected");
const progress = renderToString(() => Progress({ label: "Upload", value: 0, max: 10 }));
if (!progress.includes("Upload") || !progress.includes('value="0"')) throw new Error(progress);
const badge = renderToString(() => Badge({ children: "Ready" }));
if (!badge.includes("ui-badge") || !badge.includes("Ready")) throw new Error(badge);
const html = renderToString(() => TextField({ id: "name", label: "Name", hint: "Enter a name" }));
if (!html.includes('for="name"') || !html.includes('aria-describedby="name-hint"')) throw new Error(html);
`;
      execFileSync("node", ["--input-type=module", "-e", serverConsumer], { cwd: tmp, stdio: "inherit" });
      const consumerTypes = join(tmp, "consumer.ts");
      writeFileSync(consumerTypes, 'import { Progress, type ProgressProps } from "@laputa-systems/ui-dashboard/feedback";\nimport { TextField, type TextFieldProps } from "@laputa-systems/ui-dashboard/forms";\nconst progress: ProgressProps = { label: "Upload", value: 0 };\nvoid Progress; void progress;\nconst props: TextFieldProps = { id: "name", label: "Name", name: "name" };\nvoid TextField; void props;\n');
      execFileSync(join(uiDir, "node_modules/.bin/tsrs"), ["--ignoreConfig", "--noEmit", "--strict", "--skipLibCheck", "--module", "esnext", "--moduleResolution", "bundler", "--target", "es2022", "--lib", "es2022,dom", consumerTypes], { cwd: tmp, stdio: "inherit" });
      const declarations = readFileSync(join(scope, "ui-dashboard/dist/forms/index.d.ts"), "utf8");
      assert.match(declarations, /TextField/u);
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
