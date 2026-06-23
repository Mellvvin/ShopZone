// frontend/src/pages/AdminSellersPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page — manage seller applications and approved sellers.
// Shows all users who have any seller status (pending, approved,
// suspended, rejected). Admin can approve, reject, or suspend.
//
// Header follows ShopZone admin design system:
//   - Tan FaStore icon, title, subtitle
//   - Right-side count pills (pending amber, approved green,
//     suspended red)
//   - Tabs: Pending / Approved / Suspended / Rejected
//   - Search bar filtering by name, email, business
//   - Clicking a row navigates to /admin/users/:id
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';
import {
    FaStore, FaSearch, FaTimes, FaExclamationTriangle,
    FaCheckCircle, FaClock, FaBan, FaTimesCircle,
    FaUserEdit,
} from 'react-icons/fa';
import ScrollableTabBar from '../components/ScrollableTabBar/ScrollableTabBar';
import './AdminSellersPage.css';

// ── Status badge helper ───────────────────────────────────────
const SellerStatusBadge = ({ status }) => {
    const map = {
        pending:   { cls: 'asl-badge--pending',   label: 'Pending',   icon: FaClock },
        approved:  { cls: 'asl-badge--approved',  label: 'Approved',  icon: FaCheckCircle },
        suspended: { cls: 'asl-badge--suspended', label: 'Suspended', icon: FaBan },
        rejected:  { cls: 'asl-badge--rejected',  label: 'Rejected',  icon: FaTimesCircle },
        none:      { cls: 'asl-badge--none',       label: 'None',      icon: FaTimes },
    };
    const s = map[status] || map.none;
    const Icon = s.icon;
    return (
        <span className={`asl-badge ${s.cls}`}>
            <Icon aria-hidden='true' /> {s.label}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────
// AdminSellersPage component
// ─────────────────────────────────────────────────────────────
const AdminSellersPage = () => {
    const navigate     = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => { document.title = 'Admin: Sellers — ShopZone'; }, []);

    // ── Data state ────────────────────────────────────────────
    const [sellers, setSellers]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    // ── Filter state ──────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('pending');
    const [search, setSearch]       = useState('');

    // ── Action modal ──────────────────────────────────────────
    const [showModal, setShowModal]       = useState(false);
    const [modalUser, setModalUser]       = useState(null);
    const [modalAction, setModalAction]   = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) { navigate('/login'); return; }
        fetchSellers();
    }, [userInfo, navigate]);

    // ── Fetch all users, filter to those with seller status ───
    const fetchSellers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/users', config);
            const sellerUsers = data.filter(
                (u) => u.sellerStatus && u.sellerStatus !== 'none'
            );
            setSellers(sellerUsers);
            setError(null);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // ── Tab counts ────────────────────────────────────────────
    const counts = useMemo(() => ({
        pending:   sellers.filter(u => u.sellerStatus === 'pending').length,
        approved:  sellers.filter(u => u.sellerStatus === 'approved').length,
        suspended: sellers.filter(u => u.sellerStatus === 'suspended').length,
        rejected:  sellers.filter(u => u.sellerStatus === 'rejected').length,
    }), [sellers]);

    // ── Tab + search filtering ────────────────────────────────
    const filteredSellers = useMemo(() => {
        let list = sellers.filter(u => u.sellerStatus === activeTab);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(u =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.sellerProfile?.businessName || '').toLowerCase().includes(q) ||
                (u.businessName || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [sellers, activeTab, search]);

    // ── Action handlers ───────────────────────────────────────
    const openAction = (user, action) => {
        setModalUser(user);
        setModalAction(action);
        setShowModal(true);
    };

    const actionToStatus = {
        approve:   'approved',
        reject:    'rejected',
        suspend:   'suspended',
        reinstate: 'approved',
    };

    const confirmAction = async () => {
        try {
            setActionLoading(true);
            const newStatus = actionToStatus[modalAction];
            await axios.put(
                `/api/users/${modalUser._id}/seller-status`,
                { sellerStatus: newStatus },
                config
            );
            setShowModal(false);
            showToast(
                `${modalUser.name} has been ${newStatus}.`,
                newStatus === 'approved' ? 'success' : 'info'
            );
            fetchSellers();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setActionLoading(false);
            setShowModal(false);
        }
    };

    const modalCopy = {
        approve:   { title: 'Approve Seller',      message: `Approve ${modalUser?.name} as a seller? They will gain access to the seller dashboard immediately.`, label: 'Approve',   variant: 'primary-branded' },
        reject:    { title: 'Reject Application',  message: `Reject ${modalUser?.name}'s seller application? They will not be able to access the seller dashboard.`, label: 'Reject',    variant: 'danger' },
        suspend:   { title: 'Suspend Seller',      message: `Suspend ${modalUser?.name}? They will lose seller dashboard access until reinstated.`, label: 'Suspend',   variant: 'danger' },
        reinstate: { title: 'Reinstate Seller',    message: `Reinstate ${modalUser?.name} as an approved seller?`, label: 'Reinstate', variant: 'primary-branded' },
    };

    // ── Tab definitions ───────────────────────────────────────
    const TABS = [
        { key: 'pending',   label: 'Pending',   icon: FaClock,        countMod: 'amber' },
        { key: 'approved',  label: 'Approved',  icon: FaCheckCircle,  countMod: 'green' },
        { key: 'suspended', label: 'Suspended', icon: FaBan,          countMod: 'red'   },
        { key: 'rejected',  label: 'Rejected',  icon: FaTimesCircle,  countMod: ''      },
    ];

    return (
        <div className='asl-page'>

            {/* ── Confirmation modal ─────────────────────── */}
            {modalUser && (
                <ConfirmModal
                    show={showModal}
                    onConfirm={confirmAction}
                    onCancel={() => setShowModal(false)}
                    title={modalCopy[modalAction]?.title || ''}
                    message={modalCopy[modalAction]?.message || ''}
                    confirmLabel={actionLoading ? 'Please wait...' : modalCopy[modalAction]?.label}
                    confirmVariant={modalCopy[modalAction]?.variant || 'primary-branded'}
                />
            )}

            {/* ── Page header ────────────────────────────── */}
            <div className='asl-header'>
                <div className='asl-header__left'>
                    <FaStore className='asl-header__icon' aria-hidden='true' />
                    <div>
                        <h1 className='asl-header__title'>Seller Management</h1>
                        <p className='asl-header__subtitle'>
                            Manage seller applications, approvals and suspensions
                        </p>
                    </div>
                </div>

                {/* Right-side count pills */}
                <div className='asl-header__counts'>
                    {counts.pending > 0 && (
                        <div className='asl-count-pill asl-count-pill--amber'>
                            <span className='asl-count-pill__num'>{counts.pending}</span>
                            <span className='asl-count-pill__label'>Pending</span>
                        </div>
                    )}
                    <div className='asl-count-pill asl-count-pill--green'>
                        <span className='asl-count-pill__num'>{counts.approved}</span>
                        <span className='asl-count-pill__label'>Approved</span>
                    </div>
                    {counts.suspended > 0 && (
                        <div className='asl-count-pill asl-count-pill--red'>
                            <span className='asl-count-pill__num'>{counts.suspended}</span>
                            <span className='asl-count-pill__label'>Suspended</span>
                        </div>
                    )}
                </div>
            </div>

           {/* ── Tab bar ────────────────────────────────── */}
            <ScrollableTabBar className='asl-tabs' role='tablist'>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            className={`asl-tab ${activeTab === tab.key ? 'asl-tab--active' : ''}`}
                            onClick={() => { setActiveTab(tab.key); setSearch(''); }}
                            role='tab'
                            aria-selected={activeTab === tab.key}
                        >
                            <Icon aria-hidden='true' />
                            {tab.label}
                            <span className={`asl-tab__count ${tab.countMod ? `asl-tab__count--${tab.countMod}` : ''}`}>
                                {counts[tab.key]}
                            </span>
                        </button>
                    );
                })}
            </ScrollableTabBar>

            {/* ── Search bar ─────────────────────────────── */}
            <div className='asl-search-bar'>
                <FaSearch className='asl-search-bar__icon' aria-hidden='true' />
                <input
                    type='text'
                    className='asl-search-bar__input'
                    placeholder='Search by name, email or business name...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label='Search sellers'
                />
                {search && (
                    <button
                        className='asl-search-bar__clear'
                        onClick={() => setSearch('')}
                        aria-label='Clear search'
                    >
                        <FaTimes aria-hidden='true' />
                    </button>
                )}
            </div>

            {/* ── Error ──────────────────────────────────── */}
            {error && (
                <div className='asl-error'>
                    <FaExclamationTriangle aria-hidden='true' /> {error}
                </div>
            )}

            {/* ── Content ────────────────────────────────── */}
            {loading ? (
                <div className='asl-state'>
                    <div className='asl-spinner' aria-label='Loading…' />
                    <p>Loading sellers…</p>
                </div>
            ) : filteredSellers.length === 0 ? (
                <div className='asl-state'>
                    <FaStore aria-hidden='true' />
                    <p>
                        {search
                            ? `No ${activeTab} sellers matching "${search}"`
                            : `No ${activeTab} seller applications.`
                        }
                    </p>
                    {search && (
                        <button className='asl-clear-btn' onClick={() => setSearch('')}>
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className='asl-table-wrap'>
                    <p className='asl-results-count'>
                        {filteredSellers.length} {filteredSellers.length === 1 ? 'seller' : 'sellers'}
                    </p>
                    <table className='asl-table' aria-label='Sellers table'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Business</th>
                                <th>County</th>
                                <th>Applied</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSellers.map((user, index) => (
                                <tr
                                    key={user._id}
                                    className={`asl-row ${index % 2 !== 0 ? 'asl-row--alt' : ''}`}
                                    onClick={() => navigate(`/admin/users/${user._id}`)}
                                    style={{ cursor: 'pointer' }}
                                    title={`View ${user.name}'s profile`}
                                >
                                    {/* Name */}
                                    <td className='asl-cell-name'>
                                        <div className='asl-name-wrap'>
                                            <div className='asl-avatar'>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{user.name}</span>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className='asl-cell-muted'>
                                        <a
                                            href={`mailto:${user.email}`}
                                            className='asl-email-link'
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {user.email}
                                        </a>
                                    </td>

                                    {/* Phone */}
                                    <td className='asl-cell-muted'>
                                        {user.phone || '—'}
                                    </td>

                                    {/* Business */}
                                    <td className='asl-cell-muted'>
                                        {user.sellerProfile?.businessName || user.businessName || '—'}
                                    </td>

                                    {/* County */}
                                    <td className='asl-cell-muted'>
                                        {user.county || '—'}
                                    </td>

                                    {/* Applied date */}
                                    <td className='asl-cell-muted'>
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString('en-KE', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                              })
                                            : '—'
                                        }
                                    </td>

                                    {/* Status badge */}
                                    <td>
                                        <SellerStatusBadge status={user.sellerStatus} />
                                    </td>

                                    {/* Actions — stop propagation so row click doesn't fire */}
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className='asl-actions'>
                                            {(user.sellerStatus === 'pending' || user.sellerStatus === 'rejected') && (
                                                <button
                                                    className='asl-btn asl-btn--approve'
                                                    onClick={() => openAction(user, 'approve')}
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {user.sellerStatus === 'pending' && (
                                                <button
                                                    className='asl-btn asl-btn--reject'
                                                    onClick={() => openAction(user, 'reject')}
                                                >
                                                    Reject
                                                </button>
                                            )}
                                            {user.sellerStatus === 'approved' && (
                                                <button
                                                    className='asl-btn asl-btn--suspend'
                                                    onClick={() => openAction(user, 'suspend')}
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                            {user.sellerStatus === 'suspended' && (
                                                <button
                                                    className='asl-btn asl-btn--approve'
                                                    onClick={() => openAction(user, 'reinstate')}
                                                >
                                                    Reinstate
                                                </button>
                                            )}
                                            <button
                                                className='asl-btn asl-btn--view'
                                                onClick={() => navigate(`/admin/users/${user._id}`)}
                                                aria-label={`View ${user.name}'s full profile`}
                                            >
                                                <FaUserEdit aria-hidden='true' /> View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminSellersPage;