// frontend/src/components/CheckoutSteps/CheckoutSteps.jsx
// ─────────────────────────────────────────────────────────────
// Shared checkout progress indicator.
// Used on ShippingPage (step 2), PaymentPage (step 3),
// and PlaceOrderPage (step 4).
//
// Props:
//   currentStep — number, 1–4
//     1 = Cart
//     2 = Shipping
//     3 = Payment
//     4 = Place Order
// ─────────────────────────────────────────────────────────────
import { FaShoppingCart, FaTruck, FaCreditCard, FaClipboardCheck } from 'react-icons/fa';
import './CheckoutSteps.css';

const STEPS = [
    { number: 1, label: 'Cart', icon: FaShoppingCart },
    { number: 2, label: 'Shipping', icon: FaTruck },
    { number: 3, label: 'Payment', icon: FaCreditCard },
    { number: 4, label: 'Place Order', icon: FaClipboardCheck },
];

const CheckoutSteps = ({ currentStep }) => {
    return (
        <div className='checkout-steps' role='navigation' aria-label='Checkout progress'>
            {STEPS.map((step, idx) => {
                const isDone = step.number < currentStep;
                const isActive = step.number === currentStep;
                const isPending = step.number > currentStep;
                const Icon = step.icon;

                return (
                    <div key={step.number} className='checkout-steps__item'>

                        {/* Step bubble + connector */}
                        <div className='checkout-steps__track'>

                            {/* Left connector line — hidden for first step */}
                            <div className={[
                                'checkout-steps__line checkout-steps__line--left',
                                idx === 0 ? 'checkout-steps__line--invisible' : '',
                                isDone || isActive ? 'checkout-steps__line--filled' : '',
                            ].join(' ')} aria-hidden='true' />

                            {/* The bubble itself */}
                            <div className={[
                                'checkout-steps__bubble',
                                isDone ? 'checkout-steps__bubble--done' : '',
                                isActive ? 'checkout-steps__bubble--active' : '',
                                isPending ? 'checkout-steps__bubble--pending' : '',
                            ].join(' ')}
                                aria-current={isActive ? 'step' : undefined}
                            >
                                {isDone ? (
                                    <span className='checkout-steps__tick' aria-hidden='true'>✓</span>
                                ) : (
                                    <Icon className='checkout-steps__icon' aria-hidden='true' />
                                )}
                            </div>

                            {/* Right connector line — hidden for last step */}
                            <div className={[
                                'checkout-steps__line checkout-steps__line--right',
                                idx === STEPS.length - 1 ? 'checkout-steps__line--invisible' : '',
                                isDone ? 'checkout-steps__line--filled' : '',
                            ].join(' ')} aria-hidden='true' />

                        </div>

                        {/* Label below bubble */}
                        <div className={[
                            'checkout-steps__label',
                            isActive ? 'checkout-steps__label--active' : '',
                            isDone ? 'checkout-steps__label--done' : '',
                            isPending ? 'checkout-steps__label--pending' : '',
                        ].join(' ')}>
                            <span className='checkout-steps__number'>{step.number}</span>
                            {step.label}
                        </div>

                    </div>
                );
            })}
        </div>
    );
};

export default CheckoutSteps;