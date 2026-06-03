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
import HeroBanner from '../components/HeroBanner/HeroBanner';
import ProductCard from '../components/ProductCard/ProductCard';
import SkeletonCard from '../components/ProductCard/SkeletonCard';
import CategoryCards from '../components/CategoryCards/CategoryCards';
import {
  FaArrowLeft,
  FaFire,
  FaStar,
  FaChevronRight,
} from 'react-icons/fa';
import './HomePage.css';

const FEATURED_LIMIT = 8;
const NEW_ARRIVALS_LIMIT = 4;


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