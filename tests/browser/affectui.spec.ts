import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

test("@C040-a edits a date-only range as a controlled draft", async ({ page }) => {
  await page.goto("/date-range.html");
  const trigger = page.getByRole("button", { name: "Reporting dates" });
  await expect(trigger).toHaveAccessibleDescription("2024-02-28 – 2024-03-01");
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Reporting dates" });
  const start = dialog.getByLabel("Start date");
  const end = dialog.getByLabel("End date");
  await expect(start).toBeFocused();
  await start.fill("2024-02-29");
  await end.fill("2024-02-28");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("End date must be on or after start date.");
  await expect(start).toHaveAccessibleDescription("End date must be on or after start date.");
  await expect(page.getByTestId("range-requests")).toHaveText("0");
  await end.fill("2024-03-02");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("range")).toHaveText("2024-02-28 / 2024-03-01");
  await trigger.click();
  await expect(start).toHaveValue("2024-02-28");
  await start.fill("2024-02-29");
  await end.fill("2024-03-02");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("range")).toHaveText("2024-02-29 / 2024-03-02");
  await expect(page.getByTestId("range-requests")).toHaveText("1");
  await page.getByRole("button", { name: "Parent update" }).click();
  await expect(page.getByTestId("range-requests")).toHaveText("1");
  await page.getByRole("button", { name: "Reject requests" }).click();
  await trigger.click();
  await start.fill("2024-03-11");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByTestId("range-requests")).toHaveText("2");
  await expect(dialog).toBeVisible();
  await expect(start).toHaveValue("2024-03-11");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await trigger.click();
  await expect(start).toHaveValue("2024-03-10");
  await start.fill("2024-01-31");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(dialog.getByRole("alert")).toContainText("between");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("@C040-a fits date inputs at narrow widths and zoom", async ({ page }) => {
  await page.goto("/date-range.html");
  await page.getByRole("button", { name: "Reporting dates" }).click();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(await page.getByRole("dialog").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.evaluate(() => { document.body.style.zoom = "2"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(await page.getByRole("dialog").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test("@C040-b presets use the supplied today and remain drafts until applied", async ({ page }) => {
  await page.goto("/date-range.html");
  await page.getByRole("button", { name: "Reporting dates" }).click();
  const dialog = page.getByRole("dialog", { name: "Reporting dates" });
  await dialog.getByRole("button", { name: "Last 7 days" }).click();
  await expect(dialog.getByLabel("Start date")).toHaveValue("2024-02-24");
  await expect(dialog.getByLabel("End date")).toHaveValue("2024-03-01");
  await expect(page.getByTestId("range-requests")).toHaveText("0");
  await dialog.getByRole("button", { name: "Last 30 days" }).click();
  await expect(dialog.getByLabel("Start date")).toHaveValue("2024-02-01");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByTestId("range")).toHaveText("2024-02-01 / 2024-03-01");
  await page.getByRole("button", { name: "Reporting dates" }).click();
  await dialog.getByRole("button", { name: "Today", exact: true }).click();
  await expect(dialog.getByLabel("Start date")).toHaveValue("2024-03-01");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByTestId("range-requests")).toHaveText("1");
  await page.getByRole("button", { name: "Limited dates" }).click();
  const limited = page.getByRole("dialog", { name: "Limited dates" });
  await expect(limited.getByRole("button", { name: "Today", exact: true })).toBeEnabled();
  await expect(limited.getByRole("button", { name: "Last 7 days" })).toBeDisabled();
  await limited.getByRole("button", { name: "Cancel" }).click();
});

test("@C040-c navigates and selects calendar dates with the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/date-range.html");
  await page.getByRole("button", { name: "Reporting dates" }).click();
  const dialog = page.getByRole("dialog", { name: "Reporting dates" });
  const february = dialog.getByRole("grid", { name: "February 2024" });
  await expect(february).toBeVisible();
  await expect(dialog.getByRole("grid", { name: "March 2024" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Previous month" })).toBeDisabled();
  await expect(february.getByRole("columnheader").first()).toHaveText("Mon");
  const leap = february.getByRole("button", { name: "Thursday, February 29, 2024" });
  await leap.focus();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("button", { name: "Friday, March 1, 2024" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog.getByLabel("Start date")).toHaveValue("2024-03-01");
  await expect(dialog.getByRole("status")).toHaveText("Choose an end date.");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(dialog.getByLabel("End date")).toHaveValue("2024-03-02");
  await expect(dialog.getByRole("status")).toHaveText("Choose a start date.");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByTestId("range")).toHaveText("2024-03-01 / 2024-03-02");
  await expect(page.getByRole("button", { name: "Reporting dates" })).toBeFocused();
});

test("@C040-c shows one calendar month in narrow space", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/date-range.html");
  await page.getByRole("button", { name: "Reporting dates" }).click();
  const dialog = page.getByRole("dialog", { name: "Reporting dates" });
  await expect(dialog.getByRole("grid")).toHaveCount(1);
  await dialog.getByRole("button", { name: "Next month" }).click();
  await expect(dialog.getByRole("grid", { name: "March 2024" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Next month" })).toBeDisabled();
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test("@C040-c localizes the calendar and clamps month navigation to leap day", async ({ page }) => {
  await page.goto("/date-range.html");
  await page.getByRole("button", { name: "French dates" }).click();
  const dialog = page.getByRole("dialog", { name: "French dates" });
  const march = dialog.getByRole("grid", { name: "mars 2024" });
  await expect(march.getByRole("columnheader").first()).toHaveText("lun.");
  await march.getByRole("button", { name: "dimanche 31 mars 2024" }).focus();
  await page.keyboard.press("PageUp");
  await expect(dialog.getByRole("button", { name: "jeudi 29 février 2024" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(dialog.getByRole("button", { name: "lundi 26 février 2024" })).toBeFocused();
});

test("@C040-d applies comparison with the range in one request", async ({ page }) => {
  await page.goto("/date-range.html");
  await page.getByRole("button", { name: "Reporting dates" }).click();
  const dialog = page.getByRole("dialog", { name: "Reporting dates" });
  await dialog.getByLabel("Compare with").selectOption("previous");
  await expect(dialog.getByText("2024-02-25 – 2024-02-27")).toBeVisible();
  await expect(page.getByTestId("comparison")).toHaveText("none");
  await dialog.getByLabel("Compare with").selectOption("year");
  await expect(dialog.getByText("2023-02-28 – 2023-03-01")).toBeVisible();
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByTestId("comparison")).toHaveText("year: 2023-02-28 / 2023-03-01");
  await expect(page.getByRole("button", { name: "Reporting dates" })).toHaveAccessibleDescription("2024-02-28 – 2024-03-01 (previous year)");
  await expect(page.getByTestId("range-requests")).toHaveText("1");
  await page.getByRole("button", { name: "Reporting dates" }).click();
  await expect(dialog.getByLabel("Compare with")).toHaveValue("year");
  await dialog.getByLabel("Compare with").selectOption("");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByTestId("comparison")).toHaveText("year: 2023-02-28 / 2023-03-01");
  await page.getByRole("button", { name: "Limited dates" }).click();
  const limited = page.getByRole("dialog", { name: "Limited dates" });
  await limited.getByLabel("Compare with").selectOption("previous");
  await limited.getByRole("button", { name: "Apply" }).click();
  await expect(limited.getByRole("alert")).toHaveText("Comparison is outside the supported date range.");
  await limited.getByRole("button", { name: "Cancel" }).click();
});

test("@C040-d retains a newer draft when an earlier request is acknowledged", async ({ page }) => {
  await page.goto("/date-range.html");
  await page.getByRole("button", { name: "Reject requests" }).click();
  await page.getByRole("button", { name: "Reporting dates" }).click();
  const dialog = page.getByRole("dialog", { name: "Reporting dates" });
  const start = dialog.getByLabel("Start date");
  await start.fill("2024-02-29");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await start.fill("2024-02-27");
  await page.getByRole("button", { name: "Accept last request", includeHidden: true }).evaluate(button => (button as HTMLButtonElement).click());
  await expect(page.getByTestId("range")).toHaveText("2024-02-29 / 2024-03-01");
  await expect(dialog).toBeVisible();
  await expect(start).toHaveValue("2024-02-27");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await page.getByRole("button", { name: "Accept last request", includeHidden: true }).evaluate(button => (button as HTMLButtonElement).click());
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Reporting dates" })).toBeFocused();
});

test("@C040-d shows pending and failed requests while preserving the draft", async ({ page }) => {
  await page.goto("/date-range.html");
  await page.getByRole("button", { name: "Track requests" }).click();
  await page.getByRole("button", { name: "Reporting dates" }).click();
  const dialog = page.getByRole("dialog", { name: "Reporting dates" });
  await dialog.getByLabel("Start date").fill("2024-02-29");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(dialog.getByText("Applying date range…")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Apply" })).toBeDisabled();
  await page.getByRole("button", { name: "Fail request", includeHidden: true }).evaluate(button => (button as HTMLButtonElement).click());
  await expect(dialog.getByRole("alert")).toHaveText("Range update failed");
  await expect(dialog.getByLabel("Start date")).toHaveValue("2024-02-29");
  await expect(dialog.getByRole("button", { name: "Apply" })).toBeEnabled();
});

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
  await page.getByLabel("Static start date").fill("2024-02-29");
  await page.getByLabel("Static end date").fill("2024-03-01");
  await page.getByRole("button", { name: "Choose dates" }).click();
  await expect(page).toHaveURL(/\/dates\?start=2024-02-29&end=2024-03-01$/u);
  await page.goto("/forms-static.html");
  await page.getByLabel("Static multiple choice").selectOption(["alpha", "gamma"]);
  await page.getByRole("button", { name: "Choose many" }).click();
  await expect(page).toHaveURL(/\/choose-many\?projects=alpha&projects=gamma$/u);
  await page.goto("/forms-static.html");
  await page.getByLabel("Static choice").selectOption("gamma");
  await page.getByRole("button", { name: "Choose", exact: true }).click();
  await expect(page).toHaveURL(/\/choose\?project=gamma$/u);
  await page.goto("/forms-static.html");
  await page.getByText("Static checkbox").click();
  await expect(page.getByRole("checkbox", { name: "Static checkbox" })).toBeChecked();
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

test("@P1-overlays dismisses the top dialog first and restores focus", async ({ page }) => {
  await page.goto("/overlays.html");
  const trigger = page.getByRole("button", { name: "Open outer" });
  await trigger.click();
  const outer = page.getByRole("dialog", { name: "Outer" });
  await expect(outer).toBeVisible();
  const innerTrigger = outer.getByRole("button", { name: "Open inner" });
  await innerTrigger.click();
  const inner = page.getByRole("dialog", { name: "Inner" });
  await expect(inner).toBeVisible();
  await inner.getByRole("textbox", { name: "Notes" }).fill("draft");
  await page.keyboard.press("Escape");
  await expect(inner).toHaveCount(0);
  await expect(outer).toBeVisible();
  await expect(innerTrigger).toBeFocused();
  await expect(page.getByTestId("overlay-counts")).toHaveText("0:1");
  await page.keyboard.press("Escape");
  await expect(outer).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("overlay-counts")).toHaveText("1:1");
});


test("@P1-overlays backdrop dismissal affects only the top dialog", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/overlays.html");
  await page.getByRole("button", { name: "Open outer" }).click();
  const outer = page.getByRole("dialog", { name: "Outer" });
  const innerTrigger = outer.getByRole("button", { name: "Open inner" });
  await innerTrigger.click();
  const inner = page.getByRole("dialog", { name: "Inner" });
  await expect(inner).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(inner).toHaveCount(0);
  await expect(outer).toBeVisible();
  await expect(innerTrigger).toBeFocused();
  await expect(page.getByTestId("overlay-counts")).toHaveText("0:1");
  await page.mouse.click(2, 2);
  await expect(outer).toHaveCount(0);
  await expect(page.getByTestId("overlay-counts")).toHaveText("1:1");
});

test("@P1-journey preserves a draft through nested review and a rejected action", async ({ page }) => {
  await page.goto("/overlays.html");
  await page.getByRole("button", { name: "Open outer" }).click();
  const outer = page.getByRole("dialog", { name: "Outer" });
  const innerTrigger = outer.getByRole("button", { name: "Open inner" });
  await innerTrigger.click();
  let inner = page.getByRole("dialog", { name: "Inner" });
  await inner.getByText("Request details", { exact: true }).click();
  const draft = inner.getByRole("textbox", { name: "Request" });
  await draft.fill("draft");
  await draft.press("ArrowLeft");
  await draft.pressSequentially("X");
  await expect(draft).toHaveValue("drafXt");
  await inner.getByRole("button", { name: "Submit request" }).click();
  await expect(inner.getByRole("alert")).toHaveText("Request rejected");
  await expect(draft).toHaveValue("drafXt");
  await inner.getByRole("button", { name: "Retry" }).click();
  await expect(inner.getByRole("status").filter({ hasText: "Retrying" })).toBeVisible();
  await expect(inner.getByTestId("journey-attempts")).toHaveText("1");
  await expect(draft).toHaveValue("drafXt");
  await page.keyboard.press("Escape");
  await expect(inner).toHaveCount(0);
  await expect(innerTrigger).toBeFocused();
  await innerTrigger.click();
  inner = page.getByRole("dialog", { name: "Inner" });
  await inner.getByText("Request details", { exact: true }).click();
  await expect(inner.getByRole("textbox", { name: "Request" })).toHaveValue("drafXt");
  await expect(inner.getByRole("status").filter({ hasText: "Retrying" })).toBeVisible();
  await inner.getByRole("button", { name: "Acknowledge" }).click();
  await expect(inner.getByRole("status").filter({ hasText: "Acknowledged" })).toBeVisible();
});


test("@P1-field-ids keep descriptions distinct from other input IDs", async ({ page }) => {
  await page.goto("/forms.html");
  await expect(page.getByRole("textbox", { name: "Project", exact: true })).toHaveAccessibleDescription("Project hint");
  await expect(page.getByRole("textbox", { name: "Project note" })).toHaveAccessibleDescription("Note hint");
  const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(ids).size).toBe(ids.length);
});


test("@P1-field-ids retain associations through server hydration", async ({ page }) => {
  const script = `import { createComponent, generateHydrationScript, renderToString } from "@solidjs/web";
import { TextField } from "./dist/ssr/forms.js";
process.stdout.write(generateHydrationScript() + "<!--split-->" + renderToString(() => [createComponent(TextField, { id: "project", label: "Project", hint: "Project hint" }), createComponent(TextField, { id: "project-hint", label: "Project note", hint: "Note hint" })]));`;
  const output = execFileSync("node", ["--input-type=module", "-e", script], { encoding: "utf8" });
  const [bootstrap, html] = output.split("<!--split-->");
  await page.route("**/field-hydration", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html><head>${bootstrap}</head><body><div id="root">${html}</div><script>window.initialField = document.getElementById("project"); document.documentElement.dataset.before = [...document.querySelectorAll("[id]")].map(element => element.id).join("|");</script><script type="module" src="/hydrate-fields.tsx"></script></body></html>` }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/field-hydration");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "yes");
  const ids = await page.locator("html").evaluate(element => ({ before: element.dataset.before, after: element.dataset.after }));
  expect(ids.after).toBe(ids.before);
  await expect(page.locator("html")).toHaveAttribute("data-reused", "true");
  expect(errors).toEqual([]);
  await expect(page.getByRole("textbox", { name: "Project", exact: true })).toHaveAccessibleDescription("Project hint");
  await expect(page.getByRole("textbox", { name: "Project note" })).toHaveAccessibleDescription("Note hint");
  await page.getByRole("textbox", { name: "Project", exact: true }).fill("changed");
  await expect(page.locator("html")).toHaveAttribute("data-edited", "changed");
});


test("@P1-focus keeps focus visible in forced colors and scroll containers", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/forms.html");
  const field = page.getByRole("textbox", { name: "Repository" });
  await field.focus();
  const fieldStyle = await field.evaluate(element => ({ outline: getComputedStyle(element).outlineStyle, outlineColor: getComputedStyle(element).outlineColor, background: getComputedStyle(element).backgroundColor }));
  expect(fieldStyle.outline).not.toBe("none");
  expect(fieldStyle.outlineColor).not.toBe(fieldStyle.background);
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(field).toHaveAccessibleDescription("Use the repository slug Repository is unavailable");
  const scroll = page.getByRole("region", { name: "Scrollable controls" });
  const first = scroll.getByRole("button", { name: "First in scroll" });
  const last = scroll.getByRole("button", { name: "Last in scroll" });
  await first.focus();
  await page.keyboard.press("Tab");
  await expect(last).toBeFocused();
  const visible = await last.evaluate(element => {
    const control = element.getBoundingClientRect();
    const container = element.closest("section")?.getBoundingClientRect();
    return container !== undefined && control.top >= container.top && control.bottom <= container.bottom && getComputedStyle(element).outlineStyle !== "none";
  });
  expect(visible).toBe(true);
});

test("@P1-menu scopes keyboard navigation and restores focus", async ({ page }) => {
  await page.goto("/menu.html");
  const trigger = page.getByRole("button", { name: "Actions" });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const open = page.getByRole("menuitem", { name: "Open" });
  const rename = page.getByRole("menuitem", { name: "Rename" });
  const remove = page.getByRole("menuitem", { name: "Remove" });
  await expect(open).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(rename).toBeFocused();
  await page.keyboard.press("End");
  await expect(remove).toBeFocused();
  await page.keyboard.press("Home");
  await expect(open).toBeFocused();
  await page.keyboard.press("r");
  await expect(rename).toBeFocused();
  await rename.dispatchEvent("keydown", { key: "r", isComposing: true, bubbles: true });
  await expect(rename).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByTestId("selection")).toHaveText("");
});

test("@P1-menu selects actions, escapes clipping, and does not steal outside focus", async ({ page }) => {
  await page.goto("/menu.html");
  const trigger = page.getByRole("button", { name: "Actions" });
  await trigger.click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const standalonePopupPosition = await page.evaluate(() => {
    const element = document.createElement("div");
    element.className = "ui-action-menu-popup";
    document.body.append(element);
    const position = getComputedStyle(element).position;
    element.remove();
    return position;
  });
  expect(standalonePopupPosition).toBe("fixed");
  const rects = await menu.evaluate(element => ({ menu: element.getBoundingClientRect().bottom, clip: element.parentElement?.getBoundingClientRect().bottom ?? 0 }));
  expect(rects.menu).toBeGreaterThan(rects.clip);
  await page.getByRole("menuitem", { name: "Rename" }).click();
  await expect(page.getByTestId("selection")).toHaveText("rename");
  await expect(trigger).toBeFocused();
  await trigger.click();
  const search = page.getByRole("textbox", { name: "Search" });
  await search.click();
  await expect(menu).not.toBeVisible();
  await expect(search).toBeFocused();
  await search.fill("r");
  await expect(search).toHaveValue("r");
  await expect(page.getByTestId("selection")).toHaveText("rename");
});


test("@P1-menu closes before its parent modal on Escape", async ({ page }) => {
  await page.goto("/overlays.html");
  await page.getByRole("button", { name: "Open outer" }).click();
  await page.getByRole("button", { name: "Open inner" }).click();
  const inner = page.getByRole("dialog", { name: "Inner" });
  const trigger = inner.getByRole("button", { name: "Inner actions" });
  await trigger.click();
  await expect(inner.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(inner.getByRole("menu")).not.toBeVisible();
  await expect(inner).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("overlay-counts")).toHaveText("0:0");
  await page.keyboard.press("Escape");
  await expect(inner).toHaveCount(0);
  await expect(page.getByTestId("overlay-counts")).toHaveText("0:1");
});


test("@P1-menu Tab leaves the menu without trapping focus", async ({ page }) => {
  await page.goto("/menu.html");
  const trigger = page.getByRole("button", { name: "Actions" });
  await trigger.click();
  await expect(page.getByRole("menuitem", { name: "Open" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("menu")).not.toBeVisible();
  await expect.poll(() => page.evaluate(() => (document.activeElement?.textContent === "Disable all" || document.activeElement?.textContent === "Toggle menu mount") || (document.activeElement as HTMLInputElement | null)?.labels?.[0]?.textContent?.includes("Next input") === true)).toBe(true);
  await trigger.click();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("menu")).not.toBeVisible();
  const previous = await page.evaluate(() => document.activeElement?.getAttribute("aria-haspopup") === "menu" || (document.activeElement as HTMLInputElement | null)?.labels?.[0]?.textContent?.includes("Search") === true);
  expect(previous).toBe(true);
});


test("@P1-menu closes safely when all actions become unavailable", async ({ page }) => {
  await page.goto("/menu.html");
  const trigger = page.getByRole("button", { name: "Actions" });
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.getByRole("button", { name: "Disable all" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("menu")).not.toBeVisible();
  await expect(trigger).toHaveAttribute("aria-disabled", "true");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).not.toBeVisible();
  await expect(page.getByTestId("selection")).toHaveText("");
});

test("@P1-menu trigger toggles an open menu closed", async ({ page }) => {
  await page.goto("/menu.html");
  const trigger = page.getByRole("button", { name: "Actions" });
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await trigger.click();
  await expect(page.getByRole("menu")).not.toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});


test("@P1-menu stays anchored when a container scrolls and fits near viewport edges", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 240 });
  await page.goto("/menu.html");
  const trigger = page.getByRole("button", { name: "Actions" });
  const clip = page.getByTestId("menu-clip");
  await trigger.click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await clip.evaluate(element => { element.scrollTop = 10; });
  await expect.poll(async () => {
    const anchor = await trigger.boundingBox();
    const popup = await menu.boundingBox();
    return anchor !== null && popup !== null && Math.abs(popup.y - (anchor.y + anchor.height + 4)) < 1;
  }).toBe(true);
  await page.keyboard.press("Escape");
  await clip.evaluate(element => { element.style.position = "fixed"; element.style.right = "4px"; element.style.bottom = "4px"; element.scrollTop = 0; });
  await trigger.click();
  const anchor = await trigger.boundingBox();
  const popup = await menu.boundingBox();
  expect(anchor).not.toBeNull();
  expect(popup).not.toBeNull();
  if (anchor === null || popup === null) throw new Error("menu geometry is missing");
  expect(popup.y).toBeLessThan(anchor.y);
  expect(popup.x + popup.width).toBeLessThanOrEqual(320);
  expect(popup.y + popup.height).toBeLessThanOrEqual(240);
});


test("@P1-menu unmounts an open popover and permits a clean remount", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/menu.html");
  const trigger = page.getByRole("button", { name: "Actions" });
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.getByRole("button", { name: "Toggle menu mount" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.evaluate(() => { window.dispatchEvent(new Event("resize")); window.dispatchEvent(new Event("scroll")); });
  await page.getByRole("button", { name: "Toggle menu mount" }).click();
  await page.getByRole("button", { name: "Actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Open" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("@P1-menu hydrates the built menu and retains its trigger", async ({ page }) => {
  const script = `import { createComponent, generateHydrationScript, renderToString } from "@solidjs/web";
import { ActionMenu } from "./dist/ssr/layout.js";
process.stdout.write(generateHydrationScript() + "<!--split-->" + renderToString(() => createComponent(ActionMenu, { label: "Actions", items: [{ id: "open", label: "Open" }], onSelect() {} })));`;
  const output = execFileSync("node", ["--input-type=module", "-e", script], { encoding: "utf8" });
  const [bootstrap, html] = output.split("<!--split-->");
  await page.route("**/menu-hydration", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html><head>${bootstrap}</head><body><div id="root">${html}</div><script>window.initialTrigger = document.querySelector('[aria-haspopup="menu"]');</script><script type="module" src="/hydrate-menu.tsx"></script></body></html>` }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/menu-hydration");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "yes");
  await expect(page.locator("html")).toHaveAttribute("data-reused", "true");
  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Open" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-selected", "open");
});


test("@C024 button appearance and decorative icons preserve size and names", async ({ page }) => {
  await page.goto("/forms.html");
  const create = page.getByRole("button", { name: "Create", exact: true });
  await expect(create).toHaveClass(/ui-btn-small/u);
  await expect(create).toHaveClass(/ui-button-primary/u);
  await expect(create).toHaveAttribute("name", "action");
  await expect(create).toHaveAttribute("value", "create");
  await expect(create.locator('[aria-hidden="true"]')).toHaveCount(2);
  const contrast = await create.evaluate(element => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("canvas is unavailable");
    const rgb = (color: string) => { context.fillStyle = color; context.fillRect(0, 0, 1, 1); return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3); };
    const luminance = (values: number[]) => values.map(value => { const channel = value / 255; return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * ([0.2126, 0.7152, 0.0722][index] ?? 0), 0);
    const style = getComputedStyle(element);
    const values = [luminance(rgb(style.color)), luminance(rgb(style.backgroundColor))].sort((a, b) => b - a);
    return ((values[0] ?? 0) + 0.05) / ((values[1] ?? 0) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await create.click();
  await expect(page.getByTestId("submitted-action")).toHaveText("create");
  await expect(page.getByRole("button", { name: "Delete" })).toHaveClass(/ui-button-danger/u);
  await expect(page.getByRole("button", { name: "Cancel" })).toHaveClass(/ui-button-ghost/u);
  await expect(page.getByRole("button", { name: "More" })).toHaveClass(/ui-button-ghost/u);
});

test("@C027 checkbox uses native validation, submission and reset", async ({ page }) => {
  await page.goto("/checkbox.html");
  const group = page.getByRole("group", { name: "Notifications" });
  const email = group.getByRole("checkbox", { name: "Email updates" });
  const daily = group.getByRole("checkbox", { name: "Daily summary" });
  await expect(email).toHaveAccessibleDescription("Receive updates by email Selection required");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAttribute("required", "");
  await expect(daily).toBeChecked();
  await page.getByRole("button", { name: "Change daily default" }).click();
  await expect(daily).toBeChecked();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(email).toBeFocused();
  await page.locator(".ui-choice-card").click({ position: { x: 2, y: 2 } });
  await expect(email).toBeChecked();
  await daily.uncheck();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByTestId("checkbox-submitted")).toHaveText("email");
  await page.getByRole("button", { name: "Reset preferences" }).click();
  await expect(email).not.toBeChecked();
  await expect(daily).toBeChecked();
});

test("@C027 mixed and controlled checkboxes notify only user requests", async ({ page }) => {
  await page.goto("/checkbox.html");
  const all = page.getByRole("checkbox", { name: "Select all" });
  await expect(all).toHaveJSProperty("indeterminate", true);
  await expect(all).toHaveAttribute("aria-checked", "mixed");
  await all.focus();
  await page.keyboard.press("Space");
  await expect(all).toBeChecked();
  await expect(all).toHaveJSProperty("indeterminate", false);
  await expect(page.getByTestId("checkbox-changes")).toHaveText("1");
  await page.getByRole("button", { name: "Reset controlled" }).click();
  await expect(all).toBeChecked();
  await expect(page.getByTestId("checkbox-changes")).toHaveText("1");
  await page.getByRole("button", { name: "Parent checkbox update" }).click();
  await expect(all).not.toBeChecked();
  await expect(page.getByTestId("checkbox-changes")).toHaveText("1");
  const refused = page.getByRole("checkbox", { name: "Refused change" });
  await refused.click();
  await expect(refused).not.toBeChecked();
  await expect(page.getByTestId("checkbox-rejected")).toHaveText("1");
  const mixedHeld = page.getByRole("checkbox", { name: "Mixed held" });
  await mixedHeld.click();
  await expect(mixedHeld).toHaveJSProperty("checked", false);
  await expect(mixedHeld).toHaveJSProperty("indeterminate", true);
  await expect(page.getByTestId("mixed-rejected")).toHaveText("1");
  await expect(page.getByRole("checkbox", { name: "Locked checkbox" })).toBeDisabled();
});


test("@C027 preserves mixed state and associations through hydration", async ({ page }) => {
  const script = `import { createComponent, generateHydrationScript, renderToString } from "@solidjs/web";
import { Checkbox } from "./dist/ssr/forms.js";
process.stdout.write(generateHydrationScript() + "<!--split-->" + renderToString(() => createComponent(Checkbox, { id: "all", label: "Select all", hint: "All records", checked: false, indeterminate: true, onCheckedChange() {} })));`;
  const output = execFileSync("node", ["--input-type=module", "-e", script], { encoding: "utf8" });
  const [bootstrap, html] = output.split("<!--split-->");
  await page.route("**/checkbox-hydration", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html><head>${bootstrap}</head><body><div id="root">${html}</div><script>window.initialCheckbox = document.getElementById("all");</script><script type="module" src="/hydrate-checkbox.tsx"></script></body></html>` }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/checkbox-hydration");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "yes");
  await expect(page.locator("html")).toHaveAttribute("data-reused", "true");
  const checkbox = page.getByRole("checkbox", { name: "Select all" });
  await expect(checkbox).toHaveAccessibleDescription("All records");
  await expect(checkbox).toHaveJSProperty("indeterminate", true);
  await checkbox.click();
  await expect(page.locator("html")).toHaveAttribute("data-requested", "true");
  await expect(checkbox).toHaveJSProperty("checked", false);
  await expect(checkbox).toHaveJSProperty("indeterminate", true);
});

test("@C030-a searches groups and selects stable IDs without losing input focus", async ({ page }) => {
  await page.goto("/combobox.html");
  const input = page.getByRole("combobox", { name: "Project" });
  await expect(input).toHaveValue("Beta");
  await expect(input).toHaveAccessibleDescription("Choose a project");
  await input.click();
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("group", { name: "Group A" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Group A" }).getByText("Group A", { exact: true })).toBeVisible();
  await expect(page.getByRole("option", { name: "Disabled" })).toHaveAttribute("aria-disabled", "true");
  await input.fill("ga");
  await expect(page.getByRole("option", { name: "Gamma" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Alpha" })).toHaveCount(0);
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true, bubbles: true });
  await expect(page.getByTestId("combobox-calls")).toHaveText("0");
  await input.press("ArrowDown");
  const active = await input.getAttribute("aria-activedescendant");
  expect(active).not.toBeNull();
  await expect(page.getByRole("option", { name: "Gamma" })).toHaveAttribute("id", active ?? "");
  await input.press("Enter");
  await expect(input).toHaveValue("Gamma");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByTestId("combobox-calls")).toHaveText("1");
  await page.getByRole("button", { name: "Submit choice" }).click();
  await expect(page.getByTestId("combobox-submitted")).toHaveText("gamma space");
  await page.getByRole("button", { name: "Remove Gamma" }).click();
  await expect(input).toHaveValue("gamma space");
  await expect(page.getByText("Selection is unavailable")).toBeVisible();
  await expect(page.getByTestId("combobox-calls")).toHaveText("1");
  await page.getByRole("button", { name: "Parent selects Alpha" }).click();
  await expect(input).toHaveValue("Alpha");
  await expect(page.getByTestId("combobox-calls")).toHaveText("1");
  await expect(page.getByRole("combobox", { name: "Locked choice" })).toBeDisabled();
});

test("@C030-a retains selection on empty searches, Escape and reset", async ({ page }) => {
  await page.goto("/combobox.html");
  const input = page.getByRole("combobox", { name: "Project" });
  await input.click();
  await input.fill("no match");
  await expect(page.getByText("No matching options")).toBeVisible();
  await input.press("Enter");
  await expect(page.getByTestId("combobox-submitted")).toHaveText("");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await input.press("Escape");
  await expect(input).toHaveValue("Beta");
  await expect(input).toBeFocused();
  await expect(page.getByTestId("combobox-calls")).toHaveText("0");
  await input.click();
  await input.fill("alp");
  await input.evaluate(element => {
    const form = (element as HTMLInputElement).form;
    form?.addEventListener("reset", event => event.preventDefault(), { once: true });
    form?.reset();
  });
  await expect(input).toHaveValue("alp");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await input.evaluate(element => (element as HTMLInputElement).form?.reset());
  await expect(input).toHaveValue("Beta");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Reset choice" }).click();
  await expect(input).toHaveValue("Beta");
  await page.getByRole("button", { name: "Clear Project" }).click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await expect(page.getByTestId("combobox-calls")).toHaveText("1");
});


test("@C030-a keeps the query when editing an open combobox", async ({ page }) => {
  await page.goto("/combobox.html");
  const input = page.getByRole("combobox", { name: "Project" });
  await input.click();
  await input.fill("alp");
  await input.click({ position: { x: 15, y: 10 } });
  await expect(input).toHaveValue("alp");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("option", { name: "Alpha" })).toBeVisible();
  await expect(page.getByTestId("combobox-calls")).toHaveText("0");
});


test("@C030-a preserves controlled state when the parent rejects a selection", async ({ page }) => {
  await page.goto("/combobox.html");
  await page.getByRole("button", { name: "Reject selections" }).click();
  const input = page.getByRole("combobox", { name: "Project" });
  await input.click();
  await page.getByRole("option", { name: "Disabled" }).dispatchEvent("click");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByTestId("combobox-calls")).toHaveText("0");
  await page.getByRole("option", { name: "Alpha" }).click();
  await expect(input).toHaveValue("Beta");
  await expect(page.getByTestId("combobox-calls")).toHaveText("1");
});

test("@C030-a supports touch selection", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/combobox.html");
  const input = page.getByRole("combobox", { name: "Project" });
  await input.tap();
  await page.getByRole("option", { name: "Gamma" }).tap();
  await expect(input).toHaveValue("Gamma");
  await expect(page.getByTestId("combobox-calls")).toHaveText("1");
  await context.close();
});


test("@C030-a ignores composition and skips disabled options", async ({ page }) => {
  await page.goto("/combobox.html");
  const input = page.getByRole("combobox", { name: "Project" });
  await input.click();
  await input.press("ArrowDown");
  await input.press("ArrowDown");
  await input.press("ArrowDown");
  await input.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Gamma" })).toHaveAttribute("id", await input.getAttribute("aria-activedescendant") ?? "");
  await input.dispatchEvent("compositionstart", { bubbles: true });
  await input.dispatchEvent("keydown", { key: "Enter", bubbles: true });
  await expect(page.getByTestId("combobox-calls")).toHaveText("0");
  await input.dispatchEvent("compositionend", { bubbles: true });
  await input.press("Enter");
  await expect(input).toHaveValue("Gamma");
  await expect(page.getByTestId("combobox-calls")).toHaveText("1");
});

test("@C030-a does not select an option during a touch or pen drag", async ({ page }) => {
  await page.goto("/combobox.html");
  const input = page.getByRole("combobox", { name: "Project" });
  await input.click();
  const option = page.getByRole("option", { name: "Gamma" });
  for (const pointerType of ["touch", "pen"]) {
    await option.dispatchEvent("pointerdown", { pointerType, pointerId: 9, clientX: 10, clientY: 10, bubbles: true });
    await option.dispatchEvent("pointermove", { pointerType, pointerId: 9, clientX: 10, clientY: 40, bubbles: true });
    await option.dispatchEvent("pointerup", { pointerType, pointerId: 9, clientX: 10, clientY: 40, bubbles: true });
    await option.dispatchEvent("click");
    await expect(page.getByTestId("combobox-calls")).toHaveText("0");
    await expect(input).toHaveAttribute("aria-expanded", "true");
  }
  await option.click();
  await expect(input).toHaveValue("Gamma");
  await expect(page.getByTestId("combobox-calls")).toHaveText("1");
});

test("@C030-a keeps an in-progress query when the parent changes selection", async ({ page }) => {
  await page.goto("/combobox.html");
  const input = page.getByRole("combobox", { name: "Project" });
  await input.click();
  await input.fill("gam");
  await page.getByRole("button", { name: "Parent selects Alpha" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(input).toHaveValue("gam");
  await expect(page.getByTestId("combobox-calls")).toHaveText("0");
  await input.press("Escape");
  await expect(input).toHaveValue("Alpha");
});

test("@C030-a closes before its parent modal on Escape", async ({ page }) => {
  await page.goto("/overlays.html");
  await page.getByRole("button", { name: "Open outer" }).click();
  await page.getByRole("button", { name: "Open inner" }).click();
  const inner = page.getByRole("dialog", { name: "Inner" });
  const input = inner.getByRole("combobox", { name: "Inner choice" });
  await input.click();
  await expect(inner.getByRole("listbox")).toBeVisible();
  await input.press("Escape");
  await expect(inner.getByRole("listbox")).not.toBeVisible();
  await expect(inner).toBeVisible();
  await expect(input).toBeFocused();
  await input.press("Escape");
  await expect(inner).toHaveCount(0);
});

test("@C030-a hydrates the combobox without replacing its input", async ({ page }) => {
  const script = `import { createComponent, generateHydrationScript, renderToString } from "@solidjs/web";
import { Combobox } from "./dist/ssr/forms.js";
process.stdout.write(generateHydrationScript() + "<!--split-->" + renderToString(() => createComponent(Combobox, { id: "project", label: "Project", options: [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }], value: "b", onChange() {} })));`;
  const output = execFileSync("node", ["--input-type=module", "-e", script], { encoding: "utf8" });
  const [bootstrap, html] = output.split("<!--split-->");
  await page.route("**/combobox-hydration", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html><head>${bootstrap}</head><body><div id="root">${html}</div><script>window.initialCombobox = document.getElementById("project");</script><script type="module" src="/hydrate-combobox.tsx"></script></body></html>` }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/combobox-hydration");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "yes");
  await expect(page.locator("html")).toHaveAttribute("data-reused", "true");
  const input = page.getByRole("combobox", { name: "Project" });
  await expect(input).toHaveValue("Beta");
  await input.click();
  await page.getByRole("option", { name: "Alpha" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-selected", "a");
  await expect(input).toHaveValue("Beta");
});

test("@C030-a Tab leaves the list after inspecting a disabled option", async ({ page }) => {
  await page.goto("/combobox.html");
  const input = page.getByRole("combobox", { name: "Project" });
  await input.click();
  const disabled = await page.getByRole("option", { name: "Disabled" }).boundingBox();
  if (disabled === null) throw new Error("disabled option is missing");
  await page.mouse.click(disabled.x + disabled.width / 2, disabled.y + disabled.height / 2);
  await expect(input).toBeFocused();
  await input.press("Tab");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("listbox", { name: "Project" })).not.toBeVisible();
});


test("@C030-a drops a removed active option without submitting the old value", async ({ page }) => {
  await page.goto("/combobox.html");
  const input = page.getByRole("combobox", { name: "Project" });
  await input.click();
  await input.fill("gam");
  await input.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-activedescendant", /.+/u);
  await page.getByRole("button", { name: "Remove Gamma" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(input).not.toHaveAttribute("aria-activedescendant");
  await input.press("Enter");
  await expect(page.getByTestId("combobox-submitted")).toHaveText("");
  await expect(page.getByTestId("combobox-calls")).toHaveText("0");
  await expect(page.getByText("No matching options")).toBeVisible();
});

test("@C030-a keeps long options within a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/combobox.html");
  await page.getByRole("combobox", { name: "Project" }).click();
  const option = page.getByRole("option", { name: /LongProjectName/u });
  await expect(option).toBeVisible();
  const fits = await option.evaluate(element => element.scrollWidth <= element.clientWidth && document.documentElement.scrollWidth <= innerWidth);
  expect(fits).toBe(true);
});

test("@C030-b adds and removes selected IDs with keyboard and form submission", async ({ page }) => {
  await page.goto("/multicombobox.html");
  const input = page.getByRole("combobox", { name: "Projects", exact: true });
  await expect(page.getByRole("button", { name: "Remove Alpha (alpha) from Projects" })).toBeVisible();
  await input.click();
  await expect(page.getByRole("option", { name: "Alpha" })).toHaveCount(0);
  await page.getByRole("option", { name: "Beta" }).click();
  await expect(page.getByRole("button", { name: "Remove Beta (beta) from Projects" })).toBeVisible();
  await expect(page.getByTestId("multi-calls")).toHaveText("1");
  await page.getByRole("button", { name: "Submit projects" }).click();
  await expect(page.getByTestId("multi-submitted")).toHaveText("alpha,beta");
  expect(await page.locator("form").evaluate(form => new FormData(form as HTMLFormElement).getAll("archived"))).toEqual([]);
  await expect(page.getByRole("status").first()).toHaveText("2 selected");
  await input.focus();
  await input.press("ArrowLeft");
  const beta = page.getByRole("button", { name: "Remove Beta (beta) from Projects" });
  await expect(beta).toBeFocused();
  await beta.press("ArrowLeft");
  await expect(page.getByRole("button", { name: "Remove Alpha (alpha) from Projects" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(beta).toBeFocused();
  await page.keyboard.press("Backspace");
  await expect(beta).toHaveCount(0);
  await expect(input).toBeFocused();
  await expect(page.getByTestId("multi-calls")).toHaveText("2");
  await page.getByRole("button", { name: "Submit projects" }).click();
  await expect(page.getByTestId("multi-submitted")).toHaveText("alpha");
});

test("@C030-b retains missing IDs and rejected changes", async ({ page }) => {
  await page.goto("/multicombobox.html");
  await page.getByRole("button", { name: "Remove Alpha option" }).click();
  await expect(page.getByRole("button", { name: "Remove unavailable alpha from Projects" })).toBeVisible();
  await page.getByRole("button", { name: "Submit projects" }).click();
  await expect(page.getByTestId("multi-submitted")).toHaveText("alpha");
  await page.getByRole("button", { name: "Reject project changes" }).click();
  await page.getByRole("button", { name: "Remove unavailable alpha from Projects" }).click();
  await expect(page.getByRole("button", { name: "Remove unavailable alpha from Projects" })).toBeVisible();
  await expect(page.getByTestId("multi-calls")).toHaveText("1");
  await page.getByRole("button", { name: "Parent changes projects" }).click();
  await expect(page.getByRole("button", { name: "Remove Gamma (gamma) from Projects" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove unavailable alpha from Projects" })).toBeVisible();
  await expect(page.getByTestId("multi-calls")).toHaveText("1");
  await page.getByRole("button", { name: "Reset projects" }).click();
  await page.getByRole("button", { name: "Submit projects" }).click();
  await expect(page.getByTestId("multi-submitted")).toHaveText("gamma,alpha");
});

test("@C030-b keeps a focused chip when the parent reorders selections", async ({ page }) => {
  await page.goto("/multicombobox.html");
  const alpha = page.getByRole("button", { name: "Remove Alpha (alpha) from Projects" });
  await alpha.focus();
  await alpha.evaluate(element => { (window as Window & { initialChip?: Element }).initialChip = element; });
  await page.getByRole("button", { name: "Parent changes projects" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(alpha).toBeFocused();
  expect(await alpha.evaluate(element => element === (window as Window & { initialChip?: Element }).initialChip)).toBe(true);
  await expect(page.getByTestId("multi-calls")).toHaveText("0");
});

test("@C030-a retains an active option node when unrelated options change", async ({ page }) => {
  await page.goto("/combobox.html");
  const input = page.getByRole("combobox", { name: "Project" });
  await input.click();
  await input.press("ArrowDown");
  const alpha = page.getByRole("option", { name: "Alpha" });
  await alpha.evaluate(element => { (window as Window & { initialOption?: Element }).initialOption = element; });
  await page.getByRole("button", { name: "Remove Gamma" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(alpha).toHaveAttribute("id", await input.getAttribute("aria-activedescendant") ?? "");
  expect(await alpha.evaluate(element => element === (window as Window & { initialOption?: Element }).initialOption)).toBe(true);
  await expect(input).toBeFocused();
});


test("@C030-b preserves a focused chip when its option label changes", async ({ page }) => {
  await page.goto("/multicombobox.html");
  const alpha = page.getByRole("button", { name: "Remove Alpha (alpha) from Projects" });
  await alpha.focus();
  await alpha.evaluate(element => { (window as Window & { initialChip?: Element }).initialChip = element; });
  await page.getByRole("button", { name: "Rename Alpha option" }).evaluate(element => (element as HTMLButtonElement).click());
  const renamed = page.getByRole("button", { name: "Remove Renamed (alpha) from Projects" });
  await expect(renamed).toBeFocused();
  expect(await renamed.evaluate(element => element === (window as Window & { initialChip?: Element }).initialChip)).toBe(true);
  await expect(page.getByTestId("multi-calls")).toHaveText("0");
  await expect(page.getByRole("combobox", { name: "Archived projects" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Remove Beta (beta) from Archived projects" })).toBeDisabled();
});


test("@C030-b preserves ordinary editing and composition shortcuts", async ({ page }) => {
  await page.goto("/multicombobox.html");
  const input = page.getByRole("combobox", { name: "Projects", exact: true });
  await input.click();
  await input.fill("gam");
  await input.press("ArrowLeft");
  await expect(input).toBeFocused();
  expect(await input.evaluate(element => (element as HTMLInputElement).selectionStart)).toBe(2);
  await input.fill("");
  await input.dispatchEvent("keydown", { key: "ArrowLeft", isComposing: true, bubbles: true });
  await expect(input).toBeFocused();
  await expect(page.getByTestId("multi-calls")).toHaveText("0");
});


test("@C030-b hydrates selected chips and the input", async ({ page }) => {
  const script = `import { createComponent, generateHydrationScript, renderToString } from "@solidjs/web";
import { MultiCombobox } from "./dist/ssr/forms.js";
process.stdout.write(generateHydrationScript() + "<!--split-->" + renderToString(() => createComponent(MultiCombobox, { id: "projects", label: "Projects", options: [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }], value: ["a"], onChange() {} })));`;
  const output = execFileSync("node", ["--input-type=module", "-e", script], { encoding: "utf8" });
  const [bootstrap, html] = output.split("<!--split-->");
  await page.route("**/multicombobox-hydration", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html><head>${bootstrap}</head><body><div id="root">${html}</div><script>window.initialInput = document.getElementById("projects"); window.initialChip = document.querySelector(".ui-multi-chip-remove");</script><script type="module" src="/hydrate-multicombobox.tsx"></script></body></html>` }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/multicombobox-hydration");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "yes");
  await expect(page.locator("html")).toHaveAttribute("data-reused", "true");
  await page.getByRole("combobox", { name: "Projects" }).click();
  await page.getByRole("option", { name: "Beta" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-selected", "a,b");
  await expect(page.getByRole("button", { name: "Remove Alpha (a) from Projects" })).toBeVisible();
});


test("@C030-b wraps long selected IDs within a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/multicombobox.html");
  await page.getByRole("button", { name: "Set long project ID" }).click();
  const chip = page.locator(".ui-multi-chip").first();
  await expect(chip).toContainText("Unavailable:");
  expect(await chip.evaluate(element => element.scrollWidth <= element.clientWidth && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("@C030-c requests creation without selecting an unacknowledged option", async ({ page }) => {
  await page.goto("/combobox-create.html");
  const input = page.getByRole("combobox", { name: "Project", exact: true });
  await input.click();
  await input.fill("New project");
  const create = page.getByRole("button", { name: "Create New project" });
  await create.click();
  await expect(page.getByTestId("create-request")).toHaveText("New project");
  await expect(page.getByTestId("create-calls")).toHaveText("1");
  await expect(create).toHaveAttribute("aria-disabled", "true");
  await create.evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByTestId("create-calls")).toHaveText("1");
  await expect(input).toHaveValue("New project");
  await page.locator("form").evaluate(form => (form as HTMLFormElement).requestSubmit());
  await expect(page.locator("html")).toHaveAttribute("data-submitted", "alpha");
  await input.click();
  await input.fill("New project");
  await page.getByRole("button", { name: "Fail creation" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("alert")).toHaveText("Creation failed");
  await expect(input).toHaveValue("New project");
  await page.getByRole("button", { name: "Create New project" }).click();
  await expect(page.getByTestId("create-calls")).toHaveText("2");
  await page.getByRole("button", { name: "Create New project" }).focus();
  await page.getByRole("button", { name: "Acknowledge creation" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(input).toBeFocused();
  await input.press("Escape");
  await expect(input).toHaveValue("New project");
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-submitted", "new-id");
});

test("@C030-c scopes creation errors to their draft and omits duplicate labels", async ({ page }) => {
  await page.goto("/combobox-create.html");
  const input = page.getByRole("combobox", { name: "Project", exact: true });
  await input.click();
  await input.fill(" alpha ");
  await expect(page.getByRole("button", { name: /Create/u })).toHaveCount(0);
  await input.fill("First");
  await page.getByRole("button", { name: "Create First" }).click();
  await input.focus();
  await input.fill("Second");
  await page.getByRole("button", { name: "Fail creation" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Create Second" })).not.toHaveAttribute("aria-disabled", "true");
});


test("@C030-c supports keyboard creation and Escape", async ({ page }) => {
  await page.goto("/combobox-create.html");
  const input = page.getByRole("combobox", { name: "Project", exact: true });
  await input.click();
  await input.fill("Keyboard project");
  const create = page.getByRole("button", { name: "Create Keyboard project" });
  await input.press("Tab");
  await expect(create).toBeFocused();
  await create.press("Enter");
  await expect(page.getByTestId("create-request")).toHaveText("Keyboard project");
  await expect(create).toBeFocused();
  await create.press("Escape");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(input).toHaveValue("Alpha");
});

test("@C030-c does not offer to create an already selected multi option", async ({ page }) => {
  await page.goto("/combobox-create.html");
  const input = page.getByRole("combobox", { name: "Projects" });
  await input.click();
  await input.fill("Alpha");
  await expect(page.getByRole("button", { name: "Create Alpha" })).toHaveCount(0);
  await input.fill("New multi");
  await page.getByRole("button", { name: "Create New multi" }).click();
  await expect(page.getByTestId("multi-create")).toHaveText("New multi");
  await expect(page.getByRole("button", { name: "Remove Alpha (alpha) from Projects" })).toBeVisible();
});


test("@C030-c does not steal focus when a later acknowledgment arrives", async ({ page }) => {
  await page.goto("/combobox-create.html");
  const input = page.getByRole("combobox", { name: "Project", exact: true });
  await input.click();
  await input.fill("Later");
  await input.press("Tab");
  const create = page.getByRole("button", { name: "Create Later" });
  await create.press("Enter");
  await create.press("Tab");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Fail creation" }).focus();
  await page.getByRole("button", { name: "Acknowledge creation" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("button", { name: "Fail creation" })).toBeFocused();
});


test("@C030-c keeps a long creation action within a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/combobox-create.html");
  const input = page.getByRole("combobox", { name: "Project", exact: true });
  await input.click();
  await input.fill("LongProjectName".repeat(20));
  const create = page.getByRole("button", { name: /Create LongProjectName/u });
  await expect(create).toBeVisible();
  expect(await create.evaluate(element => element.scrollWidth <= element.clientWidth && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("@C030-d ignores late search results and retains the current result", async ({ page }) => {
  await page.goto("/combobox-search.html");
  const input = page.getByRole("combobox", { name: "Project", exact: true });
  await input.click();
  await input.fill("a");
  await input.fill("ab");
  await expect(page.getByText("Searching…")).toBeVisible();
  await page.getByRole("button", { name: "Resolve latest" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("option", { name: "Remote result" })).toBeVisible();
  await page.getByRole("button", { name: "Resolve old" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("option", { name: "Old result" })).toHaveCount(0);
  await expect(page.getByRole("option", { name: "Remote result" })).toBeVisible();
  await page.getByRole("button", { name: "Fail latest" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("option", { name: "Remote result" })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(input).toHaveValue("ab");
  await page.getByRole("option", { name: "Remote result" }).click();
  await page.locator("form").evaluate(form => (form as HTMLFormElement).requestSubmit());
  await expect(page.locator("html")).toHaveAttribute("data-submitted", "remote");
});

test("@C030-d reports a failed search and keeps the draft without selecting", async ({ page }) => {
  await page.goto("/combobox-search.html");
  const input = page.getByRole("combobox", { name: "Project", exact: true });
  await input.click();
  await input.fill("missing");
  await page.getByRole("button", { name: "Fail latest" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("alert")).toHaveText("Search failed");
  await expect(input).toHaveValue("missing");
  await input.press("Enter");
  await page.locator("form").evaluate(form => (form as HTMLFormElement).requestSubmit());
  await expect(page.locator("html")).toHaveAttribute("data-submitted", "alpha");
  await input.press("Tab");
  const retry = page.getByRole("button", { name: "Retry search" });
  await expect(retry).toBeFocused();
  await retry.press("Enter");
  await expect(input).toBeFocused();
  await expect(page.getByText("Searching…")).toBeVisible();
  await expect(page.getByTestId("search-calls")).toHaveText("3");
});

test("@C030-d excludes selected IDs from asynchronous multi results", async ({ page }) => {
  await page.goto("/combobox-search.html");
  const input = page.getByRole("combobox", { name: "Projects" });
  await input.click();
  await expect(page.getByRole("option", { name: "Alpha" })).toHaveCount(0);
  await page.getByRole("option", { name: "Remote result" }).click();
  await expect(page.getByRole("button", { name: "Remove unavailable remote from Projects" })).toBeVisible();
});


test("@C030-d waits for composition and never offers stale results during editing", async ({ page }) => {
  await page.goto("/combobox-search.html");
  const input = page.getByRole("combobox", { name: "Project", exact: true });
  await input.click();
  await page.getByRole("button", { name: "Resolve latest" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("option", { name: "Remote result" })).toBeVisible();
  await expect(page.getByTestId("search-calls")).toHaveText("1");
  await input.dispatchEvent("compositionstart");
  await input.fill("候");
  await expect(page.getByRole("option", { name: "Remote result" })).toHaveCount(0);
  await expect(page.getByTestId("search-calls")).toHaveText("1");
  await input.dispatchEvent("compositionend");
  await expect(page.getByTestId("search-calls")).toHaveText("2");
  await input.dispatchEvent("input");
  await expect(page.getByTestId("search-calls")).toHaveText("2");
});

test("@C030-d distinguishes repeated searches for the same query", async ({ page }) => {
  await page.goto("/combobox-search.html");
  const input = page.getByRole("combobox", { name: "Project", exact: true });
  await input.click();
  await input.fill("a");
  await input.fill("b");
  await input.fill("a");
  await page.getByRole("button", { name: "Resolve latest" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("option", { name: "Remote result" })).toBeVisible();
  await page.getByRole("button", { name: "Resolve old" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole("option", { name: "Remote result" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Old result" })).toHaveCount(0);
});


test("@C030-d offers creation only after current search results arrive", async ({ page }) => {
  await page.goto("/combobox-search.html");
  const input = page.getByRole("combobox", { name: "Project", exact: true });
  await input.click();
  await input.fill("Fresh");
  await expect(page.getByRole("button", { name: "Create Fresh" })).toHaveCount(0);
  await page.getByRole("button", { name: "Resolve latest" }).evaluate(element => (element as HTMLButtonElement).click());
  await page.getByRole("button", { name: "Create Fresh" }).click();
  await expect(page.getByTestId("search-create")).toHaveText("Fresh");
  await page.locator("form").evaluate(form => (form as HTMLFormElement).requestSubmit());
  await expect(page.locator("html")).toHaveAttribute("data-submitted", "alpha");
});

test("@C031-a searches grouped commands and executes only an enabled action", async ({ page }) => {
  await page.goto("/command-menu.html");
  const trigger = page.getByRole("button", { name: "Commands" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Commands" });
  const input = dialog.getByRole("combobox", { name: "Search commands" });
  await expect(input).toBeFocused();
  await expect(dialog.getByRole("group", { name: "Navigation" })).toBeVisible();
  await expect(dialog.getByRole("option", { name: "Open billing" })).toHaveAttribute("aria-disabled", "true");
  await input.fill("repository");
  await expect(dialog.getByRole("option", { name: "Open projects" })).toBeVisible();
  await expect(dialog.getByRole("option", { name: "Open overview" })).toHaveCount(0);
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page.getByTestId("command-selected")).toHaveText("projects");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("@C031-a clears a search before Escape closes and retains no-results feedback", async ({ page }) => {
  await page.goto("/command-menu.html");
  const trigger = page.getByRole("button", { name: "Commands" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Commands" });
  const input = dialog.getByRole("combobox", { name: "Search commands" });
  await input.fill("not found");
  await expect(dialog.getByText("No matching commands")).toBeVisible();
  await input.press("Enter");
  await expect(page.getByTestId("command-selected")).toHaveText("");
  await input.press("Escape");
  await expect(input).toHaveValue("");
  await expect(dialog).toBeVisible();
  await input.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("@C031-a skips unavailable commands and drops a removed active command", async ({ page }) => {
  await page.goto("/command-menu.html");
  await page.getByRole("button", { name: "Commands" }).click();
  const dialog = page.getByRole("dialog", { name: "Commands" });
  const input = dialog.getByRole("combobox", { name: "Search commands" });
  await input.press("ArrowDown");
  const overview = dialog.getByRole("option", { name: "Open overview" });
  await expect(input).toHaveAttribute("aria-activedescendant", await overview.getAttribute("id") ?? "");
  await input.press("ArrowDown");
  const projects = dialog.getByRole("option", { name: "Open projects" });
  await expect(input).toHaveAttribute("aria-activedescendant", await projects.getAttribute("id") ?? "");
  await page.getByRole("button", { name: "Remove projects command" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(input).not.toHaveAttribute("aria-activedescendant");
  await input.press("Enter");
  await expect(page.getByTestId("command-selected")).toHaveText("");
  await expect(input).toBeFocused();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("button", { name: "Commands" })).toBeFocused();
});

test("@C031-a preserves IME editing and fits a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/command-menu.html");
  await page.getByRole("button", { name: "Commands" }).click();
  const dialog = page.getByRole("dialog", { name: "Commands" });
  const input = dialog.getByRole("combobox", { name: "Search commands" });
  await input.press("ArrowDown");
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true, bubbles: true });
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId("command-selected")).toHaveText("");
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test("@C031-a closes the nested command menu before its parent", async ({ page }) => {
  await page.goto("/command-menu.html");
  await page.getByRole("button", { name: "Open parent" }).click();
  const parent = page.getByRole("dialog", { name: "Parent" });
  const trigger = parent.getByRole("button", { name: "Nested commands" });
  await trigger.click();
  const child = page.getByRole("dialog", { name: "Nested commands" });
  await child.getByRole("combobox", { name: "Search commands" }).press("Escape");
  await expect(child).toHaveCount(0);
  await expect(parent).toBeVisible();
  await expect(trigger).toBeFocused();
});

test("@C031-a hydrates the trigger and executes a command", async ({ page }) => {
  const script = `import { createComponent, generateHydrationScript, renderToString } from "@solidjs/web";
import { CommandMenu } from "./dist/ssr/layout.js";
process.stdout.write(generateHydrationScript() + "<!--split-->" + renderToString(() => createComponent(CommandMenu, { label: "Commands", groups: [{ id: "actions", label: "Actions", commands: [{ id: "open", label: "Open" }] }], onSelect() {} })));`;
  const output = execFileSync("node", ["--input-type=module", "-e", script], { encoding: "utf8" });
  const [bootstrap, html] = output.split("<!--split-->");
  await page.route("**/command-menu-hydration", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html><head>${bootstrap}</head><body><div id="root">${html}</div><script>window.initialTrigger = document.querySelector(".ui-command-menu > button");</script><script type="module" src="/hydrate-command-menu.tsx"></script></body></html>` }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/command-menu-hydration");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "yes");
  await expect(page.locator("html")).toHaveAttribute("data-reused", "true");
  await page.getByRole("button", { name: "Commands" }).click();
  const input = page.getByRole("combobox", { name: "Search commands" });
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-selected", "open");
});


test("@C031-a supports touch without executing a dragged command", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/command-menu.html");
  await page.getByRole("button", { name: "Commands" }).tap();
  const option = page.getByRole("option", { name: "Open projects" });
  await option.dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 9, clientX: 10, clientY: 10, bubbles: true });
  await option.dispatchEvent("pointermove", { pointerType: "touch", pointerId: 9, clientX: 10, clientY: 40, bubbles: true });
  await option.dispatchEvent("pointerup", { pointerType: "touch", pointerId: 9, clientX: 10, clientY: 40, bubbles: true });
  await option.dispatchEvent("click");
  await expect(page.getByTestId("command-selected")).toHaveText("");
  await option.tap();
  await expect(page.getByTestId("command-selected")).toHaveText("projects");
  await context.close();
});

test("@C031-a leaves ordinary navigation available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/command-menu.html");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
  await context.close();
});


test("@C031-b opens only from its shortcut scope and preserves text editing", async ({ page }) => {
  await page.goto("/command-menu.html");
  const trigger = page.getByRole("button", { name: "Commands", exact: true });
  await expect(trigger).toHaveAttribute("aria-keyshortcuts", "Control+K");
  await page.getByRole("textbox", { name: "Outside input" }).focus();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Commands" })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Scope input" }).focus();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Commands" })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Scope editor" }).focus();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Commands" })).toHaveCount(0);
  const scopeAction = page.getByRole("button", { name: "Scope action", exact: true });
  await scopeAction.focus();
  await page.keyboard.press("Control+Shift+k");
  await expect(page.getByRole("dialog", { name: "Commands" })).toHaveCount(0);
  await scopeAction.dispatchEvent("keydown", { key: "k", ctrlKey: true, isComposing: true, bubbles: true });
  await expect(page.getByRole("dialog", { name: "Commands" })).toHaveCount(0);
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Commands" });
  await expect(dialog.getByRole("combobox", { name: "Search commands" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(scopeAction).toBeFocused();
});


test("@C031-b returns focus to the trigger if the shortcut opener disappears", async ({ page }) => {
  await page.goto("/command-menu.html");
  await page.getByRole("button", { name: "Scope action", exact: true }).focus();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Commands" });
  await page.getByRole("button", { name: "Remove scope action" }).evaluate(element => (element as HTMLButtonElement).click());
  await dialog.getByRole("combobox", { name: "Search commands" }).press("Escape");
  await expect(page.getByRole("button", { name: "Commands", exact: true })).toBeFocused();
});

test("@C031-c searches an integration submenu and returns to the previous query", async ({ page }) => {
  await page.goto("/command-menu.html");
  await page.getByRole("button", { name: "Commands", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Commands" });
  const input = dialog.getByRole("combobox", { name: "Search commands" });
  await input.fill("connect");
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(input).toHaveValue("");
  await expect(dialog.getByRole("group", { name: "Integrations" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Back to commands" })).toBeVisible();
  await expect(dialog.getByRole("option", { name: "Connect locked service" })).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByTestId("command-selected")).toHaveText("");
  await input.fill("repository");
  await expect(dialog.getByRole("option", { name: "Connect GitHub" })).toBeVisible();
  await input.press("Escape");
  await expect(input).toHaveValue("");
  await input.press("Escape");
  await expect(input).toHaveValue("connect");
  await expect(dialog.getByRole("option", { name: "Integrations" })).toHaveAttribute("id", await input.getAttribute("aria-activedescendant") ?? "");
  await input.press("Enter");
  await input.press("ArrowDown");
  await input.press("ArrowDown");
  const slack = dialog.getByRole("option", { name: "Connect Slack" });
  await expect(slack).toHaveAttribute("id", await input.getAttribute("aria-activedescendant") ?? "");
  await input.press("Enter");
  await expect(page.getByTestId("command-selected")).toHaveText("slack");
  await expect(page.getByRole("button", { name: "Commands", exact: true })).toBeFocused();
});

test("@C031-c does not execute a removed integration submenu", async ({ page }) => {
  await page.goto("/command-menu.html");
  await page.getByRole("button", { name: "Commands", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Commands" });
  const input = dialog.getByRole("combobox", { name: "Search commands" });
  await dialog.getByRole("option", { name: "Integrations" }).click();
  await expect(dialog.getByRole("group", { name: "Integrations" })).toBeVisible();
  await page.getByRole("button", { name: "Remove integrations" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(dialog.getByRole("group", { name: "Integrations" })).toHaveCount(0);
  await expect(input).toBeFocused();
  await input.press("Enter");
  await expect(page.getByTestId("command-selected")).toHaveText("");
  await page.getByRole("button", { name: "Restore integrations" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(dialog.getByRole("group", { name: "Integrations" })).toHaveCount(0);
  await dialog.getByRole("option", { name: "Integrations" }).click();
  await expect(dialog.getByRole("group", { name: "Integrations" })).toBeVisible();
});


test("@C031-c supports opening and returning from a submenu by touch", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/command-menu.html");
  await page.getByRole("button", { name: "Commands", exact: true }).tap();
  const dialog = page.getByRole("dialog", { name: "Commands" });
  await dialog.getByRole("option", { name: "Integrations" }).tap();
  await expect(dialog.getByRole("group", { name: "Integrations" })).toBeVisible();
  await dialog.getByRole("button", { name: "Back to commands" }).tap();
  await expect(dialog.getByRole("option", { name: "Integrations" })).toBeVisible();
  await dialog.getByRole("option", { name: "Integrations" }).tap();
  await dialog.getByRole("option", { name: "Connect GitHub" }).tap();
  await expect(page.getByTestId("command-selected")).toHaveText("github");
  await context.close();
});
