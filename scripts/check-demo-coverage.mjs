// The tour must exercise every public component, not just name it in a checklist.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const files = ["src/index.ts", "src/forms/index.ts", "src/layout/index.ts", "src/feedback/index.ts", "src/data/index.ts", "src/recipes/index.ts"];
const jsx = ["fixture/demo/main.tsx", "fixture/demo/scenes.tsx"].map(path => readFileSync(resolve(root, path), "utf8")).join("\n");
const styles = readFileSync(resolve(root, "fixture/demo/tour.css"), "utf8");
const components = new Set();
for (const file of files) {
  const source = readFileSync(resolve(root, file), "utf8");
  for (const match of source.matchAll(/export\s*\{([^}]+)\}\s*from\s*["'][^"']+["']/gu)) {
    for (const item of match[1].split(",")) {
      const trimmed = item.trim();
      if (trimmed.startsWith("type ")) continue;
      const name = trimmed.split(/\s+as\s+/u)[0]?.trim();
      if (/^[A-Z][A-Za-z0-9]+$/u.test(name ?? "")) components.add(name);
    }
  }
}
const missing = [...components].sort().filter(name => !new RegExp(`<${name}(?:[\\s/>])`, "u").test(jsx));
for (const name of ["createToastStore", "dateRangeComparison", "groupId"]) {
  if (!jsx.includes(`${name}(`)) missing.push(name);
}
for (const name of ["ui-cite", "ui-references", "ui-figure", "ui-figure-caption", "ui-figure-credit", "ui-figure-grid", "ui-term-list", "ui-term", "ui-term-count", "ui-native-name", "ui-reading-column", "ui-theme-dark"]) {
  if (!jsx.includes(name)) missing.push(name);
}
if (!styles.includes("@media (max-width: 820px)")) missing.push("responsive layout");
if (!jsx.includes("data-theme={theme()}")) missing.push("theme switching");
if (missing.length) {
  console.error(`Demo is missing ${missing.length} public symbols/styles: ${missing.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`Demo coverage: ${components.size}/${components.size} public component exports, 3 helpers, 12 editorial/theme hooks.`);
}
