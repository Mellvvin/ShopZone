import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Card
      className='my-3 p-3 rounded product-card'
      onClick={() => navigate(`/product/${product._id}`)}
      style={{ cursor: 'pointer' }}
    >
      <Card.Img
        src={product.image}
        variant='top'
        className='product-card-img'
      />
      <Card.Body>
        <Card.Title as='div'>
          <strong className='product-card-title'>
            {product.name}
          </strong>
        </Card.Title>
        <Card.Text as='div'>
          <div className='my-2'>
            <span className='product-card-stars'>
              {'★'.repeat(Math.round(product.rating))}
              {'☆'.repeat(5 - Math.round(product.rating))}
            </span>
            <span className='product-card-reviews'>
              {' '}({product.numReviews} reviews)
            </span>
          </div>
        </Card.Text>
        <Card.Text as='h5' className='product-card-price'>
          ${product.price}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;