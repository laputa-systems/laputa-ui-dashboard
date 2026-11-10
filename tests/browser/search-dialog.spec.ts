import { expect, test, type Page } from "@playwright/test";

type FixtureWindow = Window & {
  searchFixture: {
    setOpen(open: boolean): void;
    setQuery(query: string): void;
    setState(state: unknown): void;
    replaceSame(): void;
    replaceNew(): void;
    setLoading(): void;
    setError(): void;
    setNoResults(): void;
    probe(kind: "unsafe" | "many"): string;
  };
};

async function openWithOpener(page: Page) {
  const opener = page.getByTestId("opener");
  await opener.focus();
  await opener.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Search the archive" });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("combobox", { name: "Search the archive" });
  await expect(input).toBeFocused();
  return { opener, dialog, input };
}

test("opens and closes through the controlled open prop and returns focus", async ({ page }) => {
  await page.goto("/search-dialog.html");
  const dialog = page.getByRole("dialog", { name: "Search the archive" });
  await page.evaluate(() => (window as FixtureWindow).searchFixture.setOpen(true));
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("combobox", { name: "Search the archive" });
  await expect(input).toBeFocused();
  await expect(page.getByTestId("open-requests")).toHaveText("0");
  await page.evaluate(() => (window as FixtureWindow).searchFixture.setOpen(false));
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId("focus-fallback")).toBeFocused();
  await expect(page.getByTestId("open-requests")).toHaveText("0");

  const { opener: openerAfterEscape, dialog: reopened, input: reopenedInput } = await openWithOpener(page);
  await expect(page.getByTestId("open-requests")).toHaveText("0");
  await reopenedInput.press("Escape");
  await expect(reopened).toHaveCount(0);
  await expect(openerAfterEscape).toBeFocused();
  await expect(page.getByTestId("open-requests")).toHaveText("1");

  const { opener, dialog: buttonDialog } = await openWithOpener(page);
  await expect(page.getByTestId("open-requests")).toHaveText("1");
  await buttonDialog.getByRole("button", { name: "Close" }).click();
  await expect(buttonDialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.getByTestId("open-requests")).toHaveText("2");

  const { opener: backdropOpener, dialog: backdropDialog } = await openWithOpener(page);
  await page.mouse.click(2, 2);
  await expect(backdropDialog).toHaveCount(0);
  await expect(backdropOpener).toBeFocused();
  await expect(page.getByTestId("open-requests")).toHaveText("3");
});

test("opens from a document shortcut and the search button", async ({ page }) => {
  await page.goto("/search-dialog.html");
  const dialog = page.getByRole("dialog", { name: "Search the archive" });
  const input = dialog.getByRole("combobox", { name: "Search the archive" });
  await page.keyboard.press("/");
  await expect(dialog).toBeVisible();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("");
  await expect(page.getByTestId("open-requests")).toHaveText("1");
  await input.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId("focus-fallback")).toBeFocused();

  await page.getByRole("button", { name: "Open from search button" }).click();
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId("open-requests")).toHaveText("2");
});

test("opens from a shortcut character that the layout types with Shift", async ({ page }) => {
  await page.goto("/search-dialog.html");
  await page.locator("body").dispatchEvent("keydown", { key: "/", shiftKey: true, bubbles: true, cancelable: true });
  await expect(page.getByRole("dialog", { name: "Search the archive" })).toBeVisible();
  await expect(page.getByTestId("open-requests")).toHaveText("1");
});

test("ignores the shortcut in text entry, with modifiers, repeats, and composition", async ({ page }) => {
  await page.goto("/search-dialog.html");
  const dialog = page.getByRole("dialog", { name: "Search the archive" });
  const outside = page.getByTestId("outside-input");
  await outside.focus();
  await outside.press("/");
  await expect(dialog).toHaveCount(0);
  await expect(outside).toHaveValue("/");

  const editor = page.getByTestId("outside-editor");
  await editor.focus();
  await page.keyboard.press("/");
  await expect(dialog).toHaveCount(0);
  await expect(editor).toContainText("/");

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press("Control+/");
  await page.keyboard.press("Meta+/");
  await page.keyboard.press("Alt+/");
  await page.locator("body").dispatchEvent("keydown", { key: "/", repeat: true, bubbles: true });
  await page.locator("body").dispatchEvent("keydown", { key: "/", isComposing: true, bubbles: true });
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId("open-requests")).toHaveText("0");
});

