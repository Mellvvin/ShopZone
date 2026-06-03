// frontend/src/pages/ProfilePage/ProfilePage.jsx
// ─────────────────────────────────────────────────────────────
// Profile page — all inline styles removed.
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
import './ProfilePage.css';

const KENYA_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa',"Murang'a",
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri','Samburu',
  'Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia','Turkana',
  'Uasin Gishu','Vihiga','Wajir','West Pokot',
];

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => { document.title = 'Profile — ShopZone'; }, []);

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [county, setCounty]           = useState('');
  const [accountType, setAccountType] = useState('individual');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage]         = useState(null);
  const [success, setSuccess]         = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

const [orders, setOrders]               = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError]     = useState(null);
  // ── Order filter tab ──────────────────────────────────
  // 'all' | 'active' | 'fulfilled' | 'cancelled'
  const [orderTab, setOrderTab] = useState('all');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
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

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders/myorders', config);
      setOrders(data);
      setOrdersLoading(false);
    } catch (err) {
      setOrdersError(err.response?.data?.message || err.message);
      setOrdersLoading(false);
    }
  };

  const showError   = (msg) => { setMessage(msg);    showToast(msg, 'error'); };
  const showSuccess = (msg) => { setSuccess(true);   showToast(msg, 'success'); };

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSuccess(false);
    if (password && password !== confirmPassword) return showError('Passwords do not match.');
    if (accountType === 'business' && !businessName.trim()) return showError('Please enter your business name.');
    try {
      setUpdateLoading(true);
      const config = {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.put('/api/users/profile', {
        name, email, phone, county, accountType,
        businessName: accountType === 'business' ? businessName : '',
        businessType: accountType === 'business' ? businessType : '',
        ...(password && { password }),
      }, config);
      dispatch(login.fulfilled(data, '', {}));
      setPassword('');
      setConfirmPassword('');
      setUpdateLoading(false);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      setUpdateLoading(false);
      showError(err.response?.data?.message || err.message);
    }
  };

  return (
    <Row>
      {/* ── Left — profile form ─────────────────────────── */}
      <Col md={4}>
        <Card className='p-4 shadow-sm'>
          <h2 className='profile-title mb-4'>My Profile</h2>

          {message && <Alert variant='danger'>{message}</Alert>}
          {success  && <Alert className='profile-success-alert'>Profile updated successfully!</Alert>}

          <Form onSubmit={submitHandler}>

            {/* Account type badge */}
            <div className='profile-account-type mb-4'>
              <small className='profile-account-type__label'>Account Type</small>
              <p className='profile-account-type__value'>
                {accountType === 'business' ? '🏢 Business Account' : '👤 Individual Buyer'}
              </p>
            </div>

            {/* Business details */}
            {accountType === 'business' && (
              <div className='profile-section-box mb-3'>
                <p className='profile-section-label'>Business Details</p>
                <Form.Group className='mb-3'>
                  <Form.Label>Business Name</Form.Label>
                  <Form.Control type='text' placeholder='Your business name' value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Business Type</Form.Label>
                  <Form.Select value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                    <option value=''>Select business type...</option>
                    <option value='Retailer'>Retailer</option>
                    <option value='Wholesaler'>Wholesaler</option>
                    <option value='Distributor'>Distributor</option>
                    <option value='Other'>Other</option>
                  </Form.Select>
                </Form.Group>
              </div>
            )}

            <Form.Group className='mb-3'>
              <Form.Label>Full Name</Form.Label>
              <Form.Control type='text' placeholder='Enter name' value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control type='email' placeholder='Enter email' value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type='tel' placeholder='0712 345 678' value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Form.Text className='profile-hint'>Used for M-Pesa and delivery updates</Form.Text>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>County</Form.Label>
              <Form.Select value={county} onChange={(e) => setCounty(e.target.value)}>
                <option value=''>Select county...</option>
                {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>New Password</Form.Label>
              <Form.Control type='password' placeholder='Leave blank to keep current' value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control type='password' placeholder='Confirm new password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              {confirmPassword && password !== confirmPassword && (
                <Form.Text className='profile-error-text'>Passwords do not match</Form.Text>
              )}
            </Form.Group>

            <Button type='submit' variant='dark' className='w-100 mt-2' disabled={updateLoading}>
              {updateLoading ? <Spinner animation='border' size='sm' /> : 'Update Profile'}
            </Button>

          </Form>
        </Card>
      </Col>

      {/* ── Right — order history ───────────────────────── */}
      <Col md={8}>
        <Card className='p-4 shadow-sm'>
          <h2 className='profile-title mb-4'>My Orders</h2>

          {/* ── Order filter tabs ─────────────────────────── */}
          {!ordersLoading && !ordersError && orders.length > 0 && (
            <div className='profile-order-tabs'>
              {[
                { key: 'all',       label: 'All',       count: orders.length },
                { key: 'active',    label: 'Active',    count: orders.filter(o => o.status !== 'cancelled' && !o.isDelivered).length },
                { key: 'fulfilled', label: 'Fulfilled', count: orders.filter(o => o.isDelivered && o.isPaid).length },
                { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  className={`profile-order-tab${orderTab === key ? ' profile-order-tab--active' : ''}`}
                  onClick={() => setOrderTab(key)}
                  aria-pressed={orderTab === key}
                >
                  {label}
                  <span className={`profile-order-tab__count${key === 'cancelled' && count > 0 ? ' profile-order-tab__count--cancelled' : ''}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {ordersLoading ? (
            <div className='text-center py-4'><Spinner animation='border' className='profile-spinner' /></div>
          ) : ordersError ? (
            <Alert variant='danger'>{ordersError}</Alert>
          ) : orders.length === 0 ? (
            <Alert className='profile-empty-alert'>
              You have no orders yet.{' '}
              <Link to='/' className='profile-link'>Start Shopping</Link>
            </Alert>
          ) : (
            <>
              {/* Filtered empty state */}
              {(() => {
                const filtered = orders.filter(o => {
                  if (orderTab === 'active')    return o.status !== 'cancelled' && !o.isDelivered;
                  if (orderTab === 'fulfilled') return o.isDelivered && o.isPaid;
                  if (orderTab === 'cancelled') return o.status === 'cancelled';
                  return true;
                });
                if (filtered.length === 0) {
                  return (
                    <Alert className='profile-empty-alert'>
                      No {orderTab} orders found.
                    </Alert>
                  );
                }
                return (
                  <Table responsive hover className='profile-orders-table'>
                    <thead>
                      <tr className='profile-thead-row'>
                        <th>ID</th><th>Date</th><th>Total</th><th>Paid</th><th>Delivered</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((order) => (
                  <tr key={order._id}>
                    <td className='profile-id-cell'>{order._id}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className='product-card-price'>
                      KES {Number(order.totalPrice).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {order.status === 'cancelled' ? (
                        <Badge bg='danger'>Cancelled</Badge>
                      ) : order.isPaid ? (
                        <Badge className='profile-badge--paid'>{new Date(order.paidAt).toLocaleDateString()}</Badge>
                      ) : (
                        <Badge bg='warning' text='dark'>Pending</Badge>
                      )}
                    </td>
                    <td>
                      {order.status === 'cancelled' ? (
                        <Badge bg='danger'>Cancelled</Badge>
                      ) : order.isDelivered ? (
                        <Badge className='profile-badge--paid'>{new Date(order.deliveredAt).toLocaleDateString()}</Badge>
                      ) : (
                        <Badge bg='warning' text='dark'>Pending</Badge>
                      )}
                    </td>
                    <td>
                      <Link to={`/order/${order._id}`} className='btn btn-sm btn-dark'>Details</Link>
                    </td>
                 </tr>
                    ))}
                  </tbody>
                </Table>
                );
              })()}
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ProfilePage;