# TASKS.md — tasks outside an epic of `skill-map`

Open tasks outside the current epic, each as its body, in Russian.

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T25\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Citations). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T51. Переход на тег `spec` v0.19.20 и `docs/sources.md` по правилу записей

Записана 2026-11-24 по тексту оркестратора `spec`, под номером T51: он свободен. Задача вне эпика, одна: своя ветка от `main` и свой pull request.

- **Цель:** `docs/sources.md` по правилу записей `spec/RULES.md` нового тега: запись — только у того, что прогон не проверит или у чего нет версии; остальное — ссылка на месте с версией или коммитом, тест или `measurements`; теги `spec` и файлы репозиториев NovaTrail — git.
- **Почему:** строка 7.68 COORDINATION.md `spec`, по тексту T291 `spec`; переход — на последний тег `spec`, v0.19.20.
- **Сделать:** переход на тег по `spec/tools/orchestrator/tasks/spec-tag.md` — CLAUDE.md, RUN.md и вводная `docs/sources.md` из заготовки шаблона; свернуть повторные чтения до текущего; записи о тегах `spec` и файлах других репозиториев — удалить, утверждения — ссылка на тег или репозиторий@коммит; поведение инструментов и сервисов под тестом, пробным PR или записью `measurements` — ссылка на месте с версией или коммитом, запись удалить; номера не переиспользовать, архивы `docs/plan/` не трогать; ссылки на записи `spec` (`… spec`) сверить с записью нового тега: удалённая или суженная, что утверждения уже не держит (так 5.4 — теперь только белая книга Edge), — так же. Смысл утверждений не менять. Больше одного ревью — по правилу 11 своего RUN.md остальное в `run/TASKS.md`, строка ждёт всех.
- **Как проверить:** `just -f spec/justfile docs-check-repo` и проверки частей, чьи файлы задеты, — зелёные; размер `docs/sources.md` до и после — в отчёт.
- **Разделы:** `spec/RULES.md`, «The bar» и «Citations»; R171 `spec`; строка «Порядка».
