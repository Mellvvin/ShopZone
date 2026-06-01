// frontend/src/pages/RegisterPage/RegisterPage.jsx
// ─────────────────────────────────────────────────────────────
// Registration page — all inline styles removed.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { register } from '../redux/slices/authSlice';
import { showToast } from '../components/Toast/Toast';
import './RegisterPage.css';

const KENYA_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa',"Murang'a",
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri','Samburu',
  'Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia','Turkana',
  'Uasin Gishu','Vihiga','Wajir','West Pokot',
];

const RegisterPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { userInfo, loading, error } = useSelector((state) => state.auth);

  useEffect(() => { document.title = 'Register — ShopZone'; }, []);

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [county, setCounty]           = useState('');
  const [accountType, setAccountType] = useState('individual');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [formError, setFormError]     = useState('');

  const showError = (msg) => { setFormError(msg); showToast(msg, 'error'); };

  useEffect(() => {
    if (userInfo) {
      showToast(`Welcome to ShopZone, ${userInfo.name.split(' ')[0]}!`, 'success');
      const timer = setTimeout(() => navigate('/'), 500);
      return () => clearTimeout(timer);
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (error) { setFormError(error); showToast(error, 'error'); }
  }, [error]);

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
  const strengthLabel = ['','Weak','Fair','Strong'][strength];
  const strengthClass = ['','reg-strength--weak','reg-strength--fair','reg-strength--strong'][strength];

  const submitHandler = (e) => {
    e.preventDefault();
    setFormError('');
    if (password !== confirmPass) return showError('Passwords do not match.');
    if (strength < 2) return showError('Password must be at least 8 characters and include one uppercase letter and one number.');
    const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
    if (phone && !phoneRegex.test(phone.replace(/\s/g, ''))) return showError('Please enter a valid Kenyan phone number (e.g. 0712 345 678).');
    if (accountType === 'business' && !businessName.trim()) return showError('Please enter your business name.');
    dispatch(register({ name, email, password, phone, accountType, businessName: accountType === 'business' ? businessName : '', businessType: accountType === 'business' ? businessType : '', county }));
  };

  return (
    <Container>
      <Row className='justify-content-center'>
        <Col xs={12} md={8} lg={6}>

          <h2 className='reg-heading'>Create your ShopZone account</h2>
          <p className='reg-sub'>Join thousands of retailers and businesses across Kenya</p>

          {formError && <div className='alert alert-danger'>{formError}</div>}
          {error && !formError && <div className='alert alert-danger'>{error}</div>}

          <Form onSubmit={submitHandler}>

            {/* Account type */}
            <Form.Group className='mb-4'>
              <Form.Label className='reg-label'>I am registering as</Form.Label>
              <div className='d-flex gap-3'>
                <button type='button' className={`reg-type-btn${accountType === 'individual' ? ' reg-type-btn--active' : ''}`} onClick={() => setAccountType('individual')}>
                  👤 Individual Buyer
                </button>
                <button type='button' className={`reg-type-btn${accountType === 'business' ? ' reg-type-btn--active' : ''}`} onClick={() => setAccountType('business')}>
                  🏢 Business
                </button>
              </div>
            </Form.Group>

            {/* Business details */}
            {accountType === 'business' && (
              <div className='reg-section-box mb-4'>
                <p className='reg-section-label'>Business Details</p>
                <Form.Group className='mb-3'>
                  <Form.Label>Business Name <span className='reg-required'>*</span></Form.Label>
                  <Form.Control type='text' placeholder='e.g. Kamau General Store' value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Business Type</Form.Label>
                  <Form.Select value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                    <option value=''>Select business type...</option>
                    <option value='Retailer'>Retailer</option>
                    <option value='Wholesaler'>Wholesaler</option>
                    <option value='Distributor'>Distributor</option>
                    <option value='Other'>Other</option>
                  </Form.Select>
                </Form.Group>
              </div>
            )}

            <Form.Group className='mb-3'>
              <Form.Label>Full Name <span className='reg-required'>*</span></Form.Label>
              <Form.Control type='text' placeholder='Your full name' value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Email Address <span className='reg-required'>*</span></Form.Label>
              <Form.Control type='email' placeholder='you@example.com' value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>

            <Row>
              <Col xs={12} sm={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control type='tel' placeholder='0712 345 678' value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Form.Text className='reg-hint'>Used for M-Pesa and delivery updates</Form.Text>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>County</Form.Label>
                  <Form.Select value={county} onChange={(e) => setCounty(e.target.value)}>
                    <option value=''>Select county...</option>
                    {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-1'>
              <Form.Label>Password <span className='reg-required'>*</span></Form.Label>
              <Form.Control type='password' placeholder='Create a strong password' value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>

            {/* Password strength */}
            {password.length > 0 && (
              <div className='mb-3'>
                <div className='reg-strength-bar'>
                  {[1, 2, 3].map((level) => (
                    <div key={level} className={`reg-strength-segment${strength >= level ? ` ${strengthClass}` : ''}`} />
                  ))}
                </div>
                <small className={`reg-strength-label ${strengthClass}`}>
                  {strengthLabel}
                  {strength < 3 && (
                    <span className='reg-strength-hint'>
                      {' '}— add {!(/[A-Z]/.test(password)) ? 'an uppercase letter' : 'a number'} to strengthen
                    </span>
                  )}
                </small>
              </div>
            )}

            <Form.Group className='mb-4'>
              <Form.Label>Confirm Password <span className='reg-required'>*</span></Form.Label>
              <Form.Control type='password' placeholder='Repeat your password' value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required />
              {confirmPass && password !== confirmPass && (
                <Form.Text className='reg-error-text'>Passwords do not match</Form.Text>
              )}
            </Form.Group>

            <Button type='submit' className='w-100 reg-submit-btn' disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <Row className='py-3'>
              <Col className='text-center'>
                <span className='reg-signin-prompt'>
                  Already have an account?{' '}
                  <Link to='/login' className='reg-link'>Sign in</Link>
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