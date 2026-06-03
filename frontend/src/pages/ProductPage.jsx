// frontend/src/pages/ProductPage/ProductPage.jsx
// ─────────────────────────────────────────────────────────────
// Single product detail page — all inline styles removed.
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
import { showToast } from '../components/Toast/Toast';
import { recordRecentView } from '../components/SearchBar/SearchBar';
import './ProductPage.css';

// ── Star rating input ─────────────────────────────────────────
const StarRating = ({ rating, setRating }) => {
  const [hovered, setHovered] = useState(0);
  const LABELS = ['','Poor','Fair','Good','Very Good','Excellent'];
  return (
    <div className='d-flex gap-1 pp-star-row'>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`pp-star${star <= (hovered || rating) ? ' pp-star--active' : ''}`}
          role='button'
          aria-label={`Rate ${star} stars`}
        >
          ★
        </span>
      ))}
      {rating > 0 && <span className='pp-star-label'>{LABELS[rating]}</span>}
    </div>
  );
};

const ProductPage = () => {
const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty]         = useState(1);
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');

  const {
    product, loadingDetails, errorDetails,
    reviewLoading, reviewError, reviewSuccess,
  } = useSelector((state) => state.products);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (reviewSuccess) { setRating(0); setComment(''); dispatch(resetProductReview()); }
    dispatch(listProductDetails(id));
  }, [dispatch, id, reviewSuccess]);

  useEffect(() => {
    document.title = product?.name ? `${product.name} — ShopZone` : 'Product — ShopZone';
    // Record this product as recently viewed for the search autocomplete
    if (product?._id) recordRecentView(product);
  }, [product?.name, product?._id]);

  const handleQtyChange = (value) => {
    const parsed = parseInt(value);
    if (value === '' || isNaN(parsed)) { setQty(''); return; }
    setQty(Math.max(1, parsed));
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ id, qty: Number(qty) || 1 }));
    showToast(`${product.name} added to cart`, 'success', {
      action: { label: 'Go to Cart', onClick: () => navigate('/cart') },
    });
  };

  const submitReviewHandler = (e) => {
    e.preventDefault();
    dispatch(createProductReview({ productId: id, rating: Number(rating), comment }));
  };

  return (
    <>
      <Link className='btn btn-light my-3' to='/'>Go Back</Link>

      {loadingDetails ? (
        <div className='text-center py-5'><Spinner animation='border' className='pp-spinner' /></div>
      ) : errorDetails ? (
        <Alert variant='danger'>{errorDetails}</Alert>
      ) : (
        <>
          <Row>
            {/* Image */}
            <Col md={6}>
              <Image src={product.image} alt={product.name} fluid className='rounded pp-product-img' />
            </Col>

            {/* Info */}
            <Col md={3}>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h3 className='pp-product-name'>{product.name}</h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <span className='product-card-stars'>
                    {'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}
                  </span>
                  <span className='product-card-reviews'> ({product.numReviews} reviews)</span>
                </ListGroup.Item>
                <ListGroup.Item>
                  <span className='product-card-price'>
                    {`KES ${Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}
                  </span>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Description:</strong>
                  <p className='pp-description mt-2'>{product.description}</p>
                </ListGroup.Item>
              </ListGroup>
            </Col>

            {/* Add to cart */}
            <Col md={3}>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col><strong className='product-card-price'>{`KES ${Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}</strong></Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0
                        ? <span className='pp-stock--in'>In Stock</span>
                        : <span className='pp-stock--out'>Out of Stock</span>}
                    </Col>
                  </Row>
                </ListGroup.Item>
                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <p className='pp-qty-label'>Quantity:</p>
                    <Row className='align-items-center'>
                      <Col xs='auto'>
                        <Button variant='light' className='qty-btn' onClick={() => handleQtyChange(Number(qty) - 1)}>−</Button>
                      </Col>
                      <Col xs='auto'>
                        <Form.Control type='number' value={qty} min={1} onChange={(e) => handleQtyChange(e.target.value)} className='qty-input' />
                      </Col>
                      <Col xs='auto'>
                        <Button variant='light' className='qty-btn' onClick={() => handleQtyChange(Number(qty) + 1)}>+</Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}
                <ListGroup.Item>
                  <Button className='w-100' type='button' disabled={product.countInStock === 0} onClick={addToCartHandler}>
                    Add To Cart
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>

          {/* Reviews */}
          <Row className='mt-5'>
            <Col md={6}>
              <h3 className='page-title mb-4'>Customer Reviews</h3>

              {product.reviews && product.reviews.length === 0 ? (
                <Alert className='pp-alert-tan'>No reviews yet. Be the first to review this product!</Alert>
              ) : (
                <ListGroup variant='flush'>
                  {product.reviews && product.reviews.map((review) => (
                    <ListGroup.Item key={review._id} className='pp-review-item'>
                      <div className='d-flex justify-content-between align-items-center mb-1'>
                        <strong className='pp-reviewer-name'>{review.name}</strong>
                        <small className='pp-review-date'>{new Date(review.createdAt).toLocaleDateString()}</small>
                      </div>
                      <div className='mb-1'>
                        <span className='product-card-stars'>
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p className='pp-review-comment'>{review.comment}</p>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              {/* Review form */}
              <Card className='p-4 mt-4 pp-review-card'>
                <div className='pp-review-product-row'>
                  <Image src={product.image} alt={product.name} className='pp-review-thumb' />
                  <div>
                    <p className='pp-reviewing-label'>Reviewing</p>
                    <strong className='pp-reviewing-name'>{product.name}</strong>
                  </div>
                </div>

                <h4 className='pp-write-title mb-3'>Write a Review</h4>

                {reviewSuccess && <Alert className='pp-alert-tan'>Review submitted successfully!</Alert>}
                {reviewError   && <Alert variant='danger'>{reviewError}</Alert>}

                {userInfo ? (
                  <Form onSubmit={submitReviewHandler}>
                    <Form.Group className='mb-3'>
                      <Form.Label className='pp-form-label'>Your Rating</Form.Label>
                      <StarRating rating={rating} setRating={setRating} />
                    </Form.Group>
                    <Form.Group controlId='comment' className='mb-3'>
                      <Form.Label>Your Review</Form.Label>
                      <Form.Control as='textarea' rows={4} placeholder='Share your thoughts about this product...' value={comment} onChange={(e) => setComment(e.target.value)} required />
                    </Form.Group>
                    <Button type='submit' variant='dark' className='w-100' disabled={reviewLoading || rating === 0}>
                      {reviewLoading ? <Spinner animation='border' size='sm' /> : 'Submit Review'}
                    </Button>
                    {rating === 0 && <p className='pp-rating-hint'>Please select a star rating before submitting</p>}
                  </Form>
                ) : (
                  <Alert className='pp-alert-tan'>
                    Please <Link to='/login' className='pp-link'>sign in</Link> to write a review.
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