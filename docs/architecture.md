# skill-map — архитектура

> Статус: каркас из заготовки `spec`, 2026-10-19; сверен с `spec` v0.2.9 2026-10-20 (R01), с v0.9.4 2026-11-07 (R02) и с v0.9.5 в тот же день (R05).
>
> Что делает компонент, чего не делает и что о нём ещё предстоит решить. Это подробности его карточки — architecture 3.3 spec. Карточка остаётся сводкой: если подробности меняют то, что в ней сказано, она правится в `spec` тем же путём, что и вопросы в его реестры (RULES.md, Across repositories).
>
> Почему решено так, а не иначе, — в [decisions.md](decisions.md); план работ — в [RUN.md](../RUN.md). Понятия — concepts spec. Документы и решения `spec` лежат в `spec/docs/` и цитируются с суффиксом «spec».

## 1. Назначение и границы

**Делает:**
- рисует граф навыков модуля: навыки по ярусам и связи между ними — пререквизиты (architecture 3.3 spec; concepts 4 spec). Ярус вычисляет `module-kit` по графу, когда собирает пакет, а имена ярусам даёт автор (R49 spec; R62 spec);
- показывает на графе состояние модели ученика — владение каждым навыком: что освоено, что открывается и на что оно опирается (architecture 3.3 spec; product 4 spec; concepts 11 spec). Модель ученика у ученика одна, а карта навыков — её видимая часть (concepts 11 spec);
- в первом срезе показывает карты трёх модулей двух предметов (product 10 spec; R41 spec) — по карте на модуль: какой показать, выбирает `app` (R03). Уровень в модели ученика — на модуль, а не на предмет и не на всю модель, и связи между модулями несут только пререквизиты через навыки-опоры, а не уровень (concepts 11 spec);
- даёт ученику выбрать навык на карте — это вход «Карта навыков» в приложении (product 4 spec; architecture 3.1 spec). По выбранному навыку следующую задачу выбирает движок, в режиме «ученик выбрал навык на карте навыков» (concepts 12 spec);
- отвечает стандарту пакетов интерфейса: доступность — WCAG 2.2 уровня AA, а сверх него цели не меньше 44 × 44 CSS px и движение по `prefers-reduced-motion`; у карты — текстовая замена графа, `lang` у названия навыка, освоенность не только цветом, клавиатура и сдвиг карты без перетаскивания (R90 spec; architecture 3.3, 6 spec). Переводы — по общим правилам пакетов, на каждый язык интерфейса, `en` и `ru` (R91 spec, R92 spec); иконки — из набора Material Symbols, вшитые при сборке (R78 spec).

**Не делает:**
- не ходит за данными: всё, что рисует, приходит к нему готовым от `api` через потребителя — `app` (architecture 3.3 spec);
- не считает владение и не меняет модель ученика. Владение по свидетельствам оценивает `learner-model` — библиотека внутри `api` (architecture 2 spec, architecture 3.8 spec), а отображение — карта навыков, рейтинги, ранги — выводится из модели и обратно на неё не влияет (concepts 11 spec);
- не вычисляет ярусы: они приходят к нему готовыми (R49 spec; R62 spec);
- не выбирает следующий урок или задачу: это делает движок (concepts 12 spec);
- не показывает рангов в первом срезе: что такое ранг в NovaTrail, решает О-13 (R07; раздел 3.5);
- не загружается во время работы: `app` собирает его при сборке, по точной версии. Во время работы подгружаются только виджеты модулей, в iframe-песочнице (R16 spec; architecture 6 spec).

**Данные и связи:**
- рисует то, что ему передали (architecture 3.3 spec). Граф и ярусы `app` берёт у `api` по дайджесту пакета текущей версии модуля, `GetSkillGraph`, а состояние навыков — `GetSkillMap`; это контракт `app` ↔ `api`, пакет `novatrail.api.v1` на protobuf и buf (R97 spec, R99 spec; [текст контрактов](../spec/contracts/README.md), раздел 15);
- состояние навыков — данные ученика (privacy 4 spec). Модель ученика живёт в базе `api`: журнал свидетельств — только на дозапись, а состояние навыков — кэш (R80 spec; П-7 и Т-22 закрыты). На устройство для карты уходит состояние навыков текущей версии модуля, без ловушек (privacy 4 spec). Сам пакет ничего из этого на устройстве не держит: состояние навыков живёт в памяти элемента, пока он на странице (R03; раздел 3.1). В репозитории — ни данных учеников, ни секретов, а примеры синтетические (RULES.md, Hard rules);
- потребители (architecture 3.3 spec):
  - этап 2 — `app`: экран ученика и раздел для взрослых;
  - позже — `site`, этап 3 (repositories 2.1 spec), и инструменты автора.

  Второй потребитель — например, сайт — получает вторую сборку того же пакета (R16 spec; architecture 6 spec). В потребителя пакет интерфейса входит веб-компонентом: данные получает свойствами, работу отдаёт методом, а изменения и просьбы — событиями; свои элементы он называет сам, а типы данных, которые делят репозитории, берёт из релизов `spec` (R36 spec; Т-21 закрыт). У карты это один элемент, `<novatrail-skill-map>`: данные — свойствами, выбор навыка — событием, а методов у него нет (R04, раздел 3.3);
