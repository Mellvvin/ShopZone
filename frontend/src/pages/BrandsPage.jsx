// frontend/src/pages/BrandsPage/BrandsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Brands page — real brand names from the database, grouped A-Z.
// Clicking a brand navigates to /?brand=BrandName showing all products
// under that brand. Search filters the grouped list live.
// Cinematic hero + stats strip retained. Category cards removed.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listProductBrands } from '../redux/slices/productSlice';
import axios from 'axios';
import {
    FaBolt, FaCheckCircle, FaChevronRight,
    FaBoxOpen, FaStore, FaEnvelope, FaStar, FaTag,
    FaSearch,
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

// ── SVG Brands illustration (unchanged) ──────────────────────────────────────
const BrandsIllustration = () => (
    <svg
        className='br-illustration'
        viewBox='0 0 360 320'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
    >
        <circle cx='180' cy='160' r='118' fill='rgba(210,180,140,0.05)' stroke='rgba(210,180,140,0.12)' strokeWidth='1.5' />
        <circle cx='180' cy='160' r='80' fill='rgba(210,180,140,0.04)' stroke='rgba(210,180,140,0.09)' strokeWidth='1' />
        <path d='M155 120 L205 120 L225 160 L205 200 L155 200 L135 160 Z' fill='rgba(210,180,140,0.12)' stroke='rgba(210,180,140,0.45)' strokeWidth='2' strokeLinejoin='round' />
        <circle cx='180' cy='136' r='6' fill='none' stroke='rgba(210,180,140,0.5)' strokeWidth='2' />
        <line x1='180' y1='120' x2='180' y2='112' stroke='rgba(210,180,140,0.4)' strokeWidth='1.5' strokeLinecap='round' />
        <line x1='162' y1='155' x2='198' y2='155' stroke='rgba(210,180,140,0.5)' strokeWidth='2' strokeLinecap='round' />
        <line x1='167' y1='165' x2='193' y2='165' stroke='rgba(210,180,140,0.35)' strokeWidth='1.5' strokeLinecap='round' />
        <line x1='172' y1='175' x2='188' y2='175' stroke='rgba(210,180,140,0.25)' strokeWidth='1' strokeLinecap='round' />
        <path d='M72 90 L75 100 L85 100 L77 106 L80 116 L72 110 L64 116 L67 106 L59 100 L69 100 Z' fill='rgba(210,180,140,0.2)' stroke='rgba(210,180,140,0.4)' strokeWidth='1.2' className='br-svg-float-1' />
        <path d='M284 80 L287 88 L295 88 L289 93 L291 101 L284 97 L277 101 L279 93 L273 88 L281 88 Z' fill='rgba(210,180,140,0.15)' stroke='rgba(210,180,140,0.35)' strokeWidth='1' className='br-svg-float-2' />
        <circle cx='72' cy='192' r='18' fill='rgba(39,174,96,0.1)' stroke='rgba(39,174,96,0.3)' strokeWidth='1.5' className='br-svg-float-3' />
        <path d='M64 192 L69 198 L81 184' stroke='rgba(39,174,96,0.7)' strokeWidth='2.5' fill='none' strokeLinecap='round' strokeLinejoin='round' className='br-svg-float-3' />
        <path d='M270 230 L296 210 M285 208 L298 210 L296 223' stroke='rgba(210,180,140,0.5)' strokeWidth='2.5' fill='none' strokeLinecap='round' strokeLinejoin='round' className='br-svg-float-1' />
        <rect x='46' y='128' width='20' height='32' rx='4' fill='rgba(210,180,140,0.1)' stroke='rgba(210,180,140,0.3)' strokeWidth='1.5' className='br-svg-float-2' />
        <line x1='51' y1='152' x2='61' y2='152' stroke='rgba(210,180,140,0.4)' strokeWidth='1.2' strokeLinecap='round' className='br-svg-float-2' />
        <path d='M290 145 L282 135 L278 145 L285 148 L285 165 L305 165 L305 148 L312 145 L308 135 L300 145 Z' fill='rgba(210,180,140,0.1)' stroke='rgba(210,180,140,0.3)' strokeWidth='1.5' strokeLinejoin='round' className='br-svg-float-3' />
        <circle cx='180' cy='160' r='122' stroke='rgba(210,180,140,0.06)' strokeWidth='1' strokeDasharray='8 5' />
        <circle cx='180' cy='35' r='4.5' fill='rgba(210,180,140,0.32)' />
        <circle cx='305' cy='160' r='3.5' fill='rgba(210,180,140,0.25)' />
        <circle cx='180' cy='285' r='4.5' fill='rgba(210,180,140,0.32)' />
        <circle cx='55' cy='160' r='3.5' fill='rgba(210,180,140,0.25)' />
    </svg>
);

// ── Helper: group brands array into { A: [...], B: [...], ... } ───────────────
const groupByLetter = (brands) => {
    const groups = {};
    brands.forEach(b => {
        const letter = b.brand.charAt(0).toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(b);
    });
    return groups;
};

// ── Main component ────────────────────────────────────────────────────────────
const BrandsPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');

    // ── Platform stats ────────────────────────────────────────
    const [platformStats, setPlatformStats] = useState({
        totalProducts:   1000,
        totalCategories: 13,
        countiesServed:  47,
        approvedSellers: 47,
    });

    useEffect(() => {
        axios.get('/api/stats')
            .then(({ data }) => {
                setPlatformStats({
                    totalProducts:   data.totalProducts        || 1000,
                    totalCategories: data.totalCategories      || 13,
                    countiesServed:  data.countiesServed       || 47,
                    approvedSellers: data.totalApprovedSellers || 47,
                });
            })
            .catch(() => {});
    }, []);

    // ── Real brands from database ─────────────────────────────
    // listProductBrands returns [{ brand, count }] sorted A-Z.
    // Products with no brand set (brand: '') are excluded by the backend.
    const { brands, loadingBrands, errorBrands } = useSelector((state) => state.products);

    useEffect(() => {
        if (brands.length === 0) dispatch(listProductBrands());
    }, [dispatch, brands.length]);

    // ── Page title ────────────────────────────────────────────
    useEffect(() => { document.title = 'Brands — ShopZone'; }, []);

    // ── Typewriter ────────────────────────────────────────────
    const fullText = 'Shop by Brand.';
    const [typed, setTyped] = useState('');
    useEffect(() => {
        let i = 0;
        const t = setInterval(() => {
            setTyped(fullText.slice(0, i + 1));
            i++;
            if (i >= fullText.length) clearInterval(t);
        }, 75);
        return () => clearInterval(t);
    }, []);

    // ── Particles ─────────────────────────────────────────────
    const particles = Array.from({ length: 16 }, () => ({
        left:              `${Math.random() * 100}%`,
        top:               `${Math.random() * 100}%`,
        width:             `${3 + Math.random() * 7}px`,
        height:            `${3 + Math.random() * 7}px`,
        animationDelay:    `${Math.random() * 6}s`,
        animationDuration: `${6 + Math.random() * 8}s`,
        opacity:           0.05 + Math.random() * 0.09,
    }));

    // ── Filter brands by search query ─────────────────────────
    const filteredBrands = searchQuery.trim() === ''
        ? brands
        : brands.filter(b =>
            b.brand.toLowerCase().includes(searchQuery.toLowerCase())
          );

    // ── Group filtered brands by first letter ─────────────────
    const grouped = groupByLetter(filteredBrands);
    const letters = Object.keys(grouped).sort();

    // ── All letters present in the full dataset (for A-Z nav) ─
    const activeLetters = new Set(
        brands.map(b => b.brand.charAt(0).toUpperCase())
    );

    // ── Scroll to letter section ──────────────────────────────
    const scrollToLetter = (letter) => {
        const el = document.getElementById(`brand-letter-${letter}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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
                            <FaBolt aria-hidden='true' /> Brand Directory
                        </div>
                        <h1 className='br-hero__title'>
                            Wholesale Kenya.<br />
                            <span className='br-hero__title--accent'>
                                {typed}
                                <span className='br-hero__cursor' aria-hidden='true'>|</span>
                            </span>
                        </h1>
                        <p className='br-hero__subtitle'>
                            Browse verified brands available on ShopZone. Click any brand
                            to see all its products at real wholesale prices.
                        </p>

                        <div className='br-hero__badges'>
                            {[
                                `${brands.length} brands`,
                                `${platformStats.totalProducts.toLocaleString()}+ products`,
                                'Verified suppliers only',
                            ].map(b => (
                                <div key={b} className='br-hero__badge'>
                                    <FaCheckCircle aria-hidden='true' /> {b}
                                </div>
                            ))}
                        </div>

                        {/* Search */}
                        <div className='br-hero__search'>
                            <FaSearch className='br-hero__search-icon' aria-hidden='true' />
                            <input
                                type='text'
                                placeholder='Search brands...'
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                aria-label='Search brands'
                                className='br-hero__search-input br-hero__search-input--with-icon'
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
                    { icon: FaTag,        value: brands.length,                  suffix: '',  label: 'Brands listed' },
                    { icon: FaStar,       value: platformStats.totalProducts,    suffix: '+', label: 'Products listed' },
                    { icon: FaStore,      value: platformStats.approvedSellers,  suffix: '+', label: 'Verified suppliers' },
                    { icon: FaCheckCircle,value: platformStats.countiesServed,   suffix: '',  label: 'Counties served' },
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

            {/* ══ BRAND DIRECTORY ════════════════════════════════════════════ */}
            <section className='br-directory'>
                <div className='br-directory__inner'>

                    {/* ── A-Z letter navigation (hidden when searching) ─────── */}
                    {!searchQuery && (
                        <nav className='br-az-nav' aria-label='Jump to letter'>
                            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                                <button
                                    key={letter}
                                    className={`br-az-btn ${activeLetters.has(letter) ? 'br-az-btn--active' : 'br-az-btn--empty'}`}
                                    onClick={() => activeLetters.has(letter) && scrollToLetter(letter)}
                                    disabled={!activeLetters.has(letter)}
                                    aria-label={`Jump to brands starting with ${letter}`}
                                >
                                    {letter}
                                </button>
                            ))}
                        </nav>
                    )}

                    {/* ── Search result count ───────────────────────────────── */}
                    {searchQuery && (
                        <p className='br-search-results'>
                            {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''} found for
                            <strong> "{searchQuery}"</strong>
                        </p>
                    )}

                    {/* ── Loading skeleton ──────────────────────────────────── */}
                    {loadingBrands && brands.length === 0 && (
                        <div className='br-brand-grid'>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className='br-brand-skeleton' aria-hidden='true' />
                            ))}
                        </div>
                    )}

                    {/* ── Error state ───────────────────────────────────────── */}
                    {errorBrands && (
                        <div className='br-empty'>
                            <FaBoxOpen className='br-empty__icon' aria-hidden='true' />
                            <p>Could not load brands. Please try again.</p>
                            <button className='br-empty__reset' onClick={() => dispatch(listProductBrands())}>
                                Retry
                            </button>
                        </div>
                    )}

                    {/* ── Empty search state ────────────────────────────────── */}
                    {!loadingBrands && !errorBrands && filteredBrands.length === 0 && (
                        <div className='br-empty'>
                            <FaBoxOpen className='br-empty__icon' aria-hidden='true' />
                            <p>No brands match your search.</p>
                            <button className='br-empty__reset' onClick={() => setSearchQuery('')}>
                                Clear search
                            </button>
                        </div>
                    )}

                    {/* ── Letter groups ─────────────────────────────────────── */}
                    {!loadingBrands && !errorBrands && letters.map(letter => (
                        <div
                            key={letter}
                            className='br-letter-group'
                            id={`brand-letter-${letter}`}
                        >
                            {/* Letter heading */}
                            <div className='br-letter-heading' aria-label={`Brands starting with ${letter}`}>
                                <span className='br-letter-heading__letter'>{letter}</span>
                                <span className='br-letter-heading__count'>
                                    {grouped[letter].length} brand{grouped[letter].length !== 1 ? 's' : ''}
                                </span>
                                <div className='br-letter-heading__line' aria-hidden='true' />
                            </div>

                            {/* Brand cards for this letter */}
                            <div className='br-brand-grid'>
                                {grouped[letter].map((b, i) => (
                                    <Reveal key={b.brand} delay={i * 40}>
                                        <button
                                            className='br-brand-card'
                                            onClick={() => navigate(`/?brand=${encodeURIComponent(b.brand)}`)}
                                            aria-label={`Browse ${b.brand} products`}
                                        >
                                            {/* Brand initial circle */}
                                            <div className='br-brand-card__initial' aria-hidden='true'>
                                                {b.brand.charAt(0).toUpperCase()}
                                            </div>
                                            {/* Brand name and count */}
                                            <div className='br-brand-card__info'>
                                                <span className='br-brand-card__name'>{b.brand}</span>
                                                <span className='br-brand-card__count'>
                                                    {b.count} product{b.count !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            {/* Arrow */}
                                            <FaChevronRight className='br-brand-card__arrow' aria-hidden='true' />
                                        </button>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    ))}

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
                                Supply products from any of these brands?
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