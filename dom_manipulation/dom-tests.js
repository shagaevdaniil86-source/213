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

  const target = byId("target1"),
    saved = [...target.childNodes];
  await test("Карточка: текст не интерпретируется как HTML", () => {
    const card = createCard("<img>", "<script>");
    equal(card.querySelector("h4").textContent, "<img>");
    equal(card.querySelectorAll("img,script").length, 0);
    card.remove();
  });
  await test("Списки, порядок и пустой массив", () => {
    const list = createList(["а", "б"]);
    equal(
      [...list.children].map((e) => e.textContent),
      ["а", "б"],
    );
    list.remove();
    const empty = createList([]);
    equal(empty.children.length, 0);
    empty.remove();
  });
  await test("Навигация по DOM", () => {
    equal(countChildren(), 3);
    equal(findSpecialChild(), "Набережная");
    assert(getParentBackground().startsWith("rgb"));
  });
  await test("Переключение класса", () => {
    const initial = byId("style-target").className;
    byId("toggle-style").click();
    assert(byId("style-target").classList.contains("active-style"));
    byId("toggle-style").click();
    byId("style-target").className = initial;
  });
  await test("Цвет шапки и анимация", () => {
    const h = document.querySelector("header"),
      old = h.style.backgroundColor;
    changeHeaderColor();
    assert(h.style.backgroundColor);
    h.style.backgroundColor = old;
    animateElement();
    assert(byId("style-target").classList.contains("animated"));
    byId("style-target").classList.remove("animated");
  });
  await test("Счётчик и ввод", () => {
    setupClickCounter();
    byId("click-btn").click();
    byId("click-btn").click();
    equal(byId("click-counter").textContent, "Кликов: 2");
    const input = byId("text-input");
    input.value = "<b>текст</b>";
    input.dispatchEvent(new Event("input"));
    equal(byId("input-display").textContent, input.value);
    input.value = "";
    byId("input-display").textContent = "";
    setupClickCounter();
    byId("click-counter").textContent = "Кликов: 0";
  });
  await test("Добавление и делегированное удаление", () => {
    const input = byId("item-input");
    input.value = "  Тест  ";
    const item = addListItem();
    equal(item.querySelector("span").textContent, "Тест");
    item.querySelector("button").click();
    assert(!item.isConnected);
    input.value = "   ";
    equal(addListItem(), null);
  });
  await test("Очистка списка", () => {
    const list = byId("dynamic-list"),
      old = [...list.childNodes];
    list.append(document.createElement("li"));
    clearList();
    equal(list.children.length, 0);
    list.append(...old);
  });
  await test("Валидация: границы и неверные значения", () => {
    equal(validateForm({ name: "Ия", email: "a@b.ru", age: 1 }), null);
    equal(validateForm({ name: "Ия", email: "a@b.ru", age: 120 }), null);
    for (const age of ["", 0, 121, 2.5])
      assert(validateForm({ name: "Ия", email: "a@b.ru", age }).age);
    assert(validateForm({ name: " ", email: "bad", age: 10 }).name);
  });
  await test("Вывод ошибок и успеха безопасен", () => {
    displayFormErrors({ name: "ошибка" });
    assert(byId("form-output").querySelector(".error-message"));
    displayFormSuccess({ name: "<img>", email: "a@b.ru", age: 22 });
    equal(byId("form-output").querySelectorAll("img").length, 0);
    byId("form-output").replaceChildren();
    byId("user-name").removeAttribute("aria-invalid");
  });
  target.replaceChildren(...saved);

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
