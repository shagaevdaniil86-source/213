import React, { useId, useRef, useState } from "react";
export default function ContactFormUncontrolled() {
  const nameRef = useRef(null),
    emailRef = useRef(null),
    messageRef = useRef(null);
  const [errors, setErrors] = useState({}),
    [result, setResult] = useState(null),
    id = useId();
  function submit(event) {
    event.preventDefault();
    const data = {
        name: nameRef.current.value.trim(),
        email: emailRef.current.value.trim(),
        message: messageRef.current.value.trim(),
      },
      found = {};
    if (!data.name) found.name = "Укажите имя отправителя.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      found.email = "Укажите корректный email отправителя.";
    if (!data.message) found.message = "Введите сообщение.";
    setErrors(found);
    setResult(null);
    if (Object.keys(found).length) {
      ({ name: nameRef, email: emailRef, message: messageRef })[
        Object.keys(found)[0]
      ].current.focus();
      return;
    }
    setResult(data);
    event.currentTarget.reset();
  }
  const inputProps = (name) => ({
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });
  return (
    <section className="panel" aria-labelledby="contact-title">
      <h2 id="contact-title">3. Неуправляемая форма обратной связи</h2>
      <p>
        Значения полей хранятся в DOM и читаются через useRef только при
        отправке.
      </p>
      <form
        noValidate
        onSubmit={submit}
        onReset={() => {
          setErrors({});
        }}
      >
        <label htmlFor={`${id}-name`}>Имя отправителя</label>
        <input
          {...inputProps("name")}
          id={`${id}-name`}
          name="name"
          ref={nameRef}
          defaultValue=""
          autoComplete="name"
          required
          maxLength={80}
        />
        {errors.name && (
          <span
            id={`${id}-name-error`}
            className="field-error"
            aria-live="polite"
          >
            {errors.name}
          </span>
        )}
        <label htmlFor={`${id}-email`}>Email отправителя</label>
        <input
          {...inputProps("email")}
          id={`${id}-email`}
          name="email"
          type="email"
          ref={emailRef}
          defaultValue=""
          autoComplete="email"
          required
        />
        {errors.email && (
          <span
            id={`${id}-email-error`}
            className="field-error"
            aria-live="polite"
          >
            {errors.email}
          </span>
        )}
        <label htmlFor={`${id}-message`}>Сообщение</label>
        <textarea
          {...inputProps("message")}
          id={`${id}-message`}
          name="message"
          ref={messageRef}
          defaultValue=""
          required
          maxLength={2000}
          rows="4"
        />
        {errors.message && (
          <span
            id={`${id}-message-error`}
            className="field-error"
            aria-live="polite"
          >
            {errors.message}
          </span>
        )}
        <div className="actions">
          <button type="submit">Отправить сообщение</button>
          <button
            type="button"
            className="secondary"
            onClick={(e) => {
              e.currentTarget.form.reset();
              setResult(null);
            }}
          >
            Очистить обратную связь
          </button>
        </div>
      </form>
      {result && (
        <div role="status" className="success">
          <p>
            Сообщение обработано локально. Отправка на сервер не выполнялась.
          </p>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
