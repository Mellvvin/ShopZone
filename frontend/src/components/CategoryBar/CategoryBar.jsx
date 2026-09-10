// frontend/src/components/CategoryBar/CategoryBar.jsx
// ─────────────────────────────────────────────────────────────
// Desktop second navbar bar.
//
// Categories behaviour:
//   - Hover opens the mega-menu
//   - Click locks it open (ignores hover close timer)
//   - Clicking the trigger again OR clicking outside unlocks and closes
//
// More behaviour:
//   - Hover opens the dropdown
//   - Click locks it open
//   - Clicking the trigger again OR clicking outside unlocks and closes
// ─────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    FaChevronDown, FaThList, FaStore,
    FaMobileAlt, FaTshirt, FaScroll, FaHome, FaShoppingBasket,
    FaSpa, FaTools, FaPencilAlt, FaSeedling, FaBaby,
    FaRunning, FaHeartbeat, FaBoxOpen,
    FaInfoCircle, FaQuestionCircle, FaHeadset, FaTruck, FaUndoAlt,
} from 'react-icons/fa';
import './CategoryBar.css';

// ── Category data — values match MongoDB exactly ──────────────
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
    { label: 'About Us', to: '/about', icon: <FaInfoCircle /> },
    { label: 'FAQ', to: '/faq', icon: <FaQuestionCircle /> },
    { label: 'Contact Support', to: '/contact', icon: <FaHeadset /> },
    { label: 'Shipping Policy', to: '/shipping-policy', icon: <FaTruck /> },
    { label: 'Returns Policy', to: '/returns-policy', icon: <FaUndoAlt /> },
];

const CategoryBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Home should only read as "active" when truly on the bare
    // homepage — not when a category selection has redirected here
    // with a ?category= query string still pointing at '/'.
    const isHomeActive = location.pathname === '/' && !location.search;

    // ── State ─────────────────────────────────────────────────
    // open   — whether the menu is visible (hover OR locked)
    // locked — whether the menu is pinned open by a click
    const [catOpen, setCatOpen] = useState(false);
    const [catLocked, setCatLocked] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [moreLocked, setMoreLocked] = useState(false);

    // ── Refs ──────────────────────────────────────────────────
    const catCloseTimer = useRef(null);
    const moreCloseTimer = useRef(null);
    const catRef = useRef(null);
    const moreRef = useRef(null);

    // ── Close both menus when clicking outside ────────────────
    useEffect(() => {
        const handler = (e) => {
            if (catRef.current && !catRef.current.contains(e.target)) {
                setCatOpen(false);
                setCatLocked(false);
            }
            if (moreRef.current && !moreRef.current.contains(e.target)) {
                setMoreOpen(false);
                setMoreLocked(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ══ CATEGORIES handlers ═══════════════════════════════════

    // Mouse enters trigger or menu — open immediately, cancel close timer
    const handleCatEnter = useCallback(() => {
        if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
        setCatOpen(true);
    }, []);

    // Mouse leaves trigger or menu — close after delay UNLESS locked
    const handleCatLeave = useCallback(() => {
        if (catLocked) return;   // locked by click — ignore hover close
        catCloseTimer.current = setTimeout(() => {
            setCatOpen(false);
        }, 120);
    }, [catLocked]);

    // Click trigger — toggle lock
    // If not locked: lock it open
    // If locked: unlock and close
    const handleCatClick = () => {
        if (catLocked) {
            // Unlock — close the menu
            setCatLocked(false);
            setCatOpen(false);
        } else {
            // Lock open
            setCatLocked(true);
            setCatOpen(true);
            // Close More if it was open
            setMoreOpen(false);
            setMoreLocked(false);
        }
    };

    // Navigate to category page then close and unlock
    const handleCategory = (value) => {
        navigate(`/?category=${encodeURIComponent(value)}`);
        setCatOpen(false);
        setCatLocked(false);
    };

    // ══ MORE handlers ═════════════════════════════════════════

    const handleMoreEnter = useCallback(() => {
        if (moreCloseTimer.current) clearTimeout(moreCloseTimer.current);
        setMoreOpen(true);
    }, []);

    const handleMoreLeave = useCallback(() => {
        if (moreLocked) return;
        moreCloseTimer.current = setTimeout(() => {
            setMoreOpen(false);
        }, 120);
    }, [moreLocked]);

    const handleMoreClick = () => {
        if (moreLocked) {
            setMoreLocked(false);
            setMoreOpen(false);
        } else {
            setMoreLocked(true);
            setMoreOpen(true);
            // Close Categories if open
            setCatOpen(false);
            setCatLocked(false);
        }
    };

    return (
        <div className='category-bar'>
            <div className='category-bar-container'>
                <nav className='category-bar-nav'>

                     {/* ── Home ───────────────────────────────────────── */}
                    <Link
                        to='/'
                        className={`catbar-link${isHomeActive ? ' active' : ''}`}
                    >
                        Home
                    </Link>

                    {/* ── Deals ──────────────────────────────────────── */}
                    <NavLink
                        to='/offers'
                        className={({ isActive }) => `catbar-link${isActive ? ' active' : ''}`}
                    >
                        Deals
                    </NavLink>

                    {/* ── Categories ─────────────────────────────────── */}
                    <div
                        className='catbar-dropdown-wrapper'
                        ref={catRef}
                        onMouseEnter={handleCatEnter}
                        onMouseLeave={handleCatLeave}
                    >
                        <button
                            className={`catbar-link catbar-trigger ${catOpen ? 'active' : ''}`}
                            onClick={handleCatClick}
                            aria-expanded={catOpen}
                            aria-haspopup='true'
                        >
                            Categories
                            {/* Chevron rotates when open, shows lock icon when locked */}
                            <FaChevronDown className={`catbar-chevron ${catOpen ? 'open' : ''}`} />
                        </button>

                        {catOpen && (
                            <div
                                className='mega-menu'
                                role='menu'
                                onMouseEnter={handleCatEnter}
                                onMouseLeave={handleCatLeave}
                            >
                                <div className='mega-menu-grid'>
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            className='mega-menu-item'
                                            onClick={() => handleCategory(cat.value)}
                                            role='menuitem'
                                        >
                                            <span className='mega-menu-icon'>{cat.icon}</span>
                                            <span className='mega-menu-label'>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className='mega-menu-footer'>
                                   <button
                                        className='mega-menu-view-all'
                                        onClick={() => {
                                            navigate('/brands');
                                            setCatOpen(false);
                                            setCatLocked(false);
                                        }}
                                    >
                                        <FaThList /> View All Categories
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                                        {/* ── Brands ─────────────────────────────────────── */}
                    <NavLink
                        to='/brands'
                        className={({ isActive }) => `catbar-link${isActive ? ' active' : ''}`}
                    >
                        Brands
                    </NavLink>

                    {/* ── Bulk Orders ────────────────────────────────── */}
                    <NavLink
                        to='/bulk-orders'
                        className={({ isActive }) => `catbar-link${isActive ? ' active' : ''}`}
                    >
                        Bulk Orders
                    </NavLink>

                    {/* ── Become a Seller — promoted out of More dropdown */}
                    <NavLink
                        to='/become-seller'
                        className={({ isActive }) => `catbar-link catbar-link--seller${isActive ? ' active' : ''}`}
                    >
                        Become a Seller
                    </NavLink>

                    {/* ── More ───────────────────────────────────────── */}
                    <div
                        className='catbar-dropdown-wrapper'
                        ref={moreRef}
                        onMouseEnter={handleMoreEnter}
                        onMouseLeave={handleMoreLeave}
                    >
                        <button
                            className={`catbar-link catbar-trigger ${moreOpen ? 'active' : ''}`}
                            onClick={handleMoreClick}
                            aria-expanded={moreOpen}
                            aria-haspopup='true'
                        >
                            More
                            <FaChevronDown className={`catbar-chevron ${moreOpen ? 'open' : ''}`} />
                        </button>

                        {moreOpen && (
                            <div
                                className='simple-dropdown'
                                role='menu'
                                onMouseEnter={handleMoreEnter}
                                onMouseLeave={handleMoreLeave}
                            >
                                    {MORE_LINKS.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        className={({ isActive }) => `simple-dropdown-item${isActive ? ' active' : ''}`}
                                        role='menuitem'
                                        onClick={() => {
                                            setMoreOpen(false);
                                            setMoreLocked(false);
                                        }}
                                    >
                                        <span className='simple-dropdown-icon'>{link.icon}</span>
                                        {link.label}
                                    </NavLink>
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