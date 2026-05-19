// frontend/src/pages/CartPage.jsx
// ─────────────────────────────────────────────────────────────
// Shopping cart page.
// Shows all cart items with quantity controls and order summary.
// Toast added for item removal.
// ─────────────────────────────────────────────────────────────
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Row, Col, ListGroup, Image,
  Button, Card, Form, Alert,
} from 'react-bootstrap';
import { updateCartQty, removeFromCart } from '../redux/slices/cartSlice';
import { showToast } from '../components/Toast/Toast';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

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
    <Row>

      {/* ════════════════════════════════════════════════════
          LEFT — Cart items list
      ════════════════════════════════════════════════════ */}
      <Col md={8}>
        <h1 className='page-title mb-4'>Shopping Cart</h1>

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
                    <span className='product-card-price'>${item.price}</span>
                  </Col>

                  {/* ── Quantity controls ───────────────── */}
                  <Col md={3}>
                    <Row className='align-items-center'>
                      <Col xs='auto'>
                        <Button
                          variant='light'
                          className='qty-btn'
                          onClick={() => handleQtyChange(item, item.qty - 1)}
                        >
                          −
                        </Button>
                      </Col>
                      <Col xs='auto'>
                        <Form.Control
                          type='number'
                          value={item.qty}
                          min={1}
                          onChange={(e) => handleQtyChange(item, e.target.value)}
                          className='qty-input'
                        />
                      </Col>
                      <Col xs='auto'>
                        <Button
                          variant='light'
                          className='qty-btn'
                          onClick={() => handleQtyChange(item, item.qty + 1)}
                        >
                          +
                        </Button>
                      </Col>
                    </Row>
                  </Col>

                  {/* ── Remove button ───────────────────── */}
                  <Col md={1}>
                    <Button
                      type='button'
                      variant='light'
                      onClick={() => removeFromCartHandler(item.product, item.name)}
                      style={{
                        color: 'var(--oxford-blue)',
                        border: '1px solid var(--tan)',
                        padding: '4px 10px',
                      }}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      ✕
                    </Button>
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
                  ${cartItems
                    .reduce((acc, item) => acc + item.qty * item.price, 0)
                    .toFixed(2)}
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
  );
};

export default CartPage;