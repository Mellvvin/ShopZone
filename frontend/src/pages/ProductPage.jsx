// frontend/src/pages/ProductPage/ProductPage.jsx
// ─────────────────────────────────────────────────────────────
// Single product detail page — all inline styles removed.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
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

const [qty, setQty]             = useState(1);
  const [rating, setRating]       = useState(0);
  const [comment, setComment]     = useState('');
  // Verified purchase state — true if the user has a delivered
  // order containing this product. Checked on mount.
  const [verifiedPurchase, setVerifiedPurchase] = useState(false);
  const [purchaseChecked,  setPurchaseChecked]  = useState(false);

  const {
    product, loadingDetails, errorDetails,
    reviewLoading, reviewError, reviewSuccess,
  } = useSelector((state) => state.products);

  const { userInfo } = useSelector((state) => state.auth);

useEffect(() => {
    if (reviewSuccess) { setRating(0); setComment(''); dispatch(resetProductReview()); }
    dispatch(listProductDetails(id));
  }, [dispatch, id, reviewSuccess]);

  // ── Verified purchase check ────────────────────────────────
  // Fetches the user's orders on mount and checks if any delivered
  // order contains this product. If yes, the review form is shown.
  // If no, the form is replaced with an explanatory message.
  // Only runs when the user is logged in.
  useEffect(() => {
    if (!userInfo) { setPurchaseChecked(true); return; }
    const checkPurchase = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/orders/myorders', config);
        // Check if any delivered order contains this product ID
     const bought = data.some(
          (order) =>
            order.status === 'delivered' &&
            order.orderItems.some((item) => item.product?.toString() === id)
        );
        setVerifiedPurchase(bought);
      } catch {
        // If the check fails, default to not showing the form.
        // The backend enforces the same rule so no security gap.
        setVerifiedPurchase(false);
      } finally {
        setPurchaseChecked(true);
      }
    };
    checkPurchase();
  }, [userInfo, id]);

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
    // Guard against DOM manipulation — userInfo check before dispatch
    if (!userInfo) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    dispatch(createProductReview({ productId: id, rating: Number(rating), comment }));
  };

  // ── Wholesale unit sanity-check display (DEC-040 / DEC-041) ─────────
  // unitLabel falls back through unitType → legacy unit → Per Unit.
  // The per-piece value is computed fresh here only — never stored,
  // never sent to the backend. price always represents the full unit
  // (e.g. one carton), never a single piece.
  const unitLabel = product?.unitType || product?.unit || 'Per Unit';
  const hasPerPieceBreakdown = product?.itemsPerUnit && product.itemsPerUnit > 1;
  const perPieceValue = hasPerPieceBreakdown
    ? product.price / product.itemsPerUnit
    : null;

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
                  {/* Brand link — only shown when the product has a brand set */}
                  {product.brand && (
                    <button
                      className='pp-brand-link'
                      onClick={() => navigate(`/?brand=${encodeURIComponent(product.brand)}`)}
                    >
                      {product.brand}
                    </button>
                  )}
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
                    <Col>
                      <strong className='product-card-price'>{`KES ${Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}</strong>
                      <span className='pp-unit-suffix'> / {unitLabel}</span>
                    </Col>
                  </Row>
                </ListGroup.Item>

                {/* ── Per-piece sanity check — primary location (DEC-041) ──
                    Only shown when itemsPerUnit is set and greater than 1.
                    Computed fresh on render — never stored, never sent
                    to the backend. */}
                {hasPerPieceBreakdown && (
                  <ListGroup.Item className='pp-per-piece-item'>
                    <p className='pp-per-piece-line'>
                      ≈ KES {perPieceValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })} per piece —{' '}
                      {product.itemsPerUnit} pieces per {unitLabel.toLowerCase()}
                    </p>
                  </ListGroup.Item>
                )}

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

          {!product?.reviews || product.reviews.length === 0 ? (
                <Alert className='pp-alert-tan'>No reviews yet. Be the first to review this product!</Alert>
              ) : (
                <>
                  <p className='pp-review-count-line'>
                    {product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''}
                  </p>
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
                </>
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

                {!userInfo ? (
                  // Not logged in
                  <Alert className='pp-alert-tan'>
                    Please <Link to='/login' className='pp-link'>sign in</Link> to write a review.
                  </Alert>
                ) : !purchaseChecked ? (
                  // Still checking purchase status
                  <div className='text-center py-3'>
                    <Spinner animation='border' size='sm' className='pp-spinner' />
                  </div>
                ) : !verifiedPurchase ? (
                  // Logged in but has not bought and received this product
                  <Alert className='pp-alert-tan'>
                    <strong>Verified purchases only.</strong> You can leave a review once you have
                    purchased this product and your order has been delivered. This ensures all
                    reviews on ShopZone are genuine.
                  </Alert>
                ) : (
                  // Logged in and has a delivered order with this product
                  <Form onSubmit={submitReviewHandler}>
                    <Form.Group className='mb-3'>
                      <Form.Label className='pp-form-label'>Your Rating</Form.Label>
                      <StarRating rating={rating} setRating={setRating} />
                    </Form.Group>
                    <Form.Group controlId='comment' className='mb-3'>
                      <Form.Label>Your Review</Form.Label>
                      <Form.Control
                        as='textarea'
                        rows={4}
                        placeholder='Share your honest thoughts about this product. Be specific — quality, packaging, accuracy of description...'
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        minLength={10}
                      />
                    </Form.Group>
                    <Button type='submit' variant='dark' className='w-100' disabled={reviewLoading || rating === 0}>
                      {reviewLoading ? <Spinner animation='border' size='sm' /> : 'Submit Review'}
                    </Button>
                    {rating === 0 && (
                      <p className='pp-rating-hint'>Please select a star rating before submitting</p>
                    )}
                  </Form>
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