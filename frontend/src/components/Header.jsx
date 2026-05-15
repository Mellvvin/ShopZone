import { useState, useEffect, useRef } from 'react';
import {
  Container, Nav, Badge,
  Form, Button, InputGroup, Offcanvas
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  FaShoppingCart, FaUser, FaBars, FaSearch,
  FaCog, FaUsers, FaBox, FaClipboardList,
  FaEnvelope, FaQuestionCircle, FaStore,
  FaSignOutAlt, FaTimes
} from 'react-icons/fa';
import { logout } from '../redux/slices/authSlice';
import { listProducts } from '../redux/slices/productSlice';


const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // ── Clear search input when route changes ──────────────
  useEffect(() => {
    setKeyword('');
    setShowSearch(false);
  }, [location.pathname]);

  // ── Close dropdown when clicking outside ───────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logoutHandler = () => {
    dispatch(logout());
    setShowDropdown(false);
    setShowDrawer(false);
    navigate('/');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      dispatch(listProducts(keyword.trim()));
      navigate('/');
    }
  };

  // ── X button clears input only — results stay ──────────
  const clearSearch = () => setKeyword('');

  return (
    <header>
      {/* ════════════════════════════════════════════════
          TOP BAR
      ════════════════════════════════════════════════ */}
      <div style={{ backgroundColor: 'var(--oxford-blue)' }}>
        <Container>
          <div className='d-flex align-items-center justify-content-between py-2'>

            {/* ── Brand ── */}
            <Link
              to='/'
              style={{
                color:          'var(--tan)',
                fontWeight:     '700',
                fontSize:       '1.6rem',
                letterSpacing:  '1px',
                textDecoration: 'none',
              }}
            >
              ShopZone
            </Link>

            {/* ── Desktop Search Bar (hidden on mobile) ── */}
            <Form
              onSubmit={submitHandler}
              className='d-none d-lg-flex'
              style={{ width: '100%', maxWidth: '420px', margin: '0 2rem' }}
            >
              <InputGroup>
                {/* Search icon inside input */}
                <InputGroup.Text style={{
                  backgroundColor: 'white',
                  border: '2px solid var(--tan)',
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px',
                }}>
                  <FaSearch color='var(--oxford-blue)' size={14} />
                </InputGroup.Text>
                <Form.Control
                  type='text'
                  placeholder='Search products,categories and brands...'
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className='search-input-white'
                />
                {/* Clear button — only shows when input has text */}
                {keyword && (
                  <Button
                    type='button'
                    onClick={clearSearch}
                    className='search-clear-btn'
                  >
                    <FaTimes size={12} />
                  </Button>
                )}
                <Button
                  type='submit'
                  className='search-submit-btn'
                  style={{ borderRadius: '0 8px 8px 0' }}
                >
                  Search
                </Button>
              </InputGroup>
            </Form>

            {/* ── Desktop Icons (hidden on mobile) ── */}
            <div className='d-none d-lg-flex align-items-center gap-3'>

              {/* Cart icon with live badge */}
              <Link
                to='/cart'
                style={{ color: 'var(--tan)', position: 'relative', lineHeight: 1 }}
                className='nav-icon-link'
              >
                <FaShoppingCart size={22} />
                {totalItems > 0 && (
                  <Badge style={{
                    backgroundColor: 'var(--tan)',
                    color: 'var(--oxford-blue)',
                    fontWeight: '700',
                    fontSize: '0.65rem',
                    position: 'absolute',
                    top: '-8px',
                    right: '-10px',
                    borderRadius: '50%',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}>
                    {totalItems}
                  </Badge>
                )}
              </Link>

              {/* Profile icon — goes to profile if logged in, login if not */}
              <Link
                to={userInfo ? '/profile' : '/login'}
                style={{ color: 'var(--tan)', lineHeight: 1 }}
                className='nav-icon-link'
              >
                <FaUser size={20} />
              </Link>

              {/* Desktop hamburger with custom dropdown */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <Button
                  variant='link'
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ color: 'var(--tan)', padding: 0, lineHeight: 1 }}
                  className='nav-icon-link'
                  aria-label='Open menu'
                >
                  <FaBars size={22} />
                </Button>

                {/* ── Custom Dropdown Menu ── */}
                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: 'var(--oxford-blue)',
                    borderRadius: '10px',
                    boxShadow: '0 8px 32px rgba(0,33,71,0.25)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    border: '1px solid rgba(210,180,140,0.2)',
                  }}>

                    {/* Dropdown arrow pointer */}
                    <div style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '10px',
                      width: '12px',
                      height: '12px',
                      backgroundColor: 'var(--oxford-blue)',
                      transform: 'rotate(45deg)',
                      border: '1px solid rgba(210,180,140,0.2)',
                      borderBottom: 'none',
                      borderRight: 'none',
                    }} />

                    {/* User greeting — only shown when logged in */}
                    {userInfo && (
                      <div style={{
                        padding: '0.9rem 1.1rem',
                        borderBottom: '1px solid rgba(210,180,140,0.15)',
                        backgroundColor: 'rgba(210,180,140,0.08)',
                      }}>
                        <p style={{
                          margin: 0,
                          color: 'var(--tan)',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                        }}>
                          Hi, {userInfo.name.split(' ')[0]}
                        </p>
                        <p style={{
                          margin: 0,
                          color: 'rgba(210,180,140,0.6)',
                          fontSize: '0.75rem',
                        }}>
                          {userInfo.email}
                        </p>
                      </div>
                    )}

                    {/* Admin links — only shown to admins */}
                    {userInfo && userInfo.isAdmin && (
                      <>
                        {/* Admin products link */}
                        {[
                          { icon: <FaCog size={13} />, label: 'Products', to: '/admin/products' },
                          { icon: <FaBox size={13} />, label: 'Orders', to: '/admin/orders' },
                          { icon: <FaUsers size={13} />, label: 'Users', to: '/admin/users' },
                        ].map((item) => (
                          <div
                            key={item.label}
                            onClick={() => { setShowDropdown(false); navigate(item.to); }}
                            style={{
                              padding: '0.75rem 1.1rem',
                              borderBottom: '1px solid rgba(210,180,140,0.1)',
                              color: 'var(--tan)',
                              cursor: 'pointer',
                              fontSize: '0.88rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              transition: 'background-color 0.15s ease',
                              backgroundColor: 'rgba(210,180,140,0.05)',
                              fontWeight: '600',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(210,180,140,0.12)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(210,180,140,0.05)'; }}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Regular menu items — shown to all users */}
                    {[
                      { icon: <FaClipboardList size={13} />, label: 'Order History', to: '/profile' },
                      { icon: <FaEnvelope size={13} />, label: 'Contact Support', href: 'mailto:support@shopzone.com' },
                      { icon: <FaQuestionCircle size={13} />, label: 'FAQ', to: null },
                      { icon: <FaStore size={13} />, label: 'Become a Seller', to: null },
                    ].map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setShowDropdown(false);
                          if (item.to) navigate(item.to);
                          if (item.href) window.location.href = item.href;
                        }}
                        style={{
                          padding: '0.75rem 1.1rem',
                          borderBottom: '1px solid rgba(210,180,140,0.1)',
                          color: 'var(--tan)',
                          cursor: 'pointer',
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(210,180,140,0.12)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    ))}

                    {/* Logout — only shown when logged in */}
                    {userInfo && (
                      <div
                        onClick={logoutHandler}
                        style={{
                          padding: '0.75rem 1.1rem',
                          color: '#FF6B6B',
                          cursor: 'pointer',
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <FaSignOutAlt size={13} />
                        <span>Logout</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Mobile Icons (hidden on desktop) ── */}
            <div className='d-flex d-lg-none align-items-center gap-3'>

              {/* Mobile search toggle */}
              <Button
                variant='link'
                onClick={() => setShowSearch(!showSearch)}
                style={{ color: 'var(--tan)', padding: 0, lineHeight: 1 }}
                aria-label='Toggle search'
              >
                <FaSearch size={20} />
              </Button>

              {/* Mobile cart icon with badge */}
              <Link
                to='/cart'
                style={{ color: 'var(--tan)', position: 'relative', lineHeight: 1 }}
              >
                <FaShoppingCart size={22} />
                {totalItems > 0 && (
                  <Badge style={{
                    backgroundColor: 'var(--tan)',
                    color: 'var(--oxford-blue)',
                    fontWeight: '700',
                    fontSize: '0.65rem',
                    position: 'absolute',
                    top: '-8px',
                    right: '-10px',
                    borderRadius: '50%',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}>
                    {totalItems}
                  </Badge>
                )}
              </Link>

              {/* Mobile profile icon */}
              <Link
                to={userInfo ? '/profile' : '/login'}
                style={{ color: 'var(--tan)', lineHeight: 1 }}
                aria-label='Profile'
              >
                <FaUser size={20} />
              </Link>

              {/* Mobile hamburger — opens offcanvas drawer */}
              <Button
                variant='link'
                onClick={() => setShowDrawer(true)}
                style={{ color: 'var(--tan)', padding: 0, lineHeight: 1 }}
                aria-label='Open drawer'
              >
                <FaBars size={22} />
              </Button>
            </div>
          </div>
        </Container>

        {/* ── Mobile Search Bar (slides down when search icon tapped) ── */}
        {showSearch && (
          <div style={{
            backgroundColor: '#001835',
            padding: '0.75rem 0',
            borderTop: '1px solid rgba(210,180,140,0.2)',
          }}>
            <Container>
              <Form onSubmit={submitHandler}>
                <InputGroup>
                  <InputGroup.Text style={{
                    backgroundColor: 'white',
                    border: '2px solid var(--tan)',
                    borderRight: 'none',
                    borderRadius: '8px 0 0 8px',
                  }}>
                    <FaSearch color='var(--oxford-blue)' size={14} />
                  </InputGroup.Text>
                  <Form.Control
                    type='text'
                    placeholder='Search products...'
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className='search-input-white'
                    autoFocus
                  />
                  {keyword && (
                    <Button
                      type='button'
                      onClick={clearSearch}
                      className='search-clear-btn'
                    >
                      <FaTimes size={12} />
                    </Button>
                  )}
                  <Button
                    type='submit'
                    className='search-submit-btn'
                    style={{ borderRadius: '0 8px 8px 0' }}
                  >
                    Search
                  </Button>
                </InputGroup>
              </Form>
            </Container>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          CATEGORY BAR (desktop only)
      ════════════════════════════════════════════════ */}
      <div
        className='d-none d-lg-block'
        style={{
          backgroundColor: '#001835',
          borderTop: '1px solid rgba(210,180,140,0.15)',
          borderBottom: '1px solid rgba(210,180,140,0.15)',
        }}
      >
        <Container>
          <Nav className='py-1'>
            {[
              'All Products 📦',
              'Electronics 🔌',
              'Fashion & Apparel 👕',
              'Fabric & Textiles 🧶', // Represents yarn and bulk fabric
              'Home & Kitchen 🏠',
              'Food & Grocery 🛒',
              'Beauty & Personal Care ✨', // Neutral sparkle for wellness/hygiene
              'Hardware & Tools 🛠️',
              'Office & Stationery 🖇️',
              'Agriculture & Garden 🪴',
              'Baby & Kids 🧸',
              'Sports & Outdoors 🏔️',
              'Health & Wellness 🩹', // Inclusive of pharmacy and personal care
              'General Merchandise 🏬'
            ].map((cat) => (
              <Nav.Link
                key={cat}
                onClick={() => {
                  if (cat === 'All Products') {
                    dispatch(listProducts(''));
                  } else {
                    dispatch(listProducts(cat));
                  }
                  navigate('/');
                }}
                style={{
                  color: 'rgba(210,180,140,0.8)',
                  fontSize: '0.82rem',
                  fontWeight: '500',
                  padding: '0.4rem 0.9rem',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--tan)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(210,180,140,0.8)'; }}
              >
                {cat}
              </Nav.Link>
            ))}
          </Nav>
        </Container>
      </div>

      {/* ════════════════════════════════════════════════
          MOBILE OFFCANVAS DRAWER
          Contains categories, support links
          Auth handled by profile icon directly
      ════════════════════════════════════════════════ */}
      <Offcanvas
        show={showDrawer}
        onHide={() => setShowDrawer(false)}
        placement='end'
        style={{ width: '280px' }}
      >
        <Offcanvas.Header
          closeButton
          style={{ backgroundColor: 'var(--oxford-blue)' }}
        >
          <Offcanvas.Title>
            <Link
              to='/'
              className='navbar-brand' /* This uses the styles already in your CSS */
              onClick={() => setShowDrawer(false)}
            >
              ShopZone
            </Link>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body style={{ padding: 0 }}>

          {/* Categories section header */}
          <div style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: '#F5F0EB',
            borderBottom: '1px solid #EAE0D5',
          }}>
            <small style={{
              color: 'var(--text-muted)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
            }}>
              Categories
            </small>
          </div>

          {/* Category links */}
          {[
            'All Products',
            'Electronics',
            'Fashion & Apparel',
            'Fabric & Textiles',
            'Home & Kitchen',
            'Food & Grocery',
            'Beauty & Personal Care',
            'Hardware & Tools',
            'Office & Stationery',
            'Agriculture & Garden',
            'Baby & Kids',
            'Sports & Outdoors',
            'Health & Wellness',
            'General Merchandise',
          ].map((cat) => (
            <Nav.Link
              key={cat}
              className='drawer-link'
              onClick={() => {
                setShowDrawer(false);
                if (cat === 'All Products') {
                  dispatch(listProducts(''));
                } else {
                  dispatch(listProducts(cat));
                }
                navigate('/');
              }}
            >
              {cat}
            </Nav.Link>
          ))}

          {/* Support section header */}
          <div style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: '#F5F0EB',
            borderBottom: '1px solid #EAE0D5',
            marginTop: '0.5rem',
          }}>
            <small style={{
              color: 'var(--text-muted)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
            }}>
              Support
            </small>
          </div>

          {/* Support links */}
          <Nav.Link
            className='drawer-link'
            href='mailto:support@shopzone.com'
          >
            <FaEnvelope size={13} style={{ marginRight: '0.6rem' }} />
            Contact Support
          </Nav.Link>
          <Nav.Link className='drawer-link'>
            <FaQuestionCircle size={13} style={{ marginRight: '0.6rem' }} />
            FAQ
          </Nav.Link>
          <Nav.Link className='drawer-link'>
            <FaStore size={13} style={{ marginRight: '0.6rem' }} />
            Become a Seller
          </Nav.Link>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;
