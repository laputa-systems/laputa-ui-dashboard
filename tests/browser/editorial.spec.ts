import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";

interface Viewport {
  readonly width: number;
  readonly height: number;
}

async function open(browser: Browser, viewport: Viewport = { width: 1280, height: 900 }): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport });
  const page = await context.newPage();
  await page.goto("/editorial-static.html");
  await expect(page.getByTestId("reading")).toBeVisible();
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

async function activeOutline(page: Page): Promise<{ width: number; color: string }> {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return { width: 0, color: "transparent" };
    const computed = getComputedStyle(element);
    return { width: Number.parseFloat(computed.outlineWidth), color: computed.outlineColor };
  });
}

async function tabTo(page: Page, key: string, selector: string): Promise<void> {
  for (let step = 0; step < 80; step++) {
    await page.keyboard.press(key);
    const reached = await page.evaluate(
      target => document.activeElement instanceof Element && document.activeElement.matches(target),
      selector
    );
    if (reached) return;
  }
  throw new Error(`Tab did not reach ${selector}`);
}

const plainProperties = [
  "display",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "color",
  "background-color",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "max-width",
  "outline-width",
  "text-decoration-line"
] as const;

async function plainSnapshot(page: Page): Promise<readonly unknown[]> {
  return page.evaluate(properties => {
    const root = document.querySelector('[data-testid="plain"]');
    if (root === null) throw new Error("missing plain region");
    return [...root.querySelectorAll("p, a, figure, ol")].map(element => {
      const computed = getComputedStyle(element);
      return {
        tag: element.tagName.toLowerCase(),
        values: properties.map(property => computed.getPropertyValue(property))
      };
    });
  }, [...plainProperties]);
}

test("citation links move to the reference and visibly highlight the target", async ({ browser }) => {
  const { context, page } = await open(browser);
  const citation = page.locator(".ui-cite a").first();
  await expect(citation).toHaveAttribute("href", "#ref-1");
  await citation.click();
  await expect(page).toHaveURL(/#ref-1$/u);
  const target = page.locator("#ref-1");
  expect(await target.evaluate(element => element.matches(":target"))).toBe(true);
  const background = await target.evaluate(element => getComputedStyle(element).backgroundColor);
  expect(isTransparent(background)).toBe(false);
  await context.close();
});

test("Tab reaches citation and term links with a visible outline", async ({ browser, browserName }) => {
  const { context, page } = await open(browser);
  const key = traversalKey(browserName);
  await tabTo(page, key, ".ui-cite a");
  expect(await page.evaluate(() => document.activeElement?.getAttribute("href"))).toBe("#ref-1");
  let outline = await activeOutline(page);
  expect(outline.width, "citation outline width").toBeGreaterThan(0);
  expect(isTransparent(outline.color), "citation outline color").toBe(false);

  await tabTo(page, key, ".ui-term");
  outline = await activeOutline(page);
  expect(outline.width, "term outline width").toBeGreaterThan(0);
  expect(isTransparent(outline.color), "term outline color").toBe(false);
  await context.close();
});

test("no horizontal overflow at 320, 390, 768, or 1440 pixels", async ({ browser }) => {
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto("/editorial-static.html");
    await expect(page.getByTestId("reading")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${width}px`).toBeLessThanOrEqual(0);
    await context.close();
  }
});

test("no horizontal overflow at 200% zoom", async ({ browser }) => {
  const { context, page } = await open(browser, { width: 390, height: 900 });
  await page.evaluate(() => { document.body.style.zoom = "2"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await context.close();
});

test("figures keep their intrinsic aspect ratio", async ({ browser }) => {
  const { context, page } = await open(browser);
  const images = page.locator(".ui-figure-media");
  await expect(images).toHaveCount(4);
  const ratios = await images.evaluateAll(nodes => nodes.map(node => {
    const image = node as HTMLImageElement;
    const box = image.getBoundingClientRect();
    return {
      natural: image.naturalWidth / image.naturalHeight,
      rendered: box.width / box.height
    };
  }));
  for (const ratio of ratios) {
    expect(ratio.natural).toBeGreaterThan(0);
    expect(ratio.rendered).toBeGreaterThan(0);
    expect(Math.abs(ratio.natural - ratio.rendered)).toBeLessThan(0.03);
  }
  await context.close();
});

test("long reference URLs wrap inside their items", async ({ browser }) => {
  const { context, page } = await open(browser, { width: 320, height: 900 });
  const widths = await page.locator(".ui-references li").evaluateAll(nodes => nodes.map(node => ({
    scroll: node.scrollWidth,
    client: node.clientWidth
  })));
  expect(widths.length).toBe(2);
  for (const width of widths) {
    expect(width.client).toBeGreaterThan(0);
    expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await context.close();
});

test("native-language names keep their lang attributes and inherited face", async ({ browser }) => {
  const { context, page } = await open(browser);
  const names = await page.locator(".ui-native-name").evaluateAll(nodes => nodes.map(node => {
    const element = node as HTMLElement;
    return {
      lang: element.getAttribute("lang"),
      text: element.textContent?.trim() ?? "",
      family: getComputedStyle(element).fontFamily,
      parentFamily: getComputedStyle(element.parentElement as Element).fontFamily
    };
  }));
  expect(names.map(name => name.lang).sort()).toEqual(["ja", "ko"]);
  for (const name of names) {
    expect(name.text).not.toBe("");
    expect(name.family).toBe(name.parentFamily);
  }
  await context.close();
});

test("the editorial sheet styles nothing outside its classes", async ({ browser }) => {
  const withContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const withPage = await withContext.newPage();
  await withPage.goto("/editorial-static.html");
  await expect(withPage.getByTestId("plain")).toBeVisible();
  const withSheet = await plainSnapshot(withPage);
  await withContext.close();

  const withoutContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const withoutPage = await withoutContext.newPage();
  await withoutPage.route("**/dist/styles/editorial.css", route => route.abort());
  await withoutPage.goto("/editorial-static.html");
  await expect(withoutPage.getByTestId("plain")).toBeVisible();
  const withoutSheet = await plainSnapshot(withoutPage);
  await withoutContext.close();

  expect(withoutSheet).toEqual(withSheet);
});
