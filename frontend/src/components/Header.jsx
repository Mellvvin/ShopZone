import { useState, useEffect } from 'react';
import {
  Navbar, Nav, Container, Badge,
  Form, Button, InputGroup, Offcanvas, NavDropdown
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

  const { userInfo }  = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // Clear search input when route changes
  useEffect(() => {
    setKeyword('');
    setShowSearch(false);
  }, [location.pathname]);

  const logoutHandler = () => {
    dispatch(logout());
    setShowDrawer(false);
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
      <Navbar
        style={{ backgroundColor: 'var(--oxford-blue)' }}
        variant='dark'
        expand='lg'
        className='py-2'
      >
        <Container>
          {/* ── Brand ── */}
          <LinkContainer to='/'>
            <Navbar.Brand style={{
              color: 'var(--tan)',
              fontWeight: '700',
              fontSize: '1.5rem',
              letterSpacing: '1px',
            }}>
              ShopZone
            </Navbar.Brand>
          </LinkContainer>

          {/* ══════════════════════════════════════════
              DESKTOP — Search Bar (hidden on mobile)
          ══════════════════════════════════════════ */}
          <Form
            onSubmit={submitHandler}
            className='d-none d-lg-flex mx-auto'
            style={{ width: '100%', maxWidth: '380px' }}
          >
            <InputGroup>
              <InputGroup.Text style={{
                backgroundColor: 'white',
                border: '2px solid var(--tan)',
                borderRight: 'none',
                borderRadius: '8px 0 0 8px',
              }}>
                <svg xmlns='http://www.w3.org/2000/svg' width='15' height='15'
                  fill='var(--oxford-blue)' viewBox='0 0 16 16'>
                  <path d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001
                    c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007
                    1.007 0 0 0-.115-.099zm-5.242 1.156a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z'/>
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

          {/* ══════════════════════════════════════════
              DESKTOP — Nav Links (hidden on mobile)
          ══════════════════════════════════════════ */}
          <Nav className='d-none d-lg-flex align-items-center gap-2'>

            {/* Cart */}
            <LinkContainer to='/cart'>
              <Nav.Link className='d-flex align-items-center gap-1'>
                <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'
                  fill='currentColor' viewBox='0 0 16 16'>
                  <path d='M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89
                    3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5
                    0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102
                    4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0
                    0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1
                    1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z'/>
                </svg>
                Cart
                {totalItems > 0 && (
                  <Badge style={{
                    backgroundColor: 'var(--tan)',
                    color: 'var(--oxford-blue)',
                    fontWeight: '700',
                    fontSize: '0.72rem',
                  }}>
                    {totalItems}
                  </Badge>
                )}
              </Nav.Link>
            </LinkContainer>

            {/* Profile / Auth */}
            {userInfo ? (
              <NavDropdown title={userInfo.name} id='username-desktop'>
                <LinkContainer to='/profile'>
                  <NavDropdown.Item>Profile</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logoutHandler}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <LinkContainer to='/login'>
                <Nav.Link>Sign In</Nav.Link>
              </LinkContainer>
            )}
          </Nav>

          {/* ══════════════════════════════════════════
              MOBILE — Icon Row (hidden on desktop)
          ══════════════════════════════════════════ */}
          <div className='d-flex d-lg-none align-items-center gap-3'>

            {/* Search Icon */}
            <Button
              variant='link'
              onClick={() => setShowSearch(!showSearch)}
              style={{ color: 'var(--tan)', padding: 0 }}
            >
              <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'
                fill='currentColor' viewBox='0 0 16 16'>
                <path d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001
                  c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007
                  1.007 0 0 0-.115-.099zm-5.242 1.156a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z'/>
              </svg>
            </Button>

            {/* Cart Icon */}
            <Link
              to='/cart'
              style={{ color: 'var(--tan)', position: 'relative', lineHeight: 1 }}
            >
              <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'
                fill='currentColor' viewBox='0 0 16 16'>
                <path d='M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89
                  3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5
                  0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102
                  4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0
                  0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1
                  1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z'/>
              </svg>
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

            {/* Profile Icon */}
            <Link
              to={userInfo ? '/profile' : '/login'}
              style={{ color: 'var(--tan)', lineHeight: 1 }}
            >
              <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'
                fill='currentColor' viewBox='0 0 16 16'>
                <path d='M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4
                  0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3
                  6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68
                  10.029 10 8 10c-2.029 0-3.516.68-4.168 1.332-.678.678-.83
                  1.418-.832 1.664h10z'/>
              </svg>
            </Link>

            {/* Hamburger Menu Icon */}
            <Button
              variant='link'
              onClick={() => setShowDrawer(true)}
              style={{ color: 'var(--tan)', padding: 0 }}
            >
              <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'
                fill='currentColor' viewBox='0 0 16 16'>
                <path fillRule='evenodd' d='M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5
                  0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5
                  0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5
                  0 0 1 0 1H3a.5.5 0 0 1-.5-.5z'/>
              </svg>
            </Button>
          </div>
        </Container>

        {/* ── Mobile Search Bar (slides down) ── */}
        {showSearch && (
          <Container className='pb-2 d-lg-none'>
            <Form onSubmit={submitHandler}>
              <InputGroup>
                <InputGroup.Text style={{
                  backgroundColor: 'white',
                  border: '2px solid var(--tan)',
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px',
                }}>
                  <svg xmlns='http://www.w3.org/2000/svg' width='15' height='15'
                    fill='var(--oxford-blue)' viewBox='0 0 16 16'>
                    <path d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001
                      c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007
                      1.007 0 0 0-.115-.099zm-5.242 1.156a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z'/>
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
        )}
      </Navbar>

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

          {/* User Info */}
          {userInfo && (
            <div style={{
              padding: '1rem 1.2rem',
              backgroundColor: 'var(--tan-light)',
              borderBottom: '1px solid #EAE0D5',
            }}>
              <p style={{
                margin: 0,
                color: 'var(--oxford-blue)',
                fontWeight: '600',
                fontSize: '1rem',
              }}>
                👋 Hello, {userInfo.name.split(' ')[0]}
              </p>
              <p style={{
                margin: 0,
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}>
                {userInfo.email}
              </p>
            </div>
          )}

          {/* Nav Items */}
          <Nav className='flex-column'>

            {/* Categories — placeholder for later */}
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
            <LinkContainer
              to='/'
              onClick={() => setShowDrawer(false)}
            >
              <Nav.Link className='drawer-link'>
                🛍️ All Products
              </Nav.Link>
            </LinkContainer>
            {/* Future categories will go here */}

            {/* Support */}
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
            <Nav.Link className='drawer-link' href='mailto:support@shopzone.com'>
              📧 Contact Support
            </Nav.Link>
            <Nav.Link className='drawer-link'>
              ❓ FAQ
            </Nav.Link>

            {/* Auth */}
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
                Account
              </small>
            </div>

            {userInfo ? (
              <>
                <LinkContainer
                  to='/profile'
                  onClick={() => setShowDrawer(false)}
                >
                  <Nav.Link className='drawer-link'>
                    👤 My Profile
                  </Nav.Link>
                </LinkContainer>
                <Nav.Link
                  className='drawer-link'
                  onClick={logoutHandler}
                  style={{ color: '#C00000' }}
                >
                  🚪 Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <LinkContainer
                  to='/login'
                  onClick={() => setShowDrawer(false)}
                >
                  <Nav.Link className='drawer-link'>
                    🔑 Sign In
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer
                  to='/register'
                  onClick={() => setShowDrawer(false)}
                >
                  <Nav.Link className='drawer-link'>
                    ✏️ Register
                  </Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;