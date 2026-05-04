import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row, Col, Form, Button,
  Card, Table, Alert, Spinner, Badge
} from 'react-bootstrap';
import axios from 'axios';
import { login } from '../redux/slices/authSlice';

const ProfilePage = () => {
  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage]                 = useState(null);
  const [success, setSuccess]                 = useState(false);
  const [orders, setOrders]                   = useState([]);
  const [ordersLoading, setOrdersLoading]     = useState(true);
  const [ordersError, setOrdersError]         = useState(null);
  const [updateLoading, setUpdateLoading]     = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setName(userInfo.name);
      setEmail(userInfo.email);
      fetchOrders();
    }
  }, [userInfo, navigate]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('/api/orders/myorders', config);
      setOrders(data);
      setOrdersLoading(false);
    } catch (err) {
      setOrdersError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setOrdersLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      setUpdateLoading(true);
      setMessage(null);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.put(
        '/api/users/profile',
        { name, email, password },
        config
      );
      dispatch(login.fulfilled(data, '', {}));
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setUpdateLoading(false);
    } catch (err) {
      setMessage(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setUpdateLoading(false);
    }
  };

  return (
    <Row>
      {/* ── LEFT — Profile Form ── */}
      <Col md={4}>
        <Card className='p-4 shadow-sm'>
          <h2 style={{ color: 'var(--oxford-blue)' }} className='mb-4'>
            My Profile
          </h2>

          {message && <Alert variant='danger'>{message}</Alert>}
          {success && (
            <Alert style={{
              backgroundColor: 'var(--tan-light)',
              borderColor: 'var(--tan)',
              color: 'var(--oxford-blue)',
            }}>
              Profile updated successfully!
            </Alert>
          )}

          <Form onSubmit={submitHandler}>
            <Form.Group controlId='name' className='mb-3'>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId='email' className='mb-3'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId='password' className='mb-3'>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Leave blank to keep current'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId='confirmPassword' className='mb-3'>
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Confirm new password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button
              type='submit'
              variant='dark'
              className='w-100 mt-2'
              disabled={updateLoading}
            >
              {updateLoading ? (
                <Spinner animation='border' size='sm' />
              ) : (
                'Update Profile'
              )}
            </Button>
          </Form>
        </Card>
      </Col>

      {/* ── RIGHT — Order History ── */}
      <Col md={8}>
        <Card className='p-4 shadow-sm'>
          <h2 style={{ color: 'var(--oxford-blue)' }} className='mb-4'>
            My Orders
          </h2>

          {ordersLoading ? (
            <div className='text-center py-4'>
              <Spinner
                animation='border'
                style={{ color: 'var(--oxford-blue)' }}
              />
            </div>
          ) : ordersError ? (
            <Alert variant='danger'>{ordersError}</Alert>
          ) : orders.length === 0 ? (
            <Alert style={{
              backgroundColor: 'var(--tan-light)',
              borderColor: 'var(--tan)',
              color: 'var(--oxford-blue)',
            }}>
              You have no orders yet.{' '}
              <Link to='/' style={{ color: 'var(--oxford-blue)', fontWeight: '600' }}>
                Start Shopping
              </Link>
            </Alert>
          ) : (
            <Table responsive hover style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)' }}>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Delivered</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontFamily: 'Courier New', fontSize: '0.75rem' }}>
                      {order._id}
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className='product-card-price'>
                      ${order.totalPrice}
                    </td>
                    <td>
  {order.status === 'cancelled' ? (
    <Badge bg='danger'>Cancelled</Badge>
  ) : order.isPaid ? (
    <Badge style={{
      backgroundColor: 'var(--oxford-blue)',
      color: 'var(--tan)'
    }}>
      {new Date(order.paidAt).toLocaleDateString()}
    </Badge>
  ) : (
    <Badge bg='warning' text='dark'>Pending</Badge>
  )}
</td>
     <td>
  {order.status === 'cancelled' ? (
    <Badge bg='danger'>Cancelled</Badge>
  ) : order.isDelivered ? (
    <Badge style={{
      backgroundColor: 'var(--oxford-blue)',
      color: 'var(--tan)'
    }}>
      {new Date(order.deliveredAt).toLocaleDateString()}
    </Badge>
  ) : (
    <Badge bg='warning' text='dark'>Pending</Badge>
  )}
</td>
                    <td>
                      <Link
                        to={`/order/${order._id}`}
                        className='btn btn-sm btn-dark'
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ProfilePage;