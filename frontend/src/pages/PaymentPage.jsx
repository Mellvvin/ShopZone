import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../redux/slices/cartSlice';

const PaymentPage = () => {
  const { shippingAddress } = useSelector((state) => state.cart);
  const { userInfo }        = useSelector((state) => state.auth);

  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=shipping');
    }
    if (!shippingAddress?.address) {
      navigate('/shipping');
    }
  }, [userInfo, shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <div className='d-flex justify-content-center mt-5'>
      <Card className='p-4 shadow-sm' style={{ width: '100%', maxWidth: '500px' }}>

        {/* ── Progress Indicator ── */}
        <div className='d-flex justify-content-between mb-4'>
          {['Shipping', 'Payment', 'Place Order'].map((step, index) => (
            <div key={step} className='text-center' style={{ flex: 1 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: index === 1
                  ? 'var(--oxford-blue)'
                  : index < 1
                  ? 'var(--tan)'
                  : 'var(--tan-light)',
                color: index <= 1 ? 'var(--oxford-blue)' : 'var(--text-muted)',
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
                color: index === 1 ? 'var(--oxford-blue)' : 'var(--text-muted)',
                fontWeight: index === 1 ? '600' : '400',
              }}>
                {step}
              </small>
            </div>
          ))}
        </div>

        <h2 className='text-center mb-4' style={{ color: 'var(--oxford-blue)' }}>
          Payment Method
        </h2>

        <Form onSubmit={submitHandler}>
          <Form.Group className='mb-4'>
            <Form.Label style={{
              color: 'var(--oxford-blue)',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Select Payment Method
            </Form.Label>

            <Col>
              <Form.Check
                type='radio'
                label='PayPal or Credit Card'
                id='PayPal'
                name='paymentMethod'
                value='PayPal'
                checked={paymentMethod === 'PayPal'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className='mb-3'
                style={{ color: 'var(--text-dark)' }}
              />
              <Form.Check
                type='radio'
                label='M-Pesa'
                id='MPesa'
                name='paymentMethod'
                value='MPesa'
                checked={paymentMethod === 'MPesa'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className='mb-3'
                style={{ color: 'var(--text-dark)' }}
              />
              <Form.Check
                type='radio'
                label='Bank Transfer'
                id='BankTransfer'
                name='paymentMethod'
                value='BankTransfer'
                checked={paymentMethod === 'BankTransfer'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ color: 'var(--text-dark)' }}
              />
            </Col>
          </Form.Group>

          <Button
            type='submit'
            variant='dark'
            className='w-100 mt-2'
          >
            Continue to Order Summary
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default PaymentPage;