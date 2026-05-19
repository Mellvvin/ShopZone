// frontend/src/pages/AdminOrderListPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page — lists all orders with mark as delivered action.
// Toasts added for: order marked as delivered, errors.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Table, Button, Alert,
  Spinner, Badge, Modal,
} from 'react-bootstrap';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';

const AdminOrderListPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [delivering, setDelivering] = useState(false);

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [userInfo, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.get('/api/orders', config);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
      setLoading(false);
    }
  };

  const confirmDeliver = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const deliverHandler = async () => {
    try {
      setDelivering(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.put(`/api/orders/${selectedOrder._id}/deliver`, {}, config);
      setShowModal(false);
      setDelivering(false);
      // Both inline and toast
      showToast(`Order ...${selectedOrder._id.slice(-8)} marked as delivered.`, 'success');
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
      setDelivering(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* ── Confirm Deliver Modal ─────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header style={{ backgroundColor: 'var(--oxford-blue)' }}>
          <Modal.Title style={{ color: 'var(--tan)' }}>Mark as Delivered</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p>Mark this order as delivered?</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Order ID:{' '}
                <span style={{ fontFamily: 'Courier New' }}>...{selectedOrder._id.slice(-8)}</span>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Customer: {selectedOrder.user?.name}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Total: ${selectedOrder.totalPrice}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='light'
            onClick={() => setShowModal(false)}
            style={{ borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}
          >
            Cancel
          </Button>
          <Button variant='dark' onClick={deliverHandler} disabled={delivering}>
            {delivering ? <Spinner animation='border' size='sm' /> : 'Yes, Mark Delivered'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Page header ──────────────────────────────────── */}
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2 style={{ color: 'var(--oxford-blue)' }} className='page-title'>
          All Orders
        </h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {orders.length} total orders
        </span>
      </div>

      {error && <Alert variant='danger'>{error}</Alert>}

      {loading ? (
        <div className='text-center py-5'>
          <Spinner animation='border' style={{ color: 'var(--oxford-blue)' }} />
        </div>
      ) : orders.length === 0 ? (
        <Alert style={{ backgroundColor: 'var(--tan-light)', borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}>
          No orders yet.
        </Alert>
      ) : (
        <Table responsive hover style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)' }}>
              <th>ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Delivery</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order._id}
                style={{ backgroundColor: index % 2 === 0 ? 'white' : '#FAFAF9', verticalAlign: 'middle' }}
              >
                <td style={{ fontFamily: 'Courier New', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  ...{order._id.slice(-8)}
                </td>
                <td style={{ color: 'var(--oxford-blue)', fontWeight: 500 }}>
                  {order.user ? order.user.name : 'Deleted User'}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {order.user?.email}
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className='product-card-price'>${order.totalPrice}</td>
                <td>
                  {order.isPaid ? (
                    <Badge style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)', fontSize: '0.72rem' }}>Paid</Badge>
                  ) : (
                    <Badge bg='warning' text='dark' style={{ fontSize: '0.72rem' }}>Unpaid</Badge>
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    <Badge style={{ backgroundColor: 'green', color: 'white', fontSize: '0.72rem' }}>Delivered</Badge>
                  ) : order.status === 'cancelled' ? (
                    <Badge bg='danger' style={{ fontSize: '0.72rem' }}>Cancelled</Badge>
                  ) : (
                    <Badge bg='warning' text='dark' style={{ fontSize: '0.72rem' }}>Pending</Badge>
                  )}
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: order.status === 'cancelled' ? '#C00000' : 'var(--text-muted)', textTransform: 'capitalize', fontWeight: order.status === 'cancelled' ? 600 : 400 }}>
                    {order.status || 'pending'}
                  </span>
                </td>
                <td>
                  <div className='d-flex gap-2'>
                    <Link
                      to={`/order/${order._id}`}
                      className='btn btn-sm'
                      style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      View
                    </Link>
                    {!order.isDelivered && order.status !== 'cancelled' && (
                      <Button
                        size='sm'
                        variant='success'
                        onClick={() => confirmDeliver(order)}
                        style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                      >
                        Deliver
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default AdminOrderListPage;