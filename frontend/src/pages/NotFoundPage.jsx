import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NotFoundPage = () => {

  // ── Page title ─────────────────────────────────────────────
  useEffect(() => { document.title = 'Not Found — ShopZone'; }, []);

  return (
    <div
      className='text-center'
      style={{ padding: '5rem 0' }}
    >
      <h1
        style={{
          fontSize: '8rem',
          fontWeight: '800',
          color: 'var(--oxford-blue)',
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <h2
        style={{
          color: 'var(--tan-dark)',
          marginBottom: '1rem',
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '1.1rem',
          marginBottom: '2rem',
          maxWidth: '400px',
          margin: '0 auto 2rem',
        }}
      >
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to='/'
        className='btn btn-dark btn-lg'
        style={{ minWidth: '200px' }}
      >
        Back to Shop
      </Link>
    </div>
  );
};

export default NotFoundPage;