import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { pinned, render, TARGET, titlesOf } from "./taxonomy.ts";

const SHA = "0".repeat(64);

test("the titles are each branch's const and title, by ID in code units", () => {
  expect(
    titlesOf({
      oneOf: [
        { const: "core.b", title: "B", description: "…" },
        { const: "core.a", title: "A" },
        { const: "core.B", title: "Capital B" },
      ],
    }),
  ).toEqual([
    ["core.B", "Capital B"],
    ["core.a", "A"],
    ["core.b", "B"],
  ]);
});

test("a schema without branches, or a branch without a const and a title of strings, is refused", () => {
  expect(() => titlesOf({})).toThrow("no branches of oneOf");
  expect(() => titlesOf({ oneOf: [] })).toThrow("no branches of oneOf");
  expect(() => titlesOf({ oneOf: [{ const: "core.a" }] })).toThrow("no const and title");
  expect(() => titlesOf({ oneOf: [{ const: 1, title: "A" }] })).toThrow("no const and title");
});

test("the source names the release, the file and its digest, and quotes each title", () => {
  const source = render(SHA, [["core.a", 'Say "hi"']]);
  expect(source).toContain('release: "spec v0.16.3",');
  expect(source).toContain('file: "format-0.4.tar.gz",');
  expect(source).toContain(`sha256: "${SHA}",`);
  expect(source).toContain('  "core.a": "Say \\"hi\\"",');
  expect(pinned(source)).toBe(SHA);
});

test("a source without a digest pins none", () => {
  expect(pinned("export const SOURCE = {};")).toBeUndefined();
});

test("the titles in the package are what render writes for their own digest", () => {
  const source = readFileSync(TARGET, "utf8");
  const sha = pinned(source);
  expect(sha).toMatch(/^[0-9a-f]{64}$/);
  const titles = [...source.matchAll(/^ {2}("core\.[^"]+"): (".*"),$/gm)].map(
    ([, id, title]) => [JSON.parse(id ?? ""), JSON.parse(title ?? "")] as [string, string],
  );
  expect(render(sha ?? "", titles)).toBe(source);
});
