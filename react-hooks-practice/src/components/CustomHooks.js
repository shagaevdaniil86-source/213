import React, { useCallback, useEffect, useRef, useState } from "react";
const readStored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};
export function useLocalStorage(key, initialValue) {
  const fallback = useRef(initialValue);
  const [entry, setEntry] = useState(() => ({
    key,
    value: readStored(key, initialValue),
  }));
  const value =
    entry.key === key ? entry.value : readStored(key, fallback.current);
  useEffect(() => {
    if (entry.key !== key) {
      setEntry({ key, value: readStored(key, fallback.current) });
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(entry.value));
    } catch {
      /* Состояние продолжает работать в памяти, если хранилище недоступно. */
    }
  }, [key, entry]);
  useEffect(() => {
    const sync = (event) => {
      try {
        if (
          event.storageArea === localStorage &&
          (event.key === key || event.key === null)
        )
          setEntry({ key, value: readStored(key, fallback.current) });
      } catch {
        /* Хранилище заблокировано. */
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);
  const update = useCallback(
    (next) =>
      setEntry((previous) => {
        const current =
          previous.key === key
            ? previous.value
            : readStored(key, fallback.current);
        return {
          key,
          value: typeof next === "function" ? next(current) : next,
        };
      }),
    [key],
  );
  return [value, update];
}
export function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState({ data: null, loading: true, error: null });
    (async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (active) setState({ data, loading: false, error: null });
      } catch (error) {
        if (active && !controller.signal.aborted)
          setState({
            data: null,
            loading: false,
            error: error.message || "Ошибка сети",
          });
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [url]);
  return state;
}
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(!!initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle];
}
export function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
export function useWindowSize() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  useEffect(() => {
    const resize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);
  return size;
}
export function LocalStorageDemo() {
  const [name, setName] = useLocalStorage("mdk07-pr16-name", "");
  return (
    <article className="demo" data-demo="storage">
      <h3>7.1. useLocalStorage</h3>
      <label htmlFor="stored-name">Имя в localStorage</label>
      <input
        id="stored-name"
        value={typeof name === "string" ? name : ""}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
      />
      <p>Текущее имя: {typeof name === "string" ? name : ""}</p>
      <button type="button" onClick={() => setName("")}>
        Очистить сохранённое имя
      </button>
    </article>
  );
}
export function FetchDemo() {
  const { data, loading, error } = useFetch(
    "https://jsonplaceholder.typicode.com/users",
  );
  return (
    <article className="demo" data-demo="fetch-hook">
      <h3>7.2. useFetch</h3>
      {loading ? (
        <p role="status">Загрузка пользователей…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : Array.isArray(data) ? (
        <ul>
          {data.slice(0, 3).map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      ) : (
        <p role="alert">API вернул неожиданный формат.</p>
      )}
    </article>
  );
}
export function ToggleDemo() {
  const [visible, toggle] = useToggle();
  return (
    <article className="demo" data-demo="toggle">
      <h3>7.3. useToggle</h3>
      <button
        type="button"
        aria-expanded={visible}
        aria-controls="toggle-content"
        onClick={toggle}
      >
        {visible ? "Скрыть" : "Показать"} совет
      </button>
      <p id="toggle-content" hidden={!visible}>
        Проверьте тормоза перед поездкой.
      </p>
    </article>
  );
}
const routes = ["Набережная", "Зелёное кольцо", "Старый город", "Парк у реки"];
export function DebounceDemo() {
  const [search, setSearch] = useState(""),
    debounced = useDebounce(search, 500);
  const results = debounced.trim()
    ? routes.filter((r) =>
        r.toLocaleLowerCase().includes(debounced.trim().toLocaleLowerCase()),
      )
    : [];
  return (
    <article className="demo" data-demo="debounce">
      <h3>7.4. useDebounce</h3>
      <label htmlFor="debounce-search">Поиск с задержкой 500 мс</label>
      <input
        id="debounce-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <p>Текущий поиск: {search}</p>
      <p role="status">Отложенный поиск: {debounced}</p>
      <ul>
        {results.map((result) => (
          <li key={result}>{result}</li>
        ))}
      </ul>
      {debounced.trim() && !results.length && <p>Маршруты не найдены.</p>}
    </article>
  );
}
export function WindowSizeDemo() {
  const { width, height } = useWindowSize();
  return (
    <article className="demo" data-demo="window-hook">
      <h3>7.5. useWindowSize</h3>
      <p>
        Ширина окна: {width}px; высота окна: {height}px
      </p>
    </article>
  );
}
export default function CustomHooks() {
  return (
    <section className="panel" id="custom-hooks">
      <h2>Кастомные хуки</h2>
      <LocalStorageDemo />
      <FetchDemo />
      <ToggleDemo />
      <DebounceDemo />
      <WindowSizeDemo />
    </section>
  );
}
