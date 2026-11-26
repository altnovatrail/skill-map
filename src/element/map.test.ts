import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  anchorState,
  GRAPH,
  SKILL_MAP,
  skillMap,
  skillState,
  TIERS,
} from "../core/fair-shares.fixture.js";
import { NovatrailSkillMap, type SkillChooseEvent, TAG } from "./index.js";
import {
  adopt,
  button,
  chip,
  chips,
  MANIFEST,
  mount,
  mounted,
  settled,
  shadow,
  tile,
  useMap,
} from "./map.fixture.js";

useMap();

describe("the tree of example/fair-shares on the learner's view", () => {
  test("each band is a heading of level 3 and a list of tiles, the anchor skills first", async () => {
    await mount();
    const headings = [...shadow().querySelectorAll("h3")].map((heading) => heading.textContent);
    expect(headings).toEqual([
      "Skills from other modules",
      "Tier 1 · Counting",
      "Tier 2 · Sharing",
      "Tier 3",
    ]);
    await expect.element(page.getByRole("heading", { level: 3, name: "Tier 3" })).toBeVisible();
    const lists = [...shadow().querySelectorAll("section > ul")].map((list) =>
      [...list.querySelectorAll(":scope > li > button")].map((tile) => tile.textContent),
    );
    expect(lists).toEqual([
      ["Multiplication table, Held"],
      ["Count objects, Mastered", "Draw shares, Not assessed"],
      [
        "Equal groups, Time to review",
        "Explain how you shared, Feedback by criteria",
        "Halves, In progress",
      ],
      ["Share with a remainder, Ready to start", "Quarters, Locked"],
    ]);
  });

  test("titles carry the explanation language, and an anchor skill's English", async () => {
    await mount();
    expect(button("Quarters, Locked").querySelector(".title")?.getAttribute("lang")).toBe("en");
    expect(button("Multiplication table, Held").querySelector(".title")?.getAttribute("lang")).toBe(
      "en",
    );
    // The tier's name, Counting, is the module's text.
    expect(shadow().querySelector("section:nth-of-type(2) h3 span")?.getAttribute("lang")).toBe(
      "en",
    );
  });

  test("the level of the headings follows heading-level, and is 3 for another value", async () => {
    await mount({ view: "learner", "heading-level": "5" });
    expect(shadow().querySelectorAll("h5")).toHaveLength(4);
    mounted().setAttribute("heading-level", "9");
    await settled();
    expect(shadow().querySelectorAll("h3")).toHaveLength(4);
    expect(shadow().querySelectorAll("h5")).toHaveLength(0);
  });

  test("quarters, chosen, waits for halves, and its card names what it builds on, each with its state", async () => {
    await mount();
    await userEvent.click(tile("Quarters, Locked"));
    const quarters = button("Quarters, Locked");
    expect(quarters.getAttribute("aria-expanded")).toBe("true");
    const details = shadow().getElementById(quarters.getAttribute("aria-controls") ?? "");
    expect(details?.previousElementSibling).toBe(quarters.parentElement);
    expect(details?.textContent).toContain("Builds on");
    expect(details?.textContent).toContain("Waits for: Halves");
    expect(chips()).toEqual([
      "Explain how you shared, Feedback by criteria",
      "Halves, In progress",
    ]);
    await expect.element(chip("Halves, In progress")).toBeVisible();
    expect(page.getByRole("button", { name: "Practise" }).query()).toBeNull();
  });

  test("share-with-remainder, expanded, is chosen by Practise with its full ID", async () => {
    await mount();
    const chosen: SkillChooseEvent[] = [];
    document.addEventListener("skillchoose", (event) => chosen.push(event), { once: true });
    await userEvent.click(tile("Share with a remainder, Ready to start"));
    expect(chips()).toEqual(["Multiplication table, Held", "Equal groups, Time to review"]);
    await userEvent.click(page.getByRole("button", { name: "Practise" }));
    expect(chosen).toHaveLength(1);
    const [event] = chosen;
    expect(event?.detail).toEqual({ skill: "example/fair-shares/skill/share-with-remainder" });
    expect(Object.isFrozen(event?.detail)).toBe(true);
    expect(event?.bubbles).toBe(true);
    expect(event?.composed).toBe(true);
    expect(event?.target).toBe(mounted());
  });

  test("Enter chooses, the focus stays on the tile, and Tab goes to Practise, the chips, Close, then the next tile", async () => {
    await mount();
    button("Count objects, Mastered").focus();
    await userEvent.keyboard("{Enter}");
    expect(shadow().activeElement?.textContent).toBe("Count objects, Mastered");
    expect(button("Count objects, Mastered").getAttribute("aria-expanded")).toBe("true");
    const opens = [
      "Equal groups, Time to review",
      "Explain how you shared, Feedback by criteria",
      "Halves, In progress",
    ];
    expect(chips()).toEqual(opens);
    for (const name of ["Practise", ...opens]) {
      await userEvent.keyboard("{Tab}");
      expect(shadow().activeElement?.textContent).toBe(name);
    }
    await userEvent.keyboard("{Tab}");
    expect(shadow().activeElement?.getAttribute("aria-label")).toBe("Close");
    await userEvent.keyboard("{Tab}");
    expect(shadow().activeElement?.textContent).toBe("Draw shares, Not assessed");
  });

  test("the card at the bottom of the window hides neither the chosen tile nor a tile the focus goes to", async () => {
    // A short window, so that the card covers the last tiles.
    await page.viewport(414, 600);
    try {
      await mount();
      await userEvent.click(tile("Count objects, Mastered"));
      const card = () =>
        (shadow().getElementById("details") as HTMLElement).getBoundingClientRect();
      expect(button("Count objects, Mastered").getBoundingClientRect().bottom).toBeLessThanOrEqual(
        card().top,
      );
      expect(button("Quarters, Locked").getBoundingClientRect().top).toBeGreaterThan(card().top);
      for (
        let tab = 0;
        tab < 20 && shadow().activeElement?.textContent !== "Quarters, Locked";
        tab++
      )
        await userEvent.keyboard("{Tab}");
      const quarters = button("Quarters, Locked");
      expect(shadow().activeElement).toBe(quarters);
      expect(quarters.getBoundingClientRect().bottom).toBeLessThanOrEqual(card().top);
    } finally {
      await page.viewport(414, 896);
    }
  });

  test("Space expands too, and pressing again closes", async () => {
    await mount();
    button("Halves, In progress").focus();
    await userEvent.keyboard("[Space]");
    expect(button("Halves, In progress").getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard("[Space]");
    expect(button("Halves, In progress").getAttribute("aria-expanded")).toBe("false");
    expect(button("Halves, In progress").hasAttribute("aria-controls")).toBe(false);
    expect(shadow().getElementById("details")).toBeNull();
  });

  test("one skill is expanded at a time", async () => {
    await mount();
    await userEvent.click(tile("Halves, In progress"));
    await userEvent.click(tile("Draw shares, Not assessed"));
    expect(button("Halves, In progress").getAttribute("aria-expanded")).toBe("false");
    expect(shadow().querySelectorAll(".card")).toHaveLength(1);
  });

  test("an anchor skill expands to its holding and the skills that need it, with no Practise", async () => {
    await mount();
    await userEvent.click(tile("Multiplication table, Held"));
    const details = shadow().getElementById("details");
    expect(details?.textContent).toContain("Needed by");
    expect(details?.textContent).toContain("Share with a remainder");
    expect(page.getByRole("button", { name: "Practise" }).query()).toBeNull();
    expect(chips()).toEqual(["Share with a remainder, Ready to start"]);
  });

  test("a skill's details have its description, in the explanation language", async () => {
    await mount();
    await userEvent.click(tile("Count objects, Mastered"));
    const spans = shadow().getElementById("details")?.querySelectorAll("span") ?? [];
    const description = [...spans].find(
      (span) => span.textContent === "Counts up to twenty things, one by one.",
    );
    expect(description?.getAttribute("lang")).toBe("en");
  });

  test("a skill waiting for two names both, as a list", async () => {
    const unmastered = SKILL_MAP.skills.filter(
      ({ skill }) => skill !== "equal-groups" && skill !== "halves",
    );
    await mount({ view: "learner" }, skillMap(unmastered));
    const { quarters } = GRAPH.skills;
    mounted().graph = {
      ...GRAPH,
      skills: {
        ...GRAPH.skills,
        quarters: { ...quarters, prerequisites: ["halves", "equal-groups"] },
      },
    } as NovatrailSkillMap["graph"];
    await settled();
    await userEvent.click(tile("Quarters, Locked"));
    expect(shadow().getElementById("details")?.textContent).toContain(
      "Waits for: Equal groups and Halves",
    );
  });

  test("a skill's details name what it teaches, with the anchor skill's holding and reason", async () => {
    await mount();
    await userEvent.click(tile("Halves, In progress"));
    expect(shadow().getElementById("details")?.textContent).toContain(
      "Fractions of a whole — Not held — a skill that teaches it is not mastered yet",
    );
  });
});

describe("new data", () => {
  test("a new skillMap keeps the focus and the expanded skill, and the map follows it", async () => {
    await mount();
    await userEvent.click(tile("Share with a remainder, Ready to start"));
    const practise = page.getByRole("button", { name: "Practise" }).element() as HTMLElement;
    practise.focus();
    mounted().skillMap = skillMap(
      SKILL_MAP.skills.map((state) =>
        state.skill === "share-with-remainder"
          ? skillState({ skill: "share-with-remainder", evidenceCount: 2 })
          : state,
      ),
      SKILL_MAP.anchorSkills,
    );
    await settled();
    expect(shadow().activeElement).toBe(practise);
    await expect.element(tile("Share with a remainder, In progress")).toBeVisible();
    expect(button("Share with a remainder, In progress").getAttribute("aria-expanded")).toBe(
      "true",
    );
  });

  test("Practise that Waits for replaced hands the focus to the skill's tile", async () => {
    await mount();
    await userEvent.click(tile("Share with a remainder, Ready to start"));
    (page.getByRole("button", { name: "Practise" }).element() as HTMLElement).focus();
    mounted().skillMap = skillMap(
      SKILL_MAP.skills.map((state) =>
        state.skill === "equal-groups"
          ? skillState({ skill: "equal-groups", evidenceCount: 7 })
          : state,
      ),
      SKILL_MAP.anchorSkills,
    );
    await settled();
    expect(shadow().activeElement?.textContent).toBe("Share with a remainder, Locked");
    expect(shadow().getElementById("details")?.textContent).toContain("Waits for: Equal groups");
  });

  test("a tile moved by new data keeps the focus", async () => {
    await mount();
    const quarters = button("Quarters, Locked");
    quarters.focus();
    // Share with a remainder now builds on halves, at place 2: quarters, at 1.5, goes first.
    const share = GRAPH.skills["share-with-remainder"];
    mounted().graph = {
      ...GRAPH,
      skills: { ...GRAPH.skills, "share-with-remainder": { ...share, prerequisites: ["halves"] } },
    } as NovatrailSkillMap["graph"];
    await settled();
    expect(quarters.closest("ul")?.firstElementChild).toBe(quarters.parentElement);
    expect(shadow().activeElement).toBe(quarters);
  });

  test("a band gone with its skills is gone from the map", async () => {
    await mount();
    const { quarters: _quarters, "share-with-remainder": _share, ...skills } = GRAPH.skills;
    mounted().graph = { ...GRAPH, skills } as NovatrailSkillMap["graph"];
    await settled();
    expect([...shadow().querySelectorAll("h3")].map((heading) => heading.textContent)).toEqual([
      "Tier 1 · Counting",
      "Tier 2 · Sharing",
    ]);
  });

  test("a skill gone closes its details, and the focus goes to the first tile of its band", async () => {
    await mount();
    await userEvent.click(tile("Halves, In progress"));
    const { halves: _gone, ...skills } = GRAPH.skills;
    const quarters = skills.quarters;
    mounted().graph = {
      ...GRAPH,
      skills: { ...skills, quarters: { ...quarters, prerequisites: ["explain-sharing"] } },
    } as NovatrailSkillMap["graph"];
    await settled();
    expect(shadow().getElementById("details")).toBeNull();
    expect(shadow().activeElement?.textContent).toBe("Equal groups, Time to review");
  });

  test("a map without one of graph, tiers and manifest is empty, and comes back with it", async () => {
    await mount();
    mounted().tiers = null;
    await settled();
    expect(shadow().querySelectorAll("section")).toHaveLength(0);
    mounted().tiers = TIERS;
    await settled();
    expect(shadow().querySelectorAll("section")).toHaveLength(4);
  });
});

describe("the views", () => {
  test("the adult's view has the numbers and no Practise", async () => {
    await mount({ view: "adult" });
    await userEvent.click(tile("Count objects, Mastered"));
    const text = shadow().getElementById("details")?.textContent ?? "";
    expect(text).toContain("9 answers");
    expect(text).toContain("Mastery band: Starter");
    expect(text).toContain("Review on Nov 20, 2026");
    expect(page.getByRole("button", { name: "Practise" }).query()).toBeNull();
    // Count objects is chosen: a chip of its card chooses Equal groups, which it opens.
    await userEvent.click(chip("Equal groups, Time to review"));
    expect(shadow().getElementById("details")?.textContent).toContain("Time to review");
    await userEvent.click(tile("Quarters, Locked"));
    expect(shadow().getElementById("details")?.textContent).toContain("0 answers");
    expect(shadow().getElementById("details")?.textContent).not.toContain("Waits for");
  });

  test("the adult's view names the last practice and a band the manifest does not name by its ID", async () => {
    await mount(
      { view: "adult" },
      skillMap(
        [
          skillState({
            skill: "count-objects",
            evidenceCount: 1,
            masteryBand: "b9",
            lastPracticedAt: {
              $typeName: "google.protobuf.Timestamp",
              seconds: 1_793_000_000n,
              nanos: 0,
            },
          }),
        ],
        [anchorState("core.multiplication-table", 3, 3)],
      ),
    );
    await userEvent.click(tile("Quarters, Locked"));
    expect(shadow().getElementById("details")?.textContent).toContain("0 answers");
    await userEvent.click(tile("Count objects, Mastered"));
    const text = shadow().getElementById("details")?.textContent ?? "";
    expect(text).toContain("1 answer");
    expect(text).toContain("Last practised Oct 26, 2026");
    expect(text).toContain("Mastery band: b9");
    await userEvent.click(tile("Multiplication table, Unknown"));
    expect(shadow().getElementById("details")?.textContent).toContain(
      "UnknownNo module teaches it",
    );
  });

  test("without view, or with another value, there is no Practise", async () => {
    const views: Readonly<Record<string, string>>[] = [{}, { view: "child" }];
    for (const attributes of views) {
      await mount(attributes);
      await userEvent.click(tile("Share with a remainder, Ready to start"));
      expect(page.getByRole("button", { name: "Practise" }).query()).toBeNull();
      expect(shadow().getElementById("details")?.textContent).not.toContain("Waits for");
      mounted().remove();
    }
  });

  test("without skillMap there are no states and no Practise, and the marks stay", async () => {
    await mount({ view: "learner" }, null);
    await expect.element(tile("Quarters")).toBeVisible();
    await expect.element(tile("Explain how you shared, Feedback by criteria")).toBeVisible();
    await expect.element(tile("Multiplication table")).toBeVisible();
    await userEvent.click(tile("Quarters"));
    expect(page.getByRole("button", { name: "Practise" }).query()).toBeNull();
    await userEvent.click(tile("Multiplication table"));
    expect(shadow().getElementById("details")?.textContent).not.toContain("Held");
    await userEvent.click(tile("Halves"));
    const items = shadow().getElementById("details")?.querySelectorAll("li") ?? [];
    expect([...items].map((item) => item.textContent)).toContain("Fractions of a whole");
  });
});

test("an anchor skill the build does not know shows its ID, in English", async () => {
  const map = adopt(document.createElement(TAG));
  map.graph = {
    skills: { s: { title: "S", assessability: "verdict", prerequisites: ["core.unknown-one"] } },
  } as unknown as NovatrailSkillMap["graph"];
  map.tiers = { s: 1 };
  map.manifest = MANIFEST;
  document.body.append(map);
  await settled();
  const anchor = button("core.unknown-one");
  expect(anchor.querySelector(".title")?.getAttribute("lang")).toBe("en");
});

test("the map's own words are English for a language the package has not, whatever the page's", async () => {
  document.documentElement.lang = "ru";
  try {
    await mount({ view: "learner", lang: "de" });
    expect(shadow().querySelector(".map")?.getAttribute("lang")).toBe("en");
  } finally {
    document.documentElement.lang = "en";
  }
});

test("on the adult's view a skill of rubric has no numbers: GetSkillMap gives it no state", async () => {
  await mount({ view: "adult" });
  await userEvent.click(tile("Explain how you shared, Feedback by criteria"));
  expect(shadow().getElementById("details")?.textContent).not.toContain("answers");
});

test("properties set before the element was registered are taken when it is", async () => {
  const name = "skill-map-upgraded";
  const early = document.createElement(name) as unknown as NovatrailSkillMap;
  early.setAttribute("view", "learner");
  early.graph = GRAPH;
  early.tiers = TIERS;
  early.manifest = MANIFEST;
  early.skillMap = SKILL_MAP;
  document.body.append(early as unknown as HTMLElement);
  customElements.define(name, class extends NovatrailSkillMap {});
  adopt(early);
  await settled();
  expect(early.graph).toBe(GRAPH);
  expect(Object.hasOwn(early, "graph")).toBe(false);
  await expect.element(tile("Quarters, Locked")).toBeVisible();
});

test("the properties give back what was assigned", async () => {
  await mount();
  expect(mounted().graph).toBe(GRAPH);
  expect(mounted().tiers).toBe(TIERS);
  expect(mounted().manifest).toBe(MANIFEST);
  expect(mounted().skillMap).toBe(SKILL_MAP);
});
