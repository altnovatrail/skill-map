# TASKS.md — tasks outside an epic of `skill-map`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T25\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Epics). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T25. Переход CI на последний релиз `.github`

- **Цель:** общие проверки `.github` — на его последнем релизе, v0.1.24 или новее, с кешем образа `toolchain` (Д146 spec), а в `.github/dependabot.yml` — группа `shared-workflows` (Д88 spec).
- **Почему:** шаг 6 T23 (R20), как T68 `sim`: все `uses:` здесь — `v0.1.15`, а с `v0.1.22` общие workflow берут образ `toolchain` из кеша GitHub Actions по sha256 `.devcontainer/Dockerfile` (R36 .github; поправка 2026-11-09 к R31 spec); пока нет, каждая job собирает образ из сети, и сбой nodejs.org, GitHub или снимка Ubuntu роняет проверки. Тега `spec` задача не ждёт. Строка 7.24 COORDINATION.md spec — следующий релиз `.github` строки 7.13 и `toolchain-core` строки 7.14 — идёт после них, своей задачей.
- **Сделать:**
  1. Последний релиз `.github`: `gh release list -R altnovatrail/.github`, `gh release verify <тег> -R altnovatrail/.github`; что общие workflow меняют от `v0.1.15` — входы `typescript.yml`, `documents.yml`, `release.yml`, `codeql.yml`, кеш `toolchain` — запись [docs/sources.md](../docs/sources.md).
  2. `.github/workflows/` — каждое `uses: altnovatrail/.github/…@<SHA> # v0.1.15` — на SHA коммита последнего тега с его именем в комментарии; входы, которые новая версия требует или меняет.
  3. `.github/dependabot.yml` — группа `shared-workflows`, `patterns: ["altnovatrail/.github/*"]`, у `github-actions` (Д88 spec).
  4. Решение журнала, поправки к R08 и R13, если меняются их job; где документы называют `.github` `v0.1.15` — [docs/architecture.md](../docs/architecture.md), раздел 3, README.
- **Как проверить:** проверки CI pull request — зелёные, с кешем образа; правило [.claude/rules/package.md](../.claude/rules/package.md) — `just ci`; `just -f spec/justfile docs-check-repo`; `/code-review high`, один круг.
- **Разделы:** Д146 spec, Д88 spec; R30 spec, R31 spec; R08, R13, R20.

#### T26. Вторая точка входа `./states`: правило состояний для карточки модуля `app`

Текст — T157 spec, строка 6.19 COORDINATION.md spec (архив `docs/plan/E12.md` spec), записан T23 (R20). Первый шаг текста — переход на тег `spec` с T157 — сделала T23: v0.18.3, а с ним и слова и значки в [docs/architecture.md](../docs/architecture.md), раздел 3.8.

- **Цель:** пакет `@altnovatrail/skill-map` даёт правило состояний навыков второй точкой входа, `./states`, и карточка модуля на главной `app` показывает те же состояния, что карта, без второго правила.
- **Почему:** R76 spec, строка 6.19 COORDINATION.md spec (третья поправка 2026-11-14 к R76 spec); R148 spec, «The module card»; карточка architecture 3.3 spec — «It waits for an amendment to R08 skill-map». При планировании T152 spec автор выбрал функцию пакета, а третий вид элемента и счёт в `app` отверг: одно правило в одном пакете не даёт карточке и карте разойтись.
- **Сделать:**
  - поправка к R08: у `exports` — вторая точка `./states`, функция правила R03 — граф, ответ `GetSkillMap` и время на входе, а на выходе для каждого навыка одно из пяти состояний — mastered, time to review, in progress, ready to start, locked — или одна из двух меток — feedback by criteria, not assessed. Ядро остаётся без DOM, договор элемента R04 — прежним. Поправка говорит, почему теперь можно то, что R08 отверг как `./core`: наружу выходит одна функция, а не ядро, и её сигнатура — договор с `app`;
  - `scripts/package.ts` — две точки входа, и `./states` не тянет регистрацию элемента и DOM;
  - [docs/architecture.md](../docs/architecture.md), раздел 3.3 и «Development tools» раздела 3.7, — вторая точка входа; что слова и значки семи значений стоят в таблицах architecture 6 spec и их показывает легенда карточки `app`, раздел 3.8 говорит уже с T23 (R20);
  - релиз в npm (R13).
- **Как проверить:** тесты функции в Node; на одних данных карта и функция дают одно состояние каждому навыку; проверка пакета; правило [.claude/rules/package.md](../.claude/rules/package.md) — `just ci`; `just -f spec/justfile docs-check-repo`; `/code-review high`, один круг.
- **Разделы:** R148 spec; architecture 3.3 и 6 spec; R03, R04, R08; T152 spec — архив `docs/plan/E12.md` spec.
