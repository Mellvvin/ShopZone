import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row, Col, Image, ListGroup,
  Button, Spinner, Alert, Form
} from 'react-bootstrap';
import { listProductDetails } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';

const ProductPage = () => {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);

  const { product, loading, error } = useSelector(
    (state) => state.products.productDetails
  );

  useEffect(() => {
    dispatch(listProductDetails(id));
  }, [dispatch, id]);

  const handleQtyChange = (value) => {
    const parsed = parseInt(value);
    if (value === '' || isNaN(parsed)) {
      setQty('');
    } else {
      setQty(Math.max(1, parsed));
    }
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ id, qty: Number(qty) || 1 }));
    navigate('/cart');
  };

  return (
    <>
      <Link className='btn btn-light my-3' to='/'>
        Go Back
      </Link>

      {loading ? (
        <div className='text-center py-5'>
          <Spinner
            animation='border'
            style={{ color: 'var(--oxford-blue)' }}
          />
        </div>
      ) : error ? (
        <Alert variant='danger'>{error}</Alert>
      ) : (
        <Row>
          {/* ── LEFT — Product Image ── */}
          <Col md={6}>
            <Image
              src={product.image}
              alt={product.name}
              fluid
              className='rounded'
              style={{ maxHeight: '450px', objectFit: 'cover', width: '100%' }}
            />
          </Col>

          {/* ── MIDDLE — Product Info ── */}
          <Col md={3}>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h3 style={{ color: 'var(--oxford-blue)' }}>
                  {product.name}
                </h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <span className='product-card-stars'>
                  {'★'.repeat(Math.round(product.rating || 0))}
                  {'☆'.repeat(5 - Math.round(product.rating || 0))}
                </span>
                <span className='product-card-reviews'>
                  {' '}({product.numReviews} reviews)
                </span>
              </ListGroup.Item>
              <ListGroup.Item>
                <span className='product-card-price'>
                  ${product.price}
                </span>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Description:</strong>
                <p className='mt-2' style={{ color: 'var(--text-muted)' }}>
                  {product.description}
                </p>
              </ListGroup.Item>
            </ListGroup>
          </Col>

          {/* ── RIGHT — Add to Cart Box ── */}
          <Col md={3}>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <Row>
                  <Col>Price:</Col>
                  <Col>
                    <strong className='product-card-price'>
                      ${product.price}
                    </strong>
                  </Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Status:</Col>
                  <Col>
                    {product.countInStock > 0 ? (
                      <span style={{ color: 'green', fontWeight: '600' }}>
                        In Stock
                      </span>
                    ) : (
                      <span style={{ color: 'red', fontWeight: '600' }}>
                        Out of Stock
                      </span>
                    )}
                  </Col>
                </Row>
              </ListGroup.Item>

              {/* ── Quantity Controls ── */}
              {product.countInStock > 0 && (
                <ListGroup.Item>
                  <p className='mb-2' style={{ color: 'var(--oxford-blue)', fontWeight: '500' }}>
                    Quantity:
                  </p>
                  <Row className='align-items-center'>
                    <Col xs='auto'>
                      <Button
                        variant='light'
                        className='qty-btn'
                        onClick={() => handleQtyChange(Number(qty) - 1)}
                      >
                        −
                      </Button>
                    </Col>
                    <Col xs='auto'>
                      <Form.Control
                        type='number'
                        value={qty}
                        min={1}
                        onChange={(e) => handleQtyChange(e.target.value)}
                        className='qty-input'
                      />
                    </Col>
                    <Col xs='auto'>
                      <Button
                        variant='light'
                        className='qty-btn'
                        onClick={() => handleQtyChange(Number(qty) + 1)}
                      >
                        +
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              )}

              <ListGroup.Item>
                <Button
                  className='w-100'
                  type='button'
                  disabled={product.countInStock === 0}
                  onClick={addToCartHandler}
                >
                  Add To Cart
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      )}
    </>
  );
};

export default ProductPage;