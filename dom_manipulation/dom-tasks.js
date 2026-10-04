"use strict";
const byId = (id) => document.getElementById(id);
function createCard(title, content) {
  const card = document.createElement("div");
  card.className = "card";
  const heading = document.createElement("h4"),
    paragraph = document.createElement("p");
  heading.textContent = title;
  paragraph.textContent = content;
  card.append(heading, paragraph);
  byId("target1").append(card);
  return card;
}
function createList(items) {
  const list = document.createElement("ol"),
    fragment = document.createDocumentFragment();
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    fragment.append(li);
  }
  list.append(fragment);
  byId("target1").append(list);
  return list;
}
function countChildren() {
  return byId("parent-element").children.length;
}
function findSpecialChild() {
  return byId("parent-element").querySelector(".special")?.textContent ?? null;
}
function getParentBackground() {
  const child = document.querySelector(".child");
  return child ? getComputedStyle(child.parentElement).backgroundColor : null;
}
function setupStyleToggle() {
  byId("toggle-style").onclick = () =>
    byId("style-target").classList.toggle("active-style");
}
function changeHeaderColor() {
  const color = `hsl(${Math.floor(Math.random() * 360)} 40% 24%)`;
  document.querySelector("header").style.backgroundColor = color;
  return color;
}
function animateElement() {
  const target = byId("style-target");
  target.classList.remove("animated");
  void target.offsetWidth;
  target.classList.add("animated");
}
function setupClickCounter() {
  let count = 0;
  byId("click-btn").onclick = () =>
    (byId("click-counter").textContent = `Кликов: ${++count}`);
}
function setupInputDisplay() {
  byId("text-input").oninput = (event) =>
    (byId("input-display").textContent = event.target.value);
}
function setupKeyboardEvents() {
  for (const type of ["keydown", "keyup"])
    document.addEventListener(type, (event) =>
      console.log(type, event.key, event.code),
    );
}
function addListItem() {
  const input = byId("item-input"),
    text = input.value.trim();
  if (!text) return null;
  const item = document.createElement("li"),
    button = document.createElement("button"),
    span = document.createElement("span");
  item.className = "list-item";
  span.textContent = text;
  button.type = "button";
  button.className = "delete";
  button.textContent = "Удалить";
  button.setAttribute("aria-label", `Удалить: ${text}`);
  item.append(span, button);
  byId("dynamic-list").append(item);
  input.value = "";
  input.focus();
  return item;
}
function removeListItem(event) {
  const button = event.target.closest("button.delete");
  if (button && byId("dynamic-list").contains(button))
    button.closest("li").remove();
}
function clearList() {
  byId("dynamic-list").replaceChildren();
}
function setupListEvents() {
  byId("add-item").onclick = addListItem;
  byId("clear-list").onclick = clearList;
  byId("dynamic-list").onclick = removeListItem;
  byId("item-input").onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addListItem();
    }
  };
}
function validateForm(formData) {
  const data =
      formData instanceof FormData ? Object.fromEntries(formData) : formData,
    errors = {};
  if (typeof data.name !== "string" || data.name.trim().length < 2)
    errors.name = "Имя: минимум 2 символа.";
  if (
    typeof data.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  )
    errors.email = "Некорректный email.";
  const age = Number(data.age);
  if (
    String(data.age ?? "").trim() === "" ||
    !Number.isInteger(age) ||
    age < 1 ||
    age > 120
  )
    errors.age = "Возраст: целое число от 1 до 120.";
  return Object.keys(errors).length ? errors : null;
}
function displayFormErrors(errors) {
  const output = byId("form-output");
  output.replaceChildren();
  for (const [field, message] of Object.entries(errors)) {
    const p = document.createElement("p");
    p.className = "error-message";
    p.textContent = message;
    output.append(p);
    byId(`user-${field}`).setAttribute("aria-invalid", "true");
  }
}
function displayFormSuccess(data) {
  const output = byId("form-output");
  output.replaceChildren();
  const p = document.createElement("p");
  p.className = "success-message";
  p.textContent = `Участник: ${data.name.trim()}, ${data.age} лет. Email: ${data.email}`;
  output.append(p);
}
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget,
    data = Object.fromEntries(new FormData(form));
  for (const input of form.querySelectorAll("input"))
    input.removeAttribute("aria-invalid");
  const errors = validateForm(data);
  if (errors) {
    displayFormErrors(errors);
    byId(`user-${Object.keys(errors)[0]}`).focus();
  } else displayFormSuccess(data);
}
function setupForm() {
  byId("user-form").onsubmit = handleFormSubmit;
}
function initializeApp() {
  setupStyleToggle();
  setupClickCounter();
  setupInputDisplay();
  setupKeyboardEvents();
  setupListEvents();
  setupForm();
  byId("change-header").onclick = changeHeaderColor;
  byId("animate").onclick = animateElement;
  byId("inspect-dom").onclick = () =>
    (byId("dom-output").textContent =
      `Детей: ${countChildren()}; особый: ${findSpecialChild()}; фон: ${getParentBackground()}`);
  createCard("Городской маршрут", "12 километров вдоль набережной.");
  createList(["Проверить тормоза", "Взять воду", "Встретиться у моста"]);
}
document.addEventListener("DOMContentLoaded", initializeApp);
