// frontend/src/pages/CartPage.jsx
// ─────────────────────────────────────────────────────────────
// Shopping cart page (redesigned).
//
// Layout:
//   Desktop — item list on the left, sticky order summary on the right.
//   Mobile  — compact item cards plus a checkout bar pinned just above
//             the bottom tab bar, so the buyer never scrolls to the end
//             to find "Checkout".
//
// Features: stock-capped stepper, remove with Undo (via toast action),
// per-line totals, savings line, VAT-inclusive note (price * 16 / 116),
// Tier 2 delivery-quote chip, final-sale chip (item.finalSale, set by
// the clearance feature), low-stock hint.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTrashAlt, FaMinus, FaPlus, FaLock, FaTruck,
  FaShieldAlt, FaShoppingBag, FaTag, FaExclamationCircle,
} from 'react-icons/fa';
import {
  updateCartQty, removeFromCart, clearCartItems,
  refreshCartPrices, addToCart,
} from '../redux/slices/cartSlice';
import { showToast } from '../components/Toast/Toast';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import { formatKES } from '../utils/formatKES';
import './CartPage.css';

// Categories that need a delivery quote (mirrors shippingRates.js).
// Display only — the backend re-detects this from the database.
const TIER_2_CATEGORIES = ['Hardware & Tools', 'Agriculture & Garden', 'Fabric & Textiles'];
const LOW_STOCK_AT = 5; // same threshold as the seller low-stock notification (rule 78)

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo }  = useSelector((state) => state.auth);
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  useEffect(() => { document.title = 'Your Cart — ShopZone'; }, []);

  // Re-check every item against live product data (sales, price edits)
  useEffect(() => { dispatch(refreshCartPrices()); }, [dispatch]);

  // ── Totals ───────────────────────────────────────────────
  const itemCount = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const subtotal  = cartItems.reduce((acc, i) => acc + i.qty * i.price, 0);
  const savings   = cartItems.reduce(
    (acc, i) => acc + (i.regularPrice > i.price ? (i.regularPrice - i.price) * i.qty : 0), 0
  );
  const vatIncluded = (subtotal * 16) / 116; // VAT is inclusive (rule 5)

  // ── Handlers ─────────────────────────────────────────────
  const confirmClearCart = () => {
    dispatch(clearCartItems());
    showToast('Cart cleared.', 'info');
    setShowClearCartModal(false);
  };

  // Remove, with an Undo action on the toast
  const removeHandler = (item) => {
    dispatch(removeFromCart(item.product));
    showToast(`${item.name} removed.`, 'info', {
      action: {
        label: 'Undo',
        onClick: () => dispatch(addToCart({ id: item.product, qty: item.qty })),
      },
    });
  };

  // Quantity change — never below 1, never above available stock
  const handleQty = (item, raw) => {
    const parsed = parseInt(raw, 10);
    if (raw === '' || isNaN(parsed)) return;
    const max = item.countInStock > 0 ? item.countInStock : Infinity;
    if (parsed > max) showToast(`Only ${item.countInStock} available.`, 'info');
    dispatch(updateCartQty({ id: item.product, qty: Math.min(Math.max(1, parsed), max) }));
  };

  const checkoutHandler = () => {
    if (!userInfo) navigate('/login', { state: { from: '/shipping' } });
    else navigate('/shipping');
  };

  // ── Empty state ──────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className='cp-page'>
        <div className='cp-empty'>
          <FaShoppingBag className='cp-empty__icon' aria-hidden='true' />
          <h1 className='cp-empty__title'>Your cart is empty</h1>
          <p className='cp-empty__text'>Browse wholesale deals and add what your shop needs.</p>
          <Link to='/' className='cp-btn cp-btn--primary'>Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className='cp-page'>
      <ConfirmModal
        show={showClearCartModal}
        onConfirm={confirmClearCart}
        onCancel={() => setShowClearCartModal(false)}
        title='Clear Cart'
        message='Remove all items from your cart?'
        subMessage='This cannot be undone.'
        confirmLabel='Yes, Clear Cart'
        confirmVariant='danger'
      />

      <header className='cp-head'>
        <h1 className='cp-title'>
          Shopping Cart <span className='cp-count'>({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
        </h1>
        <button type='button' className='cp-clear' onClick={() => setShowClearCartModal(true)}>
          Clear cart
        </button>
      </header>

      <div className='cp-layout'>
        {/* ── Items ─────────────────────────────────────── */}
        <ul className='cp-list'>
          {cartItems.map((item) => {
            const lineTotal = item.qty * item.price;
            const isTier2   = TIER_2_CATEGORIES.includes(item.category);
            const lowStock  = item.countInStock > 0 && item.countInStock <= LOW_STOCK_AT;
            return (
              <li key={item.product} className='cp-item'>
                <Link to={`/product/${item.product}`} className='cp-item__imgwrap'>
                  <img src={item.image} alt={item.name} className='cp-item__img' />
                </Link>

                <div className='cp-item__body'>
                  <Link to={`/product/${item.product}`} className='cp-item__name'>{item.name}</Link>

                  <div className='cp-item__price'>
                    <span className='cp-item__now'>{formatKES(item.price)}</span>
                    <span className='cp-item__unit'>/ {item.unitType || 'Per Unit'}</span>
                    {item.regularPrice > item.price && (
                      <span className='cp-item__was'>{formatKES(item.regularPrice)}</span>
                    )}
                  </div>

                  {item.itemsPerUnit > 1 && (
                    <span className='cp-item__piece'>
                      ≈ {formatKES(item.price / item.itemsPerUnit)} / piece
                    </span>
                  )}

                  <div className='cp-item__chips'>
                    {item.finalSale && (
                      <span className='cp-chip cp-chip--final'><FaTag aria-hidden='true' /> Final sale</span>
                    )}
                    {isTier2 && (
                      <span className='cp-chip cp-chip--quote'><FaTruck aria-hidden='true' /> Delivery quote needed</span>
                    )}
                    {lowStock && (
                      <span className='cp-chip cp-chip--low'><FaExclamationCircle aria-hidden='true' /> Only {item.countInStock} left</span>
                    )}
                  </div>

                  <div className='cp-item__actions'>
                    <div className='cp-stepper'>
                      <button type='button' className='cp-stepper__btn' onClick={() => handleQty(item, item.qty - 1)} aria-label='Decrease quantity'>
                        <FaMinus aria-hidden='true' />
                      </button>
                      <input
                        type='number' min={1} value={item.qty}
                        onChange={(e) => handleQty(item, e.target.value)}
                        className='cp-stepper__input'
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <button type='button' className='cp-stepper__btn' onClick={() => handleQty(item, item.qty + 1)} aria-label='Increase quantity'>
                        <FaPlus aria-hidden='true' />
                      </button>
                    </div>
                    <button type='button' className='cp-remove' onClick={() => removeHandler(item)} aria-label={`Remove ${item.name} from cart`}>
                      <FaTrashAlt aria-hidden='true' /> <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div className='cp-item__line'>{formatKES(lineTotal)}</div>
              </li>
            );
          })}
        </ul>

        {/* ── Summary (sticky on desktop) ───────────────── */}
        <aside className='cp-summary' aria-label='Order summary'>
          <h2 className='cp-summary__title'>Order Summary</h2>

          <div className='cp-summary__row'>
            <span>Items</span><span>{itemCount}</span>
          </div>
          <div className='cp-summary__row'>
            <span>Subtotal</span><strong>{formatKES(subtotal)}</strong>
          </div>
          {savings > 0 && (
            <div className='cp-summary__row cp-summary__row--save'>
              <span>You save</span><span>{formatKES(savings)}</span>
            </div>
          )}
          <div className='cp-summary__row cp-summary__row--muted'>
            <span>Includes VAT (16%)</span><span>{formatKES(vatIncluded)}</span>
          </div>
          <p className='cp-summary__note'>Delivery is calculated at checkout by your county.</p>

          <button type='button' className='cp-btn cp-btn--primary cp-btn--block' onClick={checkoutHandler}>
            <FaLock aria-hidden='true' /> Proceed to Checkout
          </button>

          <div className='cp-trust'>
            <span><FaShieldAlt aria-hidden='true' /> Every order handled by ShopZone</span>
            <span><FaTruck aria-hidden='true' /> Tracked delivery across Kenya</span>
          </div>
        </aside>
      </div>

      {/* ── Mobile checkout bar — pinned above the bottom tab bar ── */}
      <div className='cp-mobilebar'>
        <div className='cp-mobilebar__total'>
          <span className='cp-mobilebar__label'>Subtotal ({itemCount})</span>
          <strong className='cp-mobilebar__amount'>{formatKES(subtotal)}</strong>
        </div>
        <button type='button' className='cp-btn cp-btn--primary' onClick={checkoutHandler}>
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;