# skill-map — architecture

> What the component does, what it does not do and what is still to be decided about it. This is the detail of its card, the one in `spec/docs/architecture.md` whose heading names `skill-map`. The card stays the summary: if the detail changes what the card says, the card is changed in `spec` the same way as a question for its registers, by a row «В реестр spec».
>
> Why it was decided so and not otherwise is in [decisions.md](decisions.md); the work plan is in [RUN.md](../RUN.md). The concepts are the glossary of `spec/docs/concepts.md`. The documents and decisions of `spec` are under `spec/docs/`; a text here says in words what it takes from them, and cites none.

## 1. Purpose and boundaries

**Does:**
- draws a module's skill graph: the skills by tiers and the links between them — the prerequisites. `module-kit` computes the tier from the graph when it builds the package, and the author gives the tiers their names;
- shows on the graph the state of the learner model — the mastery of each skill: what is mastered, what opens up and what it rests on. A learner has one learner model, and the skill map is its visible part;
- in the first slice, shows the maps of three modules of two subjects — a map per module: which one to show, `app` chooses. The level in the learner model is per module, not per subject and not for the whole model, and the links between modules carry only prerequisites, through anchor skills, not the level;
- lets the learner choose a skill on the map — this is the entry "Skill map" in the app. By the chosen skill the engine chooses the next task, in the mode "the learner chose the skill on the skill map";
- meets the standard of the UI packages: accessibility — WCAG 2.2 at level AA, and beyond it targets no smaller than 44 × 44 CSS px and motion by `prefers-reduced-motion`; for the map — a text alternative of the graph, `lang` on a skill's title, mastery not by color alone, the keyboard and moving the map without dragging. Translations follow the shared rules of the packages, into each interface language, `en` and `ru`; icons are from the set Material Symbols, embedded at build time.

**Does not:**
- does not fetch data: everything it draws comes to it ready from `api` through its consumer, `app`;
- does not compute mastery and does not change the learner model. Mastery by evidence is estimated by `learner-model`, a library inside `api`, and the display — the skill map, ratings, ranks — is derived from the model and does not affect it back;
- does not compute the tiers: they come to it ready;
- does not choose the next lesson or task: the engine does that;
- shows no ranks in the first slice: what a rank is in NovaTrail is decided by О-13;
- is not loaded at run time: `app` builds it in at build time, at an exact version. At run time only the modules' widgets are loaded, in an iframe sandbox.

**Data and links:**
- draws what it was given. The graph and the tiers `app` takes from `api` by the package digest of the module's current version, `GetSkillGraph`, and the state of the skills by `GetSkillMap`; this is the contract `app` ↔ `api`, the package `novatrail.api.v1` on protobuf and buf, described in the [contracts text](../spec/contracts/README.md);
- the state of the skills is a learner's data. The learner model lives in the database of `api`: the evidence log is append-only, and the state of the skills is a cache. What goes to the device for the map is the state of the skills of the module's current version, without traps. The package itself keeps none of it on the device: the state of the skills lives in the element's memory while it is on the page. In the repository there are no learners' data and no secrets, and the examples are synthetic;
- the consumers:
  - stage 2 — `app`: the learner's screen and the section for adults;
  - later — `site`, stage 3, and the author's tools.

  A second consumer — a site, for example — gets a second build of the same package. A UI package enters its consumer as a web component: it gets data through properties, gives the work through a method, and gives changes and requests through events; it names its elements itself, and the data types that the repositories share it takes from the releases of `spec`. For the map this is one element, `<novatrail-skill-map>`: the data through properties, the choice of a skill through an event, and it has no methods. Beside it the package gives the rule of the states as one function, `./states`, for the module card of `app`;
- at build time it depends on nothing but `spec`; at build time `app` depends on it, and from stage 3 `site` does too. The package comes out in npm, in the scope `@altnovatrail`, as a file of a signed GitHub release; how it is built, checked and accepted is in the design below;
- the license is Apache-2.0; dependencies only with licenses compatible with it;
- stage 2, "The first slice with a learner", together with `tutor`, `canvas`, `api`, `app` and `infra`. The code of `skill-map` comes after the stage's first code — `tutor` and `canvas` —, together with `api`, `app` and `infra`.

## 2. To decide when detailed

The card leaves nothing to decide. The detailing decided the data and the element's agreement, the layout and the tiers on the map and the ranks on the map, and `spec` decided the tiers and publishing: the design below holds all of it. The first four points below say each decision in a sentence; the fifth is open.

**Deferred on purpose:**
- what a rank is in NovaTrail — О-13, which holds the conclusions of the map's detailing too. Until it is decided, there are no ranks on the map;
- folding the distant tiers — Д3 in [run/DEBT.md](../run/DEBT.md): come back to it when a module has more than six tiers.

### 2.1. The layout of the graph — decided

- **The gist:** the package lays out the map itself, on the device: a band for each tier from top to bottom, the anchor skills first, and the skills of a band as tiles in a row, with wrapping.

### 2.2. Tiers — decided in `spec`

- **The gist:** the tier is computed from the graph, and the author gives the tiers their names; the map draws a band for each tier and computes none.

### 2.3. Ranks (О-13) — decided for the map

- **The gist:** in the first slice there are no ranks on the map, and what a rank is in NovaTrail is О-13.

### 2.4. Where the package is published — decided in `spec`

