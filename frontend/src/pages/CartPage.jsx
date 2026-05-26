// frontend/src/pages/CartPage.jsx
// ─────────────────────────────────────────────────────────────
// Shopping cart page.
// Shows all cart items with quantity controls and order summary.
// Toast added for item removal.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Row, Col, ListGroup, Image,
  Button, Card, Form, Alert,
} from 'react-bootstrap';
import { updateCartQty, removeFromCart, clearCartItems } from '../redux/slices/cartSlice';
import { showToast } from '../components/Toast/Toast';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);

  // ── Page title ─────────────────────────────────────────────
  useEffect(() => { document.title = 'Your Cart — ShopZone'; }, []);
  
  const { userInfo } = useSelector((state) => state.auth);

 
  // ── Clear entire cart ─────────────────────────────────────
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  const clearCartHandler = () => {
    setShowClearCartModal(true);
  };

  const confirmClearCart = () => {
    dispatch(clearCartItems());
    showToast('Cart cleared.', 'info');
    setShowClearCartModal(false);
  };



  // ── Remove item from cart ─────────────────────────────────
  // Fires both the Redux action and a toast notification.
  const removeFromCartHandler = (id, name) => {
    dispatch(removeFromCart(id));
    showToast(`${name} removed from cart.`, 'info');
  };

  // ── Quantity change handler ───────────────────────────────
  // Handles both +/- buttons and direct input.
  // Ignores empty or non-numeric values to prevent NaN.
  const handleQtyChange = (item, value) => {
    const parsed = parseInt(value);
    if (value === '' || isNaN(parsed)) return;
    const newQty = Math.max(1, parsed);
    dispatch(updateCartQty({ id: item.product, qty: newQty }));
  };

  // ── Checkout handler ──────────────────────────────────────
  // Redirects to login if not logged in, otherwise to shipping.
  const checkoutHandler = () => {
    if (!userInfo) {
      navigate('/login?redirect=shipping');
    } else {
      navigate('/shipping');
    }
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

      {/* ════════════════════════════════════════════════════
          LEFT — Cart items list
      ════════════════════════════════════════════════════ */}
      <Col md={8}>
        <div className='d-flex align-items-center justify-content-between mb-4'>
          <h1 className='page-title mb-0'>Shopping Cart</h1>
          {cartItems.length > 0 && (
            <button
              onClick={clearCartHandler}
              style={{
                all: 'unset',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#c0392b',
                borderBottom: '1px solid #c0392b',
                paddingBottom: '1px',
              }}
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Empty cart state */}
        {cartItems.length === 0 ? (
          <Alert style={{
            backgroundColor: 'var(--tan-light)',
            borderColor: 'var(--tan)',
            color: 'var(--oxford-blue)',
          }}>
            Your cart is empty.{' '}
            <Link to='/' style={{ color: 'var(--oxford-blue)', fontWeight: 600 }}>
              Continue Shopping
            </Link>
          </Alert>
        ) : (
          <ListGroup variant='flush'>
            {cartItems.map((item) => (
              <ListGroup.Item
                key={item.product}
                style={{ borderColor: '#EAE0D5', padding: '1rem 0' }}
              >
                <Row className='align-items-center'>

                  {/* ── Product image ───────────────────── */}
                  <Col md={2}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fluid
                      rounded
                      style={{ maxHeight: '70px', objectFit: 'cover' }}
                    />
                  </Col>

                  {/* ── Product name ────────────────────── */}
                  <Col md={3}>
                    <Link
                      to={`/product/${item.product}`}
                      style={{ color: 'var(--oxford-blue)', fontWeight: 500 }}
                    >
                      {item.name}
                    </Link>
                  </Col>

                  {/* ── Unit price ──────────────────────── */}
                  <Col md={2}>
                    <span className='product-card-price'>
                      KES {Number(item.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </span>
                  </Col>

                  {/* ── Quantity controls ───────────────── */}
                  <Col md={3}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1.5px solid rgba(0,33,71,0.15)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      height: '32px',
                    }}>
                      <button
                        onClick={() => handleQtyChange(item, item.qty - 1)}
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          width: '28px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          color: 'var(--oxford-blue)',
                          background: 'rgba(0,33,71,0.04)',
                          flexShrink: 0,
                        }}
                        aria-label='Decrease quantity'
                      >
                        −
                      </button>
                      <input
                        type='number'
                        value={item.qty}
                        min={1}
                        onChange={(e) => handleQtyChange(item, e.target.value)}
                        style={{
                          width: '36px',
                          height: '32px',
                          border: 'none',
                          borderLeft: '1px solid rgba(0,33,71,0.1)',
                          borderRight: '1px solid rgba(0,33,71,0.1)',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--oxford-blue)',
                          outline: 'none',
                          padding: 0,
                          MozAppearance: 'textfield',
                        }}
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <button
                        onClick={() => handleQtyChange(item, item.qty + 1)}
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          width: '28px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          color: 'var(--oxford-blue)',
                          background: 'rgba(0,33,71,0.04)',
                          flexShrink: 0,
                        }}
                        aria-label='Increase quantity'
                      >
                        +
                      </button>
                    </div>
                  </Col>

                  {/* ── Remove button ───────────────────── */}
                  <Col md={1}>
                    <button
                      type='button'
                      onClick={() => removeFromCartHandler(item.product, item.name)}
                      style={{
                        all: 'unset',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '30px',
                        height: '30px',
                        borderRadius: '5px',
                        border: '1.5px solid #c0392b',
                        color: '#c0392b',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        transition: 'background 0.15s ease, color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#c0392b';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#c0392b';
                      }}
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

      {/* ════════════════════════════════════════════════════
          RIGHT — Order summary
      ════════════════════════════════════════════════════ */}
      <Col md={4}>
        <Card style={{ border: '1px solid #EAE0D5' }}>
          <ListGroup variant='flush'>

            {/* Header */}
            <ListGroup.Item style={{ backgroundColor: 'var(--oxford-blue)' }}>
              <h4 style={{ color: 'var(--tan)', margin: 0 }}>Order Summary</h4>
            </ListGroup.Item>

            {/* Item count */}
            <ListGroup.Item>
              <Row>
                <Col style={{ color: 'var(--text-muted)' }}>Items:</Col>
                <Col style={{ color: 'var(--oxford-blue)', fontWeight: 600 }}>
                  {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                </Col>
              </Row>
            </ListGroup.Item>

            {/* Subtotal */}
            <ListGroup.Item>
              <Row>
                <Col style={{ color: 'var(--text-muted)' }}>Subtotal:</Col>
                <Col className='product-card-price'>
                  KES {cartItems
                    .reduce((acc, item) => acc + item.qty * item.price, 0)
                    .toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </Col>
              </Row>
            </ListGroup.Item>

            {/* Checkout button */}
            <ListGroup.Item>
              <Button
                type='button'
                className='w-100'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
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