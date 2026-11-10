import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function custom(page: Page, testId: string, name: string): Promise<string> {
  return page.getByTestId(testId).evaluate((element, property) => getComputedStyle(element).getPropertyValue(property).trim(), name);
}

async function style(page: Page, testId: string, property: string): Promise<string> {
  return page.getByTestId(testId).evaluate((element, property) => getComputedStyle(element).getPropertyValue(property).trim(), property);
}

test("a scoped theme recomputes derived tokens and rendered soft backgrounds", async ({ page }) => {
  await page.goto("/theme.html");
  const scopedSoft = await custom(page, "scoped-soft", "--ui-accent-soft");
  expect(scopedSoft).toContain("#7a3f2b");
  expect(await custom(page, "scoped-soft", "--ui-ok")).toMatch(/#20432f|32,\s*67,\s*47/u);
  expect(await custom(page, "scoped-soft", "--ui-ok-soft")).toContain("#20432f");
  expect(await style(page, "scoped-soft", "background-color")).not.toBe(await style(page, "plain-soft", "background-color"));
  expect(await style(page, "scoped-head", "height")).toBe("48px");
  expect(await style(page, "scoped-inset", "padding-left")).toBe("24px");
});

test("a scoped theme leaves a sibling region and the page on default values", async ({ page }) => {
  await page.goto("/theme.html");
  const pageSoft = await custom(page, "page-soft", "--ui-accent-soft");
  const plainSoft = await custom(page, "plain-soft", "--ui-accent-soft");
  const scopedSoft = await custom(page, "scoped-soft", "--ui-accent-soft");
  expect(pageSoft).toContain("#2a78d6");
  expect(plainSoft).toBe(pageSoft);
  expect(scopedSoft).not.toBe(pageSoft);
  expect(await style(page, "plain-soft", "background-color")).toBe(await style(page, "page-soft", "background-color"));
  expect(await style(page, "plain-head", "height")).toBe("40px");
  expect(await style(page, "plain-inset", "padding-left")).toBe("16px");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--ui-inset").trim())).toBe("16px");
});

test("a scoped theme recolors components through the semantic status tokens", async ({ page }) => {
  await page.goto("/theme.html");
  expect(await style(page, "scoped-notice", "background-color")).not.toBe(await style(page, "plain-notice", "background-color"));
});

test("a scoped theme keeps tokens it does not set from its ancestors", async ({ page }) => {
  await page.goto("/theme.html");
  expect(await custom(page, "inner-soft", "--ui-accent")).toBe("#123456");
  expect(await custom(page, "inner-soft", "--ui-accent-soft")).toContain("#123456");
  expect(await custom(page, "inner-soft", "--ui-shadow-card")).toBe("none");
});

test("a layered app rule wins over a more specific library rule", async ({ page }) => {
  await page.goto("/theme-layered.html");
  const button = page.getByRole("button", { name: "Layered" });
  await expect(button).toHaveCSS("background-color", "rgb(1, 2, 3)");
  await expect(button).toHaveCSS("color", "rgb(28, 28, 26)");
});

test("the CSS-only fixture keeps the default token values", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route("**/dist/*.css", async route => {
    const name = new URL(route.request().url()).pathname.split("/").pop();
    if (name !== "styles.css" && name !== "tokens.css") throw new Error("Unexpected stylesheet");
    await route.fulfill({ contentType: "text/css", body: await readFile(resolve("dist", name)) });
  });
  await page.goto("/static.html");
  await expect(page.getByRole("heading", { name: "Repositories" })).toBeVisible();
  const tokens = await page.evaluate(() => {
    const value = (name: string): string => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const probe = document.createElement("div");
    probe.style.height = "var(--ui-head-height)";
    probe.style.paddingLeft = "var(--ui-inset)";
    document.body.append(probe);
    const computed = getComputedStyle(probe);
    const result = {
      bg: value("--ui-bg"),
      surface: value("--ui-surface"),
      text: value("--ui-text"),
      accentSoft: value("--ui-accent-soft"),
      head: computed.height,
      inset: computed.paddingLeft,
      scheme: computed.colorScheme
    };
    probe.remove();
    return result;
  });
  expect(tokens).toEqual({
    bg: "#fafaf9",
    surface: "#ffffff",
    text: "#1c1c1a",
    accentSoft: "color-mix(in srgb, #2a78d6 15%, transparent)",
    head: "40px",
    inset: "16px",
    scheme: "light"
  });
  await context.close();
});
