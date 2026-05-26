// frontend/src/pages/RegisterPage.jsx
// ─────────────────────────────────────────────────────────────
// Registration page — captures both individual and business
// buyer details.
//
// Error handling: dual system
//   1. Inline alert div at the top of the form (stays visible)
//   2. Toast notification bottom-right (auto-dismisses after 5s)
// Both fire together on every error and success.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { register } from '../redux/slices/authSlice';
import { showToast } from '../components/Toast/Toast';

// ── All 47 Kenya counties ─────────────────────────────────────
const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot',
];

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Redux state ───────────────────────────────────────────
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  // ── Page title ─────────────────────────────────────────────
  useEffect(() => { document.title = 'Register — ShopZone'; }, []);

  // ── Form field state ──────────────────────────────────────
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [accountType, setAccountType] = useState('individual');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // ── Local validation error — shown in the inline alert div ─
  // Toast fires at the same time for the bottom-right notification.
  const [formError, setFormError] = useState('');

  // ── Helper: fire both the inline alert AND the toast ───────
  // Call this instead of setFormError directly so both systems
  // always stay in sync.
  const showError = (msg) => {
    setFormError(msg);
    showToast(msg, 'error');
  };

  // ── Redirect to home when registration succeeds ───────────
  // Also fires a welcome toast.
  useEffect(() => {
    if (userInfo && typeof navigate === 'function') {
      showToast(`Welcome to ShopZone, ${userInfo.name.split(' ')[0]}!`, 'success');
      const timer = setTimeout(() => navigate('/'), 500);
      return () => clearTimeout(timer);
    }
  }, [userInfo, navigate]);

  // ── Show Redux errors (from backend) in both systems ───────
  // Fires when the register thunk is rejected.
  useEffect(() => {
    if (error) {
      setFormError(error);
      showToast(error, 'error');
    }
  }, [error]);

  // ── Password strength calculator ──────────────────────────
  // 0 = empty, 1 = weak, 2 = fair, 3 = strong
  const getPasswordStrength = (pwd) => {
    if (pwd.length === 0) return 0;
    if (pwd.length < 8) return 1;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    if (hasUpper && hasNumber) return 3;
    if (hasUpper || hasNumber) return 2;
    return 1;
  };

  const strength = getPasswordStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];
  const strengthColor = ['', '#c0392b', '#e67e22', '#27ae60'][strength];

  // ── Submit handler ────────────────────────────────────────
  const submitHandler = (e) => {
    e.preventDefault();
    // Clear previous inline error on each new attempt
    setFormError('');

    // Passwords must match
    if (password !== confirmPass) {
      return showError('Passwords do not match.');
    }

    // Password must be at least Fair strength
    if (strength < 2) {
      return showError(
        'Password must be at least 8 characters and include one uppercase letter and one number.'
      );
    }

    // Basic Kenya phone format — only validated if a number was entered
    const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
    if (phone && !phoneRegex.test(phone.replace(/\s/g, ''))) {
      return showError('Please enter a valid Kenyan phone number (e.g. 0712 345 678).');
    }

    // Business name is required when account type is business
    if (accountType === 'business' && !businessName.trim()) {
      return showError('Please enter your business name.');
    }

    // All validation passed — dispatch the register thunk
    dispatch(register({
      name,
      email,
      password,
      phone,
      accountType,
      businessName: accountType === 'business' ? businessName : '',
      businessType: accountType === 'business' ? businessType : '',
      county,
    }));
  };

  return (
    <Container>
      <Row className='justify-content-center'>
        <Col xs={12} md={8} lg={6}>

          {/* ── Page heading ──────────────────────────────── */}
          <h2
            className='text-center mb-1'
            style={{ color: 'var(--oxford-blue)', fontWeight: 700, marginTop: '2rem' }}
          >
            Create your ShopZone account
          </h2>
          <p
            className='text-center mb-4'
            style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}
          >
            Join thousands of retailers and businesses across Kenya
          </p>

          {/* ── Inline alert — stays visible until next submit ── */}
          {/* Works alongside the toast for users who miss the     */}
          {/* bottom-right notification.                           */}
          {formError && (
            <div className='alert alert-danger'>{formError}</div>
          )}
          {/* Backend error from Redux — shown separately so both  */}
          {/* frontend validation errors and backend errors appear. */}
          {error && !formError && (
            <div className='alert alert-danger'>{error}</div>
          )}

          {/* ════════════════════════════════════════════════
              REGISTRATION FORM
          ════════════════════════════════════════════════ */}
          <Form onSubmit={submitHandler}>

            {/* ── Account type selector ─────────────────── */}
            <Form.Group className='mb-4'>
              <Form.Label style={{ color: 'var(--oxford-blue)', fontWeight: 600 }}>
                I am registering as
              </Form.Label>
              <div className='d-flex gap-3'>

                {/* Individual buyer button */}
                <button
                  type='button'
                  onClick={() => setAccountType('individual')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: `2px solid ${accountType === 'individual' ? 'var(--oxford-blue)' : '#D4C9BA'}`,
                    backgroundColor: accountType === 'individual' ? 'var(--oxford-blue)' : 'white',
                    color: accountType === 'individual' ? 'var(--tan)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  👤 Individual Buyer
                </button>

                {/* Business button */}
                <button
                  type='button'
                  onClick={() => setAccountType('business')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: `2px solid ${accountType === 'business' ? 'var(--oxford-blue)' : '#D4C9BA'}`,
                    backgroundColor: accountType === 'business' ? 'var(--oxford-blue)' : 'white',
                    color: accountType === 'business' ? 'var(--tan)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  🏢 Business
                </button>
              </div>
            </Form.Group>

            {/* ── Business details — only shown when Business is selected ── */}
            {accountType === 'business' && (
              <div
                style={{
                  background: '#f7f4ef',
                  border: '1px solid #EAE0D5',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <p style={{
                  color: 'var(--oxford-blue)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '1rem',
                }}>
                  Business Details
                </p>

                {/* Business name — required for business accounts */}
                <Form.Group className='mb-3'>
                  <Form.Label>
                    Business Name <span style={{ color: '#c0392b' }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='e.g. Kamau General Store'
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </Form.Group>

                {/* Business type dropdown */}
                <Form.Group>
                  <Form.Label>Business Type</Form.Label>
                  <Form.Select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  >
                    <option value=''>Select business type...</option>
                    <option value='Retailer'>Retailer</option>
                    <option value='Wholesaler'>Wholesaler</option>
                    <option value='Distributor'>Distributor</option>
                    <option value='Other'>Other</option>
                  </Form.Select>
                </Form.Group>
              </div>
            )}

            {/* ── Full name ─────────────────────────────────── */}
            <Form.Group className='mb-3'>
              <Form.Label>
                Full Name <span style={{ color: '#c0392b' }}>*</span>
              </Form.Label>
              <Form.Control
                type='text'
                placeholder='Your full name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            {/* ── Email ─────────────────────────────────────── */}
            <Form.Group className='mb-3'>
              <Form.Label>
                Email Address <span style={{ color: '#c0392b' }}>*</span>
              </Form.Label>
              <Form.Control
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {/* ── Phone + County side by side ───────────────── */}
            <Row>
              <Col xs={12} sm={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type='tel'
                    placeholder='0712 345 678'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Form.Text style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Used for M-Pesa and delivery updates
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>County</Form.Label>
                  <Form.Select
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                  >
                    <option value=''>Select county...</option>
                    {KENYA_COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* ── Password ──────────────────────────────────── */}
            <Form.Group className='mb-1'>
              <Form.Label>
                Password <span style={{ color: '#c0392b' }}>*</span>
              </Form.Label>
              <Form.Control
                type='password'
                placeholder='Create a strong password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {/* ── Password strength indicator ───────────────── */}
            {password.length > 0 && (
              <div className='mb-3'>
                {/* Three coloured segments — fill up to current strength level */}
                <div style={{ display: 'flex', gap: '4px', margin: '6px 0 4px' }}>
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        height: '5px',
                        borderRadius: '3px',
                        backgroundColor: strength >= level ? strengthColor : '#EAE0D5',
                        transition: 'background-color 0.25s ease',
                      }}
                    />
                  ))}
                </div>
                {/* Strength label with hint to improve */}
                <small style={{ color: strengthColor, fontWeight: 600 }}>
                  {strengthLabel}
                  {strength < 3 && (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                      {' '}— add {!(/[A-Z]/.test(password)) ? 'an uppercase letter' : 'a number'} to strengthen
                    </span>
                  )}
                </small>
              </div>
            )}

            {/* ── Confirm password ──────────────────────────── */}
            <Form.Group className='mb-4'>
              <Form.Label>
                Confirm Password <span style={{ color: '#c0392b' }}>*</span>
              </Form.Label>
              <Form.Control
                type='password'
                placeholder='Repeat your password'
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
              />
              {/* Live mismatch warning — shows as the user types */}
              {confirmPass && password !== confirmPass && (
                <Form.Text style={{ color: '#c0392b', fontSize: '0.82rem' }}>
                  Passwords do not match
                </Form.Text>
              )}
            </Form.Group>

            {/* ── Submit button ─────────────────────────────── */}
            <Button
              type='submit'
              className='w-100 btn-dark'
              disabled={loading}
              style={{ padding: '0.7rem', fontSize: '1rem', borderRadius: '8px' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            {/* ── Link to login page ────────────────────────── */}
            <Row className='py-3'>
              <Col className='text-center'>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Already have an account?{' '}
                  <Link to='/login' style={{ color: 'var(--oxford-blue)', fontWeight: 600 }}>
                    Sign in
                  </Link>
                </span>
              </Col>
            </Row>

          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;