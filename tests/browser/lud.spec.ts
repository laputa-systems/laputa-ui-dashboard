import { expect, test, type Locator } from "@playwright/test";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function box(locator: Locator): Promise<Box> {
  const value = await locator.boundingBox();
  if (value === null) throw new Error("element has no box");
  return value;
}

function intersects(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

test("a td under the base and data stylesheets is one token row tall", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lud-static.html");
  const cell = page.locator(".ui-data-table td.numeric").first();
  await expect(cell).toBeVisible();
  expect(await cell.evaluate(element => getComputedStyle(element).height)).toBe("44px");
  expect(await cell.evaluate(element => getComputedStyle(element).paddingTop)).toBe("0px");
  expect(await cell.evaluate(element => getComputedStyle(element).paddingBottom)).toBe("0px");
  expect(await cell.evaluate(element => getComputedStyle(element).verticalAlign)).toBe("middle");
});

for (const width of [390, 768, 1024, 1440]) {
  test(`panel title and meta do not intersect at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/lud-static.html");
    for (const panel of await page.locator(".ui-panel").all()) {
      const title = await box(panel.locator(".ui-panel-title h2"));
      const meta = await box(panel.locator(".ui-panel-meta"));
      expect(intersects(title, meta)).toBe(false);
    }
  });
}

test("panel title and meta stay on one row at 1440px", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lud-static.html");
  const title = await box(page.locator(".ui-panel-title h2").first());
  const meta = await box(page.locator(".ui-panel-meta").first());
  expect(intersects(title, meta)).toBe(false);
  expect(title.y).toBeLessThan(meta.y + meta.height);
  expect(meta.y).toBeLessThan(title.y + title.height);
});
