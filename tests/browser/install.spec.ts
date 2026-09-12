import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/pack-check**", route => route.fulfill({
    json: route.request().url().includes("view=history") ? [] : {
      counters: { ACCEPTED: 0, DUPLICATE: 0, CANCELLED: 0, PICKED_UP: 0, UNKNOWN: 0 },
      revision: "1",
    },
  }));
});

test("Vietnamese mobile interface and installation guidance", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.getByRole("button", { name: /Nhập Excel Shopee/ })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Thêm vào màn hình chính" }).click();
  await expect(page.getByRole("dialog")).toContainText("iPhone / iPad");
  await expect(page.getByRole("dialog")).toContainText("Android");
  const bounds = await page.getByRole("dialog").boundingBox();
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "tests/artifacts/install-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Đóng hộp thoại" }).click();
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, {
      prompt: async () => { document.documentElement.dataset.prompted = "yes"; },
      userChoice: Promise.resolve({ outcome: "accepted" }),
    });
    window.dispatchEvent(event);
  });
  await page.getByRole("button", { name: "Thêm vào màn hình chính" }).click();
  await page.getByRole("button", { name: "Cài ứng dụng", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-prompted", "yes");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(page.getByRole("button", { name: "Thêm vào màn hình chính" })).not.toBeVisible();
});
