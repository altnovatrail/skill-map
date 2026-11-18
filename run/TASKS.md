# TASKS.md — tasks outside an epic of `skill-map`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T25\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Epics). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T36. Тексты без истории (R160 spec) и тег `spec` v0.18.34

Записана прогоном «Сделай эпик» spec 2026-11-18 (R156 spec) по тексту оркестратора, под номером T36: он свободен (правило 6 COORDINATION.md spec). Строка COORDINATION.md spec — 7.36.

- **Цель:** репозиторий — на теге `spec` с T205 или новее и пишет по R160 spec: его документы, план и комментарии кода держат текущее состояние, а не историю; `docs-check-repo` проверяет предел записи журнала 12 КБ и номера решений в комментариях.
- **Почему:** R160 spec — другой репозиторий берёт правило переходом на тег, по своей строке COORDINATION.md `spec`: пункт 7, строка с этим репозиторием — 7.36 `skill-map`; R76 spec, R156 spec.
- **Сделать:**
  - Переход на последний тег `spec`: подмодуль и строки CLAUDE.md и RUN.md, которые называют тег, коммит — почему; записи журнала нет, README тега не называет (R160 spec, «Decisions»; RULES.md spec, Across repositories). RULES.md нового тега — с R159 spec: исполнитель оркестратора ждёт долгий прогон в переднем плане; свои тексты, что говорят иное, — по нему. Что переход ломает — чинить здесь; открытая строка COORDINATION.md этого репозитория, которая тоже переходит на тег, — делается здесь же, отчёт её называет.
  - `docs-budgets.json`: добавить `"entry": 12` и `"comments": true`, как в `spec/repo-template/files/docs-budgets.json`, свои пределы файла оставить; запись журнала длиннее 12 КБ — свой предел в `entries`, по размеру с округлением вверх до КБ, пока её не перепишет задача, которая её коснётся; номер решения в комментарии кода, которого нет в журнале, — поправить (R32 spec, R145 spec).
  - План — по шаблону `spec/repo-template/files/`: правило 9 и «Task body» RUN.md, вводные `run/QUESTIONS.md` и `run/DEBT.md`, «Rule» вводной `docs/decisions.md` — изменение переписывает запись на месте. «Сделано» — одна строка с pull request, открытое — строки таблиц 3 и 4, «Открыто» нет.
  - Документы `docs/`, README и CLAUDE.md — без хроник версий, статусов и повышений (пример — абзац «Status» `docs/architecture.md` `infra`): документ называет файл, где задано значение, а не значение; архитектура описывает текущее устройство и ссылается на решение номером, не пересказывая его. Ссылка на поправку записи `spec`, которую тег переписал на месте (R143, R145, R154, R155 spec и те, что перепишут задачи E16 `spec`), — на запись.
  - Комментарии кода — по R160 spec, «Comments»: почему, ограничение, ловушка, контракт экспортируемого API; без пересказа кода, истории, номеров задач и разделов документов; номер решения — якорем в конце, `(R25)`.
  - Свои записи журнала переписывает на месте задача, которая их касается (R160 spec), — здесь только те, что эта задача меняет.
  - Больше одного ревью — разделить по правилу 11 RUN.md: первая задача — переход на тег, `docs-budgets.json` и план, она записывает остальные — документы, комментарии — в `run/TASKS.md` с «Зависит от» и называет их номера в отчёте.
- **Как проверить:** `just -f spec/justfile docs-check-repo`; проверки изменённых частей по правилам `.claude/rules/` репозитория; `/code-review high`.
- **Разделы:** R160 spec, R32 spec, R145 spec, R159 spec; RULES.md spec — The bar, How we work, Across repositories; `spec/repo-template/files/` — RUN.md, `run/QUESTIONS.md`, `run/DEBT.md`, `docs/decisions.md`, `docs-budgets.json`.
