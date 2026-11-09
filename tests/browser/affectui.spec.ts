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
    if (!["styles.css", "tokens.css", "styles/forms.css", "styles/feedback.css", "styles/layout.css"].includes(path)) throw new Error(`Unexpected stylesheet: ${path}`);
    await route.fulfill({ contentType: "text/css", body: await readFile(resolve("dist", path)) });
  });
  await page.goto("/forms-static.html");
  await page.getByText("Static first", { exact: true }).click();
  await expect(page.getByText("Static first content")).toBeVisible();
  await page.getByText("Static second", { exact: true }).click();
  await expect(page.getByText("Static first content")).toBeHidden();
  await expect(page.getByText("Static second content")).toBeVisible();
  await page.getByText("Static detail").click();
  await expect(page.getByText("Static content")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Upload" })).toHaveAttribute("value", "5");
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
  await page.goto("/forms-static.html");
  await expect(page.getByRole("alert")).toHaveText("Save failed");
  await page.getByRole("button", { name: "Retry request" }).click();
  await expect(page).toHaveURL(/\/retry\?$/u);
  await context.close();
});


test("@M06 loading placeholders respect reduced motion and expose a busy state", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("status").filter({ hasText: "Loading memory" })).toBeVisible();
  const placeholder = page.locator('[aria-busy="true"] .ui-skeleton');
  await expect(placeholder).toHaveAttribute("aria-hidden", "true");
  await expect(placeholder.locator(".ui-skeleton-line").first()).toHaveCSS("animation-name", "none");
  await expect(placeholder.locator(".ui-skeleton-chart")).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(placeholder.locator(".ui-skeleton-line").first()).toHaveCSS("animation-name", "ui-pulse");
  await context.close();
});


test("@C024-a busy buttons retain their label and prevent duplicate actions", async ({ page }) => {
  await page.goto("/forms.html");
  const save = page.getByRole("button", { name: "Save changes" });
  await expect(save).toBeEnabled();
  await save.click();
  await expect(save).toBeDisabled();
  await expect(save).toHaveAttribute("aria-busy", "true");
  await expect(page.getByTestId("actions")).toHaveText("1");
  await save.evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByTestId("actions")).toHaveText("1");
  await page.getByRole("button", { name: "Finish saving" }).click();
  await expect(save).toBeEnabled();
  await expect(save).not.toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("button", { name: "Disabled action" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Refresh" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Refresh" })).toHaveAttribute("aria-busy", "true");
});

test("@P1-progress names measured and indeterminate progress", async ({ page }) => {
  await page.goto("/progress.html");
  const progress = page.getByRole("progressbar", { name: "Upload" });
  await expect(progress).not.toHaveAttribute("value");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(progress).toHaveAttribute("value", "0");
  await expect(progress).toHaveAttribute("max", "10");
  await page.getByRole("button", { name: "Half done" }).click();
  await expect(progress).toHaveAttribute("value", "5");
  await page.getByRole("button", { name: "Unknown" }).click();
  await expect(progress).not.toHaveAttribute("value");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(progress).toHaveCSS("appearance", "none");
});

test("@P1-disclosure supports keyboard, controlled and local state", async ({ page }) => {
  await page.goto("/disclosure.html");
  const controlled = page.locator("details").filter({ hasText: "Controlled" });
  const summary = controlled.locator("summary");
  await expect(controlled).not.toHaveAttribute("open");
  await expect(page.getByRole("button", { name: "Controlled content" })).toHaveCount(0);
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(controlled).toHaveAttribute("open", "");
  await expect(page.getByRole("button", { name: "Controlled content" })).toBeVisible();
  await expect(page.getByTestId("disclosure-requests")).toHaveText("1");
  await page.getByRole("button", { name: "Parent toggle" }).click();
  await expect(controlled).not.toHaveAttribute("open");
  await expect(page.getByTestId("disclosure-requests")).toHaveText("1");
  const local = page.getByText("Local", { exact: true }).locator("..");
  await expect(local).toHaveAttribute("open", "");
  await page.getByRole("button", { name: "Change default" }).click();
  await expect(local).toHaveAttribute("open", "");
  await local.locator("summary").focus();
  await page.keyboard.press("Space");
  await expect(local).not.toHaveAttribute("open");
  await expect(page.getByTestId("local-requests")).toHaveText("1");
  const locked = page.getByText("Locked", { exact: true }).locator("..");
  await expect(locked.locator("summary")).toHaveAttribute("aria-disabled", "true");
  await locked.locator("summary").click();
  await expect(locked).not.toHaveAttribute("open");
});


