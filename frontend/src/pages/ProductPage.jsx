import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row, Col, Image, ListGroup,
  Button, Spinner, Alert, Form, Card
} from 'react-bootstrap';
import { listProductDetails, createProductReview, resetProductReview } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';

const StarRating = ({ rating, setRating }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className='d-flex gap-1' style={{ fontSize: '2rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            cursor: 'pointer',
            color: star <= (hovered || rating)
              ? 'var(--tan-dark)'
              : '#CCCCCC',
            transition: 'color 0.15s ease',
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
      {rating > 0 && (
        <span style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          alignSelf: 'center',
          marginLeft: '0.5rem',
        }}>
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
        </span>
      )}
    </div>
  );
};

const ProductPage = () => {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty]         = useState(1);
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');

  const { product, loading, error } = useSelector(
    (state) => state.products.productDetails
  );
  const { userInfo } = useSelector((state) => state.auth);
  const {
    loading: reviewLoading,
    error:   reviewError,
    success: reviewSuccess,
  } = useSelector((state) => state.products.productReview);

  useEffect(() => {
    if (reviewSuccess) {
      setRating(0);
      setComment('');
      dispatch(resetProductReview());
    }
    dispatch(listProductDetails(id));
  }, [dispatch, id, reviewSuccess]);

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

  const submitReviewHandler = (e) => {
    e.preventDefault();
    dispatch(createProductReview({
      id,
      rating: Number(rating),
      comment,
    }));
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
        <>
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

          {/* ── REVIEWS SECTION ── */}
         {/* ── REVIEWS SECTION ── */}
<Row className='mt-5'>
  <Col md={6}>
    <h3
      style={{ color: 'var(--oxford-blue)' }}
      className='page-title mb-4'
    >
      Customer Reviews
    </h3>

    {/* Existing Reviews */}
    {product.reviews && product.reviews.length === 0 ? (
      <Alert style={{
        backgroundColor: 'var(--tan-light)',
        borderColor: 'var(--tan)',
        color: 'var(--oxford-blue)',
      }}>
        No reviews yet. Be the first to review this product!
      </Alert>
    ) : (
      <ListGroup variant='flush'>
        {product.reviews && product.reviews.map((review) => (
          <ListGroup.Item
            key={review._id}
            style={{ borderColor: '#EAE0D5', padding: '1rem 0' }}
          >
            <div className='d-flex justify-content-between align-items-center mb-1'>
              <strong style={{ color: 'var(--oxford-blue)' }}>
                {review.name}
              </strong>
              <small style={{ color: 'var(--text-muted)' }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </small>
            </div>
            <div className='mb-1'>
              <span className='product-card-stars'>
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>
              {review.comment}
            </p>
          </ListGroup.Item>
        ))}
      </ListGroup>
    )}

    {/* ── Interactive Review Form ── */}
    <Card className='p-4 mt-4' style={{ border: '1px solid #EAE0D5' }}>

      {/* Product being reviewed */}
      <div className='d-flex align-items-center gap-3 mb-4 pb-3'
        style={{ borderBottom: '1px solid #EAE0D5' }}>
        <Image
          src={product.image}
          alt={product.name}
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '8px',
            border: '2px solid var(--tan-light)',
          }}
        />
        <div>
          <p style={{
            margin: 0,
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Reviewing
          </p>
          <strong style={{ color: 'var(--oxford-blue)', fontSize: '0.95rem' }}>
            {product.name}
          </strong>
        </div>
      </div>

      <h4 style={{ color: 'var(--oxford-blue)' }} className='mb-3'>
        Write a Review
      </h4>

      {reviewSuccess && (
        <Alert style={{
          backgroundColor: 'var(--tan-light)',
          borderColor: 'var(--tan)',
          color: 'var(--oxford-blue)',
        }}>
          Review submitted successfully!
        </Alert>
      )}
      {reviewError && (
        <Alert variant='danger'>{reviewError}</Alert>
      )}

      {userInfo ? (
        <Form onSubmit={submitReviewHandler}>

          {/* ── Interactive Stars ── */}
          <Form.Group className='mb-3'>
            <Form.Label style={{
              color: 'var(--oxford-blue)',
              fontWeight: '500',
            }}>
              Your Rating
            </Form.Label>
            <StarRating
              rating={rating}
              setRating={setRating}
            />
          </Form.Group>

          <Form.Group controlId='comment' className='mb-3'>
            <Form.Label>Your Review</Form.Label>
            <Form.Control
              as='textarea'
              rows={4}
              placeholder='Share your thoughts about this product...'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            type='submit'
            variant='dark'
            className='w-100'
            disabled={reviewLoading || rating === 0}
          >
            {reviewLoading ? (
              <Spinner animation='border' size='sm' />
            ) : (
              'Submit Review'
            )}
          </Button>
          {rating === 0 && (
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              textAlign: 'center',
              marginTop: '0.5rem',
              marginBottom: 0,
            }}>
              Please select a star rating before submitting
            </p>
          )}
        </Form>
      ) : (
        <Alert style={{
          backgroundColor: 'var(--tan-light)',
          borderColor: 'var(--tan)',
          color: 'var(--oxford-blue)',
        }}>
          Please{' '}
          <Link
            to='/login'
            style={{ color: 'var(--oxford-blue)', fontWeight: '600' }}
          >
            sign in
          </Link>
          {' '}to write a review.
        </Alert>
      )}
    </Card>
  </Col>
</Row>
        </>
      )}
    </>
  );
};

export default ProductPage;