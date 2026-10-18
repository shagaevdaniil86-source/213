import React, { useId, useState } from "react";
import RegistrationFields, {
  emptyRegistration,
  safeRegistration,
} from "./RegistrationFields.js";
export default function UserRegistrationForm() {
  const [data, setData] = useState({ ...emptyRegistration }),
    [result, setResult] = useState(null);
  const prefix = useId();
  function handleChange(event) {
    const { name, type, checked, value } = event.target;
    setData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
    setResult(null);
  }
  function submit(event) {
    event.preventDefault();
    setResult(safeRegistration(data));
    setData((previous) => ({ ...previous, password: "", confirmPassword: "" }));
  }
  return (
    <section className="panel" aria-labelledby="basic-title">
      <h2 id="basic-title">1. Базовая управляемая форма</h2>
      <p>
        Все значения хранятся в React state. Здесь действуют стандартные
        HTML-ограничения; полная проверка совпадения паролей показана во второй
        форме.
      </p>
      <form
        onSubmit={submit}
        onReset={() => {
          setData({ ...emptyRegistration });
          setResult(null);
        }}
      >
        <RegistrationFields
          prefix={prefix}
          data={data}
          onChange={handleChange}
        />
        <div className="actions">
          <button type="submit">Отправить базовую форму</button>
          <button type="reset" className="secondary">
            Сбросить базовую форму
          </button>
        </div>
      </form>
      {result && (
        <div role="status" className="success">
          <p>Базовая форма обработана локально. Пароль очищен.</p>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