- **The gist:** the package comes out in npm, in the scope `@altnovatrail`, and the signature of the release file is checked by the recipe `release-verify` of `spec`.

### 2.5. Modules that teach an anchor skill whose holding is "unknown" — open (Д211 spec)

- **The gist:** an anchor skill in the response of `GetSkillMap` has `teaching_modules` — the IDs of the modules of the module catalog of `api` that teach the anchor skill and are not connected to the profile: their current version suits the profile by audience and names the skill in `teaches`. The answer of `spec` to the row В36 of `engine` says to show them to the adult and the learner at "unknown" — with the title from the open view of the module manifest and connecting, `ConnectModule`, — and where, on the map or beside it, the detailings of `app` and `skill-map` decide (Д211 spec). The map does not read the field.
- **What is known:** the map draws what `app` gave it, and itself does nothing but the choice event `skillchoose`. It has no titles of the skills of other modules, so it does not show `teaching_skills`; the titles of the catalog's modules are not in its data either — the open views of their module manifests are held by `app`. Connecting a module is a request of `app` to `api`. `app` decides its own "where" along with its work on the skill map (Д211 spec).
- **Options:**
  - (a) not on the map: `app` shows the modules beside it, and the map, as now, says "unknown" with the reason. The element's agreement does not change;
  - (b) on the map, in the details of an anchor skill at "unknown": the modules by title and a button to connect. This needs a new property with the modules' titles — `app` takes them from the module manifests — and a new event with the module's ID, that is, a change of the data and of the element's agreement in the decision log and an edit of the card in `spec` by a row «В реестр spec».
- **Recommendation:** (a), until `app` has decided its screen: connecting is an action on the profile, not on the map, and the element's agreement stays what `app` already builds in. If `app` decides to show the modules in the details of an anchor skill, then (b), as a task of its own.
- **Decides:** the author — the row В11 of table 3, [run/QUESTIONS.md](../run/QUESTIONS.md).

## 3. How it is built

Which parts the component consists of, its types and data, and how it is linked with other repositories: the data and the element's agreement, the layout, the ranks on the map, and what `spec` decided about the tiers and publishing.

### 3.1. The data for the display

Everything the map draws comes to it ready from `app`: the open view of the graph and the tiers — the response of `GetSkillGraph`, the module manifest — the response of `GetManifest` by the same digest, the state — the response of `GetSkillMap`. The map needs no fields beyond the contract. It itself stores nothing: the state lives in the element's memory while it is on the page.

The titles, the descriptions, the names of the tiers and of the bands are in the module's explanation language, with its `lang`; the titles of anchor skills are English, with `lang="en"`. "Learner" and "adult" are the element's views, by its attribute `view`; without the state there are neither the marks of state nor the adult's details.

| What is on the map | Field | Concept of `spec` | Learner | Adult |
|---|---|---|---|---|
| a skill, by its local ID | the key of `skills` of the graph's open view | skill | yes | yes |
| the skill's title | `skills.<id>.title` | skill | yes | yes |
| the description | `skills.<id>.description` | skill | yes | yes |
| the links and what a locked skill waits for | `skills.<id>.prerequisites` | prerequisite | yes | yes |
| the mark "feedback by criteria" or "not assessed" | `skills.<id>.assessability` | assessability | yes | yes |
| what the skill teaches | `skills.<id>.teaches` | anchor skill | yes | yes |
| the skill's tier | `skill_tiers` of the response of `GetSkillGraph` | tier | yes | yes |
| the tier's name or its number | `tiers` of the graph's open view | tier | yes | yes |
| the language of the titles | `languages.explanation` of the module manifest | explanation language | — | — |
| the skill's full ID in the event | `id` of the module manifest | full ID | — | — |
| the state on the map, below | `SkillState`: `evidence_count`, `mastery_band`, `review_date`, `review_due` | the state of a skill | yes | yes |
| the number of pieces of evidence | `SkillState.evidence_count` | evidence | no | yes |
| the last practice | `SkillState.last_practiced_at` | the state of a skill | no | yes |
| the mastery band | `SkillState.mastery_band` and `bands` of the module manifest, its `title` | mastery band | no | yes |
| the review date | `SkillState.review_date`, `review_due` | forgetting and repetition | no | yes |
| the estimate, the uncertainty, the retention, the cautious probability | `SkillState.estimate`, `uncertainty`, `retention`, `cautious_probability` | learner model | no | no |
| an anchor skill before tier 1 and in a skill's details | `AnchorSkillState.anchor_skill`; the title — from the dictionary the package embeds | anchor skill | yes | yes |
| "held", "not held", "unknown" | `AnchorSkillState.holding` | anchor skill | yes | yes |
| why not held or unknown | `AnchorSkillState.reason` | anchor skill | yes | yes |
| the skills that teach the anchor skill | `AnchorSkillState.teaching_skills` | anchor skill | no | no |
| the modules of the catalog that teach the anchor skill and are not connected | `AnchorSkillState.teaching_modules` | anchor skill | no | no |
| the package digest | `GetSkillMapResponse.package_digest` | module package | — | — |
| the band of the module's level | `GetSkillMapResponse.level_band` | mastery band | no | no |
| when an adult last set the module's level | `GetSkillMapResponse.level_set_at` | the adult's correction of a module's level | no | no |