- при сборке ни от чего не зависит, кроме `spec`; от него самого при сборке зависят `app`, а с этапа 3 — `site` (repositories 2.1 spec, repositories 3 spec). Во время разработки `app` подключает рабочую копию пакета, а в релиз идёт только точная версия (architecture 6 spec). Выходит пакет в npm, в области `@altnovatrail`: туда уходит файл подписанного релиза GitHub, а подпись `app` проверяет рецептом `spec` `release-verify-npm` в CI pull request, который меняет lock-файл (R37 spec, R77 spec; Т-26 и Т-27 закрыты; раздел 2.4);
- лицензия — Apache-2.0 (R20 spec); зависимости — только с лицензиями, совместимыми с ней (RULES.md, Hard rules);
- этап 2, «Первый срез с учеником», вместе с `tutor`, `canvas`, `api`, `app` и `infra` (product 11 spec). Код `skill-map` идёт после первого кода этапа — `tutor` и `canvas`, — вместе с `api`, `app` и `infra` (repositories 6 spec).

## 2. Решить при детализации

Здесь — пункты «Решить при детализации» из карточки и то, что о них уже решил `spec`. Открытый пункт решает своя задача эпика E1 в [RUN.md](../RUN.md). Решённый пункт называет запись журнала, а само решение переезжает в раздел 3. Вопрос, который выходит за этот репозиторий, уходит «в реестр spec» (RULES.md, Across repositories).

На `spec` v0.9.4 и v0.9.5 у карточки три пункта: данные и раскладка, как карта показывает ярусы, ранги (architecture 3.3 spec).
- 2.1 — раскладка графа: решила T08, R06, раздел 3.4. Данные и договор элемента решила T01 — R03 и R04, раздел 3: раскладывает граф сам пакет, поэтому то, что ему присылают, от рисунка не зависит, и при планировании T01 автор разбил пункт на две задачи;
- 2.2 — что о ярусах решил `spec`, R49 и R62 spec: это был вход T08, а не отдельный пункт;
- 2.3 — ранги: для карты решила T03, R07, раздел 3.5, а сам ранг ушёл к О-13;
- 2.4 — публикация: её решил R37 spec, и из карточки этот пункт ушёл.

Задачи T02 и T04, которые разбирали 2.2 и 2.4, поэтому не делаются (R02).

### 2.1. Раскладка графа — решено (R06)

- **Суть:** как пакет раскладывает карту на экране — где стоят навыки и навыки-опоры, как идут связи, что видно на узком экране и при масштабе 200 %, как по карте ходят с клавиатуры и какая у неё текстовая замена. Раскладывает сам пакет, на устройстве, из открытого вида графа и ярусов `skill_tiers` (R03). Решила T08 — R06, а само решение — раздел 3.4.
- **Задача:** T08, сделана.

### 2.2. Ярусы — решено в `spec` (R49 spec, R62 spec)

- **Суть:** О-18 решён — ярус вычисляется по графу, а имена ярусам даёт автор (R49 spec). Что решил `spec`, записано ниже. Осталось, как карта рисует ярусы, — это часть раскладки, и решает её T08 (раздел 2.1). T02, которая разбирала О-18, не делается (R02).
- **Что решено:**
  - ярус навыка без пререквизитов среди навыков модуля — 1, а у остальных — на 1 выше самого высокого яруса их пререквизитов в модуле: число навыков в самой длинной цепочке пререквизитов, которой навык кончается. Пререквизит всегда стоит ярусом ниже, и связи из старшего яруса в младший не бывает. Предела числа ярусов нет. Навыки-опоры ярусов не дают (R49 spec с поправкой 2026-10-26);
  - имена ярусам — необязательный список `tiers` в графе, на языке объяснений: первое имя — у яруса 1. Ярус без имени показывается номером, а имя за последним ярусом ничего не называет (R49 spec);
  - ярусы вычисляет `module-kit`, когда собирает пакет, и кладёт в канонический вид, `skill_tiers`; векторы ярусов — в `format/vectors/tiers/` `spec`. До карты ярусы доходят от `api`, ответом `GetSkillGraph`, рядом с открытым видом графа (R62 spec; R99 spec; architecture 3.3 spec). Карта ярусов не вычисляет;
  - R49 spec отверг подгонять граф под рисунок карты: ради трёх слоёв карты standalone одно ребро там не провели (R164 standalone), а дальние ярусы карта может свернуть в строку, как прототип.
- **Что известно для T08:**
  - в MathTrail ярусов три — «основы», «правила», «сложные задачи», — и тест каталога держал цепочки в пределах трёх ярусов (SPEC 8.12.2 standalone; раздел 4 этого документа). У олимпиадного модуля NovaTrail имена ярусов — те же, Foundations, Rules, Hard problems (R49 spec);
  - в прототипе модуль называет свои ступени сам — у модуля Goroutines они «Basics», «Waiting», «Many goroutines», «Review», — а подпись — «Step N · имя» или, без имени, «Step N»; далёкие ярусы сворачиваются в одну строку (прототип, `spec/draft/README.md`; R49 spec);
  - сколько ярусов в модулях первого среза, скажут их графы: длина цепочек — по 17 темам standalone (repositories 7 spec) и по двум другим модулям (R41 spec).
