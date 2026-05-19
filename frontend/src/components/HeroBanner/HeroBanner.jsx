// HeroBanner.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Full-width hero banner shown at the top of the homepage when no search /
// filter is active.  It contains:
//   • An animated headline + subtitle
//   • Two CTA buttons (Shop Now → scrolls to featured, Browse Deals → /deals)
//   • A floating "badge" strip showing three quick-trust stats
//   • A decorative geometric background built from CSS shapes (no images needed)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaShieldAlt, FaTruck } from 'react-icons/fa';
import './HeroBanner.css';

const HeroBanner = () => {
  const navigate = useNavigate();

  // ── Scroll to the Featured Products section on this same page ──────────────
  const handleShopNow = () => {
    const el = document.getElementById('featured-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ── Navigate to the deals/sale filtered view ───────────────────────────────
  const handleBrowseDeals = () => {
    navigate('/?deals=true');
  };

  return (
    <section className='hero-banner' aria-label='Welcome to ShopZone'>

      {/* ── Decorative background shapes ─────────────────────────────────── */}
      {/* These are purely visual CSS-driven circles/ovals for depth */}
      <div className='hero-bg-shape hero-bg-shape--1' aria-hidden='true' />
      <div className='hero-bg-shape hero-bg-shape--2' aria-hidden='true' />
      <div className='hero-bg-shape hero-bg-shape--3' aria-hidden='true' />

      {/* ── Main hero content ─────────────────────────────────────────────── */}
      <div className='hero-content'>

        {/* Eyebrow label — small pill above the headline */}
        <span className='hero-eyebrow'>Kenya&apos;s B2B Wholesale Platform</span>

        {/* Primary headline — split across two lines for visual weight */}
        <h1 className='hero-headline'>
          Stock Smarter.<br />
          <span className='hero-headline--accent'>Grow Faster.</span>
        </h1>

        {/* Supporting subtitle */}
        <p className='hero-subtitle'>
          Connect your retail or small business to structured supply chains.
          Thousands of products across 13 categories — delivered to your door.
        </p>

        {/* CTA button row */}
        <div className='hero-cta-row'>
          <button
            className='hero-btn hero-btn--primary'
            onClick={handleShopNow}
            aria-label='Scroll to featured products'
          >
            Shop Now
          </button>
          <button
            className='hero-btn hero-btn--secondary'
            onClick={handleBrowseDeals}
            aria-label='Browse deals and sale items'
          >
            Browse Deals
          </button>
        </div>
      </div>

      {/* ── Trust stats strip ─────────────────────────────────────────────── */}
      {/* Three quick-trust signals shown at the bottom of the hero */}
      <div className='hero-stats' aria-label='Why ShopZone'>

        <div className='hero-stat'>
          <FaBoxOpen className='hero-stat__icon' aria-hidden='true' />
          <div className='hero-stat__text'>
            <strong>1,000+</strong>
            <span>Wholesale Products</span>
          </div>
        </div>

        <div className='hero-stat-divider' aria-hidden='true' />

        <div className='hero-stat'>
          <FaShieldAlt className='hero-stat__icon' aria-hidden='true' />
          <div className='hero-stat__text'>
            <strong>Verified Sellers</strong>
            <span>All transactions via ShopZone</span>
          </div>
        </div>

        <div className='hero-stat-divider' aria-hidden='true' />

        <div className='hero-stat'>
          <FaTruck className='hero-stat__icon' aria-hidden='true' />
          <div className='hero-stat__text'>
            <strong>Nairobi Delivery</strong>
            <span>Flat rate KSh shipping</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroBanner;
