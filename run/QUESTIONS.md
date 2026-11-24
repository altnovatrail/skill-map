# QUESTIONS.md — questions to the author of `skill-map`

Table 3 of [RUN.md](../RUN.md): the author's open questions that tasks leave.

- Never read whole: take the rows the task and its sections name — `grep -n '^| В11 ' run/QUESTIONS.md` — and those `grep -n` finds by the paths and parts it changes (RUN.md rule 2).
- A row is a question a task leaves open (RUN.md rule 9). Record the author's answer where it belongs — the task, a document or [DEBT.md](DEBT.md) — and delete the row.
- A row whose question opens with the mark «В реестр spec» is for `spec`: its session finds it on `main`. It leaves once `spec` has recorded it: the task that rests on it names its number.

## Table 3. Questions to the author

Numbers are not reused: next — В17.

| ID | Question | From | Options | Recommendation |
|---|---|---|---|---|
| В11 | Does the map show the modules of `teaching_modules` that teach an anchor skill whose holding is "unknown" (Д211 spec) — [docs/architecture.md](../docs/architecture.md), section 2.5 | R18; Д211 spec | (a) not on the map: `app` shows them beside it, and the element's agreement stays as it is; (b) on the map, in the details of the anchor skill: a new property with the modules' titles and a new event to connect one — R03 and R04 rewritten in place and a row «В реестр spec» on the card architecture 3.3 spec | (a), until `app` decides its screen in epic E3 of its RUN.md: connecting is an action on the profile, not on the map |
| В15 | Решено исполнителем по рекомендации, до проверки автора. The decision on the plan's rules said RUN.md leaves out the template's block «Citations» and that rule 6 does not list what `docs-check-repo` checks; the move to spec v0.19.12 took both by the template, so the entry no longer told the state — [docs/decisions.md](../docs/decisions.md), "The plan" and "The plan in `run/`" | R19, R21; T45, T48 | (a) the entry tells the state in force: the block «Citations» and rule 6 are the template's, rule 6 names besides the key `"citations"` and the rules of the parts; R21 no longer rejects the template's block; (b) RUN.md back to the shorter rule 6 and without the block, as the entry had it — against the template that the strict rule of citations brought | (a), done in T45: the move took the template's rules on purpose, for the strict rule of citations, and the log holds the text in force |
| В16 | В реестр spec. Rows Д88, Д146, Д217 and Д235 of spec's `run/DEBT.md` at v0.19.17 still name `skill-map` as pending, but each is done here: `.github/dependabot.yml` has the group `shared-workflows`; the workflows call `.github` v0.1.33, with the cached `toolchain` image; R02 names WebKit and Firefox beside Chrome Headless Shell, and `ci-engines` runs the element's tests in them; rule 9 of RUN.md sends a done task outside an epic to the last done epic's archive, and the body of T22 is in [docs/plan/E3.md](../docs/plan/E3.md) | T50 | (a) spec drops `skill-map` from the four rows, and deletes a row that names no other repository; (b) the rows stay as they are | (a): what is left in them for `skill-map` is nothing, and a stale row sends the next move to a tag to check it again |