test("requests the controlled query once per input and reflects parent updates", async ({ page }) => {
  await page.goto("/search-dialog.html");
  const { dialog, input } = await openWithOpener(page);
  await input.pressSequentially("ab");
  await expect(page.getByTestId("query-state")).toHaveText("ab");
  await expect(page.getByTestId("query-requests")).toHaveText("2");
  await page.evaluate(() => (window as FixtureWindow).searchFixture.setQuery("external"));
  await expect(input).toHaveValue("external");
  await expect(page.getByTestId("query-requests")).toHaveText("2");
  await expect(dialog).toBeVisible();
});

test("renders host results through renderResult with link and selection semantics", async ({ page }) => {
  await page.goto("/search-dialog.html");
  const { dialog, input } = await openWithOpener(page);
  const listbox = dialog.getByRole("listbox", { name: "Results" });
  await expect(listbox).toBeVisible();
  await expect(dialog.getByRole("option")).toHaveCount(3);
  const alpha = dialog.getByRole("option", { name: /Alpha Studio/u });
  const beta = dialog.getByRole("option", { name: /Beta Gallery/u });
  await expect(alpha).toHaveAttribute("href", "/targets/alpha");
  expect(await alpha.evaluate(element => element.tagName)).toBe("A");
  await expect(alpha.locator("img")).toHaveAttribute("alt", "");
  await expect(alpha.locator("mark")).toHaveText("Studio");
  await expect(alpha.getByTestId("meta-alpha")).toHaveText("Artist · Berlin");
  await expect(alpha.getByTestId("excerpt-alpha")).toHaveText("Painting, sculpture and installation.");
  await expect(alpha.getByTestId("result-alpha")).toHaveAttribute("data-active-render", "true");
  await expect(beta.getByTestId("result-beta")).toHaveAttribute("data-active-render", "false");
  await expect(alpha).toHaveAttribute("aria-selected", "true");
  await expect(beta).toHaveAttribute("aria-selected", "false");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await expect(input).toHaveAttribute("aria-controls", await listbox.getAttribute("id") ?? "");
  await expect(input).toHaveAttribute("aria-activedescendant", await alpha.getAttribute("id") ?? "");
  await expect(dialog.locator('[role="option"][aria-selected="true"]')).toHaveCount(1);
});

test("moves the active option with arrows, Home, End, and wraps", async ({ page }) => {
  await page.goto("/search-dialog.html");
  const { dialog, input } = await openWithOpener(page);
  const alpha = dialog.getByRole("option", { name: /Alpha Studio/u });
  const beta = dialog.getByRole("option", { name: /Beta Gallery/u });
  const gamma = dialog.getByRole("option", { name: /Gamma Archive/u });
  await expect(input).toHaveAttribute("aria-activedescendant", await alpha.getAttribute("id") ?? "");
  await input.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-activedescendant", await beta.getAttribute("id") ?? "");
  await expect(beta).toHaveAttribute("aria-selected", "true");
  await expect(alpha).toHaveAttribute("aria-selected", "false");
  await input.press("ArrowUp");
  await expect(input).toHaveAttribute("aria-activedescendant", await alpha.getAttribute("id") ?? "");
  await input.press("ArrowUp");
  await expect(input).toHaveAttribute("aria-activedescendant", await gamma.getAttribute("id") ?? "");
  await input.press("Home");
  await expect(input).toHaveAttribute("aria-activedescendant", await alpha.getAttribute("id") ?? "");
  await input.press("End");
  await expect(input).toHaveAttribute("aria-activedescendant", await gamma.getAttribute("id") ?? "");
  await input.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-activedescendant", await alpha.getAttribute("id") ?? "");
});

