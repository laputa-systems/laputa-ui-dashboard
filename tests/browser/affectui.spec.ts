import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

test("@F01 labels fields, associates errors, and forwards form input", async ({ page }) => {
  await page.goto("/forms.html");
  const field = page.getByRole("textbox", { name: "Repository" });
  await expect(field).toHaveAccessibleDescription("Use the repository slug Repository is unavailable");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(field).toHaveAttribute("required", "");
  await field.fill("laputa");
  await expect(page.getByTestId("calls")).toHaveText("1");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByTestId("submitted")).toHaveText("laputa");
  await page.getByRole("button", { name: "Update from parent" }).click();
  await expect(field).toHaveValue("parent");
  await expect(page.getByTestId("calls")).toHaveText("1");
});

test("@F01 preserves native form reset", async ({ page }) => {
  await page.goto("/forms.html");
  const field = page.getByRole("textbox", { name: "Nickname" });
  await field.fill("changed");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(field).toHaveValue("first");
});

test("@F01 static forms use the shipped styles and native validation", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route("**/dist/**/*.css", async route => {
    const path = new URL(route.request().url()).pathname.replace(/^\/dist\//u, "");
    if (!["styles.css", "tokens.css", "styles/forms.css"].includes(path)) throw new Error(`Unexpected stylesheet: ${path}`);
    await route.fulfill({ contentType: "text/css", body: await readFile(resolve("dist", path)) });
  });
  await page.goto("/forms-static.html");
  const field = page.getByRole("textbox", { name: "Query" });
  await expect(field).toHaveAccessibleDescription("Search repositories");
  await expect(field).toHaveCSS("font-size", "13px");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.evaluate(() => { document.body.style.zoom = "2"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "Search" }).click();
  await expect(field).toBeFocused();
  await field.fill("forge");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/search\?query=forge$/u);
  await context.close();
});
