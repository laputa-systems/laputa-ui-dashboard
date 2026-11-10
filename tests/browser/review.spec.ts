import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const SHOTS = resolve(".work/tmp/t5-shots");

interface Viewport {
  readonly width: number;
  readonly height: number;
}

async function open(browser: Browser, viewport: Viewport = { width: 1280, height: 900 }): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport });
  const page = await context.newPage();
  await page.goto("/review-static.html");
  await expect(page.getByTestId("review-theme")).toBeVisible();
  return { context, page };
}

function traversalKey(browserName: string): string {
  return browserName === "webkit" ? "Alt+Tab" : "Tab";
}

function isTransparent(color: string): boolean {
  if (color === "transparent") return true;
  const alpha = /(?:rgba|hsla|color)\([^)]*?[,/]\s*([\d.]+)\s*\)$/u.exec(color);
  return alpha !== null && Number(alpha[1]) === 0;
}

async function expectVisibleFocus(locator: Locator, label: string): Promise<void> {
  const focus = await locator.evaluate(element => {
    const computed = getComputedStyle(element);
    return { width: Number.parseFloat(computed.outlineWidth), color: computed.outlineColor };
  });
  expect(focus.width, `${label} outline width`).toBeGreaterThan(0);
  expect(isTransparent(focus.color), `${label} outline color`).toBe(false);
}

test("every visible input and textarea has an accessible name", async ({ browser }) => {
  const { context, page } = await open(browser);
  const controls = page.locator('input:not([type="hidden"]), textarea');
  expect(await controls.count()).toBe(8);
  for (let index = 0; index < (await controls.count()); index++) {
    const control = controls.nth(index);
    const name = await control.evaluate(element => {
      const field = element as HTMLInputElement | HTMLTextAreaElement;
      const label = field.labels?.[0]?.textContent ?? "";
      return (field.getAttribute("aria-label") ?? label).replace(/\s+/gu, " ").trim();
    });
    expect(name, (await control.getAttribute("id")) ?? String(index)).not.toBe("");
  }
  await context.close();
});

test("a shown field error is associated with its field", async ({ browser }) => {
  const { context, page } = await open(browser);
  const field = page.locator("#review-ada-score");
  const error = page.locator("#review-ada-score-error");
  await expect(error).toBeVisible();
  await expect(error).toHaveText("Enter a score between 1 and 10.");
  const describedBy = ((await field.getAttribute("aria-describedby")) ?? "").split(/\s+/u);
  expect(describedBy).toContain("review-ada-score-hint");
  expect(describedBy).toContain("review-ada-score-error");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await context.close();
});

test("Approve and Reject are distinct submits sharing one name", async ({ browser }) => {
  const { context, page } = await open(browser);
  const forms = page.locator("form.review-form");
  expect(await forms.count()).toBe(3);
  for (let index = 0; index < (await forms.count()); index++) {
    const form = forms.nth(index);
    await expect(form).toHaveAttribute("method", "post");
    await expect(form).toHaveAttribute("action", "/admin/review");
    const approve = form.getByRole("button", { name: "Approve" });
    const reject = form.getByRole("button", { name: "Reject" });
    await expect(approve).toHaveCount(1);
    await expect(reject).toHaveCount(1);
    await expect(approve).toHaveAttribute("type", "submit");
    await expect(reject).toHaveAttribute("type", "submit");
    await expect(approve).toHaveAttribute("name", "status");
    await expect(reject).toHaveAttribute("name", "status");
    await expect(approve).toHaveAttribute("value", "approved");
    await expect(reject).toHaveAttribute("value", "rejected");
    expect(await approve.getAttribute("value")).not.toBe(await reject.getAttribute("value"));
    expect(await approve.getAttribute("class")).toContain("ui-button-primary");
    expect(await reject.getAttribute("class")).toContain("ui-button-danger");
  }
  await context.close();
});

test("Tab order within a queue item is score, note, Approve, Reject", async ({ browser, browserName }) => {
  const { context, page } = await open(browser);
  const item = page.locator("li.review-row").first();
  const score = item.locator("#review-ada-score");
  const note = item.locator("#review-ada-note");
  const approve = item.getByRole("button", { name: "Approve" });
  const reject = item.getByRole("button", { name: "Reject" });
  await score.focus();
  await expect(score).toBeFocused();
  await expectVisibleFocus(score, "score");
  const key = traversalKey(browserName);
  await page.keyboard.press(key);
  await expect(note).toBeFocused();
  await expectVisibleFocus(note, "note");
  await page.keyboard.press(key);
  await expect(approve).toBeFocused();
  await expectVisibleFocus(approve, "Approve");
  await page.keyboard.press(key);
  await expect(reject).toBeFocused();
  await expectVisibleFocus(reject, "Reject");
  await context.close();
});

test("flash is a status and the error is an alert", async ({ browser }) => {
  const { context, page } = await open(browser);
  const status = page.getByRole("status");
  const alert = page.getByRole("alert");
  await expect(status).toBeVisible();
  await expect(alert).toBeVisible();
  await expect(status).toHaveText("Saved the review for Ada Lovelace.");
  await expect(alert).toHaveText("The previous save could not be recorded. Try again.");
  await expect(status).toHaveClass(/ui-notice-ok/u);
  await expect(alert).toHaveClass(/ui-notice-bad/u);
  await context.close();
});

test("no horizontal overflow at 390px or 640px at deviceScaleFactor 2", async ({ browser }) => {
  const sizes = [
    { viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 },
    { viewport: { width: 640, height: 900 }, deviceScaleFactor: 2 }
  ] as const;
  for (const size of sizes) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: size.viewport, deviceScaleFactor: size.deviceScaleFactor });
    const page = await context.newPage();
    await page.goto("/review-static.html");
    await expect(page.getByTestId("review-theme")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${size.viewport.width}px`).toBeLessThanOrEqual(0);
    await context.close();
  }
});

test("the editorial input tokens apply to the review region", async ({ browser }) => {
  const { context, page } = await open(browser);
  const values = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    return {
      bg: body.getPropertyValue("--ui-bg").trim(),
      surface: body.getPropertyValue("--ui-surface").trim(),
      text: body.getPropertyValue("--ui-text").trim(),
      accent: body.getPropertyValue("--ui-accent").trim(),
      accentSoft: body.getPropertyValue("--ui-accent-soft").trim(),
      background: body.backgroundColor
    };
  });
  expect(values.bg).toBe("#f8f7f3");
  expect(values.surface).toBe("#fcfbf8");
  expect(values.text).toBe("#1f1d19");
  expect(values.accent).toBe("#2c4d6e");
  expect(values.accentSoft).toContain("#2c4d6e");
  expect(values.background).toBe("rgb(248, 247, 243)");
  await context.close();
});

test("saves desktop and mobile screenshots of the review surface", async ({ browser }) => {
  await mkdir(SHOTS, { recursive: true });
  const sizes = [
    { width: 1440, height: 1000, name: "1440" },
    { width: 390, height: 900, name: "390" }
  ] as const;
  for (const size of sizes) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: size.width, height: size.height } });
    const page = await context.newPage();
    await page.goto("/review-static.html");
    await expect(page.getByTestId("review-theme")).toBeVisible();
    await page.screenshot({ path: resolve(SHOTS, `review-${size.name}.png`), fullPage: true });
    await context.close();
  }
});
