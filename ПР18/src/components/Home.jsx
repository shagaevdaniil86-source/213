import { Link } from 'react-router-dom';
export default function Home() {
  return <section className="card">
    <h1>Добро пожаловать в наш магазин!</h1>
    <p className="muted">Это главная страница нашего приложения. Здесь можно перейти к товарам, узнать о компании и отправить сообщение.</p>
    <div className="actions"><Link className="btn" to="/products">Посмотреть товары</Link><Link className="btn secondary" to="/about">О нас</Link></div>
  </section>;
}
