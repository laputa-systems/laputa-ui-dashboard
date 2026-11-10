import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const SHOTS = resolve(".work/tmp/t3-shots");

type Region = "default" | "editorial";

interface Stop {
  readonly region: Region | "other";
  readonly role: string;
  readonly name: string;
  readonly outlineWidth: number;
  readonly outlineColor: string;
}

async function open(page: Page): Promise<void> {
  await page.goto("/themes.html");
  await expect(page.getByTestId("controls-default")).toBeVisible();
  await expect(page.getByTestId("controls-editorial")).toBeVisible();
}

async function custom(locator: Locator, name: string): Promise<string> {
  return locator.evaluate((element, property) => getComputedStyle(element).getPropertyValue(property).trim(), name);
}

async function style(locator: Locator, property: string): Promise<string> {
  return locator.evaluate((element, property) => getComputedStyle(element).getPropertyValue(property).trim(), property);
}

async function token(page: Page, name: string): Promise<string> {
  return page.evaluate(property => getComputedStyle(document.documentElement).getPropertyValue(property).trim(), name);
}

function isTransparent(color: string): boolean {
  if (color === "transparent") return true;
  const alpha = /(?:rgba|hsla|color)\([^)]*?[,/]\s*([\d.]+)\s*\)$/u.exec(color);
  return alpha !== null && Number(alpha[1]) === 0;
}

function describeActive(): Stop {
  const element = document.activeElement;
  if (!(element instanceof HTMLElement)) return { region: "other", role: "none", name: "", outlineWidth: 0, outlineColor: "" };
  const region = element.closest('[data-testid="controls-default"]') !== null ? "default" : element.closest('[data-testid="controls-editorial"]') !== null ? "editorial" : "other";
  const labelledby = element.getAttribute("aria-labelledby");
  const resolved = labelledby === null ? undefined : labelledby.split(/\s+/u).map(id => document.getElementById(id)?.textContent ?? "").join(" ");
  const labels = element instanceof HTMLInputElement || element instanceof HTMLSelectElement ? element.labels?.[0]?.textContent : undefined;
  const name = (element.getAttribute("aria-label") ?? resolved ?? labels ?? element.textContent ?? "").trim().replace(/\s+/gu, " ");
  const computed = getComputedStyle(element);
  const role = element.getAttribute("role") ?? (element instanceof HTMLInputElement ? element.type : element.tagName.toLowerCase());
  return { region, role, name, outlineWidth: Number.parseFloat(computed.outlineWidth), outlineColor: computed.outlineColor };
}

async function tabStops(page: Page, key = "Tab"): Promise<{ default: Stop[]; editorial: Stop[] }> {
  await open(page);
  const stops: Stop[] = [];
  for (let step = 0; step < 200; step++) {
    await page.keyboard.press(key);
    const stop = await page.evaluate(describeActive);
    if (stop.region === "other") {
      if (stops.some(item => item.region === "editorial")) break;
      continue;
    }
    stops.push(stop);
  }
  return { default: stops.filter(stop => stop.region === "default"), editorial: stops.filter(stop => stop.region === "editorial") };
}

function traversalKey(browserName: string): string {
  return browserName === "webkit" ? "Alt+Tab" : "Tab";
}

test("both themes expose the same accessible tree for the same controls", async ({ page }) => {
  await open(page);
  const defaultTree = await page.getByTestId("controls-default").ariaSnapshot();
  const editorialTree = await page.getByTestId("controls-editorial").ariaSnapshot();
  expect(editorialTree).toBe(defaultTree);
  expect(defaultTree).toContain('button "Default action"');
  expect(defaultTree).toContain('button "More actions"');
  expect(defaultTree).toContain('region "Projects"');
  expect(defaultTree).toContain('tab "Overview"');
});

test("both themes keep the same Tab order", async ({ page, browserName }) => {
  const stops = await tabStops(page, traversalKey(browserName));
  expect(stops.default.length).toBeGreaterThanOrEqual(3);
  const names = stops.default.map(stop => stop.name);
  expect(names).toContain("Default action");
  expect(names).toContain("More actions");
  expect(names).toContain("Open dialog");
  expect(names).toContain("Query");
  expect(names).toContain("Email updates");
  expect(names).toContain("Daily");
  expect(names).toContain("Project");
  expect(names).toContain("Overview");
  expect(names).toContain("Details");
  expect(names).toContain("Projects");
  expect(names).toContain("Next page");
  expect(stops.editorial.map(stop => ({ role: stop.role, name: stop.name }))).toEqual(stops.default.map(stop => ({ role: stop.role, name: stop.name })));
});

