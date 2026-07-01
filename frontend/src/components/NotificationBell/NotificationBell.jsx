// frontend/src/components/NotificationBell/NotificationBell.jsx
// ─────────────────────────────────────────────────────────────
// Notification bell component — sits in the Header desktop and
// mobile icon rows. Shows an unread count badge. Clicking opens
// a dropdown panel listing recent notifications.
//
// Fetches on mount when the user is logged in.
// Marks notifications as read on click or via "Mark all read".
// Clicking a notification with a relatedOrderId navigates to
// the order page.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaBell, FaCheckDouble, FaBoxOpen, FaShoppingBag, FaBolt, FaBullhorn } from 'react-icons/fa';
import { formatDateShort } from '../../utils/formatDateTime';
import './NotificationBell.css';

// ── Icon picker based on notification type ────────────────────
// Returns an icon component for the notification panel rows
const NotifIcon = ({ type, relatedOrderId }) => {
  if (relatedOrderId) return <FaShoppingBag className='notif-item__icon notif-item__icon--order' aria-hidden='true' />;
  if (type === 'promotional') return <FaBullhorn className='notif-item__icon notif-item__icon--promo' aria-hidden='true' />;
  return <FaBolt className='notif-item__icon notif-item__icon--default' aria-hidden='true' />;
};

// ── Relative time formatter ────────────────────────────────────
// Converts a timestamp to a human-readable relative string
// e.g. "2 hours ago", "just now", "3 days ago"
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
if (days < 7)   return `${days}d ago`;
  // Older than a week — show the actual date in Africa/Nairobi time,
  // never the viewer's device timezone (ISS-015).
  return formatDateShort(dateStr);
};

const NotificationBell = () => {
  const navigate  = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [open,          setOpen]          = useState(false);
  const [loading,       setLoading]       = useState(false);

  // Ref for outside-click detection
  const panelRef = useRef(null);

  // ── Fetch notifications ───────────────────────────────────
  const fetchNotifications = async () => {
    if (!userInfo) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/notifications', config);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Silent fail — bell just shows no notifications
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds so new notifications appear without a page refresh
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userInfo]);

  // ── Close on outside click ────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Mark one as read and optionally navigate ──────────────
  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.put(`/api/notifications/${notif._id}/read`, {}, config);
        setNotifications(prev =>
          prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {
        // Silent fail
      }
    }
  // Navigate to the link attached to this notification.
    // link is set at creation time in the backend controller.
    // relatedOrderId fallback handles notifications created before
    // the link field was added.
    const destination = notif.link || (notif.relatedOrderId ? `/order/${notif.relatedOrderId}` : null);
    if (destination) {
      setOpen(false);
      navigate(destination);
    }
  };

  // ── Mark all as read ──────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put('/api/notifications/read-all', {}, config);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silent fail
    }
  };

  // Don't render if user is not logged in
  if (!userInfo) return null;

  return (
    <div className='notif-bell-wrapper' ref={panelRef}>

      {/* ── Bell button ──────────────────────────────────── */}
      <button
        className='notif-bell-btn nav-icon-link'
        onClick={() => setOpen(v => !v)}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup='true'
      >
        <FaBell size={20} />
        <span className='header-icon-label'>Alerts</span>
        {unreadCount > 0 && (
          <span className='notif-bell-badge' aria-hidden='true'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ───────────────────────────────── */}
      {open && (
        <div className='notif-panel' role='dialog' aria-label='Notifications'>

          {/* Panel header */}
          <div className='notif-panel__header'>
            <span className='notif-panel__title'>Notifications</span>
            {unreadCount > 0 && (
              <button
                className='notif-panel__mark-all'
                onClick={handleMarkAllRead}
                aria-label='Mark all notifications as read'
              >
                <FaCheckDouble size={11} aria-hidden='true' />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className='notif-panel__list'>
            {loading && notifications.length === 0 ? (
              <div className='notif-panel__empty'>
                <p>Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className='notif-panel__empty'>
                <FaBoxOpen className='notif-panel__empty-icon' aria-hidden='true' />
                <p>No notifications yet.</p>
                <span>Order updates and alerts will appear here.</span>
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif._id}
                  className={`notif-item ${notif.isRead ? 'notif-item--read' : 'notif-item--unread'}`}
                  onClick={() => handleNotifClick(notif)}
                  aria-label={`${notif.isRead ? '' : 'Unread: '}${notif.title}`}
                >
                  {/* Unread indicator dot */}
                  {!notif.isRead && <span className='notif-item__dot' aria-hidden='true' />}

                  {/* Icon */}
                  <NotifIcon type={notif.type} relatedOrderId={notif.relatedOrderId} />

                  {/* Text */}
                  <div className='notif-item__body'>
                    <span className='notif-item__title'>{notif.title}</span>
                    <span className='notif-item__message'>{notif.message}</span>
                    <span className='notif-item__time'>{timeAgo(notif.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>

        {/* Panel footer — leads to the real full-history page now,
              not /profile, which never actually showed notifications */}
          {notifications.length > 0 && (
            <div className='notif-panel__footer'>
              <button
                className='notif-panel__footer-btn'
                onClick={() => { setOpen(false); navigate('/notifications'); }}
              >
                View all notifications
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default NotificationBell;