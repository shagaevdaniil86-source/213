import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Home from './components/Home.jsx';
import About from './components/About.jsx';
import Products from './components/Products.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import Contact from './components/Contact.jsx';
import ContactSuccess from './components/ContactSuccess.jsx';
import NotFound from './components/NotFound.jsx';

const navItems = [
  { to: '/', label: 'Главная', end: true },
  { to: '/about', label: 'О нас' },
  { to: '/products', label: 'Товары' },
  { to: '/contact', label: 'Контакты' }
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <NavLink className="brand" to="/">Мой магазин</NavLink>
            <nav aria-label="Основная навигация">
              {navItems.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{label}</NavLink>
              ))}
            </nav>
          </div>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/contact/success" element={<ContactSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="footer">Практическая работа №18 · React Router</footer>
      </div>
    </BrowserRouter>
  );
}
