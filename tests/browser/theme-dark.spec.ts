import { expect, test, type Locator, type Page } from "@playwright/test";

interface Rgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

function parseColor(value: string): Rgba {
  const text = value.trim();
  if (text === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (text.startsWith("#")) {
    const hex = text.slice(1);
    const expanded = hex.length === 3 ? [...hex].map(character => character + character).join("") : hex;
    return {
      r: Number.parseInt(expanded.slice(0, 2), 16),
      g: Number.parseInt(expanded.slice(2, 4), 16),
      b: Number.parseInt(expanded.slice(4, 6), 16),
      a: 1
    };
  }
  const body = text.slice(text.indexOf("(") + 1, -1).replace(/^srgb\s+/u, "");
  const parts = body.split(/[\s,/]+/u).filter(part => part !== "");
  const alpha = (raw: string | undefined): number => {
    if (raw === undefined) return 1;
    return raw.endsWith("%") ? Number(raw.slice(0, -1)) / 100 : Number(raw);
  };
  if (text.startsWith("color(")) {
    const channel = (raw: string): number => raw.endsWith("%") ? (Number(raw.slice(0, -1)) * 255) / 100 : Number(raw) * 255;
    return { r: channel(parts[0]!), g: channel(parts[1]!), b: channel(parts[2]!), a: alpha(parts[3]) };
  }
  const channel = (raw: string): number => raw.endsWith("%") ? (Number(raw.slice(0, -1)) * 255) / 100 : Number(raw);
  return { r: channel(parts[0]!), g: channel(parts[1]!), b: channel(parts[2]!), a: alpha(parts[3]) };
}

function over(top: Rgba, bottom: Rgba): Rgba {
  const a = top.a + bottom.a * (1 - top.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  const blend = (front: number, back: number) => (front * top.a + back * bottom.a * (1 - top.a)) / a;
  return { r: blend(top.r, bottom.r), g: blend(top.g, bottom.g), b: blend(top.b, bottom.b), a };
}

function linear(value: number): number {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(color: Rgba): number {
  return 0.2126 * linear(color.r) + 0.7152 * linear(color.g) + 0.0722 * linear(color.b);
}

function contrast(first: Rgba, second: Rgba): number {
  const one = luminance(first);
  const two = luminance(second);
  return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
}

async function style(locator: Locator, property: string): Promise<string> {
  return locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name).trim(), property);
}

async function custom(locator: Locator, name: string): Promise<string> {
  return locator.evaluate((element, property) => getComputedStyle(element).getPropertyValue(property).trim(), name);
}

async function background(locator: Locator): Promise<Rgba> {
  const stack = await locator.evaluate(element => {
    const values: string[] = [];
    let node: Element | null = element;
    while (node !== null) {
      values.push(getComputedStyle(node).backgroundColor);
      node = node.parentElement;
    }
    values.push(getComputedStyle(document.documentElement).backgroundColor);
    return values;
  });
  let result: Rgba = { r: 255, g: 255, b: 255, a: 1 };
  for (const value of stack.reverse()) {
    const color = parseColor(value);
    if (color.a === 0) continue;
    result = over(color, result);
  }
  return result;
}

async function textColor(locator: Locator): Promise<Rgba> {
  return parseColor(await style(locator, "color"));
}

async function open(page: Page): Promise<void> {
  await page.goto("/theme-dark.html");
  await expect(page.getByTestId("region-light")).toBeVisible();
  await expect(page.getByTestId("region-dark")).toBeVisible();
}

const tokens = [
  "--ui-bg",
  "--ui-surface",
  "--ui-text",
  "--ui-text-2",
  "--ui-muted",
  "--ui-line",
  "--ui-line-strong",
  "--ui-hover",
  "--ui-accent",
  "--ui-ok",
  "--ui-warn",
  "--ui-bad",
  "--ui-scrim",
  "--ui-outline",
  "--ui-shadow-card",
  "--ui-shadow-pop",
  "--ui-shadow-modal",
  "--ui-viz-blue",
  "--ui-viz-ghost",
  "--ui-s0",
  "--ui-s1",
  "--ui-s2",
  "--ui-s3",
  "--ui-s4"
] as const;

test("the dark region meets AA contrast for text, badges, notices and filled buttons", async ({ page }) => {
  await open(page);
  const region = page.getByTestId("region-dark");
  const targets: readonly [string, Locator][] = [
    ["body text", region.locator(".fixture-body")],
    ["muted text", region.locator(".ui-pagination")],
    ["accent text", region.locator(".ui-badge-info")],
    ["ok badge", region.locator(".ui-badge-ok")],
    ["warn badge", region.locator(".ui-badge-warn")],
    ["bad badge", region.locator(".ui-badge-bad")],
    ["neutral badge", region.locator(".ui-badge-neutral")],
    ["accent badge", region.locator(".ui-badge-accent")],
    ["info notice", region.locator(".ui-notice-info")],
    ["warn notice", region.locator(".ui-notice-warn")],
    ["bad notice", region.locator(".ui-notice-bad")],
    ["ok notice", region.locator(".ui-notice-ok")],
    ["primary button", region.locator(".ui-btn.ui-button-primary").first()],
    ["danger button", region.locator(".ui-btn.ui-button-danger").first()]
  ];
  for (const [label, locator] of targets) {
    await expect(locator, label).toBeVisible();
    const color = await textColor(locator);
    const behind = await background(locator);
    expect(contrast(color, behind), `${label} ${JSON.stringify(color)} on ${JSON.stringify(behind)}`).toBeGreaterThanOrEqual(4.5);
  }
});

test("the dark region meets 3:1 for input borders, focus outlines and chart series", async ({ page }) => {
  await open(page);
  const region = page.getByTestId("region-dark");
  const surface = parseColor(await style(region.locator(".ui-panel"), "background-color"));

  const input = region.locator(".ui-text-field").first();
  await expect(input).toBeVisible();
  const border = parseColor(await style(input, "border-top-color"));
  expect(contrast(border, surface), "input border").toBeGreaterThanOrEqual(3);

  const fills = await region.locator(".ui-breakdown-bars rect").evaluateAll(nodes => nodes.map(node => getComputedStyle(node).fill));
  expect(fills.length).toBeGreaterThanOrEqual(5);
  for (const fill of fills) {
    expect(contrast(parseColor(fill), surface), `series ${fill}`).toBeGreaterThanOrEqual(3);
  }

  await region.getByRole("button", { name: "Default action" }).focus();
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return null;
    const computed = getComputedStyle(element);
    return { dark: element.closest('[data-testid="region-dark"]') !== null, width: Number.parseFloat(computed.outlineWidth), color: computed.outlineColor };
  });
  expect(focused).not.toBeNull();
  expect(focused!.dark).toBe(true);
  expect(focused!.width).toBeGreaterThan(0);
  expect(contrast(parseColor(focused!.color), surface), "focus outline").toBeGreaterThanOrEqual(3);
});

