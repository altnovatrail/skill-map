// The element's attributes, read as R04 says (docs/architecture.md, section 3.3). A value the
// contract does not name falls back to what keeps the map safe: no view, the level of headings 3.

/** The view of the map: the learner's or the adult's (R03). */
export type View = "learner" | "adult";

/**
 * The view an attribute `view` names, or null without it or with another value: then the map has
 * neither the choice nor the adult's details, so a mistake of the consumer opens no choice (R04).
 */
export function viewOf(attribute: string | null): View | null {
  return attribute === "learner" || attribute === "adult" ? attribute : null;
}

/** The level of the bands' headings an attribute `heading-level` names: 2 to 6, and otherwise 3. */
export function headingLevel(attribute: string | null): 2 | 3 | 4 | 5 | 6 {
  switch (attribute) {
    case "2":
      return 2;
    case "4":
      return 4;
    case "5":
      return 5;
    case "6":
      return 6;
    default:
      return 3;
  }
}
