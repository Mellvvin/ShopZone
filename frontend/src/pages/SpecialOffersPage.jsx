// SpecialOffersPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Dedicated page at /offers showing all products where isOnSale or
// isClearance is true. Three filter tabs: All Offers | Sale | Clearance.
// Each card shows the discount percentage saved.
// Add to Cart / stepper logic identical to HomePage ProductCard.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { listProducts } from '../redux/slices/productSlice';
import { addToCart, updateCartQty, removeFromCart } from '../redux/slices/cartSlice';
import { showToast } from '../components/Toast/Toast';
import {
    FaTag,
    FaFire,
    FaBolt,
    FaShoppingCart,
    FaPlus,
    FaMinus,
    FaStar,
} from 'react-icons/fa';
import './SpecialOffersPage.css';

// ── Helper: calculate % saved ─────────────────────────────────────────────
const getDiscountPct = (original, sale) => {
    if (!original || !sale || sale >= original) return 0;
    return Math.round(((original - sale) / original) * 100);
};

// ── Helper: format currency ───────────────────────────────────────────────
const fmt = (n) => `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

// ─────────────────────────────────────────────────────────────────────────
// OfferCard — product card with discount badge and cart controls
// ─────────────────────────────────────────────────────────────────────────
const OfferCard = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cartItems = useSelector((state) => state.cart.cartItems);
    const cartItem = cartItems.find((i) => i.product === product._id);
    const cartQty = cartItem ? cartItem.qty : 0;

    const displayPrice = product.isOnSale && product.salePrice
        ? product.salePrice
        : product.price;

    const discountPct = getDiscountPct(product.price, product.salePrice);

    // Navigation handled by the Link wrapper around image + info

    const handleAddToCart = (e) => {
        e.stopPropagation();
        dispatch(addToCart({ id: product._id, qty: 1 }));
        showToast(`${product.name} added to cart`, 'success');
    };

    const handleIncrease = (e) => {
        e.stopPropagation();
        if (cartQty >= product.countInStock) {
            showToast(`Only ${product.countInStock} units available`, 'error');
            return;
        }
        dispatch(updateCartQty({ id: product._id, qty: cartQty + 1 }));
    };


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
        <article className='offer-card' aria-label={product.name}>
            {/* Link wraps discount badge, type badges, image and info */}
            <Link
                to={`/product/${product._id}`}
                className='offer-card__link'
                aria-label={`View ${product.name}`}
            >
                {/* ── Discount % badge ──────────────────────────────────────── */}
            {discountPct > 0 && (
                <div className='offer-card__discount-badge' aria-label={`${discountPct}% off`}>
                    -{discountPct}%
                </div>
            )}

            {/* ── Type badge (Sale / Clearance) ──────────────────────────── */}
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

            {/* ── Image ─────────────────────────────────────────────────── */}
            <div className='offer-card__img-wrap'>
                <img
                    src={product.image}
                    alt={product.name}
                    className='offer-card__img'
                    loading='lazy'
                />
            </div>

            {/* ── Info ──────────────────────────────────────────────────── */}
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

                {/* Savings amount */}
                {discountPct > 0 && (
                    <span className='offer-card__saving'>
                        You save {fmt(product.price - product.salePrice)} per unit
                    </span>
                )}

                {product.countInStock === 0 && (
                    <span className='offer-card__out-of-stock'>Out of stock</span>
                )}

                {/* Low stock warning */}
                {product.countInStock > 0 && product.countInStock <= 10 && (
                    <span className='offer-card__low-stock'>
                        Only {product.countInStock} left
                    </span>
                )}
            </div>
           
           </Link>
            {/* ── Cart controls ─────────────────────────────────────────── */}
            <div
                className='offer-card__cart-row'
            >
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
    <div className='offer-skeleton' aria-hidden='true'>
        <div className='offer-skeleton__img' />
        <div className='offer-skeleton__line offer-skeleton__line--short' />
        <div className='offer-skeleton__line' />
        <div className='offer-skeleton__line offer-skeleton__line--price' />
    </div>
);

// ─────────────────────────────────────────────────────────────────────────
// SpecialOffersPage
// ─────────────────────────────────────────────────────────────────────────
const SpecialOffersPage = () => {
    const dispatch = useDispatch();

    // 'all' | 'sale' | 'clearance'
    const [activeTab, setActiveTab] = useState('all');

    const { products, loadingList, errorList } = useSelector((state) => state.products);

    // ── Page title ─────────────────────────────────────────────
    useEffect(() => { document.title = 'Special Offers — ShopZone'; }, []);

    // Fetch all deals on mount — backend returns isOnSale OR isClearance products
    useEffect(() => {
        dispatch(listProducts({ deals: 'true' }));
    }, [dispatch]);

    // Filter products by active tab
    const displayedProducts = products.filter((p) => {
        if (activeTab === 'sale') return p.isOnSale;
        if (activeTab === 'clearance') return p.isClearance;
        return true; // 'all' — show everything returned
    });

    // Counts for tab badges
    const saleCount = products.filter((p) => p.isOnSale).length;
    const clearanceCount = products.filter((p) => p.isClearance).length;

    return (
        <div className='offers-page'>

            {/* ── Hero strip ────────────────────────────────────────────── */}
            <div className='offers-hero'>
                <div className='offers-hero__inner'>
                    <div className='offers-hero__eyebrow'>
                        <FaBolt aria-hidden='true' /> Limited Time
                    </div>
                    <h1 className='offers-hero__title'>
                        Special Offers &amp; Deals
                    </h1>
                    <p className='offers-hero__subtitle'>
                        Wholesale prices slashed even further — bulk up and save big.
                    </p>
                </div>

                {/* Decorative shape */}
                <div className='offers-hero__shape' aria-hidden='true' />
            </div>

            {/* ── Tab bar ───────────────────────────────────────────────── */}
            <div className='offers-tabs' role='tablist'>
                <button
                    className={`offers-tab ${activeTab === 'all' ? 'offers-tab--active' : ''}`}
                    onClick={() => setActiveTab('all')}
                    role='tab'
                    aria-selected={activeTab === 'all'}
                >
                    All Offers
                    <span className='offers-tab__count'>{products.length}</span>
                </button>

                <button
                    className={`offers-tab ${activeTab === 'sale' ? 'offers-tab--active' : ''}`}
                    onClick={() => setActiveTab('sale')}
                    role='tab'
                    aria-selected={activeTab === 'sale'}
                >
                    <FaTag aria-hidden='true' /> Sale
                    <span className='offers-tab__count offers-tab__count--sale'>{saleCount}</span>
                </button>

                <button
                    className={`offers-tab ${activeTab === 'clearance' ? 'offers-tab--active' : ''}`}
                    onClick={() => setActiveTab('clearance')}
                    role='tab'
                    aria-selected={activeTab === 'clearance'}
                >
                    <FaFire aria-hidden='true' /> Clearance
                    <span className='offers-tab__count offers-tab__count--clearance'>{clearanceCount}</span>
                </button>
            </div>

            {/* ── Results heading ───────────────────────────────────────── */}
            <div className='offers-page__inner'>
                {!loadingList && !errorList && (
                    <p className='offers-results-count'>
                        {displayedProducts.length} offer{displayedProducts.length !== 1 ? 's' : ''} found
                    </p>
                )}

                {/* ── Grid ──────────────────────────────────────────────── */}
                {loadingList ? (
                    <div className='offers-grid'>
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : errorList ? (
                    <div className='offers-error'>
                        <p>{errorList}</p>
                    </div>
                ) : displayedProducts.length === 0 ? (
                    <div className='offers-empty'>
                        <FaTag className='offers-empty__icon' aria-hidden='true' />
                        <p>No {activeTab === 'all' ? '' : activeTab} offers available right now.</p>
                        <p className='offers-empty__sub'>Check back soon — new deals are added regularly.</p>
                    </div>
                ) : (
                    <div className='offers-grid'>
                        {displayedProducts.map((p) => (
                            <OfferCard key={p._id} product={p} />
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default SpecialOffersPage;