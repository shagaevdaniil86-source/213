"use strict";

async function runAllTests() {
  const output = document.getElementById("testResults");
  output.replaceChildren();
  let passed = 0,
    failed = 0;
  const assert = (condition, message = "Условие не выполнено") => {
    if (!condition) throw new Error(message);
  };
  const equal = (actual, expected) =>
    assert(
      JSON.stringify(actual) === JSON.stringify(expected),
      `Ожидалось ${JSON.stringify(expected)}, получено ${JSON.stringify(actual)}`,
    );
  const throws = (fn) => {
    let caught = false;
    try {
      fn();
    } catch {
      caught = true;
    }
    assert(caught, "Ожидалась ошибка");
  };
  const rejects = async (fn) => {
    let caught = false;
    try {
      await fn();
    } catch {
      caught = true;
    }
    assert(caught, "Ожидался reject");
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  async function test(name, fn) {
    const p = document.createElement("p");
    try {
      await fn();
      passed++;
      p.className = "test-success";
      p.textContent = "✓ " + name;
    } catch (error) {
      failed++;
      p.className = "test-failure";
      p.textContent = "✗ " + name + ": " + error.message;
    }
    output.append(p);
  }

  await test("Промис: resolve и reject", async () => {
    equal(await createBasicPromise(), "Успех!");
    await rejects(() => createBasicPromise(false));
  });
  await test("Цепочка использует предыдущий результат", async () =>
    equal(await createPromiseChain(), 3));
  await test("Задержка: границы", async () => {
    await delayWithPromise(0);
    await rejects(() => delayWithPromise(-1));
  });
  await test("Параллельные результаты сохраняют порядок", async () =>
    equal(await parallelAsyncExecution(), [
      "Операция 1",
      "Операция 2",
      "Операция 3",
    ]));
  await test("Все результаты и статистика ошибок", async () => {
    equal(await handleMultipleErrors(), { fulfilled: 2, rejected: 1 });
    equal(
      (await demonstratePromiseAllSettled()).map((r) => r.status),
      ["fulfilled", "rejected", "fulfilled"],
    );
  });
  await test("Повторы: успех и исчерпание", async () => {
    let n = 0;
    equal(
      await retryWithBackoff(() => {
        if (++n < 2) throw new Error("retry");
        return 7;
      }, 1),
      7,
    );
    equal(n, 2);
    await rejects(() =>
      retryWithBackoff(() => Promise.reject(new Error("fail")), 0),
    );
  });
  await test("Вложенный try/catch", async () =>
    equal((await asyncTryCatch()).length, 2));
  const originalFetch = globalThis.fetch;
  try {
    let calls = 0;
    globalThis.fetch = async (url) => {
      calls++;
      const path = String(url);
      const data = path.includes("comments")
        ? [{ id: 1, body: "comment" }]
        : path.includes("posts?")
          ? [{ id: 2, title: "Пост" }]
          : path.endsWith("/users")
            ? [{ id: 1, name: "<img>", email: "a@b.ru", phone: "123" }]
            : { id: 1, name: "Тест" };
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };
    await test("Кэш объединяет запросы и защищает данные от изменения", async () => {
      const cached = createRequestCache();
      const [a, b] = await Promise.all([cached("test"), cached("test")]);
      equal(calls, 1);
      a.name = "изменено";
      equal(b.name, "Тест");
      equal((await cached("test")).name, "Тест");
    });
    await test("Пользователи: безопасные карточки", async () => {
      await fetchUsers();
      equal(
        document.getElementById("api-data").querySelectorAll("img").length,
        0,
      );
    });
    await test("Последовательные API зависимости", async () => {
      const result = await sequentialApiRequests();
      equal(result.post.id, 2);
      equal(result.comments.length, 1);
    });
    await test("HTTP ошибки не игнорируются", async () => {
      globalThis.fetch = async () => new Response("{}", { status: 404 });
      await rejects(() => requestJson("missing"));
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
  await test("Интервал: двойной запуск и остановка", async () => {
    await startAsyncInterval();
    const first = intervalId;
    await startAsyncInterval();
    equal(intervalId, first);
    stopAsyncInterval();
    equal(intervalCount, 0);
  });
  await test("Прогресс симуляции завершается на 100%", async () => {
    await simulateFileUpload();
    equal(
      document.getElementById("upload-progress").getAttribute("aria-valuenow"),
      "100",
    );
  });

  const summary = document.createElement("p");
  summary.id = "test-summary";
  summary.textContent = `Пройдено: ${passed}; ошибок: ${failed}`;
  output.prepend(summary);
  return { passed, failed };
}
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("run-tests");
  button.onclick = async () => {
    button.disabled = true;
    try {
      await runAllTests();
    } finally {
      button.disabled = false;
    }
  };
});
