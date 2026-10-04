"use strict";
const byId = (id) => document.getElementById(id);
const show = (id, text) => (byId(id).textContent = text);
function pulse(element, className = "pulse") {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  setTimeout(() => element.classList.remove(className), 500);
}
function handleBasicClick(event) {
  show(
    "basic-output",
    `Тип: ${event.type}; x=${event.clientX}, y=${event.clientY}; target=${event.target.tagName}`,
  );
  pulse(event.currentTarget);
}
function handleMouseEvents(event) {
  if (event.type === "mouseenter")
    event.currentTarget.style.backgroundColor = "#e74c3c";
  if (event.type === "mouseleave")
    event.currentTarget.style.backgroundColor = "#3498db";
  if (event.type === "mousemove") {
    const rect = event.currentTarget.getBoundingClientRect();
    show(
      "mouse-output",
      `x=${Math.round(event.clientX - rect.left)}, y=${Math.round(event.clientY - rect.top)}`,
    );
  }
}
function setupBasicEvents() {
  byId("basic-btn").onclick = handleBasicClick;
  for (const type of ["mouseenter", "mouseleave", "mousemove"])
    byId("color-box").addEventListener(type, handleMouseEvents);
}
function handleKeyEvents(event) {
  const special =
    (event.ctrlKey && event.code === "KeyS") ||
    (event.altKey && event.code === "KeyC") ||
    (event.shiftKey && event.code === "KeyA");
  if (special) event.preventDefault();
  show(
    "key-output",
    `${special ? "Комбинация перехвачена. " : ""}key=${event.key}; code=${event.code}; ctrl=${event.ctrlKey}; alt=${event.altKey}; shift=${event.shiftKey}`,
  );
}
function setupKeyboardEvents() {
  byId("key-input").onkeydown = handleKeyEvents;
  byId("key-input").onkeyup = (e) =>
    show("key-output", `Клавиша отпущена: ${e.key}; состояние сброшено.`);
}
function updateSelection() {
  show(
    "delegation-output",
    "Выбраны: " +
      ([...byId("item-list").querySelectorAll(".selected")]
        .map((item) => item.dataset.id)
        .join(", ") || "нет"),
  );
}
function handleDelegationClick(event) {
  const item = event.target.closest(".item");
  if (!item || !byId("item-list").contains(item)) return;
  if (event.target.closest(".delete")) item.remove();
  else {
    item.classList.toggle("selected");
    item
      .querySelector(".select-item")
      .setAttribute(
        "aria-pressed",
        String(item.classList.contains("selected")),
      );
  }
  updateSelection();
}
let nextItemId = 0;
function addNewItem() {
  const item = document.createElement("div");
  item.className = "item";
  item.dataset.id = String(++nextItemId);
  const choose = document.createElement("button"),
    remove = document.createElement("button");
  choose.className = "select-item";
  choose.type = remove.type = "button";
  choose.setAttribute("aria-pressed", "false");
  choose.textContent = `Маршрут ${nextItemId}`;
  remove.className = "delete";
  remove.textContent = "Удалить";
  remove.setAttribute("aria-label", `Удалить маршрут ${nextItemId}`);
  item.append(choose, remove);
  byId("item-list").append(item);
  return item;
}
function setupDelegationEvents() {
  byId("item-list").onclick = handleDelegationClick;
  byId("add-item-btn").onclick = addNewItem;
  for (let i = 0; i < 3; i++) addNewItem();
}
function preventLinkDefault(event) {
  event.preventDefault();
  show("prevention-output", "Переход отменён через preventDefault.");
  pulse(event.currentTarget, "shake");
}
function preventFormSubmit(event) {
  event.preventDefault();
  const text = new FormData(event.currentTarget).get("message").trim();
  show(
    "prevention-output",
    text ? `Локальные данные формы: ${text}` : "Введите непустой текст.",
  );
}
function setupPreventionEvents() {
  byId("prevent-link").onclick = preventLinkDefault;
  byId("prevent-form").onsubmit = preventFormSubmit;
}
function triggerCustomEvent() {
  document.dispatchEvent(
    new CustomEvent("customAction", {
      detail: { message: "Привет от кастомного события!" },
    }),
  );
}
function handleCustomEvent(event) {
  show("custom-output", event.detail.message);
  pulse(byId("trigger-custom"));
}
let multipleInstalled = false;
function setupMultipleListeners() {
  if (multipleInstalled) return;
  multipleInstalled = true;
  for (let i = 1; i <= 3; i++)
    document.addEventListener("customAction", () => {
      const p = document.createElement("p");
      p.textContent = `Обработчик ${i}: событие получено`;
      byId("custom-output").append(p);
    });
}
function setupCustomEvents() {
  document.addEventListener("customAction", handleCustomEvent);
  byId("trigger-custom").onclick = triggerCustomEvent;
  byId("multiple-listeners").onclick = setupMultipleListeners;
}
function loadImage(url) {
  const image = new Image();
  image.alt = "Демонстрация загрузки изображения";
  image.width = 300;
  image.height = 200;
  // HTMLImageElement не испускает loadstart/loadend: отправляем их сами вокруг load/error.
  image.addEventListener("loadstart", () =>
    show("loading-output", "Загрузка началась."),
  );
  image.addEventListener("loadend", () => {
    byId("loading-output").textContent += " Загрузка завершена.";
  });
  image.addEventListener("load", () => {
    show("loading-output", "Изображение загружено.");
    image.dispatchEvent(new Event("loadend"));
  });
  image.addEventListener("error", () => {
    show("loading-output", "Ошибка загрузки изображения.");
    image.dispatchEvent(new Event("loadend"));
  });
  byId("image-container").replaceChildren(image);
  image.dispatchEvent(new Event("loadstart"));
  image.src = url;
  return image;
}
function loadImageWithEvents() {
  return loadImage("https://picsum.photos/300/200");
}
function simulateLoadError() {
  return loadImage("missing-image-for-error-test.png");
}
function setupLoadingEvents() {
  byId("load-image").onclick = loadImageWithEvents;
  byId("load-error").onclick = simulateLoadError;
}
let timerInterval,
  timerValue = 0;
