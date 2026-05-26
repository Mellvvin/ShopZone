// frontend/src/pages/AdminUserListPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page — lists all users with role edit and delete.
// Toasts added for: user deleted, role updated, errors.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Table, Button, Alert,
    Spinner, Badge, Modal, Form,
} from 'react-bootstrap';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';

const AdminUserListPage = () => {
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    // ── Page title ─────────────────────────────────────────────
    useEffect(() => { document.title = 'Admin: User List — ShopZone'; }, []);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteName, setDeleteName] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Role modal state
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [roleLoading, setRoleLoading] = useState(false);

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
            return;
        }
        fetchUsers();
    }, [userInfo, navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            };
            const { data } = await axios.get('/api/users', config);
            setUsers(data);
            setLoading(false);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            showToast(msg, 'error');
            setLoading(false);
        }
    };

    // ── Delete handlers ───────────────────────────────────────
    const confirmDelete = (id, name) => {
        setDeleteId(id);
        setDeleteName(name);
        setShowDeleteModal(true);
    };

    const deleteHandler = async () => {
        try {
            setDeleteLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            };
            await axios.delete(`/api/users/${deleteId}`, config);
            setShowDeleteModal(false);
            setDeleteLoading(false);
            showToast(`${deleteName} has been removed.`, 'success');
            fetchUsers();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            showToast(msg, 'error');
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    };

    // ── Role handlers ─────────────────────────────────────────
    const openRoleModal = (user) => {
        setSelectedUser(user);
        setIsAdmin(user.isAdmin);
        setShowRoleModal(true);
    };

    const updateRoleHandler = async () => {
        try {
            setRoleLoading(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.put(
                `/api/users/${selectedUser._id}`,
                { isAdmin },
                config
            );
            setShowRoleModal(false);
            setRoleLoading(false);
            showToast(`${selectedUser.name}'s role has been updated to ${isAdmin ? 'Admin' : 'Customer'}.`, 'success');
            fetchUsers();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            showToast(msg, 'error');
            setRoleLoading(false);
        }
    };

    return (
        <>
            {/* ── Delete Confirmation Modal ─────────────────────── */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header style={{ backgroundColor: 'var(--oxford-blue)' }}>
                    <Modal.Title style={{ color: 'var(--tan)' }}>Delete User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete <strong>{deleteName}</strong>?</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        This will permanently remove their account. Their orders remain in the system.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='light'
                        onClick={() => setShowDeleteModal(false)}
                        style={{ borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}
                    >
                        Cancel
                    </Button>
                    <Button variant='danger' onClick={deleteHandler} disabled={deleteLoading}>
                        {deleteLoading ? <Spinner animation='border' size='sm' /> : 'Yes, Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ── Edit Role Modal ───────────────────────────────── */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
                <Modal.Header style={{ backgroundColor: 'var(--oxford-blue)' }}>
                    <Modal.Title style={{ color: 'var(--tan)' }}>Edit User Role</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <>
                            <p style={{ marginBottom: '0.25rem' }}>
                                <strong style={{ color: 'var(--oxford-blue)' }}>{selectedUser.name}</strong>
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                                {selectedUser.email}
                            </p>
                            <Form.Group>
                                <Form.Label style={{ color: 'var(--oxford-blue)', fontWeight: 600 }}>Role</Form.Label>
                                <Form.Select
                                    value={isAdmin ? 'admin' : 'customer'}
                                    onChange={(e) => setIsAdmin(e.target.value === 'admin')}
                                >
                                    <option value='customer'>Customer</option>
                                    <option value='admin'>Admin</option>
                                </Form.Select>
                                <Form.Text style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    Admins have full access to the dashboard, products, orders and users.
                                </Form.Text>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='light'
                        onClick={() => setShowRoleModal(false)}
                        style={{ borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}
                    >
                        Cancel
                    </Button>
                    <Button variant='dark' onClick={updateRoleHandler} disabled={roleLoading}>
                        {roleLoading ? <Spinner animation='border' size='sm' /> : 'Save Role'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ── Page header ──────────────────────────────────── */}
            <div className='d-flex justify-content-between align-items-center mb-4'>
                <h2 style={{ color: 'var(--oxford-blue)' }} className='page-title'>All Users</h2>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {users.length} registered users
                </span>
            </div>

            {error && <Alert variant='danger'>{error}</Alert>}

            {loading ? (
                <div className='text-center py-5'>
                    <Spinner animation='border' style={{ color: 'var(--oxford-blue)' }} />
                </div>
            ) : users.length === 0 ? (
                <Alert style={{ backgroundColor: 'var(--tan-light)', borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}>
                    No users found.
                </Alert>
            ) : (
                <Table responsive hover style={{ fontSize: '0.88rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)' }}>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr
                                key={user._id}
                                style={{ backgroundColor: index % 2 === 0 ? 'white' : '#FAFAF9', verticalAlign: 'middle', opacity: user._id === userInfo._id ? 0.7 : 1 }}
                            >
                                <td style={{ fontFamily: 'Courier New', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    ...{user._id.slice(-8)}
                                </td>
                                <td style={{ fontWeight: 500, color: 'var(--oxford-blue)' }}>
                                    {user.name}
                                    {user._id === userInfo._id && (
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.4rem', fontWeight: 400 }}>
                                            (you)
                                        </span>
                                    )}
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>
                                    <a href={`mailto:${user.email}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                                        {user.email}
                                    </a>
                                </td>
                                <td>
                                    {user.isAdmin ? (
                                        <Badge style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)', fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px' }}>
                                            Admin
                                        </Badge>
                                    ) : (
                                        <Badge style={{ backgroundColor: '#F5F0EB', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px', border: '1px solid #EAE0D5' }}>
                                            Customer
                                        </Badge>
                                    )}
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    {user._id === userInfo._id ? (
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Current account</span>
                                    ) : (
                                        <div className='d-flex gap-2'>
                                            <Button
                                                size='sm'
                                                onClick={() => openRoleModal(user)}
                                                style={{ backgroundColor: 'var(--oxford-blue)', color: 'var(--tan)', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                                            >
                                                Role
                                            </Button>
                                            <Button
                                                size='sm'
                                                variant='danger'
                                                onClick={() => confirmDelete(user._id, user.name)}
                                                style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </>
    );
};

export default AdminUserListPage;