import { expect, test } from "vitest";
import { contractsProblems, manifestProblems, packProblems } from "./package.ts";

const build = [
  "package.json",
  "LICENSE",
  "NOTICE",
  "README.md",
  "lib/core/index.js",
  "lib/core/index.d.ts",
  "lib/element/index.js",
  "lib/element/index.d.ts",
];

test("the build, package.json, README.md, LICENSE and NOTICE are what the package takes", () => {
  expect(packProblems(build)).toEqual([]);
});

test("the build may have folders of its own", () => {
  expect(packProblems([...build, "lib/core/map/states.js", "lib/core/map/states.d.ts"])).toEqual(
    [],
  );
});

test("anything else in the package is a problem: sources, tests, checks, a build nested a level deeper", () => {
  expect(
    packProblems([
      ...build,
      "src/core/index.ts",
      "lib/core/index.test.js",
      "lib/core/types.check.d.ts",
      "lib/src/core/index.js",
    ]),
  ).toEqual([
    "npm pack takes src/core/index.ts, which is not part of the build",
    "npm pack takes lib/core/index.test.js, which is not part of the build",
    "npm pack takes lib/core/types.check.d.ts, which is not part of the build",
    "npm pack takes lib/src/core/index.js, which is not part of the build",
  ]);
});

test("a package without its license, its notice or the element's build is a problem", () => {
  expect(packProblems(["package.json", "lib/core/index.js"])).toEqual([
    "npm pack leaves out LICENSE",
    "npm pack leaves out NOTICE",
    "npm pack leaves out lib/element/index.js",
    "npm pack leaves out lib/element/index.d.ts",
  ]);
});

const element = { types: "./lib/element/index.d.ts", default: "./lib/element/index.js" };
const sideEffects = ["./lib/element/index.js", "./src/element/index.ts"];

test("the element is the one entry point, and its registration is the one side effect", () => {
  expect(manifestProblems({ exports: { ".": element }, sideEffects })).toEqual([]);
});

test("the DOM-free part as an entry point, or the element's entry point elsewhere, is a problem", () => {
  expect(
    manifestProblems({
      exports: { ".": { default: "./lib/element/index.js" }, "./core": element },
      sideEffects,
    }),
  ).toEqual([
    "package.json exports ./core, besides the element's",
    `package.json's entry point "." is not ${JSON.stringify(element)}`,
  ]);
});

test("exports that is no object of entry points is one problem, not one per character", () => {
  expect(manifestProblems({ exports: "./lib/element/index.js", sideEffects })).toEqual([
    "package.json's exports is not an object of entry points",
  ]);
  expect(manifestProblems({ sideEffects })).toEqual([
    "package.json's exports is not an object of entry points",
  ]);
});

test("sideEffects that leaves out the entry, or says there are none, is a problem", () => {
  const problem =
    'package.json\'s sideEffects is not ["./lib/element/index.js","./src/element/index.ts"]';
  expect(manifestProblems({ exports: { ".": element }, sideEffects: false })).toEqual([problem]);
  expect(
    manifestProblems({ exports: { ".": element }, sideEffects: ["./lib/element/main.js"] }),
  ).toEqual([problem]);
  expect(
    manifestProblems({ exports: { ".": element }, sideEffects: ["./lib/element/index.js"] }),
  ).toEqual([problem]);
});

test("JavaScript of the build that imports @altnovatrail/contracts is a problem; a declaration or a comment is not", () => {
  const from =
    'import { AnchorSkillHolding } from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";';
  expect(
    contractsProblems([
      {
        path: "lib/core/index.js",
        text: "/** Checked against @altnovatrail/contracts. */\nexport const x = 1;",
      },
      { path: "lib/core/index.d.ts", text: from.replace("import", "import type") },
      { path: "lib/core/a.js", text: from },
      { path: "lib/core/b.js", text: "import '@altnovatrail/contracts';" },
      { path: "lib/core/c.js", text: 'const m = await import("@altnovatrail/contracts/x.js");' },
      { path: "lib/core/d.js", text: 'export { X } from "@altnovatrail/contracts-other";' },
    ]),
  ).toEqual([
    "lib/core/a.js imports @altnovatrail/contracts, whose code app alone ships",
    "lib/core/b.js imports @altnovatrail/contracts, whose code app alone ships",
    "lib/core/c.js imports @altnovatrail/contracts, whose code app alone ships",
  ]);
});
