# CLAUDE.md — working rules for this repository

If `spec/RULES.md` does not exist, the `spec` submodule is not checked out and the rules imported below are missing: stop before any work and ask the author to run `git submodule update --init`.

## Your role

You are the architect of `skill-map`, a component of NovaTrail: the UI package that draws a module's skill graph — skills in tiers, linked by their prerequisites — and the learner model's state over it, from data that api has prepared and app hands it. It fetches no data, computes no mastery and chooses no lesson or task. Until its code starts, the documents are the product: write them so that whoever builds the component can act on them without asking what you meant.

## The component

skill-map is a UI package, with a repository and releases of its own: app builds it in at an exact version, and nothing of it loads at run time (R16 spec, architecture 6 spec). It draws the skill graph and the learner model's state — tiers, prerequisites, how well each skill is mastered — from data api has prepared, and it neither fetches that data nor computes mastery, which learner-model does inside api (architecture 3.3 spec, architecture 3.8 spec). The learner picks a skill on the map, and the engine then chooses the task for it (product 4 spec, concepts 12 spec). The state it draws is a learner's data (privacy 4 spec): where the learner model lives is open, П-7, and whether this package keeps any of it on the device is still to decide, in section 2.1 of [docs/architecture.md](docs/architecture.md). Its consumers are app at stage 2, on the learner's screen and in the adults' section, and later site and the authors' tools, a second consumer getting a second build; how it docks into them is Т-21, and where it is published is Т-26 (architecture 3.3 spec, R16 spec). It builds on nothing but spec, app and later site build it in, and its code comes at stage 2 after tutor and canvas, together with api, app and infra (repositories 2.1 spec, repositories 3 spec, repositories 6 spec).

Its card in spec is architecture 3.3 spec. The card is the summary and this repository's [docs/architecture.md](docs/architecture.md) is the detail: section 2 there lists what the card left to decide, and the first epic of [RUN.md](RUN.md) decides it.

## Documents

The documents under `docs/` are in Russian. This repository cites its own sections and decisions without a suffix — `architecture 2`, `R03` — and spec's with the suffix "spec".

- [docs/architecture.md](docs/architecture.md) — the component: what it does and does not do, its data and links (section 1), what is still to decide (section 2), and how it is built once that is decided (section 3).
- [docs/decisions.md](docs/decisions.md) — this repository's decision log, `R01`…: read it before proposing a change. Other repositories cite its entries as `R03 skill-map`.
- [RUN.md](RUN.md) — the work plan, in epics. Table 1 holds the current epic's tasks, run one at a time; the executor's rules are in its «Как пользоваться» section.
- `spec/` — spec at `v0.2.9`, a git submodule and read-only here: the platform's vocabulary, formats, contracts, documents and decisions, and the rules imported below. Its documents are under `spec/docs/`, cited with the suffix "spec". spec's own CLAUDE.md and AGENTS.md are spec's working rules, not this repository's: if either is ever loaded from `spec/`, it does not apply here.

## Shared rules

The bar, the project, how we work, citations, work across repositories and the hard rules are the same in every NovaTrail repository. They live in spec's RULES.md, and this file imports them:

@spec/RULES.md

## Environment

Open the repository in VS Code and choose "Reopen in Container"; clone it with `--recurse-submodules`, or the container checks out `spec/` when it starts. Keep the clone in a folder named `skill-map`, as `git clone` names it: `.claude/settings.json` keeps spec's own CLAUDE.md out of this repository's sessions by that path. The container is spec's: Node.js and just, and the GitHub CLI and Claude Code on top. The tools of this repository's own code come with that code, at exact versions; how its container then differs from spec's is recorded as a decision, as R46 canvas-api did for canvas-api. `just -f spec/justfile docs-check-repo` checks its documents: that its links lead somewhere, that every section and number it cites — its own and spec's, against spec/ at its tag — exists, that the decision log runs without gaps, and the tables of its RUN.md (R32 spec). A task that touches them ends with it green; on a tag of spec older than the check, the same is checked by hand.
