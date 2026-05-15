// src/components/ShopZoneLogo.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable ShopZone brand logo component.
// Renders an SVG "stacked boxes" icon alongside the "ShopZone" wordmark.
//
// Props:
//   dark  {boolean} — When true, uses Tan (#D2B48C) palette for dark backgrounds
//                     (e.g. Oxford Blue navbar, footer).
//                     When false (default), uses Oxford Blue (#002147) for light backgrounds.
//   size  {string}  — "small" | "medium" (default) | "large"
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Link } from 'react-router-dom';

const ShopZoneLogo = ({ dark = false, size = 'medium' }) => {

    // ── Colour tokens ──────────────────────────────────────────────────────────
    // On dark backgrounds (dark=true) we use Tan tones so the logo reads clearly
    // against Oxford Blue. On light backgrounds we use Oxford Blue.
    const primary = dark ? '#D2B48C' : '#002147'; // main opaque colour
    const secondary = dark ? '#C4A47C' : '#003066'; // "Zone" wordmark accent
    const boxFull = dark ? '#D2B48C' : '#002147'; // top box    — fully opaque
    const boxMid = dark ? 'rgba(210,180,140,0.60)' : 'rgba(0,33,71,0.55)'; // middle box
    const boxLight = dark ? 'rgba(210,180,140,0.30)' : 'rgba(0,33,71,0.25)'; // bottom box

    // ── Size tokens ────────────────────────────────────────────────────────────
    const sizes = {
        small: { icon: 28, font: '1.05rem', gap: '7px' },
        medium: { icon: 36, font: '1.35rem', gap: '9px' },
        large: { icon: 48, font: '1.75rem', gap: '12px' },
    };
    const { icon, font, gap } = sizes[size] || sizes.medium;

    // Box dimensions are derived from the icon size so everything scales together
    const w = icon * 0.72;   // box width
    const h = icon * 0.22;   // box height
    const rx = 3;             // border radius

    // Vertical positions for the three stacked boxes (bottom → middle → top)
    const y3 = icon - h - 1;           // bottom box  (most transparent)
    const y2 = y3 - h * 0.85;          // middle box
    const y1 = y2 - h * 0.85;          // top box     (fully opaque)

    // Horizontal centre of the SVG canvas
    const cx = icon / 2;
    const x = cx - w / 2;

    return (
        // ── Wrapper ──────────────────────────────────────────────────────────────
        // Uses a Link so the whole logo navigates home.
        // The CSS class drives the hover animation (defined in index.css or inline below).
        <Link
            to="/"
            className="shopzone-logo-link"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap,
                textDecoration: 'none',
            }}
            aria-label="ShopZone — go to homepage"
        >

            {/* ── SVG Icon: three stacked boxes ─────────────────────────────────── */}
            {/* viewBox is square so the icon scales cleanly at any size             */}
            <svg
                width={icon}
                height={icon}
                viewBox={`0 0 ${icon} ${icon}`}
                xmlns="http://www.w3.org/2000/svg"
                className="shopzone-logo-icon"
                aria-hidden="true"
                style={{
                    flexShrink: 0,
                    // Smooth scale on hover — the parent link has the :hover trigger
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                {/* Bottom box — most transparent, widest visual weight at base */}
                <rect x={x} y={y3} width={w} height={h} rx={rx} fill={boxLight} />

                {/* Middle box — semi-transparent */}
                <rect x={x} y={y2} width={w} height={h} rx={rx} fill={boxMid} />

                {/* Top box — fully opaque, strongest visual weight */}
                <rect x={x} y={y1} width={w} height={h} rx={rx} fill={boxFull} />
            </svg>

            {/* ── Wordmark ──────────────────────────────────────────────────────── */}
            {/* "Shop" and "Zone" use slightly different colours for visual interest */}
            <span
                style={{
                    fontSize: font,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                    userSelect: 'none',
                }}
            >
                {/* "Shop" — primary colour */}
                <span style={{ color: primary }}>Shop</span>
                {/* "Zone" — slightly lighter/warmer accent to differentiate */}
                <span style={{ color: secondary }}>Zone</span>
            </span>

        </Link>
    );
};

export default ShopZoneLogo;