"—" — the field is not shown but serves the map. The map does not name the skills that teach an anchor skill: they are the full IDs of skills of other modules, and it has no titles for them; the skills of its own module that teach it are seen by `teaches`. The modules that teach an anchor skill and are not connected are IDs of the catalog's modules: the map does not show them, and whether it will is the open point above. There are no traps on the map. The band of the module's level and when an adult last set it are in the answer: `app` shows them — the adult's "Easier" and "Harder", and to every learner "the level was set by an adult" with its date —, and the element reads neither.

### 3.2. The states on the map

A skill with the assessability `verdict` has one of five states, the first that fits, in order:

| State | When | Choice on the learner's view |
|---|---|---|
| "time to review" | `mastery_band` is not empty, and `review_due` or `review_date` is no later than the device's time | yes |
| "mastered" | `mastery_band` is not empty | yes |
| "in progress" | `evidence_count` is greater than zero | yes |
| "ready to start" | every prerequisite of the skill among the module's skills with the assessability `verdict` has a non-empty `mastery_band`, or there are no such prerequisites | yes |
| "locked" | the rest; the map names the prerequisites that are not mastered yet | no |

- A mastered prerequisite whose time to review has come does not lock the skill. Nor does a prerequisite with a rubric or one not assessed, nor an anchor skill.
- A skill with evidence is open, even if its prerequisite is not mastered yet or has already lost "mastered": the learner has already worked on it.
- A skill with the assessability `rubric` has the mark "feedback by criteria", and one with `none` — "not assessed"; they have no state, and they can always be chosen.
- A skill with a verdict that the response does not name is like a skill without evidence.
- An anchor skill that the graph names and the response does not is "unknown", without a reason. The reason is shown only if it fits the holding: "not mastered" and "no evidence" — at "not held", "nobody teaches" and "taught only without a verdict" — at "unknown", and at "held" there is none. Of two records of the response about one skill, the first counts.
- A state is named by a word and an icon, not by color alone. The words are the package's table in `en` and `ru`, the icons are from the set Material Symbols; which ones exactly is in the words, icons and look below.

**An example on a synthetic graph.** The module `example/fair-shares` with the explanation language `en`; the graph as its open view gives it, and the tiers as `skill_tiers`:

```yaml
tiers: [Counting, Sharing]
skills:
  count-objects: { title: Count objects, assessability: verdict }
  draw-shares: { title: Draw shares, assessability: none }
  halves: { title: Halves, assessability: verdict, prerequisites: [count-objects], teaches: [core.fractions-of-a-whole] }
  equal-groups: { title: Equal groups, assessability: verdict, prerequisites: [count-objects] }
  explain-sharing: { title: Explain how you shared, assessability: rubric, prerequisites: [count-objects], teaches: [core.division-with-remainder] }
  share-with-remainder: { title: Share with a remainder, assessability: verdict, prerequisites: [equal-groups, core.multiplication-table] }
  quarters: { title: Quarters, assessability: verdict, prerequisites: [halves, explain-sharing] }
# skill_tiers: count-objects 1, draw-shares 1, halves 2, equal-groups 2, explain-sharing 2,
#              share-with-remainder 3, quarters 3
```

A synthetic response of `GetSkillMap` at the device's time 2026-11-07T12:00Z, and what comes of it:

| Skill | Tier | From the response | On the map |
|---|---|---|---|
| `count-objects` | 1 Counting | `evidence_count` 9, `mastery_band` `b1`, `review_date` 2026-11-20 | "mastered" |
| `draw-shares` | 1 Counting | — | "not assessed" |
| `halves` | 2 Sharing | `evidence_count` 4, `mastery_band` empty | "in progress" |
| `equal-groups` | 2 Sharing | `evidence_count` 7, `mastery_band` `b1`, `review_due` | "time to review" |
| `explain-sharing` | 2 Sharing | — | "feedback by criteria" |
| `share-with-remainder` | 3 — without a name, by its number | `evidence_count` 0 | "ready to start": `equal-groups` is mastered, though its time to review has come, and an anchor skill does not lock |
| `quarters` | 3 — without a name, by its number | `evidence_count` 0 | "locked": it waits for `halves`; `explain-sharing`, with a rubric, does not hold it back |

| Anchor skill | From the response | Where on the map |
|---|---|---|
| `core.multiplication-table`, Multiplication table | `ANCHOR_SKILL_HOLDING_HELD` | before tier 1, a prerequisite of `share-with-remainder`: "held" |
| `core.fractions-of-a-whole`, Fractions of a whole | `ANCHOR_SKILL_HOLDING_NOT_HELD`, `ANCHOR_SKILL_REASON_NOT_MASTERED` | in the details of `halves`, as what it teaches: "not held" — the skill that teaches it is not mastered yet |
| `core.division-with-remainder`, Division with a remainder | `ANCHOR_SKILL_HOLDING_UNKNOWN`, `ANCHOR_SKILL_REASON_ONLY_UNASSESSABLE` | in the details of `explain-sharing`: "unknown" — only skills without a verdict teach it |

On the learner's view every skill but `quarters` can be chosen. On the adult's view `count-objects` also shows 9 pieces of evidence, the band `b1` by its title in the module manifest and the review date 2026-11-20, and `equal-groups` shows "time to review". Without the response of `GetSkillMap` the same seven skills stand in the same tiers, without states and without the marks of anchor skills, and the marks "not assessed" and "feedback by criteria" stay: they come from the graph.

### 3.3. The element `<novatrail-skill-map>`

