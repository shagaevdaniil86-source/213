import React from "react";
import { it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UserRegistrationForm from "./UserRegistrationForm.js";
import UserRegistrationFormWithValidation, {
  validateRegistration,
} from "./UserRegistrationFormWithValidation.js";
import ContactFormUncontrolled from "./ContactFormUncontrolled.js";
import { safeRegistration } from "./RegistrationFields.js";
const valid = {
  name: "Ия",
  email: "rider@example.com",
  password: "example123",
  confirmPassword: "example123",
  gender: "female",
  age: "18-25",
  bio: "Люблю велопрогулки",
  newsletter: false,
};
function fillRegistration() {
  for (const [label, value] of [
    ["Имя *", valid.name],
    ["Email *", valid.email],
    ["Пароль *", valid.password],
    ["Подтверждение пароля *", valid.confirmPassword],
    ["Возраст *", valid.age],
    ["О себе *", valid.bio],
  ])
    fireEvent.change(screen.getByLabelText(label, { exact: true }), {
      target: { value },
    });
  fireEvent.click(screen.getByLabelText("Женский"));
}
it("validation reports every mandatory field, excluding newsletter", () => {
  const errors = validateRegistration({
    ...valid,
    name: " ",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    age: "",
    bio: " ",
  });
  expect(Object.keys(errors).sort()).toEqual([
    "age",
    "bio",
    "confirmPassword",
    "email",
    "gender",
    "name",
    "password",
  ]);
});
it("validation accepts correct data without subscription", () =>
  expect(validateRegistration(valid)).toEqual({}));
it("validation rejects malformed email, short password and mismatched confirmation", () => {
  for (const email of ["bad", "a@", "@b.ru", "a b@c.ru"])
    expect(validateRegistration({ ...valid, email }).email).toBeTruthy();
  expect(
    validateRegistration({ ...valid, password: "1234567" }).password,
  ).toBeTruthy();
  expect(
    validateRegistration({ ...valid, confirmPassword: "different" })
      .confirmPassword,
  ).toBe("Пароли не совпадают.");
});
it("validation checks allowed age and gender rather than just nonempty strings", () => {
  expect(validateRegistration({ ...valid, age: "invalid" }).age).toBeTruthy();
  expect(
    validateRegistration({ ...valid, gender: "invalid" }).gender,
  ).toBeTruthy();
});
it("public output excludes both password fields", () => {
  const data = safeRegistration({ ...valid, name: " Ия ", bio: " текст " });
  expect(data).not.toHaveProperty("password");
  expect(data).not.toHaveProperty("confirmPassword");
  expect(data.name).toBe("Ия");
  expect(data.bio).toBe("текст");
});
it("basic form controls all fields and resets them", () => {
  render(<UserRegistrationForm />);
  fillRegistration();
  fireEvent.click(screen.getByLabelText("Подписка на рассылку"));
  expect(screen.getByLabelText("Имя *", { exact: true }).value).toBe("Ия");
  expect(screen.getByLabelText("Женский").checked).toBe(true);
  expect(screen.getByLabelText("Подписка на рассылку").checked).toBe(true);
  fireEvent.click(screen.getByText("Сбросить базовую форму"));
  expect(screen.getByLabelText("Имя *", { exact: true }).value).toBe("");
  expect(screen.getByLabelText("Возраст *", { exact: true }).value).toBe("");
  expect(screen.getByLabelText("Подписка на рассылку").checked).toBe(false);
});
it("basic form prevents navigation and never renders password", () => {
  render(<UserRegistrationForm />);
  fillRegistration();
  const form = screen.getByText("Отправить базовую форму").form;
  const event = new Event("submit", { bubbles: true, cancelable: true });
  fireEvent(form, event);
  expect(event.defaultPrevented).toBe(true);
  expect(screen.getByRole("status").textContent).toContain("Ия");
  expect(screen.getByRole("status").textContent).not.toContain(valid.password);
  expect(screen.getByLabelText("Пароль *", { exact: true }).value).toBe("");
});
it("validated form reports empty submission and focuses the first invalid input", () => {
  render(<UserRegistrationFormWithValidation />);
  fireEvent.click(screen.getByText("Зарегистрироваться"));
  expect(screen.getByRole("alert").textContent).toContain("7");
  expect(document.activeElement).toBe(
    screen.getByLabelText("Имя *", { exact: true }),
  );
  const input = screen.getByLabelText("Email *", { exact: true });
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(
    document.getElementById(input.getAttribute("aria-describedby")).textContent,
  ).toContain("email");
});
it("validated form accepts correct values, clears password and makes no request", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(<UserRegistrationFormWithValidation />);
  fillRegistration();
  fireEvent.click(screen.getByText("Зарегистрироваться"));
  expect(screen.queryByRole("alert")).toBe(null);
  expect(screen.getByRole("status").textContent).toContain(
    "Регистрация проверена",
  );
  expect(screen.getByRole("status").textContent).not.toContain(valid.password);
  expect(
    screen.getByLabelText("Подтверждение пароля *", { exact: true }).value,
  ).toBe("");
  expect(fetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});
it("changing password rechecks its confirmation after submission", () => {
  render(<UserRegistrationFormWithValidation />);
  fillRegistration();
  fireEvent.change(
    screen.getByLabelText("Подтверждение пароля *", { exact: true }),
    { target: { value: "mismatch" } },
  );
  fireEvent.click(screen.getByText("Зарегистрироваться"));
  expect(screen.getByText("Пароли не совпадают.")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Пароль *", { exact: true }), {
    target: { value: "mismatch" },
  });
  expect(screen.queryByText("Пароли не совпадают.")).toBe(null);
});
it("reset removes errors and result as well as controlled values", () => {
  render(<UserRegistrationFormWithValidation />);
  fireEvent.click(screen.getByText("Зарегистрироваться"));
  fireEvent.click(screen.getByText("Сбросить регистрацию"));
  expect(screen.queryByRole("alert")).toBe(null);
  expect(
    screen
      .getByLabelText("Email *", { exact: true })
      .getAttribute("aria-invalid"),
  ).toBe("false");
  fillRegistration();
  fireEvent.click(screen.getByText("Зарегистрироваться"));
  fireEvent.click(screen.getByText("Сбросить регистрацию"));
  expect(screen.queryByRole("status")).toBe(null);
});
it("whitespace in required name and bio is rejected", () => {
  expect(
    validateRegistration({ ...valid, name: "\t ", bio: "\n " }).name,
  ).toBeTruthy();
  expect(validateRegistration({ ...valid, bio: "\n " }).bio).toBeTruthy();
});
it("uncontrolled contact form validates fields and focuses first error", () => {
  render(<ContactFormUncontrolled />);
  fireEvent.click(screen.getByText("Отправить сообщение"));
  expect(screen.getByText("Укажите имя отправителя.")).toBeTruthy();
  expect(
    screen.getByText("Укажите корректный email отправителя."),
  ).toBeTruthy();
  expect(screen.getByText("Введите сообщение.")).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByLabelText("Имя отправителя"));
});
it("uncontrolled form reads DOM refs, outputs safe text and resets DOM", () => {
  render(<ContactFormUncontrolled />);
  fireEvent.change(screen.getByLabelText("Имя отправителя"), {
    target: { value: "Ия" },
  });
  fireEvent.change(screen.getByLabelText("Email отправителя"), {
    target: { value: "a@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Сообщение"), {
    target: { value: "<img src=x onerror=alert(1)>" },
  });
  fireEvent.click(screen.getByText("Отправить сообщение"));
  expect(screen.getByRole("status").textContent).toContain("<img");
  expect(screen.getByRole("status").querySelector("img")).toBe(null);
  expect(screen.getByLabelText("Имя отправителя").value).toBe("");
  fireEvent.click(screen.getByText("Очистить обратную связь"));
  expect(screen.queryByRole("status")).toBe(null);
});
it("registration instances have separate radio groups and unique IDs", () => {
  const { container } = render(
    <>
      <UserRegistrationForm />
      <UserRegistrationFormWithValidation />
    </>,
  );
  const ids = [...container.querySelectorAll("[id]")].map((el) => el.id);
  expect(new Set(ids).size).toBe(ids.length);
  const women = screen.getAllByLabelText("Женский");
  fireEvent.click(women[0]);
  fireEvent.click(women[1]);
  expect(women[0].checked).toBe(true);
  expect(women[1].checked).toBe(true);
});
