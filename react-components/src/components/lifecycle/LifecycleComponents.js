import React, { Component } from "react";
import { Button } from "../basic/BasicComponents.js";
import "./LifecycleComponents.css";
export class Timer extends Component {
  state = { seconds: 0, running: false };
  interval = null;
  componentDidMount() {
    if (this.props.autoStart) this.start();
  }
  componentWillUnmount() {
    clearInterval(this.interval);
    this.interval = null;
  }
  start = () => {
    if (this.interval !== null) return;
    this.setState({ running: true });
    this.interval = setInterval(
      () => this.setState((s) => ({ seconds: s.seconds + 1 })),
      1000,
    );
  };
  stop = () => {
    clearInterval(this.interval);
    this.interval = null;
    this.setState({ running: false });
  };
  reset = () => {
    this.stop();
    this.setState({ seconds: 0 });
  };
  render() {
    return (
      <div>
        <h3>Секундомер</h3>
        <output aria-label="Секунды">{this.state.seconds}</output>
        <div className="actions">
          <Button disabled={this.state.running} onClick={this.start}>
            Старт таймера
          </Button>
          <Button disabled={!this.state.running} onClick={this.stop}>
            Стоп таймера
          </Button>
          <Button variant="secondary" onClick={this.reset}>
            Сброс таймера
          </Button>
        </div>
      </div>
    );
  }
}
export class WindowSizeTracker extends Component {
  state = { width: window.innerWidth, height: window.innerHeight };
  update = () =>
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  componentDidMount() {
    window.addEventListener("resize", this.update);
    this.update();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.update);
  }
  render() {
    return (
      <p aria-label="Размер окна">
        Размер окна: {this.state.width} × {this.state.height} px
      </p>
    );
  }
}
export class DataFetcher extends Component {
  state = { loading: true, data: null, error: null };
  controller = null;
  generation = 0;
  componentDidMount() {
    this.load();
  }
  componentDidUpdate(prev) {
    if (prev.url !== this.props.url) this.load();
  }
  componentWillUnmount() {
    this.generation++;
    this.controller?.abort();
  }
  async load() {
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    const generation = ++this.generation;
    this.setState({ loading: true, data: null, error: null });
    try {
      const response = await fetch(this.props.url, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (generation === this.generation && !controller.signal.aborted)
        this.setState({ data, loading: false });
    } catch (error) {
      if (generation === this.generation && !controller.signal.aborted)
        this.setState({ error: error.message, loading: false });
    }
  }
  render() {
    return (
      <div aria-busy={this.state.loading}>
        <h3>Данные API — классовый компонент</h3>
        {this.state.loading ? (
          <p role="status">Загрузка классового компонента…</p>
        ) : this.state.error ? (
          <p role="alert">{this.state.error}</p>
        ) : (
          <pre>{JSON.stringify(this.state.data, null, 2)}</pre>
        )}
      </div>
    );
  }
}
export default class LifecycleComponents extends Component {
  state = { resource: "users/1", mounted: true };
  render() {
    return (
      <section className="task-section">
        <h2>3. Жизненный цикл</h2>
        <div id="lifecycle-output">
          {this.state.mounted && (
            <>
              <Timer />
              <WindowSizeTracker />
              <DataFetcher
                url={`https://jsonplaceholder.typicode.com/${this.state.resource}`}
              />
            </>
          )}
          <div className="actions">
            <Button
              onClick={() =>
                this.setState((s) => ({
                  resource: s.resource === "users/1" ? "users/2" : "users/1",
                }))
              }
            >
              Сменить пользователя API
            </Button>
            <Button
              variant="secondary"
              onClick={() => this.setState((s) => ({ mounted: !s.mounted }))}
            >
              {this.state.mounted ? "Размонтировать" : "Монтировать"}{" "}
              демонстрации
            </Button>
          </div>
          <p>
            Размонтирование удаляет слушатель resize, останавливает таймер и
            отменяет запрос.
          </p>
        </div>
      </section>
    );
  }
}
