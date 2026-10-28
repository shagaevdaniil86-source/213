import { Link, useNavigate, useParams } from 'react-router-dom';
import { products, categories } from '../data/products.js';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(item => String(item.id) === id);

  if (!product) {
    return <section className="card detail"><h1>Товар не найден</h1><p>Товара с ID {id} не существует.</p>
      <button onClick={() => navigate('/products')}>Вернуться к товарам</button></section>;
  }

  return <section className="detail">
    <button className="secondary" onClick={() => navigate(-1)}>← Назад</button>
    <div className="card" style={{ marginTop: 20 }}>
      <h1>{product.name}</h1>
      <p className="price">{product.price.toLocaleString('ru-RU')} ₽</p>
      <p><strong>Описание:</strong> {product.description}</p>
      <p><strong>Категория:</strong> {categories[product.category]}</p>
      <p><strong>ID товара:</strong> {id}</p>
    </div>
    <div className="actions"><Link to="/products">← К списку товаров</Link></div>
  </section>;
}