The package enters its consumer as one element:

| Member | Kind | What |
|---|---|---|
| `graph` | property | the open view of the graph, `open.SkillGraph` from `@altnovatrail/spec/formatv0/open`; `app` reads the bytes of `OpenView` by the format version |
| `tiers` | property | the tiers `skill_tiers`, `Readonly<Record<string, number>>` |
| `manifest` | property | the open view of the module manifest, `open.Manifest`: the module ID, the explanation language, the bands |
| `skillMap` | property | `GetSkillMapResponse` from `@altnovatrail/contracts`, or `null` — a map without state |
| `view` | attribute | `learner` — the learner's view, `adult` — the adult's view; without it or with another value — without choice and without the adult's details |
| `lang` | attribute | the language of the element's labels: found by truncating the tag, and if not found, English |
| `heading-level` | attribute | the level of the bands' headings, from 2 to 6, and without it or with another value — 3 |
| `skillchoose` | event | a `CustomEvent` from the host, `bubbles` and `composed`, with a frozen `detail` `{ skill }` — the skill's full ID for the field `skill` of the request `ChooseNext`. Only on the learner's view, only with `skillMap` and only for a skill that is not locked; the button "Practise" in the details sends it |

- The map is drawn when there are `graph`, `tiers` and `manifest`, and it is updated on every assignment — in place, by skill ID; an assignment sends no events. There are no methods.
- The element's types are in the package's declarations, and the package itself puts the element into `HTMLElementTagNameMap` and the event into `GlobalEventHandlersEventMap`. The data types are `@altnovatrail/spec` and `@altnovatrail/contracts`, at the same exact version as the tag of the submodule `spec`.
- The English titles of anchor skills the package embeds at build time from `format/schemas/shared-taxonomy.schema.json` of the format file of a release of `spec`, checked by `release-verify`, for each format version that its build reads; an unknown ID it shows as it is, with `lang="en"`.
- A tap, Enter or Space expands a skill, and it is chosen for a session by the button "Practise" in the details: that button sends `skillchoose`. From the keyboard — Tab through the tiles.
- In code the element is its own, without a library. The tree is updated in place, by skill ID; the assignments of one task of the event loop are merged into one update. The words are the package's table in `en` and `ru`, the language is the attribute `lang`. The English titles of anchor skills are embedded from the format file of the release of `spec` that `scripts/taxonomy.ts` names, which a move to a tag moves: the recipe `taxonomy` checks the file by `release-verify` and pins its sha256, and `ci-lint` checks the table against the file. The styles are checked under a strict CSP, and the declarations by a trial consumer.

**The rule of the states, `./states`.** The module card on the home screen of `app` shows the same states and marks as the map, by the same rule, so the package gives it at a second entry point, `@altnovatrail/skill-map/states`:

```ts
import { type SkillStatus, skillStates } from "@altnovatrail/skill-map/states";
const statuses: ReadonlyMap<string, SkillStatus> = skillStates(graph, skillMap, new Date());
```

- In: the same `open.SkillGraph` as the property `graph`, the answer `GetSkillMapResponse` — required, not `null` — and the device's time. Out: each skill of the module, by local ID in the order of the graph, with one of seven values, named as the values of the shared tables of words and icons of the UI packages in `spec`: `time-to-review`, `mastered`, `in-progress`, `ready-to-start`, `locked` — the five states on the map —, and `feedback-by-criteria`, `not-assessed` — the marks. The words and icons of the seven are those tables', and `app` draws the card and its legend by them. The anchor skills are not in the result.
- It is the rule the element draws by, from `src/core/skill-states.ts`, and the element shows each skill the same value on the same data. It has neither the DOM nor the element: importing it registers nothing, and `sideEffects` does not name it. Nothing else of the core goes out.

### 3.4. The layout

The map is laid out by the package's own code, on the device, from the graph's open view and `skill_tiers`. The graphs of the first slice are small: `grade-3-math` — 4 skills in 3 tiers, `english-essays` — 6 in 4, and the example of olympiad mathematics in the format — 17 in 3 (`modules`, `main` 6d061e9; `spec/format/vectors/tiers/olympiad-math.yaml`).

**Bands.**
- A tier is a band, from top to bottom: first the anchor skills, then tier 1, 2 and on — all there are; none is folded (Д3 in [run/DEBT.md](../run/DEBT.md)).
- The band's heading is the word for tier and the number, and after them the tier's name from `tiers`, if it has one: "Tier 2 · Sharing", "Tier 3". The band of anchor skills has a heading of its own. The level of the headings is the element's attribute `heading-level`.
- The skills of a band are tiles in a row, with wrapping. The page scrolls, and the map has no scroll container of its own: at 320 CSS px and at a zoom of 200 % the bands wrap, and nothing scrolls sideways (WCAG 2.2, 1.4.10; sources 2.1).
- A tile is the skill's title with the `lang` of the explanation language, and for an anchor skill with `lang="en"`; the state or the mark is by a word and an icon. The target is no smaller than 44 × 44 CSS px.
- A sequential module has one skill per band — by the same rule. It has no look of its own.

