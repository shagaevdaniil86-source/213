# ПР17 Формы React

## Запуск

Нужен Node.js 22.12+ или Node.js 24 и npm. Выполните из папки `react-forms-practice`:

```bash
npm install
npm start
```

Откройте адрес Vite, указанный в терминале (обычно `http://127.0.0.1:5173/`). JSX собирается Vite; открывать исходный index.html двойным щелчком не следует.

```bash
npm test
npm run build
npm run preview
```

Альтернатива с зафиксированным lock-файлом: `pnpm install --frozen-lockfile`, затем `pnpm test` и `pnpm start`. Требуемые имена файлов `.js` сохранены; обработка JSX настроена в vite.config.js. node_modules и dist исключены из Git.

## Задания

- UserRegistrationForm.js — управляемая регистрация со всеми восемью полями и HTML-ограничениями.
- UserRegistrationFormWithValidation.js — проверка обязательных полей, email, пароля от 8 символов, подтверждения, пола и выбора возраста; подписка необязательна.
- ContactFormUncontrolled.js — обратная связь: имя, email, сообщение; значения читаются через useRef.
- RegistrationFields.js — общий набор полей и чистая функция валидации. Forms.test.js — тесты.

Формы работают локально, без сервера и localStorage. Пароли не выводятся и очищаются после успешной обработки. Это демонстрация состояния и проверки, а не создание реального аккаунта. Ошибки подписаны, связаны с полями, первая неверная запись получает фокус. Кнопки сброса очищают форму и результат.

Справка: [React input](https://react.dev/reference/react-dom/components/input).
