// frontend/src/pages/LoginPage/LoginPage.jsx
// ─────────────────────────────────────────────────────────────
// Login page — redesigned with split layout.
// Left panel: Oxford Blue with ShopZone branding and trust copy.
// Right panel: clean form on off-white.
// All inline styles removed and moved to LoginPage.css.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaStore, FaLock, FaTruck, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { login } from '../redux/slices/authSlice';
import { showToast } from '../components/Toast/Toast';
import './LoginPage.css';

// ── Trust points shown in the left branding panel ─────────────
const TRUST_POINTS = [
  { icon: FaStore,     text: 'Access thousands of wholesale products' },
  { icon: FaTruck,     text: 'Nationwide delivery across all 47 counties' },
  { icon: FaShieldAlt, text: 'Secure, ShopZone-managed transactions' },
];

const LoginPage = () => {
const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  // Controls whether the password field shows plain text
  const [showPassword, setShowPassword] = useState(false);

  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  useEffect(() => { document.title = 'Sign In — ShopZone'; }, []);

// Support both location.state.from (used by all login gates)
  // and the legacy ?redirect= query param for backwards compat
  const redirect = location.state?.from || (location.search ? location.search.split('=')[1] : '/');

  useEffect(() => {
    if (userInfo) {
      showToast(`Welcome back, ${userInfo.name.split(' ')[0]}!`, 'success');
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  useEffect(() => {
    if (error) showToast(error, 'error');
  }, [error]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className='login-page'>

      {/* ── Left branding panel ─────────────────────────── */}
      <div className='login-brand'>
        <div className='login-brand__inner'>
          {/* Logo */}
          <div className='login-brand__logo'>
            <FaStore className='login-brand__logo-icon' />
            <span className='login-brand__logo-text'>ShopZone</span>
          </div>

          {/* Headline */}
          <h1 className='login-brand__headline'>
            Kenya's wholesale marketplace
          </h1>
          <p className='login-brand__sub'>
            Source smarter. Stock faster. Grow your business with ShopZone.
          </p>

          {/* Trust points */}
          <ul className='login-brand__trust'>
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className='login-brand__trust-item'>
                <Icon className='login-brand__trust-icon' />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative bottom orb */}
        <div className='login-brand__orb' aria-hidden='true' />
      </div>

      {/* ── Right form panel ────────────────────────────── */}
      <div className='login-form-panel'>
        <div className='login-form-inner'>

          {/* Mobile logo — only visible on small screens */}
          <div className='login-form-mobile-logo'>
            <FaStore className='login-form-mobile-logo__icon' />
            <span className='login-form-mobile-logo__text'>ShopZone</span>
          </div>

          <div className='login-form-header'>
            <FaLock className='login-form-lock' aria-hidden='true' />
            <h2 className='login-form-title'>Sign in to your account</h2>
            <p className='login-form-sub'>
              New to ShopZone?{' '}
              <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className='login-form-link'>
                Create an account
              </Link>
            </p>
          </div>

          {/* Error alert */}
          {error && <Alert variant='danger' className='login-error'>{error}</Alert>}

          <Form onSubmit={submitHandler} className='login-form'>

            {/* Email */}
            <Form.Group className='mb-4'>
              <Form.Label className='login-label'>Email Address</Form.Label>
              <Form.Control
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='login-input'
                required
              />
            </Form.Group>

           {/* Password */}
            <Form.Group className='mb-4'>
              <div className='login-password-row'>
                <Form.Label className='login-label'>Password</Form.Label>
                {/* Forgot password — links to /forgot-password (Step 24) */}
                <Link to='/forgot-password' className='login-forgot-link'>
                  Forgot password?
                </Link>
              </div>
              {/* Wrapper gives the eye toggle button a position anchor */}
              <div className='login-password-wrap'>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='login-input login-input--password'
                  required
                />
                <button
                  type='button'
                  className='login-eye-btn'
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword
                    ? <FaEyeSlash aria-hidden='true' />
                    : <FaEye aria-hidden='true' />
                  }
                </button>
              </div>
            </Form.Group>

            {/* Submit */}
            <Button type='submit' className='w-100 login-submit-btn' disabled={loading}>
              {loading ? <Spinner animation='border' size='sm' /> : 'Sign In'}
            </Button>

          </Form>

          {/* Footer note */}
          <p className='login-footer-note'>
            By signing in you agree to ShopZone's terms of service and privacy policy.
          </p>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;