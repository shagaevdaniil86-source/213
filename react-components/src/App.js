import React from "react";
import BasicComponents from "./components/basic/BasicComponents.js";
import StatefulComponents from "./components/stateful/StatefulComponents.js";
import LifecycleComponents from "./components/lifecycle/LifecycleComponents.js";
import HooksComponents, {
  ThemeProvider,
} from "./components/hooks/HooksComponents.js";
import ComponentTests from "./components/ComponentTests.js";
import "./App.css";
export default function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <header className="App-header">
          <p>МДК 07 · ПР15</p>
          <h1>ВелоКруг на React</h1>
          <p>Компоненты, состояние и жизненный цикл</p>
        </header>
        <main className="App-main">
          <BasicComponents />
          <StatefulComponents />
          <LifecycleComponents />
          <HooksComponents />
          <ComponentTests />
        </main>
        <footer>
          Учебный проект · JSONPlaceholder используется для чтения
          демонстрационных данных
        </footer>
      </div>
    </ThemeProvider>
  );
}
