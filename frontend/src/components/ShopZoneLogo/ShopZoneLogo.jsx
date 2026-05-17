// frontend/src/components/ShopZoneLogo/ShopZoneLogo.jsx
// ─────────────────────────────────────────────────────────────
// Reusable SVG brand logo.
// Clicking navigates to the homepage and clears all filters
// by navigating to '/' with no query params, which causes
// HomePage to fetch all products.
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ShopZoneLogo.css';

const ShopZoneLogo = ({ dark = false, size = 'medium' }) => {
    const navigate = useNavigate();

    // ── Colour tokens ──────────────────────────────────────────
    const primary = dark ? '#D2B48C' : '#002147';
    const secondary = dark ? '#C4A47C' : '#003066';
    const boxFull = dark ? '#D2B48C' : '#002147';
    const boxMid = dark ? 'rgba(210,180,140,0.60)' : 'rgba(0,33,71,0.55)';
    const boxLight = dark ? 'rgba(210,180,140,0.30)' : 'rgba(0,33,71,0.25)';

    // ── Size tokens ────────────────────────────────────────────
    const sizes = {
        small: { icon: 32, font: '1.15rem', gap: '8px' },
        medium: { icon: 42, font: '1.55rem', gap: '10px' },
        large: { icon: 54, font: '1.9rem', gap: '13px' },
    };
    const { icon, font, gap } = sizes[size] || sizes.medium;

    // ── Box geometry ───────────────────────────────────────────
    const w = icon * 0.80;
    const h = icon * 0.20;
    const rx = 3;
    const y3 = icon - h - 2;
    const y2 = y3 - h * 0.90;
    const y1 = y2 - h * 0.90;
    const cx = icon / 2;
    const x = cx - w / 2;

    // ── Click handler ──────────────────────────────────────────
    // Navigates to '/' with no query params so HomePage fetches
    // all products and clears any active search or filter.
    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <button
            className='shopzone-logo-link'
            style={{ gap }}
            onClick={handleLogoClick}
            aria-label='ShopZone — go to homepage'
        >
            {/* ── SVG icon: three stacked boxes ─────────────────── */}
            <svg
                width={icon}
                height={icon}
                viewBox={`0 0 ${icon} ${icon}`}
                xmlns='http://www.w3.org/2000/svg'
                className='shopzone-logo-icon'
                aria-hidden='true'
            >
                {/* Bottom box — most transparent */}
                <rect x={x} y={y3} width={w} height={h} rx={rx} fill={boxLight} />
                {/* Middle box */}
                <rect x={x} y={y2} width={w} height={h} rx={rx} fill={boxMid} />
                {/* Top box — fully opaque */}
                <rect x={x} y={y1} width={w} height={h} rx={rx} fill={boxFull} />
            </svg>

            {/* ── Wordmark ───────────────────────────────────────── */}
            <span
                className='shopzone-logo-wordmark'
                style={{ fontSize: font }}
            >
                <span style={{ color: primary }}>Shop</span>
                <span style={{ color: secondary }}>Zone</span>
            </span>
        </button>
    );
};

export default ShopZoneLogo;