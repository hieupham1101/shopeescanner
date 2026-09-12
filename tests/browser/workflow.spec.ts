import { test, expect } from "@playwright/test";
import * as XLSX from "xlsx";
import { createRequire } from "node:module";
const fixture = () => {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet([
      [
        "Mã đơn hàng",
        "Trạng Thái Đơn Hàng",
        "Lý do hủy",
        "Mã vận đơn",
        "Đơn Vị Vận Chuyển",
        "Ngày gửi hàng",
        "Thời gian giao hàng",
      ],
      [
        "ORDER1",
        "Chờ giao hàng",
        "",
        "SPX000001",
        "SPX Express",
        "11/09/2026",
        "",
      ],
      [
        "ORDER2",
        "Đã hủy",
        "Buyer cancelled",
        "SPX000002",
        "SPX Express",
        "",
        "",
      ],
      ["ORDER3", "Đang giao", "", "SPX000003", "GHN", "", "11/09/2026 08:30"],
      ["ORDER4", "Chờ giao hàng", "", "000004", "SPX Express", "", ""],
    ]),
    "Orders",
  );
  return {
    name: "Order.all.20260911_20260911.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: XLSX.write(book, { type: "buffer", bookType: "xlsx" }),
  };
};
test("import, USB, all statuses, reload, history choices, settings and offline", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Import Shopee Excel/ }),
  ).toBeEnabled();
  await page.screenshot({
    path: "tests/artifacts/desktop.png",
    fullPage: true,
  });
  await page.locator("input[type=file]").setInputFiles(fixture());
  await expect(page.getByText("DATA LOADED")).toBeVisible();
  await page.locator("body").click({ position: { x: 10, y: 100 } });
  await page.keyboard.type("SPX000001");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("status").getByText("OK to hand over"),
  ).toBeVisible();
  await page.keyboard.type("SPX000001");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("status").getByText("Duplicate parcel"),
  ).toBeVisible();
  await expect(
    page.getByRole("status").getByText(/Scan count: 2/),
  ).toBeVisible();
  for (const [code, title] of [
    ["SPX000002", "Order cancelled"],
    ["SPX000003", "Already picked up"],
    ["MISSING", "Order not found"],
  ]) {
    await page.keyboard.type(code);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status").getByText(title)).toBeVisible();
  }
  await page.reload();
  await expect(page.getByText("DATA LOADED")).toBeVisible();
  await page.getByLabel("Manual entry").fill("SPX000001");
  await page.getByLabel("Manual entry").press("Enter");
  await expect(
    page.getByRole("status").getByText("Duplicate parcel"),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("switch").click();
  await expect(page.getByRole("switch")).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await page.keyboard.press("Escape");
  await page.locator("input[type=file]").setInputFiles(fixture());
  await page
    .getByRole("button", { name: /Keep existing scan history/ })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByLabel("Manual entry").fill("SPX000001");
  await page.getByLabel("Manual entry").press("Enter");
  await expect(
    page.getByRole("status").getByText("Duplicate parcel"),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /View all history/ }).click();
  await expect(page.getByText("Complete scan history")).toBeVisible();
  await page
    .getByRole("button", { name: "Reset scan history", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete history and start fresh" })
    .click();
  await expect(page.getByText("Your checks will appear here")).toBeVisible();
  await page
    .getByRole("button", { name: "Scanning station", exact: true })
    .click();
  await page.getByLabel("Manual entry").fill("SPX000001");
  await page.getByLabel("Manual entry").press("Enter");
  await expect(
    page.getByRole("status").getByText("OK to hand over"),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("DATA LOADED")).toBeVisible();
  await page.getByLabel("Manual entry").fill("SPX000001");
  await page.getByLabel("Manual entry").press("Enter");
  await expect(
    page.getByRole("status").getByText("Duplicate parcel"),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile layout, import failure, camera denial and sound tests", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async () => {
        throw new DOMException("Permission denied", "NotAllowedError");
      },
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Import Shopee Excel/ }),
  ).toBeEnabled();
  await page.screenshot({ path: "tests/artifacts/mobile.png", fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const bad = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    bad,
    XLSX.utils.aoa_to_sheet([["Wrong header"], ["x"]]),
  );
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.xlsx",
    mimeType: fixture().mimeType,
    buffer: XLSX.write(bad, { type: "buffer", bookType: "xlsx" }),
  });
  await expect(page.locator(".error-banner")).toContainText(
    "tracking-code column was not found",
  );
  await page.locator("input[type=file]").setInputFiles(fixture());
  await expect(page.getByText("DATA LOADED")).toBeVisible();
  await page.getByRole("button", { name: "Use camera", exact: true }).click();
  await expect(page.getByText(/Camera unavailable/)).toBeVisible();
  await page.getByRole("button", { name: /Test scanner sounds/ }).click();
  await page.getByRole("button", { name: "Test OK Sound" }).click();
  await page.getByRole("button", { name: "Test Error Sound" }).click();
  await page.keyboard.press("Escape");
});

test("ZXing camera fallback decodes a QR video stream without frame duplicates", async ({
  page,
}) => {
  const { QRCodeWriter, BarcodeFormat } = createRequire(import.meta.url)(
    "@zxing/library",
  ) as typeof import("@zxing/library");
  const matrix = new QRCodeWriter().encode(
    "SPX000001",
    BarcodeFormat.QR_CODE,
    320,
    320,
    new Map(),
  );
  const pixels: number[][] = Array.from({ length: 320 }, (_, y) =>
    Array.from({ length: 320 }, (_, x) => (matrix.get(x, y) ? 1 : 0)),
  );
  await page.addInitScript(
    ({ pixels }) => {
      Object.defineProperty(window, "BarcodeDetector", {
        value: undefined,
        configurable: true,
      });
      Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
        value: async () => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 320;
          const ctx = canvas.getContext("2d")!;
          const draw = () => {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, 320, 320);
            ctx.fillStyle = "black";
            for (let y = 0; y < 320; y++)
              for (let x = 0; x < 320; x++)
                if (pixels[y][x]) ctx.fillRect(x, y, 1, 1);
          };
          draw();
          setInterval(draw, 100);
          return canvas.captureStream(10);
        },
      });
    },
    { pixels },
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Import Shopee Excel/ }),
  ).toBeEnabled();
  await page.locator("input[type=file]").setInputFiles(fixture());
  await expect(page.getByText("DATA LOADED")).toBeVisible();
  await page.getByRole("button", { name: "Use camera", exact: true }).click();
  await expect(
    page.getByRole("status").getByText("OK to hand over"),
  ).toBeVisible();
  await expect(page.getByRole("status")).not.toBeVisible({ timeout: 5000 });
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator(".stat-DUPLICATE strong")).toHaveText("0");
  await page.getByRole("button", { name: "Stop camera", exact: true }).click();
});
