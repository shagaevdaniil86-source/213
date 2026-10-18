import React from "react";
import { it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  renderHook,
  waitFor,
  within,
} from "@testing-library/react";
import {
  Counter,
  UserForm,
  TodoList,
  Timer,
  WindowSize,
  DataFetcher,
} from "./BasicHooks.js";
import {
  cartReducer,
  ShoppingCart,
  stopwatchReducer,
  initialStopwatch,
  Stopwatch,
  ThemeProvider,
  ThemeToggle,
  ExpensiveCalculation,
  FocusInput,
  PreviousValue,
  calculateRouteScore,
} from "./AdvancedHooks.js";
import {
  useLocalStorage,
  useFetch,
  useToggle,
  useDebounce,
  useWindowSize,
  DebounceDemo,
} from "./CustomHooks.js";
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const response = (data, status = 200) => ({
  ok: status < 300 && status >= 200,
  status,
  json: async () => data,
});
it("counter increments, decrements and resets", () => {
  render(<Counter />);
  fireEvent.click(screen.getByText("+1"));
  fireEvent.click(screen.getByText("+1"));
  fireEvent.click(screen.getByText("-1"));
  expect(screen.getByLabelText("Значение счётчика").textContent).toBe("1");
  fireEvent.click(screen.getByText("Сброс счётчика"));
  expect(screen.getByLabelText("Значение счётчика").textContent).toBe("0");
});
it("user form preserves unrelated properties", () => {
  render(<UserForm />);
  fireEvent.change(screen.getByLabelText("Имя участника"), {
    target: { value: "Ия" },
  });
  fireEvent.change(screen.getByLabelText("Email участника"), {
    target: { value: "a@b.ru" },
  });
  expect(
    JSON.parse(screen.getByLabelText("Текущие значения").textContent),
  ).toEqual({ name: "Ия", email: "a@b.ru", age: "" });
});
it("todos reject whitespace, handle duplicate text, filter, toggle and remove", () => {
  render(<TodoList />);
  const input = screen.getByLabelText("Новая задача"),
    add = screen.getByText("Добавить задачу");
  fireEvent.change(input, { target: { value: " " } });
  fireEvent.click(add);
  expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  for (let i = 0; i < 2; i++) {
    fireEvent.change(input, { target: { value: "Вода" } });
    fireEvent.click(add);
  }
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  fireEvent.click(screen.getByText("Активные"));
  expect(screen.getAllByRole("checkbox")).toHaveLength(1);
  expect(screen.getByRole("checkbox").checked).toBe(false);
  fireEvent.click(screen.getByText("Завершённые"));
  expect(screen.getByRole("checkbox").checked).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Удалить Вода" }));
  expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  fireEvent.click(screen.getByText("Все"));
  expect(screen.getAllByRole("checkbox")).toHaveLength(1);
});
it("effect timer pauses, resumes, resets and cleans up in StrictMode", () => {
  vi.useFakeTimers();
  const { unmount } = render(
    <React.StrictMode>
      <Timer />
    </React.StrictMode>,
  );
  fireEvent.click(screen.getByText("Старт таймера"));
  expect(vi.getTimerCount()).toBe(1);
  act(() => vi.advanceTimersByTime(2100));
  expect(screen.getByLabelText("Время таймера").textContent).toContain("2");
  fireEvent.click(screen.getByText("Пауза таймера"));
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByLabelText("Время таймера").textContent).toContain("2");
  fireEvent.click(screen.getByText("Старт таймера"));
  fireEvent.click(screen.getByText("Сброс таймера"));
  expect(vi.getTimerCount()).toBe(0);
  expect(screen.getByLabelText("Время таймера").textContent).toContain("0");
  fireEvent.click(screen.getByText("Старт таймера"));
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
it("window effect responds to resize and removes listener", () => {
  const remove = vi.spyOn(window, "removeEventListener"),
    old = innerWidth;
  const { unmount } = render(<WindowSize />);
  window.innerWidth = 450;
  fireEvent(window, new Event("resize"));
  expect(screen.getByLabelText("Размер окна").textContent).toContain("450");
  unmount();
  expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  window.innerWidth = old;
});
it("DataFetcher loads on mount and URL change", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) =>
      response({ name: url, email: "a@b.ru", phone: "123" }),
    ),
  );
  const { rerender } = render(<DataFetcher url="first" />);
  await waitFor(() => expect(screen.getByText("Имя: first")).toBeTruthy());
  rerender(<DataFetcher url="second" />);
  await waitFor(() => expect(screen.getByText("Имя: second")).toBeTruthy());
});
it("DataFetcher shows HTTP and JSON failures", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(response({}, 404))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Неверный JSON");
        },
      }),
  );
  const { rerender } = render(<DataFetcher url="404" />);
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toBe("HTTP 404"),
  );
  rerender(<DataFetcher url="json" />);
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toBe("Неверный JSON"),
  );
});
it("DataFetcher aborts and ignores a stale response", async () => {
  let finish;
  const fetch = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((r) => {
          finish = r;
        }),
    )
    .mockResolvedValue(response({ name: "new" }));
  vi.stubGlobal("fetch", fetch);
  const { rerender, unmount } = render(<DataFetcher url="old" />);
  const first = fetch.mock.calls[0][1].signal;
  rerender(<DataFetcher url="new" />);
  await waitFor(() => expect(screen.getByText("Имя: new")).toBeTruthy());
  await act(async () => finish(response({ name: "old" })));
  expect(first.aborted).toBe(true);
  expect(screen.queryByText("Имя: old")).toBe(null);
  unmount();
  expect(fetch.mock.calls[1][1].signal.aborted).toBe(true);
});
it("cart reducer is immutable, merges quantity, removes at zero and clears", () => {
  const initial = { items: [] },
    product = { id: 1, name: "Фляга", price: 400 };
  const a = cartReducer(initial, { type: "ADD_ITEM", payload: product }),
    b = cartReducer(a, { type: "ADD_ITEM", payload: product });
  expect(initial.items).toEqual([]);
  expect(a.items[0].quantity).toBe(1);
  expect(b.items[0].quantity).toBe(2);
  expect(
    cartReducer(b, { type: "UPDATE_QUANTITY", payload: { id: 1, quantity: 0 } })
      .items,
  ).toEqual([]);
  expect(cartReducer(b, { type: "REMOVE_ITEM", payload: 1 }).items).toEqual([]);
  expect(cartReducer(b, { type: "CLEAR_CART" })).toEqual({ items: [] });
  expect(
    cartReducer(b, {
      type: "UPDATE_QUANTITY",
      payload: { id: 1, quantity: 1.5 },
    }),
  ).toBe(b);
  expect(
    cartReducer(initial, {
      type: "ADD_ITEM",
      payload: { ...product, price: -1 },
    }),
  ).toBe(initial);
});
it("cart UI calculates totals and updates items", () => {
  render(<ShoppingCart />);
  fireEvent.click(screen.getByText("Добавить Фляга (400 ₽)"));
  fireEvent.click(screen.getByText("Добавить Фонарь (900 ₽)"));
  fireEvent.click(screen.getByLabelText("Увеличить Фляга"));
  expect(screen.getByRole("status").textContent).toBe("Общая сумма: 1700 ₽");
  fireEvent.click(screen.getByLabelText("Уменьшить Фляга"));
  fireEvent.click(screen.getByText("Удалить Фонарь"));
  expect(screen.getByRole("status").textContent).toBe("Общая сумма: 400 ₽");
  fireEvent.click(screen.getByText("Очистить корзину"));
  expect(
    within(screen.getByRole("list", { name: "Корзина" })).queryAllByRole(
      "listitem",
    ),
  ).toHaveLength(0);
});
it("stopwatch reducer prevents ticks when stopped and resets laps", () => {
  expect(stopwatchReducer(initialStopwatch, { type: "TICK" })).toBe(
    initialStopwatch,
  );
  let state = stopwatchReducer(initialStopwatch, { type: "START" });
  state = stopwatchReducer(state, { type: "TICK" });
  state = stopwatchReducer(state, { type: "LAP" });
  expect(state.laps).toEqual([1]);
  state = stopwatchReducer(state, { type: "STOP" });
  expect(stopwatchReducer(state, { type: "TICK" }).time).toBe(1);
  expect(stopwatchReducer(state, { type: "RESET" })).toEqual(initialStopwatch);
});
it("stopwatch UI records a lap and cleans its interval", () => {
  vi.useFakeTimers();
  const { unmount } = render(<Stopwatch />);
  fireEvent.click(screen.getByText("Старт секундомера"));
  act(() => vi.advanceTimersByTime(2000));
  fireEvent.click(screen.getByText("Круг"));
  expect(screen.getByText("Круг 1: 2 сек.")).toBeTruthy();
  fireEvent.click(screen.getByText("Стоп секундомера"));
  expect(vi.getTimerCount()).toBe(0);
  fireEvent.click(screen.getByText("Сброс секундомера"));
  expect(screen.queryByText("Круг 1: 2 сек.")).toBe(null);
  fireEvent.click(screen.getByText("Старт секундомера"));
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
it("context switches theme for its descendants", () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
  fireEvent.click(screen.getByText("Переключить тему"));
  expect(
    screen.getByText("Текущая тема: тёмная").closest("[data-theme]").dataset
      .theme,
  ).toBe("dark");
});
it("memo calculation follows number, not unrelated updates", () => {
  render(<ExpensiveCalculation />);
  const expected = calculateRouteScore(1);
  expect(screen.getByText(`Результат вычисления: ${expected}`)).toBeTruthy();
  fireEvent.click(screen.getByText("Обновить без пересчёта"));
  expect(screen.getByText(`Результат вычисления: ${expected}`)).toBeTruthy();
  fireEvent.click(screen.getByText("Увеличить число"));
  expect(
    screen.getByText(`Результат вычисления: ${expected * 2}`),
  ).toBeTruthy();
});
it("useRef focuses a DOM input", () => {
  render(<FocusInput />);
  fireEvent.click(screen.getByText("Фокус на поле"));
  expect(document.activeElement).toBe(screen.getByLabelText("Поле для фокуса"));
});
it("previous value reflects the prior edit", () => {
  render(<PreviousValue />);
  const input = screen.getByLabelText("Изменяемый текст");
  fireEvent.change(input, { target: { value: "A" } });
  fireEvent.change(input, { target: { value: "AB" } });
  expect(screen.getByLabelText("Предыдущее значение").textContent).toBe(
    "Предыдущее: A",
  );
});
it("localStorage initializes and accepts functional updates", () => {
  localStorage.setItem("n", "2");
  const { result } = renderHook(() => useLocalStorage("n", 0));
  expect(result.current[0]).toBe(2);
  act(() => result.current[1]((n) => n + 1));
  expect(localStorage.getItem("n")).toBe("3");
});
it("localStorage tolerates invalid JSON and switches keys without overwriting", () => {
  localStorage.setItem("bad", "{");
  localStorage.setItem("next", "7");
  const { result, rerender } = renderHook(
    ({ key }) => useLocalStorage(key, 0),
    { initialProps: { key: "bad" } },
  );
  expect(result.current[0]).toBe(0);
  rerender({ key: "next" });
  expect(result.current[0]).toBe(7);
  expect(localStorage.getItem("next")).toBe("7");
});
it("localStorage handles blocked writes and another tab", () => {
  const { result } = renderHook(() => useLocalStorage("tab", ""));
  localStorage.setItem("tab", '"соседняя вкладка"');
  act(() =>
    window.dispatchEvent(
      new StorageEvent("storage", { key: "tab", storageArea: localStorage }),
    ),
  );
  expect(result.current[0]).toBe("соседняя вкладка");
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("quota");
  });
  act(() => result.current[1]("память"));
  expect(result.current[0]).toBe("память");
});
it("useFetch loads data and cancels during unmount", async () => {
  const fetch = vi.fn(async () => response({ id: 1 }));
  vi.stubGlobal("fetch", fetch);
  const { result, unmount } = renderHook(() => useFetch("user"));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual({ id: 1 });
  unmount();
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
});
it("useFetch reports network, HTTP and JSON errors", async () => {
  const fetch = vi
    .fn()
    .mockRejectedValueOnce(new Error("Нет сети"))
    .mockResolvedValueOnce(response({}, 500))
    .mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error("JSON");
      },
    });
  vi.stubGlobal("fetch", fetch);
  const { result, rerender } = renderHook(({ url }) => useFetch(url), {
    initialProps: { url: "network" },
  });
  await waitFor(() => expect(result.current.error).toBe("Нет сети"));
  rerender({ url: "http" });
  await waitFor(() => expect(result.current.error).toBe("HTTP 500"));
  rerender({ url: "json" });
  await waitFor(() => expect(result.current.error).toBe("JSON"));
});
it("useFetch ignores a late response after changing URL", async () => {
  let finish;
  const fetch = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((r) => {
          finish = r;
        }),
    )
    .mockResolvedValue(response({ id: 2 }));
  vi.stubGlobal("fetch", fetch);
  const { result, rerender } = renderHook(({ url }) => useFetch(url), {
    initialProps: { url: "old" },
  });
  rerender({ url: "new" });
  await waitFor(() => expect(result.current.data).toEqual({ id: 2 }));
  await act(async () => finish(response({ id: 1 })));
  expect(result.current.data).toEqual({ id: 2 });
});
it("useToggle callback remains stable and toggles twice", () => {
  const { result } = renderHook(() => useToggle(false));
  const toggle = result.current[1];
  act(() => toggle());
  expect(result.current[0]).toBe(true);
  expect(result.current[1]).toBe(toggle);
  act(() => toggle());
  expect(result.current[0]).toBe(false);
});
it("debounce waits for the last edit and cleans timeout", () => {
  vi.useFakeTimers();
  const { result, rerender, unmount } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: "", delay: 500 } },
  );
  rerender({ value: "A", delay: 500 });
  act(() => vi.advanceTimersByTime(300));
  rerender({ value: "AB", delay: 500 });
  act(() => vi.advanceTimersByTime(499));
  expect(result.current).toBe("");
  act(() => vi.advanceTimersByTime(1));
  expect(result.current).toBe("AB");
  rerender({ value: "ABC", delay: 100 });
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
it("debounced search filters real route names", () => {
  vi.useFakeTimers();
  render(<DebounceDemo />);
  fireEvent.change(screen.getByLabelText("Поиск с задержкой 500 мс"), {
    target: { value: "наб" },
  });
  expect(screen.queryByText("Набережная")).toBe(null);
  act(() => vi.advanceTimersByTime(500));
  expect(screen.getByText("Набережная")).toBeTruthy();
});
it("custom window hook subscribes and removes listener", () => {
  const remove = vi.spyOn(window, "removeEventListener"),
    old = innerHeight;
  const { result, unmount } = renderHook(() => useWindowSize());
  window.innerHeight = 555;
  fireEvent(window, new Event("resize"));
  expect(result.current.height).toBe(555);
  unmount();
  expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  window.innerHeight = old;
});
