import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '', subject: 'general' });
  function handleChange(event) {
    const { name, value } = event.target;
    setFormData(previous => ({ ...previous, [name]: value }));
  }
  function handleSubmit(event) {
    event.preventDefault();
    // Демонстрационная форма: без отправки на сервер.
    console.log('Данные формы:', formData);
    navigate('/contact/success', { state: { message: 'Ваше сообщение успешно отправлено!', formData } });
  }

  return <section className="card form"><h1>Свяжитесь с нами</h1><p className="muted">Заполните форму для демонстрации программной навигации.</p>
    <form onSubmit={handleSubmit}>
      <label>Имя:<input type="text" name="name" value={formData.name} onChange={handleChange} required /></label>
      <label>Email:<input type="email" name="email" value={formData.email} onChange={handleChange} required /></label>
      <label>Тема:<select name="subject" value={formData.subject} onChange={handleChange}>
        <option value="general">Общий вопрос</option><option value="support">Техническая поддержка</option><option value="sales">Вопросы по продажам</option><option value="feedback">Обратная связь</option>
      </select></label>
      <label>Сообщение:<textarea rows="5" name="message" value={formData.message} onChange={handleChange} required /></label>
      <button type="submit">Отправить сообщение</button>
    </form>
  </section>;
}
