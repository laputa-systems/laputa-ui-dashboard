import { expect, test, type Page } from "@playwright/test";

const chapterPaths = { "Foundations": "overview", "Forms & inputs": "forms", "Navigation": "navigation", "Data views": "data", "Workspaces": "workspaces", "Feedback": "feedback", "Recipes": "recipes", "Editorial & themes": "editorial" } as const;
const chapters = Object.keys(chapterPaths) as (keyof typeof chapterPaths)[];

async function chapter(page: Page, title: keyof typeof chapterPaths): Promise<void> {
  await page.getByRole("navigation", { name: "Demo chapters" }).getByRole("link", { name: title }).click();
  await expect(page.locator(".tour-chapter-head h1")).toHaveText(title);
  await expect(page).toHaveURL(new RegExp(`#${chapterPaths[title]}$`));
}

test("eight coherent chapters expose the library in an interactive field guide", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".tour-chapter-head h1")).toHaveText("Foundations");
  await expect(page.locator(".tour-specimen")).toHaveCount(5);
  for (const title of chapters.slice(1)) {
    await chapter(page, title);
    await expect(page.locator(".tour-specimen").first()).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("demo controls update locally and preserve keyboard access", async ({ page }) => {
  await page.goto("/#feedback");
  await page.getByRole("button", { name: "Advance" }).click();
  await expect(page.getByText("55 of 100 complete")).toBeVisible();
  await page.getByRole("button", { name: "Fail", exact: true }).click();
  await expect(page.getByText("Request rejected.")).toBeVisible();
  await chapter(page, "Navigation");
  await page.getByRole("button", { name: "Find a chapter" }).click();
  const dialog = page.getByRole("dialog", { name: "Search tour chapters" });
  await expect(dialog).toBeVisible();
  const query = dialog.getByRole("combobox", { name: "Search tour chapters" });
  await expect(query).toBeFocused();
  await query.fill("forms");
  await expect(dialog.getByRole("option")).toHaveCount(1);
  await query.press("Escape");
  await expect(query).toHaveValue("");
  await expect(dialog).toBeVisible();
  await query.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("light, paper and dark are distinct scopes without changing chapter contents", async ({ page }) => {
  await page.goto("/#editorial");
  const root = page.locator(".tour-shell");
  const before = await root.evaluate(el => getComputedStyle(el).backgroundColor);
  await page.getByRole("button", { name: "Paper" }).click();
  await expect(root).toHaveAttribute("data-theme", "editorial");
  const paper = await root.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(paper).not.toBe(before);
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(root).toHaveClass(/ui-theme-dark/);
  const dark = await root.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(dark).not.toBe(paper);
  await expect(page.locator(".tour-chapter-head h1")).toHaveText("Editorial & themes");
});

test("mobile chapters and specimens do not induce document overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const title of chapters) {
    await chapter(page, title);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow, `${title} overflowed the mobile page`).toBe(false);
  }
});
