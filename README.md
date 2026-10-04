# МДК 07

Практические работы по веб-разработке. Основная ветка — `main`.

Проект создан в рамках практической работы по Git.

## Практические работы

| Работа                            | Файлы                                          |
| --------------------------------- | ---------------------------------------------- |
| ПР1 — Git                         | [answers.md](answers.md)                       |
| ПР2 — семантическая HTML-разметка | [semantic_html_project](semantic_html_project) |
| ПР3 — CSS, каскад и наследование  | [css_practice](css_practice)                   |
| ПР4 — Flexbox                     | [flexbox_practice](flexbox_practice)           |
| ПР5 — CSS Grid                    | [css_grid_practice](css_grid_practice)         |
| ПР6 — адаптивная вёрстка          | [responsive_design](responsive_design)         |
| ПР7 — формы и валидация           | [forms_validation](forms_validation)           |
| ПР8 — вёрстка по макету           | [layout_to_code](layout_to_code)               |
| ПР9 — базовые алгоритмы           | [js_algorithms](js_algorithms)                 |
| ПР10 — функции JavaScript         | [js_functions](js_functions)                   |
| ПР11 — DOM                        | [dom_manipulation](dom_manipulation)           |
| ПР12 — обработка событий          | [event_handling](event_handling)               |
| ПР13 — асинхронные операции       | [async_operations](async_operations)           |
| ПР14 — Fetch API                  | [fetch_api](fetch_api)                         |

## Запуск

Откройте `index.html` выбранной практической в браузере. Для проверки через локальный сервер из корня репозитория выполните:

```bash
python -m http.server 8000
```

Затем откройте `http://localhost:8000/` и выберите папку практической. ПР9–ПР14 содержат кнопку запуска тестов. В каждой папке есть `answers.md` с ответами; ответы ПР1 находятся в корне.

ПР13–ПР14 используют учебный JSONPlaceholder API; POST/PUT/PATCH/DELETE моделируют изменения. Для внешних запросов нужен интернет. ПР7 проверяет данные локально и не сохраняет пароль.

## Макет ПР8

[Исходный SVG-макет](layout_to_code/design.svg), [данные макета](layout_to_code/design-analysis.csv), [дизайн-токены](layout_to_code/design-tokens.json). SVG можно импортировать в Figma. Ссылка на файл Figma пока не добавлена: требуется импорт в аккаунт владельца.

## Справочные материалы

- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/)
