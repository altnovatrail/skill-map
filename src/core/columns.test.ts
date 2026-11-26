import { expect, test } from "vitest";
import { columnTops } from "./columns.js";
import { GRAPH, TIERS } from "./fair-shares.fixture.js";
import { layout } from "./layout.js";

const map = layout(GRAPH, TIERS);
// The bands of the three tiers, after the band of the anchor skills.
const STARTS = [1, 2, 3].map((band) => ({ band, top: 0 }));
const HEIGHTS = new Map(
  map.bands.flatMap((band) => band.skills).map((id): [string, number] => [id, 40]),
);

test("down each column a tile stands a gap below the one before, or at the mean level of its prerequisites", () => {
  expect(Object.fromEntries(columnTops(GRAPH, map, STARTS, HEIGHTS, 8))).toEqual({
    "count-objects": 0,
    "draw-shares": 48,
    // All three build on count-objects, whose middle is at 20: the first stands level with it,
    // the others flow under it.
    "equal-groups": 0,
    "explain-sharing": 48,
    halves: 96,
    // The anchor skill has no column and gives no level: equal-groups alone puts it at 0.
    "share-with-remainder": 0,
    // The middles of halves, 116, and explain-sharing, 68: their mean, 92, is its middle.
    quarters: 72,
  });
});

test("a column starts where its list starts", () => {
  const tops = columnTops(GRAPH, map, [{ band: 1, top: 30 }], HEIGHTS, 8);
  expect([...tops]).toEqual([
    ["count-objects", 30],
    ["draw-shares", 78],
  ]);
});

test("a tile without a height has no top, and gives none to the tiles after it in its column", () => {
  const heights = new Map(HEIGHTS);
  heights.delete("explain-sharing");
  const tops = columnTops(GRAPH, map, STARTS, heights, 8);
  expect(tops.has("explain-sharing")).toBe(false);
  expect(tops.has("halves")).toBe(false);
  // quarters builds on both, which have no tops: it flows.
  expect(tops.get("quarters")).toBe(48);
});
