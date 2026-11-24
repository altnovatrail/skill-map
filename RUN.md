# RUN.md — work plan of skill-map

What skill-map does, does not do and has still to decide — [docs/architecture.md](docs/architecture.md); why — [docs/decisions.md](docs/decisions.md). The platform is in `spec/`, a submodule at tag v0.19.17: the component's card — the one in `spec/docs/architecture.md` whose heading names `skill-map`. Small tasks, one at a time, gathered in epics; only the current epic is in detail. Other tables, each a file opening with its rules: 2, epics for later — [run/EPICS.md](run/EPICS.md); 3, questions to the author — [run/QUESTIONS.md](run/QUESTIONS.md); 4, debt — [run/DEBT.md](run/DEBT.md). Open tasks outside an epic — [run/TASKS.md](run/TASKS.md).

Language: rules and tables in English, terse, for the session; the epic's description, table 1 and the bodies of tasks in Russian — the author writes and reviews them.

## Rules

A task starts with «Выполни задачу T01 из RUN.md» in a new session in the devcontainer. One task — one session: the hook `UserPromptSubmit` of [.claude/settings.json](.claude/settings.json) stops a phrase that starts another task in the same session.

1. Do only the named task; touch other tasks' files only where it requires.
2. Read first: [CLAUDE.md](CLAUDE.md) with RULES.md of `spec/`, the task — in table 1, or only its own body of [run/TASKS.md](run/TASKS.md) (its opening says how) —, what it names — its own and spec's —, [docs/decisions.md](docs/decisions.md).
   - Conflict with the documents or something missing — stop and ask; never guess.
   - A gap in the component itself — a point of what is still to decide in [docs/architecture.md](docs/architecture.md). A gap across repositories — a row of [run/QUESTIONS.md](run/QUESTIONS.md) whose question opens with the mark «В реестр spec»: spec's session finds it on `main`, and it gets its О-, П- or Т- number once the author decides it there.
   - From [run/DEBT.md](run/DEBT.md) and [run/QUESTIONS.md](run/QUESTIONS.md) take only the rows the task and its sections name and those `grep -n` finds by the paths and parts it changes.
3. Devcontainer only, with `spec/` checked out, by `spec/RULES.md` and [CLAUDE.md](CLAUDE.md).
4. Outside this repository — editing `spec` or other repositories, their settings, anything that costs money — only after a warning (what, where, cost) and the author's confirmation. `spec/` is read only here; a task of its own moves it to a new tag.
   - Exception, no confirmation: the task's checks — the browser is Playwright in the devcontainer. `skill-map` fetches no data and has no account or AI of its own: it draws what `app` hands it, so a sign-in of a stand-in user or an AI call never arises.
   - Nothing on devices: the engines are Chromium, WebKit and Firefox in CI; what only a device shows — touch, VoiceOver and TalkBack — stays a row of [run/DEBT.md](run/DEBT.md), as Д4, until the author decides otherwise.
5. External facts — from the primary source, with quote and date read, as a record of [docs/sources.md](docs/sources.md). What is not confirmed is not stated: it becomes an open question.
6. End with the checks of what the task changed. Documents: `just -f spec/justfile docs-check-repo` — relative links lead to existing files and headings; the rule of citations of `spec/RULES.md` holds, where [docs-budgets.json](docs-budgets.json) sets `"citations": true`; each record of spec cited — `sources 2.3 spec`, `measurements 1.4 spec` — and each О-, П-, Т- exists in `spec/` at its tag; own records exist, R numbers in the headings of the log have no gaps or repeats and the log's opening names the next free one; numbers В in [run/QUESTIONS.md](run/QUESTIONS.md) and Д in [run/DEBT.md](run/DEBT.md) do not repeat and the next free one is above each. A part of the code — its rule in `.claude/rules/`. Then `/code-review high`, one round: fix the findings, do not rerun. A small change may skip the review — the executor decides.
7. Do not commit: the author commits after review. Otherwise only on the author's word «доведи до мержа», and in a task of spec's orchestrator, «Сделай эпик E…»: its executor works by the contract `spec/tools/orchestrator/executor.md` — commits, pushes and opens the pull request, never merges.
8. End with a short report in Russian: what was done, files, how to check, what the review found or why there was none, what is open and what goes «в реестр spec».
9. When done: table 1 `[ ]` → `[x]`; append to the body «Сделано (дата)» — one line, what was done and its pull request, which says how it was checked; where the author commits after review, the report says it. What stays open is rows, not text: a question for the author, of [run/QUESTIONS.md](run/QUESTIONS.md); what is put off, of [run/DEBT.md](run/DEBT.md).
   - Then move the body verbatim, relative links fixed, to the epic archive `docs/plan/<epic>.md`, with a gist sentence — an unheaded list item at the start of the receiving section: «T01 — сделана <дата>: <итог одной фразой>». Neither stays here, and a search by heading finds one body, in the archive.
   - A task outside an epic leaves [run/TASKS.md](run/TASKS.md) for the current epic's archive, section «Задачи вне эпика, сделанные за его время»; with no current epic, for the last done epic's archive, section «Задачи вне эпика, сделанные после него».
