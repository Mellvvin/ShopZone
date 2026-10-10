import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import './CategoriesPage.css';

const CategoriesPage = () => {
  useEffect(() => { document.title = 'Categories — ShopZone'; }, []);

  return (
    <section className='cat-page'>
      <h1 className='cat-page__title'>Shop by category</h1>
      <div className='cat-page__grid'>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            to={`/?category=${encodeURIComponent(cat.value)}`}
            className='cat-page__tile'
          >
            <span className='cat-page__icon' aria-hidden='true'>{cat.icon}</span>
            <span className='cat-page__label'>{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesPage;