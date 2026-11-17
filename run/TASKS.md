# TASKS.md — tasks outside an epic of `skill-map`

Open tasks outside the current epic, each as its body, in Russian (R154 spec, R155 spec).

- Never read whole: a session reads only its own task — `grep -n '^#### T' run/TASKS.md` lists them, `awk '/^#### T25\./{p=1;print;next} /^#### /{p=0} p' run/TASKS.md` gives one body.
- A new task outside an epic goes here as a body, its number the one free when it is written down (RUN.md, Epics). When done, the body leaves for the archive (RUN.md rule 9).

## Tasks outside an epic

#### T32. Разбор долга: строки, чей срок пришёл

- **Цель:** закрыты строки таблицы 4 (`run/DEBT.md`) этого репозитория, чьё «When to return» уже наступило и которые можно сделать сейчас, без денег и без шагов автора.
- **Почему:** R76 spec, R156 spec; слово автора 2026-11-17: пока `app` идёт эпиком E5 «Интерфейс по эталону», остальные репозитории делают полезную готовую работу параллельно, по времени — примерно как этот эпик.
- **Сделать:**
  - прочитать `run/DEBT.md` построчно (не целиком в контекст: `grep -n '^| Д' run/DEBT.md`, затем нужные строки) и выбрать строки, у которых срок возврата наступил: условие выполнено (релиз вышел, задача сделана, дата прошла) или «When to return» — «when convenient»/«любая задача»;
  - взять из них те, что: не тратят денег на модели (R07 spec приостановлено до 2027-01-17, платных прогонов нет), не требуют шагов автора, не меняют `.devcontainer/` и не трогают `app` и его эпик E5; объём — на одно ревью (правило 11 этого RUN.md); остальное — в отчёт, с причиной;
  - сделать их: код с тестами, документы; закрытые строки — по правилам таблицы 4; если строка устарела — закрыть с причиной;
  - если таких строк нет — так и сказать в отчёте, без pull request.
- **Как проверить:** проверки репозитория зелёные; `just -f spec/justfile docs-check-repo`; `/code-review high`, один круг, если меняется код.
- **Разделы:** `run/DEBT.md`; R07 spec; правило 11 RUN.md.
- **В отчёте:** какие строки закрыты, какие взяты частично, какие пропущены и почему, и сколько готовых строк осталось — по этому числу оркестратор решает, нужен ли следующий круг.
