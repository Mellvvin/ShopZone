// frontend/src/pages/OrderPage.jsx
// ─────────────────────────────────────────────────────────────
// Order confirmation page.
// Shows order details, shipping, payment, and cancel option.
// Toast added for successful order cancellation.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Row, Col, ListGroup, Image,
  Card, Alert, Spinner, Badge, Button, Modal,
} from 'react-bootstrap';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ── Fetch order on mount ──────────────────────────────────
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(`/api/orders/${id}`, config);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        setError(msg);
        showToast(msg, 'error');
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, userInfo]);

  // ── Cancel order handler ──────────────────────────────────
  const cancelOrderHandler = async () => {
    try {
      setCancelLoading(true);
      setCancelError(null);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.put(
        `/api/orders/${id}/cancel`,
        {},
        config
      );
      setOrder(data);
      setShowModal(false);
      setCancelLoading(false);
      // Fire both inline alert and toast
      showToast('Your order has been cancelled successfully.', 'info');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setCancelError(msg);
      showToast(msg, 'error');
      setCancelLoading(false);
    }
  };

  const canCancel = order &&
    !order.isPaid &&
    !order.isDelivered &&
    order.status !== 'cancelled';

  if (loading) {
    return (
      <div className='text-center py-5'>
        <Spinner animation='border' style={{ color: 'var(--oxford-blue)' }} />
      </div>
    );
  }

  if (error) {
    return <Alert variant='danger'>{error}</Alert>;
  }

  return (
    <>
      {/* ── Cancel Confirmation Modal ─────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header style={{ backgroundColor: 'var(--oxford-blue)' }}>
          <Modal.Title style={{ color: 'var(--tan)' }}>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ color: 'var(--text-dark)' }}>
          <p>Are you sure you want to cancel this order?</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Order ID:{' '}
            <span style={{ fontFamily: 'Courier New' }}>{order._id}</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            This action cannot be undone. The order will be marked as
            cancelled in your order history.
          </p>
          {cancelError && <Alert variant='danger'>{cancelError}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='light'
            onClick={() => setShowModal(false)}
            style={{ borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}
          >
            Keep Order
          </Button>
          <Button
            variant='danger'
            onClick={cancelOrderHandler}
            disabled={cancelLoading}
          >
            {cancelLoading ? (
              <Spinner animation='border' size='sm' />
            ) : (
              'Yes, Cancel Order'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Page header ──────────────────────────────────── */}
      <div className='d-flex justify-content-between align-items-center mb-1'>
        <h2 style={{ color: 'var(--oxford-blue)' }}>
          {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Confirmed'}
        </h2>
        {canCancel && (
          <Button
            variant='outline-danger'
            size='sm'
            onClick={() => setShowModal(true)}
          >
            Cancel Order
          </Button>
        )}
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Order ID:{' '}
        <span style={{ fontFamily: 'Courier New' }}>{order._id}</span>
      </p>

      {order.status === 'cancelled' && (
        <Alert variant='danger' className='mb-3'>
          This order has been cancelled. If you have any questions please
          contact support.
        </Alert>
      )}

      <Row>
        {/* ── LEFT — Order details ──────────────────────── */}
        <Col md={8}>
          <ListGroup variant='flush'>

            {/* Shipping */}
            <ListGroup.Item style={{ borderColor: '#EAE0D5', paddingBottom: '1.2rem' }}>
              <h4 style={{ color: 'var(--oxford-blue)' }}>Shipping</h4>
              <p className='mb-1' style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Name: </strong>
                {order.user.name}
              </p>
              <p className='mb-1' style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Email: </strong>
                {order.user.email}
              </p>
              <p className='mb-2' style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Address: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Badge style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)' }}>
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                </Badge>
              ) : order.status === 'cancelled' ? (
                <Badge bg='danger'>Cancelled</Badge>
              ) : (
                <Badge bg='warning' text='dark'>Not Yet Delivered</Badge>
              )}
            </ListGroup.Item>

            {/* Payment */}
            <ListGroup.Item style={{ borderColor: '#EAE0D5', paddingBottom: '1.2rem' }}>
              <h4 style={{ color: 'var(--oxford-blue)' }}>Payment</h4>
              <p className='mb-2' style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Badge style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)' }}>
                  Paid on {new Date(order.paidAt).toLocaleDateString()}
                </Badge>
              ) : order.status === 'cancelled' ? (
                <Badge bg='danger'>Cancelled</Badge>
              ) : (
                <Badge bg='warning' text='dark'>Not Yet Paid</Badge>
              )}
            </ListGroup.Item>

            {/* Order items */}
            <ListGroup.Item style={{ borderColor: '#EAE0D5' }}>
              <h4 style={{ color: 'var(--oxford-blue)' }}>Order Items</h4>
              <ListGroup variant='flush'>
                {order.orderItems.map((item, index) => (
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
                          style={{ color: 'var(--oxford-blue)', fontWeight: 500 }}
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
            </ListGroup.Item>

          </ListGroup>
        </Col>

        {/* ── RIGHT — Order summary ─────────────────────── */}
        <Col md={4}>
          <Card style={{ border: '1px solid #EAE0D5' }}>
            <ListGroup variant='flush'>
              <ListGroup.Item style={{ backgroundColor: 'var(--oxford-blue)' }}>
                <h4 style={{ color: 'var(--tan)', margin: 0 }}>Order Summary</h4>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col style={{ color: 'var(--text-muted)' }}>Items:</Col>
                  <Col className='product-card-price'>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col style={{ color: 'var(--text-muted)' }}>Shipping:</Col>
                  <Col className='product-card-price'>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col style={{ color: 'var(--text-muted)' }}>VAT (16%):</Col>
                  <Col className='product-card-price'>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item style={{ borderTop: '2px solid var(--tan)', paddingTop: '1rem' }}>
                <Row>
                  <Col style={{ color: 'var(--oxford-blue)', fontWeight: 700 }}>Total:</Col>
                  <Col className='product-card-price' style={{ fontSize: '1.2rem' }}>
                    ${order.totalPrice}
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                {order.status === 'cancelled' ? (
                  <Alert variant='danger' style={{ marginBottom: 0 }}>
                    This order has been cancelled.
                  </Alert>
                ) : (
                  <Alert style={{
                    backgroundColor: 'var(--tan-light)',
                    borderColor: 'var(--tan)',
                    color: 'var(--oxford-blue)',
                    fontSize: '0.85rem',
                    marginBottom: 0,
                  }}>
                    Payment integration coming soon. Your order has been
                    received and is being processed.
                  </Alert>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Card>

          <div className='mt-3 text-center'>
            <Link to='/' className='btn btn-dark w-100'>
              Continue Shopping
            </Link>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default OrderPage;