**The order in a band.**
- Tier 1 — by the skill's local ID.
- Each next band — by the average place of the skill's prerequisites among the module's skills; the place is the tile's number in its band, from zero. On a tie — by ID.
- Anchor skills give no place, and in their own band they stand by ID. That band holds only the prerequisites of the module's skills; if the module has none, there is no band, and no heading of it either.
- IDs are compared by character codes. The order of the skills in the graph, the state and the expanding do not change a tile's place.
- On data that the rule of tiers does not give: a skill without a tier in `skill_tiers` does not stand on the map, nor do the anchor skills needed only by it; a skill of a tier above 1 without prerequisites in the module stands at the end of the band, by ID; there is a band only for a tier with skills.

**Expanding and the details.**
- A tap, Enter or Space on a tile expands the skill, and a repeated one collapses it; one skill is expanded at a time. Any skill can be expanded, a locked one and an anchor skill too: expanding is not choosing the skill for a session, and choosing is only by the button "Practise".
- The expanding lives in the element's memory and does not go outside. On an assignment of properties the element updates the tiles in place, by skill ID: the tile that has the focus and the expanded details stay. If the expanded skill is no longer in the new data, the details close. If the node that had the focus is gone — a tile, or the button "Practise" that "Waits for" replaced —, the focus goes to the tile of the same skill, and without it to the first tile of the same band, and without that to the first tile of the map.
- The details stand in the DOM right after the tile — as a separate item of the band's list, an `<li>` after the tile's `<li>`, across the band's whole width: the tiles after the expanded one wrap below them. While the details are open, the band's list has one item more. A tile is a disclosure button, with `aria-expanded` and `aria-controls` on this item.
- In a skill's details: the title and the description; the state or the mark; "Builds on" — its prerequisites, for a locked skill with a mark of which are not mastered yet; "Opens" — the skills for which it is a prerequisite; "Teaches" — the anchor skills from `teaches`, with their state; for the adult, also the number of answers, the last practice, the mastery band and the review date.
- On the learner's view, with `skillMap`, a module's skill that is not locked has the button "Practise": it sends `skillchoose`. A locked one has instead "Waits for" and the prerequisites not mastered. An anchor skill has no button, nor has any skill on the adult's view, without `view` or with another value of it, or without the state.
- What `ChooseNext` answers is shown by `app`, and "nothing to give" too — its response can be empty when `api` has limited the pool to tasks without AI. After `skillchoose` the map waits for nothing.
- The details of an anchor skill — the title, the state, the reason and the module's skills that need it.

**Lines.**
- Only for the expanded skill: from the tile of each of its prerequisites — a module's skill or an anchor skill — to it, and from it to each skill for which it is a prerequisite. A link across a tier is the same kind of line.
- The lines from the prerequisites enter the top edge of the tile. The lines to what the skill opens leave from the bottom edge of its details: the tile and the details are one block, and no lines go under the details.
- The package draws the lines by the measured places of the tiles when the layout is ready, and draws them again when its size changes. The lines lie under the tiles and do not cover them, and each has a dot at both ends. A link across a tier and a line from an anchor skill pass under the tiles of the bands in between, and a line from the details also under the tiles wrapped below them: what is linked with what is told by the dots at the ends and the labels at the linked tiles, not by the line itself.
- The highlighted tiles have the labels "needed before" and "opens after": a link is seen not by color alone (1.4.1). The line's contrast with the background is no less than 3:1 (1.4.11).
- With `prefers-reduced-motion` the lines appear without animation.
- In code the lines are cubic curves in one SVG under the bands, the ends at the expanded tile and under the details spread across its width, the places recalculated after each render and by `ResizeObserver`, and no animation at all.

**The keyboard and the text alternative.**
- Each tile is a button in the Tab order: band after band, in the order of the layout. Enter or Space expands the skill, the focus stays on the tile, and "Practise" is the next Tab stop: the details stand right after the tile (2.4.3). The map has nothing sticky of its own, and that nothing sticky on the page — a header or a bar of `app` — covers the focus is for `app` to answer for (2.4.11).
- The text alternative is the DOM tree itself: a band is a heading and a list of tiles, a tile's accessible name is "title, state", and a highlighted tile's name also has the label, which stands inside the button: "title, state, needed before". The links are named by words in the details and the labels. The SVG of the lines is `aria-hidden`. The DOM order is the order on the screen (1.3.2).

The words — the word for tier in a band's heading, "Practise", "Builds on", "Opens", "Teaches", "Waits for", "needed before", "opens after", the heading of the band of anchor skills — are the package's own table in `en` and `ru`; the strings and the icons are in the words, icons and look below.

**An example** — the module `example/fair-shares` of the states above, with its synthetic response of `GetSkillMap`:

| Band | Tiles in order | Why this order |
|---|---|---|
| anchor skills | `core.multiplication-table` | only prerequisites; by ID |
| 1 · Counting | `count-objects` (0), `draw-shares` (1) | tier 1 — by ID |
| 2 · Sharing | `equal-groups` (0), `explain-sharing` (1), `halves` (2) | all three have one single prerequisite, `count-objects`, place 0: a tie, by ID |
| 3 | `share-with-remainder` (0), `quarters` (1) | `share-with-remainder` — the average of the place of `equal-groups`, 0, and an anchor skill gives no place; `quarters` — the average of the places of `halves` and `explain-sharing`, (2 + 1) / 2 = 1.5. Tier 3 has no name — only a number |

