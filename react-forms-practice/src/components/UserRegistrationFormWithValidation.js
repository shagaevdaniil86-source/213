import React, { useId, useState } from "react";
import RegistrationFields, {
  emptyRegistration,
  safeRegistration,
  validateRegistration,
} from "./RegistrationFields.js";
export { validateRegistration } from "./RegistrationFields.js";
export default function UserRegistrationFormWithValidation() {
  const [data, setData] = useState({ ...emptyRegistration }),
    [errors, setErrors] = useState({}),
    [submitted, setSubmitted] = useState(false),
    [result, setResult] = useState(null);
  const prefix = useId();
  function change(event) {
    const { name, type, checked, value } = event.target;
    const next = { ...data, [name]: type === "checkbox" ? checked : value };
    setData(next);
    setResult(null);
    if (submitted) setErrors(validateRegistration(next));
  }
  function submit(event) {
    event.preventDefault();
    const found = validateRegistration(data);
    setErrors(found);
    setSubmitted(true);
    setResult(null);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      event.currentTarget.elements.namedItem(first)?.focus?.();
      if (first === "gender")
        event.currentTarget.querySelector('[name="gender"]').focus();
      return;
    }
    setResult(safeRegistration(data));
    setData((previous) => ({ ...previous, password: "", confirmPassword: "" }));
    setErrors({});
    setSubmitted(false);
  }
  function reset() {
    setData({ ...emptyRegistration });
    setErrors({});
    setResult(null);
    setSubmitted(false);
  }
  return (
    <section className="panel" aria-labelledby="validation-title">
      <h2 id="validation-title">2. Регистрация с валидацией</h2>
      <p>
        Все поля обязательны, кроме рассылки. Сообщения связаны с полями; после
        первой отправки исправления проверяются сразу.
      </p>
      <form onSubmit={submit} onReset={reset} noValidate>
        <RegistrationFields
          prefix={prefix}
          data={data}
          onChange={change}
          errors={errors}
        />
        <div className="actions">
          <button type="submit">Зарегистрироваться</button>
          <button type="reset" className="secondary">
            Сбросить регистрацию
          </button>
        </div>
        {Object.keys(errors).length > 0 && (
          <p role="alert">Исправьте ошибки: {Object.keys(errors).length}.</p>
        )}
      </form>
      {result && (
        <div role="status" className="success">
          <p>
            Регистрация проверена. Данные остались в браузере, пароль очищен.
          </p>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
