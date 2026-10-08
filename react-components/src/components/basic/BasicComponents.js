import React, { useId, useState } from "react";
import "./BasicComponents.css";
export function WelcomeMessage({ name, age }) {
  return (
    <p>
      Привет, {name}! Возраст: {age} лет.
    </p>
  );
}
export function UserCard({ user }) {
  return (
    <article className="user-card">
      <img
        src={user.avatar}
        width="64"
        height="64"
        alt={`Аватар ${user.name}`}
      />
      <div>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <p>{user.isOnline ? "В сети" : "Не в сети"}</p>
      </div>
    </article>
  );
}
export function Button({
  variant = "primary",
  size = "medium",
  onClick,
  children,
  type = "button",
  ...rest
}) {
  return (
    <button
      {...rest}
      type={type}
      className={`button button--${variant} button--${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function Card({ title, children }) {
  const titleId = useId();
  return (
    <article className="card" aria-labelledby={titleId}>
      <h3 id={titleId}>{title}</h3>
      {children}
    </article>
  );
}
export function Toggle({ children, buttonText = "Показать/скрыть" }) {
  const [open, setOpen] = useState(false),
    id = useId();
  return (
    <div>
      <Button
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {buttonText}
      </Button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
export function ConditionalMessage({ status }) {
  const texts = {
    success: "Маршрут готов.",
    error: "Не удалось построить маршрут.",
    warning: "Проверьте погоду перед выездом.",
  };
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={`message message--${status}`}
    >
      {texts[status] || "Ожидание действия."}
    </p>
  );
}
export default function BasicComponents() {
  const [clicks, setClicks] = useState(0);
  return (
    <section className="task-section">
      <h2>1. Props и children</h2>
      <div id="basic-output-1">
        <WelcomeMessage name="Данил" age={20} />
        <UserCard
          user={{
            name: "Участник клуба",
            email: "rider@example.com",
            avatar: "./avatar.svg",
            isOnline: true,
          }}
        />
        <Button onClick={() => setClicks((c) => c + 1)}>Приветствие</Button>
        <p role="status">Приветствий: {clicks}</p>
      </div>
      <div id="basic-output-2">
        <Card title="Первый маршрут">
          <p>12 километров вдоль реки.</p>
        </Card>
        <Toggle>
          <p>Возьмите шлем и бутылку воды.</p>
        </Toggle>
        {["success", "warning", "error"].map((status) => (
          <ConditionalMessage key={status} status={status} />
        ))}
      </div>
    </section>
  );
}
