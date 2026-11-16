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

## 2. The speed of CI

How long the checks of `skill-map` take on GitHub Actions, read by `gh run view <run> --json jobs` from the times each job and step started and completed. The model is measurements 3.1 spec, which measured `skill-map` 2026-11-15 on `.github` `v0.1.15`: CI 2.2–3.3 minutes, the longest job `TypeScript / lint` at 97 s, the image of the stage `toolchain` built in each job in 75–85 s.

### 2.1. Before and after the image from the cache

What R22 changed, the move to `.github` `v0.1.24`, whose jobs take the image of the stage `toolchain` from the cache of GitHub Actions by the sha256 of `.devcontainer/Dockerfile`. Measured 2026-11-16, on the runs of CI after a push to `main`; a run's time is from its creation to its last job's end.

| Run | Commit of `main` | `.github` | CI | `lint` | `test` | `licenses` | `vuln` | `docs-check-repo` | The image in a job |
|---|---|---|---|---|---|---|---|---|---|
| 43799443476 | `a28a9da`, T24 | `v0.1.15` | 273 s | 208 s | 200 s | 207 s | 200 s | 206 s | built |
| 43813288938 | `732ad79`, T26 | `v0.1.24` | 169 s | 67 s | 68 s | 63 s | 53 s | 75 s | from the cache: the restore 10–18 s, `docker load` 30–38 s |

- In the run on `v0.1.24`, the step `ci-lint` took 10 s, `ci-test` 13 s and `ci-vuln` 1 s: the rest of each job is the image, and the image is what the next release of `.github`, row 7.13 of COORDINATION.md spec, and the stage `toolchain-core` of row 7.14 still change (T28, done, in [plan/E3.md](plan/E3.md), and T29 in `run/TASKS.md`; 2.2).
- The release after that CI, run 43813588207, took 6 min 12 s from its creation, its job 5 min 25 s: the release still builds the whole stage `toolchain`, with the browsers.

### 2.2. Before and after `.github` v0.1.30

What the 2026-11-16 amendment to R22 changed, the move to `.github` `v0.1.30`, row 7.13 of COORDINATION.md spec without its last part, the stage `toolchain-core` (T29). Measured 2026-11-16 as 2.1 is, on runs of CI of a pull request, before and after, and on the run of `main` of 2.1; all four took the image from the cache, by the same hash of `.devcontainer/Dockerfile`. The run of a pull request also waits for runners, so its time from creation is less comparable than its jobs'.

| Run | Commit | `.github` | CI | `toolchain` | `lint` | `test` | `licenses` | `vuln` | `docs-check-repo` | The image in a job: restore + `docker load` |
|---|---|---|---|---|---|---|---|---|---|---|
| 43812285944 | `d8b5a5a`, pull request #51 | `v0.1.24` | 476 s | — | 60 s | 74 s | 70 s | 65 s | 73 s | 14–18 s + 30–36 s |
| 43813288938 | `732ad79`, `main` | `v0.1.24` | 169 s | — | 67 s | 68 s | 63 s | 53 s | 75 s | 10–19 s + 30–38 s |
| 43856964964 | `122db35`, pull request #52 | `v0.1.30` | 114 s | 14 s | 78 s | 67 s | 76 s | 82 s | 89 s | 10–20 s + 30–57 s |
| 43862869688 | `f3ec9d5`, pull request #52 | `v0.1.30` | 93 s | 8 s | 69 s | 66 s | 68 s | 66 s | 66 s | 11–18 s + 29–37 s |

- On a hit of the cache `v0.1.30` shortens no job: the restore and `docker load` are the same steps, and their spread, 30–57 s for `docker load` of one file, is the runners'. It lengthens the path of the checks of TypeScript instead: the job `toolchain`, 8–14 s, only looks the entry up, and the four checks start after it, 13–20 s after the run, where at `v0.1.24` nothing held them. On a hit, the usual case, the checks of TypeScript so end some 10–20 s later, not sooner; 93–114 s against 476 s is the queue of runners that pull request #51 waited in, not the release of `.github`.
- What `v0.1.30` gives is on a miss, which no run here had: two jobs build the image, "TypeScript / toolchain" for the four checks and "Documents / docs-check-repo" its own (R42 .github), not five, and the repository keeps one entry of the cache instead of two, which only a push to `main` saves (sources 3.6). The release signs its files eight at once, which saves little at the six files of a release of `skill-map`.
- The trial release of pull request #52, run 43856965051, did not finish: its step "Work out the version", which builds the whole stage `toolchain` from the network, spent 34 minutes in apt, and was cancelled. `snapshot.ubuntu.com` answered 503 — the index of the snapshot `20261021T000000Z` came at 275 kB/s, «Fetched 67.6 MB in 4min 6s», and of the packages 240 lines are «Ign:», about 5.6 s each. The trial of the next commit, run 43862869784, ran into the same outage, «Fetched 67.6 MB in 4min 16s (264 kB/s)» and 334 lines «Ign:», and ended at the job's 45 minutes. The shared `release.yml` takes no cache of the image (R36 .github), so an outage of the snapshot holds the release and nothing else; T29, the stage `toolchain-core`, is the release's part of row 7.24.