10. Language, by `spec/RULES.md`; above, «Language».
11. A task larger than one review (≈ 30–60 minutes of reading): propose a split before starting.
12. Before a new task, close the findings on the previous one; an allowed departure from rule 1.
    - SonarCloud sees merged code: [New Code](https://sonarcloud.io/summary/new_code?id=altnovatrail_skill-map); CodeQL and Scorecard — `gh api 'repos/altnovatrail/skill-map/code-scanning/alerts?state=open'`.
    - Fix in code first; "false positive" is the last resort, with the reason in words — shared reasons in spec's log, own ones in this log. Never skip silently.
    - Report these fixes in a separate paragraph: the author commits them apart from the task.

**Statuses:** `[ ]` not started; `[x]` done, the executor marks it; `[-]` not done — the author's decision, reason in the task; `[?]` deferred — the author's decision, reason and when to return in the task. A task that fails the author's review returns to `[ ]` with what to fix.

**Who:** «Claude» — the executor does it, the author reviews; «Claude, проверяю я» — texts the author reads line by line; «я + Claude» — the author does some steps: decisions, sign-ins, GitHub settings, confirmations by rule 4.

**Plan:** «да» — plan mode first: decisions missing from the documents, or larger than one review (rule 11); «—» — run at once.

**Task body** (Russian): «Цель», «Сделать», «Как проверить», «Разделы»; as needed «Не делать», «Решить при планировании», «Мой шаг», «Стоимость», «Риски»; from planning «Почему», «Решено автором (дата)», «Выяснилось при планировании»; when done «Сделано (дата)» (rule 9).

**Citations** — by `spec/RULES.md`: a task's number and a dated line stand only here, in `run/` and in `docs/plan/`; outside them a text cites no decision and no section, and only a claim about the outside world cites its record — `sources 1.1` or `measurements 1.1`, spec's `sources 2.3 spec`. spec's open questions — «Т-22», «П-7», «О-2» — stand anywhere: the repository keeps no registers. A task — «T03», from another repository «T03 skill-map»; one not here is in `run/TASKS.md` or an archive: `grep -n '^#### T03\.' RUN.md run/TASKS.md docs/plan/*.md`. Task numbers are global and never reused: take the one free when writing it down.

## Epics

- **Table 1** is the current epic: its tasks in detail, run one at a time.
- **Next epic.** Once table 1 is all checked, the author picks the next epic from [run/EPICS.md](run/EPICS.md) and splits it with Claude in plan mode into tasks of one review each, into table 1 and this file.
- **A done epic** goes to `docs/plan/<epic>.md`: bodies and gist sentences are there already (rule 9); move its description and table of tasks verbatim; questions and debt stay in `run/`; until the next epic, table 1 reads «Current epic — none» and names it as the last done epic. Measure the epic's sessions — `just -f spec/justfile tokens-report --since <first day of the epic> --row` — as a row of [docs/measurements.md](docs/measurements.md), by the model of `spec/docs/measurements.md`; a new analysis once the measurement passes spec's threshold for one.
- Never read an archive whole: take the task cited, by its heading (above, «Citations»).

## Table 1. Current epic — none

The last done epic — E3, [docs/plan/E3.md](docs/plan/E3.md); the next one is the author's choice.
