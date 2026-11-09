import { execFileSync } from "node:child_process";
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
