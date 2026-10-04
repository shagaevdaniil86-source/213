"use strict";
const API_BASE_URL = "https://jsonplaceholder.typicode.com";
function displayOutput(id, data, isError = false) {
  const output = document.getElementById(id);
  if (!output) return;
  output.textContent =
    data instanceof Error
      ? data.message
      : typeof data === "object"
        ? JSON.stringify(data, null, 2)
        : String(data);
  output.className = `output ${isError ? "error" : "success"}`;
}
function displayData(id, items) {
  const container = document.getElementById(id);
  container.replaceChildren();
  for (const item of items) {
    const card = document.createElement("article"),
      heading = document.createElement("h3"),
      p = document.createElement("p");
    card.className = "user-card";
    heading.textContent = item.name || item.title;
    p.textContent = [item.email, item.phone, item.body]
      .filter(Boolean)
      .join(" · ");
    card.append(heading, p);
    container.append(card);
  }
}
function updateProgress(percentage) {
  const value = Math.max(0, Math.min(100, percentage));
  const bar = document.getElementById("upload-progress");
  bar.value = value;
  document
    .getElementById("upload-progress")
    .setAttribute("aria-valuenow", String(value));
}
function setLoadingState(id, loading) {
  const button = document.getElementById(id);
  button.dataset.originalText ??= button.textContent;
  button.disabled = loading;
  button.textContent = loading ? "Загрузка…" : button.dataset.originalText;
  button.setAttribute("aria-busy", String(loading));
}
function bind(id, fn, output) {
  document.getElementById(id).onclick = async () => {
    setLoadingState(id, true);
    try {
      await fn();
    } catch (error) {
      displayOutput(output, error, true);
    } finally {
      setLoadingState(id, false);
    }
  };
}
async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}
function delayWithPromise(ms) {
  if (!Number.isFinite(ms) || ms < 0)
    return Promise.reject(
      new RangeError("Задержка должна быть неотрицательной"),
    );
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function createBasicPromise(shouldResolve = true) {
  return new Promise((resolve, reject) =>
    setTimeout(
      () => (shouldResolve ? resolve("Успех!") : reject(new Error("Ошибка!"))),
      1000,
    ),
  );
}
function handleBasicPromise() {
  return createBasicPromise(true)
    .then((result) => {
      displayOutput("promise-output", result);
      return result;
    })
    .catch((error) => displayOutput("promise-output", error, true));
}
function createPromiseChain() {
  const steps = [];
  let chain = Promise.resolve(0);
  for (let i = 1; i <= 3; i++)
    chain = chain.then((value) =>
      delayWithPromise(500).then(() => {
        steps.push(`${value} → ${value + 1}`);
        displayOutput("promise-output", steps);
        return value + 1;
      }),
    );
  return chain;
}
function handlePromiseError() {
  return createBasicPromise(false).catch((error) => {
    displayOutput("promise-output", error, true);
    return error.message;
  });
}
function setupPromiseEvents() {
  bind("basic-promise", handleBasicPromise, "promise-output");
  bind("promise-chain", createPromiseChain, "promise-output");
  bind("promise-error", handlePromiseError, "promise-output");
}
async function basicAsyncAwait() {
  const result = await createBasicPromise(true);
  await delayWithPromise(200);
  displayOutput("async-output", result);
  return result;
}
async function handleAsyncError() {
  try {
    await createBasicPromise(false);
  } catch (error) {
    displayOutput("async-output", error, true);
    return error.message;
  }
}
async function parallelAsyncExecution() {
  const start = performance.now();
  const results = await Promise.all(
    [300, 600, 900].map((ms, i) =>
      delayWithPromise(ms).then(() => `Операция ${i + 1}`),
    ),
  );
  displayOutput("async-output", {
    results,
    ms: Math.round(performance.now() - start),
  });
  return results;
}
function setupAsyncEvents() {
  bind("basic-async", basicAsyncAwait, "async-output");
  bind("async-error", handleAsyncError, "async-output");
  bind("async-parallel", parallelAsyncExecution, "async-output");
}
async function fetchUsers() {
  const users = await requestJson(`${API_BASE_URL}/users`);
  displayData("api-data", users);
  displayOutput("api-output", `Загружено пользователей: ${users.length}`);
  return users;
}
async function createPost() {
  const result = await requestJson(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Маршрут по набережной",
      body: "12 км в спокойном темпе",
      userId: 1,
    }),
  });
  displayOutput("api-output", result);
  return result;
}
async function testApiError() {
  try {
    await requestJson(`${API_BASE_URL}/missing`);
  } catch (error) {
    displayOutput(
      "api-output",
      error.status
        ? `HTTP ошибка ${error.status}`
        : `Сетевая ошибка: ${error.message}`,
      true,
    );
    return error;
  }
}
function setupApiEvents() {
  bind("fetch-users", fetchUsers, "api-output");
  bind("fetch-post", createPost, "api-output");
  bind("fetch-error", testApiError, "api-output");
}
let intervalId,
  intervalCount = 0,
  intervalBusy = false,
  intervalGeneration = 0;
