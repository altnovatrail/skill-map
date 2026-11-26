// Where the tiles stand when the tiers are columns: each tile as near the level of the skills it
// builds on as the tiles above it in its column let it, so that the links run short and level.
// From the heights the element measured; the order in a column is the layout's.

import type { SkillGraph } from "@altnovatrail/spec/formatv0/open";
import type { Layout } from "./layout.js";

/** How the element measured a column: where its list of tiles starts, in CSS pixels of the map. */
export interface ColumnStart {
  /** The column's band, by its index in the layout's bands. */
  readonly band: number;
  /** The top of the list of the column's tiles. */
  readonly top: number;
}

/**
 * The top of each tile of the module, in CSS pixels of the map. Down each column, in the
 * layout's order, a tile stands a gap below the one before it, or lower: with its middle at the
 * mean of the middles of its prerequisites in the columns before, when they put it lower. The
 * first column stands as it flows; a tile without a prerequisite among the module's tiles flows
 * too. A tile without a height measured has no top, and gives none to the tiles after it.
 */
export function columnTops(
  graph: SkillGraph,
  map: Layout,
  starts: readonly ColumnStart[],
  heights: ReadonlyMap<string, number>,
  gap: number,
): Map<string, number> {
  const tops = new Map<string, number>();
  const middle = (id: string) => {
    const top = tops.get(id);
    const height = heights.get(id);
    return top === undefined || height === undefined ? undefined : top + height / 2;
  };
  starts.forEach(({ band, top }, column) => {
    const skills = map.bands[band]?.skills ?? [];
    let next = top;
    for (const id of skills) {
      const height = heights.get(id);
      if (height === undefined) break;
      const middles = (graph.skills[id]?.prerequisites ?? [])
        .map(middle)
        .filter((value): value is number => value !== undefined);
      const wanted =
        column === 0 || middles.length === 0
          ? next
          : middles.reduce((sum, value) => sum + value, 0) / middles.length - height / 2;
      const at = Math.max(next, wanted);
      tops.set(id, at);
      next = at + height + gap;
    }
  });
  return tops;
}
