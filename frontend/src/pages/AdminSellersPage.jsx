// frontend/src/pages/AdminSellersPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page — manage seller applications and approved sellers.
// Shows all users who have any seller status (pending, approved,
// suspended, rejected). Admin can approve, reject, or suspend.
//
// Follows the same pattern as AdminUserListPage.jsx exactly.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Table, Alert, Spinner, Badge,
} from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import axios from 'axios';
import { showToast } from '../components/Toast/Toast';
import './AdminSellersPage.css';

// ── Status badge helper ───────────────────────────────────────
const SellerStatusBadge = ({ status }) => {
  const map = {
    pending:  { cls: 'asl-badge--pending',  label: 'Pending'  },
    approved: { cls: 'asl-badge--approved', label: 'Approved' },
    suspended:{ cls: 'asl-badge--suspended',label: 'Suspended'},
    rejected: { cls: 'asl-badge--rejected', label: 'Rejected' },
    none:     { cls: 'asl-badge--none',     label: 'None'     },
  };
  const s = map[status] || map.none;
  return <Badge className={s.cls}>{s.label}</Badge>;
};

const AdminSellersPage = () => {
  const navigate  = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => { document.title = 'Admin: Sellers — ShopZone'; }, []);

  const [sellers,  setSellers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // ── Filter tab — which seller statuses to show ────────────
  const [activeTab, setActiveTab] = useState('pending');

  // ── Action confirmation modal ─────────────────────────────
  const [showModal,    setShowModal]    = useState(false);
  const [modalUser,    setModalUser]    = useState(null);
  const [modalAction,  setModalAction]  = useState(''); // 'approve' | 'reject' | 'suspend'
  const [actionLoading,setActionLoading]= useState(false);

  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) { navigate('/login'); return; }
    fetchSellers();
  }, [userInfo, navigate]);

  // Fetch all users who have any seller status set
  const fetchSellers = async () => {
    try {
      setLoading(true);
      // Fetch all users then filter client-side for seller status
      // Phase 2: add a dedicated /api/users?sellerOnly=true endpoint
      const { data } = await axios.get('/api/users', config);
      // Only show users who have applied or have a seller status
      const sellerUsers = data.filter((u) => u.sellerStatus && u.sellerStatus !== 'none');
      setSellers(sellerUsers);
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      setLoading(false);
    }
  };

  // Open confirmation modal for approve/reject/suspend
  const openAction = (user, action) => {
    setModalUser(user);
    setModalAction(action);
    setShowModal(true);
  };

  // Map action to the status value sent to the backend
  const actionToStatus = {
    approve:  'approved',
    reject:   'rejected',
    suspend:  'suspended',
    reinstate:'approved',
  };

  // Run the status update after confirmation
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
      setActionLoading(false);
      showToast(
        `${modalUser.name} has been ${newStatus}.`,
        newStatus === 'approved' ? 'success' : 'info'
      );
      fetchSellers();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      showToast(msg, 'error');
      setActionLoading(false);
      setShowModal(false);
    }
  };

  // Modal copy per action
  const modalCopy = {
    approve:  { title: 'Approve Seller',   message: `Approve ${modalUser?.name} as a seller? They will gain access to the seller dashboard immediately.`, label: 'Approve', variant: 'primary-branded' },
    reject:   { title: 'Reject Application',message: `Reject ${modalUser?.name}'s seller application? They will not be able to access the seller dashboard.`, label: 'Reject', variant: 'danger' },
    suspend:  { title: 'Suspend Seller',   message: `Suspend ${modalUser?.name}? They will lose seller dashboard access until reinstated.`, label: 'Suspend', variant: 'danger' },
    reinstate:{ title: 'Reinstate Seller', message: `Reinstate ${modalUser?.name} as an approved seller?`, label: 'Reinstate', variant: 'primary-branded' },
  };

  // Filter sellers by active tab
  const filtered = sellers.filter((u) => u.sellerStatus === activeTab);

  // Tab counts
  const counts = {
    pending:  sellers.filter((u) => u.sellerStatus === 'pending').length,
    approved: sellers.filter((u) => u.sellerStatus === 'approved').length,
    suspended:sellers.filter((u) => u.sellerStatus === 'suspended').length,
    rejected: sellers.filter((u) => u.sellerStatus === 'rejected').length,
  };

  return (
    <>
      {/* ── Confirmation modal ────────────────────────────── */}
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

      {/* ── Page header ───────────────────────────────────── */}
      <div className='asl-header'>
        <h2 className='asl-page-title'>Seller Management</h2>
        <span className='asl-count'>{sellers.length} seller account{sellers.length !== 1 ? 's' : ''}</span>
      </div>

      {error && <Alert variant='danger'>{error}</Alert>}

      {/* ── Status filter tabs ────────────────────────────── */}
      <div className='asl-tabs'>
        {[
          { key: 'pending',   label: 'Pending'   },
          { key: 'approved',  label: 'Approved'  },
          { key: 'suspended', label: 'Suspended' },
          { key: 'rejected',  label: 'Rejected'  },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`asl-tab${activeTab === key ? ' asl-tab--active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
            <span className='asl-tab-count'>{counts[key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className='text-center py-5'>
          <Spinner animation='border' className='asl-spinner' />
        </div>
      ) : filtered.length === 0 ? (
        <Alert className='asl-empty-alert'>
          No {activeTab} seller applications.
        </Alert>
      ) : (
        <Table responsive hover className='asl-table'>
          <thead>
            <tr className='asl-thead-row'>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Business</th>
              <th>Applied</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user._id} className='asl-tbody-row'>
                <td className='asl-name-cell'>{user.name}</td>
                <td className='asl-email-cell'>
                  <a href={`mailto:${user.email}`} className='asl-email-link'>{user.email}</a>
                </td>
                <td className='asl-muted-cell'>{user.phone || '—'}</td>
                <td className='asl-muted-cell'>
                  {user.sellerProfile?.businessName || user.businessName || '—'}
                </td>
                <td className='asl-muted-cell'>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </td>
                <td><SellerStatusBadge status={user.sellerStatus} /></td>
                <td>
                  <div className='asl-actions'>
                    {/* Approve — show for pending and rejected */}
                    {(user.sellerStatus === 'pending' || user.sellerStatus === 'rejected') && (
                      <button className='asl-btn asl-btn--approve' onClick={() => openAction(user, 'approve')}>
                        Approve
                      </button>
                    )}
                    {/* Reject — show for pending */}
                    {user.sellerStatus === 'pending' && (
                      <button className='asl-btn asl-btn--reject' onClick={() => openAction(user, 'reject')}>
                        Reject
                      </button>
                    )}
                    {/* Suspend — show for approved */}
                    {user.sellerStatus === 'approved' && (
                      <button className='asl-btn asl-btn--suspend' onClick={() => openAction(user, 'suspend')}>
                        Suspend
                      </button>
                    )}
                    {/* Reinstate — show for suspended */}
                    {user.sellerStatus === 'suspended' && (
                      <button className='asl-btn asl-btn--approve' onClick={() => openAction(user, 'reinstate')}>
                        Reinstate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default AdminSellersPage;