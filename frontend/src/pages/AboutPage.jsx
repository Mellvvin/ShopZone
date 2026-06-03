// frontend/src/pages/AboutPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// About Us page — narrative editorial, full cinematic treatment.
// Tells the ShopZone story: the problem Kenya's traders face,
// why ShopZone was built, how it works for buyers and sellers,
// the values behind it, and the vision ahead.
//
// Design is intentionally different from other cinematic pages:
//   - Horizontal timeline for the story arc (unique to this page)
//   - Split editorial sections alternating image/text sides
//   - No application form, no FAQ accordion, no conversion CTA
//   - Feels like reading a founder's letter, not a sales page
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaBolt, FaCheckCircle, FaStore, FaUsers,
    FaShieldAlt, FaChartLine, FaHandshake,
    FaMapMarkerAlt, FaArrowRight, FaQuoteLeft,
    FaEye, FaHeart, FaLock, FaStar,
    FaBoxOpen, FaTruck, FaMoneyBillWave,
} from 'react-icons/fa';
import './AboutPage.css';

// ── Scroll reveal ─────────────────────────────────────────────────────────────
const Reveal = ({ children, className = '', delay = 0, direction = 'up' }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.07 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return (
        <div
            ref={ref}
            className={`about-reveal about-reveal--${direction} ${visible ? 'about-reveal--visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

// ── Animated counter ──────────────────────────────────────────────────────────
const Counter = ({ target, suffix = '', duration = 2200 }) => {
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

// ── Particle ──────────────────────────────────────────────────────────────────
const Particle = ({ style }) => (
    <div className='about-particle' style={style} aria-hidden='true' />
);

// ── SVG — Kenya map outline (simplified) ──────────────────────────────────────
const KenyaMapSVG = () => (
    <svg
        className='about-kenya-map'
        viewBox='0 0 280 320'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
    >
        {/* Simplified Kenya silhouette */}
        <path
            d='M140 20 L200 30 L235 60 L245 100 L240 130 L220 155 L230 185
               L215 210 L200 240 L180 260 L165 280 L150 290 L140 285
               L125 270 L110 255 L95 230 L85 200 L75 175 L60 155
               L50 130 L55 100 L70 70 L100 40 Z'
            fill='rgba(210,180,140,0.08)'
            stroke='rgba(210,180,140,0.35)'
            strokeWidth='2'
            strokeLinejoin='round'
        />
        {/* County dots — major cities */}
        <circle cx='140' cy='140' r='6' fill='var(--tan)' opacity='0.9' />
        <circle cx='140' cy='140' r='12' fill='var(--tan)' opacity='0.15' />
        <circle cx='140' cy='140' r='18' fill='var(--tan)' opacity='0.07' />
        {/* Nairobi label */}
        <text x='152' y='144' fontSize='9' fill='rgba(210,180,140,0.8)' fontWeight='700'>Nairobi</text>

        {/* Other city dots */}
        <circle cx='168' cy='248' r='3.5' fill='rgba(210,180,140,0.55)' />
        <text x='174' y='252' fontSize='7.5' fill='rgba(210,180,140,0.55)' fontWeight='600'>Mombasa</text>

        <circle cx='98' cy='162' r='3' fill='rgba(210,180,140,0.45)' />
        <text x='66' y='158' fontSize='7.5' fill='rgba(210,180,140,0.45)' fontWeight='600'>Kisumu</text>

        <circle cx='128' cy='100' r='3' fill='rgba(210,180,140,0.45)' />
        <text x='108' y='95' fontSize='7.5' fill='rgba(210,180,140,0.45)' fontWeight='600'>Nakuru</text>

        <circle cx='175' cy='85' r='3' fill='rgba(210,180,140,0.4)' />
        <text x='180' y='89' fontSize='7.5' fill='rgba(210,180,140,0.4)' fontWeight='600'>Meru</text>

        <circle cx='195' cy='195' r='3' fill='rgba(210,180,140,0.4)' />
        <text x='200' y='199' fontSize='7.5' fill='rgba(210,180,140,0.4)' fontWeight='600'>Voi</text>

        {/* Connecting lines from Nairobi */}
        <line x1='140' y1='140' x2='168' y2='245' stroke='rgba(210,180,140,0.15)' strokeWidth='1' strokeDasharray='4 3' />
        <line x1='140' y1='140' x2='100' y2='162' stroke='rgba(210,180,140,0.15)' strokeWidth='1' strokeDasharray='4 3' />
        <line x1='140' y1='140' x2='128' y2='102' stroke='rgba(210,180,140,0.15)' strokeWidth='1' strokeDasharray='4 3' />
        <line x1='140' y1='140' x2='175' y2='87' stroke='rgba(210,180,140,0.15)' strokeWidth='1' strokeDasharray='4 3' />
        <line x1='140' y1='140' x2='194' y2='193' stroke='rgba(210,180,140,0.15)' strokeWidth='1' strokeDasharray='4 3' />
    </svg>
);

// ── Timeline data ──────────────────────────────────────────────────────────────
const TIMELINE = [
    {
        year: 'The Problem',
        title: 'Traders were stuck',
        body: 'Kenya\'s retailers spent hours in traffic visiting wholesalers. Suppliers spent hours chasing payments. Both sides lost time, money, and trust — every single week.',
        icon: FaMapMarkerAlt,
        accent: '#c0392b',
    },
    {
        year: 'The Insight',
        title: 'Trust was the missing layer',
        body: 'Buyers didn\'t trust unknown suppliers. Suppliers couldn\'t trust buyers to pay. A platform that stood between them — owning the relationship on both sides — could fix both problems at once.',
        icon: FaEye,
        accent: '#B8956A',
    },
    {
        year: 'The Build',
        title: 'ShopZone is created',
        body: 'Built specifically for the Kenyan wholesale market. County-based delivery. M-Pesa payments. Supplier privacy by design. Every feature exists because a real trader needed it.',
        icon: FaStore,
        accent: '#002147',
    },
    {
        year: 'Today',
        title: 'A private supply chain',
        body: 'Thousands of products. Verified suppliers. Buyers across all 47 counties. Every transaction goes through ShopZone — controlled, tracked, and protected on both sides.',
        icon: FaChartLine,
        accent: '#27ae60',
    },
    {
        year: 'The Vision',
        title: 'Kenya\'s wholesale backbone',
        body: 'ShopZone will become the infrastructure layer between producers and retailers across East Africa. Invisible to end consumers. Essential to every business in the supply chain.',
        icon: FaStar,
        accent: '#B8956A',
    },
];

// ── Values data ────────────────────────────────────────────────────────────────
const VALUES = [
    {
        icon: FaShieldAlt,
        title: 'Privacy by design',
        body: 'Supplier identities, contact details, and costs are never exposed to buyers. This is not a feature — it is the foundation of how ShopZone works.',
    },
    {
        icon: FaHandshake,
        title: 'Trust as infrastructure',
        body: 'ShopZone earns trust from both sides simultaneously. Buyers trust that products are real. Suppliers trust that payments are guaranteed. Neither side has to trust the other directly.',
    },
    {
        icon: FaHeart,
        title: 'Built for Kenya',
        body: 'County-based delivery. M-Pesa payments. Swahili support. VAT-inclusive pricing. Every decision reflects the real conditions of doing business in Kenya.',
    },
    {
        icon: FaLock,
        title: 'Control over chaos',
        body: 'Wholesale markets are chaotic. ShopZone brings structure — structured listings, structured payments, structured disputes, structured payouts. Chaos is the competition.',
    },
];

// ── Main component ─────────────────────────────────────────────────────────────
const AboutPage = () => {
    const navigate = useNavigate();

    // Typewriter
    const fullText = 'Built for Kenya.';
    const [typed, setTyped] = useState('');

    useEffect(() => { document.title = 'About Us — ShopZone'; }, []);

    useEffect(() => {
        let i = 0;
        const t = setInterval(() => {
            setTyped(fullText.slice(0, i + 1));
            i++;
            if (i >= fullText.length) clearInterval(t);
        }, 80);
        return () => clearInterval(t);
    }, []);

    // Particles
    const particles = Array.from({ length: 18 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${3 + Math.random() * 7}px`,
        height: `${3 + Math.random() * 7}px`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${6 + Math.random() * 8}s`,
        opacity: 0.05 + Math.random() * 0.09,
    }));

    return (
        <div className='about-page'>

            {/* ══ HERO ═══════════════════════════════════════════════════════ */}
            <section className='about-hero' aria-label='About ShopZone'>
                {particles.map((p, i) => <Particle key={i} style={p} />)}
                <div className='about-hero__orb about-hero__orb--1' aria-hidden='true' />
                <div className='about-hero__orb about-hero__orb--2' aria-hidden='true' />
                <div className='about-hero__orb about-hero__orb--3' aria-hidden='true' />

                <div className='about-hero__inner'>
                    <div className='about-hero__text'>
                        <div className='about-hero__eyebrow'>
                            <FaBolt aria-hidden='true' /> Our Story
                        </div>
                        <h1 className='about-hero__title'>
                            Wholesale Kenya.<br />
                            <span className='about-hero__accent'>
                                {typed}
                                <span className='about-hero__cursor' aria-hidden='true'>|</span>
                            </span>
                        </h1>
                        <p className='about-hero__subtitle'>
                            ShopZone is a B2B wholesale marketplace connecting Kenya's retailers
                            and small businesses to verified suppliers — privately, securely,
                            and at real wholesale prices.
                        </p>
                        <div className='about-hero__trust'>
                            {[
                                'All 47 counties',
                                'Verified suppliers',
                                'Secure payments',
                                'Full privacy',
                            ].map(t => (
                                <div key={t} className='about-hero__trust-item'>
                                    <FaCheckCircle aria-hidden='true' />
                                    {t}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Kenya map illustration */}
                    <div className='about-hero__map' aria-hidden='true'>
                        <KenyaMapSVG />
                    </div>
                </div>

                <div className='about-hero__scroll' aria-hidden='true'>
                    <div className='about-hero__scroll-line' />
                </div>
            </section>

            {/* ══ STATS STRIP ════════════════════════════════════════════════ */}
            <div className='about-stats-strip'>
                {[
                    { icon: FaBoxOpen,        value: 1000,  suffix: '+', label: 'Products listed' },
                    { icon: FaMapMarkerAlt,   value: 47,    suffix: '',  label: 'Counties reached' },
                    { icon: FaUsers,          value: 5000,  suffix: '+', label: 'Registered buyers' },
                    { icon: FaMoneyBillWave,  value: 100,   suffix: '%', label: 'Payments secured' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Reveal key={stat.label} delay={i * 80}>
                            <div className='about-stat'>
                                <div className='about-stat__icon'><Icon aria-hidden='true' /></div>
                                <div className='about-stat__number'>
                                    <Counter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className='about-stat__label'>{stat.label}</div>
                            </div>
                        </Reveal>
                    );
                })}
            </div>

            {/* ══ FOUNDER QUOTE ══════════════════════════════════════════════ */}
            <section className='about-quote-section' aria-label='Founder message'>
                <div className='about-quote-inner'>
                    <Reveal>
                        <div className='about-quote-card'>
                            <FaQuoteLeft className='about-quote-icon' aria-hidden='true' />
                            <blockquote className='about-quote-text'>
                                Kenya's traders are among the most resilient in the world.
                                They source from everywhere, sell to everyone, and make it work
                                against impossible odds. ShopZone exists to give them one thing
                                they have always deserved but rarely had — a system that works
                                for them as hard as they work for themselves.
                            </blockquote>
                            <div className='about-quote-attribution'>
                                <div className='about-quote-avatar' aria-hidden='true'>SZ</div>
                                <div>
                                    <strong className='about-quote-name'>ShopZone Team</strong>
                                    <span className='about-quote-role'>Nairobi, Kenya</span>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ══ HORIZONTAL TIMELINE ════════════════════════════════════════ */}
            <section className='about-timeline-section' aria-label='ShopZone story timeline'>
                <div className='about-timeline-inner'>
                    <Reveal>
                        <div className='about-section-header'>
                            <span className='about-eyebrow'>The Story</span>
                            <h2 className='about-section-title'>How ShopZone came to be</h2>
                            <p className='about-section-sub'>
                                From a real problem in Nairobi's markets to a platform
                                serving buyers and suppliers across Kenya.
                            </p>
                        </div>
                    </Reveal>

                    {/* Horizontal scroll timeline */}
                    <div className='about-timeline' role='list'>
                        {/* Connecting line behind all nodes */}
                        <div className='about-timeline__track' aria-hidden='true' />

                        {TIMELINE.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <Reveal key={item.year} delay={i * 120} className='about-timeline__item' direction='up'>
                                    <div className='about-timeline__node' style={{ borderColor: item.accent }} aria-hidden='true'>
                                        <Icon style={{ color: item.accent }} />
                                    </div>
                                    <div className='about-timeline__year' style={{ color: item.accent }}>
                                        {item.year}
                                    </div>
                                    <h3 className='about-timeline__title'>{item.title}</h3>
                                    <p className='about-timeline__body'>{item.body}</p>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══ HOW IT WORKS — SPLIT SECTIONS ══════════════════════════════ */}
            <section className='about-how-section' aria-label='How ShopZone works'>
                <div className='about-how-inner'>
                    <Reveal>
                        <div className='about-section-header'>
                            <span className='about-eyebrow'>How It Works</span>
                            <h2 className='about-section-title'>Two sides. One platform.</h2>
                            <p className='about-section-sub'>
                                ShopZone operates as the trusted intermediary between
                                buyers and suppliers — never exposing either side to the other.
                            </p>
                        </div>
                    </Reveal>

                    {/* Buyers side */}
                    <div className='about-split about-split--buyers'>
                        <Reveal className='about-split__visual' direction='left'>
                            <div className='about-split__card about-split__card--buyers'>
                                <div className='about-split__card-eyebrow'>For Buyers</div>
                                <div className='about-split__steps'>
                                    {[
                                        { icon: FaStore,           text: 'Browse thousands of wholesale products' },
                                        { icon: FaBoxOpen,         text: 'Order by carton, bale, sack, or kg' },
                                        { icon: FaMoneyBillWave,   text: 'Pay securely via M-Pesa or bank transfer' },
                                        { icon: FaTruck,           text: 'Receive delivery across all 47 counties' },
                                    ].map(({ icon: Icon, text }) => (
                                        <div key={text} className='about-split__step'>
                                            <div className='about-split__step-icon'>
                                                <Icon aria-hidden='true' />
                                            </div>
                                            <span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className='about-split__cta'
                                    onClick={() => navigate('/')}
                                >
                                    Start Shopping <FaArrowRight aria-hidden='true' />
                                </button>
                            </div>
                        </Reveal>
                        <Reveal className='about-split__text' delay={100} direction='right'>
                            <h3 className='about-split__title'>
                                Your supply chain, simplified
                            </h3>
                            <p className='about-split__body'>
                                Retailers and small businesses across Kenya use ShopZone to
                                source products they used to spend days tracking down. No
                                more driving to Industrial Area. No more negotiating with
                                strangers. No more getting burned on quality or payment.
                            </p>
                            <p className='about-split__body'>
                                ShopZone verifies every supplier, controls every transaction,
                                and handles every dispute. You order, you pay, you receive.
                                That is the entire experience — by design.
                            </p>
                            <div className='about-split__tags'>
                                {['Retailers', 'Shop owners', 'Hotels & hospitality', 'Institutions', 'Group buyers'].map(t => (
                                    <span key={t} className='about-split__tag'>{t}</span>
                                ))}
                            </div>
                        </Reveal>
                    </div>

                    {/* Suppliers side */}
                    <div className='about-split about-split--suppliers'>
                        <Reveal className='about-split__text' direction='left'>
                            <h3 className='about-split__title'>
                                Supply without exposure
                            </h3>
                            <p className='about-split__body'>
                                Approved suppliers on ShopZone never deal with buyers directly.
                                Your identity, contact details, location, and cost prices are
                                never visible to anyone outside ShopZone's admin team.
                            </p>
                            <p className='about-split__body'>
                                You focus on what you do best — sourcing and fulfilling.
                                ShopZone handles everything else: customer queries, payment
                                collection, dispute resolution, delivery coordination,
                                and structured payouts on your timeline.
                            </p>
                            <div className='about-split__tags'>
                                {['Wholesalers', 'Distributors', 'Manufacturers', 'Importers', 'Farm suppliers'].map(t => (
                                    <span key={t} className='about-split__tag'>{t}</span>
                                ))}
                            </div>
                        </Reveal>
                        <Reveal className='about-split__visual' delay={100} direction='right'>
                            <div className='about-split__card about-split__card--suppliers'>
                                <div className='about-split__card-eyebrow'>For Suppliers</div>
                                <div className='about-split__steps'>
                                    {[
                                        { icon: FaLock,          text: 'Your identity stays completely private' },
                                        { icon: FaMoneyBillWave, text: 'Payments collected before goods move' },
                                        { icon: FaChartLine,     text: 'Set your own prices from your dashboard' },
                                        { icon: FaShieldAlt,     text: 'ShopZone mediates every dispute' },
                                    ].map(({ icon: Icon, text }) => (
                                        <div key={text} className='about-split__step'>
                                            <div className='about-split__step-icon'>
                                                <Icon aria-hidden='true' />
                                            </div>
                                            <span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className='about-split__cta about-split__cta--secondary'
                                    onClick={() => navigate('/become-seller')}
                                >
                                    Apply to Sell <FaArrowRight aria-hidden='true' />
                                </button>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ══ VALUES ═════════════════════════════════════════════════════ */}
            <section className='about-values-section' aria-label='ShopZone values'>
                <div className='about-values-inner'>
                    <Reveal>
                        <div className='about-section-header about-section-header--light'>
                            <span className='about-eyebrow about-eyebrow--light'>What We Stand For</span>
                            <h2 className='about-section-title about-section-title--light'>
                                Four things we never compromise on
                            </h2>
                        </div>
                    </Reveal>
                    <div className='about-values-grid'>
                        {VALUES.map((v, i) => {
                            const Icon = v.icon;
                            return (
                                <Reveal key={v.title} delay={i * 90}>
                                    <div className='about-value-card'>
                                        <div className='about-value-card__icon'>
                                            <Icon aria-hidden='true' />
                                        </div>
                                        <h3 className='about-value-card__title'>{v.title}</h3>
                                        <p className='about-value-card__body'>{v.body}</p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══ VISION ═════════════════════════════════════════════════════ */}
            <section className='about-vision-section' aria-label='ShopZone vision'>
                <div className='about-vision-inner'>
                    <Reveal>
                        <div className='about-vision-card'>
                            <div className='about-vision__orb' aria-hidden='true' />
                            <span className='about-eyebrow about-eyebrow--light'>Looking Ahead</span>
                            <h2 className='about-vision__title'>
                                The infrastructure layer for East African trade
                            </h2>
                            <p className='about-vision__body'>
                                ShopZone's goal is not to be the most visible brand in Kenya's
                                wholesale market. The goal is to be the most essential one —
                                the platform that every trader, retailer, and supplier depends
                                on without thinking about it, the way they depend on electricity
                                or mobile money.
                            </p>
                            <p className='about-vision__body'>
                                That means expanding beyond Nairobi into every county.
                                Building automated RFQ matching between buyers and suppliers.
                                Supporting tiered wholesale pricing, instalment payments,
                                and eventually cross-border trade across East Africa.
                            </p>
                            <div className='about-vision__actions'>
                                <button
                                    className='about-vision__btn about-vision__btn--primary'
                                    onClick={() => navigate('/')}
                                >
                                    Start Shopping <FaArrowRight aria-hidden='true' />
                                </button>
                                <button
                                    className='about-vision__btn about-vision__btn--secondary'
                                    onClick={() => navigate('/become-seller')}
                                >
                                    Become a Seller <FaArrowRight aria-hidden='true' />
                                </button>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

        </div>
    );
};

export default AboutPage;