async function startAsyncInterval() {
  if (intervalId !== undefined) return;
  const generation = ++intervalGeneration;
  intervalId = setInterval(async () => {
    if (intervalBusy) return;
    intervalBusy = true;
    try {
      await delayWithPromise(100);
      if (generation === intervalGeneration)
        displayOutput("interval-output", `Интервал: ${++intervalCount}`);
    } finally {
      intervalBusy = false;
    }
  }, 1000);
}
function stopAsyncInterval() {
  clearInterval(intervalId);
  intervalId = undefined;
  intervalGeneration++;
  intervalCount = 0;
  displayOutput("interval-output", "Интервал: 0");
}
async function testDelay() {
  for (let i = 1; i <= 3; i++) {
    await delayWithPromise(400);
    displayOutput("timer-output", `Завершено ${i}/3 задержек`);
  }
  return 3;
}
function setupTimerEvents() {
  bind("start-interval", startAsyncInterval, "interval-output");
  bind("stop-interval", stopAsyncInterval, "interval-output");
  bind("delay-promise", testDelay, "timer-output");
}
async function asyncTryCatch() {
  const messages = [];
  try {
    try {
      await Promise.reject(new TypeError("Неверный тип входных данных"));
    } catch (error) {
      if (error instanceof TypeError)
        messages.push(`Исправим входные данные: ${error.message}`);
      else throw error;
    }
    await Promise.reject(new Error("Сервис временно недоступен"));
  } catch (error) {
    messages.push(`Внешний обработчик: ${error.message}`);
  }
  displayOutput("error-output", messages);
  return messages;
}
async function handleMultipleErrors() {
  const results = await Promise.allSettled([
    Promise.resolve("Маршрут найден"),
    Promise.reject(new Error("Нет ответа")),
    Promise.resolve("Расписание получено"),
  ]);
  const stats = {
    fulfilled: results.filter((r) => r.status === "fulfilled").length,
    rejected: results.filter((r) => r.status === "rejected").length,
  };
  displayOutput("error-output", stats);
  return stats;
}
// maxRetries — число повторов после первоначальной попытки; паузы 100, 200, 400… мс.
async function retryWithBackoff(operation, maxRetries = 3) {
  if (!Number.isInteger(maxRetries) || maxRetries < 0)
    throw new RangeError("Повторы: неотрицательное целое число");
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation(attempt);
    } catch (error) {
      if (attempt >= maxRetries) throw error;
      await delayWithPromise(100 * 2 ** attempt);
    }
  }
}
function setupErrorEvents() {
  bind("try-catch", asyncTryCatch, "error-output");
  bind("multiple-errors", handleMultipleErrors, "error-output");
  bind(
    "retry-pattern",
    async () => {
      let attempts = 0;
      const result = await retryWithBackoff(() => {
        if (++attempts < 3) throw new Error("Временная ошибка");
        return "Успех после третьей попытки";
      });
      displayOutput("error-output", { attempts, result });
    },
    "error-output",
  );
}
async function demonstratePromiseAll() {
  const start = performance.now(),
    results = await Promise.all(
      [150, 300, 450, 600, 750].map((ms, i) =>
        delayWithPromise(ms).then(() => i + 1),
      ),
    );
  displayOutput("parallel-output", {
    results,
    ms: Math.round(performance.now() - start),
  });
  return results;
}
async function demonstratePromiseRace() {
  const first = await Promise.race(
    [150, 350, 550].map((ms) => delayWithPromise(ms).then(() => ms)),
  );
  displayOutput(
    "parallel-output",
    `Первый результат через ${first} мс. all ожидал бы 550 мс; race не отменяет остальные операции.`,
  );
  return first;
}
async function demonstratePromiseAllSettled() {
  const results = await Promise.allSettled([
    Promise.resolve(1),
    Promise.reject(new Error("Отказ")),
    delayWithPromise(100).then(() => 3),
  ]);
  displayOutput(
    "parallel-output",
    results.map((r) => ({
      status: r.status,
      value: r.status === "fulfilled" ? r.value : r.reason.message,
    })),
  );
  return results;
}
function setupParallelEvents() {
  bind("promise-all", demonstratePromiseAll, "parallel-output");
  bind("promise-race", demonstratePromiseRace, "parallel-output");
  bind("promise-allSettled", demonstratePromiseAllSettled, "parallel-output");
}
async function sequentialApiRequests() {
  const user = await requestJson(`${API_BASE_URL}/users/1`),
    posts = await requestJson(`${API_BASE_URL}/posts?userId=${user.id}`);
  if (!posts.length) throw new Error("У пользователя нет постов");
  const comments = await requestJson(
    `${API_BASE_URL}/comments?postId=${posts[0].id}`,
  );
  const result = { user, post: posts[0], comments };
  displayOutput("scenario-output", result);
  return result;
}
let uploadPromise;
function simulateFileUpload() {
  if (uploadPromise) return uploadPromise;
  updateProgress(0);
  uploadPromise = new Promise((resolve) => {
    let progress = 0;
    const timer = setInterval(() => {
      progress += 10;
      updateProgress(progress);
      displayOutput("scenario-output", `Локальная симуляция: ${progress}%`);
      if (progress === 100) {
        clearInterval(timer);
        resolve("Загрузка завершена");
      }
    }, 100);
  }).finally(() => {
    uploadPromise = undefined;
  });
  return uploadPromise;
}
// Кэширует также незавершённый Promise: одновременные запросы объединяются. Ошибки удаляются.
function createRequestCache() {
  const cache = new Map();
  return async function cachedRequest(url) {
    if (!cache.has(url)) {
      const pending = requestJson(url).catch((error) => {
        cache.delete(url);
        throw error;
      });
      cache.set(url, pending);
    }
    return structuredClone(await cache.get(url));
  };
}
const cachedRequest = createRequestCache();
function setupRealScenarioEvents() {
  bind("sequential-requests", sequentialApiRequests, "scenario-output");
  bind("upload-simulation", simulateFileUpload, "scenario-output");
  bind(
    "cache-requests",
    async () => {
      const url = `${API_BASE_URL}/users/1`,
        start = performance.now();
      await cachedRequest(url);
      const first = performance.now() - start,
        secondStart = performance.now();
      const user = await cachedRequest(url);
      displayOutput("scenario-output", {
        user,
        firstMs: Math.round(first),
        cachedMs: Math.round(performance.now() - secondStart),
      });
    },
    "scenario-output",
  );
}
function initializeAsyncOperations() {
  setupPromiseEvents();
  setupAsyncEvents();
  setupApiEvents();
  setupTimerEvents();
  setupErrorEvents();
  setupParallelEvents();
  setupRealScenarioEvents();
  window.addEventListener("pagehide", stopAsyncInterval);
}
document.addEventListener("DOMContentLoaded", initializeAsyncOperations);