- **`quarters` is expanded** on the learner's view. The details stand after its tile, at the end of band 3. Lines go to it from `halves` and from `explain-sharing`, and their tiles have "needed before". "Builds on": Halves — not mastered yet, and Explain how you shared; "Opens" — nothing. The skill is locked: instead of "Practise" — "Waits for: Halves".
- **`share-with-remainder` is expanded.** The details stand after its tile, and `quarters` wraps below them. Lines go to it from `equal-groups` and from `core.multiplication-table` of the band of anchor skills, and both tiles have "needed before". The skill is "ready to start", and the button "Practise" sends `skillchoose` with `detail` `{ skill: "example/fair-shares/skill/share-with-remainder" }`.
- **`count-objects` is expanded.** Its details stand after the tile, and `draw-shares` wraps below them. Lines go from the bottom edge of the details to `equal-groups`, `explain-sharing` and `halves`, and their tiles have "opens after". Tab from the tile `count-objects` leads to "Practise", and then to `draw-shares`.

### 3.5. Ranks

- **There are no ranks on the map** — neither for a skill, nor for a module, nor for a learner. The map speaks of mastery by the five states on the map, and for the adult also by the mastery band, by its title from the module manifest. A rank is "a step by which the display names mastery", in the glossary of `spec`, and what this step is in NovaTrail is decided by О-13.
- **What О-13 holds of the map's detailing:**
  - there can be no overall rank of a learner: the level is per module, and the scales of the modules do not add up;
  - a module's rank is the number of the band in which the module's level stands, "rank k of N", a number without a name, as MathTrail tells its ranks (sources 1.2). There is no module level in `GetSkillMap`: it needs a field of the contract and a rule of `learner-model`;
  - a skill's rank is the number of its mastery band. It asks for no fields, but a skill that is taught only in the lowest band will not rise above "rank 1";
  - the recommendation is a module's rank, if О-13 decides that ranks are seen, and until then none.
- **How ranks will come.** An attribute of the element will turn them on: `app` sets it by the learner's presentation style, on both views of the map, and without the attribute there are no ranks. The map does not know the presentation style and does not read the profile. The attribute's name and the look of the rank will be named by the decision that comes after О-13, as a change of the element's agreement; how the presentation style holds ranks is decided by О-13, О-23 and `app`.

### 3.6. Tiers — what `spec` decided

- The tier of a skill without prerequisites among the module's skills is 1, and that of the others is 1 higher than the highest tier of their prerequisites in the module: the number of skills in the longest chain of prerequisites that ends with the skill. A prerequisite always stands a tier lower, and there is no link from a higher tier to a lower one. There is no limit to the number of tiers. Anchor skills give no tiers.
- The names of the tiers are the optional list `tiers` in the graph, in the explanation language: the first name is that of tier 1. A tier without a name is shown by its number, and a name beyond the last tier names nothing.
- The tiers are computed by `module-kit` when it builds the package, and it puts them into the canonical view, `skill_tiers`; the tier vectors are in `format/vectors/tiers/` of `spec`. The tiers reach the map from `api` in the response of `GetSkillGraph`, beside the graph's open view. The map does not compute tiers.
- The graph is not fitted to the map's drawing, as MathTrail kept its chains within the three layers of its map (sources 1.1). The map may fold the distant tiers into a row instead, which is deferred — Д3 in [run/DEBT.md](../run/DEBT.md).
- In the first slice there are few tiers: 3 in `grade-3-math`, 4 in `english-essays` (`modules`, `main` 6d061e9) and 3 in the example of olympiad mathematics in the format (`spec/format/vectors/tiers/olympiad-math.yaml`).

### 3.7. Build, dependencies and publishing

What `spec` and the detailing decided for the package's code.
- **No framework.** The package is a web component: it needs no framework, and each consumer chooses its own itself. During development `app` links in the package's working copy, and only an exact version goes into a release. The second consumer — `site`, from stage 3 — gets a second build of the same package.
- **Dependencies.**
  - The data types are `@altnovatrail/spec` and `@altnovatrail/contracts`, at an exact version, the same as the tag of the submodule `spec`. `@altnovatrail/spec` is declarations alone, and it is in `dependencies`: the element's declarations refer to its types. `@altnovatrail/contracts` is the code of protobuf-es with a runtime, and it is in `devDependencies`: the package takes from it only `import type`, and the values of the enums are its own constants.
  - The icon set `@iconify-json/material-symbols` is in `devDependencies`, at an exact version, and only the package's own icons are embedded at build time.
  - The English titles of anchor skills come from the format file of a release of `spec`, checked by `release-verify`.
  - Only licenses compatible with Apache-2.0; the licenses of the lock file are checked by the recipe `licenses-check-repo` of `spec` in the repository's own `ci-licenses`.
