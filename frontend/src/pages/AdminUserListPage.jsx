// frontend/src/pages/AdminUserListPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page — lists all registered users.
// Tabs: All Users / Customers / Admins.
// Search filters by name and email.
// Clicking a row navigates to /admin/users/:id (detail page).
// Header follows the ShopZone admin design system:
//   - Tan icon, bold title, subtitle
//   - Right-side count pills (total, new 24h amber, admins Oxford Blue)
//   - Coloured tab bar with count badges
//   - Search bar on every list page
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Form } from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';
import {
    FaUsers, FaSearch, FaTimes, FaUserShield,
    FaUser, FaExclamationTriangle, FaTrash, FaUserEdit,
} from 'react-icons/fa';
import ScrollableTabBar from '../components/ScrollableTabBar/ScrollableTabBar';
import './AdminUserListPage.css';

// ─────────────────────────────────────────────────────────────
// AdminUserListPage component
// ─────────────────────────────────────────────────────────────
const AdminUserListPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => { document.title = 'Admin: User List — ShopZone'; }, []);

    // ── Data state ────────────────────────────────────────────
    const [users, setUsers]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    // ── Filter state ──────────────────────────────────────────
    // Reads ?tab= from the URL so returning here (e.g. after viewing a
    // user's profile and clicking Back) restores the tab instead of
    // always resetting to "all".
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all'); // all | customers | admins
    const [search, setSearch]       = useState('');

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab') || 'all';
        setActiveTab(prev => (prev === tabFromUrl ? prev : tabFromUrl));
    }, [searchParams]);

    // ── Delete modal ──────────────────────────────────────────
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId]               = useState(null);
    const [deleteName, setDeleteName]           = useState('');
    const [deleteLoading, setDeleteLoading]     = useState(false);

    // ── Role modal ────────────────────────────────────────────
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUser, setSelectedUser]   = useState(null);
    const [isAdmin, setIsAdmin]             = useState(false);
    const [roleLoading, setRoleLoading]     = useState(false);

    const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) { navigate('/login'); return; }
        fetchUsers();
    }, [userInfo, navigate]);

    // ── Fetch all users ───────────────────────────────────────
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/users', config);
            setUsers(data);
            setError(null);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // ── Derived counts ────────────────────────────────────────
    // New in last 24 hours
    const newIn24h = useMemo(() => {
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        return users.filter(u => new Date(u.createdAt).getTime() > cutoff).length;
    }, [users]);

    const adminCount    = useMemo(() => users.filter(u => u.isAdmin).length, [users]);
    const customerCount = useMemo(() => users.filter(u => !u.isAdmin).length, [users]);

    // ── Tab + search filtering ────────────────────────────────
    const filteredUsers = useMemo(() => {
        let list = users;
        // Tab filter
        if (activeTab === 'customers') list = list.filter(u => !u.isAdmin);
        if (activeTab === 'admins')    list = list.filter(u => u.isAdmin);
        // Search filter across name and email
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(u =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q)
            );
        }
        return list;
    }, [users, activeTab, search]);

    // ── Delete handlers ───────────────────────────────────────
    const confirmDelete = (id, name) => {
        setDeleteId(id);
        setDeleteName(name);
        setShowDeleteModal(true);
    };

    const deleteHandler = async () => {
        try {
            setDeleteLoading(true);
            await axios.delete(`/api/users/${deleteId}`, config);
            setShowDeleteModal(false);
            showToast(`${deleteName} has been removed.`, 'success');
            fetchUsers();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    };

    // ── Role modal handlers ───────────────────────────────────
    const openRoleModal = (user) => {
        setSelectedUser(user);
        setIsAdmin(user.isAdmin);
        setShowRoleModal(true);
    };

    const updateRoleHandler = async () => {
        try {
            setRoleLoading(true);
            await axios.put(
                `/api/users/${selectedUser._id}`,
                { isAdmin },
                { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } }
            );
            setShowRoleModal(false);
            showToast(`${selectedUser.name}'s role updated to ${isAdmin ? 'Admin' : 'Customer'}.`, 'success');
            fetchUsers();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setRoleLoading(false);
        }
    };

    // ── Tab definitions ───────────────────────────────────────
    const TABS = [
        { key: 'all',       label: 'All Users',  count: users.length,   countMod: '' },
        { key: 'customers', label: 'Customers',  count: customerCount,  countMod: '' },
        { key: 'admins',    label: 'Admins',     count: adminCount,     countMod: 'oxford' },
    ];

    return (
        <div className='aul-page'>

            {/* ── Delete confirmation modal ──────────────── */}
            <ConfirmModal
                show={showDeleteModal}
                onConfirm={deleteHandler}
                onCancel={() => setShowDeleteModal(false)}
                title='Delete User'
                message={`Are you sure you want to delete ${deleteName}?`}
                subMessage='This will permanently remove their account. Their orders remain in the system.'
                confirmLabel={deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                confirmVariant='danger'
            />

            {/* ── Role modal ─────────────────────────────── */}
            {showRoleModal && selectedUser && (
                <div
                    className='aul-modal-overlay'
                    onClick={() => setShowRoleModal(false)}
                >
                    <div
                        className='aul-modal'
                        onClick={(e) => e.stopPropagation()}
                        role='dialog'
                        aria-modal='true'
                        aria-labelledby='role-modal-title'
                    >
                        <div className='aul-modal-header'>
                            <h5 className='aul-modal-title' id='role-modal-title'>
                                Edit User Role
                            </h5>
                        </div>
                        <div className='aul-modal-body'>
                            <p className='aul-modal-user-name'>{selectedUser.name}</p>
                            <p className='aul-modal-user-email'>{selectedUser.email}</p>
                            <Form.Group>
                                <Form.Label className='aul-role-label'>Role</Form.Label>
                                <Form.Select
                                    value={isAdmin ? 'admin' : 'customer'}
                                    onChange={(e) => setIsAdmin(e.target.value === 'admin')}
                                >
                                    <option value='customer'>Customer</option>
                                    <option value='admin'>Admin</option>
                                </Form.Select>
                                <Form.Text className='aul-role-hint'>
                                    Admins have full access to the dashboard, products, orders and users.
                                </Form.Text>
                            </Form.Group>
                        </div>
                        <div className='aul-modal-footer'>
                            <button
                                className='aul-modal-cancel'
                                onClick={() => setShowRoleModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className='aul-modal-save'
                                onClick={updateRoleHandler}
                                disabled={roleLoading}
                            >
                                {roleLoading ? 'Saving...' : 'Save Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Page header ────────────────────────────── */}
            <div className='aul-header'>
                <div className='aul-header__left'>
                    <FaUsers className='aul-header__icon' aria-hidden='true' />
                    <div>
                        <h1 className='aul-header__title'>User Management</h1>
                        <p className='aul-header__subtitle'>
                            All registered accounts on ShopZone
                        </p>
                    </div>
                </div>

                {/* Right-side count pills */}
                <div className='aul-header__counts'>
                    <div className='aul-count-pill'>
                        <span className='aul-count-pill__num'>{users.length}</span>
                        <span className='aul-count-pill__label'>Total Users</span>
                    </div>
                    {newIn24h > 0 && (
                        <div className='aul-count-pill aul-count-pill--amber'>
                            <span className='aul-count-pill__num'>{newIn24h}</span>
                            <span className='aul-count-pill__label'>New Today</span>
                        </div>
                    )}
                    <div className='aul-count-pill aul-count-pill--oxford'>
                        <span className='aul-count-pill__num'>{adminCount}</span>
                        <span className='aul-count-pill__label'>Admins</span>
                    </div>
                </div>
            </div>

            {/* ── Tab bar ────────────────────────────────── */}
            <ScrollableTabBar className='aul-tabs' role='tablist'>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`aul-tab ${activeTab === tab.key ? 'aul-tab--active' : ''}`}
                        onClick={() => setSearchParams({ tab: tab.key })}
                        role='tab'
                        aria-selected={activeTab === tab.key}
                    >
                        {tab.key === 'all'       && <FaUsers aria-hidden='true' />}
                        {tab.key === 'customers' && <FaUser aria-hidden='true' />}
                        {tab.key === 'admins'    && <FaUserShield aria-hidden='true' />}
                        {tab.label}
                        <span className={`aul-tab__count ${tab.countMod === 'oxford' ? 'aul-tab__count--oxford' : ''}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </ScrollableTabBar>

            {/* ── Search bar ─────────────────────────────── */}
            <div className='aul-search-bar'>
                <FaSearch className='aul-search-bar__icon' aria-hidden='true' />
                <input
                    type='text'
                    className='aul-search-bar__input'
                    placeholder='Search by name or email...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label='Search users'
                />
                {search && (
                    <button
                        className='aul-search-bar__clear'
                        onClick={() => setSearch('')}
                        aria-label='Clear search'
                    >
                        <FaTimes aria-hidden='true' />
                    </button>
                )}
            </div>

            {/* ── Error ──────────────────────────────────── */}
            {error && (
                <div className='aul-error'>
                    <FaExclamationTriangle aria-hidden='true' /> {error}
                </div>
            )}

            {/* ── Content ────────────────────────────────── */}
            {loading ? (
                <div className='aul-state'>
                    <div className='aul-spinner' aria-label='Loading…' />
                    <p>Loading users…</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className='aul-state'>
                    <FaUsers aria-hidden='true' />
                    <p>
                        {search
                            ? `No users matching "${search}"`
                            : `No ${activeTab === 'all' ? '' : activeTab} users found.`
                        }
                    </p>
                    {search && (
                        <button className='aul-clear-btn' onClick={() => setSearch('')}>
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className='aul-table-wrap'>
                    <p className='aul-results-count'>
                        {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                    </p>
                    <table className='aul-table' aria-label='Users table'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>County</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr
                                    key={user._id}
                                    className={`aul-row ${index % 2 !== 0 ? 'aul-row--alt' : ''} ${user._id === userInfo._id ? 'aul-row--self' : ''}`}
                                    onClick={() => navigate(`/admin/users/${user._id}`)}
                                    style={{ cursor: 'pointer' }}
                                    title={`View ${user.name}'s profile`}
                                >
                                    {/* Name */}
                                    <td className='aul-cell-name'>
                                        <div className='aul-name-wrap'>
                                            <div className='aul-avatar'>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className='aul-name'>
                                                    {user.name}
                                                    {user._id === userInfo._id && (
                                                        <span className='aul-you-label'> (you)</span>
                                                    )}
                                                </span>
                                                {user.isSeller && (
                                                    <span className='aul-seller-tag'>Seller</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className='aul-cell-muted'>
                                        <a
                                            href={`mailto:${user.email}`}
                                            className='aul-email-link'
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {user.email}
                                        </a>
                                    </td>

                                    {/* Role badge */}
                                    <td>
                                        {user.isAdmin ? (
                                            <span className='aul-badge aul-badge--admin'>
                                                <FaUserShield aria-hidden='true' /> Admin
                                            </span>
                                        ) : (
                                            <span className='aul-badge aul-badge--customer'>
                                                <FaUser aria-hidden='true' /> Customer
                                            </span>
                                        )}
                                    </td>

                                    {/* County */}
                                    <td className='aul-cell-muted'>
                                        {user.county || '—'}
                                    </td>

                                    {/* Joined */}
                                    <td className='aul-cell-muted'>
                                        {new Date(user.createdAt).toLocaleDateString('en-KE', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                                    </td>

                                    {/* Actions — stop propagation so row click doesn't fire */}
                                    <td onClick={(e) => e.stopPropagation()}>
                                        {user._id === userInfo._id ? (
                                            <span className='aul-current-label'>Current account</span>
                                        ) : (
                                            <div className='aul-actions'>
                                                <button
                                                    className='aul-action-btn aul-action-btn--role'
                                                    onClick={() => openRoleModal(user)}
                                                    aria-label={`Edit role for ${user.name}`}
                                                >
                                                    <FaUserEdit aria-hidden='true' /> Role
                                                </button>
                                                <button
                                                    className='aul-action-btn aul-action-btn--delete'
                                                    onClick={() => confirmDelete(user._id, user.name)}
                                                    aria-label={`Delete ${user.name}`}
                                                >
                                                    <FaTrash aria-hidden='true' /> Delete
                                                </button>
                                            </div>
                                        )}
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

export default AdminUserListPage;