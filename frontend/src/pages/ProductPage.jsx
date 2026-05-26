// frontend/src/pages/ProductPage.jsx
// ─────────────────────────────────────────────────────────────
// Single product detail page.
// Shows product image, info, add to cart, and reviews.
//
// Fixed in Step 11:
//   Updated useSelector to match the new productSlice state shape.
//   reviewLoading, reviewError, reviewSuccess now read directly
//   from state.products instead of state.products.productReview
//   which does not exist.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row, Col, Image, ListGroup,
  Button, Spinner, Alert, Form, Card,
} from 'react-bootstrap';
import {
  listProductDetails,
  createProductReview,
  resetProductReview,
} from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';

// ── Star rating input component ───────────────────────────────
// Renders 5 clickable stars. Highlights on hover and on select.
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
            color: star <= (hovered || rating) ? 'var(--tan-dark)' : '#CCCCCC',
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
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // ── Redux state ───────────────────────────────────────────
  // Product detail state — uses the names defined in productSlice
  const {
    product,
    loadingDetails,
    errorDetails,
    reviewLoading,
    reviewError,
    reviewSuccess,
  } = useSelector((state) => state.products);

  const { userInfo } = useSelector((state) => state.auth);

  // ── Fetch product on mount and after review submitted ─────
  useEffect(() => {
    if (reviewSuccess) {
      setRating(0);
      setComment('');
      dispatch(resetProductReview());
    }
    dispatch(listProductDetails(id));
  }, [dispatch, id, reviewSuccess]);

  // ── Page title — set once product name is available ────────
  // Runs whenever product changes so the tab updates after load
  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} — ShopZone`;
    } else {
      document.title = 'Product — ShopZone';
    }
  }, [product?.name]);

  // ── Quantity input handler ────────────────────────────────
  // Allows typing a number directly or using +/- buttons.
  const handleQtyChange = (value) => {
    const parsed = parseInt(value);
    if (value === '' || isNaN(parsed)) {
      setQty('');
    } else {
      setQty(Math.max(1, parsed));
    }
  };

  // ── Add to cart ───────────────────────────────────────────
  const addToCartHandler = () => {
    dispatch(addToCart({ id, qty: Number(qty) || 1 }));
    navigate('/cart');
  };

  // ── Submit review ─────────────────────────────────────────
  const submitReviewHandler = (e) => {
    e.preventDefault();
    dispatch(createProductReview({
      productId: id,
      rating: Number(rating),
      comment,
    }));
  };

  return (
    <>
      {/* ── Back button ───────────────────────────────────── */}
      <Link className='btn btn-light my-3' to='/'>
        Go Back
      </Link>

      {/* ── Loading state ─────────────────────────────────── */}
      {loadingDetails ? (
        <div className='text-center py-5'>
          <Spinner animation='border' style={{ color: 'var(--oxford-blue)' }} />
        </div>

        /* ── Error state ────────────────────────────────────── */
      ) : errorDetails ? (
        <Alert variant='danger'>{errorDetails}</Alert>

        /* ── Product content ────────────────────────────────── */
      ) : (
        <>
          <Row>
            {/* ── LEFT — Product image ──────────────────────── */}
            <Col md={6}>
              <Image
                src={product.image}
                alt={product.name}
                fluid
                className='rounded'
                style={{ maxHeight: '450px', objectFit: 'cover', width: '100%' }}
              />
            </Col>

            {/* ── MIDDLE — Product info ─────────────────────── */}
            <Col md={3}>
              <ListGroup variant='flush'>

                {/* Product name */}
                <ListGroup.Item>
                  <h3 style={{ color: 'var(--oxford-blue)' }}>{product.name}</h3>
                </ListGroup.Item>

                {/* Star rating + review count */}
                <ListGroup.Item>
                  <span className='product-card-stars'>
                    {'★'.repeat(Math.round(product.rating || 0))}
                    {'☆'.repeat(5 - Math.round(product.rating || 0))}
                  </span>
                  <span className='product-card-reviews'>
                    {' '}({product.numReviews} reviews)
                  </span>
                </ListGroup.Item>

                {/* Price */}
                    <ListGroup.Item>
                      <span className='product-card-price'>
                        {`KES ${Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}
                      </span>
                    </ListGroup.Item>

                {/* Description */}
                <ListGroup.Item>
                  <strong>Description:</strong>
                  <p className='mt-2' style={{ color: 'var(--text-muted)' }}>
                    {product.description}
                  </p>
                </ListGroup.Item>

              </ListGroup>
            </Col>

            {/* ── RIGHT — Add to cart box ───────────────────── */}
            <Col md={3}>
              <ListGroup variant='flush'>

                    {/* Price row */}
                    <ListGroup.Item>
                      <Row>
                        <Col>Price:</Col>
                        <Col>
                          <strong className='product-card-price'>
                            {`KES ${Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}
                          </strong>
                        </Col>
                      </Row>
                    </ListGroup.Item>

                {/* Stock status */}
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <span style={{ color: 'green', fontWeight: 600 }}>In Stock</span>
                      ) : (
                        <span style={{ color: 'red', fontWeight: 600 }}>Out of Stock</span>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {/* Quantity controls — only shown when in stock */}
                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <p className='mb-2' style={{ color: 'var(--oxford-blue)', fontWeight: 500 }}>
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

                {/* Add to cart button */}
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

          {/* ════════════════════════════════════════════════
              REVIEWS SECTION
          ════════════════════════════════════════════════ */}
          <Row className='mt-5'>
            <Col md={6}>
              <h3 style={{ color: 'var(--oxford-blue)' }} className='page-title mb-4'>
                Customer Reviews
              </h3>

              {/* ── Existing reviews list ─────────────────── */}
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

              {/* ── Review submission form ────────────────── */}
              <Card className='p-4 mt-4' style={{ border: '1px solid #EAE0D5' }}>

                {/* Product thumbnail + name at top of form */}
                <div
                  className='d-flex align-items-center gap-3 mb-4 pb-3'
                  style={{ borderBottom: '1px solid #EAE0D5' }}
                >
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

                {/* Success alert */}
                {reviewSuccess && (
                  <Alert style={{
                    backgroundColor: 'var(--tan-light)',
                    borderColor: 'var(--tan)',
                    color: 'var(--oxford-blue)',
                  }}>
                    Review submitted successfully!
                  </Alert>
                )}

                {/* Error alert */}
                {reviewError && (
                  <Alert variant='danger'>{reviewError}</Alert>
                )}

                {/* Form — only shown when logged in */}
                {userInfo ? (
                  <Form onSubmit={submitReviewHandler}>

                    {/* Star rating selector */}
                    <Form.Group className='mb-3'>
                      <Form.Label style={{ color: 'var(--oxford-blue)', fontWeight: 500 }}>
                        Your Rating
                      </Form.Label>
                      <StarRating rating={rating} setRating={setRating} />
                    </Form.Group>

                    {/* Review text */}
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

                    {/* Submit button */}
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

                    {/* Hint when no star selected */}
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
                  // Not logged in — prompt to sign in
                  <Alert style={{
                    backgroundColor: 'var(--tan-light)',
                    borderColor: 'var(--tan)',
                    color: 'var(--oxford-blue)',
                  }}>
                    Please{' '}
                    <Link to='/login' style={{ color: 'var(--oxford-blue)', fontWeight: 600 }}>
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