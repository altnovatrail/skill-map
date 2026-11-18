# TASKS.md — tasks outside an epic of `skill-map`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T25\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Epics). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T37. Журнал без истории: записи переходов на теги `spec`

Записана T36 по правилу 11 RUN.md: остаток строки 7.36 COORDINATION.md spec, решения журнала.

- **Цель:** записи журнала о переходах на теги `spec` и записи, которые эти переходы поправляли, — текст в силе, без датированных поправок (R160 spec, «Decisions»).
- **Зависит от:** T36.
- **Почему:** с T36 переход на тег — коммит и R26, а не запись журнала; R01, R02, R05, R14, R15, R16, R18, R20, R23 и R24 — хроника переходов. Поправки 2026-11-18 (R26) к R08, R10, R13, R20, R22, R23 и R24 ссылаются на прежний текст R26, который T36 переписала на месте: `.github` v0.1.33, пакеты 0.18.27, история R78 spec; а поправки к R20, R23 и R24 говорят, что `.devcontainer/` — заготовки v0.18.14, и называют Д13, — с T36 это неверно: Dockerfile — заготовки тега, Д13 закрыта.
- **Сделать:**
  - Переписать на месте записи переходов R01, R02, R05, R14, R15, R16, R18, R20, R23 и R24: что из каждой ещё действует (вид devcontainer, стадия `toolchain-core`, браузеры в образе и т. п.) — текст записи в силе или ссылка на запись, где это задано; номер записи остаётся (R32 spec — журнал без пропусков).
  - Переписать целиком, с вписанными поправками, R08, R10, R13 и R22 и всякую запись, которой касается первый пункт; что запись отвергла и цитаты источников — сохранить (R160 spec).
  - Записи, ставшие не длиннее 12 КБ, — без своего предела в `entries` `docs-budgets.json`.
- **Как проверить:** `just -f spec/justfile docs-check-repo`; `/code-review high`.
- **Разделы:** R160 spec, R145 spec; R26; RUN.md, правило 11.
- **Решить при планировании:** во что переписать запись перехода, от которой в силе ничего не осталось.

#### T38. Документы без хроник

Записана T36 по правилу 11 RUN.md: остаток строки 7.36 COORDINATION.md spec, документы.

- **Цель:** `docs/architecture.md`, `docs/README.md`, README.md, CLAUDE.md и `.claude/rules/package.md` держат текущее устройство, без хроник версий, статусов и повышений (R160 spec, «One home»).
- **Зависит от:** T36.
- **Сделать:**
  - Документ называет файл, где задано значение (`package.json`, `package-lock.json`, `ARG` Dockerfile, SHA в `.github/workflows/`), а не значение и не историю его повышений — например, раздел 3.7 `docs/architecture.md`: версии инструментов и «on 2026-11-07 Dependabot raised it …», и «from 2026-11-16» у набора иконок.
  - Архитектура описывает устройство и ссылается на решение номером, не пересказывая его.
  - Ссылка на поправку записи `spec`, которую тег переписал на месте (R143, R145, R154, R155 spec и те, что перепишут задачи E16 `spec`), — на запись.
- **Как проверить:** `just -f spec/justfile docs-check-repo`; `/code-review high`.
- **Разделы:** R160 spec; RULES.md spec, The bar; CLAUDE.md, Documents.

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
