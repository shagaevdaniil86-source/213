import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
  renderHook,
} from "@testing-library/react";
import {
  WelcomeMessage,
  UserCard,
  Button,
  Card,
  Toggle,
  ConditionalMessage,
} from "./basic/BasicComponents.js";
import {
  Counter,
  LoginForm,
  ColorPicker,
  TodoList,
  SearchBox,
} from "./stateful/StatefulComponents.js";
import {
  Timer,
  WindowSizeTracker,
  DataFetcher,
} from "./lifecycle/LifecycleComponents.js";
import {
  CounterWithHooks,
  UserProfile,
  EffectDemo,
  useLocalStorage,
  useFetch,
  ThemeProvider,
  ThemeToggle,
} from "./hooks/HooksComponents.js";
import ComponentTests from "./ComponentTests.js";
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const response = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});
describe("Props и children", () => {
  it("передаёт имя и возраст", () => {
    render(<WelcomeMessage name="Ия" age={18} />);
    expect(screen.getByText("Привет, Ия! Возраст: 18 лет.")).toBeTruthy();
  });
  it("меняет статус пользователя при изменении props", () => {
    const user = {
      name: "Ия",
      email: "a@example.com",
      avatar: "avatar.svg",
      isOnline: true,
    };
    const { rerender } = render(<UserCard user={user} />);
    expect(screen.getByAltText("Аватар Ия")).toBeTruthy();
    expect(screen.getByText("В сети")).toBeTruthy();
    rerender(<UserCard user={{ ...user, isOnline: false }} />);
    expect(screen.getByText("Не в сети")).toBeTruthy();
  });
  it("Button передаёт событие, вариант, размер, children", () => {
    const click = vi.fn();
    render(
      <Button variant="secondary" size="large" onClick={click}>
        Тест
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Тест" });
    fireEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
    expect(button.className).toContain("button--secondary");
    expect(button.className).toContain("button--large");
    expect(button.type).toBe("button");
  });
  it("Card вставляет произвольный children", () => {
    render(
      <Card title="Маршрут">
        <strong>Набережная</strong>
      </Card>,
    );
    expect(screen.getByRole("article", { name: "Маршрут" })).toBeTruthy();
    expect(screen.getByText("Набережная").tagName).toBe("STRONG");
  });
  it("Toggle показывает и скрывает содержимое", () => {
    render(
      <Toggle>
        <p>Снаряжение</p>
      </Toggle>,
    );
    const button = screen.getByRole("button");
    expect(screen.getByText("Снаряжение").parentElement.hidden).toBe(true);
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Снаряжение").parentElement.hidden).toBe(false);
    fireEvent.click(button);
    expect(screen.getByText("Снаряжение").parentElement.hidden).toBe(true);
  });
  it("статусы и неизвестное значение имеют сообщения", () => {
    const { rerender } = render(<ConditionalMessage status="error" />);
    expect(screen.getByRole("alert").textContent).toContain("Не удалось");
    rerender(<ConditionalMessage status="warning" />);
    expect(screen.getByRole("status").textContent).toContain("погоду");
    rerender(<ConditionalMessage status="success" />);
    expect(screen.getByText("Маршрут готов.")).toBeTruthy();
    rerender(<ConditionalMessage status="unknown" />);
    expect(screen.getByText("Ожидание действия.")).toBeTruthy();
  });
});
describe("Классы и формы", () => {
  it("Counter использует начальное состояние и последовательные обновления", () => {
    render(<Counter initialValue={2} />);
    fireEvent.click(screen.getByText("Увеличить класс"));
    fireEvent.click(screen.getByText("Увеличить класс"));
    fireEvent.click(screen.getByText("Уменьшить класс"));
    expect(screen.getByLabelText("Классовый счёт").textContent).toBe("3");
  });
  it("LoginForm проверяет пустые и некорректные данные", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText("Проверить вход"));
    expect(screen.getByText("Введите корректный email.")).toBeTruthy();
    expect(screen.getByText(/минимум 8/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Email для входа"), {
      target: { value: "bad" },
    });
    fireEvent.change(screen.getByLabelText("Пароль для входа"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByText("Проверить вход"));
    expect(
      screen.getByLabelText("Email для входа").getAttribute("aria-invalid"),
    ).toBe("true");
  });
  it("LoginForm принимает валидные значения и очищает пароль", () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email для входа"), {
      target: { value: "a@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Пароль для входа"), {
      target: { value: "sample123" },
    });
    fireEvent.click(screen.getByText("Проверить вход"));
    expect(screen.getByRole("status").textContent).toContain(
      "Валидация пройдена",
    );
    expect(screen.getByLabelText("Пароль для входа").value).toBe("");
    expect(localStorage.length).toBe(0);
  });
  it("ColorPicker выбирает переданные цвета", () => {
    render(<ColorPicker colors={["#000000", "#ffffff"]} />);
    fireEvent.click(screen.getByText("#ffffff"));
    expect(screen.getByRole("status").textContent).toContain("#ffffff");
    expect(screen.getByText("#ffffff").getAttribute("aria-pressed")).toBe(
      "true",
    );
  });
  it("TodoList: пустое значение, дубликаты, выполнение и удаление", () => {
    render(<TodoList />);
    const input = screen.getByLabelText("Новая задача"),
      button = screen.getByText("Добавить задачу");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(button);
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    for (let i = 0; i < 2; i++) {
      fireEvent.change(input, { target: { value: "Вода" } });
      fireEvent.click(button);
    }
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(screen.getAllByRole("checkbox")[0].checked).toBe(true);
    fireEvent.click(
      screen.getAllByRole("button", { name: "Удалить задачу Вода" })[0],
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(screen.getByRole("checkbox").checked).toBe(false);
  });
  it("SearchBox игнорирует регистр и очищает запрос", () => {
    render(<SearchBox items={["Набережная", "Парк"]} />);
    const input = screen.getByLabelText("Название маршрута");
    fireEvent.change(input, { target: { value: "НАБЕР" } });
    expect(screen.queryByText("Парк")).toBe(null);
    expect(screen.getByText("Набережная")).toBeTruthy();
    fireEvent.change(input, { target: { value: "нет совпадений" } });
    expect(screen.getByRole("status").textContent).toContain("Ничего");
    fireEvent.click(screen.getByText("Очистить поиск"));
    expect(input.value).toBe("");
    expect(screen.getByText("Парк")).toBeTruthy();
  });
});
describe("Жизненный цикл", () => {
  it("Timer: старт, защита от повторов, стоп, сброс", () => {
    vi.useFakeTimers();
    const { unmount } = render(<Timer />);
    fireEvent.click(screen.getByText("Старт таймера"));
    fireEvent.click(screen.getByText("Старт таймера"));
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(2100));
    expect(screen.getByLabelText("Секунды").textContent).toBe("2");
    fireEvent.click(screen.getByText("Стоп таймера"));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByLabelText("Секунды").textContent).toBe("2");
    fireEvent.click(screen.getByText("Сброс таймера"));
    expect(screen.getByLabelText("Секунды").textContent).toBe("0");
    fireEvent.click(screen.getByText("Старт таймера"));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("componentDidMount запускает autoStart", () => {
    vi.useFakeTimers();
    const { unmount } = render(<Timer autoStart />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("WindowSizeTracker реагирует на resize и удаляет слушатель", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const old = window.innerWidth;
    const { unmount } = render(<WindowSizeTracker />);
    window.innerWidth = 777;
    fireEvent(window, new Event("resize"));
    expect(screen.getByLabelText("Размер окна").textContent).toContain("777");
    unmount();
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
    window.innerWidth = old;
  });
  it("DataFetcher загружает данные при монтировании и изменении URL", async () => {
    const fetch = vi.fn(async (url) => response({ name: url }));
    vi.stubGlobal("fetch", fetch);
    const { rerender } = render(<DataFetcher url="first" />);
    await waitFor(() => expect(screen.getByText(/"first"/)).toBeTruthy());
    rerender(<DataFetcher url="second" />);
    await waitFor(() => expect(screen.getByText(/"second"/)).toBeTruthy());
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("DataFetcher сообщает HTTP ошибку", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response({}, 404)),
    );
    render(<DataFetcher url="missing" />);
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe("HTTP 404"),
    );
  });
  it("DataFetcher отменяет запрос и игнорирует устаревший ответ", async () => {
    let finish;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValue(response({ name: "новый" }));
    vi.stubGlobal("fetch", fetch);
    const { rerender, unmount } = render(<DataFetcher url="old" />);
    const signal = fetch.mock.calls[0][1].signal;
    rerender(<DataFetcher url="new" />);
    await waitFor(() => expect(screen.getByText(/новый/)).toBeTruthy());
    expect(signal.aborted).toBe(true);
    await act(async () => {
      finish(response({ name: "старый" }));
    });
    expect(screen.queryByText(/старый/)).toBe(null);
    const current = fetch.mock.calls[1][1].signal;
    unmount();
    expect(current.aborted).toBe(true);
  });
});
describe("Hooks и Context", () => {
  it("CounterWithHooks обновляет значение", () => {
    render(<CounterWithHooks initialValue={1} />);
    fireEvent.click(screen.getByText("Увеличить hooks"));
    fireEvent.click(screen.getByText("Уменьшить hooks"));
    expect(screen.getByLabelText("Счёт с хуками").textContent).toBe("1");
  });
  it("UserProfile сохраняет редактированные поля", () => {
    render(<UserProfile />);
    fireEvent.change(screen.getByLabelText("Имя профиля"), {
      target: { value: "Ия" },
    });
    fireEvent.change(screen.getByLabelText("Город профиля"), {
      target: { value: "Тула" },
    });
    fireEvent.click(screen.getByText("Сохранить профиль"));
    expect(screen.getByRole("status").textContent).toContain("Ия, Тула");
  });
  it("EffectDemo синхронизирует заголовок и очищает интервал", () => {
    vi.useFakeTimers();
    document.title = "Исходный";
    const { unmount } = render(<EffectDemo />);
    fireEvent.click(screen.getByText("Изменить зависимость эффекта"));
    expect(document.title).toContain("1");
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(document.title).toBe("Исходный");
  });
  it("useLocalStorage читает, пишет и поддерживает updater", () => {
    localStorage.setItem("note", "2");
    const { result } = renderHook(() => useLocalStorage("note", 0));
    expect(result.current[0]).toBe(2);
    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(3);
    expect(localStorage.getItem("note")).toBe("3");
  });
  it("useLocalStorage восстанавливается после неверного JSON и смены ключа", () => {
    localStorage.setItem("broken", "{");
    localStorage.setItem("other", "7");
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, 0),
      { initialProps: { key: "broken" } },
    );
    expect(result.current[0]).toBe(0);
    rerender({ key: "other" });
    expect(result.current[0]).toBe(7);
    expect(localStorage.getItem("other")).toBe("7");
  });
  it("useLocalStorage работает при недоступной записи", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { result } = renderHook(() => useLocalStorage("blocked", ""));
    act(() => result.current[1]("в памяти"));
    expect(result.current[0]).toBe("в памяти");
  });
  it("useLocalStorage синхронизирует событие другой вкладки", () => {
    const { result } = renderHook(() => useLocalStorage("note", ""));
    localStorage.setItem("note", '"другая вкладка"');
    act(() =>
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "note",
          storageArea: localStorage,
          newValue: '"другая вкладка"',
        }),
      ),
    );
    expect(result.current[0]).toBe("другая вкладка");
  });
  it("useFetch возвращает результат и отменяет запрос при unmount", async () => {
    const fetch = vi.fn(async () => response({ name: "Ия" }));
    vi.stubGlobal("fetch", fetch);
    const { result, unmount } = renderHook(() => useFetch("users"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.name).toBe("Ия");
    unmount();
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
  });
  it("useFetch обрабатывает ошибку сети", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Нет сети");
      }),
    );
    const { result } = renderHook(() => useFetch("missing"));
    await waitFor(() => expect(result.current.error).toBe("Нет сети"));
    expect(result.current.loading).toBe(false);
  });
  it("useFetch обрабатывает ошибку JSON и HTTP", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({}, 500))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError("Неверный JSON");
        },
      });
    vi.stubGlobal("fetch", fetch);
    const { result, rerender } = renderHook(({ url }) => useFetch(url), {
      initialProps: { url: "error" },
    });
    await waitFor(() => expect(result.current.error).toBe("HTTP 500"));
    rerender({ url: "json" });
    await waitFor(() => expect(result.current.error).toBe("Неверный JSON"));
  });
  it("ThemeToggle переключает context и сохраняет выбор", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByText("Тема: светлая"));
    expect(
      screen.getByText("Тема: тёмная").closest("[data-theme]").dataset.theme,
    ).toBe("dark");
    expect(localStorage.getItem("mdk07-theme")).toBe('"dark"');
  });
  it("useFetch отменяет прежний URL и не показывает устаревшие данные", async () => {
    let finish;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValue(response({ name: "актуальный" }));
    vi.stubGlobal("fetch", fetch);
    const { result, rerender } = renderHook(({ url }) => useFetch(url), {
      initialProps: { url: "old" },
    });
    const previousSignal = fetch.mock.calls[0][1].signal;
    rerender({ url: "new" });
    await waitFor(() => expect(result.current.data?.name).toBe("актуальный"));
    expect(previousSignal.aborted).toBe(true);
    await act(async () => {
      finish(response({ name: "устаревший" }));
    });
    expect(result.current.data.name).toBe("актуальный");
  });
  it("StrictMode не дублирует интервалы и очищает их", () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <React.StrictMode>
        <Timer autoStart />
        <EffectDemo />
      </React.StrictMode>,
    );
    expect(vi.getTimerCount()).toBe(2);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("ComponentTests показывает результат на странице", () => {
    render(
      <>
        <div id="basic-output-1">
          <p>demo</p>
        </div>
        <ComponentTests />
      </>,
    );
    fireEvent.click(screen.getByText("Запустить тесты компонентов"));
    expect(screen.getByRole("status").textContent).toContain("1/7");
  });
});
