# TASKS.md — tasks outside an epic of `skill-map`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T25\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Epics). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T39. Комментарии кода по R160 spec

Записана T36 по правилу 11 RUN.md: остаток строки 7.36 COORDINATION.md spec, комментарии кода.

- **Цель:** комментарии кода говорят только то, чего не скажут код и имена: почему, ограничение, ловушку, контракт экспортируемого API (R160 spec, «Comments»).
- **Зависит от:** T36.
- **Сделать:**
  - Комментарии `src/`, `scripts/`, `demo/`, `justfile`, `.github/` и конфигурации в корне: без пересказа кода, истории, номеров задач и разделов документов (`R09 in docs/decisions.md` → `(R09)`); где причина — решение, ограничение одной фразой и номер решения якорем в конце, `(R25)`.
  - `.devcontainer/` — файлы заготовки `spec` (R26): не переписывать.
  - Поведение кода не меняется.
- **Как проверить:** `just -f spec/justfile docs-check-repo` (номера решений в комментариях); `just ci`; `/code-review high`.
- **Разделы:** R160 spec, R32 spec; `.claude/rules/package.md`.
