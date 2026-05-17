// frontend/src/pages/LoginPage.jsx
// ─────────────────────────────────────────────────────────────
// Login page — email and password authentication.
//
// Error handling: dual system
//   1. Inline Alert at top of form (stays visible)
//   2. Toast notification bottom-right (auto-dismisses after 5s)
// Both fire together on every error and success.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import { showToast } from '../components/Toast/Toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  // If the user was redirected here from a protected page,
  // send them back there after login. Otherwise go to home.
  const redirect = location.search ? location.search.split('=')[1] : '/';

  // ── Redirect + welcome toast when login succeeds ──────────
  useEffect(() => {
    if (userInfo) {
      showToast(`Welcome back, ${userInfo.name.split(' ')[0]}!`, 'success');
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  // ── Show backend errors in both the alert and the toast ───
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error]);

  // ── Submit handler ────────────────────────────────────────
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <Row className='justify-content-md-center mt-5'>
      <Col md={5}>
        <Card className='p-4 shadow-sm'>
          <h2 className='text-center mb-4' style={{ color: 'var(--oxford-blue)' }}>
            Sign In
          </h2>

          {/* ── Inline error alert — stays visible ────────── */}
          {/* Works alongside the toast for users who miss    */}
          {/* the bottom-right notification.                  */}
          {error && (
            <Alert variant='danger'>{error}</Alert>
          )}

          <Form onSubmit={submitHandler}>

            {/* ── Email ─────────────────────────────────────── */}
            <Form.Group controlId='email' className='mb-3'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {/* ── Password ──────────────────────────────────── */}
            <Form.Group controlId='password' className='mb-3'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {/* ── Submit button ─────────────────────────────── */}
            <Button
              type='submit'
              variant='dark'
              className='w-100 mt-2'
              disabled={loading}
            >
              {loading ? (
                <Spinner animation='border' size='sm' />
              ) : (
                'Sign In'
              )}
            </Button>

          </Form>

          {/* ── Link to register page ─────────────────────── */}
          <Row className='mt-3'>
            <Col className='text-center'>
              New customer?{' '}
              <Link
                to={redirect ? `/register?redirect=${redirect}` : '/register'}
                style={{ color: 'var(--oxford-blue)', fontWeight: 600 }}
              >
                Register here
              </Link>
            </Col>
          </Row>

        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;