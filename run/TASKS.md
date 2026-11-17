# TASKS.md — tasks outside an epic of `skill-map`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T25\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Epics). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T33. README коротко: Releases в два предложения, без Contributing, детали — в docs/

Записана прогоном «Сделай эпик» spec 2026-11-17 (R156 spec) по тексту оркестратора, под номером T33: он свободен (правило 6 COORDINATION.md spec).

- **Цель:** README.md этого репозитория короткий: что это и зачем, как начать, где документы. «Releases» — пара предложений и команды; раздела «Contributing» нет; подробности сборки, запуска, настройки и прочие детали — в `docs/`, а не в README.
- **Почему:** слово автора 2026-11-17 для README.md репозиториев: «раздел Releases должен быть очень кратким без этой портянки текста. Просто пару предложений и команды. Раздел Contributing вообще не нужен. Просто засунь его в docs в README.md, это лишнее, и по аналогии другие разделы»; для `api`: «ужми текст в других разделах… много лишних деталей в разделе Build and run. Это должно быть в отдельном документе»; для `skill-map`: «убирай такие нюансы, как The map's own words are in English and Russian. Языки потом будут меняться». README читает человек на GitHub; детали устаревают и живут там, где их читает сессия. Правило для заготовки записывает задача spec этого прогона (поправка к R21 spec).
- **Сделать:**
  - `## Releases` (или его вариант): одно-два предложения — что выпускается и где, — и блок команд (скачать и проверить релиз, как сейчас в разделе, только команды). Объяснения, перечни файлов релиза, история, обоснования — в `docs/README.md` (раздел о релизах) или в документ, который их уже держит; не терять.
  - `## Contributing`: убрать из README. Его содержание — в `docs/README.md` (раздел «Contributing»; если `docs/README.md` нет — создать его коротким оглавлением `docs/` с этим разделом), а не терять. Ссылку на CODE_OF_CONDUCT, CONTRIBUTING и SECURITY `.github` держит GitHub сам.
  - Остальные разделы README — по аналогии: по абзацу или списку ссылок; длинные инструкции (сборка, запуск, настройка, переменные, примеры команд с комментариями) — в отдельный документ `docs/` (например `docs/build.md` или в существующий), а в README — одна строка со ссылкой. Без фраз о языках интерфейса, карты, модулей или документов («… in English and Russian») — языки меняются. Без статуса, версий, дат и чисел, которые устаревают.
  - Что в этом репозитории ссылается на вынесенные разделы README (`grep -rn 'README' RUN.md run/ docs/ CLAUDE.md AGENTS.md .claude/ tools/ scripts/ .github/ 2>/dev/null`), а также проверки или тесты, которые требуют разделы или якоря README, — поправить на новое место. Решения журнала, которые держат разделы README, — поправкой 2026-11-17 (не переписывать).
  - Для `skill-map` сверх этого: убрать нюансы вроде «The map's own words are in English and Russian» (языки потом будут меняться); «Theme and accessibility» и «Install» — по абзацу, детали — в `docs/`.
- **Как проверить:** `just -f spec/justfile docs-check-repo` (в spec — `just docs-check`); проверки частей, которые задача меняет; ревью не обязательно, если меняются только документы (правило ревью этого RUN.md).
- **Разделы:** README.md, docs/; R21 spec (заготовка); RULES.md spec, Language.
