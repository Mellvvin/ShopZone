// src/components/CategoryBar/CategoryBar.jsx
// ─────────────────────────────────────────────────────────────
// Desktop second navbar bar.
// Contains: Deals | Categories ▾ (mega-menu) | Brands | Bulk Orders | More ▾
//
// Props:
//   none — reads its own state internally
// ─────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaChevronDown, FaThList,
    FaMobileAlt, FaTshirt, FaScroll, FaHome, FaShoppingBasket,
    FaSpa, FaTools, FaPencilAlt, FaSeedling, FaBaby,
    FaRunning, FaHeartbeat, FaBoxOpen,
} from 'react-icons/fa';
import './CategoryBar.css';

// ── Category data ─────────────────────────────────────────────
// Each entry has: label shown in the grid, icon component, value
// passed to the URL query string.
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

// ── More dropdown links ───────────────────────────────────────
const MORE_LINKS = [
    { label: 'About Us', to: '/about' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Contact Support', to: '/contact' },
    { label: 'Become a Seller', to: '/become-seller' },
    { label: 'Shipping Policy', to: '/shipping-policy' },
    { label: 'Returns Policy', to: '/returns-policy' },
];

const CategoryBar = () => {
    const navigate = useNavigate();

    // ── Dropdown open/close state ──────────────────────────────
    const [catOpen, setCatOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);

    // ── Refs for outside-click detection ──────────────────────
    const catRef = useRef(null);
    const moreRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
            if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Navigate to filtered category page ────────────────────
    const handleCategory = (value) => {
        navigate(`/?category=${encodeURIComponent(value)}`);
        setCatOpen(false);
    };

    return (
        <div className='category-bar'>
            <div className='category-bar-container'>
                <nav className='category-bar-nav'>

                    {/* ── Home ───────────────────────────────────────── */}
                    <Link to='/' className='catbar-link'>
                        Home
                    </Link>

                    {/* ── Deals ──────────────────────────────────────── */}
                    <Link to='/?deals=true' className='catbar-link'>
                        Deals
                    </Link>

                    {/* ── Categories mega-dropdown ───────────────────── */}
                    <div className='catbar-dropdown-wrapper' ref={catRef}>
                        <button
                            className={`catbar-link catbar-trigger ${catOpen ? 'active' : ''}`}
                            onClick={() => { setCatOpen(!catOpen); setMoreOpen(false); }}
                            aria-expanded={catOpen}
                            aria-haspopup='true'
                        >
                            Categories
                            <FaChevronDown className={`catbar-chevron ${catOpen ? 'open' : ''}`} />
                        </button>

                        {/* Mega-menu panel */}
                        {catOpen && (
                            <div className='mega-menu' role='menu'>
                                {/* 4-column grid of category cells */}
                                <div className='mega-menu-grid'>
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            className='mega-menu-item'
                                            onClick={() => handleCategory(cat.value)}
                                            role='menuitem'
                                        >
                                            {/* Oxford Blue icon box */}
                                            <span className='mega-menu-icon'>{cat.icon}</span>
                                            {/* Category name label */}
                                            <span className='mega-menu-label'>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* View all link at bottom of mega-menu */}
                                <div className='mega-menu-footer'>
                                    <button
                                        className='mega-menu-view-all'
                                        onClick={() => { navigate('/'); setCatOpen(false); }}
                                    >
                                        <FaThList />
                                        View All Categories
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Brands ─────────────────────────────────────── */}
                    <Link to='/brands' className='catbar-link'>Brands</Link>

                    {/* ── Bulk Orders ────────────────────────────────── */}
                    <Link to='/contact' className='catbar-link'>Bulk Orders</Link>

                    {/* ── More dropdown ──────────────────────────────── */}
                    <div className='catbar-dropdown-wrapper' ref={moreRef}>
                        <button
                            className={`catbar-link catbar-trigger ${moreOpen ? 'active' : ''}`}
                            onClick={() => { setMoreOpen(!moreOpen); setCatOpen(false); }}
                            aria-expanded={moreOpen}
                            aria-haspopup='true'
                        >
                            More
                            <FaChevronDown className={`catbar-chevron ${moreOpen ? 'open' : ''}`} />
                        </button>

                        {/* Simple vertical dropdown */}
                        {moreOpen && (
                            <div className='simple-dropdown' role='menu'>
                                {MORE_LINKS.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className='simple-dropdown-item'
                                        role='menuitem'
                                        onClick={() => setMoreOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                </nav>
            </div>
        </div>
    );
};

export default CategoryBar;