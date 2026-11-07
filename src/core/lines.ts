// The lines of the expanded skill (R06; R11 in docs/decisions.md; docs/architecture.md, section 3.4):
// where each starts and ends, and the curve between, from the boxes the element measured. Each
// line goes down: from the bottom edge of a prerequisite's tile into the top edge of the expanded
// tile, and from the bottom edge of the details into the top edge of each tile the skill opens.
// The ends on the expanded tile and on its details are spread across the tile's width, in the order
// of the other ends from left to right, so that their points do not fall on one another and the
// lines do not cross for nothing. Each point is rounded to a tenth of a CSS pixel, as its curve is. A line is a cubic curve,
// leaving its start straight down and coming into its end straight down.

import type { Links } from "./layout.js";

/** A box of the map, in CSS pixels from the map's top left corner. */
export interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** A point of the map. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/** A line between two tiles: the skills it links, its ends, and its path in SVG. */
export interface Line {
  readonly from: string;
  readonly to: string;
  readonly start: Point;
  readonly end: Point;
  readonly d: string;
}

/** A number of the drawing, to a tenth of a CSS pixel. */
const tenth = (value: number) => Math.round(value * 10) / 10;

/** A point to a tenth of a CSS pixel. */
const rounded = ({ x, y }: Point): Point => ({ x: tenth(x), y: tenth(y) });

/** The cubic curve from one point down to another: both ends leave and come in upright. */
export function curve(start: Point, end: Point): string {
  const middle = tenth((start.y + end.y) / 2);
  const [sx, sy, ex, ey] = [start.x, start.y, end.x, end.y].map(tenth);
  return `M${sx} ${sy}C${sx} ${middle} ${ex} ${middle} ${ex} ${ey}`;
}

/** The middle of a box's bottom edge, and of its top edge. */
const bottomOf = (box: Box): Point => ({ x: (box.left + box.right) / 2, y: box.bottom });
const topOf = (box: Box): Point => ({ x: (box.left + box.right) / 2, y: box.top });

/** The i-th of n points spread across a box's width, at the height given. */
const spread = (box: Box, i: number, n: number, y: number): Point => ({
  x: box.left + ((box.right - box.left) * (i + 1)) / (n + 1),
  y,
});

/**
 * The lines of the expanded skill: one from each tile it builds on, into its tile's top edge, and
 * one to each tile it opens, out of its details' bottom edge, in the order of the links. A skill
 * whose tile has no box has no line, and without the expanded tile's box there is none.
 */
export function linesOf(
  expanded: string,
  links: Links,
  boxes: ReadonlyMap<string, Box>,
  details: Box,
): Line[] {
  const tile = boxes.get(expanded);
  if (tile === undefined) return [];
  const line = (from: string, to: string, start: Point, end: Point): Line => ({
    from,
    to,
    start: rounded(start),
    end: rounded(end),
    d: curve(start, end),
  });
  /** The skills with a box, and the place of each among them from left to right. */
  const ranked = (ids: readonly string[], end: (box: Box) => Point) => {
    const placed = ids.filter((id) => boxes.has(id));
    const order = [...placed].sort(
      (a, b) => end(boxes.get(a) as Box).x - end(boxes.get(b) as Box).x,
    );
    return placed.map((id) => ({ id, box: boxes.get(id) as Box, rank: order.indexOf(id) }));
  };
  const into = ranked(links.buildsOn, bottomOf);
  const out = ranked(links.opens, topOf);
  return [
    ...into.map(({ id, box, rank }) =>
      line(id, expanded, bottomOf(box), spread(tile, rank, into.length, tile.top)),
    ),
    ...out.map(({ id, box, rank }) =>
      line(expanded, id, spread(tile, rank, out.length, details.bottom), topOf(box)),
    ),
  ];
}
