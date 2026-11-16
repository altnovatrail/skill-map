# QUESTIONS.md — questions to the author of `skill-map`

Table 3 of [RUN.md](../RUN.md): the author's open questions from tasks' «Открыто» (R153 spec, R154 spec).

- Never read whole: take the rows the task and its sections name — `grep -n '^| В11 ' run/QUESTIONS.md` — and those `grep -n` finds by the paths and parts it changes (RUN.md rule 2).
- A row comes from a task's «Открыто» (RUN.md rule 9). Record the author's answer where it belongs — the task, a document or [DEBT.md](DEBT.md) — and delete the row.
- A row whose question opens with the mark «В реестр spec» is for `spec`: its session finds it on `main` (R81 spec; RULES.md, Across repositories). It leaves once `spec` has recorded it: the task that rests on it names its number.
- «В11» of table 3 of RUN.md before T24 is the same row (R21).

## Table 3. Questions to the author

Numbers are not reused: next — В14.

| ID | Question | From | Options | Recommendation |
|---|---|---|---|---|
| В11 | Does the map show the modules of `teaching_modules` that teach an anchor skill whose holding is "unknown" (Д211 spec) — [docs/architecture.md](../docs/architecture.md), section 2.5 | R18; Д211 spec | (a) not on the map: `app` shows them beside it, and the element's agreement stays as it is; (b) on the map, in the details of the anchor skill: a new property with the modules' titles and a new event to connect one — amendments to R03 and R04 and a row «В реестр spec» on the card architecture 3.3 spec | (a), until `app` decides its screen in epic E3 of its RUN.md: connecting is an action on the profile, not on the map |
| В12 | «В реестр spec»: row 6.19 of COORDINATION.md spec is done — `./states` is in the package (the second 2026-11-16 amendment to R08, T26), and `app` takes it with the release after the merge. The card architecture 3.3 spec still says the function «waits for an amendment to R08 skill-map»; what does it say now? | T26; R08 | (a) the card: the rule is at `./states`, `skillStates(graph, skillMap, now)`, seven values named as the values of architecture 6 spec — `time-to-review`, `mastered`, `in-progress`, `ready-to-start`, `locked`, `feedback-by-criteria`, `not-assessed`; row 6.19 — `[x]`; (b) the card names only the entry point, and the values stay in [docs/architecture.md](../docs/architecture.md), section 3.3 | (a): the values are the agreement with `app`, and the card is where `app`'s session reads it |
