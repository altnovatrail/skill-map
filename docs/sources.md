# skill-map — sources

> The external facts the repository's documents under `docs/` rest on: a provider's terms, a price, a law, a standard, a library's documentation. Here are their records — the address, the version or date of the page, the date it was read and a quote in the source's language — and [architecture.md](architecture.md) and the decision log hold the claim and a citation of the record by its number, as a section: `sources 1.1` (RULES.md, The bar; R143 spec).
>
> A record is a subsection "N.M" of a topic: one source, or one reading of several sources for one decision. A record's number never changes: a new one goes at the end of its topic, a new topic at the end of the file. A source read again is an item with its date in the same record, and the earlier text is not edited. The model is sources spec. The results of measurements are not here but in `docs/measurements.md`, which the first measurement starts.
>
> Until 2026-11-12 the records stood in architecture 4, which stays as a pointer to them: the decision log and the archives of `docs/plan/` cite it, and they are not rewritten (R18).

## 1. MathTrail

### 1.1. The topic map and its layers

Sections 3.4 and 3.6 of [architecture.md](architecture.md); R06. [mathtrail/mathtrail-standalone, `SPEC.md`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/SPEC.md), section 8.12.2 "The site", branch `main`, commit c6cbeb2, read 2026-10-19: «a topic's layer is the longest chain of bases below it — 0 the foundations, 1 the rules, 2 the hard problems — computed rather than drawn, and a test on the catalog keeps the chains within three layers»; «The map is laid out when the site is built …: a column for each layer, from left to right in every language as a drawing is»; «a link to the next column is a curve, and a link that skips one runs under every box»; «Pointing at a topic, or reaching it with the keyboard, lights every topic below it and above it and the lines between them … no script runs»; «On a narrow screen the map scrolls sideways inside its panel».

### 1.2. Ranks

Section 3.5 of [architecture.md](architecture.md); R07. The same commit c6cbeb2, read 2026-10-19:
- [`SPEC.md`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/SPEC.md), section 2.4 "The chess scale and the ranks": «Above the number comes a rank: eleven steps, told by their numbers — "Rank 3", "of 11" — with no names of their own»; the rating is computed both overall and by topic: «applied to θ + δ_topic, the rating for a topic»;
- [`docs/decisions.md`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/docs/decisions.md), entry R213 standalone: «A rank is told by its number»; «a topic's rank is "Rank 4" at the end of its row»; «the eleven names of the dictionaries are gone»;
- [`internal/domain/rating/scale.go`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/internal/domain/rating/scale.go), the function `Rank`: «It is worked out wherever it is drawn and stored nowhere». The server calls it when it gathers the progress ([`internal/domain/progress/progress.go`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/internal/domain/progress/progress.go)), and the answer of the progress carries the overall rank in the field `rank` and the number of ranks of the scale in the field `ranks` — «so that a card need not know the number» —, and each topic has a field `rank` of its own ([`internal/transport/mcp/progress.go`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/internal/transport/mcp/progress.go), the types `standingOut` and `topicOut`).

### 1.3. The layout of the topic map

