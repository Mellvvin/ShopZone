// frontend/src/components/OfferCard/OfferCard.jsx
// ─────────────────────────────────────────────────────────────
// Reusable offer card for the SpecialOffersPage grid.
// Extracted from SpecialOffersPage.jsx — styling unchanged.
//
// Differences from ProductCard:
//   - Discount % badge (top right)
//   - Savings amount line
//   - Low stock warning
//   - Aspect-ratio image (padding-top: 72%)
// ─────────────────────────────────────────────────────────────
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTag, FaFire, FaStar,
  FaShoppingCart, FaPlus, FaMinus,
} from 'react-icons/fa';
import { addToCart, updateCartQty, removeFromCart } from '../../redux/slices/cartSlice';
import { showToast } from '../Toast/Toast';
import './OfferCard.css';

// ── Helpers ───────────────────────────────────────────────────
const getDiscountPct = (original, sale) => {
  if (!original || !sale || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
};

const fmt = (n) =>
  `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

const OfferCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate  = useNavigate();

  const cartItems = useSelector((state) => state.cart.cartItems);
  const cartItem  = cartItems.find((i) => i.product === product._id);
  const cartQty   = cartItem ? cartItem.qty : 0;

  const displayPrice  = product.isOnSale && product.salePrice
    ? product.salePrice
    : product.price;
  const discountPct   = getDiscountPct(product.price, product.salePrice);

  // ── Add to cart ───────────────────────────────────────────
  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart({ id: product._id, qty: 1 }));
    showToast(`${product.name} added to cart`, 'success', {
      action: { label: 'Go to Cart', onClick: () => navigate('/cart') },
    });
  };

  // ── Increment ─────────────────────────────────────────────
  const handleIncrease = (e) => {
    e.stopPropagation();
    if (product.countInStock <= 0) {
      showToast('This product is out of stock', 'error');
      return;
    }
    if (cartQty >= product.countInStock) {
      showToast(`Only ${product.countInStock} units available`, 'error');
      return;
    }
    dispatch(updateCartQty({ id: product._id, qty: cartQty + 1 }));
  };

  // ── Decrement ─────────────────────────────────────────────
  const handleDecrease = (e) => {
    e.stopPropagation();
    if (cartQty > 0) {
      if (cartQty === 1) {
        dispatch(removeFromCart(product._id));
        showToast(`${product.name} removed from cart`, 'info', {
          action: { label: 'Go to Cart', onClick: () => navigate('/cart') },
        });
      } else {
        dispatch(updateCartQty({ id: product._id, qty: cartQty - 1 }));
      }
    }
  };

  return (
    <article className='offer-card' aria-label={product.name}>

      {/* ── Link — covers discount badge, type badges, image, info ── */}
      <Link
        to={`/product/${product._id}`}
        className='offer-card__link'
        aria-label={`View ${product.name}`}
      >
        {/* Discount % badge */}
        {discountPct > 0 && (
          <div className='offer-card__discount-badge' aria-label={`${discountPct}% off`}>
            -{discountPct}%
          </div>
        )}

        {/* Type badges */}
        <div className='offer-card__type-badges'>
          {product.isOnSale && (
            <span className='offer-card__type-badge offer-card__type-badge--sale'>
              <FaTag aria-hidden='true' /> Sale
            </span>
          )}
          {product.isClearance && (
            <span className='offer-card__type-badge offer-card__type-badge--clearance'>
              <FaFire aria-hidden='true' /> Clearance
            </span>
          )}
          {product.isFeatured && (
            <span className='offer-card__type-badge offer-card__type-badge--featured'>
              <FaStar aria-hidden='true' /> Featured
            </span>
          )}
        </div>

        {/* Image */}
        <div className='offer-card__img-wrap'>
          <img
            src={product.image}
            alt={product.name}
            className='offer-card__img'
            loading='lazy'
          />
        </div>

        {/* Info */}
        <div className='offer-card__info'>
          <span className='offer-card__category'>{product.category}</span>
          <h3 className='offer-card__name'>{product.name}</h3>

          <div className='offer-card__price-row'>
            <span className='offer-card__price'>{fmt(displayPrice)}</span>
            {product.isOnSale && product.salePrice && (
              <span className='offer-card__original'>{fmt(product.price)}</span>
            )}
            {product.unit && (
              <span className='offer-card__unit'>/ {product.unit}</span>
            )}
          </div>

          {discountPct > 0 && (
            <span className='offer-card__saving'>
              You save {fmt(product.price - product.salePrice)} per unit
            </span>
          )}

          {product.countInStock === 0 && (
            <span className='offer-card__out-of-stock'>Out of stock</span>
          )}

          {product.countInStock > 0 && product.countInStock <= 10 && (
            <span className='offer-card__low-stock'>
              Only {product.countInStock} left
            </span>
          )}
        </div>
      </Link>

      {/* ── Cart controls — outside link ───────────────────── */}
      <div className='offer-card__cart-row'>
        {product.countInStock === 0 ? (
          <button className='offer-cart-btn offer-cart-btn--disabled' disabled>
            Out of Stock
          </button>
        ) : cartQty === 0 ? (
          <button
            className='offer-cart-btn offer-cart-btn--add'
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <FaShoppingCart aria-hidden='true' /> Add to Cart
          </button>
        ) : (
          <div className='offer-cart-stepper' role='group' aria-label={`Quantity for ${product.name}`}>
            <button
              className='offer-stepper-btn'
              onClick={handleDecrease}
              aria-label='Decrease quantity'
            >
              <FaMinus aria-hidden='true' />
            </button>
            <span className='offer-stepper-qty' aria-live='polite'>{cartQty}</span>
            <button
              className='offer-stepper-btn'
              onClick={handleIncrease}
              aria-label='Increase quantity'
              disabled={cartQty >= product.countInStock}
            >
              <FaPlus aria-hidden='true' />
            </button>
          </div>
        )}
      </div>

    </article>
  );
};

export default OfferCard;