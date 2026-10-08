import React, { Component } from "react";
import { Button } from "../basic/BasicComponents.js";
import "./StatefulComponents.css";
export class Counter extends Component {
  state = { count: this.props.initialValue ?? 0 };
  render() {
    return (
      <div className="counter-demo">
        <h3>Классовый счётчик</h3>
        <output aria-label="Классовый счёт">{this.state.count}</output>
        <div className="actions">
          <Button
            onClick={() => this.setState((s) => ({ count: s.count - 1 }))}
          >
            Уменьшить класс
          </Button>
          <Button
            onClick={() => this.setState((s) => ({ count: s.count + 1 }))}
          >
            Увеличить класс
          </Button>
        </div>
      </div>
    );
  }
}
export class LoginForm extends Component {
  state = { email: "", password: "", errors: {}, success: false };
  submit = (event) => {
    event.preventDefault();
    const errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email.trim()))
      errors.email = "Введите корректный email.";
    if (this.state.password.length < 8)
      errors.password = "Пароль должен содержать минимум 8 символов.";
    this.setState({
      errors,
      success: !Object.keys(errors).length,
      password: Object.keys(errors).length ? this.state.password : "",
    });
  };
  render() {
    return (
      <form onSubmit={this.submit} noValidate>
        <h3>Учебная форма входа</h3>
        <p>Данные не отправляются, пароль не сохраняется.</p>
        <label htmlFor="login-email">Email для входа</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          value={this.state.email}
          onChange={(e) =>
            this.setState({ email: e.target.value, success: false })
          }
          aria-invalid={!!this.state.errors.email}
          aria-describedby="login-email-error"
        />
        <span id="login-email-error" className="error" aria-live="polite">
          {this.state.errors.email}
        </span>
        <label htmlFor="login-password">Пароль для входа</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={this.state.password}
          onChange={(e) =>
            this.setState({ password: e.target.value, success: false })
          }
          aria-invalid={!!this.state.errors.password}
          aria-describedby="login-password-error"
        />
        <span id="login-password-error" className="error" aria-live="polite">
          {this.state.errors.password}
        </span>
        <Button type="submit">Проверить вход</Button>
        {this.state.success && (
          <p role="status">Валидация пройдена. Учебный вход выполнен.</p>
        )}
      </form>
    );
  }
}
export class ColorPicker extends Component {
  state = { color: this.props.colors?.[0] || "#17685c" };
  render() {
    const colors = this.props.colors || ["#17685c", "#b65a18", "#573a78"];
    return (
      <div>
        <h3>Выбор цвета</h3>
        <div className="actions">
          {colors.map((color) => (
            <Button
              key={color}
              aria-pressed={color === this.state.color}
              onClick={() => this.setState({ color })}
            >
              {color}
            </Button>
          ))}
        </div>
        <div
          className="color-sample"
          style={{ backgroundColor: this.state.color }}
          aria-hidden="true"
        />
        <p role="status">Выбран цвет: {this.state.color}</p>
      </div>
    );
  }
}
export class TodoList extends Component {
  state = { text: "", items: [] };
  nextId = 1;
  add = (e) => {
    e.preventDefault();
    const text = this.state.text.trim();
    if (!text) return;
    const item = { id: this.nextId++, text, done: false };
    this.setState((s) => ({ items: [...s.items, item], text: "" }));
  };
  render() {
    return (
      <div>
        <h3>Подготовка к поездке</h3>
        <form onSubmit={this.add}>
          <label htmlFor="todo-input">Новая задача</label>
          <input
            id="todo-input"
            value={this.state.text}
            onChange={(e) => this.setState({ text: e.target.value })}
            maxLength={200}
          />
          <Button type="submit">Добавить задачу</Button>
        </form>
        <ul className="todo-list">
          {this.state.items.map((item) => (
            <li key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() =>
                    this.setState((s) => ({
                      items: s.items.map((x) =>
                        x.id === item.id ? { ...x, done: !x.done } : x,
                      ),
                    }))
                  }
                />
                <span className={item.done ? "done" : ""}>{item.text}</span>
              </label>
              <Button
                variant="secondary"
                onClick={() =>
                  this.setState((s) => ({
                    items: s.items.filter((x) => x.id !== item.id),
                  }))
                }
                aria-label={`Удалить задачу ${item.text}`}
              >
                Удалить
              </Button>
            </li>
          ))}
        </ul>
        {!this.state.items.length && <p>Задач пока нет.</p>}
      </div>
    );
  }
}
export class SearchBox extends Component {
  state = { query: "" };
  render() {
    const results = (this.props.items || []).filter((item) =>
      item
        .toLocaleLowerCase()
        .includes(this.state.query.trim().toLocaleLowerCase()),
    );
    return (
      <div>
        <h3>Поиск маршрутов</h3>
        <label htmlFor="route-search">Название маршрута</label>
        <input
          id="route-search"
          value={this.state.query}
          onChange={(e) => this.setState({ query: e.target.value })}
        />
        <Button
          variant="secondary"
          onClick={() => this.setState({ query: "" })}
        >
          Очистить поиск
        </Button>
        <ul>
          {results.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
        {!results.length && <p role="status">Ничего не найдено.</p>}
      </div>
    );
  }
}
export default class StatefulComponents extends Component {
  render() {
    return (
      <section className="task-section">
        <h2>2. Классы, state и формы</h2>
        <div id="stateful-output-1">
          <Counter />
          <LoginForm />
          <ColorPicker />
        </div>
        <div id="stateful-output-2">
          <TodoList />
          <SearchBox items={["Набережная", "Зелёное кольцо", "Старый город"]} />
        </div>
      </section>
    );
  }
}