Section 3.4 of [architecture.md](architecture.md); R06. [mathtrail/mathtrail-standalone, `web/src/site/topicmap.ts`](https://github.com/mathtrail/mathtrail-standalone/blob/6b29dd9/web/src/site/topicmap.ts), branch `main`, commit 6b29dd9, read 2026-11-07: «each in the column of its layer, the foundations in the catalog's order and every other column by where its topics' bases stand, so that lines cross as little as a simple rule allows»; «A link to the next column is a curve between the two boxes; a link that skips a column runs down a gutter, along a lane of its own under every box, and up the next gutter»; the lighting is given by CSS rules written at build time, «and need no script; a browser that cannot read them shows the map unlit». The map is drawn by [`web/src/site/TopicMap.tsx`](https://github.com/mathtrail/mathtrail-standalone/blob/6b29dd9/web/src/site/TopicMap.tsx) of the same commit: «it scrolls sideways inside its panel where the screen is narrower than it».

## 2. Web standards

### 2.1. WCAG 2.2 for the layout

Section 3.4 of [architecture.md](architecture.md); R06 and the 2026-11-07 amendment to R04. [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation 12 December 2024, read 2026-11-07:
- 1.4.10 Reflow: «Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels. Except for parts of the content which require two-dimensional layout for usage or meaning». Note 2 of [Understanding 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): «Examples of content which requires two-dimensional layout are images required for understanding (such as maps and diagrams), video, games, presentations, data tables (not individual cells), and interfaces where it is necessary to keep toolbars in view»;
- 2.5.7 Dragging Movements: «All functionality that uses dragging movements can be operated by single pointer activation without dragging, unless dragging is essential»;
- 1.3.1 Info and Relationships: «Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text» — for the level of the bands' headings, the 2026-11-07 amendment to R04;
- 1.3.2 Meaningful Sequence: «When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined»;
- 2.4.3 Focus Order: «focusable components receive focus in an order that preserves meaning and operability»;
- 2.4.11 Focus Not Obscured (Minimum): «When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content»;
- 1.4.1 Use of Color: «Color is not used as the only visual means of conveying information»;
- 1.4.11 Non-text Contrast: «a contrast ratio of at least 3:1 against adjacent color(s): User Interface Components and Graphical Objects».

### 2.2. WCAG 2.2 for the look of the map

Section 3.8 of [architecture.md](architecture.md); R10. [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation 12 December 2024, read 2026-11-07:
- 1.4.3 Contrast (Minimum): «The visual presentation of text and images of text has a contrast ratio of at least 4.5:1»;
- 1.4.11 Non-text Contrast: «Visual information required to identify user interface components and states» — «a contrast ratio of at least 3:1 against adjacent color(s)»;
- 1.4.12 Text Spacing: «no loss of content or functionality occurs by setting all of the following and by changing no other style property: Line height (line spacing) to at least 1.5 times the font size»;
- 2.4.7 Focus Visible: «Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible»;
- 2.5.5 Target Size (Enhanced): «The size of the target for pointer inputs is at least 44 by 44 CSS pixels»;
- 2.3.3 Animation from Interactions: «Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed».

### 2.3. Forced colours and CSS custom properties

Section 3.8 of [architecture.md](architecture.md); R10. Read 2026-11-07:
- [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/), W3C Working Draft 19 February 2026, `forced-colors`: «active — Indicates that forced colors mode is active: the user agent enforces a user-chosen limited color palette on the page» and «When forced colors mode is active, the only colors that are available to the author are system colors»;
- [CSS Custom Properties for Cascading Variables Level 1](https://www.w3.org/TR/css-variables-1/), CR Snapshot 16 June 2022, section 3.1: the value of a property invalid after the substitution of `var()` is «Either the property's inherited value or its initial value depending on whether the property is inherited or not, respectively, as if the property's value had been specified as the unset keyword».

### 2.4. Resize Observer

Section 3.4 of [architecture.md](architecture.md); R11. [Resize Observer](https://www.w3.org/TR/resize-observer/), W3C First Public Working Draft 11 February 2020, read 2026-11-07: «Observation will fire when observation starts if Element is being rendered, and Element's size is not 0,0»; «Observations do not fire for non-replaced inline Elements» — so the tiles' buttons, the details and the map itself are observed, not the inline parts of the tiles.

## 3. Packages and releases

### 3.1. Layout libraries

Section 3.4 of [architecture.md](architecture.md); R06. The npm registry, `npm view <package> version license description` and the package's README, read 2026-11-07:
- [`@dagrejs/dagre`](https://www.npmjs.com/package/@dagrejs/dagre) 3.1.3, MIT: «Dagre is a JavaScript library that makes it easy to lay out directed graphs on the client-side»; the former package `dagre` is 0.8.5, and the README says that only the one in the DagreJs organization is updated;
- [`elkjs`](https://www.npmjs.com/package/elkjs) 0.12.1, `EPL-2.0 OR GPL-3.0-or-later`: «Automatic graph layout based on Sugiyama's algorithm»; «elkjs is not a diagramming framework itself - it computes positions for the elements of a diagram»;
- [`d3-dag`](https://www.npmjs.com/package/d3-dag) 1.3.0, MIT: «`d3-dag` provides layered graph layout algorithms for directed acyclic graphs».

### 3.2. The tools of the code

Section 3.7 of [architecture.md](architecture.md); R08.
- The npm registry, `npm view <package>@<version> license time` and `peerDependencies`, read 2026-11-07: `typescript` 7.0.2 — Apache-2.0, the latest; `@biomejs/biome` 2.6.4 of 2026-10-28 — `MIT OR Apache-2.0`, and 2.6.6 came out 2026-11-06; `vitest`, `@vitest/browser-playwright` and `@vitest/coverage-v8` 5.1.0 of 2026-11-02 — MIT; `vite` 8.3.5 — MIT, and 8.3.6 came out 2026-11-05; `playwright` 1.64.1 — Apache-2.0, and 1.65.0 came out 2026-11-05; on 2026-11-11 raised to 1.65.0 — Apache-2.0, and `playwright-core` of the same version too (R17); `@types/node` 24.19.2 — MIT; `lightningcss` 1.33.0 — MPL-2.0; `typescript-eslint` 8.72.1 requires `"typescript": ">=4.8.4 <6.1.0"`; `lit` 3.3.3 — BSD-3-Clause. `@altnovatrail/contracts` 0.9.5 — Apache-2.0, with the dependency `@bufbuild/protobuf` 2.16.0 (`Apache-2.0 AND BSD-3-Clause`), and in `novatrail/api/v1/progress_pb.d.ts` of the package the enumerations are `export enum`, generated by protoc-gen-es v2.16.0.
- The npm registry, `npm view <package>@<version> license dependencies` and `npm view @bufbuild/protobuf time`, read 2026-11-12 (R18): `@altnovatrail/spec` 0.16.3 and `@altnovatrail/contracts` 0.16.3 — Apache-2.0; `@altnovatrail/contracts` 0.16.3 depends on `@bufbuild/protobuf` 2.17.0, `(Apache-2.0 AND BSD-3-Clause)`, published 2026-11-05.

### 3.3. The demo

Section 3.7 of [architecture.md](architecture.md); R12.
- Read 2026-11-07: the release [`modules` v0.1.0](https://github.com/altnovatrail/modules/releases/tag/v0.1.0) of 2026-11-07: `module-index.json` with three modules of format 0.3 — `novatrail/english-essays`, `novatrail/grade-3-math` and `novatrail/olympiad-math` 0.1.0; a package is an archive `sha256-<digest>.tar.gz` with `inventory.json`, `server.json` and `device.json`, and `package_digest` is the sha256 of `inventory.json`, not of the archive. `release-verify` accepted the index: «module-index.json: modules v0.1.0, signed by the shared release.yml of .github v0.1.15»; `yaml` 2.9.1 of 2026-09-11 — ISC (the npm registry, `npm view yaml@2.9.1 license time`).
- From 2026-11-11 (the amendment to R12; R16), read 2026-11-11: the release [`modules` v0.2.5](https://github.com/altnovatrail/modules/releases/tag/v0.2.5) of 2026-11-11: `module-index.json` holds the former entries of format 0.3 and entries of format 0.4. The latest versions of format 0.4: `novatrail/english-essays` 0.2.0 from the release v0.2.0, `novatrail/grade-3-math` 0.3.0 and `novatrail/olympiad-math` 0.3.0 from the release v0.2.1. The packages are built the same way. `release-verify` accepted the index: «module-index.json: modules v0.2.5, signed by the shared release.yml of .github v0.1.15».

### 3.4. The packages of words, icons and the check

Section 3.8 of [architecture.md](architecture.md); R10. The npm registry, `npm view <package> version license time dependencies`, read 2026-11-07: `@iconify-json/material-symbols` 1.2.97 of 2026-10-28 — Apache-2.0, and 1.2.98 came out 2026-11-07, later than the pause of three days (R08); on 2026-11-11 the set was raised to 1.2.98 — Apache-2.0, the same dependency, `@iconify/types` (the amendment to R10); `@iconify/utils` 3.1.7 of 2026-09-06 — MIT, with the dependencies `@iconify/types`, `@antfu/install-pkg` and `import-meta-resolve`; `axe-core` 4.14.0 of 2026-10-05 — MPL-2.0, with no dependencies, and in it the tag `wcag22aa` has one rule, `target-size`, and `wcag22a` none.

## 4. The prototype of `spec`

### 4.1. The topic map of the prototype

Section 3.4 of [architecture.md](architecture.md); R06. `spec/draft/NovaTrail Widget.html` at the tag v0.9.5 — the same at v0.9.8, v0.9.9, v0.15.0 and v0.16.3 —, the code of the map's screen, `tsteps`: the steps — «Step 1 · Basics», «Step 2 · Rules», «Step 3 · Hard tasks» — go one under another; a step is open when it is no further than one from the chosen topic, and otherwise folded into a row of titles; the topics carry the marks `BEFORE` and `AFTER` relative to the chosen one; the chosen one has a panel with the button «Practise: …», and a closed one — «Opens in grade 5».