test("arrow keys move within Tabs and RadioGroup under both themes", async ({ page }) => {
  await open(page);
  for (const region of ["controls-default", "controls-editorial"] as const) {
    const controls = page.getByTestId(region);
    const overview = controls.getByRole("tab", { name: "Overview" });
    const activity = controls.getByRole("tab", { name: "Activity" });
    await overview.click();
    await page.keyboard.press("ArrowRight");
    await expect(activity).toBeFocused();
    await expect(activity).toHaveAttribute("aria-selected", "true");
    await expect(controls.getByRole("tabpanel", { name: "Activity" })).toBeVisible();

    const daily = controls.getByRole("radio", { name: "Daily" });
    const weekly = controls.getByRole("radio", { name: "Weekly" });
    await daily.focus();
    await page.keyboard.press("ArrowDown");
    await expect(weekly).toBeFocused();
    await expect(weekly).toBeChecked();
  }
});

test("Escape closes the dialog and returns focus to its opener under both themes", async ({ page }) => {
  await open(page);
  for (const region of ["controls-default", "controls-editorial"] as const) {
    const trigger = page.getByTestId(region).getByRole("button", { name: "Open dialog" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Details" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});

test("focused controls keep a visible focus indicator under both themes", async ({ page, browserName }) => {
  const stops = await tabStops(page, traversalKey(browserName));
  for (const region of ["default", "editorial"] as const) {
    expect(stops[region].length).toBeGreaterThanOrEqual(3);
    expect(stops[region].map(stop => stop.name)).toContain("Default action");
    expect(stops[region].map(stop => stop.name)).toContain("More actions");
    for (const stop of stops[region]) {
      expect(stop.outlineWidth, `${region} ${stop.role} ${stop.name}`).toBeGreaterThan(0);
      expect(isTransparent(stop.outlineColor), `${region} ${stop.role} ${stop.name}`).toBe(false);
    }
  }
});

test("forced colors keep the focus indicator under both themes", async ({ page, browserName }) => {
  await page.emulateMedia({ forcedColors: "active" });
  const stops = await tabStops(page, traversalKey(browserName));
  for (const region of ["default", "editorial"] as const) {
    expect(stops[region].length).toBeGreaterThanOrEqual(3);
    expect(stops[region].map(stop => stop.name)).toContain("Default action");
    expect(stops[region].map(stop => stop.name)).toContain("More actions");
    for (const stop of stops[region]) {
      expect(stop.outlineWidth, `${region} ${stop.role} ${stop.name}`).toBeGreaterThan(0);
      expect(isTransparent(stop.outlineColor), `${region} ${stop.role} ${stop.name}`).toBe(false);
    }
  }
});

test("640px at deviceScaleFactor 2 does not overflow horizontally", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 640, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await context.close();
});

test("the editorial tokens differ while the default region keeps the plain defaults", async ({ page }) => {
  await open(page);
  const defaultRegion = page.getByTestId("region-default");
  const editorialRegion = page.getByTestId("region-editorial");
  const root = {
    bg: await token(page, "--ui-bg"),
    surface: await token(page, "--ui-surface"),
    text: await token(page, "--ui-text"),
    muted: await token(page, "--ui-muted"),
    lineStrong: await token(page, "--ui-line-strong"),
    hover: await token(page, "--ui-hover"),
    accent: await token(page, "--ui-accent"),
    accentSoft: await token(page, "--ui-accent-soft")
  };
  const plain = {
    bg: await custom(defaultRegion, "--ui-bg"),
    surface: await custom(defaultRegion, "--ui-surface"),
    text: await custom(defaultRegion, "--ui-text"),
    muted: await custom(defaultRegion, "--ui-muted"),
    lineStrong: await custom(defaultRegion, "--ui-line-strong"),
    hover: await custom(defaultRegion, "--ui-hover"),
    accent: await custom(defaultRegion, "--ui-accent"),
    accentSoft: await custom(defaultRegion, "--ui-accent-soft")
  };
  expect(plain).toEqual(root);
  expect(plain).toEqual({
    bg: "#fafaf9",
    surface: "#ffffff",
    text: "#1c1c1a",
    muted: "#706f6a",
    lineStrong: "#e0dfda",
    hover: "#f5f4f1",
    accent: "#2a78d6",
    accentSoft: "color-mix(in srgb, #2a78d6 15%, transparent)"
  });

  const editorial = {
    bg: await custom(editorialRegion, "--ui-bg"),
    surface: await custom(editorialRegion, "--ui-surface"),
    text: await custom(editorialRegion, "--ui-text"),
    muted: await custom(editorialRegion, "--ui-muted"),
    lineStrong: await custom(editorialRegion, "--ui-line-strong"),
    hover: await custom(editorialRegion, "--ui-hover"),
    accent: await custom(editorialRegion, "--ui-accent"),
    accentSoft: await custom(editorialRegion, "--ui-accent-soft")
  };
  expect(editorial).toEqual({
    bg: "#f8f7f3",
    surface: "#fcfbf8",
    text: "#1f1d19",
    muted: "#6f6b62",
    lineStrong: "#ddd8cd",
    hover: "#ece9e1",
    accent: "#2c4d6e",
    accentSoft: "color-mix(in srgb, #2c4d6e 15%, transparent)"
  });
  expect(await style(defaultRegion, "background-color")).toBe("rgb(250, 250, 249)");
  expect(await style(editorialRegion, "background-color")).toBe("rgb(248, 247, 243)");
  expect(await style(defaultRegion.locator(".fixture-region-title"), "font-family")).not.toContain("Georgia");
  expect(await style(editorialRegion.locator(".fixture-region-title"), "font-family")).toContain("Georgia");
});

test("icon buttons use the theme font", async ({ page }) => {
  await open(page);
  const defaultRegion = page.getByTestId("controls-default");
  const editorialRegion = page.getByTestId("controls-editorial");
  const defaultIcon = defaultRegion.getByRole("button", { name: "More actions" });
  const editorialIcon = editorialRegion.getByRole("button", { name: "More actions" });
  const defaultButton = defaultRegion.getByRole("button", { name: "Default action" });
  const editorialButton = editorialRegion.getByRole("button", { name: "Default action" });
  expect(await style(defaultIcon, "font-family")).toBe(await style(defaultButton, "font-family"));
  expect(await style(editorialIcon, "font-family")).toBe(await style(editorialButton, "font-family"));
  expect(await style(defaultIcon, "font-family")).toContain("Inter");
  expect(await style(editorialIcon, "font-family")).not.toBe(await style(defaultIcon, "font-family"));
});

test("the CSS-only fixture renders both themes without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 640, height: 900 } });
  const page = await context.newPage();
  await page.goto("/themes-static.html");
  const plain = page.getByTestId("static-default");
  const editorial = page.getByTestId("static-editorial");
  await expect(plain).toBeVisible();
  await expect(editorial).toBeVisible();
  expect(await custom(plain, "--ui-bg")).toBe("#fafaf9");
  expect(await custom(plain, "--ui-accent")).toBe("#2a78d6");
  expect(await custom(editorial, "--ui-bg")).toBe("#f8f7f3");
  expect(await custom(editorial, "--ui-accent")).toBe("#2c4d6e");
  expect(await style(editorial.locator(".fixture-region-title"), "font-family")).toContain("Georgia");
  expect(await style(editorial.locator(".ui-icon-btn"), "font-family")).toBe(await style(editorial.locator(".ui-btn").first(), "font-family"));
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await context.close();
});

test("saves desktop and mobile screenshots of both themes", async ({ page }) => {
  await mkdir(SHOTS, { recursive: true });
  for (const size of [{ width: 1440, height: 1000, name: "1440" }, { width: 390, height: 900, name: "390" }] as const) {
    await page.setViewportSize({ width: size.width, height: size.height });
    await open(page);
    await page.getByTestId("region-default").screenshot({ path: resolve(SHOTS, `default-${size.name}.png`) });
    await page.getByTestId("region-editorial").screenshot({ path: resolve(SHOTS, `editorial-${size.name}.png`) });
    await page.screenshot({ path: resolve(SHOTS, `themes-${size.name}.png`), fullPage: true });
  }
});
