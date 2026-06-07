// frontend/src/pages/SellerDashboardPage.jsx
// ─────────────────────────────────────────────────────────────
// Seller dashboard — private portal for approved sellers only.
// Redirects non-sellers to the homepage with a clear message.
//
// Sections:
//   Overview stats strip — products, orders, fulfilled, payouts
//   My Products tab      — products assigned to this seller
//   My Orders tab        — orders containing this seller's products
//                          Customer identity always hidden.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Table } from 'react-bootstrap';
import { FaStore, FaBox, FaClipboardList, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import './SellerDashboardPage.css';

const SellerDashboardPage = () => {
  const navigate  = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // ── Access control ────────────────────────────────────────
  // Backend is the real guard — this is supplementary UX only.
  useEffect(() => {
    document.title = 'Seller Dashboard — ShopZone';
    if (!userInfo) {
      navigate('/login');
      return;
    }
    if (!userInfo.isSeller || userInfo.sellerStatus !== 'approved') {
      navigate('/');
    }
  }, [userInfo, navigate]);

  // ── State ─────────────────────────────────────────────────
const [activeTab,       setActiveTab]       = useState('overview');
  const [stats,           setStats]           = useState(null);
  const [products,        setProducts]        = useState([]);
  const [orders,          setOrders]          = useState([]);
  const [sellerProfile,   setSellerProfile]   = useState(null);
  const [profileSaving,   setProfileSaving]   = useState(false);
  const [profileSuccess,  setProfileSuccess]  = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);

  // ── Tier 2 quote form state ───────────────────────────────
  // Keyed by order ID so multiple quote forms can exist independently
  const [quoteFormOpen,   setQuoteFormOpen]   = useState({});  // { orderId: bool }
  const [quoteAmount,     setQuoteAmount]     = useState({});  // { orderId: string }
  const [quoteCourier,    setQuoteCourier]    = useState({});  // { orderId: string }
  const [quoteEtaDays,    setQuoteEtaDays]    = useState({});  // { orderId: string }
  const [quoteSubmitting, setQuoteSubmitting] = useState({});  // { orderId: bool }
  const [quoteSuccess,    setQuoteSuccess]    = useState({});  // { orderId: bool }

  // ── Seller profile form fields ────────────────────────────
  const [spBusinessName,    setSpBusinessName]    = useState('');
  const [spBusinessAddress, setSpBusinessAddress] = useState('');
  const [spDescription,     setSpDescription]     = useState('');
  const [spKraPin,          setSpKraPin]          = useState('');
  const [spMpesaNumber,     setSpMpesaNumber]     = useState('');

  // ── Auth config helper ────────────────────────────────────
  const config = {
    headers: { Authorization: `Bearer ${userInfo?.token}` },
  };

  // ── Fetch dashboard stats on mount ────────────────────────
  useEffect(() => {
    if (!userInfo?.isSeller) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/seller/dashboard', config);
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchStats();
  }, [userInfo]);

  // ── Fetch products when tab is active ─────────────────────
  useEffect(() => {
    if (activeTab !== 'products' || !userInfo?.isSeller) return;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/seller/products', config);
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab, userInfo]);

// ── Fetch seller profile when tab is active ───────────────
  useEffect(() => {
    if (activeTab !== 'profile' || !userInfo?.isSeller) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/seller/profile', config);
        setSellerProfile(data);
        // Seed form fields from fetched data
        setSpBusinessName(data.sellerProfile?.businessName    || '');
        setSpBusinessAddress(data.sellerProfile?.businessAddress || '');
        setSpDescription(data.sellerProfile?.description      || '');
        setSpKraPin(data.sellerProfile?.kraPin                 || '');
        setSpMpesaNumber(data.sellerProfile?.mpesaNumber       || '');
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [activeTab, userInfo]);

 // ── Submit Tier 2 delivery quote ──────────────────────────
  // Posts structured quote fields to the backend.
  // No free text — amount, courier, and days only.
  const submitQuote = async (orderId) => {
    try {
      setQuoteSubmitting((prev) => ({ ...prev, [orderId]: true }));
      await axios.put(
        `/api/orders/${orderId}/seller-quote/submit`,
        {
          amount:       Number(quoteAmount[orderId]),
          courier:      quoteCourier[orderId],
          estimatedDays:Number(quoteEtaDays[orderId]),
        },
        config
      );
      setQuoteSubmitting((prev) => ({ ...prev, [orderId]: false }));
      setQuoteSuccess((prev) => ({ ...prev, [orderId]: true }));
      setQuoteFormOpen((prev) => ({ ...prev, [orderId]: false }));
      // Refresh orders list so the submitted badge appears
      const { data } = await axios.get('/api/seller/orders', config);
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setQuoteSubmitting((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // ── Save seller profile ───────────────────────────────────
  const saveSellerProfile = async () => {
    try {
      setProfileSaving(true);
      setProfileSuccess(false);
      await axios.put('/api/seller/profile', {
        businessName:    spBusinessName,
        businessAddress: spBusinessAddress,
        description:     spDescription,
        kraPin:          spKraPin,
        mpesaNumber:     spMpesaNumber,
      }, config);
      setProfileSaving(false);
      setProfileSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setProfileSaving(false);
    }
  };

  // ── Fetch orders when tab is active ───────────────────────
  useEffect(() => {
    if (activeTab !== 'orders' || !userInfo?.isSeller) return;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/seller/orders', config);
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab, userInfo]);

  // ── Status badge helper ───────────────────────────────────
  const statusBadge = (status) => {
    const map = {
      pending:   { bg: 'warning', text: 'dark', label: 'Pending' },
      processing: { bg: 'info',   text: 'dark', label: 'Processing' },
      delivered: { bg: 'success', text: undefined, label: 'Delivered' },
      cancelled: { bg: 'danger',  text: undefined, label: 'Cancelled' },
    };
    const s = map[status] || { bg: 'secondary', label: status };
    return <Badge bg={s.bg} text={s.text}>{s.label}</Badge>;
  };

  if (!userInfo?.isSeller) return null;

  return (
    <div className='seller-dashboard'>
      {/* ── Hero strip ──────────────────────────────────── */}
      <div className='seller-hero'>
        <Container>
          <div className='seller-hero__inner'>
            <div className='seller-hero__avatar' aria-hidden='true'>
              {userInfo.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className='seller-hero__title'>Seller Dashboard</h1>
              <p className='seller-hero__sub'>
                Welcome back, {userInfo.name}. Manage your products and orders below.
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container className='seller-dashboard__body'>

        {error && <Alert variant='danger' className='mt-3'>{error}</Alert>}

        {/* ── Tab nav ───────────────────────────────────── */}
        <div className='seller-tabs'>
          {[
            { key: 'overview', label: 'Overview'   },
            { key: 'products', label: 'My Products' },
            { key: 'orders',   label: 'My Orders'   },
            { key: 'profile',  label: 'My Profile'  },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`seller-tab${activeTab === key ? ' seller-tab--active' : ''}`}
              onClick={() => setActiveTab(key)}
              aria-pressed={activeTab === key}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW TAB ══════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            {loading ? (
              <div className='text-center py-5'>
                <Spinner animation='border' style={{ color: 'var(--oxford-blue)' }} />
              </div>
            ) : stats ? (
              <Row className='seller-stats-row g-3 mt-2'>
                {[
                  { icon: FaStore,          label: 'My Products',     value: stats.totalProducts   },
                  { icon: FaClipboardList,  label: 'Total Orders',    value: stats.totalOrders     },
                  { icon: FaBox,            label: 'Pending Orders',  value: stats.pendingOrders   },
                  { icon: FaMoneyBillWave,  label: 'Payouts Released',value: stats.payoutReleased  },
                ].map(({ icon: Icon, label, value }) => (
                  <Col key={label} xs={6} md={3}>
                    <Card className='seller-stat-card text-center'>
                      <Card.Body>
                        <Icon className='seller-stat-card__icon' aria-hidden='true' />
                        <div className='seller-stat-card__value'>{value ?? 0}</div>
                        <div className='seller-stat-card__label'>{label}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : null}

            {/* Phase 1 info panel */}
            <Card className='seller-info-card mt-4'>
              <Card.Body>
                <h5 className='seller-info-card__title'>How ShopZone works for sellers</h5>
                <p className='seller-info-card__text'>
                  ShopZone manages all customer communication, delivery coordination, and payments on your behalf.
                  You focus on stock and fulfilment — ShopZone handles everything else.
                </p>
                <ul className='seller-info-card__list'>
                  <li>Products are listed under ShopZone branding — your business identity stays private.</li>
                  <li>You receive orders filtered to your products only — customer contact details are never shared.</li>
                  <li>Payouts are released by ShopZone admin after delivery is confirmed.</li>
                  <li>Price and stock updates on your products take effect on future orders only.</li>
                </ul>
              </Card.Body>
            </Card>
          </>
        )}

        {/* ══ PRODUCTS TAB ══════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className='mt-3'>
            {loading ? (
              <div className='text-center py-5'>
                <Spinner animation='border' style={{ color: 'var(--oxford-blue)' }} />
              </div>
            ) : products.length === 0 ? (
              <Alert variant='info'>No products assigned to your account yet. Contact ShopZone to submit products.</Alert>
            ) : (
              <Table responsive hover className='seller-table'>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price (KES)</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td className='seller-table__name'>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{Number(p.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                      <td>
                        <Badge bg={p.countInStock > 0 ? 'success' : 'danger'}>
                          {p.countInStock > 0 ? `${p.countInStock} units` : 'Out of stock'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={p.isFeatured ? 'primary' : 'secondary'}>
                          {p.isFeatured ? 'Featured' : 'Standard'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        )}

        {/* ══ ORDERS TAB ════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className='mt-3'>
            {loading ? (
              <div className='text-center py-5'>
                <Spinner animation='border' style={{ color: 'var(--oxford-blue)' }} />
              </div>
            ) : orders.length === 0 ? (
              <Alert variant='info'>No orders containing your products yet.</Alert>
            ) : (
             <Table responsive hover className='seller-table'>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Zone</th>
                    <th>Items</th>
                    <th>Paid</th>
                    <th>Status</th>
                    <th>Payout</th>
                    <th>Delivery Quote</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    // Tier 2 order that still needs a seller quote submitted
                    const needsQuote =
                      order.shippingTier === 'quote_required' &&
                      (!order.sellerQuote || order.sellerQuote.status !== 'submitted');
                    const quoteSubmitted =
                      order.sellerQuote?.status === 'submitted';
                    const isOpen = quoteFormOpen[order._id];

                    return (
                      <>
                        <tr key={order._id}>
                          <td className='seller-table__id'>{String(order._id).slice(-8)}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          {/* County only — never full address */}
                          <td>{order.deliveryCounty || order.shippingZone}</td>
                          <td>{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</td>
                          <td>
                            <Badge bg={order.isPaid ? 'success' : 'warning'} text={order.isPaid ? undefined : 'dark'}>
                              {order.isPaid ? 'Paid' : 'Unpaid'}
                            </Badge>
                          </td>
                          <td>{statusBadge(order.status)}</td>
                          <td>
                            <Badge bg={order.sellerPayoutReleased ? 'success' : 'secondary'}>
                              {order.sellerPayoutReleased ? 'Released' : 'Pending'}
                            </Badge>
                          </td>
                          <td>
                            {/* Only Tier 2 orders show this column */}
                            {quoteSubmitted && (
                              <Badge bg='success'>Quote Sent</Badge>
                            )}
                            {needsQuote && !isOpen && (
                              <button
                                className='seller-quote-btn'
                                onClick={() => setQuoteFormOpen((prev) => ({ ...prev, [order._id]: true }))}
                              >
                                Submit Quote
                              </button>
                            )}
                            {needsQuote && isOpen && (
                              <button
                                className='seller-quote-btn seller-quote-btn--cancel'
                                onClick={() => setQuoteFormOpen((prev) => ({ ...prev, [order._id]: false }))}
                              >
                                Cancel
                              </button>
                            )}
                            {!needsQuote && !quoteSubmitted && (
                              <span className='seller-table__muted'>—</span>
                            )}
                          </td>
                        </tr>

                        {/* ── Inline quote form row — only when open ── */}
                        {needsQuote && isOpen && (
                          <tr key={`${order._id}-quote`} className='seller-quote-form-row'>
                            <td colSpan={8}>
                              <div className='seller-quote-form'>
                                <p className='seller-quote-form__title'>
                                  Submit delivery quote for order {String(order._id).slice(-8)}
                                </p>
                                <div className='seller-quote-form__fields'>
                                  {/* Amount */}
                                  <div className='seller-quote-form__field'>
                                    <label className='seller-quote-form__label'>Amount (KES)</label>
                                    <input
                                      className='seller-quote-form__input'
                                      type='number'
                                      min='1'
                                      placeholder='e.g. 1500'
                                      value={quoteAmount[order._id] || ''}
                                      onChange={(e) => setQuoteAmount((prev) => ({ ...prev, [order._id]: e.target.value }))}
                                    />
                                  </div>
                                  {/* Courier — dropdown, no free text */}
                                  <div className='seller-quote-form__field'>
                                    <label className='seller-quote-form__label'>Courier</label>
                                    <select
                                      className='seller-quote-form__input'
                                      value={quoteCourier[order._id] || ''}
                                      onChange={(e) => setQuoteCourier((prev) => ({ ...prev, [order._id]: e.target.value }))}
                                    >
                                      <option value=''>Select courier</option>
                                      <option value='Sendy'>Sendy</option>
                                      <option value='Fargo'>Fargo</option>
                                      <option value='G4S'>G4S</option>
                                      <option value='Wells Fargo'>Wells Fargo</option>
                                      <option value='Own Transport'>Own Transport</option>
                                      <option value='Other'>Other</option>
                                    </select>
                                  </div>
                                  {/* Estimated days — number only */}
                                  <div className='seller-quote-form__field'>
                                    <label className='seller-quote-form__label'>Estimated Days</label>
                                    <input
                                      className='seller-quote-form__input'
                                      type='number'
                                      min='1'
                                      max='30'
                                      placeholder='e.g. 3'
                                      value={quoteEtaDays[order._id] || ''}
                                      onChange={(e) => setQuoteEtaDays((prev) => ({ ...prev, [order._id]: e.target.value }))}
                                    />
                                  </div>
                                </div>
                                <button
                                  className='seller-quote-form__submit'
                                  onClick={() => submitQuote(order._id)}
                                  disabled={
                                    quoteSubmitting[order._id] ||
                                    !quoteAmount[order._id] ||
                                    !quoteCourier[order._id] ||
                                    !quoteEtaDays[order._id]
                                  }
                                >
                                  {quoteSubmitting[order._id] ? 'Submitting...' : 'Submit to ShopZone'}
                                </button>
                                <p className='seller-quote-form__note'>
                                  ShopZone admin will review your quote before forwarding it to the buyer. Do not include phone numbers or contact details.
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </div>
        )}

   {/* ══ PROFILE TAB ═══════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className='mt-3'>
            {loading ? (
              <div className='text-center py-5'>
                <Spinner animation='border' style={{ color: 'var(--oxford-blue)' }} />
              </div>
            ) : (
              <Card className='seller-profile-card'>
                <Card.Body>
                  <h5 className='seller-info-card__title mb-3'>Business Profile</h5>

                  {profileSuccess && (
                    <Alert variant='success' className='mb-3'>Profile updated successfully.</Alert>
                  )}
                  {error && (
                    <Alert variant='danger' className='mb-3'>{error}</Alert>
                  )}

                  {/* Business name */}
                  <div className='seller-profile-field'>
                    <label className='seller-profile-label'>Business Name</label>
                    <input
                      className='seller-profile-input'
                      type='text'
                      value={spBusinessName}
                      onChange={(e) => setSpBusinessName(e.target.value)}
                      placeholder='Your registered business name'
                    />
                  </div>

                  {/* Business address */}
                  <div className='seller-profile-field'>
                    <label className='seller-profile-label'>Business Address</label>
                    <input
                      className='seller-profile-input'
                      type='text'
                      value={spBusinessAddress}
                      onChange={(e) => setSpBusinessAddress(e.target.value)}
                      placeholder='e.g. Stall 14, Kamukunji Market, Nairobi'
                    />
                  </div>

                  {/* Description */}
                  <div className='seller-profile-field'>
                    <label className='seller-profile-label'>Business Description</label>
                    <textarea
                      className='seller-profile-input seller-profile-textarea'
                      value={spDescription}
                      onChange={(e) => setSpDescription(e.target.value)}
                      placeholder='Brief description of what you supply'
                      rows={3}
                    />
                  </div>

                  {/* KRA PIN */}
                  <div className='seller-profile-field'>
                    <label className='seller-profile-label'>KRA PIN</label>
                    <input
                      className='seller-profile-input'
                      type='text'
                      value={spKraPin}
                      onChange={(e) => setSpKraPin(e.target.value)}
                      placeholder='e.g. A123456789B'
                    />
                    <span className='seller-profile-hint'>Used for invoice generation and tax compliance</span>
                  </div>

                  {/* M-Pesa number */}
                  <div className='seller-profile-field'>
                    <label className='seller-profile-label'>M-Pesa Payout Number</label>
                    <input
                      className='seller-profile-input'
                      type='tel'
                      value={spMpesaNumber}
                      onChange={(e) => setSpMpesaNumber(e.target.value)}
                      placeholder='e.g. 0712 345 678'
                    />
                    <span className='seller-profile-hint'>ShopZone releases payouts to this number after delivery confirmation</span>
                  </div>

                  <button
                    className='seller-profile-save-btn'
                    onClick={saveSellerProfile}
                    disabled={profileSaving}
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </Card.Body>
              </Card>
            )}
          </div>
        )}

      </Container>
    </div>
  );
};

export default SellerDashboardPage;