// frontend/src/components/CategoryBar/CategoryBar.jsx
// ─────────────────────────────────────────────────────────────
// Desktop second navbar bar.
// Contains: Home | Deals | Categories ▾ | Brands | Bulk Orders | More ▾
//
// Categories mega-menu:
//   - Opens on hover (mouse enters the trigger)
//   - Stays open while hovering over the menu itself
//   - Closes when mouse leaves both the trigger and the menu
//   - Also toggles on click for keyboard/touch users
//
// Category values match exactly what is stored in MongoDB.
// ─────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaChevronDown, FaThList,
    FaMobileAlt, FaTshirt, FaScroll, FaHome, FaShoppingBasket,
    FaSpa, FaTools, FaPencilAlt, FaSeedling, FaBaby,
    FaRunning, FaHeartbeat, FaBoxOpen,
} from 'react-icons/fa';
import './CategoryBar.css';

// ── Category data ─────────────────────────────────────────────
// Values must exactly match the category strings in MongoDB.
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

    // ── Dropdown state ────────────────────────────────────────
    const [catOpen, setCatOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);

    // ── Hover timeout ref ─────────────────────────────────────
    // Used to add a small delay before closing the mega-menu
    // so the user has time to move the mouse from the trigger
    // button into the menu panel without it closing.
    const closeTimer = useRef(null);

    // ── Hover handlers for Categories mega-menu ───────────────

    // Called when mouse enters the trigger button OR the menu panel
    const handleCatMouseEnter = useCallback(() => {
        // Cancel any pending close timer
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setCatOpen(true);
        setMoreOpen(false);
    }, []);

    // Called when mouse leaves the trigger button OR the menu panel
    // Uses a short delay so moving between trigger and panel
    // does not cause a flicker close.
    const handleCatMouseLeave = useCallback(() => {
        closeTimer.current = setTimeout(() => {
            setCatOpen(false);
        }, 120);
    }, []);

    // ── Click handler for Categories ──────────────────────────
    // Toggles the menu open/closed on click for accessibility
    const handleCatClick = () => {
        setCatOpen((prev) => !prev);
        setMoreOpen(false);
    };

    // ── Navigate to category filtered page ────────────────────
    const handleCategory = (value) => {
        navigate(`/?category=${encodeURIComponent(value)}`);
        setCatOpen(false);
    };

    // ── More dropdown handlers ────────────────────────────────
    const handleMoreClick = () => {
        setMoreOpen((prev) => !prev);
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
                    {/* Wrapper handles hover events for both trigger     */}
                    {/* and menu panel so the menu stays open when the    */}
                    {/* mouse moves between them.                         */}
                    <div
                        className='catbar-dropdown-wrapper'
                        onMouseEnter={handleCatMouseEnter}
                        onMouseLeave={handleCatMouseLeave}
                    >
                        {/* Trigger button — click also toggles */}
                        <button
                            className={`catbar-link catbar-trigger ${catOpen ? 'active' : ''}`}
                            onClick={handleCatClick}
                            aria-expanded={catOpen}
                            aria-haspopup='true'
                        >
                            Categories
                            <FaChevronDown className={`catbar-chevron ${catOpen ? 'open' : ''}`} />
                        </button>

                        {/* Mega-menu panel */}
                        {catOpen && (
                            <div
                                className='mega-menu'
                                role='menu'
                                // Keep the menu open when mouse is inside it
                                onMouseEnter={handleCatMouseEnter}
                                onMouseLeave={handleCatMouseLeave}
                            >
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
                                            {/* Category name */}
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
                    <div className='catbar-dropdown-wrapper'>
                        <button
                            className={`catbar-link catbar-trigger ${moreOpen ? 'active' : ''}`}
                            onClick={handleMoreClick}
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