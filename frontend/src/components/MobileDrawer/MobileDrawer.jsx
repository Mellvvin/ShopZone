// src/components/MobileDrawer/MobileDrawer.jsx
// ─────────────────────────────────────────────────────────────
// Custom CSS slide-in drawer for mobile navigation.
// Replaces the Bootstrap Offcanvas component.
//
// Shows:
//   • User avatar + name + email  (logged in)
//   • Sign In + Register buttons  (logged out)
//   • Browse section: Deals, Brands, Bulk Orders
//   • Categories section: icon + name per category
//   • Support section
//   • Admin section (isAdmin only)
//   • Sign Out button pinned at bottom (logged in)
//
// Props:
//   isOpen    {boolean}  — controls slide-in/out
//   onClose   {function} — closes the drawer
//   userInfo  {object|null} — from Redux auth
//   onLogout  {function} — dispatches logout
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaTimes, FaSignOutAlt,
    FaMobileAlt, FaTshirt, FaScroll, FaHome, FaShoppingBasket,
    FaSpa, FaTools, FaPencilAlt, FaSeedling, FaBaby,
    FaRunning, FaHeartbeat, FaBoxOpen,
    FaEnvelope, FaQuestionCircle, FaStore,
    FaCog, FaBox, FaUsers,
} from 'react-icons/fa';
import './MobileDrawer.css';

// ── Category list (same source of truth as CategoryBar) ───────
const CATEGORIES = [
    { label: 'Electronics', icon: <FaMobileAlt />, value: 'Electronics' },
    { label: 'Fashion & Apparel', icon: <FaTshirt />, value: 'Fashion' },
    { label: 'Fabric & Textiles', icon: <FaScroll />, value: 'Fabric' },
    { label: 'Home & Kitchen', icon: <FaHome />, value: 'Home' },
    { label: 'Food & Grocery', icon: <FaShoppingBasket />, value: 'Food' },
    { label: 'Beauty & Personal Care', icon: <FaSpa />, value: 'Beauty' },
    { label: 'Hardware & Tools', icon: <FaTools />, value: 'Hardware' },
    { label: 'Office & Stationery', icon: <FaPencilAlt />, value: 'Office' },
    { label: 'Agriculture & Garden', icon: <FaSeedling />, value: 'Agriculture' },
    { label: 'Baby & Kids', icon: <FaBaby />, value: 'Baby' },
    { label: 'Sports & Outdoors', icon: <FaRunning />, value: 'Sports' },
    { label: 'Health & Wellness', icon: <FaHeartbeat />, value: 'Health' },
    { label: 'General Merchandise', icon: <FaBoxOpen />, value: 'General' },
];

