// frontend/src/pages/CartPage/CartPage.jsx
// ─────────────────────────────────────────────────────────────
// Shopping cart page — all inline styles removed.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Row, Col, ListGroup, Image,
  Button, Card, Alert,
} from 'react-bootstrap';
import { updateCartQty, removeFromCart, clearCartItems } from '../redux/slices/cartSlice';
import { showToast } from '../components/Toast/Toast';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import './CartPage.css';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo }  = useSelector((state) => state.auth);

  useEffect(() => { document.title = 'Your Cart — ShopZone'; }, []);

  const [showClearCartModal, setShowClearCartModal] = useState(false);

  const confirmClearCart = () => {
    dispatch(clearCartItems());
    showToast('Cart cleared.', 'info');
    setShowClearCartModal(false);
  };

  const removeFromCartHandler = (id, name) => {
    dispatch(removeFromCart(id));
    showToast(`${name} removed from cart.`, 'info');
  };

  const handleQtyChange = (item, value) => {
    const parsed = parseInt(value);
    if (value === '' || isNaN(parsed)) return;
    dispatch(updateCartQty({ id: item.product, qty: Math.max(1, parsed) }));
  };

const checkoutHandler = () => {
    // Redirect to login with state.from so LoginPage returns to /shipping
    if (!userInfo) navigate('/login', { state: { from: '/shipping' } });
    else navigate('/shipping');
  };

  return (
    <>
      <ConfirmModal
        show={showClearCartModal}
        onConfirm={confirmClearCart}
        onCancel={() => setShowClearCartModal(false)}
        title='Clear Cart'
        message='Remove all items from your cart?'
        subMessage='This cannot be undone.'
        confirmLabel='Yes, Clear Cart'
        confirmVariant='danger'
      />

      <Row>
        {/* ── Left — cart items ───────────────────────────── */}
        <Col md={8}>
          <div className='d-flex align-items-center justify-content-between mb-4'>
            <h1 className='page-title mb-0'>Shopping Cart</h1>
            {cartItems.length > 0 && (
              <button className='cart-clear-btn' onClick={() => setShowClearCartModal(true)}>
                Clear Cart
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <Alert className='cart-empty-alert'>
              Your cart is empty.{' '}
              <Link to='/' className='cart-empty-link'>Continue Shopping</Link>
            </Alert>
          ) : (
            <ListGroup variant='flush'>
              {cartItems.map((item) => (
                <ListGroup.Item key={item.product} className='cart-item'>
                  <Row className='align-items-center'>
                    <Col md={2}>
                      <Image src={item.image} alt={item.name} fluid rounded className='cart-item-img' />
                    </Col>
                    <Col md={3}>
                      <Link to={`/product/${item.product}`} className='cart-item-name'>{item.name}</Link>
                    </Col>
                   <Col md={2}>
                      <span className='product-card-price'>
                        KES {Number(item.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </span>
                      {/* ── Compact wholesale unit sanity check (DEC-041) ──
                          Last checkpoint before checkout. Falls back to
                          'Per Unit' for cart items added before this
                          field existed — never throws on missing data. */}
                      <span className='cart-item-unit'>
                        / {item.unitType || 'Per Unit'}
                      </span>
                      {item.itemsPerUnit > 1 && (
                        <span className='cart-item-per-piece'>
                          ≈ KES {(item.price / item.itemsPerUnit).toLocaleString('en-KE', { minimumFractionDigits: 2 })} / piece
                        </span>
                      )}
                    </Col>
                    <Col md={3}>
                      <div className='cart-stepper'>
                        <button className='cart-stepper__btn' onClick={() => handleQtyChange(item, item.qty - 1)} aria-label='Decrease quantity'>−</button>
                        <input
                          type='number'
                          value={item.qty}
                          min={1}
                          onChange={(e) => handleQtyChange(item, e.target.value)}
                          className='cart-stepper__input'
                          aria-label={`Quantity for ${item.name}`}
                        />
                        <button className='cart-stepper__btn' onClick={() => handleQtyChange(item, item.qty + 1)} aria-label='Increase quantity'>+</button>
                      </div>
                    </Col>
                    <Col md={1}>
                      <button
                        type='button'
                        className='cart-remove-btn'
                        onClick={() => removeFromCartHandler(item.product, item.name)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        ✕
                      </button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        {/* ── Right — order summary ───────────────────────── */}
        <Col md={4}>
          <Card className='cart-summary-card'>
            <ListGroup variant='flush'>
              <ListGroup.Item className='cart-summary-header'>
                <h4 className='cart-summary-title'>Order Summary</h4>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col className='cart-summary-label'>Items:</Col>
                  <Col className='cart-summary-value'>
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col className='cart-summary-label'>Subtotal:</Col>
                  <Col className='product-card-price'>
                    KES {cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Button type='button' className='w-100' disabled={cartItems.length === 0} onClick={checkoutHandler}>
                  Proceed To Checkout
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CartPage;