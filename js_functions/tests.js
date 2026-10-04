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

  await test("Rest и сумма", () => {
    equal(sum(), 0);
    equal(sum(1, 2, -3), 0);
  });
  await test("Деструктуризация и email по умолчанию", () => {
    equal(
      createUser({ name: "Данил", age: 20 }),
      "Пользователь: Данил, возраст: 20, email: не указан",
    );
  });
  await test("Замыкание: правильный и неверный пароль", () => {
    const read = secretMessage("key", "маршрут");
    equal(read("key"), "маршрут");
    equal(read("no"), "Доступ запрещен");
  });
  await test("Композиция справа налево и identity", () => {
    equal(
      compose(
        (x) => x * 2,
        (x) => x + 1,
      )(3),
      8,
    );
    equal(compose()(7), 7);
  });
  await test("myMap: индекс, массив и разреженность", () => {
    equal(
      myMap([1, 2], (v, i, a) => v + i + a.length),
      [3, 5],
    );
    const a = myMap([, 2], (v) => v * 2);
    equal(a.length, 2);
    assert(!(0 in a));
  });
  await test("myFilter и пустой массив", () => {
    equal(
      myFilter([1, 2, 3], (v) => v > 1),
      [2, 3],
    );
    equal(
      myFilter([], () => true),
      [],
    );
  });
  await test("myReduce: без начального, undefined, sparse", () => {
    equal(
      myReduce([1, 2, 3], (a, b) => a + b),
      6,
    );
    equal(
      myReduce([], () => 9, undefined),
      undefined,
    );
    equal(
      myReduce([, , 4], (a, b) => a + b),
      4,
    );
    throws(() => myReduce([], () => 0));
  });
  await test("Каррирование: по одному и группами", () => {
    const add = curry((a, b, c) => a + b + c);
    equal(add(1)(2)(3), 6);
    equal(add(1, 2)(3), 6);
    equal(curry(() => 42)(), 42);
  });
  await test("Мемоизация: this, типы и ссылки объектов", () => {
    let calls = 0;
    const f = memoize((x) => {
      calls++;
      return x;
    });
    f(1);
    f(1);
    f("1");
    const obj = {};
    f(obj);
    f(obj);
    equal(calls, 3);
    const g = memoize(function (x) {
      return this.n + x;
    });
    equal(g.call({ n: 1 }, 2), 3);
    equal(g.call({ n: 4 }, 2), 6);
  });
  await test("Debounce: последний аргумент, контекст и cancel", async () => {
    const values = [],
      obj = {
        tag: "ok",
        f: debounce(function (x) {
          values.push(this.tag + x);
        }, 20),
      };
    obj.f(1);
    obj.f(2);
    await wait(45);
    equal(values, ["ok2"]);
    obj.f(3);
    obj.f.cancel();
    await wait(30);
    equal(values, ["ok2"]);
  });
  await test("Throttle: leading/trailing и cancel", async () => {
    const values = [],
      f = throttle((x) => values.push(x), 30);
    f(1);
    f(2);
    f(3);
    await wait(60);
    equal(values, [1, 3]);
    f.cancel();
  });
  await test("Валидатор опций", () => {
    const v = createValidator({ minLength: 4 });
    assert(v("A12b"));
    assert(!v("abcd"));
    assert(
      createValidator({
        minLength: 2,
        requireNumbers: false,
        requireUppercase: false,
      })("ab"),
    );
  });
  await test("Рекурсия и генератор", () => {
    equal(recursiveFactorial(5), 120);
    equal([...range(2, 5)], [2, 3, 4]);
    throws(() => recursiveFactorial(-1));
  });

  await test("Методы массивов фиксируют длину и проверяют callback", () => {
    for (const method of [myMap, myFilter]) {
      const input = [1, 2];
      let calls = 0;
      method(input, (value) => {
        calls++;
        input.push(9);
        return value;
      });
      equal(calls, 2);
      throws(() => method([], null));
    }
    const input = [1, 2];
    equal(
      myReduce(
        input,
        (total, value) => {
          input.push(9);
          return total + value;
        },
        0,
      ),
      3,
    );
    throws(() => myReduce([1], null));
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
