# skill-map — measurements

> The results of the repository's measurements: what was measured, how, on what, and what numbers came out. The documents that describe how things are built — [architecture.md](architecture.md) and the decision log — refer here and hold no numbers of measurements themselves (R143 spec). A measurement is cited by section, like any document: `measurements 1.1`. The model is measurements spec.
>
> An external fact a measurement rests on is a record of [sources.md](sources.md).

## 1. Claude Code sessions

How much the Claude Code sessions of `skill-map` spend, measured by spec's recipe `tokens-report` on the transcripts of `-workspaces-skill-map` on the author's machine (measurements 1.1 spec). The figures here are only sums. There is no text of transcripts, neither here nor in the recipe's output.

### 1.1. Before and after the restructuring

What the rules of R143 spec and R145 spec changed in the sessions of `skill-map`: the restructuring of R18 — `.claude/settings.json` with the hook of one task in one session, the rule of the part `package`, `DEBT.md`, `docs/sources.md` — and the translation of `docs/` into English by RUN.md, T22. Measured 2026-11-12. "Before" is the row of `skill-map` in measurements 1.9 spec; "after" is `just -f spec/justfile tokens-report --since 2026-11-12T20:30 --row`, from the start of the session of R18, and the two windows do not overlap. The columns are those of measurements 1.9 spec.

| Project | Window, UTC | Sessions | Calls, main / subagents | Context of a call, k, main / subagents | Compactions | Cost at API prices |
|---|---|---|---|---|---|---|
| `-workspaces-skill-map` — before, measurements 1.9 spec | 2026-10-13T00:00 … 2026-11-12T14:27 | 6 | 1,313 / 402 | 329.5 / 81.4 | 1 | $162.58 |
| `-workspaces-skill-map` — after: R18 and T22 | 2026-11-12T20:30 … 2026-11-12T22:12 | 2 | 198 / 237 | 177.0 / 88.1 | 0 | $25.21 |

- The context of a main call fell from 329.5 to 177.0 thousand, −46%; that of a subagent's call rose from 81.4 to 88.1.
- The windows differ in work: "before" holds the detailing, the first code and the moves to tags of epics E1–E3 and of R15–R17; "after" holds the move to v0.16.3 with the restructuring, R18, and the translation of 265 KB of Russian text by seven subagents of T22 — five translators and two blind readers —, which make most of its calls of subagents.
- With 198 main calls the row is below the 300 that the threshold of R145 spec counts over, so it is not a reference: the reference of `skill-map` is its measurement after by T124 spec (measurements 1.9 spec).
