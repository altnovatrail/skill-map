import { readFileSync } from "node:fs";
import { icons } from "@iconify-json/material-symbols";
import { expect, test } from "vitest";
import { differences, drawn, type IconSet, MODULE, module, notice, TABLE } from "./icons.ts";

/** A set of its own: two icons, one of them two paths, an alias, and an icon of a circle. */
const SET: IconSet = {
  prefix: "test",
  width: 24,
  height: 24,
  icons: {
    "a-rounded": { body: '<path fill="currentColor" d="M0 0h1"/>' },
    "a-outline-rounded": {
      body: '<path fill="currentColor" d="M1 1h1"/><path fill="currentColor" d="M2 2h1"/>',
    },
    "b-outline-rounded": { body: '<circle cx="12" cy="12" r="1"/>' },
  },
  aliases: { "c-outline-rounded": { parent: "a-rounded" } },
};

test("an icon is its view box and its filled paths, and an alias's those of the icon it names", () => {
  expect(drawn(SET, "a-outline-rounded")).toEqual({
    viewBox: "0 0 24 24",
    paths: ["M1 1h1", "M2 2h1"],
  });
  expect(drawn(SET, "c-outline-rounded")).toEqual({ viewBox: "0 0 24 24", paths: ["M0 0h1"] });
});

test("a name the set does not have, or an icon of anything but filled paths, stops the script", () => {
  expect(() => drawn(SET, "z-outline-rounded")).toThrow("has no icon z-outline-rounded");
  expect(() => drawn(SET, "b-outline-rounded")).toThrow("is not filled paths alone");
});

test("the module holds each value's icon in outline, by the value, with its name in the set", () => {
  const text = module(SET, "9.9.9", { locked: "a", "not-held": "c" });
  expect(text).toContain("from @iconify-json/material-symbols 9.9.9:");
  expect(text).toContain(
    '"locked": {"name":"a-outline-rounded","viewBox":"0 0 24 24","paths":["M1 1h1","M2 2h1"]},',
  );
  expect(text).toContain(
    '"not-held": {"name":"c-outline-rounded","viewBox":"0 0 24 24","paths":["M0 0h1"]},',
  );
  expect(text).not.toContain("a-rounded");
});

test("the set package-lock.json pins has every icon of the table, as filled paths", () => {
  for (const [value, base] of Object.entries(TABLE)) {
    expect(() => module(icons, "pinned", { [value]: base }), value).not.toThrow();
  }
});

test("no two values share an icon, and none takes an icon of the table of architecture 6 of spec", () => {
  const bases = Object.values(TABLE);
  expect(new Set(bases).size).toBe(bases.length);
  // The bases the table of architecture 6 of spec names, at v0.9.5 (R78 spec): the tests read
  // nothing of spec/, which CI checks out for the licenses alone.
  const shared = [
    "ink-pen",
    "ink-eraser",
    "undo",
    "delete-sweep",
    "arrow-upward",
    "arrow-downward",
    "arrow-forward",
    "keyboard-arrow-down",
    "keyboard-arrow-right",
    "touch-app",
  ];
  for (const base of bases) expect(shared).not.toContain(base);
});

test("the module in the package names each value of the table", () => {
  const text = readFileSync(MODULE, "utf8");
  for (const [value, base] of Object.entries(TABLE)) {
    expect(text).toContain(`name: "${base}-outline-rounded"`);
    expect(text, value).toMatch(new RegExp(`^ {2}"?${value}"?: \\{`, "m"));
  }
});

test("the check names each file that is not what the script writes, a missing one too", () => {
  const there: Record<string, string> = { "src/element/icons.ts": "same" };
  expect(
    differences({ "src/element/icons.ts": "same", NOTICE: "notice" }, (path) => there[path]),
  ).toEqual(["icons: NOTICE is not what scripts/icons.ts writes; run just icons"]);
  there.NOTICE = "edited by hand";
  expect(differences({ NOTICE: "notice" }, (path) => there[path])).toHaveLength(1);
});

test("NOTICE names the set, its author, its license and where it is, and the version embedded", () => {
  const text = notice("1.2.3");
  for (const part of [
    "@altnovatrail/skill-map",
    "Material Symbols",
    "Google",
    "Apache License, Version 2.0",
    "https://github.com/google/material-design-icons",
    "@iconify-json/material-symbols 1.2.3",
  ]) {
    expect(text).toContain(part);
  }
});
