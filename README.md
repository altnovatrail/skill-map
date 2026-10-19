# skill-map

The NovaTrail skill map: a UI package that draws a module's skill graph — its skills in tiers, linked by their prerequisites — and the learner model's state over it: what is mastered, what opens next and what each skill builds on. It draws from data that api has prepared and app hands it: it fetches nothing, computes no mastery and chooses no task, and when the learner picks a skill on the map, the engine chooses what comes next. It is built into app at an exact version, and later site gets a build of its own.

A component of [NovaTrail](https://github.com/altnovatrail/spec/tree/v0.1.0), a universal open platform for adaptive learning, interactive lessons and AI tutoring. It belongs to stage 2, First slice with learners, with tutor, canvas, api, app and infra.

## Status

Detailing. The documents come first: the first epic of [RUN.md](RUN.md) decides what the component's card left open, and the code follows in the order RUN.md sets. There is no code here yet: it comes after the first code of stage 2, in tutor and canvas, together with api, app and infra.

## Documents

The documents are in Russian.

- [docs/architecture.md](docs/architecture.md) — the component: what it does and does not do, its data and links, and what is still to decide.
- [docs/decisions.md](docs/decisions.md) — the decision log: what was decided, why, and what was rejected.
- [RUN.md](RUN.md) — the work plan, in epics.

The working rules, for people and coding agents alike, are in [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md). The platform's shared vocabulary, formats, contracts and decisions are in [spec](https://github.com/altnovatrail/spec/tree/v0.1.0), checked out here as a git submodule at `v0.1.0`: clone this repository with `git clone --recurse-submodules`.

## License

[Apache-2.0](LICENSE).
