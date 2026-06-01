// frontend/src/pages/NotFoundPage/NotFoundPage.jsx
// ─────────────────────────────────────────────────────────────
// 404 page — all inline styles removed.
// ─────────────────────────────────────────────────────────────
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './NotFoundPage.css';

const NotFoundPage = () => {
  useEffect(() => { document.title = 'Not Found — ShopZone'; }, []);

  return (
    <div className='nfp-wrapper'>
      <p className='nfp-code'>404</p>
      <h2 className='nfp-title'>Page Not Found</h2>
      <p className='nfp-message'>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to='/' className='btn btn-dark btn-lg nfp-btn'>
        Back to Shop
      </Link>
    </div>
  );
};

export default NotFoundPage;