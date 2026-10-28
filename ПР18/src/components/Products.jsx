import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products, categories } from '../data/products.js';

export default function Products() {
  const [filter, setFilter] = useState('all');
  const filteredProducts = filter === 'all' ? products : products.filter(product => product.category === filter);

  return <section>
    <h1>Наши товары</h1>
    <p className="muted">Выберите категорию и откройте подробную информацию о товаре.</p>
    <div className="filter"><label htmlFor="category" style={{ margin: 0 }}>Фильтр по категории:</label>
      <select id="category" value={filter} onChange={event => setFilter(event.target.value)}>
        <option value="all">Все</option>
        {Object.entries(categories).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
      </select>
    </div>
    <div className="grid">{filteredProducts.map(product => <article className="card product" key={product.id}>
      <h3>{product.name}</h3><span className="badge">{categories[product.category]}</span>
      <p className="price">{product.price.toLocaleString('ru-RU')} ₽</p>
      <Link to={`/products/${product.id}`}>Подробнее →</Link>
    </article>)}</div>
  </section>;
}
