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

  await test("Клик: информация и pulse", () => {
    byId("basic-btn").click();
    assert(byId("basic-output").textContent.includes("click"));
    assert(byId("basic-btn").classList.contains("pulse"));
  });
  await test("Мышь: enter/leave", () => {
    const box = byId("color-box");
    box.dispatchEvent(new MouseEvent("mouseenter"));
    equal(box.style.backgroundColor, "rgb(231, 76, 60)");
    box.dispatchEvent(new MouseEvent("mouseleave"));
    equal(box.style.backgroundColor, "rgb(52, 152, 219)");
    box.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 10, clientY: 10 }),
    );
    assert(byId("mouse-output").textContent.includes("x="));
  });
  await test("Клавиатура: сочетания отменяются", () => {
    for (const options of [
      { code: "KeyS", key: "s", ctrlKey: true },
      { code: "KeyC", key: "c", altKey: true },
      { code: "KeyA", key: "A", shiftKey: true },
    ]) {
      const event = new KeyboardEvent("keydown", {
        ...options,
        cancelable: true,
      });
      byId("key-input").dispatchEvent(event);
      assert(event.defaultPrevented);
    }
    byId("key-input").dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    assert(byId("key-output").textContent.includes("сброшено"));
  });
  await test("Делегирование: новые элементы и вложенный target", () => {
    const a = addNewItem(),
      b = addNewItem();
    assert(a.dataset.id !== b.dataset.id);
    const span = document.createElement("span");
    a.querySelector(".select-item").append(span);
    span.click();
    assert(a.classList.contains("selected"));
    a.querySelector(".delete").click();
    assert(!a.isConnected);
    b.remove();
    updateSelection();
  });
  await test("Отмена ссылки и непустая форма", () => {
    const e = new MouseEvent("click", { bubbles: true, cancelable: true });
    byId("prevent-link").dispatchEvent(e);
    assert(e.defaultPrevented);
    const form = byId("prevent-form");
    form.message.value = "";
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    assert(byId("prevention-output").textContent.includes("Введите"));
    form.message.value = "<img>";
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    equal(byId("prevention-output").querySelectorAll("img").length, 0);
    form.reset();
  });
  await test("CustomEvent и повторная настройка слушателей", () => {
    triggerCustomEvent();
    assert(byId("custom-output").textContent.includes("Привет"));
    setupMultipleListeners();
    setupMultipleListeners();
    triggerCustomEvent();
    equal(byId("custom-output").querySelectorAll("p").length, 3);
  });
  await test("Секундомер: защита от двойного запуска и сброс", async () => {
    startTimer();
    const first = timerInterval;
    startTimer();
    equal(timerInterval, first);
    await wait(1050);
    assert(timerValue >= 1);
    stopTimer();
    equal(timerValue, 0);
    assert(timerInterval === undefined);
  });
  await test("Debounce и сохранение this", async () => {
    const values = [],
      obj = {
        n: 7,
        f: createDebounce(function (x) {
          values.push(this.n + x);
        }, 20),
      };
    obj.f(1);
    obj.f(2);
    await wait(45);
    equal(values, [9]);
    obj.f.cancel();
  });
  await test("Throttle ограничивает частоту", async () => {
    let calls = 0;
    const f = createThrottle(() => calls++, 20);
    f();
    f();
    f();
    equal(calls, 1);
    await wait(30);
    f();
    equal(calls, 2);
  });
  await test("loadstart/loadend моделируются вокруг load", () => {
    const img = loadImage(
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    );
    img.dispatchEvent(new Event("load"));
    assert(byId("loading-output").textContent.includes("завершена"));
  });

  await test("Клик по контейнеру item переключает выбор", () => {
    const item = addNewItem();
    item.click();
    assert(item.classList.contains("selected"));
    item.click();
    assert(!item.classList.contains("selected"));
    item.remove();
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
