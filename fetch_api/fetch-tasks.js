"use strict";
const API_BASE_URL = "https://jsonplaceholder.typicode.com";
class HttpError extends Error {
  constructor(response) {
    super(`HTTP ${response.status}: ${response.statusText}`);
    this.name = "HttpError";
    this.status = response.status;
  }
}
function displayOutput(id, data, isError = false) {
  const output = document.getElementById(id);
  if (!output) return;
  output.textContent =
    data instanceof Error
      ? `${data.name}: ${data.message}`
      : typeof data === "object"
        ? JSON.stringify(data, null, 2)
        : String(data);
  output.className = `output ${isError ? "error" : "success"}`;
}
function displayData(id, data) {
  const container = document.getElementById(id);
  container.replaceChildren();
  if (Array.isArray(data)) {
    for (const item of data) {
      const card = document.createElement("article"),
        h = document.createElement("h3"),
        p = document.createElement("p");
      card.className = item.name ? "user-card" : "post-card";
      h.textContent = item.name || item.title || "Без названия";
      p.textContent = [item.email, item.phone, item.body]
        .filter(Boolean)
        .join(" · ");
      card.append(h, p);
      container.append(card);
    }
  } else {
    const pre = document.createElement("pre");
    pre.textContent =
      typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
    container.append(pre);
  }
}
function setLoadingState(id, loading) {
  const button = document.getElementById(id);
  button.dataset.originalText ??= button.textContent;
  button.disabled = loading;
  button.textContent = loading ? "Загрузка…" : button.dataset.originalText;
  button.setAttribute("aria-busy", String(loading));
}
function buildUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params))
    if (value !== undefined && value !== null)
      url.searchParams.set(key, String(value));
  return url.toString();
}
async function measureExecutionTime(fn) {
  const start = performance.now(),
    result = await fn();
  return { result, executionTime: Math.round(performance.now() - start) };
}
async function checkedFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new HttpError(response);
  return response;
}
async function jsonRequest(url, options = {}) {
  return (await checkedFetch(url, options)).json();
}
function jsonOptions(method, data) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
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
async function fetchGetRequest() {
  const post = await jsonRequest(`${API_BASE_URL}/posts/1`);
  displayOutput("get-output", post);
  return post;
}
async function fetchJsonData() {
  const users = await jsonRequest(`${API_BASE_URL}/users`);
  displayData("get-data", users);
  return users;
}
async function fetchWithError() {
  try {
    await jsonRequest(`${API_BASE_URL}/missing`);
  } catch (error) {
    displayOutput(
      "get-output",
      error instanceof HttpError
        ? `Сервер ответил: ${error.message}. fetch не отклоняет Promise из-за HTTP статуса.`
        : `Ответ сервера не получен: ${error.message}`,
      true,
    );
    return error;
  }
}
function setupGetRequests() {
  bind("fetch-get", fetchGetRequest, "get-output");
  bind("fetch-json", fetchJsonData, "get-output");
  bind("fetch-error", fetchWithError, "get-output");
}
async function fetchPostRequest() {
  const post = await jsonRequest(
    `${API_BASE_URL}/posts`,
    jsonOptions("POST", {
      title: "Прогулка по городу",
      body: "Встреча у моста в 10:00",
      userId: 1,
    }),
  );
  displayOutput("crud-output", post);
  return post;
}
async function fetchPutRequest() {
  const post = await jsonRequest(
    `${API_BASE_URL}/posts/1`,
    jsonOptions("PUT", {
      id: 1,
      title: "Новый маршрут",
      body: "Полная замена полей записи",
      userId: 1,
    }),
  );
  displayOutput("crud-output", { method: "PUT — полная замена", post });
  return post;
}
async function fetchPatchRequest() {
  const post = await jsonRequest(
    `${API_BASE_URL}/posts/1`,
    jsonOptions("PATCH", { title: "Изменён только заголовок" }),
  );
  displayOutput("crud-output", { method: "PATCH — частичное изменение", post });
  return post;
}
async function fetchDeleteRequest() {
  const response = await checkedFetch(`${API_BASE_URL}/posts/1`, {
    method: "DELETE",
  });
  if (response.status !== 200)
    throw new Error(`Ожидался статус 200, получен ${response.status}`);
  displayOutput(
    "crud-output",
    `Удаление смоделировано API: HTTP ${response.status}.`,
  );
  return response.status;
}
function setupCrudRequests() {
  for (const [id, fn] of [
    ["fetch-post", fetchPostRequest],
    ["fetch-put", fetchPutRequest],
    ["fetch-patch", fetchPatchRequest],
    ["fetch-delete", fetchDeleteRequest],
  ])
    bind(id, fn, "crud-output");
}
async function fetchWithHeaders() {
  const headers = new Headers({
    "X-Custom-Header": "MDK07-demo",
    Authorization: "Bearer demo-token-not-a-secret",
  });
  const data = await jsonRequest(`${API_BASE_URL}/posts?_limit=1`, { headers });
  displayOutput("headers-output", {
    sentHeaders: Object.fromEntries(headers),
    data,
  });
  return data;
}
async function fetchWithAuth() {
  // JSONPlaceholder не проверяет авторизацию: демонстрируем заголовки и отдельную локальную проверку.
  const basic = `Basic ${btoa("demo:example")}`,
    bearer = "Bearer demo-token-not-a-secret";
  const results = await Promise.all(
    [basic, bearer].map((Authorization) =>
      jsonRequest(`${API_BASE_URL}/posts/1`, { headers: { Authorization } }),
    ),
  );
  const checkDemoToken = (token) => {
    if (token !== bearer)
      throw new Error("401: неверный учебный токен (локальная имитация)");
    return true;
  };
  let invalid;
  try {
    checkDemoToken("Bearer invalid");
  } catch (error) {
    invalid = error.message;
  }
  displayOutput("headers-output", {
    basic,
    bearer,
    requests: results.length,
    invalid,
    note: "JSONPlaceholder игнорирует Authorization. Это демонстрация, а не защищённый сервис.",
  });
  return results;
}
async function fetchWithParams() {
  const url = buildUrl(`${API_BASE_URL}/posts`, {
      _limit: 5,
      _sort: "id",
      _order: "desc",
    }),
    data = await jsonRequest(url);
  displayOutput("headers-output", { url, data });
  return data;
}
async function requestWithTimeout(url, options = {}, ms = 3000) {
  const controller = new AbortController();
  let timeout = false;
  const timer = setTimeout(() => {
    timeout = true;
    controller.abort();
  }, ms);
  const upstream = options.signal,
    onAbort = () => controller.abort();
  if (upstream?.aborted) controller.abort();
  else upstream?.addEventListener("abort", onAbort, { once: true });
  try {
    return await jsonRequest(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      const failure = new Error(
        timeout
          ? `Таймаут: превышено ${ms} мс`
          : "Запрос отменён пользователем",
      );
      failure.name = timeout ? "TimeoutError" : "AbortError";
      throw failure;
    }
    throw error;
  } finally {
    clearTimeout(timer);
    upstream?.removeEventListener("abort", onAbort);
  }
}
async function fetchWithTimeout() {
  const data = await requestWithTimeout(`${API_BASE_URL}/posts/1`);
  displayOutput("headers-output", {
    timeoutMs: 3000,
    data,
    note: "Быстрый ответ успел до таймаута. Ручная отмена демонстрируется отдельно.",
  });
  return data;
}
function setupHeadersAndParams() {
  for (const [id, fn] of [
    ["fetch-headers", fetchWithHeaders],
    ["fetch-auth", fetchWithAuth],
    ["fetch-params", fetchWithParams],
    ["fetch-timeout", fetchWithTimeout],
  ])
    bind(id, fn, "headers-output");
}
async function fetchAndCheckStatus() {
  const results = await Promise.all(
    ["posts/1", "missing"].map(async (path) => {
      try {
        const r = await checkedFetch(`${API_BASE_URL}/${path}`);
        return { path, status: r.status, ok: r.ok };
      } catch (error) {
        return { path, status: error.status, message: error.message };
      }
    }),
  );
  displayOutput("response-output", {
    results,
    handling:
      "404: ресурс не найден; 500–599: сбой сервера, возможен повтор GET.",
  });
  return results;
}
async function fetchAndReadHeaders() {
  const response = await checkedFetch(`${API_BASE_URL}/posts/1`),
    headers = Object.fromEntries(response.headers);
  const list = document.createElement("ul");
  list.className = "header-list";
  for (const [key, value] of Object.entries(headers)) {
    const li = document.createElement("li");
    li.textContent = `${key}: ${value}`;
    list.append(li);
  }
  document.getElementById("response-data").replaceChildren(list);
  displayOutput("response-output", {
    contentType: response.headers.get("Content-Type"),
    contentLength: response.headers.get("Content-Length"),
    date: response.headers.get("Date"),
    note: "Через CORS доступны только разрешённые сервером заголовки; null может означать отсутствие или скрытый заголовок.",
  });
  return headers;
}
let objectUrl;
async function fetchBlobData() {
  const blob = await (
    await checkedFetch("https://picsum.photos/200/300")
  ).blob();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(blob);
  const image = new Image();
  image.src = objectUrl;
  image.alt = "Изображение, полученное как Blob";
  image.width = 200;
  image.height = 300;
  document.getElementById("response-data").replaceChildren(image);
  displayOutput("response-output", { size: blob.size, type: blob.type });
  return blob;
}
async function fetchWithFormData() {
  const form = new FormData();
  form.append("title", "Учебный маршрут");
  form.append("body", "Данные FormData");
  form.append("userId", "1");
  const result = await jsonRequest(`${API_BASE_URL}/posts`, {
    method: "POST",
    body: form,
  });
  displayOutput("response-output", {
    result,
    note: "FormData отправляется как multipart/form-data, границу задаёт браузер. JSON требует явного Content-Type. Учебный API не сохраняет данные.",
  });
  return result;
}
function setupResponseHandling() {
  for (const [id, fn] of [
    ["fetch-status", fetchAndCheckStatus],
    ["fetch-headers-response", fetchAndReadHeaders],
    ["fetch-blob", fetchBlobData],
    ["fetch-formdata", fetchWithFormData],
  ])
    bind(id, fn, "response-output");
}
async function fetchNetworkError() {
  try {
    await checkedFetch("https://network-error-demo.invalid/");
  } catch (error) {
    displayOutput(
      "error-output",
      `Сетевая ошибка: ${error.message}. DNS/TLS/CORS не дали получить HTTP ответ.`,
      true,
    );
    return error;
  }
}
async function fetchHttpError() {
  try {
    await checkedFetch(`${API_BASE_URL}/not-found`);
  } catch (error) {
    displayOutput("error-output", `Получен HTTP ответ: ${error.message}`, true);
    return error;
  }
}
let activeController;
async function fetchWithAbort() {
  const controller = new AbortController();
  activeController = controller;
  const button = document.getElementById("cancel-request");
  button.disabled = false;
  try {
    const data = await requestWithTimeout(
      `${API_BASE_URL}/posts`,
      { signal: controller.signal },
      10000,
    );
    displayOutput(
      "error-output",
      `Ответ получен: ${data.length} записей. Можно отменить следующий запрос во время загрузки.`,
    );
    return data;
  } catch (error) {
    displayOutput("error-output", error, true);
    return error;
  } finally {
    if (activeController === controller) activeController = undefined;
    button.disabled = true;
  }
}
async function fetchWithRetry(url, options = {}, retries = 3) {
  if (!Number.isInteger(retries) || retries < 0)
    throw new RangeError("retries должен быть неотрицательным целым");
  const method = (options.method || "GET").toUpperCase();
  for (let attempt = 0; ; attempt++) {
    try {
      return await jsonRequest(url, options);
    } catch (error) {
      const retryable =
        (method === "GET" || method === "HEAD") &&
        (error instanceof TypeError ||
          error.status === 429 ||
          error.status >= 500);
      if (!retryable || attempt >= retries || options.signal?.aborted)
        throw error;
      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** attempt));
    }
  }
}
function setupErrorHandling() {
  bind("fetch-network-error", fetchNetworkError, "error-output");
  bind("fetch-http-error", fetchHttpError, "error-output");
  bind("fetch-abort", fetchWithAbort, "error-output");
  document.getElementById("cancel-request").onclick = () =>
    activeController?.abort();
  bind(
    "fetch-retry",
    async () =>
      displayOutput(
        "error-output",
        await fetchWithRetry(`${API_BASE_URL}/posts/1`),
      ),
    "error-output",
  );
}
async function fetchWithPromiseAll() {
  const measured = await measureExecutionTime(() =>
    Promise.all(
      ["users/1", "posts/1", "comments/1"].map((path) =>
        jsonRequest(`${API_BASE_URL}/${path}`),
      ),
    ),
  );
  displayOutput("parallel-output", measured);
  return measured.result;
}
async function fetchWithPromiseRace() {
  const controllers = [new AbortController(), new AbortController()];
  let timeoutId;
  try {
    const operations = [0, 200].map((delay, i) =>
      new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
        jsonRequest(`${API_BASE_URL}/posts/${i + 1}`, {
          signal: controllers[i].signal,
        }),
      ),
    );
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("race: таймаут 3000 мс")),
        3000,
      );
    });
    const result = await Promise.race([...operations, timeout]);
    displayOutput("parallel-output", {
      winner: result,
      note: "Первый ответ; остальные запросы отменены в finally.",
    });
    return result;
  } finally {
    clearTimeout(timeoutId);
    controllers.forEach((c) => c.abort());
  }
}
async function fetchSequentialRequests() {
  const user = await jsonRequest(`${API_BASE_URL}/users/1`),
    posts = await jsonRequest(
      buildUrl(`${API_BASE_URL}/posts`, { userId: user.id }),
    );
  if (!posts.length) throw new Error("Посты отсутствуют");
  const comments = await jsonRequest(
    buildUrl(`${API_BASE_URL}/comments`, { postId: posts[0].id }),
  );
  const result = { user, post: posts[0], comments };
  displayOutput("parallel-output", result);
  return result;
}
function setupParallelRequests() {
  bind("fetch-all", fetchWithPromiseAll, "parallel-output");
  bind("fetch-race", fetchWithPromiseRace, "parallel-output");
  bind("fetch-sequential", fetchSequentialRequests, "parallel-output");
}
async function fetchUserWithPosts() {
  const id = Number(document.getElementById("user-id").value);
  if (!Number.isInteger(id) || id < 1 || id > 10)
    throw new RangeError("ID пользователя: 1..10");
  const user = await jsonRequest(`${API_BASE_URL}/users/${id}`),
    posts = await jsonRequest(
      buildUrl(`${API_BASE_URL}/posts`, { userId: user.id }),
    );
  displayOutput("scenario-output", { user, postsCount: posts.length });
  displayData("scenario-data", posts);
  return { user, posts };
}
async function fetchWithSearch() {
  const keyword = document.getElementById("search-input").value.trim();
  if (!keyword) {
    displayData("scenario-data", []);
    displayOutput("scenario-output", "Введите ключевое слово.");
    return [];
  }
  const url = buildUrl(`${API_BASE_URL}/posts`, { q: keyword }),
    posts = await jsonRequest(url);
  const query = keyword.toLowerCase(),
    filtered = posts.filter((post) =>
      `${post.title} ${post.body}`.toLowerCase().includes(query),
    );
  displayData("scenario-data", filtered);
  displayOutput("scenario-output", {
    url,
    found: filtered.length,
    note: "Дополнительная локальная фильтрация гарантирует поиск при различиях поддержки q в API.",
  });
  return filtered;
}
function simulateFileUpload() {
  const data = new FormData();
  data.append(
    "file",
    new Blob(["Учебный маршрут: 12 км"], { type: "text/plain" }),
    "route.txt",
  );
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/posts`);
    xhr.timeout = 10000;
    const progress = document.getElementById("upload-progress");
    progress.value = 0;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        progress.value = (100 * event.loaded) / event.total;
        displayOutput(
          "scenario-output",
          `Отправлено: ${Math.round(progress.value)}%`,
        );
      }
    };
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300)
        return reject(new Error(`HTTP ${xhr.status}`));
      progress.value = 100;
      displayOutput(
        "scenario-output",
        "Учебный Blob отправлен. API моделирует результат, файл не сохраняется.",
      );
      resolve(xhr.responseText);
    };
    xhr.onerror = () => reject(new TypeError("Сетевая ошибка загрузки"));
    xhr.ontimeout = () => reject(new Error("Таймаут загрузки"));
    xhr.onabort = () => reject(new Error("Загрузка отменена"));
    xhr.send(data);
  });
}
function createFetchCache(ttl = 30000) {
  if (!Number.isFinite(ttl) || ttl < 0)
    throw new RangeError("TTL должен быть неотрицательным");
  const cache = new Map();
  return async function cachedFetch(url, options = {}) {
    if ((options.method || "GET").toUpperCase() !== "GET")
      return jsonRequest(url, options);
    const key = JSON.stringify([
      String(url),
      [...new Headers(options.headers)].sort(),
      options.credentials || "same-origin",
    ]);
    let entry = cache.get(key);
    if (!entry || (entry.expires !== null && entry.expires <= Date.now())) {
      entry = { expires: null, promise: null };
      entry.promise = jsonRequest(url, options)
        .then((data) => {
          entry.expires = Date.now() + ttl;
          return data;
        })
        .catch((error) => {
          if (cache.get(key) === entry) cache.delete(key);
          throw error;
        });
      cache.set(key, entry);
    }
    return structuredClone(await entry.promise);
  };
}
const cachedFetch = createFetchCache();
function setupRealScenarios() {
  bind("fetch-user-posts", fetchUserWithPosts, "scenario-output");
  bind("fetch-search", fetchWithSearch, "scenario-output");
  bind("fetch-upload", simulateFileUpload, "scenario-output");
  bind(
    "fetch-cache",
    async () => {
      const first = await measureExecutionTime(() =>
          cachedFetch(`${API_BASE_URL}/posts/1`),
        ),
        second = await measureExecutionTime(() =>
          cachedFetch(`${API_BASE_URL}/posts/1`),
        );
      displayOutput("scenario-output", {
        firstMs: first.executionTime,
        cachedMs: second.executionTime,
        ttlMs: 30000,
        result: second.result,
      });
    },
    "scenario-output",
  );
}
function initializeFetchAPI() {
  setupGetRequests();
  setupCrudRequests();
  setupHeadersAndParams();
  setupResponseHandling();
  setupErrorHandling();
  setupParallelRequests();
  setupRealScenarios();
  window.addEventListener("pagehide", () => {
    activeController?.abort();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });
}
document.addEventListener("DOMContentLoaded", initializeFetchAPI);