- **Задача:** T08 — как карта рисует ярусы, решил R06: раздел 3.4. Графы первого среза дали и число ярусов: 3 у `grade-3-math`, 4 у `english-essays` (`modules`, `main` 6d061e9) и 3 у примера олимпиадной математики в формате.

### 2.3. Ранги (О-13) — решено для карты (R07)

- **Суть:** показывает ли карта ранги — по навыку, по модулю, общий, — в каком виде, кому и откуда берётся сам ранг. Ранги и персонаж для взрослых — открытый вопрос О-13 реестра `spec`. Для карты решила T03 — R07: в первом срезе рангов на карте нет, а что такое ранг в NovaTrail, ушло к О-13 строкой «В реестр spec». Само решение — раздел 3.5.
- **Задача:** T03, сделана.

### 2.4. Где публикуется пакет — решено в `spec` (R37 spec, R77 spec)

- **Суть:** Т-26 закрыт — пакеты интерфейса выходят в npm, в области `@altnovatrail` (R37 spec), а Т-27 — подпись файла релиза проверяет рецепт `spec` `release-verify` (R77 spec). Пункт ушёл из карточки (architecture 3.3 spec), а T04, которая его разбирала, не делается (R02). Что осталось, — работа эпика кода.
- **Что решено:**
  - в npm уходит тот же файл, что подписан в релизе GitHub, шагом общего `release.yml` `.github` (R37 spec). Пакет `@altnovatrail` из npm `app` принимает, когда `release-verify-npm` принял lock-файл, в CI pull request, который его меняет, а дальше файл держит дайджест lock-файла (R77 spec; RULES.md, Hard rules). Так у `app` уже устроено: его T01 (R03 app; Д54 в таблице 4 RUN.md `spec`);
  - во время разработки `app` подключает рабочую копию пакета, а в релиз идёт только точная версия (R16 spec; architecture 6 spec); второй потребитель — например, сайт — получает вторую сборку того же пакета, `site` — с этапа 3 (repositories 2.1 spec);
  - набор иконок `@iconify-json/material-symbols` пакет берёт из `devDependencies` и вшивает при сборке только свои иконки (R78 spec; поправка 2026-11-02 к R39 spec);
  - все репозитории организации публичные (R18 spec), лицензия — Apache-2.0 (R20 spec).
- **Задача:** эпик кода — его предложит T05.

## 3. Устройство

Сюда переезжает то, что решено по разделу 2: из каких частей компонент состоит, его типы и данные, как он связан с другими репозиториями. Решены данные и договор элемента (T01: R03, R04) и раскладка (T08: R06), а для карты — и ранги (T03: R07). Открытых пунктов карточки нет.

### 3.1. Данные для показа

Всё, что рисует карта, приходит к ней от `app` готовым: открытый вид графа и ярусы — ответ `GetSkillGraph`, паспорт — ответ `GetManifest` по тому же дайджесту, состояние — ответ `GetSkillMap` (R99 spec; [текст контрактов](../spec/contracts/README.md), раздел 15). Полей сверх контракта карте не нужно (R03). Сама она ничего не хранит: состояние живёт в памяти элемента, пока он на странице (R03).

Названия, описания, имена ярусов и полос — на языке объяснений модуля, с его `lang`; названия навыков-опор — английские, с `lang="en"` (R50 spec, R91 spec). «Ученик» и «взрослый» — виды элемента (R03, раздел 3.3); без состояния нет ни отметок состояния, ни подробностей взрослого.

