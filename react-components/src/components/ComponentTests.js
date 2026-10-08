import React, { useState } from "react";
import { Button } from "./basic/BasicComponents.js";
export default function ComponentTests() {
  const [results, setResults] = useState([]);
  function runTests() {
    const checks = [
      ["Компоненты props", "#basic-output-1"],
      ["Композиция children", "#basic-output-2"],
      ["Классовые компоненты", "#stateful-output-1"],
      ["Динамические формы", "#stateful-output-2"],
      ["Жизненный цикл", "#lifecycle-output"],
      ["Hooks", "#hooks-output-1"],
      ["Context и кастомные hooks", "#hooks-output-2"],
    ];
    setResults(
      checks.map(([name, selector]) => ({
        name,
        passed: (document.querySelector(selector)?.children.length || 0) > 0,
      })),
    );
  }
  return (
    <section className="task-section">
      <h2>5. Проверка компонентов</h2>
      <Button onClick={runTests}>Запустить тесты компонентов</Button>
      <div role="status">
        {results.length > 0 && (
          <p>
            Проверка отображения: {results.filter((r) => r.passed).length}/
            {results.length}
          </p>
        )}
        {results.map((r) => (
          <p key={r.name}>
            {r.passed ? "✓" : "✗"} {r.name}
          </p>
        ))}
      </div>
      <p>
        Эта кнопка проверяет наличие демонстраций. Функциональные тесты событий,
        state, запросов и очистки ресурсов запускаются командой{" "}
        <code>npm test</code>.
      </p>
    </section>
  );
}
