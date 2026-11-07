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

/**
 * The language of the map's own words an attribute `lang` names, of the languages the package
 * has: the tag is cut from its end, a subtag at a time, until a language matches, as the lookup of
 * RFC 4647, section 3.4, does; a single letter, `x` or an extension's, goes with what follows it.
 * Case does not count. Without the attribute, or with no language of the package in it, null: the
 * map then speaks English (R91 spec; architecture 6 spec). The element reads no ancestor's
 * language (R36 spec).
 */
export function languageOf(attribute: string | null, known: ReadonlySet<string>): string | null {
  let range = (attribute ?? "").trim().toLowerCase();
  while (range !== "") {
    if (known.has(range)) return range;
    let cut = range.lastIndexOf("-");
    if (cut >= 2 && range[cut - 2] === "-") cut -= 2;
    range = cut > 0 ? range.slice(0, cut) : "";
  }
  return null;
}
