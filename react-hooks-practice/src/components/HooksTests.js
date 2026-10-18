import React, { useState } from "react";
export default function HooksTests() {
  const [results, setResults] = useState([]);
  function run() {
    setResults(
      ["basic-hooks", "advanced-hooks", "custom-hooks"].map((id) => ({
        id,
        count:
          document.getElementById(id)?.querySelectorAll("[data-demo]").length ||
          0,
      })),
    );
  }
  return (
    <section className="panel">
      <h2>Проверка демонстраций</h2>
      <button type="button" onClick={run}>
        Запустить проверки хуков
      </button>
      <div role="status">
        {results.map((r) => (
          <p key={r.id}>
            {r.count ? "✓" : "✗"} {r.id}: {r.count} демонстраций
          </p>
        ))}
      </div>
      <p>
        Автоматические тесты поведения: <code>npm test</code>. Кнопка проверяет
        отображение разделов. Проверьте вручную фокус, фильтры, таймеры и
        сохранение имени после перезагрузки.
      </p>
    </section>
  );
}