- **Development tools.** The kind of the devcontainer is `typescript`, and `.devcontainer/` is what the template of the tag of `spec/` builds for that kind; the code adds no tool of its own to it. Biome is the formatter and the linter, `tsc` builds into `lib/` without a bundler, and Vitest runs the tests in Node and the element's in Chromium, WebKit and Firefox; their versions are in `package.json`. The package has two entry points — the element and the rule of the states, `./states` —, and the core without the DOM, `src/core/`, is a `tsc` program of its own, outside `exports` but for that one function. The element is its own code, without a library. `.devcontainer/Dockerfile` has three stages: `toolchain-core` — Node, just, Go and buf —, which the release and the checks without a browser run in; `toolchain` on it, with Chrome Headless Shell, WebKit and Firefox from the image of Playwright and their system packages, which apt takes from the snapshot of the Ubuntu archive alone, for `ci-test` and `ci-engines`; and `devcontainer`. The image and the browsers' revisions are pinned in the Dockerfile, and `playwright` in `package.json` is the image's version. The browsers are named exceptions to the rule of licenses, and so is axe-core, which runs in them. `devcontainer.json` sets `shutdownAction` to `none`: closing the window leaves the container running, since the orchestrator's executor works in it by `docker exec`. A container built by an older Dockerfile than the tree's is Д12.
- **The demo.** The map is tried by hand on the page `demo/`: `just demo` — a Vite server on the computer, `just demo-build` — a static build for a tablet. The graphs are the example, a graph of its own of eight tiers, the modules of the first slice from the release of `modules` and the tier vectors of `spec`, by pinned digests; `just demo-pin` checks the module index by `release-verify` and pins its sha256. The demo goes neither into the package nor into the release.
- **Tests and coverage.** The code comes with its tests, the coverage goes to Codecov, and a merge waits for `codecov/patch` at no less than 90 % of the changed lines. The README carries status badges. The checks are the recipes `ci-lint`, `ci-test`, `ci-engines`, `ci-vuln` and `ci-licenses` for the shared `typescript.yml` of `.github`, and locally `just ci`. Every reference to a shared workflow of `.github` in `.github/workflows/` is pinned to one release by its SHA, and Dependabot raises them as one group, `shared-workflows`. The jobs take the images of the stages from the cache of GitHub Actions by the hash of `.devcontainer/Dockerfile`, which only a push to `main` saves (sources 3.6): on a miss "TypeScript / toolchain" builds both for the checks of TypeScript — "lint", "vuln" and "licenses" in `toolchain-core`, "test" and "engines" in `toolchain` —, and "Documents / docs-check-repo" takes its own image of `toolchain-core` (sources 3.7). "TypeScript / engines" is the element's tests in WebKit and Firefox, by `ci-engines`, beside "TypeScript / test" in Node and Chromium with the coverage, which v8 counts in Chromium alone (sources 3.8). The rules that the tests check first: the states on the map, the order in a band and the expanding — on synthetic graphs, like the example `example/fair-shares`.
- **Release and publishing.** Everything that `skill-map` puts out is the files of one GitHub release with the signature of the shared `release.yml` of `.github`, and the same package file goes to npm, `@altnovatrail/skill-map`. `app` accepts the package from npm when `release-verify-npm` has accepted the lock file, in CI of the pull request that changes it. It is built by its own `release.yml` on the shared `release.yml` of `.github`, at the release of the other references, which builds the stage `toolchain-core` alone; the line 0.1; the recipe `release-files` with a check of the archive and a trial consumer; a trial run without publishing on every pull request. The releases are immutable, and the ruleset `v-tags` holds the tags `v*`.
- **Installing.** A consumer takes the package from npm at an exact version, `npm install --save-exact @altnovatrail/skill-map@<version>`, and beside it the packages of `spec` whose types the element's contract is in: `@altnovatrail/spec` at the version the package has in its `dependencies`, `npm install --save-exact --save-dev`, and `@altnovatrail/contracts`, the consumer's own, at the same version. Importing `@altnovatrail/skill-map` registers `<novatrail-skill-map>`, and importing `./states` registers nothing. A pull request of the consumer that changes the lock file runs `just -f spec/justfile release-verify-npm package-lock.json` from a checkout of `spec` at a tag: it takes the archive from the registry only if it is the same bytes as the file of `skill-map`'s release, signed by the shared `release.yml` of `.github` at the call of `skill-map`'s `release.yml` on `main`. README.md has no section on installing: it says only what the component is and where it stands.
- **License and access** — Apache-2.0; all the organization's repositories are public.

### 3.8. Words, icons and look

The standard is WCAG 2.2 AA with 2.5.5 and 2.3.3.

**Words** are the package's own table, `src/element/words.ts`. The language is the element's attribute `lang`: the tag is looked up by truncation, and one not found means English. The places of the templates are in curly braces; the number in "answers" takes the CLDR form of its language.

| Key | `en` | `ru` |
|---|---|---|
| a tier without a name | Tier {tier} | «Ярус {tier}» |
| a tier with a name | Tier {tier} · {name} | «Ярус {tier} · {name}» |
| the band of anchor skills | Skills from other modules | «Навыки других модулей» |
| "time to review" | Time to review | «Пора повторить» |
| "mastered" | Mastered | «Освоено» |
| "in progress" | In progress | «В работе» |
| "ready to start" | Ready to start | «Можно начинать» |
| "locked" | Locked | «Ещё закрыт» |
| "feedback by criteria" | Feedback by criteria | «Отзыв по критериям» |
| "not assessed" | Not assessed | «Без оценки» |
| "held" | Held | «Владеет» |
| "not held" | Not held | «Не владеет» |
| "unknown" | Unknown | «Неизвестно» |
| the reason "not mastered" | a skill that teaches it is not mastered yet | «не освоен навык, который ему учит» |
| the reason "no evidence" | no skill that teaches it has answers yet | «у навыков, которые ему учат, ещё нет ответов» |
| the reason "nobody teaches" | no module teaches it | «ему не учит ни один модуль» |
| the reason "taught only without a verdict" | only skills without a verdict teach it | «ему учат только навыки без вердикта» |
| "needed before" | needed before | «нужен раньше» |
| "opens after" | opens after | «откроется после» |
| "Builds on" | Builds on | «Опирается на» |
| "Opens" | Opens | «Открывает» |
| "Teaches" | Teaches | «Учит» |
| "Needed by" — for an anchor skill | Needed by | «Нужен для» |
| a prerequisite not mastered | {skill} — not mastered yet | «{skill} — ещё не освоен» |
| holding with a reason | {holding} — {reason} | {holding} — {reason} |
| an anchor skill that a skill teaches | {skill} — {holding} | {skill} — {holding} |
| "Practise" | Practise | «Заниматься» |
| "Waits for" | Waits for: {skills} | «Ждёт: {skills}» |
| answers | one: {count} answer; other: {count} answers | «one: {count} ответ; few: {count} ответа; many: {count} ответов; other: {count} ответа» |
| the last practice | Last practised {date} | «Последнее занятие: {date}» |
| the mastery band | Mastery band: {band} | «Полоса освоения: {band}» |
| the review date | Review on {date} | «Повторить {date}» |

