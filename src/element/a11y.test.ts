import axe from "axe-core";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { mount, mounted, tile, useMap } from "./map.fixture.js";

// The map checked by axe-core against WCAG 2.2 A and AA, the standard of the packages of the
// interface (R90 spec; R10 in docs/decisions.md), on each view and in each language, with the
// default theme. axe goes into the open shadow tree. What the package does not meet yet it would
// declare in docs/architecture.md, section 3.8, and name here by the rule's ID: there is none.

useMap();

// axe has no rule of its own for WCAG 2.2 A: its rules of 2.2 AA are target-size alone.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
/** The rules whose violations the package declares, by ID: none. */
const DECLARED: readonly string[] = [];

/** The violations axe finds on the map, each as its rule's ID and the nodes it names. */
async function violations(): Promise<string[]> {
  const results = await axe.run(mounted(), { runOnly: { type: "tag", values: TAGS } });
  return results.violations
    .filter((violation) => !DECLARED.includes(violation.id))
    .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(" | ")}`);
}

const VIEWS: [string, Readonly<Record<string, string>>, boolean, string[]][] = [
  ["the learner's view", { view: "learner" }, true, []],
  ["a locked skill expanded", { view: "learner" }, true, ["Quarters, Locked"]],
  ["an open skill expanded", { view: "learner" }, true, ["Share with a remainder, Ready to start"]],
  ["an anchor skill expanded", { view: "learner" }, true, ["Multiplication table, Held"]],
  ["the adult's view", { view: "adult" }, true, ["Count objects, Mastered"]],
  ["no view", {}, true, ["Halves, In progress"]],
  ["no state", { view: "learner" }, false, ["Quarters"]],
  ["Russian", { view: "learner", lang: "ru" }, true, ["Quarters, Ещё закрыт"]],
  ["Russian, the adult's view", { view: "adult", lang: "ru" }, true, ["Count objects, Освоено"]],
];

for (const [name, attributes, withState, clicks] of VIEWS) {
  test(`axe finds no violation of WCAG 2.2 AA: ${name}`, async () => {
    await mount(attributes, withState ? undefined : null);
    for (const click of clicks) await userEvent.click(tile(click));
    expect(await violations()).toEqual([]);
  });
}

test("axe finds the contrast a theme breaks: the check means something", async () => {
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-skill-map-ink", "#bbb");
  document.body.append(theme);
  try {
    await mount({ view: "learner" }, undefined, theme);
    expect((await violations()).some((found) => found.startsWith("color-contrast:"))).toBe(true);
  } finally {
    mounted().remove();
    theme.remove();
  }
});
