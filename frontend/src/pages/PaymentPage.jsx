// frontend/src/pages/PaymentPage.jsx
// ─────────────────────────────────────────────────────────────
// Payment method selection page.
// Redesigned with branded payment option cards, icons, and copy.
// All styling in PaymentPage.css — zero inline styles.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../redux/slices/cartSlice';
import {
  FaCreditCard, FaMobileAlt, FaUniversity,
  FaArrowLeft, FaCheckCircle, FaShieldAlt,
} from 'react-icons/fa';
import CheckoutSteps from '../components/CheckoutSteps/CheckoutSteps';
import './PaymentPage.css';

// ── Payment options ───────────────────────────────────────────
const PAYMENT_OPTIONS = [
  {
    value: 'PayPal',
    label: 'PayPal or Credit Card',
    description: 'Pay securely using your PayPal account or any major credit or debit card.',
    icon: FaCreditCard,
    badge: null,
  },
  {
    value: 'MPesa',
    label: 'M-Pesa',
    description: 'Pay via M-Pesa mobile money. You will receive an STK push prompt on your phone after placing your order.',
    icon: FaMobileAlt,
    badge: 'Most Popular',
  },
  {
    value: 'BankTransfer',
    label: 'Bank Transfer',
    description: 'Pay directly from your bank account. ShopZone will send you the account details after your order is confirmed.',
    icon: FaUniversity,
    badge: null,
  },
];

const PaymentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { shippingAddress } = useSelector((state) => state.cart);

  // ── Page title ─────────────────────────────────────────────
  useEffect(() => { document.title = 'Payment — ShopZone'; }, []);

  const { userInfo } = useSelector((state) => state.auth);

  const [paymentMethod, setPaymentMethod] = useState('MPesa');

  useEffect(() => {
    if (!userInfo) navigate('/login?redirect=shipping');
    if (!shippingAddress?.address) navigate('/shipping');
  }, [userInfo, shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <div className='payment-page'>

      {/* ── Progress indicator ──────────────────────────────────── */}
      <CheckoutSteps currentStep={3} />
      

      <div className='payment-page__inner'>

        {/* ── Back button ─────────────────────────────────────────── */}
        <button
          className='payment-back-btn'
          onClick={() => navigate('/shipping')}
          aria-label='Back to shipping'
        >
          <FaArrowLeft aria-hidden='true' /> Back
        </button>

        <div className='payment-card'>
          <h1 className='payment-card__title'>Payment Method</h1>
          <p className='payment-card__subtitle'>
            All payments are processed securely through ShopZone.
            You will never be asked to pay a supplier directly.
          </p>

          <form onSubmit={submitHandler}>

            {/* ── Payment option cards ──────────────────────────── */}
            <div className='payment-options'>
              {PAYMENT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = paymentMethod === option.value;
                return (
                  <label
                    key={option.value}
                    className={`payment-option ${isSelected ? 'payment-option--selected' : ''}`}
                    htmlFor={option.value}
                  >
                    {/* Hidden radio input — label handles click */}
                    <input
                      type='radio'
                      id={option.value}
                      name='paymentMethod'
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className='payment-option__input'
                    />

                    {/* Icon box */}
                    <div className='payment-option__icon-wrap'>
                      <Icon className='payment-option__icon' aria-hidden='true' />
                    </div>

                    {/* Text */}
                    <div className='payment-option__text'>
                      <div className='payment-option__label-row'>
                        <span className='payment-option__label'>{option.label}</span>
                        {option.badge && (
                          <span className='payment-option__badge'>{option.badge}</span>
                        )}
                      </div>
                      <p className='payment-option__description'>{option.description}</p>
                    </div>

                    {/* Selected tick */}
                    {isSelected && (
                      <FaCheckCircle
                        className='payment-option__tick'
                        aria-hidden='true'
                      />
                    )}
                  </label>
                );
              })}
            </div>

            {/* ── Trust note ────────────────────────────────────── */}
            <div className='payment-trust'>
              <FaShieldAlt className='payment-trust__icon' aria-hidden='true' />
              <span>
                Your payment details are never shared with sellers.
                ShopZone holds all funds until your order is delivered.
              </span>
            </div>

            {/* ── Submit ────────────────────────────────────────── */}
            <button type='submit' className='payment-submit-btn'>
              Continue to Order Summary
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;