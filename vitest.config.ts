// The tests, in two projects (R08 in docs/decisions.md). The DOM-free part and the scripts run in
// Node; the element runs in Chromium — Chrome Headless Shell from the toolchain stage of
// .devcontainer/Dockerfile, through Playwright (R79 spec). Each project names its own files: the
// spec submodule beside them has tests of its own, which are not skill-map's.
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The coverage of the tests, which ci-test asks for by --coverage and .github's TypeScript
    // wrapper sends to Codecov: one lcov report of both projects, coverage/lcov.info, as the
    // wrapper takes it. V8 counts it, in Node and in Chromium alike. What it covers is the
    // package's code alone, every module of it, those no test loads too, at zero: the scripts
    // check the package after the tests.
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.fixture.ts", "**/*.check.ts"],
      reporter: ["lcovonly", "text-summary"],
    },
    projects: [
      {
        test: {
          name: "node",
          include: ["src/core/**/*.test.ts", "scripts/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/element/**/*.test.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            // Headless whatever CI says: there is no display in the container or on the runner.
            // CI still keeps test.only out of CI, as Vitest's allowOnly does by default.
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
