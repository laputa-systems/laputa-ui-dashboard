import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const repoRoot = resolve(import.meta.dirname, "../..");

function normalizeButtonMarkup(markup: string): string {
  const match = markup.match(/^<button\b([^>]*)>([\s\S]*)<\/button>$/u);
  if (match === null) return markup;
  const attrs = [...(match[1] ?? "").matchAll(/([^\s=]+)(?:=("[^"]*"|\S+))?/gu)]
    .filter(([, name]) => name !== "_hk")
    .map(([, name, raw]) => {
      let value = raw?.startsWith('"') === true ? raw.slice(1, -1) : raw;
      if (name === "style" && value !== undefined) value = value.replace(/\s*:\s*/gu, ":").replace(/;\s*$/u, "");
      if (name === "disabled" && (value === undefined || value === "")) return "disabled";
      return value === undefined ? name : `${name}="${value}"`;
    })
    .sort();
  const inner = (match[2] ?? "").replace(/\s_hk=(?:"[^"]*"|\S+)/gu, "").replace(/\s+/gu, " ").trim();
  return `<button ${attrs.join(" ")}>${inner}</button>`;
}

test("forwards native attributes and handlers reactively and removes absent attributes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/button/button.html");
  const target = page.getByTestId("target");
  await expect(target).toHaveAttribute("title", "ready");
  await expect(target).toHaveAttribute("aria-describedby", "hint");
  await expect(target).toHaveAttribute("aria-label", "native label");
  await expect(target).toHaveAttribute("type", "button");
  await expect(target).not.toHaveAttribute("aria-busy");
  await expect(target).toBeEnabled();
  await expect(page.getByTestId("leading")).toBeVisible();
  await expect(page.getByTestId("trailing")).toBeVisible();

  await target.click();
  await expect(page.getByTestId("a")).toHaveText("1");
  await expect(page.getByTestId("b")).toHaveText("0");

  await page.evaluate(() => (window as Window & { swapHandler?: () => void }).swapHandler?.());
  await target.click();
  await expect(page.getByTestId("a")).toHaveText("1");
  await expect(page.getByTestId("b")).toHaveText("10");

  await page.evaluate(() => (window as Window & { updateButton?: () => void }).updateButton?.());
  await expect(target).toHaveAttribute("title", "updated");
  await expect(target).toHaveAttribute("aria-describedby", "updated-hint");
  await expect(target).toHaveAttribute("aria-label", "Updated label");
  await expect(target).toHaveAttribute("aria-busy", "true");
  await expect(target).toHaveAttribute("type", "submit");
  await expect(target).toBeDisabled();

  await page.evaluate(() => (window as Window & { removeAttributes?: () => void }).removeAttributes?.());
  await expect(target).not.toHaveAttribute("title");
  await expect(target).not.toHaveAttribute("aria-describedby");

  await page.evaluate(() => (window as Window & { toggleLeading?: () => void }).toggleLeading?.());
  await expect(page.getByTestId("leading")).toHaveCount(0);
  await expect(page.getByTestId("trailing")).toBeVisible();

  const iconTarget = page.getByTestId("icon-target");
  await expect(iconTarget).toHaveAttribute("aria-label", "Refresh");
  await expect(iconTarget).toHaveAttribute("title", "icon ready");
  await iconTarget.click();
  await expect(page.getByTestId("icon-clicks")).toHaveText("1");
  await page.evaluate(() => (window as Window & { updateIcon?: () => void }).updateIcon?.());
  await expect(iconTarget).toHaveAttribute("aria-label", "Reload");
  await expect(iconTarget).toHaveAttribute("title", "icon updated");
  await expect(page.getByTestId("ref-target")).toHaveAttribute("data-ref-tag", "button");
  await expect(page.getByTestId("icon-ref-target")).toHaveAttribute("data-ref-tag", "button");
  expect(errors).toEqual([]);
});

test("keeps server markup, client markup, and the hydrated node identical", async ({ page }) => {
  const script = `import { createComponent, generateHydrationScript, renderToString } from "@solidjs/web";
import { Button } from "./dist/ssr/index.js";
const html = renderToString(() => createComponent(Button, {
  "data-testid": "target",
  title: "server title",
  form: "editor",
  name: "action",
  value: "save",
  "aria-describedby": "hint",
  style: { color: "red" },
  leadingIcon: "*",
  onClick() {},
  children: "Hydrate"
}));
process.stdout.write(generateHydrationScript() + "<!--split-->" + html);`;
  const [bootstrap, html] = execFileSync("node", ["--input-type=module", "-e", script], { encoding: "utf8", cwd: repoRoot }).split("<!--split-->");
  const serverMarkup = html?.match(/<button[\s\S]*?<\/button>/u)?.[0];
  expect(serverMarkup).toBeTruthy();

  await page.goto("/button/button-markup.html");
  const clientMarkup = await page.getByTestId("target").evaluate(element => element.outerHTML);
  expect(normalizeButtonMarkup(clientMarkup)).toBe(normalizeButtonMarkup(serverMarkup ?? ""));

  await page.route("**/button/button-hydration", route => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><html><head>${bootstrap ?? ""}</head><body><div id="root">${html ?? ""}</div><script type="module" src="/button/hydrate-button.tsx"></script></body></html>`
  }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/button/button-hydration");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "yes");
  await expect(page.locator("html")).toHaveAttribute("data-reused", "true");
  const target = page.getByTestId("target");
  await expect(target).toHaveAttribute("form", "editor");
  await expect(page.locator(".ui-btn-icon-slot")).toHaveText("*");
  expect(normalizeButtonMarkup(await target.evaluate(element => element.outerHTML))).toBe(normalizeButtonMarkup(serverMarkup ?? ""));

  await target.click();
  expect(await page.evaluate(() => (window as Window & { hydratedClicks?: number }).hydratedClicks)).toBe(1);
  await page.evaluate(() => (window as Window & { updateHydrated?: () => void }).updateHydrated?.());
  await expect(target).toHaveAttribute("title", "hydrated title");
  expect(errors).toEqual([]);
});
