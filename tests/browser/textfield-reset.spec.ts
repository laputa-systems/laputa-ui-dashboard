import { expect, test } from "@playwright/test";

test("controlled text fields retain the parent value on form reset", async ({ page }) => {
  await page.goto("/text-field-reset.html");
  const field = page.getByRole("textbox", { name: "Controlled" });
  await page.getByRole("button", { name: "Update" }).click();
  await expect(field).toHaveValue("parent");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(field).toHaveValue("parent");
  await expect(page.getByTestId("calls")).toHaveText("0");
});
