import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  use: {
    baseURL: "http://localhost:3100",
    browserName: "chromium",
    launchOptions: { channel: "chrome" },
  },
  workers: 1,
  timeout: 30000,
});
