import { test, expect } from "@playwright/test";

test("home loads and navigates to shop", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/TTIN|The Time Is Now/i);
  await page.getByRole("link", { name: /shop/i }).first().click();
  await expect(page).toHaveURL(/\/shop/);
});
