import type { SkillGraph } from "@altnovatrail/spec/formatv0/open";
import { describe, expect, test } from "vitest";
import { GRAPH, TIERS } from "./fair-shares.fixture.js";
import { type Band, focusAfter, layout, linksOf } from "./layout.js";

/** Each band's heading, as the core gives it, and its tiles in order. */
function rows(bands: readonly Band[]) {
  return bands.map((band) =>
    band.kind === "anchors"
      ? { band: "anchors", skills: band.skills }
      : { band: band.tier, name: band.name, skills: band.skills },
  );
}

describe("example/fair-shares, as in the table of section 3.4 of docs/architecture.md", () => {
  const map = layout(GRAPH, TIERS);

  test("the bands and the order of their tiles are the table's", () => {
    expect(rows(map.bands)).toEqual([
      // Only prerequisites, by ID: the anchor skills taught alone stand in no band.
      { band: "anchors", skills: ["core.multiplication-table"] },
      // Tier 1, by ID.
      { band: 1, name: "Counting", skills: ["count-objects", "draw-shares"] },
      // All three build on count-objects alone, at place 0: a tie, by ID.
      { band: 2, name: "Sharing", skills: ["equal-groups", "explain-sharing", "halves"] },
      // share-with-remainder: equal-groups, 0, the anchor skill giving no place; quarters: halves
      // and explain-sharing, (2 + 1) / 2 = 1.5. Tier 3 has no name: its number alone.
      { band: 3, name: null, skills: ["share-with-remainder", "quarters"] },
    ]);
  });

  test("each tile knows its band and place", () => {
    expect(map.places.get("core.multiplication-table")).toEqual({ band: 0, index: 0 });
    expect(map.places.get("halves")).toEqual({ band: 2, index: 2 });
    expect(map.places.get("quarters")).toEqual({ band: 3, index: 1 });
    expect(map.places.has("core.fractions-of-a-whole")).toBe(false);
  });

  test("quarters, expanded, builds on halves and explain-sharing and opens nothing", () => {
    expect(linksOf(GRAPH, map, "quarters")).toEqual({
      buildsOn: ["explain-sharing", "halves"],
      opens: [],
      teaches: [],
    });
  });

  test("share-with-remainder builds on the anchor skill's band first, then on equal-groups", () => {
    expect(linksOf(GRAPH, map, "share-with-remainder")).toEqual({
      buildsOn: ["core.multiplication-table", "equal-groups"],
      opens: [],
      teaches: [],
    });
  });

  test("count-objects opens equal-groups, explain-sharing and halves, in the order of their band", () => {
    expect(linksOf(GRAPH, map, "count-objects")).toEqual({
      buildsOn: [],
      opens: ["equal-groups", "explain-sharing", "halves"],
      teaches: [],
    });
  });

  test("a skill names the anchor skills it teaches; an anchor skill, the skills that need it", () => {
    expect(linksOf(GRAPH, map, "halves").teaches).toEqual(["core.fractions-of-a-whole"]);
    expect(linksOf(GRAPH, map, "core.multiplication-table")).toEqual({
      buildsOn: [],
      opens: ["share-with-remainder"],
      teaches: [],
    });
  });

  test("neither the order of the skills in the graph nor anything but the graph and tiers moves a tile", () => {
    const reversed: SkillGraph = {
      ...GRAPH,
      skills: Object.fromEntries(Object.entries(GRAPH.skills).reverse()),
    };
    expect(layout(reversed, TIERS).bands).toEqual(map.bands);
  });
});

test("a sequential module has a skill in each band, by the same rule", () => {
  const graph: SkillGraph = {
    tiers: ["Letters"],
    skills: {
      c: { title: "C", assessability: "verdict", prerequisites: ["b"] },
      a: { title: "A", assessability: "verdict" },
      b: { title: "B", assessability: "rubric", prerequisites: ["a"] },
    },
  };
  expect(rows(layout(graph, { a: 1, b: 2, c: 3 }).bands)).toEqual([
    { band: 1, name: "Letters", skills: ["a"] },
    { band: 2, name: null, skills: ["b"] },
    { band: 3, name: null, skills: ["c"] },
  ]);
});

test("a module without anchor skills has no band of them, and names past the last tier make no band", () => {
  const graph: SkillGraph = {
    tiers: ["One", "Two", "Three"],
    skills: {
      a: { title: "A", assessability: "verdict" },
      b: {
        title: "B",
        assessability: "verdict",
        prerequisites: ["a"],
        teaches: ["core.fractions-of-a-whole"],
      },
    },
  };
  expect(rows(layout(graph, { a: 1, b: 2 }).bands)).toEqual([
    { band: 1, name: "One", skills: ["a"] },
    { band: 2, name: "Two", skills: ["b"] },
  ]);
});

