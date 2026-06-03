// HomePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// CHANGES FROM PREVIOUS VERSION:
//   • ProductCard now has an Add to Cart button
//   • After adding, button becomes inline − qty + stepper
//   • Card body click still navigates to product page
//   • Imports addToCart, updateCartQty, removeFromCart from cartSlice
//   • showToast fired on add and on remove via stepper reaching 0
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { listProducts } from '../redux/slices/productSlice';
import { addToCart, updateCartQty, removeFromCart } from '../redux/slices/cartSlice';
import { showToast } from '../components/Toast/Toast';
import HeroBanner from '../components/HeroBanner/HeroBanner';
import CategoryCards from '../components/CategoryCards/CategoryCards';
import {
  FaArrowLeft,
  FaTag,
  FaFire,
  FaStar,
  FaChevronRight,
  FaShoppingCart,
  FaPlus,
  FaMinus,
} from 'react-icons/fa';
import './HomePage.css';

const FEATURED_LIMIT = 8;
const NEW_ARRIVALS_LIMIT = 4;

// ─────────────────────────────────────────────────────────────────────────
// ProductCard
// ─────────────────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Read cart to know if this product is already in it and at what qty
  const cartItems = useSelector((state) => state.cart.cartItems);
  const cartItem = cartItems.find((i) => i.product === product._id);
  const cartQty = cartItem ? cartItem.qty : 0;

  const displayPrice = product.isOnSale && product.salePrice
    ? product.salePrice
    : product.price;

  const isDiscounted = product.isOnSale && product.salePrice;

  // Navigation handled by the Link wrapper around image + info sections, so cart buttons don't interfere with that

  // Add to cart — adds 1 unit, fires toast, does not navigate
 const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart({ id: product._id, qty: 1 }));
    showToast(`${product.name} added to cart`, 'success', {
      action: { label: 'Go to Cart', onClick: () => navigate('/cart') },
    });
  };
   
  
  // Increase qty — if already in cart bump by 1, cap at countInStock
  const handleIncrease = (e) => {
    e.stopPropagation();
    if (cartQty >= product.countInStock) {
      showToast(`Only ${product.countInStock} units available`, 'error');
      return;
    }
    dispatch(updateCartQty({ id: product._id, qty: cartQty + 1 }));
  };

  // Decrease qty — if qty reaches 0 remove from cart entirely
  const handleDecrease = (e) => {
    e.stopPropagation();
    if (cartQty === 1) {
      dispatch(removeFromCart(product._id));
      showToast(`${product.name} removed from cart`, 'info');
    } else {
      dispatch(updateCartQty({ id: product._id, qty: cartQty - 1 }));
    }
  };

  return (
    <article className='hp-product-card' aria-label={product.name}>
      {/* Link wraps badges, image and info — not the cart row */}
      <Link
        to={`/product/${product._id}`}
        className='hp-product-card__link'
        aria-label={`View ${product.name}`}
      >
        {/* ── Badges ────────────────────────────────────────────────── */}
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

      {/* ── Image ─────────────────────────────────────────────────── */}
      <div className='hp-product-card__img-wrap'>
        <img
          src={product.image}
          alt={product.name}
          className='hp-product-card__img'
          loading='lazy'
        />
      </div>

      {/* ── Info ──────────────────────────────────────────────────── */}
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
          {product.unit && (
            <span className='hp-product-card__unit'>/ {product.unit}</span>
          )}
        </div>

        {product.countInStock === 0 && (
          <span className='hp-product-card__out-of-stock'>Out of stock</span>
        )}
      </div>
      </Link>

      {/* ── Cart controls ─────────────────────────────────────────── */}
      {/* Cart row is outside the Link so clicks don't navigate */}
      <div
        className='hp-product-card__cart-row' 
      >
        {product.countInStock === 0 ? (
          // Out of stock — disabled button
          <button className='hp-cart-btn hp-cart-btn--disabled' disabled>
            Out of Stock
          </button>
        ) : cartQty === 0 ? (
          // Not in cart — show Add to Cart button
            <button
              className='hp-cart-btn hp-cart-btn--add'
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              <FaShoppingCart aria-hidden='true' />
              <span className='hp-cart-btn__text'>Add to Cart</span>
            </button>
        ) : (
          // Already in cart — show stepper
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
            >
              <FaPlus aria-hidden='true' />
            </button>
          </div>
        )}
      </div>

    </article>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// SkeletonCard
// ─────────────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className='hp-skeleton-card' aria-hidden='true'>
    <div className='hp-skeleton hp-skeleton--img' />
    <div className='hp-skeleton hp-skeleton--line hp-skeleton--short' />
    <div className='hp-skeleton hp-skeleton--line' />
    <div className='hp-skeleton hp-skeleton--line hp-skeleton--price' />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
// ProductRow
// ─────────────────────────────────────────────────────────────────────────
const ProductRow = ({ title, subtitle, products, loading, error, viewAllHref, icon: Icon }) => {
  const navigate = useNavigate();

  return (
    <section className='hp-product-row' aria-labelledby={`row-${title.replace(/\s+/g, '-')}`}>
      <div className='hp-row-header'>
        <div className='hp-row-header__left'>
          {Icon && <Icon className='hp-row-header__icon' aria-hidden='true' />}
          <div>
            <h2 className='hp-row-header__title' id={`row-${title.replace(/\s+/g, '-')}`}>
              {title}
            </h2>
            {subtitle && <p className='hp-row-header__subtitle'>{subtitle}</p>}
          </div>
        </div>
        {viewAllHref && (
          <button
            className='hp-view-all-btn'
            onClick={() => navigate(viewAllHref)}
            aria-label={`View all ${title}`}
          >
            View all <FaChevronRight aria-hidden='true' />
          </button>
        )}
      </div>

      {loading ? (
        <div className='hp-product-grid'>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <p className='hp-row-error'>Could not load products. Please try again.</p>
      ) : products && products.length > 0 ? (
        <div className='hp-product-grid'>
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      ) : (
        <p className='hp-row-empty'>No products available in this section yet.</p>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// DealsBanner
// ─────────────────────────────────────────────────────────────────────────
const DealsBanner = () => {
  const navigate = useNavigate();

  return (
    <div className='hp-deals-banner' aria-label='Deals and clearance promotion'>
      <div className='hp-deals-banner__content'>
        <FaFire className='hp-deals-banner__icon' aria-hidden='true' />
        <div>
          <strong className='hp-deals-banner__title'>Deals &amp; Clearance</strong>
          <p className='hp-deals-banner__text'>
            Limited-time offers on bulk orders — stock up and save big.
          </p>
        </div>
      </div>
      <button
        className='hp-deals-banner__cta'
        onClick={() => navigate('/offers')}
        aria-label='Browse all deals and clearance items'
      >
        Browse Deals <FaChevronRight aria-hidden='true' />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// HomePage
// ─────────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const deals = searchParams.get('deals') || '';
  const featured = searchParams.get('featured') || '';
  const clearance = searchParams.get('clearance') || '';
  const tag = searchParams.get('tag') || '';

  const isBrowsingMode = !!(keyword || category || deals || featured || clearance || tag);

  const { products, loadingList, errorList } = useSelector((state) => state.products);

  // ── Page title for screen readers and browser tab ──────────
  useEffect(() => { document.title = 'ShopZone — Kenya\'s B2B Wholesale Platform'; }, []);

  useEffect(() => {
    if (isBrowsingMode) {
      const filters = {};
      if (keyword) filters.keyword = keyword;
      if (category) filters.category = category;
      if (deals) filters.deals = deals;
      if (featured) filters.featured = featured;
      if (clearance) filters.clearance = clearance;
      if (tag) filters.tag = tag;
      dispatch(listProducts(filters));
    } else {
      dispatch(listProducts({ featured: 'true' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category, deals, featured, clearance, tag]);

  const featuredProducts = !isBrowsingMode ? products.slice(0, FEATURED_LIMIT) : [];
  const newArrivalsProducts = !isBrowsingMode ? [...products].reverse().slice(0, NEW_ARRIVALS_LIMIT) : [];

  const getBrowseHeading = () => {
    if (keyword) return `Search results for "${keyword}"`;
    if (category) return category;
    if (deals) return 'Deals & Sale Items';
    if (featured) return 'Featured Products';
    if (clearance) return 'Clearance Items';
    if (tag) return `Tagged: ${tag}`;
    return 'All Products';
  };

  return (
    <div className='homepage'>

      {/* ══ HOME STATE ════════════════════════════════════════════════ */}
      {!isBrowsingMode && (
        <>
          <HeroBanner />
          <div className='homepage__hero-offset' aria-hidden='true' />
          <CategoryCards />

          <div className='homepage__section-wrapper' id='featured-section'>
            <ProductRow
              title='Featured Products'
              subtitle='Handpicked wholesale favourites for your business'
              products={featuredProducts}
              loading={loadingList}
              error={errorList}
              viewAllHref='/?featured=true'
              icon={FaStar}
            />
          </div>

          <div className='homepage__section-wrapper homepage__section-wrapper--banner'>
            <DealsBanner />
          </div>

          <div className='homepage__section-wrapper'>
            <ProductRow
              title='New Arrivals'
              subtitle='The latest products added to the platform'
              products={newArrivalsProducts}
              loading={loadingList}
              error={errorList}
              viewAllHref='/'
              icon={FaFire}
            />
          </div>
        </>
      )}

      {/* ══ BROWSE / SEARCH STATE ════════════════════════════════════ */}
      {isBrowsingMode && (
        <div className='homepage__browse-wrapper'>
          <div className='homepage__browse-header'>
            <button
              className='homepage__back-btn'
              onClick={() => navigate('/')}
              aria-label='Back to homepage'
            >
              <FaArrowLeft aria-hidden='true' /> Back to Home
            </button>
            <h1 className='homepage__browse-title'>{getBrowseHeading()}</h1>
          </div>

          {loadingList ? (
            <div className='hp-product-grid'>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : errorList ? (
            <div className='homepage__error'><p>{errorList}</p></div>
          ) : products && products.length > 0 ? (
            <div className='hp-product-grid'>
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className='homepage__empty'>
              <p>No products found. Try a different search or category.</p>
              <button className='homepage__back-btn' onClick={() => navigate('/')}>
                Back to Home
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default HomePage;