import { Link } from 'react-router-dom';
export default function NotFound() {
  return <section className="card"><h1>404 — Страница не найдена</h1><p>Извините, запрашиваемая страница не существует.</p><Link className="btn" to="/">Вернуться на главную</Link></section>;
}
