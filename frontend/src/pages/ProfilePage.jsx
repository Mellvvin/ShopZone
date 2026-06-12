// frontend/src/pages/ProfilePage/ProfilePage.jsx
// ─────────────────────────────────────────────────────────────
// Profile page — account settings + order history.
// Left column: avatar, stats, grouped edit form with collapsible password section.
// Right column: order history with four filter tabs — untouched from previous build.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row, Col, Form, Button,
  Card, Table, Alert, Spinner, Badge,
} from 'react-bootstrap';
import { FaUserCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import axios from 'axios';
import { login, setCredentials } from '../redux/slices/authSlice';
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
 // ── Delivery address fields ───────────────────────────────
  const [shipAddress,   setShipAddress]   = useState('');
  const [shipApartment, setShipApartment] = useState('');
  const [shipCity,      setShipCity]      = useState('');
  const [shipCountry,   setShipCountry]   = useState('Kenya');

const [message,       setMessage]       = useState(null);
  const [success,       setSuccess]       = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  // Controls whether the Delivery Info section is expanded
  const [showDelivery,  setShowDelivery]  = useState(false);
  // Controls the save-changes confirmation modal
  const [showConfirm,   setShowConfirm]   = useState(false);

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
      // Seed delivery address from saved profile
      const sa = userInfo.shippingAddress || {};
      setShipAddress(sa.address || '');
      setShipApartment(sa.apartment || '');
      setShipCity(sa.city || '');
      setShipCountry(sa.country || 'Kenya');
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

 const showError   = (msg) => { setMessage(msg);  showToast(msg, 'error'); };
  const showSuccess = (msg) => { setSuccess(true); showToast(msg, 'success'); };

  // ── Step 1: form submit — validate then open confirm modal ──
  const submitHandler = (e) => {
    e.preventDefault();
    setMessage(null);
    setSuccess(false);
    // Validate before showing the modal
    if (accountType === 'business' && !businessName.trim()) {
      return showError('Please enter your business name.');
    }
    setShowConfirm(true);
  };

  // ── Step 2: user confirmed — run the actual API call ────────
  const confirmSave = async () => {
    setShowConfirm(false);
    try {
      setUpdateLoading(true);
      const config = {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.put('/api/users/profile', {
        name,
        email,
        phone,
        county,
        accountType,
        businessName: accountType === 'business' ? businessName : '',
        businessType: accountType === 'business' ? businessType : '',
        // Save the full delivery address as a sub-object
        shippingAddress: {
          address:   shipAddress,
          apartment: shipApartment,
          city:      shipCity,
          county:    county,
          country:   shipCountry,
        },
      }, config);
      // Sync updated user data to Redux state and localStorage
    dispatch(setCredentials(data));
      setUpdateLoading(false);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      setUpdateLoading(false);
      showError(err.response?.data?.message || err.message);
    }
  };

  return (
    <Row>
   {/* ── Left — profile card ─────────────────────────── */}
      <Col md={4}>
        <Card className='profile-card shadow-sm'>

          {/* ── Avatar + identity strip ──────────────────── */}
          <div className='profile-avatar-zone'>
            {/* Initials circle */}
            <div className='profile-avatar-circle' aria-hidden='true'>
              {name ? name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : <FaUserCircle />}
            </div>
            <h2 className='profile-display-name'>{name || 'Your Account'}</h2>
            {/* Account type pill badge */}
            <span className={`profile-type-badge ${accountType === 'business' ? 'profile-type-badge--business' : 'profile-type-badge--individual'}`}>
              {accountType === 'business' ? 'Business Account' : 'Individual Buyer'}
            </span>
            {/* Member since */}
            {userInfo?.createdAt && (
              <p className='profile-member-since'>
                Member since {new Date(userInfo.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
              </p>
            )}
            {/* Quick stats */}
            <div className='profile-stats-row'>
              <div className='profile-stat'>
                <span className='profile-stat__num'>{orders.length}</span>
                <span className='profile-stat__label'>Orders</span>
              </div>
              <div className='profile-stat-divider' aria-hidden='true' />
              <div className='profile-stat'>
                <span className='profile-stat__num'>
                  {orders.filter(o => o.isDelivered).length}
                </span>
                <span className='profile-stat__label'>Fulfilled</span>
              </div>
              <div className='profile-stat-divider' aria-hidden='true' />
              <div className='profile-stat'>
                <span className='profile-stat__num'>
                  KES {orders.reduce((sum, o) => sum + (o.isPaid ? Number(o.totalPrice) : 0), 0)
                    .toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className='profile-stat__label'>Total Spent</span>
              </div>
            </div>
          </div>

          {/* ── Edit form ────────────────────────────────── */}
          <div className='profile-form-zone'>
            {message && <Alert variant='danger' className='mb-3'>{message}</Alert>}
            {success  && <Alert className='profile-success-alert mb-3'>Profile updated successfully!</Alert>}

            <Form onSubmit={submitHandler}>

              {/* ── Section: Personal Info ─────────────────── */}
              <p className='profile-section-header'>Personal Info</p>

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

              {/* ── Section: Delivery Info ─────────────────── */}
              {/* Collapsible — same pattern as Security was */}
              <div className='profile-section-header profile-section-header--spaced profile-security-toggle'
                   onClick={() => setShowDelivery(v => !v)}
                   role='button'
                   tabIndex={0}
                   aria-expanded={showDelivery}
                   onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowDelivery(v => !v)}>
                Delivery Info
                <span className='profile-security-chevron'>
                  {showDelivery ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </span>
              </div>

              {showDelivery && (
                <div className='profile-password-fields'>

                  {/* Account type — moved into delivery section */}
                  <Form.Group className='mb-3'>
                    <Form.Label>Account Type</Form.Label>
                    <Form.Select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                      <option value='individual'>Individual Buyer</option>
                      <option value='business'>Business Account</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Business fields — only when business is selected */}
                  {accountType === 'business' && (
                    <>
                      <Form.Group className='mb-3'>
                        <Form.Label>Business Name</Form.Label>
                        <Form.Control type='text' placeholder='Your business name' value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                      </Form.Group>
                      <Form.Group className='mb-3'>
                        <Form.Label>Business Type</Form.Label>
                        <Form.Select value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                          <option value=''>Select business type...</option>
                          <option value='Retailer'>Retailer</option>
                          <option value='Wholesaler'>Wholesaler</option>
                          <option value='Distributor'>Distributor</option>
                          <option value='Other'>Other</option>
                        </Form.Select>
                      </Form.Group>
                    </>
                  )}

                  <Form.Group className='mb-3'>
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='e.g. 14 Moi Avenue, CBD'
                      value={shipAddress}
                      onChange={(e) => setShipAddress(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className='mb-3'>
                    <Form.Label>Apartment / Building <span className='profile-hint'>(optional)</span></Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='e.g. Apt 3B, Delta House'
                      value={shipApartment}
                      onChange={(e) => setShipApartment(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className='mb-3'>
                    <Form.Label>Town / City</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='e.g. Nairobi'
                      value={shipCity}
                      onChange={(e) => setShipCity(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className='mb-3'>
                    <Form.Label>County</Form.Label>
                    <Form.Select value={county} onChange={(e) => setCounty(e.target.value)}>
                      {!county && <option value=''>Select county...</option>}
                      {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className='mb-3'>
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type='text'
                      className='profile-readonly-field'
                      value={shipCountry}
                      readOnly
                    />
                  </Form.Group>

                </div>
              )}

              {/* ── Section: Security ─────────────────────── */}
              {/* Password change is handled via the reset flow — not inline */}
              <p className='profile-section-header profile-section-header--spaced'>Security</p>
              <div className='profile-password-info'>
                <p className='profile-password-info__text'>
                  To change your password, use the password reset flow. A link will be sent to your registered email address.
                </p>
                <Link to='/forgot-password' className='profile-password-info__link'>
                  Change password via email
                </Link>
              </div>

              <Button type='submit' className='profile-save-btn w-100 mt-3' disabled={updateLoading}>
                {updateLoading ? <Spinner animation='border' size='sm' /> : 'Save Changes'}
              </Button>

            </Form>
          </div>
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
                      <div className='profile-order-actions'>
                        <Link to={`/order/${order._id}`} className='btn btn-sm btn-dark'>
                          Details
                        </Link>
                        {/* Report Issue — only for active and delivered orders, not cancelled */}
                        {order.status !== 'cancelled' && (
                          <Link
                            to={`/order/${order._id}#report`}
                            className='profile-report-link'
                          >
                            Report Issue
                          </Link>
                        )}
                      </div>
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
  {/* ── Save changes confirmation modal ─────────────── */}
      <ConfirmModal
        show={showConfirm}
        onConfirm={confirmSave}
        onCancel={() => setShowConfirm(false)}
        title='Save Profile Changes'
        message='Are you sure you want to update your profile? Your name, contact details, and delivery address will be saved.'
        confirmLabel='Save Changes'
        confirmVariant='primary-branded'
      />
    </Row>
  );
};

export default ProfilePage;