test("color-scheme is dark only inside the dark region", async ({ page }) => {
  await open(page);
  const schemes = await page.evaluate(() => ({
    root: getComputedStyle(document.documentElement).colorScheme,
    light: getComputedStyle(document.querySelector('[data-testid="region-light"]')!).colorScheme,
    dark: getComputedStyle(document.querySelector('[data-testid="region-dark"]')!).colorScheme,
    darkInput: getComputedStyle(document.querySelector('[data-testid="region-dark"] .ui-text-field')!).colorScheme
  }));
  expect(schemes).toEqual({ root: "light", light: "light", dark: "dark", darkInput: "dark" });
});

test("the light region keeps the default tokens while the dark region overrides them", async ({ page }) => {
  await open(page);
  const root = page.locator("html");
  const light = page.getByTestId("region-light");
  const dark = page.getByTestId("region-dark");
  for (const token of tokens) {
    const base = await custom(root, token);
    expect(await custom(light, token), `${token} in the light region`).toBe(base);
    expect(await custom(dark, token), `${token} in the dark region`).not.toBe(base);
  }
  expect(await custom(light, "--ui-bg")).toBe("#fafaf9");
  expect(await custom(light, "--ui-surface")).toBe("#ffffff");
  expect(await custom(light, "--ui-text")).toBe("#1c1c1a");
  expect(await style(light, "background-color")).toBe("rgb(250, 250, 249)");
  expect(await style(dark, "background-color")).toBe("rgb(18, 20, 18)");
});

test("dark dialogs use the dark surface and scrim", async ({ page }) => {
  await open(page);
  const region = page.getByTestId("region-dark");
  await region.getByRole("button", { name: "Open dialog" }).click();
  const dialog = page.getByRole("dialog", { name: "dark details" });
  await expect(dialog).toBeVisible();
  const dialogColors = await dialog.evaluate(element => ({
    background: getComputedStyle(element).backgroundColor,
    color: getComputedStyle(element).color,
    scrim: getComputedStyle(element, "::backdrop").backgroundColor
  }));
  expect(contrast(parseColor(dialogColors.color), parseColor(dialogColors.background))).toBeGreaterThanOrEqual(4.5);
  const scrim = parseColor(dialogColors.scrim);
  expect(scrim.a).toBeGreaterThanOrEqual(0.5);
  expect(contrast(scrim, { r: 255, g: 255, b: 255, a: 1 })).toBeGreaterThan(3);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  await region.getByRole("button", { name: "Open search" }).click();
  const search = page.locator(".ui-search-dialog-dialog");
  await expect(search).toBeVisible();
  const searchSurface = parseColor(await search.evaluate(element => getComputedStyle(element).backgroundColor));
  expect(searchSurface.r).toBeLessThan(60);
  expect(searchSurface.g).toBeLessThan(60);
  expect(searchSurface.b).toBeLessThan(60);
  await page.keyboard.press("Escape");
});

test("forced colors keep the dark focus indicator visible", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await open(page);
  const region = page.getByTestId("region-dark");
  await region.getByRole("button", { name: "Default action" }).focus();
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return null;
    const computed = getComputedStyle(element);
    return { dark: element.closest('[data-testid="region-dark"]') !== null, width: Number.parseFloat(computed.outlineWidth), color: computed.outlineColor };
  });
  expect(focused).not.toBeNull();
  expect(focused!.dark).toBe(true);
  expect(focused!.width).toBeGreaterThan(0);
  expect(parseColor(focused!.color).a).toBeGreaterThan(0);
});
