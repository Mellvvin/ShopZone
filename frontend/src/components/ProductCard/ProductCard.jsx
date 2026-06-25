// frontend/src/components/ProductCard/ProductCard.jsx
// ─────────────────────────────────────────────────────────────
// Reusable product card for the HomePage product grid.
// Extracted from HomePage.jsx — styling unchanged.
//
// Features:
//   - Link wrapper covers badges, image, and info
//   - Cart controls sit outside the link so they don't navigate
//   - Add to Cart fires toast with Go to Cart action
//   - Stepper replaces button after first add
//   - Defensive stock checks on increment and decrement
//   - Disabled + button when qty reaches countInStock
// ─────────────────────────────────────────────────────────────
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaPlus, FaMinus, FaTag, FaFire, FaStar } from 'react-icons/fa';
import { addToCart, updateCartQty, removeFromCart } from '../../redux/slices/cartSlice';
import { showToast } from '../Toast/Toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate  = useNavigate();

  // ── Cart state ────────────────────────────────────────────
  const cartItems = useSelector((state) => state.cart.cartItems);
  const cartItem  = cartItems.find((i) => i.product === product._id);
  const cartQty   = cartItem ? cartItem.qty : 0;

  const displayPrice = product.isOnSale && product.salePrice
    ? product.salePrice
    : product.price;

  const isDiscounted = product.isOnSale && product.salePrice;

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
    // Defensive — check stock regardless of UI state
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
    // Defensive — prevent dispatch if qty already 0
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
    <article className='hp-product-card' aria-label={product.name}>

      {/* ── Link — covers badges, image, info ──────────────── */}
      <Link
        to={`/product/${product._id}`}
        className='hp-product-card__link'
        aria-label={`View ${product.name}`}
      >
        {/* Badges */}
        <div className='hp-product-card__badges' aria-hidden='true'>
          {product.isFeatured && (
            <span className='hp-badge hp-badge--featured'>
              <FaStar /> Featured
            </span>
          )}
          {product.isOnSale && (
            <span className='hp-badge hp-badge--sale'>
              <FaTag /> Sale
            </span>
          )}
          {product.isClearance && (
            <span className='hp-badge hp-badge--clearance'>
              <FaFire /> Clearance
            </span>
          )}
        </div>

        {/* Image */}
        <div className='hp-product-card__img-wrap'>
          <img
            src={product.image}
            alt={product.name}
            className='hp-product-card__img'
            loading='lazy'
          />
        </div>

        {/* Info */}
        <div className='hp-product-card__info'>
          <span className='hp-product-card__category'>{product.category}</span>
          <h3 className='hp-product-card__name'>{product.name}</h3>
          <div className='hp-product-card__price-row'>
            <span className='hp-product-card__price'>
              {`KES ${Number(displayPrice).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}
            </span>
            {isDiscounted && (
              <span className='hp-product-card__original-price'>
                {`KES ${Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}
              </span>
            )}
            {/* Minimal unit badge only — no computed breakdown on grid
                cards per the locked placement decision (DEC-041). The
                full sanity check belongs only on ProductPage. */}
            {(product.unitType || product.unit) && (
              <span className='hp-product-card__unit'>/ {product.unitType || product.unit}</span>
            )}
          </div>
          {product.countInStock === 0 && (
            <span className='hp-product-card__out-of-stock'>Out of stock</span>
          )}
        </div>
      </Link>

      {/* ── Cart controls — outside link ───────────────────── */}
      <div className='hp-product-card__cart-row'>
        {product.countInStock === 0 ? (
          <button className='hp-cart-btn hp-cart-btn--disabled' disabled>
            Out of Stock
          </button>
        ) : cartQty === 0 ? (
          <button
            className='hp-cart-btn hp-cart-btn--add'
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <FaShoppingCart aria-hidden='true' />
            <span className='hp-cart-btn__text'>Add to Cart</span>
          </button>
        ) : (
          <div className='hp-cart-stepper' role='group' aria-label={`Quantity for ${product.name}`}>
            <button
              className='hp-stepper-btn'
              onClick={handleDecrease}
              aria-label='Decrease quantity'
            >
              <FaMinus aria-hidden='true' />
            </button>
            <span className='hp-stepper-qty' aria-live='polite'>{cartQty}</span>
            <button
              className='hp-stepper-btn'
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

export default ProductCard;