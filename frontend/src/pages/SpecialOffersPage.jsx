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
import {
    FaTag,
    FaFire,
    FaBolt,
} from 'react-icons/fa';
import OfferCard from '../components/OfferCard/OfferCard';
import ScrollableTabBar from '../components/ScrollableTabBar/ScrollableTabBar';
import './SpecialOffersPage.css';

// ── Helper: calculate % saved ─────────────────────────────────────────────
const getDiscountPct = (original, sale) => {
    if (!original || !sale || sale >= original) return 0;
    return Math.round(((original - sale) / original) * 100);
};

// ── Helper: format currency ───────────────────────────────────────────────
const fmt = (n) => `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;



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
            <ScrollableTabBar className='offers-tabs' role='tablist'>
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
            </ScrollableTabBar>

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