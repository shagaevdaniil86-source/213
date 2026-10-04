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

  await test("URLSearchParams: Unicode, пробелы, нули", () => {
    const u = new URL(
      buildUrl("https://example.com/a", {
        q: "город & река",
        n: 0,
        skip: null,
      }),
    );
    equal(u.searchParams.get("q"), "город & река");
    equal(u.searchParams.get("n"), "0");
    assert(!u.searchParams.has("skip"));
  });
  const originalFetch = globalThis.fetch;
  try {
    let calls = 0,
      seen = [];
    globalThis.fetch = async (url, options = {}) => {
      calls++;
      seen.push([String(url), options]);
      return new Response(
        JSON.stringify({ id: 1, title: "<img>", body: "Текст", name: "Тест" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", "X-Demo": "yes" },
        },
      );
    };
    await test("GET преобразует JSON", async () =>
      equal((await fetchGetRequest()).id, 1));
    await test("POST, PUT, PATCH: методы и поля", async () => {
      await fetchPostRequest();
      await fetchPutRequest();
      await fetchPatchRequest();
      const rows = seen.slice(-3);
      equal(
        rows.map((r) => r[1].method),
        ["POST", "PUT", "PATCH"],
      );
      equal(Object.keys(JSON.parse(rows[2][1].body)), ["title"]);
      equal(rows[0][1].headers["Content-Type"], "application/json");
    });
    await test("DELETE проверяет статус", async () =>
      equal(await fetchDeleteRequest(), 200));
    await test("FormData: не задаёт Content-Type вручную", async () => {
      await fetchWithFormData();
      const options = seen.at(-1)[1];
      assert(options.body instanceof FormData);
      assert(options.headers === undefined);
    });
    await test("Безопасный вывод текста", () => {
      displayData("scenario-data", [
        { title: "<img src=x>", body: "<script>" },
      ]);
      equal(
        document.getElementById("scenario-data").querySelectorAll("img,script")
          .length,
        0,
      );
    });
    await test("Заголовки и параметры запроса", async () => {
      await fetchWithHeaders();
      assert(new Headers(seen.at(-1)[1].headers).has("Authorization"));
      await fetchWithParams();
      equal(new URL(seen.at(-1)[0]).searchParams.get("_limit"), "5");
    });
    await test("Кэш: объединение, TTL, копии и исключение POST", async () => {
      const start = calls,
        cached = createFetchCache(20);
      const [a, b] = await Promise.all([cached("cache"), cached("cache")]);
      equal(calls - start, 1);
      a.title = "изменено";
      equal(b.title, "<img>");
      await cached("cache");
      equal(calls - start, 1);
      await wait(30);
      await cached("cache");
      equal(calls - start, 2);
      await cached("cache", { method: "POST", body: "{}" });
      equal(calls - start, 3);
    });
    await test("Ошибки не кэшируются", async () => {
      const cached = createFetchCache();
      let attempts = 0;
      globalThis.fetch = async () => {
        if (++attempts === 1) throw new TypeError("network");
        return new Response('{"ok":true}');
      };
      await rejects(() => cached("bad"));
      equal(await cached("bad"), { ok: true });
      equal(attempts, 2);
    });
    await test("HTTP 404 отклоняется нашим checkedFetch", async () => {
      globalThis.fetch = async () => new Response("{}", { status: 404 });
      try {
        await checkedFetch("missing");
        throw new Error("не выброшено");
      } catch (error) {
        assert(error instanceof HttpError);
        equal(error.status, 404);
      }
    });
    await test("Retry: временный GET, но не 404 и не POST", async () => {
      let attempts = 0;
      globalThis.fetch = async () =>
        new Response("{}", { status: ++attempts === 1 ? 503 : 200 });
      await fetchWithRetry("retry", {}, 1);
      equal(attempts, 2);
      attempts = 0;
      globalThis.fetch = async () => {
        attempts++;
        return new Response("{}", { status: 404 });
      };
      await rejects(() => fetchWithRetry("missing", {}, 3));
      equal(attempts, 1);
      attempts = 0;
      globalThis.fetch = async () => {
        attempts++;
        return new Response("{}", { status: 503 });
      };
      await rejects(() => fetchWithRetry("post", { method: "POST" }, 3));
      equal(attempts, 1);
    });
    await test("Таймаут и ручная отмена различаются", async () => {
      globalThis.fetch = (url, { signal }) =>
        new Promise((resolve, reject) => {
          if (signal.aborted)
            return reject(new DOMException("Aborted", "AbortError"));
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        });
      try {
        await requestWithTimeout("slow", {}, 20);
        assert(false);
      } catch (error) {
        equal(error.name, "TimeoutError");
      }
      const controller = new AbortController();
      const pending = requestWithTimeout(
        "slow",
        { signal: controller.signal },
        1000,
      );
      controller.abort();
      try {
        await pending;
        assert(false);
      } catch (error) {
        equal(error.name, "AbortError");
      }
    });
    await test("Некорректный JSON даёт ошибку", async () => {
      globalThis.fetch = async () => new Response("not json");
      await rejects(() => jsonRequest("bad-json"));
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

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