test("navigates to the active result with Enter", async ({ page }) => {
  await page.route("**/targets/beta", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Target</title><p>target page</p>" }));
  await page.goto("/search-dialog.html");
  const { input } = await openWithOpener(page);
  await input.press("ArrowDown");
  await input.press("Enter");
  await page.waitForURL("**/targets/beta");
  await expect(page.getByText("target page")).toBeVisible();
});

test("announces loading, error, and no results politely", async ({ page }) => {
  await page.goto("/search-dialog.html");
  const { dialog, input } = await openWithOpener(page);
  await page.evaluate(() => (window as FixtureWindow).searchFixture.setLoading());
  await expect(dialog.getByRole("status")).toHaveText("Searching…");
  await expect(dialog.getByRole("option")).toHaveCount(0);
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await page.evaluate(() => (window as FixtureWindow).searchFixture.setError());
  await expect(dialog.getByRole("status")).toHaveText("Search unavailable");
  await expect(dialog.locator('[role="alert"]')).toHaveCount(0);
  await page.evaluate(() => (window as FixtureWindow).searchFixture.setNoResults());
  await expect(dialog.getByRole("status")).toHaveText("No results");
  await expect(dialog.getByRole("listbox", { name: "Results" })).toHaveCount(1);
  await expect(dialog.getByRole("option")).toHaveCount(0);
  await expect(input).toHaveAttribute("aria-expanded", "false");
});

test("keeps the active result by id and resets it when the results change", async ({ page }) => {
  await page.goto("/search-dialog.html");
  const { dialog, input } = await openWithOpener(page);
  const beta = dialog.getByRole("option", { name: /Beta Gallery/u });
  await input.press("ArrowDown");
  await expect(beta).toHaveAttribute("aria-selected", "true");
  await page.evaluate(() => (window as FixtureWindow).searchFixture.replaceSame());
  await expect(beta).toHaveAttribute("aria-selected", "true");
  await expect(input).toHaveAttribute("aria-activedescendant", await beta.getAttribute("id") ?? "");
  await page.evaluate(() => (window as FixtureWindow).searchFixture.replaceNew());
  const delta = dialog.getByRole("option", { name: /Delta Press/u });
  await expect(dialog.getByRole("option")).toHaveCount(2);
  await expect(delta).toHaveAttribute("aria-selected", "true");
  await expect(input).toHaveAttribute("aria-activedescendant", await delta.getAttribute("id") ?? "");
  await page.evaluate(() => (window as FixtureWindow).searchFixture.setState({ kind: "results", results: [{ id: "alpha", href: "/targets/alpha" }, { id: "beta", href: "/targets/beta" }] }));
  const alpha = dialog.getByRole("option", { name: /Alpha Studio/u });
  await expect(alpha).toHaveAttribute("aria-selected", "true");
  await expect(input).toHaveAttribute("aria-activedescendant", await alpha.getAttribute("id") ?? "");
});

test("refuses unsafe URLs and more than 200 results", async ({ page }) => {
  await page.goto("/search-dialog.html");
  const unsafe = await page.evaluate(() => (window as FixtureWindow).searchFixture.probe("unsafe"));
  expect(unsafe).toContain("Invalid search result URL");
  const many = await page.evaluate(() => (window as FixtureWindow).searchFixture.probe("many"));
  expect(many).toContain("at most 200 results");
});

test("does not handle Enter or Escape during IME composition", async ({ page }) => {
  await page.route("**/targets/alpha", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><p>navigated</p>" }));
  await page.goto("/search-dialog.html");
  const { dialog, input } = await openWithOpener(page);
  const start = page.url();
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true, bubbles: true });
  await page.waitForTimeout(100);
  expect(page.url()).toBe(start);
  await expect(dialog).toBeVisible();

  await input.dispatchEvent("compositionstart", { bubbles: true });
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId("open-requests")).toHaveText("0");
  await input.dispatchEvent("compositionend", { bubbles: true });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId("open-requests")).toHaveText("1");
});