| Что на карте | Поле | Понятие `spec` | Ученик | Взрослый |
|---|---|---|---|---|
| навык, по ID в модуле | ключ `skills` открытого вида графа | навык (concepts 4 spec) | да | да |
| название навыка | `skills.<id>.title` | навык | да | да |
| описание | `skills.<id>.description` | навык | да | да |
| связи и чего ждёт закрытый навык | `skills.<id>.prerequisites` | пререквизит (concepts 4 spec) | да | да |
| пометка «отзыв по критериям» или «без оценки» | `skills.<id>.assessability` | оцениваемость (concepts 4 spec) | да | да |
| чему учит навык | `skills.<id>.teaches` | навык-опора (concepts 4 spec; R50 spec) | да | да |
| ярус навыка | `skill_tiers` ответа `GetSkillGraph` | ярус (R49 spec, R62 spec) | да | да |
| имя яруса или его номер | `tiers` открытого вида графа | ярус (R49 spec) | да | да |
| язык названий | `languages.explanation` паспорта | язык объяснений (concepts 13 spec) | — | — |
| полный ID навыка в событии | `id` паспорта | полный ID ([текст формата](../spec/format/README.md), раздел 10) | — | — |
| состояние на карте (раздел 3.2) | `SkillState`: `evidence_count`, `mastery_band`, `review_date`, `review_due` | состояние навыка (concepts 11 spec) | да | да |
| число свидетельств | `SkillState.evidence_count` | свидетельство (concepts 11 spec) | нет | да |
| последняя практика | `SkillState.last_practiced_at` | состояние навыка | нет | да |
| полоса освоения | `SkillState.mastery_band` и `bands` паспорта, её `title` | полоса освоения (concepts 11 spec) | нет | да |
| срок повторения | `SkillState.review_date`, `review_due` | забывание и повторение (concepts 11 spec) | нет | да |
| оценка, неуверенность, удержание, осторожная вероятность | `SkillState.estimate`, `uncertainty`, `retention`, `cautious_probability` | модель ученика (concepts 11 spec) | нет | нет |
| навык-опора перед ярусом 1 и в подробностях навыка | `AnchorSkillState.anchor_skill`; название — из словаря (R04) | навык-опора (concepts 4 spec; R50 spec) | да | да |
| «владеет», «не владеет», «неизвестно» | `AnchorSkillState.holding` | навык-опора | да | да |
| почему не владеет или неизвестно | `AnchorSkillState.reason` | навык-опора | да | да |
| навыки, которые учат навыку-опоре | `AnchorSkillState.teaching_skills` | навык-опора | нет | нет |
| дайджест пакета | `GetSkillMapResponse.package_digest` | пакет модуля (R62 spec) | — | — |

«—» — поле не показывается, а служит карте. Навыки, которые учат навыку-опоре, карта не называет: это полные ID навыков других модулей, а их названий у неё нет; навыки своего модуля, которые ему учат, видны по `teaches`. Ловушек на карте нет (R99 spec).

### 3.2. Состояния на карте

У навыка с оцениваемостью `verdict` — одно из пяти состояний, первое подходящее по порядку (R03):

| Состояние | Когда | Выбор на виде ученика |
|---|---|---|
| «пора повторить» | `mastery_band` не пуст, и `review_due` или `review_date` не позже времени устройства | да |
| «освоено» | `mastery_band` не пуст | да |
| «в работе» | `evidence_count` больше нуля | да |
| «можно начинать» | у каждого пререквизита навыка среди навыков модуля с оцениваемостью `verdict` не пуст `mastery_band`, или таких пререквизитов нет | да |
| «ещё закрыт» | остальное; карта называет пререквизиты, которые ещё не освоены | нет |

- Освоенный пререквизит, которому пора повторить, навык не закрывает. Не закрывают его и пререквизит с рубрикой или без оценки, и навык-опора.
- Навык со свидетельствами открыт, даже если его пререквизит ещё не освоен или уже потерял «освоено»: ученик над ним уже работал.
- Навык с оцениваемостью `rubric` — пометка «отзыв по критериям», `none` — «без оценки»; состояния у них нет, а выбрать их можно всегда.
- Навык с вердиктом, которого ответ не называет, — как навык без свидетельств.
- Состояние называется словом и иконкой, не только цветом (R90 spec). Слова — таблица пакета на `en` и `ru` (R91 spec), иконки — из набора Material Symbols (R78 spec); какие именно, — эпик кода.

**Пример на синтетическом графе.** Модуль `example/fair-shares` с языком объяснений `en`; граф — так, как его даёт открытый вид, а ярусы — `skill_tiers`:

```yaml
tiers: [Counting, Sharing]
skills:
  count-objects: { title: Count objects, assessability: verdict }
  draw-shares: { title: Draw shares, assessability: none }
  halves: { title: Halves, assessability: verdict, prerequisites: [count-objects], teaches: [core.fractions-of-a-whole] }
  equal-groups: { title: Equal groups, assessability: verdict, prerequisites: [count-objects] }
  explain-sharing: { title: Explain how you shared, assessability: rubric, prerequisites: [count-objects], teaches: [core.division-with-remainder] }
  share-with-remainder: { title: Share with a remainder, assessability: verdict, prerequisites: [equal-groups, core.multiplication-table] }
  quarters: { title: Quarters, assessability: verdict, prerequisites: [halves, explain-sharing] }
# skill_tiers: count-objects 1, draw-shares 1, halves 2, equal-groups 2, explain-sharing 2,
#              share-with-remainder 3, quarters 3
```

Синтетический ответ `GetSkillMap` при времени устройства 2026-11-07T12:00Z и что из него выходит:

| Навык | Ярус | Из ответа | На карте |
|---|---|---|---|
| `count-objects` | 1 Counting | `evidence_count` 9, `mastery_band` `b1`, `review_date` 2026-11-20 | «освоено» |
| `draw-shares` | 1 Counting | — | «без оценки» |
| `halves` | 2 Sharing | `evidence_count` 4, `mastery_band` пуст | «в работе» |
| `equal-groups` | 2 Sharing | `evidence_count` 7, `mastery_band` `b1`, `review_due` | «пора повторить» |
| `explain-sharing` | 2 Sharing | — | «отзыв по критериям» |
| `share-with-remainder` | 3 — без имени, номером | `evidence_count` 0 | «можно начинать»: `equal-groups` освоен, хоть ему и пора повторить, а навык-опора не закрывает |
| `quarters` | 3 — без имени, номером | `evidence_count` 0 | «ещё закрыт»: ждёт `halves`; `explain-sharing` с рубрикой не держит |

