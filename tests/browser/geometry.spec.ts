import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const WIDTHS = [320, 390, 768, 1440] as const;

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const value = await locator.boundingBox();
  if (value === null) throw new Error("element has no box");
  return value;
}

async function token(page: Page, name: string): Promise<string> {
  return page.evaluate(property => getComputedStyle(document.documentElement).getPropertyValue(property).trim(), name);
}

async function pixels(page: Page, name: string): Promise<number> {
  return page.evaluate(property => {
    const probe = document.createElement("div");
    probe.style.width = `var(${property})`;
    document.body.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  }, name);
}

for (const width of WIDTHS) {
  test(`nothing overflows horizontally at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/geometry.html");
    await expect(page.locator(".ui-shell")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("a dark operating-system scheme still renders the light tokens", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/geometry.html");
  const light = { bg: await token(page, "--ui-bg"), surface: await token(page, "--ui-surface"), text: await token(page, "--ui-text") };
  await page.emulateMedia({ colorScheme: "dark" });
  expect({ bg: await token(page, "--ui-bg"), surface: await token(page, "--ui-surface"), text: await token(page, "--ui-text") }).toEqual(light);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("light");
});

test("collapsing a panel moves none of its header controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/geometry.html");
  const panel = page.locator("#cpu");
  const expand = panel.locator(".ui-panel-expand");
  const collapse = panel.locator(".ui-panel-collapse");
  await panel.hover();
  const before = { expand: await box(expand), collapse: await box(collapse) };
  await collapse.click();
  await expect(panel).toHaveClass(/ui-panel-collapsed/u);
  expect({ expand: (await box(expand)).x, collapse: (await box(collapse)).x }).toEqual({ expand: before.expand.x, collapse: before.collapse.x });
});

test("the rightmost header control shares one right edge across panels", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/geometry.html");
  const cpu = await box(page.locator("#cpu .ui-panel-collapse"));
  const memory = await box(page.locator("#memory .ui-panel-collapse"));
  expect(cpu.x + cpu.width).toBe(memory.x + memory.width);
});

test("a collapsed panel has equal space above and below its title", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/geometry.html");
  await page.locator("#memory .ui-panel-collapse").click();
  const panel = await box(page.locator("#memory"));
  const title = await box(page.locator("#memory .ui-panel-title"));
  expect(title.y - panel.y).toBeCloseTo(panel.y + panel.height - (title.y + title.height), 3);
});

test("sidebar groups are spaced by the side gap token", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/geometry.html");
  const groups = page.locator(".ui-side-nav");
  const first = await box(groups.nth(0));
  const second = await box(groups.nth(1));
  expect(second.y - (first.y + first.height)).toBeCloseTo(await pixels(page, "--ui-side-gap"), 3);
});

test("error state children are spaced by the md gap", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/geometry.html");
  const icon = await box(page.locator(".ui-error-icon"));
  const content = await box(page.locator(".ui-error-content"));
  expect(content.x - (icon.x + icon.width)).toBeCloseTo(await pixels(page, "--ui-space-md"), 3);
});

test("ui-sr-only hides its text from layout without removing it", async ({ page }) => {
  await page.goto("/geometry.html");
  const hidden = page.getByTestId("sr-only");
  await expect(hidden).toHaveText("hidden label");
  const size = await box(hidden);
  expect(size.width).toBeLessThanOrEqual(1);
  expect(size.height).toBeLessThanOrEqual(1);
});

test("dom ids are unique", async ({ page }) => {
  await page.goto("/geometry.html");
  await page.getByRole("button", { name: "Open modal" }).click();
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(ids.length).toBeGreaterThan(3);
  expect(new Set(ids).size).toBe(ids.length);
});

for (const width of WIDTHS) {
  test(`built CSS works without JavaScript at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.route("**/dist/*.css", async route => {
      const name = new URL(route.request().url()).pathname.split("/").pop();
      if (name !== "styles.css" && name !== "tokens.css") throw new Error("Unexpected stylesheet");
      await route.fulfill({ contentType: "text/css", body: await readFile(resolve("dist", name)) });
    });
    await page.goto("/static.html");
    await expect(page.getByRole("heading", { name: "Repositories" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(await token(page, "--ui-surface")).not.toBe("");
    const panel = page.locator(".ui-panel");
    expect(await panel.evaluate(element => getComputedStyle(element).display)).toBe("flex");
    await page.getByRole("searchbox", { name: "Search" }).focus();
    expect(await page.getByRole("searchbox").evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
    await context.close();
  });
}

test("uncontrolled panel controls toggle and Escape closes expansion", async ({ page }) => {
  await page.goto("/geometry.html");
  const panel = page.locator("#local");
  await expect(page.locator("#locked").getByRole("button", { name: "Expand Locked" })).toBeDisabled();
  await expect(page.locator("#locked").getByRole("button", { name: "Hide Locked" })).toBeDisabled();
  await panel.getByRole("button", { name: "Hide Local" }).click();
  await expect(panel.getByText("Local content")).toHaveCount(0);
  await panel.getByRole("button", { name: "Show Local" }).click();
  await expect(panel.getByText("Local content")).toBeVisible();
  await panel.getByRole("button", { name: "Expand Local" }).click();
  await expect(panel).toHaveClass(/ui-panel-expanded/u);
  await panel.getByRole("button", { name: "Panel details" }).click();
  await expect(page.getByRole("dialog", { name: "Trace" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(panel).toHaveClass(/ui-panel-expanded/u);
  await page.keyboard.press("Escape");
  await expect(panel).not.toHaveClass(/ui-panel-expanded/u);
});

test("modal names itself, closes on Escape, and restores focus", async ({ page }) => {
  await page.goto("/geometry.html");
  const trigger = page.getByRole("button", { name: "Open modal" });
  await expect(trigger).toHaveAttribute("name", "operation");
  await expect(trigger).toHaveAttribute("data-fixture", "open");
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Trace" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("keyboard focus is visible on search and buttons", async ({ page }) => {
  await page.goto("/geometry.html");
  for (const element of [page.getByRole("searchbox", { name: "Search" }), page.getByRole("button", { name: "Open modal" })]) {
    await element.focus();
    expect(await element.evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe("none");
  }
});


test("built module exports the public runtime surface", async ({ page }) => {
  await page.goto("/geometry.html");
  const modulePath = `/@fs${resolve("dist/index.js")}`;
  const names = await page.evaluate(async path => Object.keys(await import(path)).sort(), modulePath);
  expect(names).toEqual(["Badge", "Button", "CollapsiblePanel", "EmptyState", "ErrorState", "Icon", "IconButton", "Meter", "Modal", "Notice", "PageHeader", "Pagination", "Panel", "Segmented", "Shell", "SideNav", "Skeleton", "groupId"].sort());
});


test("initial local state and notifications remain predictable across repeated toggles", async ({ page }) => {
  await page.goto("/geometry.html");
  const collapsed = page.locator("#initial-collapsed");
  await expect(collapsed.getByText("Initially hidden")).toHaveCount(0);
  await page.getByRole("button", { name: "Change default" }).click();
  await expect(collapsed.getByText("Initially hidden")).toHaveCount(0);
  await expect(page.getByTestId("panel-counts")).toHaveText("0:0:0");
  for (let count = 1; count <= 4; count++) {
    await collapsed.getByRole("button", { name: count % 2 ? "Show Initially collapsed" : "Hide Initially collapsed" }).click();
    await expect(page.getByTestId("panel-counts")).toHaveText(`${count}:0:0`);
  }
  await page.getByRole("button", { name: "Mount expanded" }).click();
  const expanded = page.locator("#initial-expanded");
  await expect(expanded).toHaveClass(/ui-panel-expanded/u);
  await page.getByRole("button", { name: "Close expanded panel" }).click({ position: { x: 5, y: 5 } });
  await expect(expanded).not.toHaveClass(/ui-panel-expanded/u);
  await expect(page.getByTestId("panel-counts")).toHaveText("4:1:0");
  await expanded.getByRole("button", { name: "Expand Initially expanded" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("panel-counts")).toHaveText("4:3:0");
});

test("controlled state follows the parent and callbacks only notify", async ({ page }) => {
  await page.goto("/geometry.html");
  const panel = page.locator("#controlled");
  await panel.getByRole("button", { name: "Hide Controlled" }).click();
  await expect(panel.getByText("Controlled content")).toBeVisible();
  await expect(page.getByTestId("panel-counts")).toHaveText("0:0:1");
  await page.getByRole("button", { name: "Change controlled state" }).click();
  await expect(panel.getByText("Controlled content")).toHaveCount(0);
  await expect(page.getByTestId("panel-counts")).toHaveText("0:0:1");
  await panel.getByRole("button", { name: "Show Controlled" }).click();
  await expect(panel.getByText("Controlled content")).toHaveCount(0);
  await expect(page.getByTestId("panel-counts")).toHaveText("0:0:2");
  await page.getByRole("button", { name: "Change controlled state" }).click();
  await expect(panel.getByText("Controlled content")).toBeVisible();
});

test("modal close, Escape and backdrop each notify exactly once", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/geometry.html");
  const trigger = page.getByRole("button", { name: "Open modal" });
  await trigger.click();
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
  await expect(page.getByTestId("modal-closes")).toHaveText("1");
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("modal-closes")).toHaveText("2");
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByTestId("modal-closes")).toHaveText("3");
});
