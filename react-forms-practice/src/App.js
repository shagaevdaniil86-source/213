import React from "react";
import UserRegistrationForm from "./components/UserRegistrationForm.js";
import UserRegistrationFormWithValidation from "./components/UserRegistrationFormWithValidation.js";
import ContactFormUncontrolled from "./components/ContactFormUncontrolled.js";
import "./App.css";
export default function App() {
  return (
    <>
      <header>
        <p>МДК 07 · ПР17</p>
        <h1>ВелоКруг: формы React</h1>
        <p>Управляемые поля, валидация и useRef</p>
      </header>
      <main>
        <p>
          Учебные формы работают локально: данные не отправляются и не
          сохраняются. Для проверки используйте вымышленные сведения.
        </p>
        <UserRegistrationForm />
        <UserRegistrationFormWithValidation />
        <ContactFormUncontrolled />
      </main>
      <footer>ПР17 · Работа с формами</footer>
    </>
  );
}
