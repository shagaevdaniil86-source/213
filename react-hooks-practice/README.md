# ПР16 React Hooks

## Запуск

Нужен Node.js 22.12+ или Node.js 24 и npm. Выполните из папки `react-hooks-practice`:

```bash
npm install
npm start
```

Откройте адрес Vite, указанный в терминале (обычно `http://127.0.0.1:5173/`). JSX собирается Vite; открывать исходный index.html двойным щелчком не следует.

```bash
npm test
npm run build
npm run preview
```

Альтернатива с зафиксированным lock-файлом: `pnpm install --frozen-lockfile`, затем `pnpm test` и `pnpm start`. Требуемые имена файлов `.js` сохранены; обработка JSX настроена в vite.config.js. node_modules и dist исключены из Git.

## Задания

- BasicHooks.js: Counter, UserForm, TodoList с фильтрами и удалением, Timer, WindowSize, DataFetcher.
- AdvancedHooks.js: cartReducer/ShoppingCart, stopwatchReducer/Stopwatch с кругами, ThemeContext/ThemeProvider/ThemeToggle, ExpensiveCalculation с useMemo и memo-кнопкой/useCallback, FocusInput и PreviousValue.
- CustomHooks.js: useLocalStorage, useFetch, useToggle, useDebounce, useWindowSize и пять компонентов-демонстраций.
- HooksTests.js: проверка отображения разделов. Hooks.test.js: автоматические тесты поведения.

Запросы читают JSONPlaceholder и требуют интернета; автоматические тесты используют подменённые ответы. Имя из демонстрации useLocalStorage остаётся только в localStorage браузера. Тема действует на всю страницу. При повторном монтировании или смене URL интервалы, слушатели и запросы очищаются.

В примере методички эффект без зависимостей обновлял счётчик рендеров и мог создать бесконечный цикл. Здесь независимый счётчик меняется по кнопке и показывает повторный рендер без пересчёта мемоизированного результата. Цикл вычисления ограничен 200 000 итерациями, чтобы демонстрация не блокировала интерфейс надолго.

Справка: [React useReducer](https://react.dev/reference/react/useReducer).
