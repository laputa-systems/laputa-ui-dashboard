import { expect, test, type Locator, type Page } from "@playwright/test";

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
    await page.goto("/");
    await expect(page.locator(".ui-shell")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("a dark operating-system scheme still renders the light tokens", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const light = { bg: await token(page, "--ui-bg"), surface: await token(page, "--ui-surface"), text: await token(page, "--ui-text") };
  await page.emulateMedia({ colorScheme: "dark" });
  expect({ bg: await token(page, "--ui-bg"), surface: await token(page, "--ui-surface"), text: await token(page, "--ui-text") }).toEqual(light);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("light");
});

test("collapsing a panel moves none of its header controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
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
  await page.goto("/");
  const cpu = await box(page.locator("#cpu .ui-panel-collapse"));
  const memory = await box(page.locator("#memory .ui-panel-collapse"));
  expect(cpu.x + cpu.width).toBe(memory.x + memory.width);
});

test("a collapsed panel has equal space above and below its title", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.locator("#memory .ui-panel-collapse").click();
  const panel = await box(page.locator("#memory"));
  const title = await box(page.locator("#memory .ui-panel-title"));
  expect(title.y - panel.y).toBeCloseTo(panel.y + panel.height - (title.y + title.height), 3);
});

test("sidebar groups are spaced by the side gap token", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const groups = page.locator(".ui-side-nav");
  const first = await box(groups.nth(0));
  const second = await box(groups.nth(1));
  expect(second.y - (first.y + first.height)).toBeCloseTo(await pixels(page, "--ui-side-gap"), 3);
});

test("error state children are spaced by the md gap", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const icon = await box(page.locator(".ui-error-icon"));
  const content = await box(page.locator(".ui-error-content"));
  expect(content.x - (icon.x + icon.width)).toBeCloseTo(await pixels(page, "--ui-space-md"), 3);
});

test("ui-sr-only hides its text from layout without removing it", async ({ page }) => {
  await page.goto("/");
  const hidden = page.getByTestId("sr-only");
  await expect(hidden).toHaveText("hidden label");
  const size = await box(hidden);
  expect(size.width).toBeLessThanOrEqual(1);
  expect(size.height).toBeLessThanOrEqual(1);
});

test("dom ids are unique", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open modal" }).click();
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(ids.length).toBeGreaterThan(3);
  expect(new Set(ids).size).toBe(ids.length);
});
