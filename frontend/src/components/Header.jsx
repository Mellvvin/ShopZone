import { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge, Form, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { listProducts } from '../redux/slices/productSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');

  const { userInfo }  = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const logoutHandler = () => {
    dispatch(logout());
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      dispatch(listProducts(keyword.trim()));
      navigate('/');
    } else {
      dispatch(listProducts(''));
      navigate('/');
    }
  };

  const clearSearch = () => {
    setKeyword('');
    dispatch(listProducts(''));
    navigate('/');
  };

  return (
    <header>
      <Navbar bg='dark' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand>ShopZone</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>

            {/* ── Search Bar ── */}
            <Form
              onSubmit={submitHandler}
              className='d-flex mx-auto my-2 my-lg-0'
              style={{ width: '100%', maxWidth: '400px' }}
            >
              <Form.Control
                type='text'
                placeholder='Search products...'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{
                  backgroundColor: '#1a3a5c',
                  border: '1px solid var(--tan)',
                  color: 'var(--tan)',
                  borderRadius: '6px 0 0 6px',
                }}
                className='search-input'
              />
              {keyword && (
                <Button
                  type='button'
                  onClick={clearSearch}
                  style={{
                    backgroundColor: '#1a3a5c',
                    border: '1px solid var(--tan)',
                    borderLeft: 'none',
                    color: 'var(--tan)',
                    padding: '0 10px',
                  }}
                >
                  ✕
                </Button>
              )}
              <Button
                type='submit'
                style={{
                  backgroundColor: 'var(--tan)',
                  border: '1px solid var(--tan)',
                  color: 'var(--oxford-blue)',
                  fontWeight: '600',
                  borderRadius: keyword ? '0 6px 6px 0' : '0 6px 6px 0',
                }}
              >
                Search
              </Button>
            </Form>

            <Nav className='ms-auto align-items-center'>

              {/* ── Cart Link ── */}
              <LinkContainer to='/cart'>
                <Nav.Link className='d-flex align-items-center gap-2'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    fill='currentColor'
                    viewBox='0 0 16 16'
                  >
                    <path d='M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z'/>
                  </svg>
                  Cart
                  {totalItems > 0 && (
                    <Badge
                      style={{
                        backgroundColor: 'var(--tan)',
                        color: 'var(--oxford-blue)',
                        fontWeight: '700',
                        fontSize: '0.75rem',
                      }}
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>

              {/* ── Auth Links ── */}
              {userInfo ? (
                <NavDropdown title={userInfo.name} id='username'>
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
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;