| Навык-опора | Из ответа | Где на карте |
|---|---|---|
| `core.multiplication-table`, Multiplication table | `ANCHOR_SKILL_HOLDING_HELD` | перед ярусом 1, пререквизит `share-with-remainder`: «владеет» |
| `core.fractions-of-a-whole`, Fractions of a whole | `ANCHOR_SKILL_HOLDING_NOT_HELD`, `ANCHOR_SKILL_REASON_NOT_MASTERED` | в подробностях `halves`, чему он учит: «не владеет» — навык, который учит, ещё не освоен |
| `core.division-with-remainder`, Division with a remainder | `ANCHOR_SKILL_HOLDING_UNKNOWN`, `ANCHOR_SKILL_REASON_ONLY_UNASSESSABLE` | в подробностях `explain-sharing`: «неизвестно» — учат только навыки без вердикта |

На виде ученика выбрать можно все навыки, кроме `quarters`. На виде взрослого у `count-objects` ещё видно 9 свидетельств, полосу `b1` по её названию в паспорте и срок повторения 2026-11-20, а у `equal-groups` — «пора повторить». Без ответа `GetSkillMap` те же семь навыков стоят в тех же ярусах, без состояний и пометок навыков-опор, а пометки «без оценки» и «отзыв по критериям» остаются: они — из графа.

### 3.3. Элемент `<novatrail-skill-map>`

Пакет входит в потребителя одним элементом (R04; R36 spec):

| Член | Вид | Что |
|---|---|---|
| `graph` | свойство | открытый вид графа, `open.SkillGraph` из `@altnovatrail/spec/formatv0/open`; байты `OpenView` по версии формата читает `app` (R44 spec) |
| `tiers` | свойство | ярусы `skill_tiers`, `Readonly<Record<string, number>>` |
| `manifest` | свойство | открытый вид паспорта, `open.Manifest`: ID модуля, язык объяснений, полосы |
| `skillMap` | свойство | `GetSkillMapResponse` из `@altnovatrail/contracts` или `null` — карта без состояния |
| `view` | атрибут | `learner` — вид ученика, `adult` — вид взрослого; без него или с другим значением — без выбора и без подробностей взрослого |
| `lang` | атрибут | язык подписей элемента: усечение тега, а не найденный — английский (R91 spec; architecture 6 spec) |
| `heading-level` | атрибут | уровень заголовков полос, от 2 до 6, а без него или с другим значением — 3 (поправка 2026-11-07 к R04; раздел 3.4) |
| `skillchoose` | событие | `CustomEvent` с хоста, `bubbles` и `composed`, с замороженным `detail` `{ skill }` — полным ID навыка для поля `skill` запроса `ChooseNext`. Только на виде ученика, только со `skillMap` и только у незакрытого навыка; отдаёт его кнопка «Заниматься» в подробностях (R06) |

- Карта рисуется, когда есть `graph`, `tiers` и `manifest`, и обновляется на каждое присвоение — на месте, по ID навыка (раздел 3.4); на присвоение событий нет. Методов нет.
- Типы элемента — в объявлениях пакета, а элемент в `HTMLElementTagNameMap` и событие в `GlobalEventHandlersEventMap` ставит сам пакет. Типы данных — `@altnovatrail/spec` и `@altnovatrail/contracts` по той же точной версии, что тег подмодуля `spec` (R73 spec, R83 spec).
- Английские названия навыков-опор пакет вшивает при сборке из `format/schemas/shared-taxonomy.schema.json` файла формата релиза `spec`, проверенного `release-verify`, по каждой версии формата, которую читает его сборка; неизвестный ID показывает как есть, с `lang="en"` (R04; R64 spec, R77 spec).
- Касание, Enter или Space раскрывают навык, а выбирают его для занятия кнопкой «Заниматься» в подробностях: она и отдаёт `skillchoose`. С клавиатуры — Tab по плиткам (R06, раздел 3.4).

### 3.4. Раскладка

Карту раскладывает свой код пакета, на устройстве, из открытого вида графа и `skill_tiers` (R06; R03). Графы первого среза малы: `grade-3-math` — 4 навыка в 3 ярусах, `english-essays` — 6 в 4, а пример олимпиадной математики в формате — 17 в 3 (`modules`, `main` 6d061e9; `spec/format/vectors/tiers/olympiad-math.yaml`).

