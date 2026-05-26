// frontend/src/pages/ProfilePage.jsx
// ─────────────────────────────────────────────────────────────
// Profile page — lets the user update their details and
// view their order history.
//
// New fields added: phone, county, accountType,
//                   businessName, businessType
//
// Error handling: dual system
//   1. Inline Alert at top of form (stays visible)
//   2. Toast notification bottom-right (auto-dismisses)
// Both fire together on every error and success.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row, Col, Form, Button,
  Card, Table, Alert, Spinner, Badge,
} from 'react-bootstrap';
import axios from 'axios';
import { login } from '../redux/slices/authSlice';
import { showToast } from '../components/Toast/Toast';

// ── All 47 Kenya counties ─────────────────────────────────────
const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot',
];

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  // ── Page title ─────────────────────────────────────────────
  useEffect(() => { document.title = 'Profile — ShopZone'; }, []);

  // ── Form field state ──────────────────────────────────────
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [accountType, setAccountType] = useState('individual');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── UI state ──────────────────────────────────────────────
  // message     — inline error shown in the Alert div
  // success     — inline success shown in the Alert div
  // Both also fire a toast at the same time.
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // ── Orders state ──────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // ── Redirect if not logged in ─────────────────────────────
  // Pre-fill form with existing user data when the page loads.
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      // Pre-fill all fields from stored userInfo
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setPhone(userInfo.phone || '');
      setCounty(userInfo.county || '');
      setAccountType(userInfo.accountType || 'individual');
      setBusinessName(userInfo.businessName || '');
      setBusinessType(userInfo.businessType || '');
      fetchOrders();
    }
  }, [userInfo, navigate]);

  // ── Fetch user's order history ────────────────────────────
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.get('/api/orders/myorders', config);
      setOrders(data);
      setOrdersLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setOrdersError(msg);
      setOrdersLoading(false);
    }
  };

  // ── Helper: fire both inline alert AND toast for errors ───
  const showError = (msg) => {
    setMessage(msg);
    showToast(msg, 'error');
  };

  // ── Helper: fire both inline success AND toast ────────────
  const showSuccess = (msg) => {
    setSuccess(true);
    showToast(msg, 'success');
  };

  // ── Submit handler — update profile ───────────────────────
  const submitHandler = async (e) => {
    e.preventDefault();
    // Clear previous messages on each new attempt
    setMessage(null);
    setSuccess(false);

    // Passwords must match if a new one was entered
    if (password && password !== confirmPassword) {
      return showError('Passwords do not match.');
    }

    // Business name required for business accounts
    if (accountType === 'business' && !businessName.trim()) {
      return showError('Please enter your business name.');
    }

    try {
      setUpdateLoading(true);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Send all updated fields to the backend
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          phone,
          county,
          accountType,
          businessName: accountType === 'business' ? businessName : '',
          businessType: accountType === 'business' ? businessType : '',
          // Only send password if a new one was entered
          ...(password && { password }),
        },
        config
      );

      // Update Redux auth state with the new user data
      // so the navbar and other components reflect the changes
      dispatch(login.fulfilled(data, '', {}));

      // Clear password fields after successful update
      setPassword('');
      setConfirmPassword('');
      setUpdateLoading(false);

      // Fire both the inline success alert and the toast
      showSuccess('Profile updated successfully!');

    } catch (err) {
      setUpdateLoading(false);
      showError(err.response?.data?.message || err.message);
    }
  };

  return (
    <Row>

      {/* ════════════════════════════════════════════════════
          LEFT COLUMN — Profile update form
      ════════════════════════════════════════════════════ */}
      <Col md={4}>
        <Card className='p-4 shadow-sm'>
          <h2 style={{ color: 'var(--oxford-blue)' }} className='mb-4'>
            My Profile
          </h2>

          {/* ── Inline error alert — stays visible ────────── */}
          {message && (
            <Alert variant='danger'>{message}</Alert>
          )}

          {/* ── Inline success alert — stays visible ──────── */}
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

            {/* ── Account type — read-only display ─────────── */}
            {/* User cannot change account type after registration */}
            <div
              className='mb-4'
              style={{
                background: '#f7f4ef',
                border: '1px solid #EAE0D5',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
              }}
            >
              <small style={{
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
              }}>
                Account Type
              </small>
              <p style={{ margin: '4px 0 0', color: 'var(--oxford-blue)', fontWeight: 600 }}>
                {accountType === 'business' ? '🏢 Business Account' : '👤 Individual Buyer'}
              </p>
            </div>

            {/* ── Business details — only for business accounts ── */}
            {accountType === 'business' && (
              <div
                style={{
                  background: '#f7f4ef',
                  border: '1px solid #EAE0D5',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <p style={{
                  color: 'var(--oxford-blue)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.75rem',
                }}>
                  Business Details
                </p>

                {/* Business name */}
                <Form.Group className='mb-3'>
                  <Form.Label>Business Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Your business name'
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </Form.Group>

                {/* Business type */}
                <Form.Group>
                  <Form.Label>Business Type</Form.Label>
                  <Form.Select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  >
                    <option value=''>Select business type...</option>
                    <option value='Retailer'>Retailer</option>
                    <option value='Wholesaler'>Wholesaler</option>
                    <option value='Distributor'>Distributor</option>
                    <option value='Other'>Other</option>
                  </Form.Select>
                </Form.Group>
              </div>
            )}

            {/* ── Full name ─────────────────────────────────── */}
            <Form.Group className='mb-3'>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            {/* ── Email ─────────────────────────────────────── */}
            <Form.Group className='mb-3'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {/* ── Phone ─────────────────────────────────────── */}
            <Form.Group className='mb-3'>
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type='tel'
                placeholder='0712 345 678'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Form.Text style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Used for M-Pesa and delivery updates
              </Form.Text>
            </Form.Group>

            {/* ── County ────────────────────────────────────── */}
            <Form.Group className='mb-3'>
              <Form.Label>County</Form.Label>
              <Form.Select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              >
                <option value=''>Select county...</option>
                {KENYA_COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* ── New password ──────────────────────────────── */}
            <Form.Group className='mb-3'>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Leave blank to keep current'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            {/* ── Confirm new password ──────────────────────── */}
            <Form.Group className='mb-3'>
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Confirm new password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {/* Live mismatch warning */}
              {confirmPassword && password !== confirmPassword && (
                <Form.Text style={{ color: '#c0392b', fontSize: '0.82rem' }}>
                  Passwords do not match
                </Form.Text>
              )}
            </Form.Group>

            {/* ── Submit button ─────────────────────────────── */}
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

      {/* ════════════════════════════════════════════════════
          RIGHT COLUMN — Order history table
      ════════════════════════════════════════════════════ */}
      <Col md={8}>
        <Card className='p-4 shadow-sm'>
          <h2 style={{ color: 'var(--oxford-blue)' }} className='mb-4'>
            My Orders
          </h2>

          {/* Loading spinner */}
          {ordersLoading ? (
            <div className='text-center py-4'>
              <Spinner animation='border' style={{ color: 'var(--oxford-blue)' }} />
            </div>

            /* Error loading orders */
          ) : ordersError ? (
            <Alert variant='danger'>{ordersError}</Alert>

            /* No orders yet */
          ) : orders.length === 0 ? (
            <Alert style={{
              backgroundColor: 'var(--tan-light)',
              borderColor: 'var(--tan)',
              color: 'var(--oxford-blue)',
            }}>
              You have no orders yet.{' '}
              <Link to='/' style={{ color: 'var(--oxford-blue)', fontWeight: 600 }}>
                Start Shopping
              </Link>
            </Alert>

            /* Orders table */
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

                    {/* Order ID — monospace for readability */}
                    <td style={{ fontFamily: 'Courier New', fontSize: '0.75rem' }}>
                      {order._id}
                    </td>

                    {/* Order date */}
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>

                    {/* Total price */}
                    <td className='product-card-price'>${order.totalPrice}</td>

                    {/* Paid status */}
                    <td>
                      {order.status === 'cancelled' ? (
                        <Badge bg='danger'>Cancelled</Badge>
                      ) : order.isPaid ? (
                        <Badge style={{
                          backgroundColor: 'var(--oxford-blue)',
                          color: 'var(--tan)',
                        }}>
                          {new Date(order.paidAt).toLocaleDateString()}
                        </Badge>
                      ) : (
                        <Badge bg='warning' text='dark'>Pending</Badge>
                      )}
                    </td>

                    {/* Delivered status */}
                    <td>
                      {order.status === 'cancelled' ? (
                        <Badge bg='danger'>Cancelled</Badge>
                      ) : order.isDelivered ? (
                        <Badge style={{
                          backgroundColor: 'var(--oxford-blue)',
                          color: 'var(--tan)',
                        }}>
                          {new Date(order.deliveredAt).toLocaleDateString()}
                        </Badge>
                      ) : (
                        <Badge bg='warning' text='dark'>Pending</Badge>
                      )}
                    </td>

                    {/* Details link */}
                    <td>
                      <Link to={`/order/${order._id}`} className='btn btn-sm btn-dark'>
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