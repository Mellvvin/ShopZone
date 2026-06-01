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
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaTimes, FaSignOutAlt,
    FaMobileAlt, FaTshirt, FaScroll, FaHome, FaShoppingBasket,
    FaSpa, FaTools, FaPencilAlt, FaSeedling, FaBaby,
    FaRunning, FaHeartbeat, FaBoxOpen,
    FaEnvelope, FaQuestionCircle, FaStore,
    FaCog, FaBox, FaUsers, FaTruck, FaUndoAlt,
} from 'react-icons/fa';
import './MobileDrawer.css';

// ── Category list (same source of truth as CategoryBar) ───────
const CATEGORIES = [
    { label: 'Electronics', icon: <FaMobileAlt />, value: 'Electronics' },
    { label: 'Fashion & Apparel', icon: <FaTshirt />, value: 'Fashion & Apparel' },
    { label: 'Fabric & Textiles', icon: <FaScroll />, value: 'Fabric & Textiles' },
    { label: 'Home & Kitchen', icon: <FaHome />, value: 'Home & Kitchen' },
    { label: 'Food & Grocery', icon: <FaShoppingBasket />, value: 'Food & Grocery' },
    { label: 'Beauty & Personal Care', icon: <FaSpa />, value: 'Beauty & Personal Care' },
    { label: 'Hardware & Tools', icon: <FaTools />, value: 'Hardware & Tools' },
    { label: 'Office & Stationery', icon: <FaPencilAlt />, value: 'Office & Stationery' },
    { label: 'Agriculture & Garden', icon: <FaSeedling />, value: 'Agriculture & Garden' },
    { label: 'Baby & Kids', icon: <FaBaby />, value: 'Baby & Kids' },
    { label: 'Sports & Outdoors', icon: <FaRunning />, value: 'Sports & Outdoors' },
    { label: 'Health & Wellness', icon: <FaHeartbeat />, value: 'Health & Wellness' },
    { label: 'General Merchandise', icon: <FaBoxOpen />, value: 'General Merchandise' },
];

const MobileDrawer = ({ isOpen, onClose, userInfo, onLogout }) => {
    const navigate = useNavigate();
    const drawerRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Store the element that had focus before drawer opened
            previousFocusRef.current = document.activeElement;
            // Focus the drawer panel so keyboard users are inside it
            setTimeout(() => drawerRef.current?.focus(), 50);
            // Prevent background scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Restore focus to the element that triggered the drawer
            document.body.style.overflow = '';
            setTimeout(() => previousFocusRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key !== 'Tab') return;
            const focusable = drawerRef.current?.querySelectorAll(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable || focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

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
                role='dialog'
                aria-modal='true'
                aria-label='Navigation menu'
                tabIndex={-1}
                ref={drawerRef}
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
                    <button className='drawer-nav-link' onClick={() => go('/offers')}>Deals</button>
                    <button className='drawer-nav-link' onClick={() => go('/brands')}>Brands</button>
                    <button className='drawer-nav-link' onClick={() => go('/bulk-orders')}>Bulk Orders</button>
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
                   <button className='drawer-nav-link' onClick={() => go('/contact')}>
                        <FaEnvelope className='drawer-support-icon' aria-hidden='true' />
                        Contact Support
                    </button>
                    <button className='drawer-nav-link' onClick={() => go('/faq')}>
                    <FaQuestionCircle className='drawer-support-icon' aria-hidden='true' />
                    FAQ
                </button>
                <button className='drawer-nav-link' onClick={() => go('/become-seller')}>
                    <FaStore className='drawer-support-icon' aria-hidden='true' />
                    Become a Seller
                </button>
                <button className='drawer-nav-link' onClick={() => go('/shipping-policy')}>
                    <FaTruck className='drawer-support-icon' aria-hidden='true' />
                    Shipping Policy
                </button>
                <button className='drawer-nav-link' onClick={() => go('/returns-policy')}>
                    <FaUndoAlt className='drawer-support-icon' aria-hidden='true' />
                    Returns Policy
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
                            {/* Products — inline style removed, now uses drawer-support-icon class */}
                            <button className='drawer-nav-link' onClick={() => go('/admin/products')}>
                                <FaCog className='drawer-support-icon' aria-hidden='true' /> Products
                            </button>
                            {/* Orders */}
                            <button className='drawer-nav-link' onClick={() => go('/admin/orders')}>
                                <FaBox className='drawer-support-icon' aria-hidden='true' /> Orders
                            </button>
                            {/* Users */}
                            <button className='drawer-nav-link' onClick={() => go('/admin/users')}>
                                <FaUsers className='drawer-support-icon' aria-hidden='true' /> Users
                            </button>
                            {/* Enquiries */}
                            <button className='drawer-nav-link' onClick={() => go('/admin/enquiries')}>
                                <FaEnvelope className='drawer-support-icon' aria-hidden='true' /> Enquiries
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