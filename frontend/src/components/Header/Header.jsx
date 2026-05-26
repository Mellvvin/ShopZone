// src/components/Header/Header.jsx
// ─────────────────────────────────────────────────────────────
// Orchestrator component. Owns state and passes props down.
// Contains NO inline styles — all styling in Header.css.
//
// Renders:
//   TopBar
//     └─ ShopZoneLogo
//     └─ SearchBar (desktop)
//     └─ Desktop icon row (cart, profile, hamburger)
//        └─ DesktopDropdownMenu (when hamburger clicked)
//   MobileSearchBar (slides down on mobile)
//   CategoryBar (desktop second navbar)
//   MobileDrawer
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from 'react-bootstrap';
import {
  FaShoppingCart, FaUser, FaBars, FaSearch, FaTimes,
} from 'react-icons/fa';

import { logout } from '../../redux/slices/authSlice';
import { clearCartItems } from '../../redux/slices/cartSlice';
import { listProducts } from '../../redux/slices/productSlice';
import { showToast } from '../Toast/Toast';

import ShopZoneLogo from '../ShopZoneLogo/ShopZoneLogo';
import SearchBar from '../SearchBar/SearchBar';
import DesktopDropdownMenu from '../DesktopDropdownMenu/DesktopDropdownMenu';
import CategoryBar from '../CategoryBar/CategoryBar';
import MobileDrawer from '../MobileDrawer/MobileDrawer';


