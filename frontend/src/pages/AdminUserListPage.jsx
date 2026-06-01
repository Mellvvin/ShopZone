// frontend/src/pages/AdminUserListPage/AdminUserListPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page — lists all users with role edit and delete.
// All inline styles removed and moved to AdminUserListPage.css.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Table, Button, Alert,
  Spinner, Badge, Form,
} from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';
import './AdminUserListPage.css';

const AdminUserListPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => { document.title = 'Admin: User List — ShopZone'; }, []);

  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [deleteId, setDeleteId]                 = useState(null);
  const [deleteName, setDeleteName]             = useState('');
  const [deleteLoading, setDeleteLoading]       = useState(false);

  // Role modal
  const [showRoleModal, setShowRoleModal]   = useState(false);
  const [selectedUser, setSelectedUser]     = useState(null);
  const [isAdmin, setIsAdmin]               = useState(false);
  const [roleLoading, setRoleLoading]       = useState(false);

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) { navigate('/login'); return; }
    fetchUsers();
  }, [userInfo, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
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

  const confirmDelete = (id, name) => { setDeleteId(id); setDeleteName(name); setShowDeleteModal(true); };

  const deleteHandler = async () => {
    try {
      setDeleteLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
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

  const openRoleModal = (user) => { setSelectedUser(user); setIsAdmin(user.isAdmin); setShowRoleModal(true); };

  const updateRoleHandler = async () => {
    try {
      setRoleLoading(true);
      const config = {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.put(`/api/users/${selectedUser._id}`, { isAdmin }, config);
      setShowRoleModal(false);
      setRoleLoading(false);
      showToast(`${selectedUser.name}'s role updated to ${isAdmin ? 'Admin' : 'Customer'}.`, 'success');
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
      {/* ── Delete confirmation modal ─────────────────────── */}
      <ConfirmModal
        show={showDeleteModal}
        onConfirm={deleteHandler}
        onCancel={() => setShowDeleteModal(false)}
        title='Delete User'
        message={`Are you sure you want to delete ${deleteName}?`}
        subMessage="This will permanently remove their account. Their orders remain in the system."
        confirmLabel={deleteLoading ? 'Deleting...' : 'Yes, Delete'}
        confirmVariant='danger'
      />

      {/* ── Role modal — still needs its own UI, keeping Bootstrap Modal ── */}
      {showRoleModal && selectedUser && (
        <div className='aul-modal-overlay' onClick={() => setShowRoleModal(false)}>
          <div className='aul-modal' onClick={(e) => e.stopPropagation()} role='dialog' aria-modal='true' aria-labelledby='role-modal-title'>
            <div className='aul-modal-header'>
              <h5 className='aul-modal-title' id='role-modal-title'>Edit User Role</h5>
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
              <button className='aul-modal-cancel' onClick={() => setShowRoleModal(false)}>Cancel</button>
              <button className='aul-modal-save' onClick={updateRoleHandler} disabled={roleLoading}>
                {roleLoading ? 'Saving...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ───────────────────────────────────── */}
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2 className='aul-page-title'>All Users</h2>
        <span className='aul-user-count'>{users.length} registered users</span>
      </div>

      {error && <Alert variant='danger'>{error}</Alert>}

      {loading ? (
        <div className='text-center py-5'>
          <Spinner animation='border' className='aul-spinner' />
        </div>
      ) : users.length === 0 ? (
        <Alert className='aul-empty-alert'>No users found.</Alert>
      ) : (
        <Table responsive hover className='aul-table'>
          <thead>
            <tr className='aul-thead-row'>
              <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user._id}
                className={`aul-tbody-row${index % 2 === 0 ? '' : ' aul-tbody-row--alt'}${user._id === userInfo._id ? ' aul-tbody-row--self' : ''}`}
              >
                <td className='aul-id-cell'>...{user._id.slice(-8)}</td>
                <td className='aul-name-cell'>
                  {user.name}
                  {user._id === userInfo._id && <span className='aul-you-label'>(you)</span>}
                </td>
                <td className='aul-email-cell'>
                  <a href={`mailto:${user.email}`} className='aul-email-link'>{user.email}</a>
                </td>
                <td>
                  {user.isAdmin ? (
                    <Badge className='aul-badge--admin'>Admin</Badge>
                  ) : (
                    <Badge className='aul-badge--customer'>Customer</Badge>
                  )}
                </td>
                <td className='aul-muted-cell'>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  {user._id === userInfo._id ? (
                    <span className='aul-current-label'>Current account</span>
                  ) : (
                    <div className='d-flex gap-2'>
                      <Button size='sm' className='aul-role-btn' onClick={() => openRoleModal(user)}>Role</Button>
                      <Button size='sm' variant='danger' className='aul-action-btn' onClick={() => confirmDelete(user._id, user.name)}>Delete</Button>
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