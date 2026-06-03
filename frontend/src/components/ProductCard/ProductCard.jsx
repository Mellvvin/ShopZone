// frontend/src/components/ProductCard/ProductCard.jsx
// ─────────────────────────────────────────────────────────────
// Reusable product card used on HomePage, SpecialOffersPage,
// BrandsPage, and any future product grid.
//
// Changes from previous version:
//   - All inline styles removed — see ProductCard.css
//   - Add to Cart button added below the price row
//   - Clicking the card image/name navigates to product page
//   - Add to Cart does NOT navigate — stays on current page
//   - showToast fires on add with product name + Go to Cart action
//   - Quantity stepper appears after first add, replaces button
//   - Out of stock shown as a disabled badge, no cart button
//   - Sale and clearance badges shown when applicable
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';
import { addToCart, updateCartQty, removeFromCart } from '../../redux/slices/cartSlice';
import { showToast } from '../Toast/Toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);

  // ── Check if this product is already in the cart ──────────
  // Uses item.product as the ID field — never item._id
  const cartItem = cartItems.find((item) => item.product === product._id);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  // ── Local stepper state ───────────────────────────────────
  // After first add, the button switches to a stepper.
  // This is driven by qtyInCart from Redux — no local qty state needed.

  // ── Add to cart ───────────────────────────────────────────
  const handleAdd = (e) => {
    // Stop click from bubbling to the card and navigating
    e.stopPropagation();
    dispatch(addToCart({ id: product._id, qty: 1 }));
    showToast(
      `${product.name} added to cart`,
      'success',
      {
        action: {
          label: 'Go to Cart',
          onClick: () => navigate('/cart'),
        },
      }
    );
  };

  // ── Stepper increment ──────────────────────────────────────
  const handleIncrement = (e) => {
    e.stopPropagation();
    dispatch(updateCartQty({ id: product._id, qty: qtyInCart + 1 }));
  };

  // ── Stepper decrement ──────────────────────────────────────
  // Removes from cart when qty would go to 0
const handleDecrement = (e) => {
    e.stopPropagation();
    if (qtyInCart <= 1) {
      // Remove entirely — updateCartQty with qty:0 does not clean up the array
      dispatch(removeFromCart(product._id));
      showToast(`${product.name} removed from cart`, 'info');
    } else {
      dispatch(updateCartQty({ id: product._id, qty: qtyInCart - 1 }));
    }
  };

  // ── Navigate to product page ──────────────────────────────
  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const isOutOfStock = product.countInStock === 0;
  const isOnSale     = product.isOnSale && product.salePrice;
  const isClearance  = product.isClearance;

  return (
    <div
      className='pc-card'
      onClick={handleCardClick}
      role='article'
      aria-label={product.name}
    >

      {/* ── Badges ─────────────────────────────────────────── */}
      <div className='pc-badges' aria-label='Product badges'>
        {isOnSale && (
          <span className='pc-badge pc-badge--sale'>Sale</span>
        )}
        {isClearance && !isOnSale && (
          <span className='pc-badge pc-badge--clearance'>Clearance</span>
        )}
        {isOutOfStock && (
          <span className='pc-badge pc-badge--oos'>Out of Stock</span>
        )}
      </div>

      {/* ── Image ──────────────────────────────────────────── */}
      <div className='pc-img-wrap'>
        <img
          src={product.image}
          alt={product.name}
          className='pc-img'
          loading='lazy'
        />
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className='pc-body'>

        {/* Name */}
        <h3 className='pc-name'>{product.name}</h3>

        {/* Stars */}
        <div className='pc-stars-row'>
          <span className='product-card-stars' aria-hidden='true'>
            {'★'.repeat(Math.round(product.rating || 0))}
            {'☆'.repeat(5 - Math.round(product.rating || 0))}
          </span>
          <span className='product-card-reviews'>
            ({product.numReviews || 0})
          </span>
        </div>

        {/* Price row */}
        <div className='pc-price-row'>
          <div className='pc-price-group'>
            {isOnSale ? (
              <>
                <span className='product-card-price'>
                  KES {Number(product.salePrice).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </span>
                <span className='pc-price-original'>
                  KES {Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </span>
              </>
            ) : (
              <span className='product-card-price'>
                KES {Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <span className='pc-unit'>{product.unit || 'Per Unit'}</span>
        </div>

      </div>

      {/* ── Cart controls ──────────────────────────────────── */}
      <div className='pc-cart-row' onClick={(e) => e.stopPropagation()}>
        {isOutOfStock ? (
          <span className='pc-oos-label'>Out of stock</span>
        ) : qtyInCart > 0 ? (
          // Stepper — replaces button after first add
          <div className='pc-stepper' role='group' aria-label={`Quantity of ${product.name} in cart`}>
            <button
              className='pc-stepper__btn'
              onClick={handleDecrement}
              aria-label='Decrease quantity'
            >
              <FaMinus />
            </button>
            <span className='pc-stepper__qty'>{qtyInCart}</span>
            <button
              className='pc-stepper__btn'
              onClick={handleIncrement}
              aria-label='Increase quantity'
            >
              <FaPlus />
            </button>
          </div>
        ) : (
          // Add to cart button
          <button
            className='pc-add-btn'
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            <FaShoppingCart aria-hidden='true' />
            Add to Cart
          </button>
        )}
      </div>

    </div>
  );
};

export default ProductCard;