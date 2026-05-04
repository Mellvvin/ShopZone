import { Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Card
      className='my-3 rounded product-card'
      onClick={() => navigate(`/product/${product._id}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* ── Image ── */}
      <Card.Img
  src={product.image}
  variant='top'
  className='product-card-img'
/>

      <Card.Body style={{ padding: '1rem' }}>
        {/* Name */}
        <Card.Title
          as='div'
          style={{
            fontSize:     '0.95rem',
            fontWeight:   '600',
            color:        'var(--oxford-blue)',
            marginBottom: '0.4rem',
            lineHeight:   '1.3',
            display:      '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow:     'hidden',
          }}
        >
          {product.name}
        </Card.Title>

        {/* Star Rating */}
        <div style={{ marginBottom: '0.5rem' }}>
          <span className='product-card-stars' style={{ fontSize: '0.85rem' }}>
            {'★'.repeat(Math.round(product.rating))}
            {'☆'.repeat(5 - Math.round(product.rating))}
          </span>
          <span className='product-card-reviews' style={{ fontSize: '0.78rem' }}>
            {' '}({product.numReviews})
          </span>
        </div>

        {/* Price */}
        <div className='d-flex align-items-center justify-content-between'>
          <span
            className='product-card-price'
            style={{ fontSize: '1.1rem' }}
          >
            ${product.price}
          </span>
          <span style={{
            fontSize:        '0.75rem',
            color:           'var(--text-muted)',
            backgroundColor: '#F5F0EB',
            padding:         '2px 8px',
            borderRadius:    '10px',
            border:          '1px solid #EAE0D5',
          }}>
            {product.unit || 'Per Unit'}
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;