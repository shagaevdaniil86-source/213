import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
export function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const item = action.payload;
      if (!item || !Number.isFinite(item.price) || item.price < 0) return state;
      const exists = state.items.some((i) => i.id === item.id);
      return {
        ...state,
        items: exists
          ? state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
            )
          : [...state.items, { ...item, quantity: 1 }],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (!Number.isInteger(quantity)) return state;
      return {
        ...state,
        items:
          quantity <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      };
    }
    case "CLEAR_CART":
      return { items: [] };
    default:
      return state;
  }
}
const products = [
  { id: 1, name: "Фляга", price: 400 },
  { id: 2, name: "Фонарь", price: 900 },
  { id: 3, name: "Насос", price: 700 },
];
export function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return (
    <article className="demo" data-demo="cart">
      <h3>3.1. Корзина useReducer</h3>
      <div className="actions">
        {products.map((p) => (
          <button
            type="button"
            key={p.id}
            onClick={() => dispatch({ type: "ADD_ITEM", payload: p })}
          >
            Добавить {p.name} ({p.price} ₽)
          </button>
        ))}
      </div>
      <ul aria-label="Корзина">
        {state.items.map((item) => (
          <li key={item.id} className="row">
            <span>
              {item.name}: {item.price} ₽ × {item.quantity}
            </span>
            <div className="actions">
              <button
                type="button"
                aria-label={`Уменьшить ${item.name}`}
                onClick={() =>
                  dispatch({
                    type: "UPDATE_QUANTITY",
                    payload: { id: item.id, quantity: item.quantity - 1 },
                  })
                }
              >
                −
              </button>
              <button
                type="button"
                aria-label={`Увеличить ${item.name}`}
                onClick={() =>
                  dispatch({
                    type: "UPDATE_QUANTITY",
                    payload: { id: item.id, quantity: item.quantity + 1 },
                  })
                }
              >
                +
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "REMOVE_ITEM", payload: item.id })
                }
              >
                Удалить {item.name}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p role="status">Общая сумма: {total} ₽</p>
      <button type="button" onClick={() => dispatch({ type: "CLEAR_CART" })}>
        Очистить корзину
      </button>
    </article>
  );
}
export const initialStopwatch = { isRunning: false, time: 0, laps: [] };
export function stopwatchReducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, isRunning: true };
    case "STOP":
      return { ...state, isRunning: false };
    case "RESET":
      return { ...initialStopwatch, laps: [] };
    case "TICK":
      return state.isRunning ? { ...state, time: state.time + 1 } : state;
    case "LAP":
      return state.isRunning
        ? { ...state, laps: [...state.laps, state.time] }
        : state;
    default:
      return state;
  }
}
export function Stopwatch() {
  const [state, dispatch] = useReducer(stopwatchReducer, initialStopwatch);
  useEffect(() => {
    if (!state.isRunning) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.isRunning]);
  return (
    <article className="demo" data-demo="stopwatch">
      <h3>3.2. Секундомер useReducer</h3>
      <output aria-label="Время секундомера">{state.time} сек.</output>
      <div className="actions">
        <button
          type="button"
          onClick={() => dispatch({ type: state.isRunning ? "STOP" : "START" })}
        >
          {state.isRunning ? "Стоп секундомера" : "Старт секундомера"}
        </button>
        <button type="button" onClick={() => dispatch({ type: "RESET" })}>
          Сброс секундомера
        </button>
        <button
          type="button"
          disabled={!state.isRunning}
          onClick={() => dispatch({ type: "LAP" })}
        >
          Круг
        </button>
      </div>
      <ol aria-label="Круги">
        {state.laps.map((lap, index) => (
          <li key={index}>
            Круг {index + 1}: {lap} сек.
          </li>
        ))}
      </ol>
    </article>
  );
}
export const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    [],
  );
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}
export function ThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("Нужен ThemeProvider");
  return (
    <article className="demo" data-demo="theme">
      <h3>4.1. Тема через Context</h3>
      <p>Текущая тема: {context.theme === "light" ? "светлая" : "тёмная"}</p>
      <button
        type="button"
        aria-pressed={context.theme === "dark"}
        onClick={context.toggleTheme}
      >
        Переключить тему
      </button>
    </article>
  );
}
export function calculateRouteScore(number) {
  let total = 0;
  for (let i = 1; i <= 200000; i++) total += (i % 97) * number;
  return total;
}
const CalculationButton = memo(function CalculationButton({ onIncrease }) {
  return (
    <button type="button" onClick={onIncrease}>
      Увеличить число
    </button>
  );
});
export function ExpensiveCalculation() {
  const [number, setNumber] = useState(1),
    [unrelated, setUnrelated] = useState(0);
  const result = useMemo(() => calculateRouteScore(number), [number]);
  const increase = useCallback(() => setNumber((n) => n + 1), []);
  return (
    <article className="demo" data-demo="memo">
      <h3>5.1. useMemo и useCallback</h3>
      <p>Число: {number}</p>
      <p>Результат вычисления: {result}</p>
      <p>Независимый счётчик: {unrelated}</p>
      <div className="actions">
        <CalculationButton onIncrease={increase} />
        <button type="button" onClick={() => setUnrelated((n) => n + 1)}>
          Обновить без пересчёта
        </button>
        <button type="button" onClick={() => setUnrelated(0)}>
          Сброс независимого счётчика
        </button>
      </div>
      <p className="muted">
        Вычисление зависит только от числа. memo-кнопка получает стабильный
        callback. Эффекта, который бесконечно обновляет счётчик рендеров, нет.
      </p>
    </article>
  );
}
export function FocusInput() {
  const input = useRef(null);
  return (
    <article className="demo" data-demo="focus">
      <h3>6.1. Фокус через useRef</h3>
      <label htmlFor="focus-input">Поле для фокуса</label>
      <input id="focus-input" ref={input} />
      <div className="actions">
        <button type="button" onClick={() => input.current?.focus()}>
          Фокус на поле
        </button>
      </div>
    </article>
  );
}
export function PreviousValue() {
  const [value, setValue] = useState("");
  const previous = useRef("");
  useEffect(() => {
    previous.current = value;
  }, [value]);
  return (
    <article className="demo" data-demo="previous">
      <h3>6.2. Предыдущее значение</h3>
      <label htmlFor="previous-input">Изменяемый текст</label>
      <input
        id="previous-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p>Текущее: {value}</p>
      <p aria-label="Предыдущее значение">Предыдущее: {previous.current}</p>
    </article>
  );
}
export default function AdvancedHooks() {
  return (
    <section className="panel" id="advanced-hooks">
      <h2>Продвинутые хуки</h2>
      <ShoppingCart />
      <Stopwatch />
      <ThemeToggle />
      <ExpensiveCalculation />
      <FocusInput />
      <PreviousValue />
    </section>
  );
}
