import { defineConfig } from "@playwright/test";
export default defineConfig({
  webServer: { command: "npm run build && npm run start -- -p 3102", url: "http://localhost:3102", reuseExistingServer: true, timeout: 120000 },
  testDir: "./tests/browser",
  testMatch: "install.spec.ts",
  use: { baseURL: "http://localhost:3102", browserName: "chromium", launchOptions: { channel: "chrome" } },
});
