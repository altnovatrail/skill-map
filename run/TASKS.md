# TASKS.md — tasks outside an epic of `skill-map`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T25\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Epics). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T34. Набор иконок — только строкой плана

Записана прогоном «Сделай эпик» spec 2026-11-18 (R156 spec) по тексту оркестратора, под номером T34: он свободен (правило 6 COORDINATION.md spec).

- **Цель:** Dependabot больше не поднимает `@iconify-json/material-symbols` в `skill-map`: набор поднимают вместе с `canvas` и `app` только строкой COORDINATION.md.
- **Почему:** R76 spec, R156 spec, строка 6.40 COORDINATION.md spec; поправка 2026-11-17 к R78 spec (spec v0.18.26); ответ автора на `app` В73 (В50 spec).
- **Сделать:** `ignore` `@iconify-json/material-symbols` в `.github/dependabot.yml` с комментарием — набор поднимают вместе с `canvas` и `app` только строкой COORDINATION.md; датированная поправка к своему решению об иконках; набор — прежний 1.2.99, не менять.
- **Как проверить:** проверки `skill-map` по его RUN.md; `.github/dependabot.yml` проходит проверку схемы.
- **Разделы:** строка 6.40 COORDINATION.md spec; R78 spec; своё решение об иконках.
