// frontend/src/pages/NotificationsPage.jsx
// ─────────────────────────────────────────────────────────────
// Full notification history page — the real "see everything"
// destination the bell dropdown's "View all" link now leads to,
// instead of dropping the user on /profile with no notification
// content at all. Working-page design system: simple Oxford Blue
// hero strip, no cinematic particles/typewriter.
//
// Fetches up to 200 most recent notifications (backend caps any
// requested limit at 200). Known simplification: no infinite-scroll
// pagination yet, just a larger single fetch than the bell's 50 —
// revisit if notification volume per user ever grows past that.
//
// Clicking a notification marks it read (if unread) and navigates to
// notif.link, falling back to /order/:relatedOrderId for older
// notifications saved before the link field existed — identical
// behaviour to NotificationBell, just on a full page.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  FaBell, FaCheckDouble, FaShoppingBag,
  FaBolt, FaBullhorn, FaInbox,
} from 'react-icons/fa';
import { formatDateShort, formatDateTime } from '../utils/formatDateTime';
import './NotificationsPage.css';

// Same icon-by-type logic as NotificationBell — kept local since
// these are the only two places that need it.
const NotifIcon = ({ type, relatedOrderId }) => {
  if (relatedOrderId) return <FaShoppingBag className='np-item__icon np-item__icon--order' aria-hidden='true' />;
  if (type === 'promotional') return <FaBullhorn className='np-item__icon np-item__icon--promo' aria-hidden='true' />;
  return <FaBolt className='np-item__icon np-item__icon--default' aria-hidden='true' />;
};

// Relative time for recent notifications, falling back to an
// absolute Africa/Nairobi date for anything older than a week —
// identical pattern to NotificationBell's timeAgo.
const timeAgo = (dateStr) => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return formatDateShort(dateStr);
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [filter,        setFilter]        = useState('all'); // 'all' | 'unread'

  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  useEffect(() => {
    document.title = 'Notifications — ShopZone';
    if (!userInfo) {
      navigate('/login', { state: { from: '/notifications' } });
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (!userInfo) return;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/notifications?limit=200', config);
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load notifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userInfo]);

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await axios.put(`/api/notifications/${notif._id}/read`, {}, config);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Non-blocking — still navigate even if the read-mark fails
      }
    }
    const destination = notif.link || (notif.relatedOrderId ? `/order/${notif.relatedOrderId}` : null);
    if (destination) navigate(destination);
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all', {}, config);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silent fail — matches existing bell behaviour
    }
  };

  const visibleNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  if (!userInfo) return null;

  return (
    <div className='np-page'>
      <div className='np-hero'>
        <div className='np-hero__eyebrow'>
          <FaBell aria-hidden='true' /> Your Updates
        </div>
        <h1 className='np-hero__title'>Notifications</h1>
        <p className='np-hero__sub'>
          Order updates, account alerts, and offers — all in one place.
        </p>
      </div>

      <div className='np-body'>
        <div className='np-controls'>
          <div className='np-tabs' role='tablist'>
            <button
              className={`np-tab${filter === 'all' ? ' np-tab--active' : ''}`}
              onClick={() => setFilter('all')}
              role='tab'
              aria-selected={filter === 'all'}
            >
              All
            </button>
            <button
              className={`np-tab${filter === 'unread' ? ' np-tab--active' : ''}`}
              onClick={() => setFilter('unread')}
              role='tab'
              aria-selected={filter === 'unread'}
            >
              Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </button>
          </div>

          {unreadCount > 0 && (
            <button className='np-mark-all' onClick={handleMarkAllRead}>
              <FaCheckDouble aria-hidden='true' /> Mark all read
            </button>
          )}
        </div>

        {error && <div className='np-error'>{error}</div>}

        {loading ? (
          <div className='np-loading'>Loading your notifications…</div>
        ) : visibleNotifications.length === 0 ? (
          <div className='np-empty'>
            <FaInbox className='np-empty__icon' aria-hidden='true' />
            <p>{filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}</p>
            <span>Order updates, account alerts, and offers will appear here.</span>
          </div>
        ) : (
          <div className='np-list'>
            {visibleNotifications.map((notif) => (
              <button
                key={notif._id}
                className={`np-item${notif.isRead ? ' np-item--read' : ' np-item--unread'}`}
                onClick={() => handleNotifClick(notif)}
              >
                {!notif.isRead && <span className='np-item__dot' aria-hidden='true' />}
                <NotifIcon type={notif.type} relatedOrderId={notif.relatedOrderId} />
                <div className='np-item__body'>
                  <span className='np-item__title'>{notif.title}</span>
                  <span className='np-item__message'>{notif.message}</span>
                  <span className='np-item__time' title={formatDateTime(notif.createdAt)}>
                    {timeAgo(notif.createdAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;