Between the parts of a tile's accessible name stands ", " in both languages. The titles of the module's skills and the names of the tiers are in the module's explanation language, and those of anchor skills are English, with `lang="en"`. The words of the five states and the two marks are shared: they stand in the shared table of words of the UI packages in `spec`, as `src/element/words.ts` has them, and the legend of the module card of `app` shows them too, by the values of `./states`. The map has no other words that another package shows.

**Icons** are Material Symbols, Rounded, outlined, `material-symbols:<base>-outline-rounded`, from `@iconify-json/material-symbols` at the version of `package.json`; a new version comes only by a row of COORDINATION.md of `spec`, together with `canvas` and `app`, and Dependabot does not raise it. The icons of the five states and the two marks are shared: they stand in the shared table of icons of the UI packages in `spec`, as `src/element/icons.ts` has them, and the module card of `app` shows them too. The three of the holdings of an anchor skill stand for meanings of `skill-map` alone, no value of another package takes an icon of the map, and none is mirrored right to left.

| Meaning | Base |
|---|---|
| "time to review" | `update` |
| "mastered" | `check-circle` |
| "in progress" | `timelapse` |
| "ready to start" | `lock-open-right` |
| "locked" | `lock` |
| "feedback by criteria" | `rate-review` |
| "not assessed" | `remove-done` |
| "held" | `verified` |
| "not held" | `radio-button-unchecked` |
| "unknown" | `question-mark` |

The icon stands before the word — on the tile and in the details —, is hidden from the accessibility tree and has the color of the text. The label is always visible, and the name is its text.

**The theme** is set by CSS custom properties: they are inherited from the parent, and the element reads them inside its own tree, as `canvas` does (sources 2.3):
- `--novatrail-skill-map-paper` — the background of the map, the tiles and the details, by default `#fff`;
- `--novatrail-skill-map-ink` — the text, the borders and the icons, `#111`;
- `--novatrail-skill-map-accent` — the expanded tile, the borders of the linked tiles and of the details, "Practise", the focus ring and the lines; `#1d4ed8`, 6.7:1 against white;
- the default stands at each `var()`, not in `:host`. An invalid value does not give the default: the property computes to `unset`, the text takes the host's color, and the background is transparent;
- the states have no colors of their own. A locked tile has a dashed border, the linked ones an accent border of 2 px, and the expanded one is filled with the accent;
- in the forced colors mode the colors are the system ones: the tiles and "Practise" — ButtonFace, ButtonText and ButtonBorder, the expanded tile — Highlight and HighlightText, the linked ones — a Highlight border, the map and the details — Canvas and CanvasText.

The package checks the contrast of the defaults itself, by axe-core in the tests. The contrast of a theme that the consumer sets is the consumer's: `app` checks its own colors.

**Targets and wrapping.** A tile and "Practise" are no smaller than 44 × 44 CSS px. The sizes are in `rem` and `em`, and the text grows with the page zoom; a long title wraps, and at 320 CSS px nothing scrolls sideways. The focus ring is 3 px of the accent with an offset of 2 px, `:focus-visible`.

**Motion.** There is none: no transition and no animation, for the lines too, so there is nothing to turn off by `prefers-reduced-motion`.

**Declared nonconformances** — none: axe-core with the tags of WCAG 2.0, 2.1 and 2.2 A and AA finds no violations on any view and in any language, and the tests hold what axe does not see: the targets, the wrapping, the theme, the forced colors, motion and the focus. What `app` answers for, not the package: that a sticky header does not cover the focus (2.4.11), and the contrast of its own theme. What a trial on a device finds goes here — the criterion, what there is instead and when it goes away; the trial is Д4 of [run/DEBT.md](../run/DEBT.md).

## 4. Sources

The records of external facts are in [sources.md](sources.md), and a claim here cites its one record by number, as `sources 2.1`. By topic:
- the topic map and the tiers in MathTrail — sources 1.1; ranks in MathTrail — sources 1.2; the layout of the topic map in MathTrail — sources 1.3;
- WCAG 2.2 for the layout — sources 2.1, for the look of the map — sources 2.2; forced colors and CSS custom properties — sources 2.3; observing the size — sources 2.4;
- the layout libraries — sources 3.1; the tools of the code — sources 3.2; the demo — sources 3.3; the packages of words, icons and the check — sources 3.4;
- the topic map of the prototype — sources 4.1.
