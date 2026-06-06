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
import { useState, useEffect, useRef, useCallback } from 'react';
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
import NotificationBell from '../NotificationBell/NotificationBell';



import './Header.css';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Redux state ────────────────────────────────────────────
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

// ── Local state ────────────────────────────────────────────
  const [keyword, setKeyword] = useState('');        // search input
  const [showSearch, setShowSearch] = useState(false); // mobile search slide-down
  const [showDrawer, setShowDrawer] = useState(false);  // mobile drawer
  const [showDropdown, setShowDropdown] = useState(false); // desktop dropdown open
  const [dropdownLocked, setDropdownLocked] = useState(false); // click-locked open

// Timer ref for hover close delay — prevents flicker when
  // mouse briefly leaves the trigger before reaching the menu
  const dropdownHoverTimer = useRef(null);

  // Ref for desktop dropdown outside-click detection
  const dropdownRef = useRef(null);
  // Ref for hamburger button — focus returns here when dropdown closes
  const hamburgerRef = useRef(null);
  // Ref on the <header> element itself — used for scroll-condensed class
  // toggling without triggering a React re-render on every scroll event
  const headerRef = useRef(null);

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

  // ── Condensed navbar on scroll ─────────────────────────────
  // Adds header--condensed to the <header> element once the user
  // scrolls past 80px. Uses a ref toggle instead of setState so
  // the scroll handler never causes a React re-render.
  // The CSS transition handles the visual smoothness.
  useEffect(() => {
    const SCROLL_THRESHOLD = 80;

    const handleScroll = () => {
      const header = headerRef.current;
      if (!header) return;
      if (window.scrollY > SCROLL_THRESHOLD) {
        header.classList.add('header--condensed');
      } else {
        header.classList.remove('header--condensed');
      }
    };

    // Run once on mount in case page loads mid-scroll
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

// ── Close desktop dropdown on outside click ────────────────
  // Closes both hover and locked states when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        if (showDropdown) {
          setShowDropdown(false);
          setDropdownLocked(false);
          setTimeout(() => hamburgerRef.current?.focus(), 50);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  // ── Dropdown hover handlers ────────────────────────────────
  // Mouse enters the wrapper — open immediately, cancel any
  // pending close timer
  const handleDropdownMouseEnter = () => {
    if (dropdownHoverTimer.current) clearTimeout(dropdownHoverTimer.current);
    setShowDropdown(true);
  };

  // Mouse leaves the wrapper — close after 150ms delay UNLESS
  // the dropdown has been locked open by a click
  const handleDropdownMouseLeave = () => {
    if (dropdownLocked) return;
    dropdownHoverTimer.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  // Click handler — toggle lock state
  // First click: locks open so hover-close is ignored
  // Second click: unlocks and closes
  const handleHamburgerClick = () => {
    if (dropdownLocked) {
      // Unlock and close
      setDropdownLocked(false);
      setShowDropdown(false);
    } else {
      // Lock open
      setDropdownLocked(true);
      setShowDropdown(true);
    }
  };

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
    <header className='site-header' ref={headerRef}>
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

            {/* Notification bell — only shown when logged in */}
            <NotificationBell />

            {/* Desktop hamburger — hover opens, click locks open */}
            <div
              className='header-dropdown-wrapper'
              ref={dropdownRef}
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <button
                className='nav-icon-link header-hamburger-btn'
                onClick={handleHamburgerClick}
                aria-label='Open menu'
                aria-expanded={showDropdown}
                aria-haspopup='true'
                ref={hamburgerRef}
              >
                <FaBars size={22} />
              </button>

              {/* Dropdown menu — shown on hover or when locked by click */}
              {showDropdown && (
                <DesktopDropdownMenu
                  userInfo={userInfo}
                  onClose={() => {
                    setShowDropdown(false);
                    setDropdownLocked(false);
                  }}
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

            {/* Notification bell — only shown when logged in */}
            <NotificationBell />

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