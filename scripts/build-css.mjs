import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "src");
const dist = join(root, "dist");

const media = new Map();
for (const line of readFileSync(join(source, "css/media.css"), "utf8").split("\n")) {
  if (line.trim() === "") continue;
  const match = /^@custom-media (--ui-[a-z0-9-]+) (\(.+\));$/u.exec(line);
  if (match === null) throw new Error(`css/media.css: not a custom media declaration: ${line}`);
  media.set(match[1], match[2]);
}

const parts = [];
for (const line of readFileSync(join(source, "styles.css"), "utf8").split("\n")) {
  if (line.trim() === "") continue;
  const match = /^@import "\.\/(.+)";$/u.exec(line);
  if (match === null) throw new Error(`styles.css: only @import lines are allowed: ${line}`);
  if (match[1] === "tokens.css") {
    parts.push(line);
    continue;
  }
  const css = readFileSync(join(source, match[1]), "utf8").replace(/@media \((--ui-[a-z0-9-]+)\)/gu, (_, name) => {
    const query = media.get(name);
    if (query === undefined) throw new Error(`${match[1]}: unknown custom media ${name}`);
    return `@media ${query}`;
  });
  parts.push(css.trimEnd());
}

const styles = `${parts.join("\n")}\n`;
for (const forbidden of ["/*", "@media (--", "@custom-media", "!important", "prefers-color-scheme"]) {
  if (styles.includes(forbidden)) throw new Error(`dist/styles.css contains ${forbidden}`);
}
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "styles.css"), styles);
copyFileSync(join(source, "tokens.css"), join(dist, "tokens.css"));
mkdirSync(join(dist, "styles"), { recursive: true });
copyFileSync(join(source, "css/forms.css"), join(dist, "styles/forms.css"));
