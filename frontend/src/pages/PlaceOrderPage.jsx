import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row, Col, ListGroup, Image,
  Button, Card, Alert, Spinner
} from 'react-bootstrap';
import axios from 'axios';
import { useState } from 'react';
import { clearCartItems } from '../redux/slices/cartSlice';

const PlaceOrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, shippingAddress, paymentMethod } = useSelector(
    (state) => state.cart
  );
  const { userInfo } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── Price Calculations ──────────────────────────────────
  const itemsPrice    = cartItems
    .reduce((acc, item) => acc + item.price * item.qty, 0)
    .toFixed(2);

  const shippingPrice = (10).toFixed(2);

  const taxPrice = (Number(itemsPrice) * 0.16).toFixed(2);

  const totalPrice    = (
    Number(itemsPrice) +
    Number(shippingPrice) +
    Number(taxPrice)
  ).toFixed(2);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
    if (!shippingAddress?.address) {
      navigate('/shipping');
    }
    if (!paymentMethod) {
      navigate('/payment');
    }
  }, [userInfo, shippingAddress, paymentMethod, navigate]);

  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems:      cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
        },
        config
      );

      dispatch(clearCartItems());
      navigate(`/order/${data._id}`);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Progress Indicator ── */}
      <div className='d-flex justify-content-center mb-4'>
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <div className='d-flex justify-content-between'>
            {['Shipping', 'Payment', 'Place Order'].map((step, index) => (
              <div key={step} className='text-center' style={{ flex: 1 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: index === 2
                    ? 'var(--oxford-blue)'
                    : 'var(--tan)',
                  color: 'var(--oxford-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                }}>
                  {index + 1}
                </div>
                <small style={{
                  color: index === 2 ? 'var(--oxford-blue)' : 'var(--text-muted)',
                  fontWeight: index === 2 ? '600' : '400',
                }}>
                  {step}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Row>
        {/* ── LEFT — Order Details ── */}
        <Col md={8}>

          {/* Shipping */}
          <ListGroup variant='flush'>
            <ListGroup.Item style={{ borderColor: '#EAE0D5' }}>
              <h4 style={{ color: 'var(--oxford-blue)' }}>Shipping</h4>
              <p style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Address: </strong>
                {shippingAddress.address}, {shippingAddress.city},{' '}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
            </ListGroup.Item>

            {/* Payment */}
            <ListGroup.Item style={{ borderColor: '#EAE0D5' }}>
              <h4 style={{ color: 'var(--oxford-blue)' }}>Payment Method</h4>
              <p style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Method: </strong>
                {paymentMethod}
              </p>
            </ListGroup.Item>

            {/* Order Items */}
            <ListGroup.Item style={{ borderColor: '#EAE0D5' }}>
              <h4 style={{ color: 'var(--oxford-blue)' }}>Order Items</h4>
              {cartItems.length === 0 ? (
                <Alert style={{
                  backgroundColor: 'var(--tan-light)',
                  borderColor: 'var(--tan)',
                  color: 'var(--oxford-blue)',
                }}>
                  Your cart is empty
                </Alert>
              ) : (
                <ListGroup variant='flush'>
                  {cartItems.map((item, index) => (
                    <ListGroup.Item
                      key={index}
                      style={{ borderColor: '#EAE0D5', padding: '0.75rem 0' }}
                    >
                      <Row className='align-items-center'>
                        <Col md={2}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                            style={{ maxHeight: '50px', objectFit: 'cover' }}
                          />
                        </Col>
                        <Col>
                          <Link
                            to={`/product/${item.product}`}
                            style={{ color: 'var(--oxford-blue)', fontWeight: '500' }}
                          >
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4} style={{ color: 'var(--text-muted)' }}>
                          {item.qty} x ${item.price} ={' '}
                          <span className='product-card-price'>
                            ${(item.qty * item.price).toFixed(2)}
                          </span>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        {/* ── RIGHT — Order Summary ── */}
        <Col md={4}>
          <Card style={{ border: '1px solid #EAE0D5' }}>
            <ListGroup variant='flush'>
              <ListGroup.Item style={{ backgroundColor: 'var(--oxford-blue)' }}>
                <h4 style={{ color: 'var(--tan)', margin: 0 }}>
                  Order Summary
                </h4>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col style={{ color: 'var(--text-muted)' }}>Items:</Col>
                  <Col className='product-card-price'>${itemsPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col style={{ color: 'var(--text-muted)' }}>Shipping:</Col>
                  <Col className='product-card-price'>${shippingPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col style={{ color: 'var(--text-muted)' }}>VAT (16%):</Col>
                  <Col className='product-card-price'>${taxPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item style={{
                borderTop: '2px solid var(--tan)',
                paddingTop: '1rem'
              }}>
                <Row>
                  <Col style={{ color: 'var(--oxford-blue)', fontWeight: '700' }}>
                    Total:
                  </Col>
                  <Col className='product-card-price' style={{ fontSize: '1.2rem' }}>
                    ${totalPrice}
                  </Col>
                </Row>
              </ListGroup.Item>

              {error && (
                <ListGroup.Item>
                  <Alert variant='danger'>{error}</Alert>
                </ListGroup.Item>
              )}

              <ListGroup.Item>
                <Button
                  type='button'
                  className='w-100'
                  disabled={cartItems.length === 0 || loading}
                  onClick={placeOrderHandler}
                >
                  {loading ? (
                    <Spinner animation='border' size='sm' />
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderPage;