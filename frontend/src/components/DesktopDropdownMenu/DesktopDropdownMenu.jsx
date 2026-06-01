// src/components/DesktopDropdownMenu/DesktopDropdownMenu.jsx
// ─────────────────────────────────────────────────────────────
// The hamburger dropdown menu shown on desktop.
// Opens on hover, locks open on click.
// Contains: user greeting, admin links, regular links, logout.
//
// Props:
//   userInfo    {object|null} — from Redux auth state
//   onClose     {function}   — closes the dropdown
//   onLogout    {function}   — dispatches logout + redirect
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCog, FaUsers, FaBox, FaClipboardList,
    FaEnvelope, FaQuestionCircle, FaStore,
    FaSignOutAlt,
} from 'react-icons/fa';
import './DesktopDropdownMenu.css';

const DesktopDropdownMenu = ({ userInfo, onClose, onLogout }) => {
    const navigate = useNavigate();

    // ── Navigate then close ────────────────────────────────────
    const go = (path) => { navigate(path); onClose(); };

    // ── Admin links — only rendered when user is admin ─────────
    const adminLinks = [
        { icon: <FaCog size={13} />,          label: 'Products',   to: '/admin/products' },
        { icon: <FaBox size={13} />,           label: 'Orders',     to: '/admin/orders' },
        { icon: <FaUsers size={13} />,         label: 'Users',      to: '/admin/users' },
        // Enquiries — all form submissions from across the site
        { icon: <FaEnvelope size={13} />,      label: 'Enquiries',  to: '/admin/enquiries' },
    ];

   // ── General links — kept minimal, most nav lives in CategoryBar ──
    // Policy pages and bulk orders are in CategoryBar More menu.
    // Mailto links are banned here — Contact Support goes to /contact.
    const generalLinks = [
        { icon: <FaClipboardList size={13} />, label: 'Order History',   to: '/profile' },
        { icon: <FaEnvelope size={13} />,      label: 'Contact Support', to: '/contact' },
        { icon: <FaQuestionCircle size={13} />,label: 'FAQ',             to: '/faq' },
        { icon: <FaStore size={13} />,         label: 'Become a Seller', to: '/become-seller' },
    ];

    return (
        <div className='desktop-dropdown'>

            {/* ── Arrow pointer ──────────────────────────────────── */}
            <div className='desktop-dropdown-arrow' />

            {/* ── User greeting — logged-in only ────────────────── */}
            {userInfo && (
                <div className='desktop-dropdown-greeting'>
                    <p className='desktop-dropdown-name'>
                        Hi, {userInfo.name.split(' ')[0]}
                    </p>
                    <p className='desktop-dropdown-email'>{userInfo.email}</p>
                </div>
            )}

            {/* ── Admin section ──────────────────────────────────── */}
            {userInfo?.isAdmin && (
                <>
                    {/* Admin section label */}
                    <div className='desktop-dropdown-section-label'>
                        Admin
                    </div>
                    {adminLinks.map((item) => (
                        <div
                            key={item.label}
                            className='desktop-dropdown-item desktop-dropdown-item--admin'
                            onClick={() => go(item.to)}
                            role='menuitem'
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && go(item.to)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    ))}
                    {/* Divider between admin and general links */}
                    <div className='desktop-dropdown-divider' aria-hidden='true' />
                </>
            )}

            {/* ── General links ──────────────────────────────────── */}
            {generalLinks.map((item) => (
                <div
                    key={item.label}
                    className='desktop-dropdown-item'
                    onClick={() => go(item.to)}
                    role='menuitem'
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && go(item.to)}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </div>
            ))}

            {/* ── Logout — logged-in only ────────────────────────── */}
            {userInfo && (
                <>
                    <div className='desktop-dropdown-divider' aria-hidden='true' />
                    <div
                        className='desktop-dropdown-item desktop-dropdown-item--logout'
                        onClick={onLogout}
                        role='menuitem'
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onLogout()}
                    >
                        <FaSignOutAlt size={13} />
                        <span>Logout</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default DesktopDropdownMenu;