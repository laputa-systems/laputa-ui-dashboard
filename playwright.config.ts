import { defineConfig } from "@playwright/test";

const port = 4319;

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "./.work/tmp/playwright",
  fullyParallel: true,
  use: { baseURL: `http://127.0.0.1:${port}`, browserName: "chromium", trace: "off" },
  webServer: {
    command: `vite --config fixture/vite.config.ts --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 20_000
  }
});
