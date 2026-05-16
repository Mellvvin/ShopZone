// src/components/DesktopDropdownMenu/DesktopDropdownMenu.jsx
// ─────────────────────────────────────────────────────────────
// The hamburger dropdown menu shown on desktop.
// Contains: user greeting, admin links, regular links, logout.
//
// Props:
//   userInfo      {object|null} — from Redux auth state
//   onClose       {function}   — closes the dropdown
//   onLogout      {function}   — dispatches logout + redirect
//   dropdownRef   {ref}        — forwarded ref for outside-click detection
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaCog, FaUsers, FaBox, FaClipboardList,
    FaEnvelope, FaQuestionCircle, FaStore, FaSignOutAlt,
} from 'react-icons/fa';
import './DesktopDropdownMenu.css';

const DesktopDropdownMenu = ({ userInfo, onClose, onLogout }) => {
    const navigate = useNavigate();

    // ── Navigate then close ────────────────────────────────────
    const go = (path) => { navigate(path); onClose(); };

    // ── Admin links — only rendered when user is admin ─────────
    const adminLinks = [
        { icon: <FaCog size={13} />, label: 'Products', to: '/admin/products' },
        { icon: <FaBox size={13} />, label: 'Orders', to: '/admin/orders' },
        { icon: <FaUsers size={13} />, label: 'Users', to: '/admin/users' },
    ];

    // ── General links — shown to all users ─────────────────────
    const generalLinks = [
        { icon: <FaClipboardList size={13} />, label: 'Order History', to: '/profile', href: null },
        { icon: <FaEnvelope size={13} />, label: 'Contact Support', to: null, href: 'mailto:support@shopzone.com' },
        { icon: <FaQuestionCircle size={13} />, label: 'FAQ', to: null, href: null },
        { icon: <FaStore size={13} />, label: 'Become a Seller', to: null, href: null },
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

            {/* ── Admin links ────────────────────────────────────── */}
            {userInfo?.isAdmin && adminLinks.map((item) => (
                <div
                    key={item.label}
                    className='desktop-dropdown-item desktop-dropdown-item--admin'
                    onClick={() => go(item.to)}
                    role='menuitem'
                >
                    {item.icon}
                    <span>{item.label}</span>
                </div>
            ))}

            {/* ── General links ──────────────────────────────────── */}
            {generalLinks.map((item, i) => (
                <div
                    key={i}
                    className='desktop-dropdown-item'
                    onClick={() => {
                        onClose();
                        if (item.to) navigate(item.to);
                        if (item.href) window.location.href = item.href;
                    }}
                    role='menuitem'
                >
                    {item.icon}
                    <span>{item.label}</span>
                </div>
            ))}

            {/* ── Logout — logged-in only ────────────────────────── */}
            {userInfo && (
                <div
                    className='desktop-dropdown-item desktop-dropdown-item--logout'
                    onClick={onLogout}
                    role='menuitem'
                >
                    <FaSignOutAlt size={13} />
                    <span>Logout</span>
                </div>
            )}
        </div>
    );
};

export default DesktopDropdownMenu;