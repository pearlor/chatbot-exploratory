import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Without this file Vitest falls back to vite.config.ts and its default include
// (`**/*.{test,spec}.?(c|m)[jt]s?(x)`), which matches the Playwright specs in
// /tests and fails on the first `@playwright/test` import. Unit tests live in
// src; end-to-end tests are Playwright's job.
//
// Merged with the app's Vite config so component tests get the React and
// Tailwind plugins. Vite itself never reads this file, so `npm run dev` and
// Playwright's webServer are unaffected.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      exclude: ["node_modules", "dist", "tests"],
    },
  }),
);
