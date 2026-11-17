// The tests, in three projects (R08 in docs/decisions.md). The DOM-free part and the scripts run in
// Node; the element runs in Chromium, WebKit and Firefox — the three of the toolchain stage of
// .devcontainer/Dockerfile, through Playwright (R79 spec) — and once more with forced colours, a
// mode of the browser's context that only its own file runs in, as canvas does (R10). Each project
// of the element has an instance per engine, named "<project> (<engine>)": ci-test runs Node and
// Chromium with the coverage, and ci-engines WebKit and Firefox without it, since Vitest's v8
// coverage works in Chromium alone (sources 3.8; R25). Each project names its own files: the spec
// submodule beside them has tests of its own, which are not skill-map's.
import { playwright } from "@vitest/browser-playwright";
import { defaultExclude, defineConfig } from "vitest/config";

const FORCED_COLOURS = "src/element/forced-colors.test.ts";

/** The engines the element is tested in (R25). */
const ENGINES = ["chromium", "webkit", "firefox"] as const;

/** A project of the element: its files, those it leaves out, and its browser's context. */
function element(name: string, include: string[], exclude: string[], contextOptions = {}) {
  return {
    test: {
      name,
      include,
      exclude: [...defaultExclude, ...exclude],
      browser: {
        enabled: true,
        provider: playwright({ contextOptions }),
        // Headless whatever CI says: there is no display in the container or on the runner.
        // CI still keeps test.only out of CI, as Vitest's allowOnly does by default.
        headless: true,
        instances: ENGINES.map((browser) => ({ browser, name: `${name} (${browser})` })),
      },
    },
  };
}

export default defineConfig({
  test: {
    // The coverage of the tests, which ci-test asks for by --coverage and .github's TypeScript
    // wrapper sends to Codecov: one lcov report of Node and Chromium, coverage/lcov.info, as the
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
          include: ["src/core/**/*.test.ts", "scripts/**/*.test.ts", "demo/**/*.test.ts"],
          environment: "node",
        },
      },
      element("browser", ["src/element/**/*.test.ts"], [FORCED_COLOURS]),
      // The mode from the start: the page is in it before any test.
      element("forced colors", [FORCED_COLOURS], [], { forcedColors: "active" }),
    ],
  },
});
