import React, { useEffect, useRef, useState } from "react";
export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <article className="demo" data-demo="counter">
      <h3>1.1. Счётчик useState</h3>
      <output aria-label="Значение счётчика">{count}</output>
      <div className="actions">
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          +1
        </button>
        <button type="button" onClick={() => setCount((c) => c - 1)}>
          -1
        </button>
        <button type="button" onClick={() => setCount(0)}>
          Сброс счётчика
        </button>
      </div>
    </article>
  );
}
export function UserForm() {
  const [user, setUser] = useState({ name: "", email: "", age: "" });
  const change = (e) => {
    const { name, value } = e.target;
    setUser((u) => ({ ...u, [name]: value }));
  };
  return (
    <article className="demo" data-demo="user-form">
      <h3>1.2. Объект в состоянии</h3>
      {[
        ["name", "Имя участника", "text"],
        ["email", "Email участника", "email"],
        ["age", "Возраст участника", "number"],
      ].map(([name, label, type]) => (
        <React.Fragment key={name}>
          <label htmlFor={`user-${name}`}>{label}</label>
          <input
            id={`user-${name}`}
            name={name}
            type={type}
            min={type === "number" ? 1 : undefined}
            max={type === "number" ? 120 : undefined}
            value={user[name]}
            onChange={change}
          />
        </React.Fragment>
      ))}
      <pre aria-label="Текущие значения">{JSON.stringify(user, null, 2)}</pre>
    </article>
  );
}
export function TodoList() {
  const [todos, setTodos] = useState([]),
    [input, setInput] = useState(""),
    [filter, setFilter] = useState("all");
  const nextId = useRef(1);
  function add(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    const todo = { id: nextId.current++, text, completed: false };
    setTodos((t) => [...t, todo]);
    setInput("");
  }
  const filtered = todos.filter((t) =>
    filter === "active"
      ? !t.completed
      : filter === "completed"
        ? t.completed
        : true,
  );
  return (
    <article className="demo" data-demo="todos">
      <h3>1.3. Задачи и фильтры</h3>
      <form onSubmit={add}>
        <label htmlFor="todo-input">Новая задача</label>
        <input
          id="todo-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={200}
        />
        <div className="actions">
          <button type="submit">Добавить задачу</button>
        </div>
      </form>
      <div className="actions">
        {[
          ["all", "Все"],
          ["active", "Активные"],
          ["completed", "Завершённые"],
        ].map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <ul aria-label="Задачи">
        {filtered.map((todo) => (
          <li key={todo.id} className="row">
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() =>
                  setTodos((t) =>
                    t.map((item) =>
                      item.id === todo.id
                        ? { ...item, completed: !item.completed }
                        : item,
                    ),
                  )
                }
              />
              <span className={todo.completed ? "done" : ""}>{todo.text}</span>
            </label>
            <button
              type="button"
              aria-label={`Удалить ${todo.text}`}
              onClick={() =>
                setTodos((t) => t.filter((item) => item.id !== todo.id))
              }
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
      {!filtered.length && <p>В этом фильтре задач нет.</p>}
    </article>
  );
}
export function Timer() {
  const [time, setTime] = useState(0),
    [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return (
    <article className="demo" data-demo="timer">
      <h3>2.1. Таймер useEffect</h3>
      <output aria-label="Время таймера">{time} сек.</output>
      <div className="actions">
        <button type="button" onClick={() => setRunning((v) => !v)}>
          {running ? "Пауза таймера" : "Старт таймера"}
        </button>
        <button
          type="button"
          onClick={() => {
            setTime(0);
            setRunning(false);
          }}
        >
          Сброс таймера
        </button>
      </div>
    </article>
  );
}
export function WindowSize() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  useEffect(() => {
    const resize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return (
    <article className="demo" data-demo="window">
      <h3>2.2. Размер окна через эффект</h3>
      <p aria-label="Размер окна">
        {size.width} × {size.height} px
      </p>
    </article>
  );
}
export function DataFetcher({
  url = "https://jsonplaceholder.typicode.com/users/1",
}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (active) setState({ data, loading: false, error: null });
      } catch (error) {
        if (active && !controller.signal.aborted)
          setState({ data: null, loading: false, error: error.message });
      }
    }
    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [url]);
  return (
    <article className="demo" data-demo="fetch-basic">
      <h3>2.3. Данные из эффекта</h3>
      {state.loading ? (
        <p role="status">Загрузка участника…</p>
      ) : state.error ? (
        <p role="alert">{state.error}</p>
      ) : (
        <div>
          <p>Имя: {state.data?.name}</p>
          <p>Email: {state.data?.email}</p>
          <p>Телефон: {state.data?.phone}</p>
        </div>
      )}
    </article>
  );
}
export default function BasicHooks() {
  return (
    <section className="panel" id="basic-hooks">
      <h2>Базовые хуки</h2>
      <Counter />
      <UserForm />
      <TodoList />
      <Timer />
      <WindowSize />
      <DataFetcher />
    </section>
  );
}
