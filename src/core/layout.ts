// The layout of the map (R06; docs/architecture.md, section 3.4): which band each skill stands in,
// its place in the band, the links of an expanded skill, and where the focus goes when its node is
// gone. The tiers come ready from module-kit through api (R49 spec, R62 spec): the map orders the
// skills within them and never works a tier out.

import type { SkillGraph } from "@altnovatrail/spec/formatv0/open";

/** A band of the map, top to bottom: the anchor skills before tier 1, then each tier. */
export type Band = AnchorBand | TierBand;

/** The band of the anchor skills that skills of the module have as prerequisites. */
export interface AnchorBand {
  readonly kind: "anchors";
  /** The anchor skills, by ID. */
  readonly skills: readonly string[];
}

/** The band of a tier. Its heading is the tier's word, its number and its name, if it has one. */
export interface TierBand {
  readonly kind: "tier";
  /** The tier's number, from 1. */
  readonly tier: number;
  /** The tier's name from the graph's `tiers`, in the explanation language; null if it has none. */
  readonly name: string | null;
  /** The skills of the module in the tier, in their order in the band. */
  readonly skills: readonly string[];
}

/** The layout of a map: its bands, top to bottom, and where each skill stands. */
export interface Layout {
  readonly bands: readonly Band[];
  /** Where each skill of the module and each anchor skill of the band stands. */
  readonly places: ReadonlyMap<string, Place>;
}

/** Where a skill stands: its band, by its index in `bands`, and its place in it, from 0. */
export interface Place {
  readonly band: number;
  readonly index: number;
}

/**
 * The bands of a map (R06). The anchor skills come first, only those that skills of the module on
 * the map have as prerequisites, each by its ID; without any there is no such band. Then each tier with
 * skills, in order. Tier 1 is ordered by ID; each band after it by the mean of the places of the
 * skill's prerequisites among the module's skills, and by ID where those tie. Anchor skills give
 * no place. IDs are compared by their code units, which for the IDs of the format are its
 * characters. The order of the skills in the graph carries no meaning, and neither the state nor
 * the expansion moves a tile.
 *
 * A skill of the graph without a tier, as `tiers` gives it, a whole number from 1, stands in no
 * band: the tiers come from the same package as the graph (R99 spec), and the map does not work
 * one out. One of a tier past 1 with no prerequisite among the module's skills, which the rule of
 * tiers rules out (R49 spec), goes after those that have, by ID.
 */
export function layout(graph: SkillGraph, tiers: Readonly<Record<string, number>>): Layout {
  const prerequisitesOf = (id: string) => graph.skills[id]?.prerequisites ?? [];

  const byTier = new Map<number, string[]>();
  for (const id of Object.keys(graph.skills)) {
    const tier = Object.hasOwn(tiers, id) ? tiers[id] : undefined;
    if (tier === undefined || !Number.isInteger(tier) || tier < 1) continue;
    byTier.set(tier, [...(byTier.get(tier) ?? []), id]);
  }
  const onMap = [...byTier.values()].flat();

  const bands: Band[] = [];
  const places = new Map<string, Place>();
  const push = (band: Band) => {
    band.skills.forEach((id, index) => {
      places.set(id, { band: bands.length, index });
    });
    bands.push(band);
  };

  const anchors = new Set(
    onMap.flatMap(prerequisitesOf).filter((id) => !Object.hasOwn(graph.skills, id)),
  );
  if (anchors.size > 0) push({ kind: "anchors", skills: [...anchors].sort(byCodeUnits) });

  for (const [tier, members] of [...byTier].sort(([a], [b]) => a - b)) {
    const keyed = members.map((id) => {
      // Only the module's skills already laid out have a place in a tier's band: anchor skills,
      // in theirs, give none.
      const ofModule = (place: Place | undefined): place is Place =>
        place !== undefined && bands[place.band]?.kind === "tier";
      const indices = prerequisitesOf(id)
        .map((prerequisite) => places.get(prerequisite))
        .filter(ofModule)
        .map((place) => place.index);
      const mean =
        tier === 1
          ? 0
          : indices.length === 0
            ? Number.POSITIVE_INFINITY
            : indices.reduce((sum, index) => sum + index, 0) / indices.length;
      return { id, mean };
    });
    keyed.sort((a, b) => a.mean - b.mean || byCodeUnits(a.id, b.id));
    const skills = keyed.map(({ id }) => id);
    push({ kind: "tier", tier, name: graph.tiers?.[tier - 1] ?? null, skills });
  }
  return { bands, places };
}

/** The links of an expanded skill to the tiles of the map, and what it teaches. */
export interface Links {
  /** What it builds on: its prerequisites on the map, skills and anchor skills, in its order. */
  readonly buildsOn: readonly string[];
  /** What it opens: the skills on the map that have it as a prerequisite, in its order. */
  readonly opens: readonly string[];
  /** What it teaches: the anchor skills of its `teaches`, by ID. Empty for an anchor skill. */
  readonly teaches: readonly string[];
}

/**
 * The links of a skill of the module, or of an anchor skill, that is expanded (R06). Its tiles
 * get the labels: «нужен раньше» on each it builds on, «откроется после» on each it opens. A link
 * goes only to a tile of the map: a skill that stands in no band has none.
 */
export function linksOf(graph: SkillGraph, map: Layout, id: string): Links {
  const inOrder = (list: readonly string[]) =>
    list
      .flatMap((other) => {
        const place = map.places.get(other);
        return place === undefined ? [] : [{ other, place }];
      })
      .sort((a, b) => a.place.band - b.place.band || a.place.index - b.place.index)
      .map(({ other }) => other);
  const skill = Object.hasOwn(graph.skills, id) ? graph.skills[id] : undefined;
  const opens = Object.entries(graph.skills)
    .filter(([, other]) => (other.prerequisites ?? []).includes(id))
    .map(([other]) => other);
  return {
    buildsOn: inOrder(skill?.prerequisites ?? []),
    opens: inOrder(opens),
    teaches: [...(skill?.teaches ?? [])].sort(byCodeUnits),
  };
}

/**
 * The tile the focus goes to when the node it was on is gone with new data — the tile, or the
 * button «Заниматься» that «ждёт» replaced (the second amendment of 2026-11-07 to R04): the tile of
 * the same skill; without it, the first tile of the band the skill stood in; without that, the
 * first tile of the map. Null when the map has no tile. A band is the same when it is the band of
 * the anchor skills, or the band of the same tier.
 */
export function focusAfter(before: Layout, after: Layout, skill: string): string | null {
  if (after.places.has(skill)) return skill;
  const place = before.places.get(skill);
  const band = place === undefined ? undefined : before.bands[place.band];
  // No band of a layout is empty.
  const same = band === undefined ? undefined : after.bands.find((other) => sameBand(band, other));
  return same?.skills[0] ?? after.bands[0]?.skills[0] ?? null;
}

function sameBand(a: Band, b: Band): boolean {
  if (a.kind === "anchors" || b.kind === "anchors") return a.kind === b.kind;
  return a.tier === b.tier;
}

/** Two IDs by their code units. */
function byCodeUnits(a: string, b: string): number {
  return Number(a > b) - Number(a < b);
}
