import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { GRAPH } from "../core/fair-shares.fixture.js";
import { ICONS, type IconValue } from "./icons.js";
import { button, mount, mounted, settled, shadow, tile, useMap } from "./map.fixture.js";

// How the map looks: an icon beside each state's word, each state's own colours, a chosen skill's
// chain lit and the rest dimmed, targets of 44 by 44 CSS pixels, a map that wraps at 320 CSS pixels,
// the consumer's theme by custom properties, and nothing that moves.

useMap();

/** A computed colour of a node. */
const colour = (node: Element, property: "color" | "background-color" | "border-top-color") =>
  getComputedStyle(node).getPropertyValue(property);

/** The contrast of two colours by WCAG's relative luminance, each as its channels of 0 to 255. */
function contrast(one: readonly number[], other: readonly number[]): number {
  const luminance = (rgb: readonly number[]) => {
    const [r = 0, g = 0, b = 0] = rgb.map((channel) => {
      const c = channel / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(one), luminance(other)].sort((a, b) => b - a) as [
    number,
    number,
  ];
  return (light + 0.05) / (dark + 0.05);
}

/** The value of the icon a node shows, by its paths. */
function iconOf(node: Element | null | undefined): IconValue | undefined {
  const svg = node?.querySelector("svg.icon");
  if (svg === null || svg === undefined) return undefined;
  const d = [...svg.querySelectorAll("path")].map((path) => path.getAttribute("d"));
  return (Object.keys(ICONS) as IconValue[]).find(
    (value) => JSON.stringify(ICONS[value].paths) === JSON.stringify(d),
  );
}

test("the card is as wide as the map at the foot of the window, an anchor skill's too", async () => {
  // A window wider than the frame, so that nothing scrolls sideways.
  await page.viewport(1000, 800);
  const frame = document.createElement("div");
  frame.style.width = "900px";
  document.body.append(frame);
  try {
    await mount({ view: "learner" }, undefined, frame);
    for (const name of ["Multiplication table, Held", "Halves, In progress"]) {
      await userEvent.click(tile(name));
      const map = (shadow().querySelector(".map") as HTMLElement).getBoundingClientRect();
      const card = (shadow().getElementById("details") as HTMLElement).getBoundingClientRect();
      expect(card.left, name).toBeCloseTo(map.left, 0);
      expect(card.right, name).toBeCloseTo(map.right, 0);
      expect(card.bottom, name).toBeLessThanOrEqual(window.innerHeight);
    }
  } finally {
    mounted().remove();
    frame.remove();
    await page.viewport(414, 896);
  }
});

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

test("a chosen skill's chain is lit and every other tile dimmed, opaque, its words 4.5:1 at least", async () => {
  await mount();
  await userEvent.click(tile("Quarters, Locked"));
  const lit = [
    "Count objects, Mastered",
    "Explain how you shared, Feedback by criteria",
    "Halves, In progress",
  ];
  const dim = [
    "Multiplication table, Held",
    "Draw shares, Not assessed",
    "Equal groups, Time to review",
    "Share with a remainder, Ready to start",
  ];
  for (const name of lit) expect(button(name).className, name).toContain("lit");
  for (const name of dim) {
    const node = button(name);
    expect(node.className, name).toContain("dim");
    expect(colour(node, "background-color"), name).toBe("rgb(250, 250, 251)");
    // #6e6e73 on #fafafb.
    expect(colour(node, "color"), name).toBe("rgb(110, 110, 115)");
  }
  expect(contrast([110, 110, 115], [250, 250, 251])).toBeGreaterThanOrEqual(4.5);
  await userEvent.click(page.getByRole("button", { name: "Close" }));
  for (const name of [...lit, ...dim]) expect(button(name).className, name).not.toMatch(/lit|dim/);
});

test("each state has its own fill, and its word 4.5:1 on it at least", async () => {
  await mount();
  const looks: [string, number[], number[]][] = [
    ["Count objects, Mastered", [234, 248, 238], [30, 122, 53]],
    ["Equal groups, Time to review", [255, 244, 229], [178, 80, 0]],
    ["Halves, In progress", [232, 241, 254], [0, 88, 184]],
    ["Share with a remainder, Ready to start", [243, 248, 255], [0, 88, 184]],
    ["Quarters, Locked", [245, 245, 247], [110, 110, 115]],
    ["Explain how you shared, Feedback by criteria", [247, 240, 252], [122, 46, 168]],
    ["Draw shares, Not assessed", [245, 245, 247], [110, 110, 115]],
  ];
  for (const [name, fill, word] of looks) {
    const node = button(name);
    expect(colour(node, "background-color"), name).toBe(`rgb(${fill.join(", ")})`);
    expect(colour(node.querySelector(".word") as Element, "color"), name).toBe(
      `rgb(${word.join(", ")})`,
    );
    expect(contrast(word, fill), name).toBeGreaterThanOrEqual(4.5);
  }
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
    // The card stands in the window, not in the map's frame: as wide as the window at most.
    const card = shadow().getElementById("details") as HTMLElement;
    for (const node of [map, ...shadow().querySelectorAll("*")]) {
      // A word clipped out of sight, there for a chip's name alone, scrolls for no one.
      const hidden = getComputedStyle(node).clipPath !== "none";
      const right = card.contains(node)
        ? document.documentElement.clientWidth
        : frame.getBoundingClientRect().right;
      if (!hidden)
        expect(node.scrollWidth, node.className).toBeLessThanOrEqual(
          node.clientWidth || (card.contains(node) ? right : 320),
        );
      expect(node.getBoundingClientRect().right, node.className).toBeLessThanOrEqual(right + 0.5);
    }
  } finally {
    frame.remove();
  }
});

test("the theme's defaults are light: ink on paper, and the accent on the chosen tile and Practise", async () => {
  await mount();
  const map = shadow().querySelector(".map") as Element;
  expect(colour(map, "color")).toBe("rgb(29, 29, 31)");
  expect(colour(map, "background-color")).toBe("rgb(255, 255, 255)");
  const chosen = button("Share with a remainder, Ready to start");
  await userEvent.click(chosen);
  expect(getComputedStyle(chosen).boxShadow).toContain("rgb(29, 78, 216)");
  const practise = page.getByRole("button", { name: "Practise" }).element();
  expect(colour(practise, "background-color")).toBe("rgb(29, 78, 216)");
  expect(colour(practise, "color")).toBe("rgb(255, 255, 255)");
  expect(colour(shadow().getElementById("details") as Element, "background-color")).toBe(
    "rgb(255, 255, 255)",
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
    const map = shadow().querySelector(".map") as Element;
    expect(colour(map, "color")).toBe("rgb(240, 240, 240)");
    expect(colour(map, "background-color")).toBe("rgb(10, 20, 30)");
    // A tile stands on its state's own fill, and keeps its own text whatever the ink.
    const quarters = button("Quarters, Locked");
    expect(colour(quarters, "color")).toBe("rgb(29, 29, 31)");
    await userEvent.click(quarters);
    expect(getComputedStyle(quarters).boxShadow).toContain("rgb(250, 200, 0)");
    expect(colour(shadow().getElementById("details") as Element, "background-color")).toBe(
      "rgb(10, 20, 30)",
    );
    theme.style.setProperty("--novatrail-skill-map-ink", "not a colour");
    theme.style.color = "rgb(0, 128, 0)";
    expect(colour(map, "color")).toBe("rgb(0, 128, 0)");
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
