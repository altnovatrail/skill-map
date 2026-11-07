// The page's own graph of eight tiers (R12 in docs/decisions.md): no vector of the format has more
// than four. Its tiers are computed as the format computes them (R49 spec): a skill without
// prerequisites among the module's is in tier 1, any other one tier above the highest of them,
// and an anchor skill counts for no tier.

import type { SkillGraph } from "@altnovatrail/spec/formatv0/open";

/** The tiers of a graph's skills, by the rule of the format. */
export function tiersOf(graph: SkillGraph): Readonly<Record<string, number>> {
  const tiers: Record<string, number> = {};
  const tierOf = (id: string): number => {
    const known = tiers[id];
    if (known !== undefined) return known;
    const below = (graph.skills[id]?.prerequisites ?? [])
      .filter((other) => Object.hasOwn(graph.skills, other))
      .map(tierOf);
    tiers[id] = below.length === 0 ? 1 : 1 + Math.max(...below);
    return tiers[id];
  };
  for (const id of Object.keys(graph.skills)) tierOf(id);
  return tiers;
}

const skill = (
  title: string,
  prerequisites: string[] = [],
  assessability: "verdict" | "rubric" | "none" = "verdict",
): SkillGraph["skills"][string] => ({
  title,
  assessability,
  ...(prerequisites.length > 0 ? { prerequisites } : {}),
});

/**
 * Eight tiers, two of them named: a chain from counting to proportion, branching and joining, a
 * link across tiers, an anchor skill, a skill of rubric and one without assessment, and a long title
 * that wraps.
 */
export const EIGHT_TIERS: SkillGraph = {
  tiers: ["Start", "Basics"],
  skills: {
    count: skill("Count"),
    compare: skill("Compare"),
    draw: skill("Draw what you count", [], "none"),
    add: skill("Add", ["count"]),
    order: skill("Order numbers", ["compare"]),
    subtract: skill("Subtract", ["add"]),
    explain: skill("Explain your steps", ["add", "order"], "rubric"),
    multiply: skill("Multiply", ["subtract", "core.multiplication-table"]),
    divide: skill("Divide", ["multiply", "subtract"]),
    fractions: skill("Comparing and ordering fractions with different denominators", [
      "multiply",
      "order",
    ]),
    remainders: skill("Remainders", ["divide"]),
    decimals: skill("Decimals", ["fractions", "subtract"]),
    ratio: skill("Ratio", ["remainders"]),
    percent: skill("Percent", ["decimals", "fractions"]),
    proportion: skill("Proportion", ["ratio", "percent", "remainders"]),
  },
};