test("IDs compare by code units, and the mean of places orders a band before the IDs do", () => {
  const graph: SkillGraph = {
    skills: {
      b: { title: "b", assessability: "verdict" },
      a: { title: "a", assessability: "verdict" },
      B: { title: "B", assessability: "verdict" },
      // Mean of a (1) and b (2): 1.5.
      x: { title: "x", assessability: "verdict", prerequisites: ["a", "b"] },
      // Mean of B (0): 0, before x though its ID comes after.
      y: { title: "y", assessability: "verdict", prerequisites: ["B", "core.z", "core.Z"] },
    },
  };
  const map = layout(graph, { a: 1, b: 1, B: 1, x: 2, y: 2 });
  expect(rows(map.bands)).toEqual([
    { band: "anchors", skills: ["core.Z", "core.z"] },
    { band: 1, name: null, skills: ["B", "a", "b"] },
    { band: 2, name: null, skills: ["y", "x"] },
  ]);
});

test("a skill with no tier stands in no band, nor do the anchor skills only it needs, and one past tier 1 with no prerequisite of the module goes last", () => {
  const graph: SkillGraph = {
    skills: {
      a: { title: "A", assessability: "verdict" },
      lone: { title: "Lone", assessability: "verdict" },
      b: { title: "B", assessability: "verdict", prerequisites: ["a"] },
      none: { title: "None", assessability: "verdict", prerequisites: ["core.z"] },
      half: { title: "Half", assessability: "verdict" },
      zero: { title: "Zero", assessability: "verdict" },
      inherited: { title: "Inherited", assessability: "verdict" },
    },
  };
  // The tiers' own entries count, not one their prototype would give.
  const tiers: Record<string, number> = Object.assign(Object.create({ inherited: 1 }), {
    a: 1,
    lone: 2,
    b: 2,
    half: 1.5,
    zero: 0,
    gone: 1,
  });
  const map = layout(graph, tiers);
  expect(rows(map.bands)).toEqual([
    { band: 1, name: null, skills: ["a"] },
    { band: 2, name: null, skills: ["b", "lone"] },
  ]);
  // A link goes only to a tile of the map.
  expect(linksOf(graph, map, "a").opens).toEqual(["b"]);
  expect(linksOf(graph, map, "none").buildsOn).toEqual([]);
});

test("a skill the graph does not have has no links", () => {
  expect(linksOf(GRAPH, layout(GRAPH, TIERS), "unknown")).toEqual({
    buildsOn: [],
    opens: [],
    teaches: [],
  });
});

describe("where the focus goes when its node is gone with new data", () => {
  const before = layout(GRAPH, TIERS);
  // The graph of a later version without some skills, and without the links to them.
  const without = (...gone: string[]): SkillGraph => ({
    ...GRAPH,
    skills: Object.fromEntries(
      Object.entries(GRAPH.skills)
        .filter(([id]) => !gone.includes(id))
        .map(([id, skill]) => [
          id,
          { ...skill, prerequisites: (skill.prerequisites ?? []).filter((p) => !gone.includes(p)) },
        ]),
    ),
  });

  test("to the tile of the same skill, while it is on the map: «ждёт» replaced «Заниматься»", () => {
    expect(focusAfter(before, before, "halves")).toBe("halves");
  });

  test("without it, to the first tile of the band it stood in", () => {
    expect(focusAfter(before, layout(without("halves"), TIERS), "halves")).toBe("equal-groups");
    expect(focusAfter(before, layout(without("equal-groups"), TIERS), "equal-groups")).toBe(
      "explain-sharing",
    );
  });

  test("without that band, to the first tile of the map", () => {
    // Without share-with-remainder no skill needs the anchor skill: its band is gone too.
    const after = layout(without("share-with-remainder", "quarters"), TIERS);
    expect(focusAfter(before, after, "quarters")).toBe("count-objects");
    expect(focusAfter(before, after, "core.multiplication-table")).toBe("count-objects");
    expect(focusAfter(before, after, "never-there")).toBe("count-objects");
  });

  test("the band of the anchor skills is the same band, though the module's bands are not", () => {
    const after = layout(
      {
        skills: {
          ...GRAPH.skills,
          extra: { title: "Extra", assessability: "verdict", prerequisites: ["core.addition"] },
        },
      },
      { ...TIERS, extra: 1 },
    );
    const gone = layout(without("share-with-remainder"), TIERS);
    expect(focusAfter(after, gone, "core.addition")).toBe("count-objects");
    expect(focusAfter(gone, after, "core.multiplication-table")).toBe("core.multiplication-table");
    const anchorsOnly = layout(
      {
        skills: { s: { title: "S", assessability: "verdict", prerequisites: ["core.b"] } },
      },
      { s: 1 },
    );
    expect(focusAfter(before, anchorsOnly, "core.multiplication-table")).toBe("core.b");
  });

  test("a map with no tile has nowhere to put it", () => {
    expect(focusAfter(before, layout({ skills: {} }, {}), "halves")).toBeNull();
  });
});