test("@P1-accordion coordinates sections and keyboard navigation", async ({ page }) => {
  await page.goto("/disclosure.html");
  const first = page.getByText("First section", { exact: true });
  const second = page.getByText("Second section", { exact: true });
  const disabled = page.getByText("Unavailable section", { exact: true });
  await expect(disabled).toHaveAttribute("aria-disabled", "true");
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(first.locator("..")).toHaveAttribute("open", "");
  await expect(page.getByTestId("accordion-requests")).toHaveText("1");
  await page.keyboard.press("ArrowDown");
  await expect(second).toBeFocused();
  await page.keyboard.press("Space");
  await expect(second.locator("..")).toHaveAttribute("open", "");
  await expect(first.locator("..")).not.toHaveAttribute("open");
  await expect(page.getByTestId("accordion-requests")).toHaveText("2");
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await page.getByRole("button", { name: "Select first" }).click();
  await expect(first.locator("..")).toHaveAttribute("open", "");
  await expect(second.locator("..")).not.toHaveAttribute("open");
  await expect(page.getByTestId("accordion-requests")).toHaveText("2");
  await disabled.click();
  await expect(disabled.locator("..")).not.toHaveAttribute("open");
  await expect(page.getByTestId("accordion-requests")).toHaveText("2");
});


test("@P1-accordion initializes local state once and locks a controlled group without a handler", async ({ page }) => {
  await page.goto("/disclosure.html");
  const first = page.getByText("Local first", { exact: true });
  const second = page.getByText("Local second", { exact: true });
  await expect(first.locator("..")).toHaveAttribute("open", "");
  await page.getByRole("button", { name: "Change initial section" }).click();
  await expect(first.locator("..")).toHaveAttribute("open", "");
  await second.click();
  await expect(first.locator("..")).not.toHaveAttribute("open");
  await expect(second.locator("..")).toHaveAttribute("open", "");
  await expect(page.getByTestId("local-accordion-requests")).toHaveText("1");
  await second.click();
  await expect(second.locator("..")).not.toHaveAttribute("open");
  await expect(page.getByTestId("local-accordion-requests")).toHaveText("2");
  const locked = page.getByText("Locked section", { exact: true });
  await expect(locked).toHaveAttribute("aria-disabled", "true");
  await locked.click();
  await expect(locked.locator("..")).not.toHaveAttribute("open");
});

test("@P1-action preserves the draft and reports host-owned failure and retry", async ({ page }) => {
  await page.goto("/action.html");
  const draft = page.getByRole("textbox", { name: "Draft" });
  await draft.fill("Unsaved changes");
  await page.getByRole("button", { name: "Start save" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saving" })).toBeVisible();
  await page.getByRole("button", { name: "Reject save" }).click();
  await expect(page.getByRole("alert")).toHaveText("Save failed");
  await expect(draft).toHaveValue("Unsaved changes");
  const retry = page.getByRole("button", { name: "Retry" });
  await retry.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("retry-attempts")).toHaveText("1");
  await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
  await expect(page.locator(".ui-action-status")).toBeFocused();
  await expect(page.getByRole("status").filter({ hasText: "Saving" })).toBeVisible();
  await expect(draft).toHaveValue("Unsaved changes");
  await page.getByRole("button", { name: "Acknowledge save" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  await page.getByRole("button", { name: "Disable saving" }).click();
  await expect(page.getByText("Saving unavailable")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
});