const MobileDrawer = ({ isOpen, onClose, userInfo, onLogout }) => {
    const navigate = useNavigate();

    // Navigate to category filtered page then close drawer
    const handleCategory = (value) => {
        navigate(`/?category=${encodeURIComponent(value)}`);
        onClose();
    };

    // Navigate to path then close drawer
    const go = (path) => { navigate(path); onClose(); };

    return (
        <>
            {/* ── Dim overlay — closes drawer on tap ──────────── */}
            {isOpen && (
                <div
                    className='drawer-overlay'
                    onClick={onClose}
                    aria-hidden='true'
                />
            )}

            {/* ── Drawer panel ────────────────────────────────── */}
            <div
                className={`mobile-drawer ${isOpen ? 'mobile-drawer--open' : ''}`}
                aria-hidden={!isOpen}
            >

                {/* ── Close button ──────────────────────────────── */}
                <button
                    className='drawer-close-btn'
                    onClick={onClose}
                    aria-label='Close menu'
                >
                    <FaTimes />
                </button>

                {/* ════════════════════════════════════════════════
            USER INFO — logged in
        ════════════════════════════════════════════════ */}
                {userInfo ? (
                    <div className='drawer-user-info'>
                        {/* First letter of name as avatar */}
                        <div className='drawer-avatar'>
                            {userInfo.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className='drawer-user-name'>{userInfo.name}</div>
                            <div className='drawer-user-email'>{userInfo.email}</div>
                        </div>
                    </div>
                ) : (
                    /* ── Auth buttons — logged out ──────────────── */
                    <div className='drawer-auth-links'>
                        <Link to='/login' className='drawer-auth-btn drawer-auth-btn--primary' onClick={onClose}>Sign In</Link>
                        <Link to='/register' className='drawer-auth-btn drawer-auth-btn--outline' onClick={onClose}>Register</Link>
                    </div>
                )}

                <hr className='drawer-divider' />

                {/* ════════════════════════════════════════════════
            BROWSE SECTION
        ════════════════════════════════════════════════ */}
                <p className='drawer-section-title'>Browse</p>
                <nav className='drawer-nav'>
                    <button className='drawer-nav-link' onClick={() => go('/?deals=true')}>Deals</button>
                    <button className='drawer-nav-link' onClick={() => go('/brands')}>Brands</button>
                    <button className='drawer-nav-link' onClick={() => go('/contact')}>Bulk Orders</button>
                </nav>

                <hr className='drawer-divider' />

                {/* ════════════════════════════════════════════════
            CATEGORIES SECTION
        ════════════════════════════════════════════════ */}
                <p className='drawer-section-title'>Categories</p>
                <nav className='drawer-nav'>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            className='drawer-nav-link drawer-cat-link'
                            onClick={() => handleCategory(cat.value)}
                        >
                            {/* Oxford Blue icon box */}
                            <span className='drawer-cat-icon'>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </nav>

                <hr className='drawer-divider' />

                {/* ════════════════════════════════════════════════
            SUPPORT SECTION
        ════════════════════════════════════════════════ */}
                <p className='drawer-section-title'>Support</p>
                <nav className='drawer-nav'>
                    <a
                        className='drawer-nav-link'
                        href='mailto:support@shopzone.com'
                        onClick={onClose}
                    >
                        <FaEnvelope size={13} style={{ marginRight: '0.5rem' }} />
                        Contact Support
                    </a>
                <button className='drawer-nav-link' onClick={onClose}>
                    <FaQuestionCircle size={13} style={{ marginRight: '0.5rem' }} />
                    FAQ
                </button>
                <button className='drawer-nav-link' onClick={onClose}>
                    <FaStore size={13} style={{ marginRight: '0.5rem' }} />
                    Become a Seller
                </button>
            </nav>

            {/* ════════════════════════════════════════════════
            ADMIN SECTION — isAdmin only
        ════════════════════════════════════════════════ */}
            {userInfo?.isAdmin && (
                <>
                    <hr className='drawer-divider' />
                    <p className='drawer-section-title'>Admin</p>
                    <nav className='drawer-nav'>
                        <button className='drawer-nav-link' onClick={() => go('/admin/products')}>
                            <FaCog size={13} style={{ marginRight: '0.5rem' }} /> Products
                        </button>
                        <button className='drawer-nav-link' onClick={() => go('/admin/orders')}>
                            <FaBox size={13} style={{ marginRight: '0.5rem' }} /> Orders
                        </button>
                        <button className='drawer-nav-link' onClick={() => go('/admin/users')}>
                            <FaUsers size={13} style={{ marginRight: '0.5rem' }} /> Users
                        </button>
                    </nav>
                </>
            )}

            {/* ════════════════════════════════════════════════
            SIGN OUT — pinned at bottom, logged-in only
        ════════════════════════════════════════════════ */}
            {userInfo && (
                <div className='drawer-logout-wrapper'>
                    <button className='drawer-logout-btn' onClick={onLogout}>
                        <FaSignOutAlt />
                        Sign Out
                    </button>
                </div>
            )}

            </div>
        </>
    );
};

export default MobileDrawer;