**Полосы.**
- Ярус — полоса, сверху вниз: сначала навыки-опоры, затем ярус 1, 2 и дальше — все, сколько есть; свёрнутых нет (Д3 в таблице 4 RUN.md).
- Заголовок полосы — слово яруса и номер, а за ними имя яруса из `tiers`, если оно есть: «Ярус 2 · Sharing», «Ярус 3» (R49 spec). У полосы навыков-опор — свой заголовок. Уровень заголовков — атрибут `heading-level` (раздел 3.3).
- Навыки полосы — плитки в строку с переносом. Прокручивает страница, своего контейнера прокрутки нет: на 320 CSS px и при масштабе 200 % полосы переносятся, и вбок ничего не прокручивается (WCAG 2.2, 1.4.10; раздел 4).
- Плитка — название навыка с `lang` языка объяснений, а навыка-опоры — с `lang="en"`; состояние или пометка — словом и иконкой (раздел 3.2). Цель — не меньше 44 × 44 CSS px (R90 spec).
- У последовательного модуля по навыку в полосе — тем же правилом. Своего вида у него нет.

**Порядок в полосе.**
- Ярус 1 — по ID навыка в модуле.
- Каждая следующая полоса — по среднему месту пререквизитов навыка среди навыков модуля; место — номер плитки в её полосе, с нуля. При равенстве — по ID.
- Навыки-опоры места не дают, а в своей полосе стоят по ID. В ней — только пререквизиты навыков модуля (R03); если у модуля их нет, нет и полосы вместе с её заголовком.
- ID сравниваются по кодам символов. Порядок навыков в графе, состояние и раскрытие места плитки не меняют.

**Раскрытие и подробности.**
- Касание, Enter или Space на плитке раскрывают навык, повторное — закрывает; раскрыт один навык. Раскрыть можно любой навык, закрытый и навык-опору тоже: раскрытие — не выбор навыка для занятия, а выбор — только кнопкой «Заниматься» (раздел 3.2; R04).
- Раскрытие живёт в памяти элемента и наружу не уходит. На присвоение свойств элемент обновляет плитки на месте, по ID навыка: плитка, на которой фокус, и раскрытые подробности остаются. Если раскрытого навыка с новыми данными больше нет, подробности закрываются. Если пропал узел, на котором фокус, — плитка или кнопка «Заниматься», которую сменило «ждёт», — фокус переходит на плитку того же навыка, а без неё — на первую плитку той же полосы, а без неё — на первую плитку карты (поправка 2026-11-07 к R04).
- Подробности стоят в DOM сразу за плиткой — отдельным элементом списка полосы, `<li>` за `<li>` плитки, во всю ширину полосы: плитки после раскрытой переносятся под них. Пока подробности открыты, в списке полосы на один элемент больше. Плитка — кнопка-раскрытие, с `aria-expanded` и `aria-controls` на этот элемент.
- В подробностях навыка: название и описание; состояние или пометка; «Опирается на» — его пререквизиты, у закрытого — с отметкой, какие ещё не освоены; «Открывает» — навыки, у которых он пререквизит; «Учит» — навыки-опоры из `teaches`, с их состоянием; у взрослого — ещё числа раздела 3.1.
- На виде ученика, со `skillMap`, у незакрытого навыка модуля — кнопка «Заниматься»: она отдаёт `skillchoose` (R04). У закрытого вместо неё — «ждёт» и неосвоенные пререквизиты. У навыка-опоры, на виде взрослого, без `view` или с другим его значением и без состояния кнопки нет.
- Что ответит `ChooseNext`, показывает `app`, и «нечего дать» тоже — его ответ бывает пустым, когда `api` ограничил пул задачами без ИИ (R104 spec). Карта после `skillchoose` ничего не ждёт.
- Подробности навыка-опоры — название, состояние, причина и навыки модуля, которым он нужен.

**Линии.**
- Только у раскрытого навыка: от плитки каждого его пререквизита — навыка модуля или навыка-опоры — к нему и от него к каждому навыку, у которого он пререквизит. Связь через ярус — такая же линия.
- Линии от пререквизитов входят в верхний край плитки. Линии к тому, что навык открывает, выходят из нижнего края его подробностей: плитка и подробности — один блок, и под подробностями линии не идут.
- Пакет проводит линии по измеренным местам плиток, когда раскладка готова, и проводит заново, когда меняется её размер. Линии лежат под плитками и не закрывают их, а у каждой на обоих концах — точка. Связь через ярус и линия от навыка-опоры проходят под плитками промежуточных полос, а линия из подробностей — и под плитками, перенесёнными под них: что с чем связано, говорят точки на концах и подписи у связанных плиток, а не сама линия.
- У подсвеченных плиток — подписи «нужен раньше» и «откроется после»: связь видна не только цветом (1.4.1). Контраст линии с фоном — не меньше 3:1 (1.4.11).
- При `prefers-reduced-motion` линии появляются без анимации (R90 spec).

**Клавиатура и текстовая замена.**
- Каждая плитка — кнопка в порядке Tab: полоса за полосой, в порядке раскладки. Enter или Space раскрывает навык, фокус остаётся на плитке, а «Заниматься» — следующая остановка Tab: подробности стоят сразу за плиткой (2.4.3). Своего липкого у карты нет, а чтобы фокус не закрывало липкое на странице — шапка или строка `app`, — отвечает `app` (2.4.11).
- Текстовая замена — само дерево DOM: полоса — заголовок и список плиток, доступное имя плитки — «название, состояние», а у подсвеченной — ещё и подпись, которая стоит внутри кнопки: «название, состояние, нужен раньше». Связи названы словами в подробностях и подписях. SVG линий — `aria-hidden`. Порядок DOM — порядок на экране (1.3.2).

