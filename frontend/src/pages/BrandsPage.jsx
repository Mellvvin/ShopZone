// frontend/src/pages/BrandsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Brands page — showcases product categories as brand verticals.
// Full cinematic treatment matching BecomeSellerPage.
// Since ShopZone does not yet have a brand model, this page uses
// category-as-brand treatment with a supplier application CTA.
// Features:
//   - Particles, typewriter hero, SVG illustration
//   - Animated category brand cards with hover effects
//   - Supplier CTA strip
//   - Scroll reveals throughout
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaBolt, FaCheckCircle, FaChevronRight,
    FaMobileAlt, FaTshirt, FaScroll, FaHome,
    FaShoppingBasket, FaSpa, FaTools, FaPencilAlt,
    FaSeedling, FaBaby, FaRunning, FaHeartbeat,
    FaBoxOpen, FaStore, FaEnvelope, FaStar,
} from 'react-icons/fa';
import './BrandsPage.css';

// ── Particle ──────────────────────────────────────────────────────────────────
const Particle = ({ style }) => (
    <div className='br-particle' style={style} aria-hidden='true' />
);

// ── Scroll reveal ─────────────────────────────────────────────────────────────
const Reveal = ({ children, className = '', delay = 0 }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.08 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return (
        <div
            ref={ref}
            className={`br-reveal ${visible ? 'br-reveal--visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

// ── Animated counter ──────────────────────────────────────────────────────────
const Counter = ({ target, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = Date.now();
                    const tick = () => {
                        const elapsed = Date.now() - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * target));
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ── SVG Brands illustration ───────────────────────────────────────────────────
const BrandsIllustration = () => (
    <svg
        className='br-illustration'
        viewBox='0 0 360 320'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
    >
        {/* Background circles */}
        <circle cx='180' cy='160' r='118' fill='rgba(210,180,140,0.05)' stroke='rgba(210,180,140,0.12)' strokeWidth='1.5' />
        <circle cx='180' cy='160' r='80' fill='rgba(210,180,140,0.04)' stroke='rgba(210,180,140,0.09)' strokeWidth='1' />

        {/* Central tag / label — brand identity */}
        <path d='M155 120 L205 120 L225 160 L205 200 L155 200 L135 160 Z'
            fill='rgba(210,180,140,0.12)'
            stroke='rgba(210,180,140,0.45)'
            strokeWidth='2'
            strokeLinejoin='round' />
        {/* Tag hole */}
        <circle cx='180' cy='136' r='6'
            fill='none'
            stroke='rgba(210,180,140,0.5)'
            strokeWidth='2' />
        {/* Tag string */}
        <line x1='180' y1='120' x2='180' y2='112'
            stroke='rgba(210,180,140,0.4)'
            strokeWidth='1.5'
            strokeLinecap='round' />
        {/* Tag text lines */}
        <line x1='162' y1='155' x2='198' y2='155'
            stroke='rgba(210,180,140,0.5)'
            strokeWidth='2'
            strokeLinecap='round' />
        <line x1='167' y1='165' x2='193' y2='165'
            stroke='rgba(210,180,140,0.35)'
            strokeWidth='1.5'
            strokeLinecap='round' />
        <line x1='172' y1='175' x2='188' y2='175'
            stroke='rgba(210,180,140,0.25)'
            strokeWidth='1'
            strokeLinecap='round' />

        {/* Stars floating around */}
        <path d='M72 90 L75 100 L85 100 L77 106 L80 116 L72 110 L64 116 L67 106 L59 100 L69 100 Z'
            fill='rgba(210,180,140,0.2)'
            stroke='rgba(210,180,140,0.4)'
            strokeWidth='1.2'
            className='br-svg-float-1' />

        <path d='M284 80 L287 88 L295 88 L289 93 L291 101 L284 97 L277 101 L279 93 L273 88 L281 88 Z'
            fill='rgba(210,180,140,0.15)'
            stroke='rgba(210,180,140,0.35)'
            strokeWidth='1'
            className='br-svg-float-2' />

        {/* Verified badge — top left */}
        <circle cx='72' cy='192' r='18'
            fill='rgba(39,174,96,0.1)'
            stroke='rgba(39,174,96,0.3)'
            strokeWidth='1.5'
            className='br-svg-float-3' />
        <path d='M64 192 L69 198 L81 184'
            stroke='rgba(39,174,96,0.7)'
            strokeWidth='2.5'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='br-svg-float-3' />

        {/* Trending arrow — bottom right */}
        <path d='M270 230 L296 210 M285 208 L298 210 L296 223'
            stroke='rgba(210,180,140,0.5)'
            strokeWidth='2.5'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='br-svg-float-1' />

        {/* Category icons floating */}
        {/* Phone — electronics */}
        <rect x='46' y='128' width='20' height='32' rx='4'
            fill='rgba(210,180,140,0.1)'
            stroke='rgba(210,180,140,0.3)'
            strokeWidth='1.5'
            className='br-svg-float-2' />
        <line x1='51' y1='152' x2='61' y2='152'
            stroke='rgba(210,180,140,0.4)'
            strokeWidth='1.2'
            strokeLinecap='round'
            className='br-svg-float-2' />

        {/* Shirt — fashion */}
        <path d='M290 145 L282 135 L278 145 L285 148 L285 165 L305 165 L305 148 L312 145 L308 135 L300 145 Z'
            fill='rgba(210,180,140,0.1)'
            stroke='rgba(210,180,140,0.3)'
            strokeWidth='1.5'
            strokeLinejoin='round'
            className='br-svg-float-3' />

        {/* Orbit ring */}
        <circle cx='180' cy='160' r='122'
            stroke='rgba(210,180,140,0.06)'
            strokeWidth='1'
            strokeDasharray='8 5' />

        {/* Orbit dots */}
        <circle cx='180' cy='35' r='4.5' fill='rgba(210,180,140,0.32)' />
        <circle cx='305' cy='160' r='3.5' fill='rgba(210,180,140,0.25)' />
        <circle cx='180' cy='285' r='4.5' fill='rgba(210,180,140,0.32)' />
        <circle cx='55' cy='160' r='3.5' fill='rgba(210,180,140,0.25)' />
    </svg>
);

// ── Category brand data ───────────────────────────────────────────────────────
const CATEGORIES = [
    { icon: FaMobileAlt, label: 'Electronics', value: 'Electronics', desc: 'Smartphones, accessories, appliances, and tech gadgets at wholesale rates.', accent: '#002147', count: '120+' },
    { icon: FaTshirt, label: 'Fashion & Apparel', value: 'Fashion & Apparel', desc: 'Clothing bales, garments, footwear, and accessories for retailers.', accent: '#3d5a80', count: '200+' },
    { icon: FaScroll, label: 'Fabric & Textiles', value: 'Fabric & Textiles', desc: 'Rolls, bales, and cut fabric for tailors, manufacturers, and traders.', accent: '#8b5e3c', count: '80+' },
    { icon: FaHome, label: 'Home & Kitchen', value: 'Home & Kitchen', desc: 'Cookware, bedding, furniture, and household essentials in bulk.', accent: '#5c4033', count: '150+' },
    { icon: FaShoppingBasket, label: 'Food & Grocery', value: 'Food & Grocery', desc: 'Dry goods, beverages, packaged foods, and FMCG products wholesale.', accent: '#2d6a4f', count: '300+' },
    { icon: FaSpa, label: 'Beauty & Personal Care', value: 'Beauty & Personal Care', desc: 'Skincare, hair products, cosmetics, and hygiene items in volume.', accent: '#7b2d8b', count: '170+' },
    { icon: FaTools, label: 'Hardware & Tools', value: 'Hardware & Tools', desc: 'Construction materials, power tools, electrical, and plumbing supplies.', accent: '#4a4a4a', count: '90+' },
    { icon: FaPencilAlt, label: 'Office & Stationery', value: 'Office & Stationery', desc: 'Exercise books, paper, pens, printers, and office furniture wholesale.', accent: '#1a5276', count: '110+' },
    { icon: FaSeedling, label: 'Agriculture & Garden', value: 'Agriculture & Garden', desc: 'Seeds, fertilisers, pesticides, farm inputs, and garden supplies.', accent: '#196f3d', count: '95+' },
    { icon: FaBaby, label: 'Baby & Kids', value: 'Baby & Kids', desc: 'Baby clothing, toys, feeding equipment, and nursery essentials.', accent: '#c0392b', count: '80+' },
    { icon: FaRunning, label: 'Sports & Outdoors', value: 'Sports & Outdoors', desc: 'Sports equipment, activewear, camping gear, and outdoor supplies.', accent: '#1a7a4a', count: '65+' },
    { icon: FaHeartbeat, label: 'Health & Wellness', value: 'Health & Wellness', desc: 'Vitamins, supplements, medical supplies, and wellness products.', accent: '#922b21', count: '120+' },
    { icon: FaBoxOpen, label: 'General Merchandise', value: 'General Merchandise', desc: 'Mixed wholesale goods, clearance stock, and assorted bulk items.', accent: '#7d6608', count: '400+' },
];

// ── Main component ────────────────────────────────────────────────────────────
const BrandsPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Typewriter
    const line1 = 'Browse by Category.';
    const [typed, setTyped] = useState('');

    useEffect(() => { document.title = 'Brands & Categories — ShopZone'; }, []);

    useEffect(() => {
        let i = 0;
        const t = setInterval(() => {
            setTyped(line1.slice(0, i + 1));
            i++;
            if (i >= line1.length) clearInterval(t);
        }, 75);
        return () => clearInterval(t);
    }, []);

    // Particles
    const particles = Array.from({ length: 16 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${3 + Math.random() * 7}px`,
        height: `${3 + Math.random() * 7}px`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${6 + Math.random() * 8}s`,
        opacity: 0.05 + Math.random() * 0.09,
    }));

    const filtered = CATEGORIES.filter(cat =>
        searchQuery === '' ||
        cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='br-page'>

            {/* ══ HERO ═══════════════════════════════════════════════════════ */}
            <section className='br-hero'>
                {particles.map((p, i) => <Particle key={i} style={p} />)}
                <div className='br-hero__orb br-hero__orb--1' aria-hidden='true' />
                <div className='br-hero__orb br-hero__orb--2' aria-hidden='true' />

                <div className='br-hero__split'>
                    <div className='br-hero__text'>
                        <div className='br-hero__eyebrow'>
                            <FaBolt aria-hidden='true' /> All Categories
                        </div>
                        <h1 className='br-hero__title'>
                            Wholesale Kenya.<br />
                            <span className='br-hero__title--accent'>
                                {typed}
                                <span className='br-hero__cursor' aria-hidden='true'>|</span>
                            </span>
                        </h1>
                        <p className='br-hero__subtitle'>
                            ShopZone brings together verified suppliers across 13 product categories.
                            Find what your business needs — and order it at real wholesale prices.
                        </p>
                        <div className='br-hero__badges'>
                            {['13 categories', '1,000+ products', 'Verified suppliers only'].map(b => (
                                <div key={b} className='br-hero__badge'>
                                    <FaCheckCircle aria-hidden='true' /> {b}
                                </div>
                            ))}
                        </div>

                        {/* Search */}
                        <div className='br-hero__search'>
                            <input
                                type='text'
                                placeholder='Search categories...'
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                aria-label='Search categories'
                                className='br-hero__search-input'
                            />
                            {searchQuery && (
                                <button
                                    className='br-hero__search-clear'
                                    onClick={() => setSearchQuery('')}
                                    aria-label='Clear search'
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    <div className='br-hero__illustration' aria-hidden='true'>
                        <BrandsIllustration />
                    </div>
                </div>

                <div className='br-hero__scroll' aria-hidden='true'>
                    <div className='br-hero__scroll-line' />
                </div>
            </section>

            {/* ══ STATS STRIP ════════════════════════════════════════════════ */}
            <div className='br-stats-strip'>
                {[
                    { icon: FaBoxOpen, value: 13, suffix: '', label: 'Product categories' },
                    { icon: FaStar, value: 1000, suffix: '+', label: 'Products listed' },
                    { icon: FaStore, value: 47, suffix: '+', label: 'Verified suppliers' },
                    { icon: FaCheckCircle, value: 47, suffix: '', label: 'Counties served' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Reveal key={stat.label} delay={i * 80}>
                            <div className='br-stat'>
                                <div className='br-stat__icon'><Icon aria-hidden='true' /></div>
                                <div className='br-stat__number'><Counter target={stat.value} suffix={stat.suffix} /></div>
                                <div className='br-stat__label'>{stat.label}</div>
                            </div>
                        </Reveal>
                    );
                })}
            </div>

            {/* ══ CATEGORY GRID ══════════════════════════════════════════════ */}
            <section className='br-categories'>
                <div className='br-categories__inner'>
                    {searchQuery && (
                        <p className='br-search-results'>
                            {filtered.length} categor{filtered.length !== 1 ? 'ies' : 'y'} found for
                            <strong> "{searchQuery}"</strong>
                        </p>
                    )}

                    {filtered.length === 0 ? (
                        <div className='br-empty'>
                            <FaBoxOpen className='br-empty__icon' aria-hidden='true' />
                            <p>No categories match your search.</p>
                            <button className='br-empty__reset' onClick={() => setSearchQuery('')}>
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <div className='br-grid'>
                            {filtered.map((cat, i) => {
                                const Icon = cat.icon;
                                return (
                                    <Reveal key={cat.value} delay={i * 50}>
                                        <button
                                            className='br-card'
                                            onClick={() => navigate(`/?category=${encodeURIComponent(cat.value)}`)}
                                            aria-label={`Browse ${cat.label}`}
                                        >
                                            {/* Top accent bar */}
                                            <div
                                                className='br-card__accent'
                                                style={{ background: cat.accent }}
                                            />

                                            {/* Icon */}
                                            <div
                                                className='br-card__icon-wrap'
                                                style={{ background: cat.accent }}
                                            >
                                                <Icon aria-hidden='true' />
                                            </div>

                                            {/* Content */}
                                            <div className='br-card__content'>
                                                <h3 className='br-card__label'>{cat.label}</h3>
                                                <p className='br-card__desc'>{cat.desc}</p>
                                            </div>

                                            {/* Footer */}
                                            <div className='br-card__footer'>
                                                <span className='br-card__count'>
                                                    {cat.count} products
                                                </span>
                                                <span className='br-card__arrow'>
                                                    Browse <FaChevronRight aria-hidden='true' />
                                                </span>
                                            </div>
                                        </button>
                                    </Reveal>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ══ SUPPLIER CTA ═══════════════════════════════════════════════ */}
            <Reveal>
                <div className='br-cta'>
                    <div className='br-cta__shape' aria-hidden='true' />
                    <div className='br-cta__inner'>
                        <FaStore className='br-cta__icon' aria-hidden='true' />
                        <div className='br-cta__text'>
                            <h2 className='br-cta__title'>
                                Supply products in any of these categories?
                            </h2>
                            <p className='br-cta__sub'>
                                ShopZone is always looking for quality verified suppliers.
                                Apply to become a seller — it is free and takes three minutes.
                            </p>
                        </div>
                        <div className='br-cta__actions'>
                            <button
                                className='br-cta__btn br-cta__btn--primary'
                                onClick={() => navigate('/become-seller')}
                            >
                                Apply to Sell <FaChevronRight aria-hidden='true' />
                            </button>
                            <a
                                href='mailto:support@shopzone.com'
                                className='br-cta__btn br-cta__btn--secondary'
                            >
                                <FaEnvelope aria-hidden='true' /> Email Us
                            </a>
                        </div>
                    </div>
                </div>
            </Reveal>

        </div>
    );
};

export default BrandsPage;