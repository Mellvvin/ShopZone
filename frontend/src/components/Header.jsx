import { useState, useEffect, useRef } from 'react';
import {
  Navbar, Nav, Container, Badge,
  Form, Button, InputGroup, Offcanvas
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { listProducts } from '../redux/slices/productSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword]       = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { userInfo }  = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    setKeyword('');
    setShowSearch(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
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

  const clearSearch = () => {
    setKeyword('');
  };

  return (
    <header>
      {/* ══════════════════════════════════════════
          TOP BAR
      ══════════════════════════════════════════ */}
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

            {/* ── Desktop Search Bar ── */}
            <Form
              onSubmit={submitHandler}
              className='d-none d-lg-flex'
              style={{ width: '100%', maxWidth: '420px', margin: '0 2rem' }}
            >
              <InputGroup>
                <InputGroup.Text style={{
                  backgroundColor: 'white',
                  border:          '2px solid var(--tan)',
                  borderRight:     'none',
                  borderRadius:    '8px 0 0 8px',
                }}>
                  <svg xmlns='http://www.w3.org/2000/svg' width='15' height='15'
                    fill='var(--oxford-blue)' viewBox='0 0 16 16'>
                    <path d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.156a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z'/>
                  </svg>
                </InputGroup.Text>
                <Form.Control
                  type='text'
                  placeholder='Search products...'
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className='search-input-white'
                />
                {keyword && (
                  <Button
                    type='button'
                    onClick={clearSearch}
                    className='search-clear-btn'
                  >
                    ✕
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

            {/* ── Desktop Icons ── */}
            <div className='d-none d-lg-flex align-items-center gap-3'>

              {/* Cart */}
              <Link
                to='/cart'
                style={{ color: 'var(--tan)', position: 'relative', lineHeight: 1 }}
                className='nav-icon-link'
              >
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'
                  fill='currentColor' viewBox='0 0 16 16'>
                  <path d='M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z'/>
                </svg>
                {totalItems > 0 && (
                  <Badge style={{
                    backgroundColor: 'var(--tan)',
                    color:           'var(--oxford-blue)',
                    fontWeight:      '700',
                    fontSize:        '0.65rem',
                    position:        'absolute',
                    top:             '-8px',
                    right:           '-10px',
                    borderRadius:    '50%',
                    minWidth:        '18px',
                    height:          '18px',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    padding:         '0 4px',
                  }}>
                    {totalItems}
                  </Badge>
                )}
              </Link>

              {/* Profile */}
              <Link
                to={userInfo ? '/profile' : '/login'}
                style={{ color: 'var(--tan)', lineHeight: 1 }}
                className='nav-icon-link'
              >
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'
                  fill='currentColor' viewBox='0 0 16 16'>
                  <path d='M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.029 10 8 10c-2.029 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z'/>
                </svg>
              </Link>

              {/* Desktop Hamburger with Custom Dropdown */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <Button
                  variant='link'
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ color: 'var(--tan)', padding: 0, lineHeight: 1 }}
                  className='nav-icon-link'
                >
                  <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'
                    fill='currentColor' viewBox='0 0 16 16'>
                    <path fillRule='evenodd' d='M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z'/>
                  </svg>
                </Button>

                {/* ── Custom Dropdown Menu ── */}
                {showDropdown && (
                  <div style={{
                    position:        'absolute',
                    top:             'calc(100% + 12px)',
                    right:           0,
                    width:           '220px',
                    backgroundColor: 'var(--oxford-blue)',
                    borderRadius:    '10px',
                    boxShadow:       '0 8px 32px rgba(0,33,71,0.25)',
                    zIndex:          1000,
                    overflow:        'hidden',
                    border:          '1px solid rgba(210,180,140,0.2)',
                  }}>

                    {/* Arrow */}
                    <div style={{
                      position:    'absolute',
                      top:         '-6px',
                      right:       '10px',
                      width:       '12px',
                      height:      '12px',
                      backgroundColor: 'var(--oxford-blue)',
                      transform:   'rotate(45deg)',
                      border:      '1px solid rgba(210,180,140,0.2)',
                      borderBottom: 'none',
                      borderRight:  'none',
                    }} />

                    {/* User greeting if logged in */}
                    {userInfo && (
                      <div style={{
                        padding:         '0.9rem 1.1rem',
                        borderBottom:    '1px solid rgba(210,180,140,0.15)',
                        backgroundColor: 'rgba(210,180,140,0.08)',
                      }}>
                        <p style={{
                          margin:     0,
                          color:      'var(--tan)',
                          fontWeight: '600',
                          fontSize:   '0.9rem',
                        }}>
                          👋 {userInfo.name.split(' ')[0]}
                        </p>
                        <p style={{
                          margin:   0,
                          color:    'rgba(210,180,140,0.6)',
                          fontSize: '0.75rem',
                        }}>
                          {userInfo.email}
                        </p>
                      </div>
                    )}

                    {/* Menu Items */}
                    {[
                      { icon: '📋', label: 'Order History', to: '/profile' },
                      { icon: '📧', label: 'Contact Support', to: null, href: 'mailto:support@shopzone.com' },
                      { icon: '❓', label: 'FAQ', to: null },
                      { icon: '🏪', label: 'Become a Seller', to: null },
                    ].map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setShowDropdown(false);
                          if (item.to) navigate(item.to);
                          if (item.href) window.location.href = item.href;
                        }}
                        style={{
                          padding:      '0.75rem 1.1rem',
                          borderBottom: '1px solid rgba(210,180,140,0.1)',
                          color:        'var(--tan)',
                          cursor:       'pointer',
                          fontSize:     '0.88rem',
                          display:      'flex',
                          alignItems:   'center',
                          gap:          '0.6rem',
                          transition:   'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(210,180,140,0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    ))}

                    {/* Logout */}
                    {userInfo && (
                      <div
                        onClick={logoutHandler}
                        style={{
                          padding:    '0.75rem 1.1rem',
                          color:      '#FF6B6B',
                          cursor:     'pointer',
                          fontSize:   '0.88rem',
                          display:    'flex',
                          alignItems: 'center',
                          gap:        '0.6rem',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Mobile Icons ── */}
            <div className='d-flex d-lg-none align-items-center gap-3'>

              {/* Search */}
              <Button
                variant='link'
                onClick={() => setShowSearch(!showSearch)}
                style={{ color: 'var(--tan)', padding: 0, lineHeight: 1 }}
              >
                <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'
                  fill='currentColor' viewBox='0 0 16 16'>
                  <path d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.156a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z'/>
                </svg>
              </Button>

              {/* Cart */}
              <Link
                to='/cart'
                style={{ color: 'var(--tan)', position: 'relative', lineHeight: 1 }}
              >
                <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'
                  fill='currentColor' viewBox='0 0 16 16'>
                  <path d='M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z'/>
                </svg>
                {totalItems > 0 && (
                  <Badge style={{
                    backgroundColor: 'var(--tan)',
                    color:           'var(--oxford-blue)',
                    fontWeight:      '700',
                    fontSize:        '0.65rem',
                    position:        'absolute',
                    top:             '-8px',
                    right:           '-10px',
                    borderRadius:    '50%',
                    minWidth:        '18px',
                    height:          '18px',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    padding:         '0 4px',
                  }}>
                    {totalItems}
                  </Badge>
                )}
              </Link>

              {/* Profile */}
              <Link
                to={userInfo ? '/profile' : '/login'}
                style={{ color: 'var(--tan)', lineHeight: 1 }}
              >
                <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'
                  fill='currentColor' viewBox='0 0 16 16'>
                  <path d='M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.029 10 8 10c-2.029 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z'/>
                </svg>
              </Link>

              {/* Hamburger */}
              <Button
                variant='link'
                onClick={() => setShowDrawer(true)}
                style={{ color: 'var(--tan)', padding: 0, lineHeight: 1 }}
              >
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'
                  fill='currentColor' viewBox='0 0 16 16'>
                  <path fillRule='evenodd' d='M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z'/>
                </svg>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Mobile Search Bar ── */}
      {showSearch && (
        <div style={{
          backgroundColor: '#001835',
          padding:         '0.75rem 0',
          borderTop:       '1px solid rgba(210,180,140,0.2)',
        }}>
          <Container>
            <Form onSubmit={submitHandler}>
              <InputGroup>
                <InputGroup.Text style={{
                  backgroundColor: 'white',
                  border:          '2px solid var(--tan)',
                  borderRight:     'none',
                  borderRadius:    '8px 0 0 8px',
                }}>
                  <svg xmlns='http://www.w3.org/2000/svg' width='15' height='15'
                    fill='var(--oxford-blue)' viewBox='0 0 16 16'>
                    <path d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.156a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z'/>
                  </svg>
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
                    ✕
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

      {/* ══════════════════════════════════════════
          CATEGORY BAR (Desktop only)
      ══════════════════════════════════════════ */}
      <div
        className='d-none d-lg-block'
        style={{
          backgroundColor: '#001835',
          borderTop:       '1px solid rgba(210,180,140,0.15)',
          borderBottom:    '1px solid rgba(210,180,140,0.15)',
        }}
      >
        <Container>
          <Nav className='py-1'>
            {[
              { label: 'All Products',    icon: '🛍️' },
              { label: 'Electronics',     icon: '📱' },
              { label: 'Fashion',         icon: '👗' },
              { label: 'Home & Kitchen',  icon: '🏠' },
              { label: 'Office Supplies', icon: '🗂️' },
              { label: 'Food & Beverage', icon: '🥤' },
              { label: 'Beauty',          icon: '💄' },
              { label: 'Hardware',        icon: '🔧' },
            ].map((cat) => (
              <Nav.Link
                key={cat.label}
                onClick={() => {
                  if (cat.label === 'All Products') {
                    dispatch(listProducts(''));
                    navigate('/');
                  } else {
                    dispatch(listProducts(cat.label));
                    navigate('/');
                  }
                }}
                style={{
                  color:      'rgba(210,180,140,0.8)',
                  fontSize:   '0.82rem',
                  fontWeight: '500',
                  padding:    '0.4rem 0.9rem',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--tan)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(210,180,140,0.8)';
                }}
              >
                {cat.icon} {cat.label}
              </Nav.Link>
            ))}
          </Nav>
        </Container>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE OFFCANVAS DRAWER
      ══════════════════════════════════════════ */}
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
          <Offcanvas.Title style={{ color: 'var(--tan)', fontWeight: '700' }}>
            ShopZone
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body style={{ padding: 0 }}>

          {/* Categories */}
          <div style={{
            padding:         '0.6rem 1.2rem',
            backgroundColor: '#F5F0EB',
            borderBottom:    '1px solid #EAE0D5',
          }}>
            <small style={{
              color:          'var(--text-muted)',
              fontWeight:     '600',
              textTransform:  'uppercase',
              letterSpacing:  '0.5px',
              fontSize:       '0.75rem',
            }}>
              Categories
            </small>
          </div>

          {[
            { label: 'All Products',    icon: '🛍️' },
            { label: 'Electronics',     icon: '📱' },
            { label: 'Fashion',         icon: '👗' },
            { label: 'Home & Kitchen',  icon: '🏠' },
            { label: 'Office Supplies', icon: '🗂️' },
            { label: 'Food & Beverage', icon: '🥤' },
            { label: 'Beauty',          icon: '💄' },
            { label: 'Hardware',        icon: '🔧' },
          ].map((cat) => (
            <Nav.Link
              key={cat.label}
              className='drawer-link'
              onClick={() => {
                setShowDrawer(false);
                if (cat.label === 'All Products') {
                  dispatch(listProducts(''));
                } else {
                  dispatch(listProducts(cat.label));
                }
                navigate('/');
              }}
            >
              {cat.icon} {cat.label}
            </Nav.Link>
          ))}

          {/* Support */}
          <div style={{
            padding:         '0.6rem 1.2rem',
            backgroundColor: '#F5F0EB',
            borderBottom:    '1px solid #EAE0D5',
            marginTop:       '0.5rem',
          }}>
            <small style={{
              color:          'var(--text-muted)',
              fontWeight:     '600',
              textTransform:  'uppercase',
              letterSpacing:  '0.5px',
              fontSize:       '0.75rem',
            }}>
              Support
            </small>
          </div>
          <Nav.Link
            className='drawer-link'
            href='mailto:support@shopzone.com'
          >
            📧 Contact Support
          </Nav.Link>
          <Nav.Link className='drawer-link'>
            ❓ FAQ
          </Nav.Link>
          <Nav.Link className='drawer-link'>
            🏪 Become a Seller
          </Nav.Link>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;