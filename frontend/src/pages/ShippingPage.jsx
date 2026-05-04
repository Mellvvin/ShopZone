import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../redux/slices/cartSlice';

const ShippingPage = () => {
  const { shippingAddress } = useSelector((state) => state.cart);
  const { userInfo }        = useSelector((state) => state.auth);

  const isPreFilled = shippingAddress?.address ? true : false;

  const [address, setAddress]         = useState(shippingAddress?.address     || '');
  const [city, setCity]               = useState(shippingAddress?.city        || '');
  const [postalCode, setPostalCode]   = useState(shippingAddress?.postalCode  || '');
  const [country, setCountry]         = useState(shippingAddress?.country     || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=shipping');
    }
  }, [userInfo, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <div className='d-flex justify-content-center mt-5'>
      <Card
        className='p-4 shadow-sm'
        style={{ width: '100%', maxWidth: '500px' }}
      >
        {/* ── Progress Indicator ── */}
        <div className='d-flex justify-content-between mb-4'>
          {['Shipping', 'Payment', 'Place Order'].map((step, index) => (
            <div key={step} className='text-center' style={{ flex: 1 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: index === 0
                  ? 'var(--oxford-blue)'
                  : 'var(--tan-light)',
                color: index === 0
                  ? 'var(--tan)'
                  : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 6px',
                fontWeight: '700',
                fontSize: '0.85rem',
              }}>
                {index + 1}
              </div>
              <small style={{
                color: index === 0
                  ? 'var(--oxford-blue)'
                  : 'var(--text-muted)',
                fontWeight: index === 0 ? '600' : '400',
              }}>
                {step}
              </small>
            </div>
          ))}
        </div>

        <h2
          className='text-center mb-3'
          style={{ color: 'var(--oxford-blue)' }}
        >
          Shipping Address
        </h2>

        {/* ── Pre-fill Notice ── */}
        {isPreFilled && (
          <Alert style={{
            backgroundColor: 'var(--tan-light)',
            borderColor: 'var(--tan)',
            color: 'var(--oxford-blue)',
            fontSize: '0.88rem',
            marginBottom: '1.2rem',
          }}>
            📦 We remembered your last address. Feel free to update it
            if needed.
          </Alert>
        )}

        <Form onSubmit={submitHandler}>
          <Form.Group controlId='address' className='mb-3'>
            <Form.Label>Street Address</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter street address'
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId='city' className='mb-3'>
            <Form.Label>City</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter city'
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId='postalCode' className='mb-3'>
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter postal code'
              value={postalCode}
              required
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId='country' className='mb-3'>
            <Form.Label>Country</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter country'
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
            />
          </Form.Group>

          <Button
            type='submit'
            variant='dark'
            className='w-100 mt-2'
          >
            Continue to Payment
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ShippingPage;