function startTimer() {
  if (timerInterval !== undefined) return;
  timerInterval = setInterval(
    () => show("timer-output", `Таймер: ${++timerValue}`),
    1000,
  );
}
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = undefined;
  timerValue = 0;
  show("timer-output", "Таймер: 0");
}
function createDebounce(func, delay) {
  let timer;
  const result = function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
  result.cancel = () => clearTimeout(timer);
  return result;
}
function createThrottle(func, interval) {
  let last = -Infinity;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      return func.apply(this, args);
    }
  };
}
let ordinaryDebounce = 0,
  debouncedCount = 0,
  ordinaryThrottle = 0,
  throttledCount = 0;
function asyncStats() {
  show(
    "async-output",
    `Debounce: обычных ${ordinaryDebounce}, выполненных ${debouncedCount}. Throttle: обычных ${ordinaryThrottle}, выполненных ${throttledCount}.`,
  );
}
const delayed = createDebounce(() => {
    debouncedCount++;
    asyncStats();
  }, 600),
  limited = createThrottle(() => {
    throttledCount++;
    asyncStats();
  }, 600);
function testDebounce() {
  ordinaryDebounce++;
  delayed();
  asyncStats();
}
function testThrottle() {
  ordinaryThrottle++;
  limited();
  asyncStats();
}
function setupTimerEvents() {
  byId("start-timer").onclick = startTimer;
  byId("stop-timer").onclick = stopTimer;
  byId("debounce-btn").onclick = testDebounce;
  byId("throttle-btn").onclick = testThrottle;
}
function initializeEventHandlers() {
  setupBasicEvents();
  setupKeyboardEvents();
  setupDelegationEvents();
  setupPreventionEvents();
  setupCustomEvents();
  setupLoadingEvents();
  setupTimerEvents();
  window.addEventListener("pagehide", () => {
    stopTimer();
    delayed.cancel();
  });
}
document.addEventListener("DOMContentLoaded", initializeEventHandlers);