Слова — слово яруса в заголовке полосы, «Заниматься», «Опирается на», «Открывает», «Учит», «ждёт», «нужен раньше», «откроется после», заголовок полосы навыков-опор — своя таблица пакета на `en` и `ru` (R91 spec); окончательные строки и иконки — эпик кода.

**Пример** — модуль `example/fair-shares` раздела 3.2, с его синтетическим ответом `GetSkillMap`:

| Полоса | Плитки по порядку | Почему такой порядок |
|---|---|---|
| навыки-опоры | `core.multiplication-table` | только пререквизиты; по ID |
| 1 · Counting | `count-objects` (0), `draw-shares` (1) | ярус 1 — по ID |
| 2 · Sharing | `equal-groups` (0), `explain-sharing` (1), `halves` (2) | у всех трёх единственный пререквизит — `count-objects`, место 0: равенство, по ID |
| 3 | `share-with-remainder` (0), `quarters` (1) | `share-with-remainder` — среднее места `equal-groups`, 0, а навык-опора места не даёт; `quarters` — среднее мест `halves` и `explain-sharing`, (2 + 1) / 2 = 1,5. Имени у яруса 3 нет — только номер |

- **Раскрыт `quarters`** на виде ученика. Подробности встают за его плиткой, в конце полосы 3. Линии идут к нему от `halves` и от `explain-sharing`, а на их плитках — «нужен раньше». «Опирается на»: Halves — ещё не освоен, и Explain how you shared; «Открывает» — ничего. Навык закрыт: вместо «Заниматься» — «ждёт: Halves».
- **Раскрыт `share-with-remainder`.** Подробности встают за его плиткой, и `quarters` переносится под них. Линии идут к нему от `equal-groups` и от `core.multiplication-table` из полосы навыков-опор, и на обеих плитках — «нужен раньше». Навык — «можно начинать», и кнопка «Заниматься» отдаёт `skillchoose` с `detail` `{ skill: "example/fair-shares/skill/share-with-remainder" }`.
- **Раскрыт `count-objects`.** Его подробности встают за плиткой, и `draw-shares` переносится под них. Линии идут из нижнего края подробностей к `equal-groups`, `explain-sharing` и `halves`, а на их плитках — «откроется после». Tab с плитки `count-objects` ведёт на «Заниматься», а дальше — на `draw-shares`.

### 3.5. Ранги

- **На карте рангов нет** — ни у навыка, ни у модуля, ни у ученика (R07). О владении карта говорит пятью состояниями на карте, а у взрослого — ещё и полосой освоения по её названию из паспорта (разделы 3.1 и 3.2; R03). Ранг — «ступень, которой отображение называет владение» (concepts 15 spec), и что это за ступень в NovaTrail, решает О-13.
- **Что ушло к О-13** — строка «В реестр spec» в таблице 3 [RUN.md](../RUN.md):
  - общего ранга ученика быть не может: уровень — на модуль, и шкалы модулей не складываются (concepts 11 spec);
  - ранг модуля — номер полосы, в которой стоит уровень модуля, «ранг k из N», номером без имени (R213 standalone). Уровня модуля в `GetSkillMap` нет: нужны поле контракта и правило `learner-model`;
  - ранг навыка — номер его полосы освоения. Полей он не просит, но у навыка, которому учат только в нижней полосе, выше «ранга 1» не поднимется;
  - рекомендация — ранг модуля, если О-13 решит, что ранги видны, а до того — никаких.
- **Как ранги придут.** Их включит атрибут элемента: его ставит `app` по стилю подачи ученика, на обоих видах карты, а без атрибута рангов нет. Карта стиля подачи не знает и профиля не читает (R04). Имя атрибута и вид ранга назовёт решение, которое придёт вслед за О-13, поправкой к R04; как стиль подачи держит ранги, решают О-13, О-23 и `app`.

## 4. Источники

Внешний факт — условия поставщика, цена, закон, документация библиотеки — встаёт сюда с источником и датой прочтения (RULES.md, The bar).

