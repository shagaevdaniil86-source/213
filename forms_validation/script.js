const form = document.getElementById("registrationForm");
const fields = [...form.querySelectorAll("input[id]")];
const localDate = new Date();
localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
form.birthDate.max = localDate.toISOString().slice(0, 10);
function validateField(field) {
  let message = "";
  const value = field.value.trim();
  if (field.required && (field.type === "checkbox" ? !field.checked : !value))
    message = "Обязательное поле.";
  else if (["firstName", "lastName"].includes(field.id) && value.length < 2)
    message = "Введите минимум 2 символа.";
  else if (
    field.type === "email" &&
    value &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  )
    message = "Введите email в формате name@example.com.";
  else if (
    field.id === "phone" &&
    value &&
    !/^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/.test(value)
  )
    message = "Формат: +7 (999) 123-45-67.";
  else if (
    field.id === "password" &&
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(field.value)
  )
    message =
      "Минимум 8 символов, строчная и заглавная латинские буквы, цифра.";
  else if (
    field.id === "confirmPassword" &&
    field.value !== form.password.value
  )
    message = "Пароли не совпадают.";
  else if (!field.checkValidity())
    message = "Проверьте длину или диапазон значения.";
  field.classList.toggle("error", !!message);
  field.classList.toggle("valid", !message && !!value);
  field.setAttribute("aria-invalid", String(!!message));
  document.getElementById(field.id + "Error").textContent = message;
  return !message;
}
fields.forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    validateField(field);
    if (field.id === "password" && form.confirmPassword.value)
      validateField(form.confirmPassword);
  });
});
form.bio.addEventListener(
  "input",
  () =>
    (document.getElementById("charCount").textContent = form.bio.value.length),
);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const invalid = fields.filter((f) => !validateField(f));
  document.getElementById("result").textContent = invalid.length
    ? "Исправьте ошибки в форме."
    : "Все данные корректны. Учебная регистрация выполнена.";
  if (invalid.length) invalid[0].focus();
});
form.addEventListener("reset", () => {
  fields.forEach((f) => {
    f.classList.remove("error", "valid");
    f.removeAttribute("aria-invalid");
    document.getElementById(f.id + "Error").textContent = "";
  });
  document.getElementById("charCount").textContent = "0";
  document.getElementById("result").textContent = "";
});
