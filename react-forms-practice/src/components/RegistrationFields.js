import React from "react";
export const emptyRegistration = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
  newsletter: false,
  age: "",
  bio: "",
};
export const ageOptions = [
  ["under18", "До 18 лет"],
  ["18-25", "18–25 лет"],
  ["26-35", "26–35 лет"],
  ["36-50", "36–50 лет"],
  ["over50", "Старше 50 лет"],
];
export function validateRegistration(data) {
  const errors = {};
  if (!data.name.trim()) errors.name = "Укажите имя.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    errors.email = "Укажите корректный email.";
  if (data.password.length < 8) errors.password = "Минимум 8 символов.";
  if (!data.confirmPassword) errors.confirmPassword = "Подтвердите пароль.";
  else if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Пароли не совпадают.";
  if (!["male", "female"].includes(data.gender))
    errors.gender = "Выберите пол.";
  if (!ageOptions.some(([value]) => value === data.age))
    errors.age = "Выберите возраст.";
  if (!data.bio.trim()) errors.bio = "Расскажите о себе.";
  return errors;
}
export function safeRegistration(data) {
  const { password, confirmPassword, ...safe } = data;
  return {
    ...safe,
    name: safe.name.trim(),
    email: safe.email.trim(),
    bio: safe.bio.trim(),
  };
}
export default function RegistrationFields({
  prefix,
  data,
  onChange,
  errors = {},
}) {
  const error = (name) =>
    errors[name] ? (
      <span
        id={`${prefix}-${name}-error`}
        className="field-error"
        aria-live="polite"
      >
        {errors[name]}
      </span>
    ) : null;
  const accessibility = (name) => ({
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${prefix}-${name}-error` : undefined,
  });
  const field = (name, label, type = "text", attrs = {}) => (
    <React.Fragment key={name}>
      <label htmlFor={`${prefix}-${name}`}>{label} *</label>
      <input
        {...attrs}
        {...accessibility(name)}
        id={`${prefix}-${name}`}
        name={name}
        type={type}
        value={data[name]}
        onChange={onChange}
        required
      />
      {error(name)}
    </React.Fragment>
  );
  return (
    <>
      <fieldset>
        <legend>Учётные данные</legend>
        {field("name", "Имя", "text", { autoComplete: "name", maxLength: 80 })}
        {field("email", "Email", "email", { autoComplete: "email" })}
        {field("password", "Пароль", "password", {
          autoComplete: "new-password",
          minLength: 8,
        })}
        {field("confirmPassword", "Подтверждение пароля", "password", {
          autoComplete: "new-password",
        })}
      </fieldset>
      <fieldset {...accessibility("gender")}>
        <legend>Пол *</legend>
        <label>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={data.gender === "male"}
            onChange={onChange}
            required
          />{" "}
          Мужской
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={data.gender === "female"}
            onChange={onChange}
            required
          />{" "}
          Женский
        </label>
        {error("gender")}
      </fieldset>
      <label>
        <input
          name="newsletter"
          type="checkbox"
          checked={data.newsletter}
          onChange={onChange}
        />{" "}
        Подписка на рассылку
      </label>
      <label htmlFor={`${prefix}-age`}>Возраст *</label>
      <select
        {...accessibility("age")}
        id={`${prefix}-age`}
        name="age"
        value={data.age}
        onChange={onChange}
        required
      >
        <option value="">Выберите возраст</option>
        {ageOptions.map(([value, label]) => (
          <option value={value} key={value}>
            {label}
          </option>
        ))}
      </select>
      {error("age")}
      <label htmlFor={`${prefix}-bio`}>О себе *</label>
      <textarea
        {...accessibility("bio")}
        id={`${prefix}-bio`}
        name="bio"
        rows="4"
        maxLength={1000}
        required
        value={data.bio}
        onChange={onChange}
      />
      {error("bio")}
    </>
  );
}