- **Карта тем и ярусы в MathTrail** (разделы 2.1, 2.2) — [mathtrail/mathtrail-standalone, `SPEC.md`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/SPEC.md), раздел 8.12.2 «The site», ветка `main`, коммит c6cbeb2, прочитано 2026-10-19: «a topic's layer is the longest chain of bases below it — 0 the foundations, 1 the rules, 2 the hard problems — computed rather than drawn, and a test on the catalog keeps the chains within three layers»; «The map is laid out when the site is built …: a column for each layer, from left to right in every language as a drawing is»; «a link to the next column is a curve, and a link that skips one runs under every box»; «Pointing at a topic, or reaching it with the keyboard, lights every topic below it and above it and the lines between them … no script runs»; «On a narrow screen the map scrolls sideways inside its panel».
- **Ранги в MathTrail** (разделы 2.3 и 3.5; R07) — тот же коммит c6cbeb2, прочитано 2026-10-19:
  - [`SPEC.md`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/SPEC.md), раздел 2.4 «The chess scale and the ranks»: «Above the number comes a rank: eleven steps, told by their numbers — "Rank 3", "of 11" — with no names of their own»; рейтинг считается и общий, и по теме: «applied to θ + δ_topic, the rating for a topic»;
  - [`docs/decisions.md`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/docs/decisions.md), запись R213 standalone: «A rank is told by its number»; «a topic's rank is "Rank 4" at the end of its row»; «the eleven names of the dictionaries are gone»;
  - [`internal/domain/rating/scale.go`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/internal/domain/rating/scale.go), функция `Rank`: «It is worked out wherever it is drawn and stored nowhere». Её зовёт сервер, когда собирает прогресс ([`internal/domain/progress/progress.go`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/internal/domain/progress/progress.go)), а ответ прогресса несёт общий ранг в поле `rank` и число рангов шкалы в поле `ranks` — «so that a card need not know the number», — а у каждой темы своё поле `rank` ([`internal/transport/mcp/progress.go`](https://github.com/mathtrail/mathtrail-standalone/blob/c6cbeb2/internal/transport/mcp/progress.go), типы `standingOut` и `topicOut`).
- **Раскладка карты тем в MathTrail** (раздел 2.1) — [mathtrail/mathtrail-standalone, `web/src/site/topicmap.ts`](https://github.com/mathtrail/mathtrail-standalone/blob/6b29dd9/web/src/site/topicmap.ts), ветка `main`, коммит 6b29dd9, прочитано 2026-11-07: «each in the column of its layer, the foundations in the catalog's order and every other column by where its topics' bases stand, so that lines cross as little as a simple rule allows»; «A link to the next column is a curve between the two boxes; a link that skips a column runs down a gutter, along a lane of its own under every box, and up the next gutter»; подсветку дают правила CSS, которые пишутся при сборке, — «and need no script; a browser that cannot read them shows the map unlit». Рисует карту [`web/src/site/TopicMap.tsx`](https://github.com/mathtrail/mathtrail-standalone/blob/6b29dd9/web/src/site/TopicMap.tsx) того же коммита: «it scrolls sideways inside its panel where the screen is narrower than it».
- **WCAG 2.2** (раздел 3.4; R06 и поправка 2026-11-07 к R04) — [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation 12 December 2024, прочитано 2026-11-07:
  - 1.4.10 Reflow: «Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels. Except for parts of the content which require two-dimensional layout for usage or meaning». Note 2 у [Understanding 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): «Examples of content which requires two-dimensional layout are images required for understanding (such as maps and diagrams), video, games, presentations, data tables (not individual cells), and interfaces where it is necessary to keep toolbars in view»;
  - 2.5.7 Dragging Movements: «All functionality that uses dragging movements can be operated by single pointer activation without dragging, unless dragging is essential»;
  - 1.3.1 Info and Relationships: «Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text» — к уровню заголовков полос, поправка 2026-11-07 к R04;
  - 1.3.2 Meaningful Sequence: «When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined»;
  - 2.4.3 Focus Order: «focusable components receive focus in an order that preserves meaning and operability»;
  - 2.4.11 Focus Not Obscured (Minimum): «When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content»;
  - 1.4.1 Use of Color: «Color is not used as the only visual means of conveying information»;
  - 1.4.11 Non-text Contrast: «a contrast ratio of at least 3:1 against adjacent color(s): User Interface Components and Graphical Objects».
- **Библиотеки раскладки** (раздел 3.4; R06) — реестр npm, `npm view <пакет> version license description` и README пакета, прочитано 2026-11-07:
  - [`@dagrejs/dagre`](https://www.npmjs.com/package/@dagrejs/dagre) 3.1.3, MIT: «Dagre is a JavaScript library that makes it easy to lay out directed graphs on the client-side»; прежний пакет `dagre` — 0.8.5, а README говорит, что обновляется только тот, что в организации DagreJs;
  - [`elkjs`](https://www.npmjs.com/package/elkjs) 0.12.1, `EPL-2.0 OR GPL-3.0-or-later`: «Automatic graph layout based on Sugiyama's algorithm»; «elkjs is not a diagramming framework itself - it computes positions for the elements of a diagram»;
  - [`d3-dag`](https://www.npmjs.com/package/d3-dag) 1.3.0, MIT: «`d3-dag` provides layered graph layout algorithms for directed acyclic graphs».
- **Карта тем прототипа** (раздел 3.4; R06) — `spec/draft/NovaTrail Widget.html` на теге v0.9.5, код экрана карты, `tsteps`: ступени — «Step 1 · Basics», «Step 2 · Rules», «Step 3 · Hard tasks» — идут друг под другом, ступень открыта, когда она не дальше одной от выбранной темы, а иначе свёрнута в строку названий; у тем — пометки `BEFORE` и `AFTER` относительно выбранной; у выбранной — панель, где кнопка «Practise: …», а у закрытой — «Opens in grade 5».
