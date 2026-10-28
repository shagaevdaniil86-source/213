import { Link, useLocation } from 'react-router-dom';
const subjects = { general: 'Общий вопрос', support: 'Техническая поддержка', sales: 'Вопросы по продажам', feedback: 'Обратная связь' };

export default function ContactSuccess() {
  const { state } = useLocation();
  const { message, formData } = state || {};
  return <section className="card success"><h1>Успех!</h1>
    {message ? <div><p><strong>{message}</strong></p>
      {formData && <div><h2>Отправленные данные:</h2>
        <p><strong>Имя:</strong> {formData.name}</p><p><strong>Email:</strong> {formData.email}</p>
        <p><strong>Тема:</strong> {subjects[formData.subject] || formData.subject}</p>
        <p><strong>Сообщение:</strong> {formData.message}</p>
      </div>}</div> : <p>Нет данных для отображения. Заполните контактную форму.</p>}
    <div className="actions"><Link className="btn" to="/contact">Отправить ещё одно сообщение</Link><Link className="btn secondary" to="/">На главную</Link></div>
  </section>;
}
