import { defineConfig, devices } from '@playwright/test'

// Playwright config for Phase-2 rival-overlay smoke tests.
// Assumes the backend is running at :8000 and the frontend dev server at :3000.
// `webServer` auto-starts the Vite dev server; the backend must be up already.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --port 3000 --strictPort',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
