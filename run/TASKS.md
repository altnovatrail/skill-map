# TASKS.md — tasks outside an epic of `skill-map`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T25\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Epics). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T29. Скорость CI: строка 7.24, тег `spec` строки 7.14 и стадия `toolchain-core`

Записана тем же прогоном, вместе с T28. Это последняя задача строки 7.24: она меняет `.devcontainer/`, а пересобрать контейнер ночью некому.

- **Цель:** релиз `skill-map` и его проверки без браузера — `lint`, `vuln`, `licenses`, документы — идут в лёгкой стадии `toolchain-core`, а не во всей `toolchain` с браузерами; apt образа читает только снимок Ubuntu; что проверки доказывают, не меняется.
- **Почему:** строка 7.24 COORDINATION.md spec — «релиз — в `toolchain-core`; apt — только снимок, по T166»; по T166 spec релиз `app` строит всю стадию с браузерами и 341 пакетом apt ради `release-version`, и релиз здесь — так же, а `apt-get update --snapshot` тянет 67,6 МБ индексов живого архива и снимка (measurements 3.1 spec). Сейчас релиз на `main` идёт 6 мин 12 с — [measurements](../docs/measurements.md) 2.1. R76 spec, R156 spec.
- **Сделать:**
  - начинать после T28, когда выйдут тег `spec` строки 7.14 и релиз `.github` строки 7.13, где общие workflow строят `toolchain-core`;
  - перевести `spec/` и пакеты `@altnovatrail/spec` и `@altnovatrail/contracts` на этот тег — решение, как R20; `.devcontainer/` — снова как выход шаблона: стадия `toolchain-core` под `toolchain`, у apt — только источник снимка вместо `ubuntu.sources` базы, набор пакетов прежний (R40 spec);
  - ссылки на общие workflow — на релиз `.github` с T66 `.github`, «Стадия `toolchain-core` в релизе и проверках», последней частью строки 7.13: T28 взяла v0.1.30, где T60–T65, а T66 ещё нет — ей нужен переход `.github` на тег `spec` строки 7.14, который меняет `.devcontainer/` (решение координатора `spec`, T171 spec); из этого релиза взять то, что T66 даёт вызывающему, — поправка к R22; в `paths` у `release.yml` по-прежнему `.devcontainer/Dockerfile`;
  - после мержа автор пересобирает контейнер, как после T23 (Д10), и оркестратор ждёт этого перед следующей задачей.
- **Как проверить:** правило [.claude/rules/package.md](../.claude/rules/package.md) — `just ci`; `just -f spec/justfile docs-check-repo`; локальный `just ci` идёт в старом контейнере и о новом образе ничего не говорит, поэтому доказательство — CI pull request: обе стадии собраны из нового Dockerfile при промахе кеша, зелёные и job, что переходят в `toolchain-core`, — `lint`, `vuln`, `licenses`, `docs-check-repo`, — и пробный релиз в `toolchain-core`; время релиза и изменённых job до и после — подраздел раздела 2 [measurements](../docs/measurements.md) и отчёт; `/code-review high`, один круг.
- **Разделы:** строки 7.13, 7.14 и 7.24 COORDINATION.md spec; T166 spec; measurements 3.1 spec; R76 spec, R156 spec; R20, R22.
