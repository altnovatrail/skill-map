# TASKS.md — tasks outside an epic of `skill-map`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T25\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Epics). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T28. Скорость CI: строка 7.24, релиз `.github` строки 7.13

Записана прогоном «Сделай эпик» spec 2026-11-16 (T171 spec) по строке 7.24 COORDINATION.md spec. Текст оркестратора назвал её T27, но T27 уже занят задачей Д8 на ветке `t27-icons-dependabot`, и эта взяла следующий свободный номер. Сейчас делать нечего: образ `toolchain` берётся из кеша, а не собирается в каждом job, уже с T25 (R22), а остальное в строке ждёт релиза `.github` строки 7.13 и тега `spec` строки 7.14. Эта задача — часть, которая ждёт релиза `.github`; переход на тег `spec` со стадией `toolchain-core` — T29, последней.

- **Цель:** CI `skill-map` быстрее по строке 7.24 COORDINATION.md spec; что проверки доказывают, не меняется.
- **Почему:** R76 spec, R156 spec, строка 7.24 и шестая поправка 2026-11-15 к R76 spec; общая часть — строки 7.13 (`.github`) и 7.14 (T166 spec); слово автора 2026-11-16 — ускорение CI сейчас, в прогоне оркестратора T171 spec. Замеры до и после T25 — [measurements](../docs/measurements.md) 2.1: CI 273 с → 169 с, а в каждом job теперь почти всё время — образ из кеша.
- **Сделать:**
  - начинать, когда выйдет релиз `.github` строки 7.13 — без сохранения образа из pull request, один путь и один тег образа во всех общих workflow;
  - все семь ссылок на общие workflow — четыре в `ci.yml` и по одной в `codeql.yml`, `scorecard.yml` и `release.yml` — перевести на этот релиз, по SHA с версией рядом, как в R22; группа Dependabot `shared-workflows` предложит их одним pull request — он закроется сам, когда версия будет на `main`;
  - из новых входов общих workflow взять только те, что нужны этому репозиторию; поправка к R22;
  - брать последний релиз `.github`, ни один общий workflow которого — `typescript.yml`, `documents.yml`, `release.yml` и другие — не строит стадию `toolchain-core`: её в `.devcontainer/Dockerfile` до T29 нет. Если такого релиза новее v0.1.24 нет, менять нечего: «Сделано» говорит это, а ссылки переводит T29.
- **Не делать:** `.devcontainer/` — это T29; WebKit и Firefox в тестах — Д11 [DEBT.md](DEBT.md), задача своя, хотя ей нужен тот же релиз.
- **Как проверить:** правило [.claude/rules/package.md](../.claude/rules/package.md) — `just ci`; `just -f spec/justfile docs-check-repo`; CI pull request зелёный, пробный релиз тоже; время изменённых job до и после — по прогонам `main` и pull request, подраздел раздела 2 [measurements](../docs/measurements.md), и в отчёте; `/code-review high`, один круг.
- **Разделы:** строки 7.13 и 7.24 COORDINATION.md spec; measurements 3.1 spec; R76 spec, R156 spec; R22.

#### T29. Скорость CI: строка 7.24, тег `spec` строки 7.14 и стадия `toolchain-core`

Записана тем же прогоном, вместе с T28. Это последняя задача строки 7.24: она меняет `.devcontainer/`, а пересобрать контейнер ночью некому.

- **Цель:** релиз `skill-map` и его проверки без браузера — `lint`, `vuln`, `licenses`, документы — идут в лёгкой стадии `toolchain-core`, а не во всей `toolchain` с браузерами; apt образа читает только снимок Ubuntu; что проверки доказывают, не меняется.
- **Почему:** строка 7.24 COORDINATION.md spec — «релиз — в `toolchain-core`; apt — только снимок, по T166»; по T166 spec релиз `app` строит всю стадию с браузерами и 341 пакетом apt ради `release-version`, и релиз здесь — так же, а `apt-get update --snapshot` тянет 67,6 МБ индексов живого архива и снимка (measurements 3.1 spec). Сейчас релиз на `main` идёт 6 мин 12 с — [measurements](../docs/measurements.md) 2.1. R76 spec, R156 spec.
- **Сделать:**
  - начинать после T28, когда выйдут тег `spec` строки 7.14 и релиз `.github` строки 7.13, где общие workflow строят `toolchain-core`;
  - перевести `spec/` и пакеты `@altnovatrail/spec` и `@altnovatrail/contracts` на этот тег — решение, как R20; `.devcontainer/` — снова как выход шаблона: стадия `toolchain-core` под `toolchain`, у apt — только источник снимка вместо `ubuntu.sources` базы, набор пакетов прежний (R40 spec);
  - ссылки на общие workflow — на релиз с `toolchain-core`, если T28 взяла более ранний; в `paths` у `release.yml` по-прежнему `.devcontainer/Dockerfile`;
  - после мержа автор пересобирает контейнер, как после T23 (Д10), и оркестратор ждёт этого перед следующей задачей.
- **Как проверить:** правило [.claude/rules/package.md](../.claude/rules/package.md) — `just ci`; `just -f spec/justfile docs-check-repo`; локальный `just ci` идёт в старом контейнере и о новом образе ничего не говорит, поэтому доказательство — CI pull request: обе стадии собраны из нового Dockerfile при промахе кеша, зелёные и job, что переходят в `toolchain-core`, — `lint`, `vuln`, `licenses`, `docs-check-repo`, — и пробный релиз в `toolchain-core`; время релиза и изменённых job до и после — подраздел раздела 2 [measurements](../docs/measurements.md) и отчёт; `/code-review high`, один круг.
- **Разделы:** строки 7.13, 7.14 и 7.24 COORDINATION.md spec; T166 spec; measurements 3.1 spec; R76 spec, R156 spec; R20, R22.
