import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import { Button } from "../basic/BasicComponents.js";
import "./HooksComponents.css";
export function CounterWithHooks({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue);
  return (
    <div>
      <h3>Счётчик с хуками</h3>
      <output aria-label="Счёт с хуками">{count}</output>
      <div className="actions">
        <Button onClick={() => setCount((c) => c - 1)}>Уменьшить hooks</Button>
        <Button onClick={() => setCount((c) => c + 1)}>Увеличить hooks</Button>
      </div>
    </div>
  );
}
export function UserProfile({
  initialProfile = { name: "Участник", city: "Москва" },
}) {
  const [profile, setProfile] = useState(initialProfile),
    [saved, setSaved] = useState(null),
    id = useId();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (profile.name.trim())
          setSaved({ ...profile, name: profile.name.trim() });
      }}
    >
      <h3>Редактирование профиля</h3>
      <label htmlFor={`${id}-name`}>Имя профиля</label>
      <input
        id={`${id}-name`}
        value={profile.name}
        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
        required
        maxLength={60}
      />
      <label htmlFor={`${id}-city`}>Город профиля</label>
      <input
        id={`${id}-city`}
        value={profile.city}
        onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
        maxLength={80}
      />
      <Button type="submit">Сохранить профиль</Button>
      {saved && (
        <p role="status">
          Профиль сохранён локально в состоянии: {saved.name}, {saved.city}
        </p>
      )}
    </form>
  );
}
export function EffectDemo() {
  const [count, setCount] = useState(0),
    [seconds, setSeconds] = useState(0);
  // []: эффект при монтировании и очистка при размонтировании.
  useEffect(() => {
    const original = document.title;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      clearInterval(timer);
      document.title = original;
    };
  }, []);
  // [count]: синхронизируем внешнюю систему только при изменении count.
  useEffect(() => {
    document.title = `ВелоКруг — изменений: ${count}`;
  }, [count]);
  // Без массива: выполняется после каждого commit, без обновления state (не создаёт цикл).
  useEffect(() => {
    console.debug("EffectDemo: рендер завершён");
  });
  return (
    <div>
      <h3>Три варианта useEffect</h3>
      <p>
        Заголовок вкладки отражает счётчик. Интервал существует только пока
        компонент смонтирован.
      </p>
      <p>
        Изменений: {count}; секунд с монтирования: {seconds}
      </p>
      <Button onClick={() => setCount((c) => c + 1)}>
        Изменить зависимость эффекта
      </Button>
    </div>
  );
}
function readStored(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch {
    return fallback;
  }
}
export function useLocalStorage(key, initialValue) {
  const [entry, setEntry] = useState(() => ({
    key,
    value: readStored(key, initialValue),
  }));
  const value = entry.key === key ? entry.value : readStored(key, initialValue);
  useEffect(() => {
    if (entry.key !== key) {
      setEntry({ key, value: readStored(key, initialValue) });
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(entry.value));
    } catch {
      /* Недоступное хранилище не мешает работе состояния в памяти. */
    }
  }, [key, entry, initialValue]);
  useEffect(() => {
    const sync = (e) => {
      if (e.storageArea === localStorage && (e.key === key || e.key === null))
        setEntry({ key, value: readStored(key, initialValue) });
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key, initialValue]);
  const update = (next) =>
    setEntry((previous) => {
      const current =
        previous.key === key ? previous.value : readStored(key, initialValue);
      return { key, value: typeof next === "function" ? next(current) : next };
    });
  return [value, update];
}
export function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: true,
  });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState({ data: null, error: null, loading: true });
    (async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (active) setState({ data, error: null, loading: false });
      } catch (error) {
        if (active && !controller.signal.aborted)
          setState({ data: null, error: error.message, loading: false });
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [url]);
  return state;
}
export const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [stored, setTheme] = useLocalStorage("mdk07-theme", "light");
  const theme = stored === "dark" ? "dark" : "light";
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}
export function ThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("ThemeToggle должен находиться внутри ThemeProvider");
  return (
    <Button
      variant="secondary"
      aria-pressed={context.theme === "dark"}
      onClick={() => context.setTheme((t) => (t === "dark" ? "light" : "dark"))}
    >
      Тема: {context.theme === "dark" ? "тёмная" : "светлая"}
    </Button>
  );
}
function FetchDemo() {
  const [id, setId] = useState(1),
    { data, error, loading } = useFetch(
      `https://jsonplaceholder.typicode.com/users/${id}`,
    );
  return (
    <div>
      <h3>useFetch</h3>
      <Button onClick={() => setId((v) => (v === 1 ? 2 : 1))}>
        Сменить пользователя hooks
      </Button>
      {loading ? (
        <p role="status">Загрузка через useFetch…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <p>
          {data.name} · {data.email}
        </p>
      )}
    </div>
  );
}
function StorageDemo() {
  const [note, setNote] = useLocalStorage("mdk07-route-note", "");
  return (
    <div>
      <label htmlFor="route-note">Заметка о маршруте (localStorage)</label>
      <input
        id="route-note"
        value={typeof note === "string" ? note : ""}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button variant="secondary" onClick={() => setNote("")}>
        Очистить заметку
      </Button>
      <p>Заметка сохраняется между перезагрузками в этом браузере.</p>
    </div>
  );
}
export default function HooksComponents() {
  return (
    <section className="task-section">
      <h2>4. Hooks и Context</h2>
      <div id="hooks-output-1">
        <CounterWithHooks />
        <UserProfile />
        <EffectDemo />
      </div>
      <div id="hooks-output-2">
        <ThemeToggle />
        <StorageDemo />
        <FetchDemo />
      </div>
    </section>
  );
}
