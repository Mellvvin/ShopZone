// frontend/src/pages/AdminUserDetailPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin User Detail page — shows everything about a single user.
//
// Reached by clicking any row on AdminUserListPage or
// AdminSellersPage. Serves both regular users and sellers —
// when the user is a seller the seller section is shown
// prominently with approve/suspend/reinstate action buttons.
//
// Sections:
//   1. Header — back button, account info, seller section
//   2. Orders as buyer
//   3. Products as seller (empty for non-sellers)
//   4. Enquiries submitted
//   5. Notifications received
//
// Backend: GET /api/users/:id/full-profile (admin only)
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import { formatDateTime as formatNairobiDateTime, formatDateShort } from '../utils/formatDateTime';
import {
    FaArrowLeft, FaUser, FaStore, FaBoxOpen,
    FaClipboardList, FaEnvelope, FaBell,
    FaCheckCircle, FaTimesCircle, FaClock,
    FaBan, FaExclamationTriangle, FaCalendar,
    FaPhone, FaMapMarkerAlt, FaBriefcase,
    FaShieldAlt, FaTag,
} from 'react-icons/fa';
import './AdminUserDetailPage.css';

// ── Helpers ───────────────────────────────────────────────────
const formatKES = (n) =>
    `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

// formatDate and formatDateTime are now thin aliases over the shared
// Africa/Nairobi formatter (ISS-015). Every existing call site below
// this line stays unchanged — both names just no longer depend on
// the viewing device's system timezone.
const formatDate = formatDateShort;
const formatDateTime = formatNairobiDateTime;

// ── Status badge configs ──────────────────────────────────────
const ORDER_STATUS = {
    pending:    { label: 'Pending',    cls: 'aud-badge--pending' },
    processing: { label: 'Processing', cls: 'aud-badge--processing' },
    dispatched: { label: 'Dispatched', cls: 'aud-badge--dispatched' },
    delivered:  { label: 'Delivered',  cls: 'aud-badge--delivered' },
    cancelled:  { label: 'Cancelled',  cls: 'aud-badge--cancelled' },
};

const SELLER_STATUS = {
    pending:   { label: 'Pending',   cls: 'aud-seller-status--pending',   icon: FaClock },
    approved:  { label: 'Approved',  cls: 'aud-seller-status--approved',  icon: FaCheckCircle },
    suspended: { label: 'Suspended', cls: 'aud-seller-status--suspended', icon: FaBan },
    rejected:  { label: 'Rejected',  cls: 'aud-seller-status--rejected',  icon: FaTimesCircle },
    none:      { label: 'None',      cls: 'aud-seller-status--none',      icon: FaUser },
};

const ENQUIRY_TYPE = {
    bulk_order:          { label: 'Bulk Order',         cls: 'aud-enq-type--bulk' },
    seller_application:  { label: 'Seller Application', cls: 'aud-enq-type--seller' },
    contact:             { label: 'Contact',            cls: 'aud-enq-type--contact' },
    general:             { label: 'General',            cls: 'aud-enq-type--general' },
    support:             { label: 'Support',            cls: 'aud-enq-type--support' },
};

const ENQUIRY_STATUS = {
    new:      { label: 'New',      cls: 'aud-enq-status--new' },
    read:     { label: 'Read',     cls: 'aud-enq-status--read' },
    actioned: { label: 'Actioned', cls: 'aud-enq-status--actioned' },
    closed:   { label: 'Closed',   cls: 'aud-enq-status--closed' },
};

// ─────────────────────────────────────────────────────────────
// AdminUserDetailPage component
// ─────────────────────────────────────────────────────────────
const AdminUserDetailPage = () => {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => { document.title = 'Admin: User Profile — ShopZone'; }, []);

    // ── Data state ────────────────────────────────────────────
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    // ── Expanded enquiry row — stores the _id of the open row ─
    const [expandedEnquiry, setExpandedEnquiry] = useState(null);

    // ── Expanded notification row ─────────────────────────────
    const [expandedNotif, setExpandedNotif] = useState(null);

    // ── Seller action modal ───────────────────────────────────
   const [showModal, setShowModal]         = useState(false);
    const [modalAction, setModalAction]     = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // ── Suspension duration — only relevant when modalAction is 'suspend' ──
    const [suspensionDuration, setSuspensionDuration] = useState('7_days');
    const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

    useEffect(() => {
        if (!userInfo?.isAdmin) { navigate('/'); return; }
        fetchProfile();
    }, [id]);

    // ── Fetch full profile ────────────────────────────────────
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data: res } = await axios.get(
                `/api/users/${id}/full-profile`,
                config
            );
            setData(res);
            // Update page title with user name once loaded
            document.title = `Admin: ${res.user.name} — ShopZone`;
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    // ── Seller status action ──────────────────────────────────
    const actionToStatus = {
        approve:   'approved',
        reject:    'rejected',
        suspend:   'suspended',
        reinstate: 'approved',
    };

    const openAction = (action) => {
        setModalAction(action);
        setShowModal(true);
    };

   const confirmAction = async () => {
        try {
            setActionLoading(true);
            const newStatus = actionToStatus[modalAction];
            // Suspension requires a duration so admin is never able to
            // "suspend and forget" — see DEC notes in userController.js.
            // Reinstatement is unaffected and stays a one-click action.
            const payload = modalAction === 'suspend'
                ? { sellerStatus: newStatus, suspensionDuration }
                : { sellerStatus: newStatus };
            await axios.put(
                `/api/users/${id}/seller-status`,
                payload,
                config
            );
            setShowModal(false);
            showToast(
                `${data.user.name} has been ${newStatus}.`,
                newStatus === 'approved' ? 'success' : 'info'
            );
            fetchProfile();
        } catch (err) {
            showToast(err.response?.data?.message || 'Action failed', 'error');
        } finally {
            setActionLoading(false);
            setShowModal(false);
        }
    };

    const modalCopy = {
        approve:   { title: 'Approve Seller',     message: `Approve ${data?.user?.name} as a seller? They will gain access to the seller dashboard.`, label: 'Approve',   variant: 'primary-branded' },
        reject:    { title: 'Reject Application', message: `Reject ${data?.user?.name}'s seller application?`, label: 'Reject',    variant: 'danger' },
        suspend:   { title: 'Suspend Seller',     message: `Suspend ${data?.user?.name}? They will lose seller access until reinstated.`, label: 'Suspend',   variant: 'danger' },
        reinstate: { title: 'Reinstate Seller',   message: `Reinstate ${data?.user?.name} as an approved seller?`, label: 'Reinstate', variant: 'primary-branded' },
    };

    // ── Loading state ─────────────────────────────────────────
    if (loading) return (
        <div className='aud-page'>
            <div className='aud-header'>
                <button className='aud-back-btn' onClick={() => navigate(-1)}>
                    <FaArrowLeft aria-hidden='true' /> Back
                </button>
            </div>
            <div className='aud-state'>
                <div className='aud-spinner' aria-label='Loading…' />
                <p>Loading profile…</p>
            </div>
        </div>
    );

    // ── Error state ───────────────────────────────────────────
    if (error) return (
        <div className='aud-page'>
            <div className='aud-header'>
                <button className='aud-back-btn' onClick={() => navigate(-1)}>
                    <FaArrowLeft aria-hidden='true' /> Back
                </button>
            </div>
            <div className='aud-state aud-state--error'>
                <FaExclamationTriangle aria-hidden='true' />
                <p>{error}</p>
                <button className='aud-retry-btn' onClick={fetchProfile}>Retry</button>
            </div>
        </div>
    );

    const { user, orders, products, enquiries, notifications } = data;
    const sellerStatusCfg = SELLER_STATUS[user.sellerStatus] || SELLER_STATUS.none;
    const SellerStatusIcon = sellerStatusCfg.icon;

    return (
        <div className='aud-page'>

            {/* ── Seller action confirmation modal ──────── */}
          {modalAction && (
                <ConfirmModal
                    show={showModal}
                    onConfirm={confirmAction}
                    onCancel={() => setShowModal(false)}
                    title={modalCopy[modalAction]?.title || ''}
                    message={
                        modalAction === 'suspend' ? (
                            <div>
                                <p>{modalCopy.suspend.message}</p>
                                <label className='aud-suspend-duration-label' htmlFor='suspend-duration-select'>
                                    Suspension length
                                </label>
                                <select
                                    id='suspend-duration-select'
                                    className='aud-suspend-duration-select'
                                    value={suspensionDuration}
                                    onChange={(e) => setSuspensionDuration(e.target.value)}
                                >
                                    <option value='3_days'>3 days</option>
                                    <option value='7_days'>7 days</option>
                                    <option value='14_days'>14 days</option>
                                    <option value='indefinite'>Indefinite — manual review</option>
                                </select>
                                <p className='aud-suspend-duration-note'>
                                    This sets a reminder date — reinstatement still requires a deliberate
                                    admin action, it will never lift automatically.
                                </p>
                            </div>
                        ) : (modalCopy[modalAction]?.message || '')
                    }
                    confirmLabel={actionLoading ? 'Please wait...' : modalCopy[modalAction]?.label}
                    confirmVariant={modalCopy[modalAction]?.variant || 'primary-branded'}
                />
            )}

            {/* ── Page header ────────────────────────────── */}
            <div className='aud-header'>
                <div className='aud-header__left'>
                    <button
                        className='aud-back-btn'
                        onClick={() => navigate(-1)}
                        aria-label='Go back'
                    >
                        <FaArrowLeft aria-hidden='true' /> Back
                    </button>
                    <div className='aud-header__avatar'>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className='aud-header__name'>{user.name}</h1>
                        <p className='aud-header__meta'>
                            Joined {formatDate(user.createdAt)}
                            {user.isAdmin && (
                                <span className='aud-header__badge aud-header__badge--admin'>
                                    <FaShieldAlt aria-hidden='true' /> Admin
                                </span>
                            )}
                            {user.isSeller && (
                                <span className='aud-header__badge aud-header__badge--seller'>
                                    <FaStore aria-hidden='true' /> Seller
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className='aud-body'>

                {/* ── Account info card ──────────────────── */}
                <div className='aud-card'>
                    <h2 className='aud-card__title'>
                        <FaUser aria-hidden='true' /> Account Information
                    </h2>
                    <div className='aud-info-grid'>
                        <div className='aud-info-row'>
                            <FaEnvelope aria-hidden='true' />
                            <span className='aud-info-label'>Email</span>
                            <a href={`mailto:${user.email}`} className='aud-info-value aud-info-link'>
                                {user.email}
                            </a>
                        </div>
                        <div className='aud-info-row'>
                            <FaPhone aria-hidden='true' />
                            <span className='aud-info-label'>Phone</span>
                            <span className='aud-info-value'>{user.phone || '—'}</span>
                        </div>
                        <div className='aud-info-row'>
                            <FaMapMarkerAlt aria-hidden='true' />
                            <span className='aud-info-label'>County</span>
                            <span className='aud-info-value'>{user.county || '—'}</span>
                        </div>
                        <div className='aud-info-row'>
                            <FaBriefcase aria-hidden='true' />
                            <span className='aud-info-label'>Account Type</span>
                            <span className='aud-info-value'>
                                {user.accountType === 'business'
                                    ? `Business — ${user.businessName || '—'}`
                                    : 'Individual'
                                }
                            </span>
                        </div>
                        {user.shippingAddress?.address && (
                            <div className='aud-info-row'>
                                <FaMapMarkerAlt aria-hidden='true' />
                                <span className='aud-info-label'>Delivery Address</span>
                                <span className='aud-info-value'>
                                    {[
                                        user.shippingAddress.address,
                                        user.shippingAddress.apartment,
                                        user.shippingAddress.city,
                                        user.shippingAddress.county,
                                    ].filter(Boolean).join(', ')}
                                </span>
                            </div>
                        )}
                        <div className='aud-info-row'>
                            <FaCalendar aria-hidden='true' />
                            <span className='aud-info-label'>Registered</span>
                            <span className='aud-info-value'>{formatDateTime(user.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* ── Seller section — only shown if user has any seller status ── */}
                {user.sellerStatus && user.sellerStatus !== 'none' && (
                    <div className='aud-card aud-card--seller'>
                        <div className='aud-seller-header'>
                            <h2 className='aud-card__title'>
                                <FaStore aria-hidden='true' /> Seller Profile
                            </h2>
                            <span className={`aud-seller-status ${sellerStatusCfg.cls}`}>
                                <SellerStatusIcon aria-hidden='true' />
                                {sellerStatusCfg.label}
                            </span>
                            {/* Suspension reminder — shown only while suspended. Indefinite
                                suspensions show no date, prompting a manual check instead. */}
                            {user.sellerStatus === 'suspended' && (
                                <span className='aud-suspension-reminder'>
                                    {user.sellerSuspensionExpiresAt
                                        ? `Reconsider on ${formatDate(user.sellerSuspensionExpiresAt)}`
                                        : 'Indefinite — review manually'}
                                </span>
                            )}
                        </div>

                        {/* Seller profile fields */}
                        <div className='aud-info-grid'>
                            {user.sellerProfile?.businessName && (
                                <div className='aud-info-row'>
                                    <FaBriefcase aria-hidden='true' />
                                    <span className='aud-info-label'>Business Name</span>
                                    <span className='aud-info-value'>{user.sellerProfile.businessName}</span>
                                </div>
                            )}
                            {user.sellerProfile?.businessAddress && (
                                <div className='aud-info-row'>
                                    <FaMapMarkerAlt aria-hidden='true' />
                                    <span className='aud-info-label'>Business Address</span>
                                    <span className='aud-info-value'>{user.sellerProfile.businessAddress}</span>
                                </div>
                            )}
                            {user.sellerProfile?.kraPin && (
                                <div className='aud-info-row'>
                                    <FaShieldAlt aria-hidden='true' />
                                    <span className='aud-info-label'>KRA PIN</span>
                                    <span className='aud-info-value'>{user.sellerProfile.kraPin}</span>
                                </div>
                            )}
                            {user.sellerProfile?.mpesaNumber && (
                                <div className='aud-info-row'>
                                    <FaPhone aria-hidden='true' />
                                    <span className='aud-info-label'>M-Pesa Number</span>
                                    <span className='aud-info-value'>{user.sellerProfile.mpesaNumber}</span>
                                </div>
                            )}
                            {user.sellerApprovedAt && (
                                <div className='aud-info-row'>
                                    <FaCalendar aria-hidden='true' />
                                    <span className='aud-info-label'>Approved</span>
                                    <span className='aud-info-value'>{formatDateTime(user.sellerApprovedAt)}</span>
                                </div>
                            )}
                            {user.sellerSuspendedAt && (
                                <div className='aud-info-row'>
                                    <FaCalendar aria-hidden='true' />
                                    <span className='aud-info-label'>Suspended</span>
                                    <span className='aud-info-value'>{formatDateTime(user.sellerSuspendedAt)}</span>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className='aud-seller-actions'>
                            {(user.sellerStatus === 'pending' || user.sellerStatus === 'rejected') && (
                                <button
                                    className='aud-action-btn aud-action-btn--approve'
                                    onClick={() => openAction('approve')}
                                >
                                    <FaCheckCircle aria-hidden='true' /> Approve
                                </button>
                            )}
                            {user.sellerStatus === 'pending' && (
                                <button
                                    className='aud-action-btn aud-action-btn--reject'
                                    onClick={() => openAction('reject')}
                                >
                                    <FaTimesCircle aria-hidden='true' /> Reject
                                </button>
                            )}
                            {user.sellerStatus === 'approved' && (
                                <button
                                    className='aud-action-btn aud-action-btn--suspend'
                                    onClick={() => openAction('suspend')}
                                >
                                    <FaBan aria-hidden='true' /> Suspend
                                </button>
                            )}
                            {user.sellerStatus === 'suspended' && (
                                <button
                                    className='aud-action-btn aud-action-btn--approve'
                                    onClick={() => openAction('reinstate')}
                                >
                                    <FaCheckCircle aria-hidden='true' /> Reinstate
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Orders as buyer ────────────────────── */}
                <div className='aud-card'>
                    <h2 className='aud-card__title'>
                        <FaClipboardList aria-hidden='true' /> Orders as Buyer
                        <span className='aud-card__count'>{orders.length}</span>
                    </h2>
                    {orders.length === 0 ? (
                        <p className='aud-empty'>No orders placed yet.</p>
                    ) : (
                        <div className='aud-table-wrap'>
                            <table className='aud-table'>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Paid</th>
                                        <th>Delivered</th>
                                        <th>View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, idx) => {
                                        const sc = ORDER_STATUS[order.status] || { label: order.status, cls: 'aud-badge--pending' };
                                        return (
                                            <tr key={order._id} className={idx % 2 !== 0 ? 'aud-row--alt' : ''}>
                                                <td className='aud-cell-id'>
                                                    #{order._id.slice(-8).toUpperCase()}
                                                    {order.hasTier2Items && (
                                                        <span className='aud-tier2-flag'>Bulk</span>
                                                    )}
                                                </td>
                                                <td className='aud-cell-muted'>{formatDate(order.createdAt)}</td>
                                                <td className='aud-cell-price'>{formatKES(order.totalPrice)}</td>
                                                <td>
                                                    <span className={`aud-badge ${sc.cls}`}>{sc.label}</span>
                                                </td>
                                                <td>
                                                    {order.isPaid
                                                        ? <span className='aud-bool--yes'><FaCheckCircle aria-hidden='true' /> Yes</span>
                                                        : <span className='aud-bool--no'><FaTimesCircle aria-hidden='true' /> No</span>
                                                    }
                                                </td>
                                                <td>
                                                    {order.isDelivered
                                                        ? <span className='aud-bool--yes'><FaCheckCircle aria-hidden='true' /> Yes</span>
                                                        : <span className='aud-bool--no'><FaTimesCircle aria-hidden='true' /> No</span>
                                                    }
                                                </td>
                                                <td>
                                                    <Link
                                                        to={`/order/${order._id}`}
                                                        className='aud-link-btn'
                                                        aria-label={`View order ${order._id.slice(-6)}`}
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── Products as seller ─────────────────── */}
                <div className='aud-card'>
                    <h2 className='aud-card__title'>
                        <FaBoxOpen aria-hidden='true' /> Products as Seller
                        <span className='aud-card__count'>{products.length}</span>
                    </h2>
                    {products.length === 0 ? (
                        <p className='aud-empty'>
                            {user.isSeller
                                ? 'No products assigned to this seller yet.'
                                : 'This user is not a seller.'
                            }
                        </p>
                    ) : (
                        <div className='aud-table-wrap'>
                            <table className='aud-table'>
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Brand</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Flags</th>
                                        <th>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, idx) => (
                                        <tr key={product._id} className={idx % 2 !== 0 ? 'aud-row--alt' : ''}>
                                            <td>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className='aud-thumb'
                                                />
                                            </td>
                                            <td className='aud-cell-name'>{product.name}</td>
                                            <td className='aud-cell-muted'>{product.category}</td>
                                            <td className='aud-cell-muted'>{product.brand || '—'}</td>
                                            <td className='aud-cell-price'>
                                                {formatKES(product.price)}
                                            </td>
                                            <td>
                                                <span className={product.countInStock > 0 ? 'aud-stock--in' : 'aud-stock--out'}>
                                                    {product.countInStock}
                                                </span>
                                            </td>
                                            <td>
                                                <div className='aud-flags'>
                                                    {product.isFeatured  && <span className='aud-flag aud-flag--featured'>Featured</span>}
                                                    {product.isOnSale    && <span className='aud-flag aud-flag--sale'>Sale</span>}
                                                    {product.isClearance && <span className='aud-flag aud-flag--clearance'>Clearance</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <Link
                                                    to={`/admin/product/${product._id}/edit`}
                                                    className='aud-link-btn'
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

{/* ── Enquiries submitted ────────────────── */}
                <div className='aud-card'>
                    <h2 className='aud-card__title'>
                        <FaEnvelope aria-hidden='true' /> Enquiries Submitted
                        <span className='aud-card__count'>{enquiries.length}</span>
                    </h2>
                    {enquiries.length === 0 ? (
                        <p className='aud-empty'>No enquiries submitted.</p>
                    ) : (
                        <div className='aud-table-wrap'>
                            <table className='aud-table'>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Resolved</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enquiries.map((enq, idx) => {
                                        const tc       = ENQUIRY_TYPE[enq.type]     || { label: enq.type,   cls: '' };
                                        const sc       = ENQUIRY_STATUS[enq.status] || { label: enq.status, cls: '' };
                                        const isOpen   = expandedEnquiry === enq._id;
                                        return (
                                            <>
                                                {/* ── Main row ── */}
                                                <tr
                                                    key={enq._id}
                                                    className={`${idx % 2 !== 0 ? 'aud-row--alt' : ''} aud-row--clickable`}
                                                    onClick={() => setExpandedEnquiry(isOpen ? null : enq._id)}
                                                    aria-expanded={isOpen}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td className='aud-cell-id'>
                                                        #{enq._id.slice(-6).toUpperCase()}
                                                    </td>
                                                    <td>
                                                        <span className={`aud-enq-badge ${tc.cls}`}>
                                                            {tc.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`aud-enq-status ${sc.cls}`}>
                                                            {sc.label}
                                                        </span>
                                                    </td>
                                                    <td className='aud-cell-muted'>
                                                        {formatDate(enq.createdAt)}
                                                    </td>
                                                    <td className='aud-cell-muted'>
                                                        {enq.resolvedAt
                                                            ? <span className='aud-bool--yes'><FaCheckCircle aria-hidden='true' /> {formatDate(enq.resolvedAt)}</span>
                                                            : <span className='aud-bool--no'>Open</span>
                                                        }
                                                    </td>
                                                    <td className='aud-cell-expand'>
                                                        <span className={`aud-expand-icon ${isOpen ? 'aud-expand-icon--open' : ''}`}>
                                                            ▾
                                                        </span>
                                                    </td>
                                                </tr>

                                                {/* ── Expanded detail row ── */}
                                                {isOpen && (
                                                    <tr key={`${enq._id}-detail`} className='aud-row--expanded'>
                                                        <td colSpan={6}>
                                                            <div className='aud-enq-detail'>

                                                                {/* Message */}
                                                                {enq.message && (
                                                                    <div className='aud-enq-detail__block'>
                                                                        <span className='aud-enq-detail__label'>Message</span>
                                                                        <p className='aud-enq-detail__text'>{enq.message}</p>
                                                                    </div>
                                                                )}

                                                                {/* Business name if present */}
                                                                {enq.business && (
                                                                    <div className='aud-enq-detail__block'>
                                                                        <span className='aud-enq-detail__label'>Business</span>
                                                                        <p className='aud-enq-detail__text'>{enq.business}</p>
                                                                    </div>
                                                                )}

                                                                {/* Admin notes — internal only */}
                                                                {enq.adminNotes && (
                                                                    <div className='aud-enq-detail__block aud-enq-detail__block--notes'>
                                                                        <span className='aud-enq-detail__label'>
                                                                            Admin Notes <span className='aud-enq-detail__internal'>Internal</span>
                                                                        </span>
                                                                        <p className='aud-enq-detail__text'>{enq.adminNotes}</p>
                                                                    </div>
                                                                )}

                                                                {/* Link to full enquiry on AdminEnquiriesPage */}
                                                                <Link
                                                                    to='/admin/enquiries'
                                                                    className='aud-enq-detail__link'
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    View in Enquiries Dashboard →
                                                                </Link>

                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

               {/* ── Notifications ──────────────────────── */}
                <div className='aud-card'>
                    <h2 className='aud-card__title'>
                        <FaBell aria-hidden='true' /> Notifications
                        <span className='aud-card__count'>{notifications.length}</span>
                    </h2>
                    {notifications.length === 0 ? (
                        <p className='aud-empty'>No notifications sent to this user.</p>
                    ) : (
                        <div className='aud-notif-list'>
                            {notifications.map((notif) => {
                                const isOpen     = expandedNotif === notif._id;
                                const hasOrder   = !!notif.relatedOrderId;

                                return (
                                    <div
                                        key={notif._id}
                                        className={`aud-notif ${!notif.isRead ? 'aud-notif--unread' : ''} ${hasOrder ? 'aud-notif--linked' : 'aud-notif--expandable'}`}
                                        onClick={() => !hasOrder && setExpandedNotif(isOpen ? null : notif._id)}
                                        style={{ cursor: hasOrder ? 'default' : 'pointer' }}
                                        aria-expanded={!hasOrder ? isOpen : undefined}
                                    >
                                        <div className='aud-notif__dot' aria-hidden='true' />

                                        <div className='aud-notif__content'>
                                            <span className='aud-notif__title'>{notif.title}</span>
                                            {/* Always show message — expand shows nothing extra for non-order notifs */}
                                            <span className='aud-notif__message'>{notif.message}</span>

                                            {/* If expanded and no order link, nothing extra to show since
                                                message is already fully visible above */}
                                        </div>

                                        <div className='aud-notif__meta'>
                                            <span className='aud-notif__date'>
                                                {formatDateTime(notif.createdAt)}
                                            </span>
                                            {!notif.isRead && (
                                                <span className='aud-notif__unread-label'>Unread</span>
                                            )}
                                            {/* Order link — navigates to the related order */}
                                            {hasOrder && (
                                                <Link
                                                    to={`/order/${notif.relatedOrderId}`}
                                                    className='aud-notif__order-link'
                                                    onClick={(e) => e.stopPropagation()}
                                                    aria-label='View related order'
                                                >
                                                    View Order →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailPage;