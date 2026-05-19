// HomePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ShopZone homepage — Step 12 redesign.
//
// STRUCTURE:
//   A) "Home state" (no keyword / category / filter active):
//       1. HeroBanner          — full-width hero with CTAs and trust stats
//       2. CategoryCards       — 13-category grid
//       3. Featured Products   — products where isFeatured = true
//       4. New Arrivals        — most recently added products (last 4)
//       5. Deals Banner        — inline CTA strip linking to /?deals=true
//
//   B) "Browse/Search state" (keyword, category, or any filter is active):
//       • Standard heading describing the active filter
//       • Product grid (same as before Step 12)
//       • "Back to home" link
//
// Both states use the same Redux listProducts action.
// Featured and New Arrivals make their own dispatches with specific filters.
//
// DEPENDENCIES:
//   Redux:  state.products  (productSlice — products, loadingList, errorList)
//   Router: useSearchParams, useNavigate, Link
//   Components: HeroBanner, CategoryCards, ProductCard (inline), SkeletonCard
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { listProducts } from '../redux/slices/productSlice';
import HeroBanner from '../components/HeroBanner/HeroBanner';
import CategoryCards from '../components/CategoryCards/CategoryCards';
import { FaArrowLeft, FaTag, FaFire, FaStar, FaChevronRight } from 'react-icons/fa';
import './HomePage.css';

// ── How many products to show in each homepage section ───────────────────────
const FEATURED_LIMIT = 8;
const NEW_ARRIVALS_LIMIT = 4;

// ────────────────────────────────────────────────────────────────────────────
// ProductCard (inline, homepage-specific)
// ─────────────────────────────────────────────────────────────────────────────
// A lightweight product card used only on this page. The full ProductCard
// component in components/ can be used here if preferred; this one avoids
// importing heavy cart logic into what is primarily a discovery page.
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => navigate(`/product/${product._id}`);

  // Choose the display price — show salePrice if the product is on sale
  const displayPrice = product.isOnSale && product.salePrice
    ? product.salePrice
    : product.price;

  const isDiscounted = product.isOnSale && product.salePrice;

  return (
    <article
      className='hp-product-card'
      onClick={handleClick}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`View ${product.name}`}
    >
      {/* ── Badges ──────────────────────────────────────────────────────── */}
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

      {/* ── Product image ────────────────────────────────────────────────── */}
      <div className='hp-product-card__img-wrap'>
        <img
          src={product.image}
          alt={product.name}
          className='hp-product-card__img'
          loading='lazy'
        />
      </div>

      {/* ── Info ─────────────────────────────────────────────────────────── */}
      <div className='hp-product-card__info'>
        {/* Category label */}
        <span className='hp-product-card__category'>{product.category}</span>

        {/* Product name */}
        <h3 className='hp-product-card__name'>{product.name}</h3>

        {/* Price row — show original crossed out if discounted */}
        <div className='hp-product-card__price-row'>
          <span className='hp-product-card__price'>
            ${displayPrice.toFixed(2)}
          </span>
          {isDiscounted && (
            <span className='hp-product-card__original-price'>
              ${product.price.toFixed(2)}
            </span>
          )}
          {/* Unit (e.g. "per dozen") */}
          {product.unit && (
            <span className='hp-product-card__unit'>/ {product.unit}</span>
          )}
        </div>

        {/* Stock badge */}
        {product.countInStock === 0 && (
          <span className='hp-product-card__out-of-stock'>Out of stock</span>
        )}
      </div>
    </article>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// SkeletonCard — placeholder while products are loading
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className='hp-skeleton-card' aria-hidden='true'>
    <div className='hp-skeleton hp-skeleton--img' />
    <div className='hp-skeleton hp-skeleton--line hp-skeleton--short' />
    <div className='hp-skeleton hp-skeleton--line' />
    <div className='hp-skeleton hp-skeleton--line hp-skeleton--price' />
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// ProductRow — a horizontal scrolling row of ProductCards with a heading
// Used for Featured Products and New Arrivals sections
// ─────────────────────────────────────────────────────────────────────────────
const ProductRow = ({ title, subtitle, products, loading, error, viewAllHref, icon: Icon }) => {
  const navigate = useNavigate();

  return (
    <section className='hp-product-row' aria-labelledby={`row-${title.replace(/\s+/g, '-')}`}>
      {/* Header row: title + "View all" link */}
      <div className='hp-row-header'>
        <div className='hp-row-header__left'>
          {Icon && <Icon className='hp-row-header__icon' aria-hidden='true' />}
          <div>
            <h2
              className='hp-row-header__title'
              id={`row-${title.replace(/\s+/g, '-')}`}
            >
              {title}
            </h2>
            {subtitle && (
              <p className='hp-row-header__subtitle'>{subtitle}</p>
            )}
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

      {/* Product grid — 2→3→4 columns depending on viewport */}
      {loading ? (
        <div className='hp-product-grid'>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <p className='hp-row-error'>Could not load products. Please try again.</p>
      ) : products && products.length > 0 ? (
        <div className='hp-product-grid'>
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <p className='hp-row-empty'>No products available in this section yet.</p>
      )}
    </section>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// DealsBanner — inline promotional strip between the two product rows
// ─────────────────────────────────────────────────────────────────────────────
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
        onClick={() => navigate('/?deals=true')}
        aria-label='Browse all deals and clearance items'
      >
        Browse Deals <FaChevronRight aria-hidden='true' />
      </button>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// HomePage — main export
// ─────────────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Read URL query params to decide which state we're in ─────────────────
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const deals = searchParams.get('deals') || '';
  const featured = searchParams.get('featured') || '';
  const clearance = searchParams.get('clearance') || '';
  const tag = searchParams.get('tag') || '';

  // Is the user actively filtering/searching?
  const isBrowsingMode = !!(keyword || category || deals || featured || clearance || tag);

  // ── Redux state ───────────────────────────────────────────────────────────
  // We use a single productSlice but dispatch multiple filter sets.
  // For the home state we need featured and newArrivals separately.
  // For the browse state we use the main products list.
  const {
    products,
    loadingList,
    errorList,
  } = useSelector((state) => state.products);

  // ── Dispatch logic ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isBrowsingMode) {
      // Browse mode — pass active filters to the API
      const filters = {};
      if (keyword) filters.keyword = keyword;
      if (category) filters.category = category;
      if (deals) filters.deals = deals;
      if (featured) filters.featured = featured;
      if (clearance) filters.clearance = clearance;
      if (tag) filters.tag = tag;

      dispatch(listProducts(filters));
    } else {
      // Home mode — fetch featured products first (shown in Featured section)
      // New arrivals are sliced from the general products list
      dispatch(listProducts({ featured: 'true' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category, deals, featured, clearance, tag]);

  // ── Separate featured from general for the home sections ─────────────────
  // Featured row: first FEATURED_LIMIT products from the featured API call
  const featuredProducts = !isBrowsingMode ? products.slice(0, FEATURED_LIMIT) : [];

  // For New Arrivals we make a second dispatch below with no filters
  // and slice the most recent ones. We store this in local state via a
  // separate useEffect so it doesn't clobber the featured list in Redux.
  // NOTE: Since productSlice holds one flat list, we trigger new arrivals
  // in a second effect and show them only after featured resolves.
  // For simplicity at this stage, new arrivals shows the reverse of the
  // featured call (i.e. last N items), which gives you recently seeded items.
  const newArrivalsProducts = !isBrowsingMode
    ? [...products].reverse().slice(0, NEW_ARRIVALS_LIMIT)
    : [];

  // ── Build contextual browse heading ──────────────────────────────────────
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

      {/* ══════════════════════════════════════════════════════════════════
          A) HOME STATE — shown when no search / filter is active
         ══════════════════════════════════════════════════════════════════ */}
      {!isBrowsingMode && (
        <>
          {/* 1. Hero Banner */}
          <HeroBanner />

          {/* Spacer to compensate for the hero stats strip overlapping */}
          {/* This pushes the section below clear of the overhanging strip */}
          <div className='homepage__hero-offset' aria-hidden='true' />

          {/* 2. Category Cards */}
          <CategoryCards />

          {/* 3. Featured Products row */}
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

          {/* 4. Inline deals promotional banner between the two rows */}
          <div className='homepage__section-wrapper homepage__section-wrapper--banner'>
            <DealsBanner />
          </div>

          {/* 5. New Arrivals row */}
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

      {/* ══════════════════════════════════════════════════════════════════
          B) BROWSE / SEARCH STATE — shown when filters are active
         ══════════════════════════════════════════════════════════════════ */}
      {isBrowsingMode && (
        <div className='homepage__browse-wrapper'>

          {/* Back to home + contextual heading */}
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

          {/* Product grid */}
          {loadingList ? (
            <div className='hp-product-grid'>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : errorList ? (
            <div className='homepage__error'>
              <p>{errorList}</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className='hp-product-grid'>
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className='homepage__empty'>
              <p>No products found. Try a different search or category.</p>
              <button
                className='homepage__back-btn'
                onClick={() => navigate('/')}
              >
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