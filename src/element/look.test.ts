import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { GRAPH } from "../core/fair-shares.fixture.js";
import { ICONS, type IconValue } from "./icons.js";
import { button, mount, mounted, settled, shadow, tile, useMap } from "./map.fixture.js";

// How the map looks (R90 spec, R78 spec; R10 in docs/decisions.md): an icon beside each state's
// word, targets of 44 by 44 CSS pixels, a map that wraps at 320 CSS pixels, the consumer's theme
// by custom properties, and nothing that moves.

useMap();

/** The value of the icon a node shows, by its paths. */
function iconOf(node: Element | null | undefined): IconValue | undefined {
  const svg = node?.querySelector("svg.icon");
  if (svg === null || svg === undefined) return undefined;
  const d = [...svg.querySelectorAll("path")].map((path) => path.getAttribute("d"));
  return (Object.keys(ICONS) as IconValue[]).find(
    (value) => JSON.stringify(ICONS[value].paths) === JSON.stringify(d),
  );
}

test("each state, mark and holding has its own icon beside its word, hidden from the tree of accessibility", async () => {
  await mount();
  const shown: [string, IconValue][] = [
    ["Multiplication table, Held", "held"],
    ["Count objects, Mastered", "mastered"],
    ["Draw shares, Not assessed", "none"],
    ["Equal groups, Time to review", "review"],
    ["Explain how you shared, Feedback by criteria", "rubric"],
    ["Halves, In progress", "practising"],
    ["Share with a remainder, Ready to start", "ready"],
    ["Quarters, Locked", "locked"],
  ];
  for (const [name, value] of shown) expect(iconOf(button(name)), name).toBe(value);
  for (const svg of shadow().querySelectorAll("svg")) {
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.querySelector("title")).toBeNull();
    expect(svg.hasAttribute("style")).toBe(false);
  }
  await userEvent.click(tile("Quarters, Locked"));
  expect(iconOf(shadow().getElementById("details"))).toBe("locked");
});

test("an anchor skill's holding has its icon in its own details and where a skill teaches it", async () => {
  await mount();
  await userEvent.click(tile("Multiplication table, Held"));
  expect(iconOf(shadow().getElementById("details"))).toBe("held");
  await userEvent.click(tile("Halves, In progress"));
  const taught = [...(shadow().getElementById("details")?.querySelectorAll("li") ?? [])].find(
    (item) => item.textContent?.startsWith("Fractions of a whole"),
  );
  expect(iconOf(taught)).toBe("not-held");
});

test("a locked tile linked to the expanded one keeps its dashed frame, in the accent", async () => {
  await mount();
  await userEvent.click(tile("Halves, In progress"));
  const quarters = button("Quarters, Locked, opens after");
  expect(getComputedStyle(quarters).borderTopStyle).toBe("dashed");
  expect(getComputedStyle(quarters).borderTopWidth).toBe("2px");
  expect(getComputedStyle(quarters).borderTopColor).toBe("rgb(29, 78, 216)");
});

test("without state, a skill of verdict has no icon, and the marks keep theirs", async () => {
  await mount({ view: "learner" }, null);
  expect(iconOf(button("Quarters"))).toBeUndefined();
  expect(iconOf(button("Draw shares, Not assessed"))).toBe("none");
});

test("every button is 44 by 44 CSS pixels at least", async () => {
  await mount();
  await userEvent.click(tile("Share with a remainder, Ready to start"));
  const buttons = [...shadow().querySelectorAll("button")];
  expect(buttons.map((node) => node.textContent)).toContain("Practise");
  for (const node of buttons) {
    const { width, height } = node.getBoundingClientRect();
    expect(width, node.textContent ?? "").toBeGreaterThanOrEqual(44);
    expect(height, node.textContent ?? "").toBeGreaterThanOrEqual(44);
  }
});

test("at 320 CSS pixels nothing scrolls sideways, a long title without spaces too", async () => {
  const frame = document.createElement("div");
  frame.style.width = "320px";
  document.body.append(frame);
  try {
    const map = await mount({ view: "adult" }, undefined, frame);
    map.graph = {
      ...GRAPH,
      skills: { ...GRAPH.skills, quarters: { ...GRAPH.skills.quarters, title: "Q".repeat(120) } },
    } as typeof GRAPH;
    await settled();
    await userEvent.click(tile("Count objects, Mastered"));
    await userEvent.click(button(`${"Q".repeat(120)}, Locked`));
    for (const node of [map, ...shadow().querySelectorAll("*")]) {
      expect(node.scrollWidth, node.className).toBeLessThanOrEqual(node.clientWidth || 320);
      expect(node.getBoundingClientRect().right).toBeLessThanOrEqual(
        frame.getBoundingClientRect().right + 0.5,
      );
    }
  } finally {
    frame.remove();
  }
});

/** A computed colour of a node. */
const colour = (node: Element, property: "color" | "background-color" | "border-top-color") =>
  getComputedStyle(node).getPropertyValue(property);

test("the theme's defaults are light: ink on paper, and the accent on the expanded tile", async () => {
  await mount();
  const quarters = button("Quarters, Locked");
  expect(colour(quarters, "color")).toBe("rgb(17, 17, 17)");
  expect(colour(quarters, "background-color")).toBe("rgb(255, 255, 255)");
  expect(getComputedStyle(quarters).borderTopStyle).toBe("dashed");
  await userEvent.click(quarters);
  expect(colour(quarters, "background-color")).toBe("rgb(29, 78, 216)");
  expect(colour(quarters, "color")).toBe("rgb(255, 255, 255)");
  expect(colour(button("Halves, In progress, needed before"), "border-top-color")).toBe(
    "rgb(29, 78, 216)",
  );
});

test("the consumer's custom properties reach the shadow tree, and a value that is no colour gives none", async () => {
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-skill-map-paper", "rgb(10, 20, 30)");
  theme.style.setProperty("--novatrail-skill-map-ink", "rgb(240, 240, 240)");
  theme.style.setProperty("--novatrail-skill-map-accent", "rgb(250, 200, 0)");
  document.body.append(theme);
  try {
    await mount({ view: "learner" }, undefined, theme);
    const quarters = button("Quarters, Locked");
    expect(colour(quarters, "color")).toBe("rgb(240, 240, 240)");
    expect(colour(quarters, "background-color")).toBe("rgb(10, 20, 30)");
    await userEvent.click(quarters);
    expect(colour(quarters, "background-color")).toBe("rgb(250, 200, 0)");
    theme.style.setProperty("--novatrail-skill-map-ink", "not a colour");
    theme.style.color = "rgb(0, 128, 0)";
    expect(colour(button("Count objects, Mastered"), "color")).toBe("rgb(0, 128, 0)");
  } finally {
    mounted().remove();
    theme.remove();
  }
});

test("nothing moves: expanding runs no transition and no animation", async () => {
  await mount();
  await userEvent.click(tile("Quarters, Locked"));
  expect(shadow().getAnimations()).toEqual([]);
  for (const node of shadow().querySelectorAll("*")) {
    expect(getComputedStyle(node).transitionDuration).toBe("0s");
    expect(getComputedStyle(node).animationName).toBe("none");
  }
});

test("the focus has a ring of the accent, outside the tile", async () => {
  await mount();
  await userEvent.click(tile("Quarters, Locked"));
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  const focused = shadow().activeElement as HTMLElement;
  expect(focused.matches(":focus-visible")).toBe(true);
  const style = getComputedStyle(focused);
  expect(style.outlineStyle).toBe("solid");
  expect(style.outlineWidth).toBe("3px");
  expect(style.outlineColor).toBe("rgb(29, 78, 216)");
});