import './Header.css';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Redux state ────────────────────────────────────────────
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  // ── Local state ────────────────────────────────────────────
  const [keyword, setKeyword] = useState('');   // search input
  const [showSearch, setShowSearch] = useState(false);// mobile search slide-down
  const [showDrawer, setShowDrawer] = useState(false);// mobile drawer
  const [showDropdown, setShowDropdown] = useState(false);// desktop hamburger dropdown

  // Ref for desktop dropdown outside-click detection
  const dropdownRef = useRef(null);
  // Ref for hamburger button — focus returns here when dropdown closes
  const hamburgerRef = useRef(null);

  // ── Cart badge count ───────────────────────────────────────
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // ── Cart announcement for screen readers ───────────────────
  // Visually hidden span with aria-live announces cart changes
  // without interrupting the user — rendered in the JSX below
  const cartAnnouncement = totalItems > 0
    ? `Cart updated, ${totalItems} item${totalItems !== 1 ? 's' : ''}`
    : 'Cart is empty';

  // ── Clear search + close mobile search on route change ─────
  useEffect(() => {
    setKeyword('');
    setShowSearch(false);
  }, [location.pathname]);

  // ── Close desktop dropdown on outside click ────────────────
  // Returns focus to hamburger button when dropdown closes via outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        if (showDropdown) {
          setShowDropdown(false);
          // Restore focus to the button that opened the dropdown
          setTimeout(() => hamburgerRef.current?.focus(), 50);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  // ── Handlers ───────────────────────────────────────────────

  const logoutHandler = () => {
    dispatch(logout());
    dispatch(clearCartItems());
    showToast('You have been signed out. See you soon!', 'info');
    setShowDropdown(false);
    setShowDrawer(false);
    navigate('/');
  };

  // Dispatches product list with keyword, navigates to home
  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      // Navigate to homepage with keyword as URL param.
      // HomePage reads this param and dispatches listProducts.
      navigate(`/?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/');
    }
  };

  // Clears input only — results remain on screen
  const clearSearch = () => {
    setKeyword('');
    navigate('/');
  };

  return (
    <header className='site-header'>
      {/* Visually hidden live region — announces cart quantity changes to screen readers */}
      <span className='visually-hidden' aria-live='polite' aria-atomic='true'>
        {cartAnnouncement}
      </span>

      {/* ══════════════════════════════════════════════════════
          TOP BAR — Oxford Blue background
      ══════════════════════════════════════════════════════ */}
      <div className='header-top-bar'>
        <div className='header-container'>

          {/* ── Logo ───────────────────────────────────────── */}
          {/* dark=true — Tan colours on Oxford Blue background */}
          <ShopZoneLogo dark={true} size='medium' />

          {/* ── Desktop search bar (hidden on mobile) ──────── */}
          <div className='header-desktop-search'>
            <SearchBar
              keyword={keyword}
              setKeyword={setKeyword}
              onSubmit={submitHandler}
              onClear={clearSearch}
              placeholder='Search products, categories and brands...'
            />
          </div>

          {/* ── Desktop icons (hidden on mobile) ───────────── */}
          <div className='header-desktop-icons'>

            {/* Cart with live badge and label */}
            <Link to='/cart' className='nav-icon-link header-icon-cart' aria-label=' Cart'>
              <FaShoppingCart size={22} />
              <span className='header-icon-label'>Cart</span>
              {totalItems > 0 && (
                <Badge bg='' className='header-cart-badge'>{totalItems}</Badge>
              )}
            </Link>

            {/* Profile — goes to profile or login, with label */}
            <Link
              to={userInfo ? '/profile' : '/login'}
              className='nav-icon-link header-icon-profile'
              aria-label=' Profile'
            >
              <FaUser size={20} />
              <span className='header-icon-label'>
                {userInfo ? userInfo.name.split(' ')[0] : 'Sign In'}
              </span>
            </Link>

            {/* Desktop hamburger with custom dropdown */}
            <div className='header-dropdown-wrapper' ref={dropdownRef}>
              <button
                className='nav-icon-link header-hamburger-btn'
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label='Open menu'
                aria-expanded={showDropdown}
                ref={hamburgerRef}
              >
                <FaBars size={22} />
              </button>

              {/* Dropdown menu — rendered when hamburger clicked */}
              {showDropdown && (
                <DesktopDropdownMenu
                  userInfo={userInfo}
                  onClose={() => setShowDropdown(false)}
                  onLogout={logoutHandler}
                />
              )}
            </div>
          </div>

          {/* ── Mobile icons (hidden on desktop) ───────────── */}
          <div className='header-mobile-icons'>

            {/* Mobile search toggle */}
            <button
              className='nav-icon-link header-mobile-btn'
              onClick={() => setShowSearch(!showSearch)}
              aria-label='Toggle search'
            >
              <FaSearch size={20} />
            </button>

            {/* Mobile cart with badge */}
            <Link to='/cart' className='nav-icon-link header-icon-cart' aria-label='Cart'>
              <FaShoppingCart size={22} />
              {totalItems > 0 && (
                <Badge bg='' className='header-cart-badge'>{totalItems}</Badge>
              )}
            </Link>

            {/* Mobile profile */}
            <Link
              to={userInfo ? '/profile' : '/login'}
              className='nav-icon-link'
              aria-label='Profile'
            >
              <FaUser size={20} />
            </Link>

            {/* Mobile hamburger — opens drawer */}
            <button
              className='nav-icon-link header-mobile-btn'
              onClick={() => setShowDrawer(true)}
              aria-label='Open drawer'
            >
              <FaBars size={22} />
            </button>
          </div>

        </div>{/* /header-container */}
      </div>{/* /header-top-bar */}

      {/* ══════════════════════════════════════════════════════
          MOBILE SEARCH SLIDE-DOWN
          Appears below the top bar when search icon is tapped.
      ══════════════════════════════════════════════════════ */}
      {showSearch && (
        <div className='header-mobile-search-panel'>
          <div className='header-container'>
            <SearchBar
              keyword={keyword}
              setKeyword={setKeyword}
              onSubmit={submitHandler}
              onClear={clearSearch}
              placeholder='Search products...'
              autoFocus={true}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          CATEGORY BAR — desktop second navbar
          Hidden on mobile via CSS in CategoryBar.css
      ══════════════════════════════════════════════════════ */}
      <CategoryBar />

      {/* ══════════════════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════════════════ */}
      <MobileDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        userInfo={userInfo}
        onLogout={logoutHandler}
      />

    </header>
  );
};

export default Header;