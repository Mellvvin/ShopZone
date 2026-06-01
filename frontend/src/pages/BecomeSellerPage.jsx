// frontend/src/pages/BecomeSellerPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Become a Seller page — the most important conversion page on ShopZone.
// This page exists to convince suppliers and wholesalers to apply.
//
// Sections:
//   1. Hero — cinematic, animated, direct headline
//   2. Pain points — we understand your struggle
//   3. Stats strip — credibility numbers that count up
//   4. How it works — animated 5-step timeline
//   5. Benefits grid — what sellers actually get
//   6. Protection promises — money, privacy, support
//   7. Who is this for — seller types
//   8. Application CTA — the conversion moment
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaStore, FaShieldAlt, FaChartLine, FaTruck,
    FaUsers, FaLock, FaBolt, FaCheckCircle,
    FaArrowRight, FaEnvelope, FaWhatsapp,
    FaBoxOpen, FaHandshake, FaMoneyBillWave,
    FaMobileAlt, FaTshirt, FaShoppingBasket,
    FaSpa, FaTools, FaSeedling, FaMapMarkerAlt,
    FaStar, FaRocket, FaClock, FaEye, FaEyeSlash,
} from 'react-icons/fa';
import './BecomeSellerPage.css';

// ── Scroll reveal wrapper ─────────────────────────────────────────────────────
const Reveal = ({ children, className = '', delay = 0, direction = 'up' }) => {
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
            className={`bs-reveal bs-reveal--${direction} ${visible ? 'bs-reveal--visible' : ''} ${className}`}
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
                        // Ease out cubic
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

// ── Floating particle dot ─────────────────────────────────────────────────────
const Particle = ({ style }) => (
    <div className='bs-particle' style={style} aria-hidden='true' />
);

// ── SVG Seller illustration ───────────────────────────────────────────────────
const SellerIllustration = () => (
    <svg
        className='bs-illustration'
        viewBox='0 0 360 320'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
    >
        {/* Background circles */}
        <circle cx='180' cy='160' r='120' fill='rgba(210,180,140,0.06)' stroke='rgba(210,180,140,0.14)' strokeWidth='1.5' />
        <circle cx='180' cy='160' r='82' fill='rgba(210,180,140,0.05)' stroke='rgba(210,180,140,0.1)' strokeWidth='1' />

        {/* Shop storefront */}
        {/* Roof */}
        <path d='M100 148 L180 108 L260 148 Z' fill='rgba(210,180,140,0.25)' stroke='rgba(210,180,140,0.5)' strokeWidth='2' strokeLinejoin='round' />
        {/* Roof ridge line */}
        <line x1='100' y1='148' x2='260' y2='148' stroke='rgba(210,180,140,0.4)' strokeWidth='1.5' />
        {/* Building body */}
        <rect x='112' y='148' width='136' height='90' rx='3' fill='rgba(210,180,140,0.1)' stroke='rgba(210,180,140,0.35)' strokeWidth='1.5' />
        {/* Door */}
        <rect x='162' y='188' width='36' height='50' rx='3' fill='rgba(210,180,140,0.2)' stroke='rgba(210,180,140,0.45)' strokeWidth='1.5' />
        {/* Door knob */}
        <circle cx='192' cy='214' r='3' fill='rgba(210,180,140,0.7)' />
        {/* Left window */}
        <rect x='124' y='160' width='28' height='22' rx='3' fill='rgba(210,180,140,0.15)' stroke='rgba(210,180,140,0.4)' strokeWidth='1.5' />
        <line x1='138' y1='160' x2='138' y2='182' stroke='rgba(210,180,140,0.3)' strokeWidth='1' />
        <line x1='124' y1='171' x2='152' y2='171' stroke='rgba(210,180,140,0.3)' strokeWidth='1' />
        {/* Right window */}
        <rect x='208' y='160' width='28' height='22' rx='3' fill='rgba(210,180,140,0.15)' stroke='rgba(210,180,140,0.4)' strokeWidth='1.5' />
        <line x1='222' y1='160' x2='222' y2='182' stroke='rgba(210,180,140,0.3)' strokeWidth='1' />
        <line x1='208' y1='171' x2='236' y2='171' stroke='rgba(210,180,140,0.3)' strokeWidth='1' />
        {/* Shop sign above door */}
        <rect x='150' y='152' width='60' height='18' rx='4' fill='rgba(210,180,140,0.2)' stroke='rgba(210,180,140,0.4)' strokeWidth='1.5' />
        <line x1='158' y1='159' x2='202' y2='159' stroke='rgba(210,180,140,0.5)' strokeWidth='1.5' strokeLinecap='round' />
        <line x1='162' y1='165' x2='198' y2='165' stroke='rgba(210,180,140,0.35)' strokeWidth='1' strokeLinecap='round' />

        {/* Floating coins / money — top left */}
        <circle cx='72' cy='100' r='14' fill='rgba(210,180,140,0.15)' stroke='rgba(210,180,140,0.4)' strokeWidth='1.5' className='bs-svg-float-1' />
        <text x='67' y='105' fontSize='11' fill='rgba(210,180,140,0.7)' fontWeight='800' className='bs-svg-float-1'>KES</text>

        {/* Floating coins — top right */}
        <circle cx='290' cy='88' r='11' fill='rgba(210,180,140,0.12)' stroke='rgba(210,180,140,0.35)' strokeWidth='1.5' className='bs-svg-float-2' />
        <text x='284' y='93' fontSize='10' fill='rgba(210,180,140,0.6)' fontWeight='800' className='bs-svg-float-2'>$</text>

        {/* Upward arrow — growth */}
        <path d='M310 200 L310 160 L298 172' stroke='rgba(210,180,140,0.45)' strokeWidth='2.5' fill='none' strokeLinecap='round' strokeLinejoin='round' className='bs-svg-float-3' />
        <path d='M310 160 L322 172' stroke='rgba(210,180,140,0.45)' strokeWidth='2.5' fill='none' strokeLinecap='round' className='bs-svg-float-3' />

        {/* Shield — protection */}
        <path d='M52 175 Q52 155 68 148 Q84 155 84 175 Q84 192 68 198 Q52 192 52 175 Z' fill='rgba(210,180,140,0.1)' stroke='rgba(210,180,140,0.35)' strokeWidth='1.5' className='bs-svg-float-2' />
        <path d='M62 175 L66 180 L76 168' stroke='rgba(210,180,140,0.6)' strokeWidth='2' fill='none' strokeLinecap='round' strokeLinejoin='round' className='bs-svg-float-2' />

        {/* Star — quality */}
        <path d='M288 228 L291 237 L300 237 L293 243 L296 252 L288 246 L280 252 L283 243 L276 237 L285 237 Z' fill='rgba(210,180,140,0.2)' stroke='rgba(210,180,140,0.45)' strokeWidth='1.2' className='bs-svg-float-1' />

        {/* Orbit ring */}
        <circle cx='180' cy='160' r='124' stroke='rgba(210,180,140,0.07)' strokeWidth='1' strokeDasharray='8 5' />

        {/* Orbit dots */}
        <circle cx='180' cy='33' r='4.5' fill='rgba(210,180,140,0.35)' />
        <circle cx='307' cy='160' r='3.5' fill='rgba(210,180,140,0.28)' />
        <circle cx='180' cy='287' r='4.5' fill='rgba(210,180,140,0.35)' />
        <circle cx='53' cy='160' r='3.5' fill='rgba(210,180,140,0.28)' />
    </svg>
);

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
    { value: 1000, suffix: '+', label: 'Products listed', icon: FaBoxOpen },
    { value: 47, suffix: '', label: 'Counties reached', icon: FaMapMarkerAlt },
    { value: 100, suffix: '%', label: 'Payments secured', icon: FaShieldAlt },
    { value: 0, suffix: ' KES', label: 'Cold calling needed', icon: FaUsers },
];

const STEPS = [
    {
        number: '01',
        title: 'Apply in minutes',
        description: 'Fill in a simple application with your business name, what you supply, your location, and your stock capacity. No fees. No paperwork mountains.',
        icon: FaEnvelope,
    },
    {
        number: '02',
        title: 'We review within 48 hours',
        description: 'Our team reviews every application personally. We verify your products and business. You will hear from us within two business days — guaranteed.',
        icon: FaEye,
    },
    {
        number: '03',
        title: 'Get your seller dashboard',
        description: 'Once approved, you receive full access to your private seller dashboard. List products, set prices, update stock, and track your orders — all in one place.',
        icon: FaStore,
    },
    {
        number: '04',
        title: 'ShopZone handles the customers',
        description: 'You focus on fulfillment. We handle every customer query, negotiation, complaint, and payment. You never deal with buyers directly — that is our job.',
        icon: FaShieldAlt,
    },
    {
        number: '05',
        title: 'Get paid. Grow. Repeat.',
        description: 'Receive structured payouts after order completion. Track your earnings, monitor your performance, and scale your supply operation with confidence.',
        icon: FaMoneyBillWave,
    },
];

const BENEFITS = [
    {
        icon: FaEyeSlash,
        title: 'Complete Privacy',
        description: 'Your business identity, contact details, location, and pricing are never exposed to buyers. ShopZone is the face. You are the power behind it.',
        accent: '#002147',
    },
    {
        icon: FaMoneyBillWave,
        title: 'Guaranteed Payments',
        description: 'Every order is paid to ShopZone before fulfillment begins. You never chase a buyer for money. You never get ghosted after delivery.',
        accent: '#27ae60',
    },
    {
        icon: FaChartLine,
        title: 'Set Your Own Prices',
        description: 'You control your pricing on your products. Change prices instantly from your dashboard. Price changes apply to future orders — existing orders are never affected.',
        accent: '#D2B48C',
    },
    {
        icon: FaTruck,
        title: 'Logistics Support',
        description: 'ShopZone coordinates delivery across all 47 counties. We work with G4S, Fargo, and bus parcel networks. You hand over the goods — we get them there.',
        accent: '#002147',
    },
    {
        icon: FaUsers,
        title: 'Built-in Customer Base',
        description: 'Thousands of retailers, shop owners, and bulk buyers are already on ShopZone looking for suppliers exactly like you. You do not build demand — you meet it.',
        accent: '#8e44ad',
    },
    {
        icon: FaHandshake,
        title: 'Dispute Protection',
        description: 'ShopZone mediates every dispute. If a buyer claims an issue, we investigate on your behalf. You are protected from fraudulent claims and unreasonable returns.',
        accent: '#e67e22',
    },
    {
        icon: FaRocket,
        title: 'Instant Visibility',
        description: 'Your products appear in category listings, search results, and featured sections immediately after approval. No SEO. No ads budget. Just exposure.',
        accent: '#c0392b',
    },
    {
        icon: FaLock,
        title: 'Secure Dashboard',
        description: 'Your seller portal is private and password protected. Manage your catalogue, view order statuses, and track payouts without anyone else seeing your data.',
        accent: '#002147',
    },
];

const SELLER_TYPES = [
    { icon: FaTshirt, label: 'Clothing & Fabric Suppliers', desc: 'Bale sellers, weavers, garment manufacturers' },
    { icon: FaMobileAlt, label: 'Electronics Distributors', desc: 'Phone accessories, gadgets, appliances' },
    { icon: FaShoppingBasket, label: 'Food & FMCG Wholesalers', desc: 'Dry goods, beverages, packaged foods' },
    { icon: FaSpa, label: 'Beauty & Cosmetics Brands', desc: 'Skincare, hair products, personal care' },
    { icon: FaTools, label: 'Hardware Suppliers', desc: 'Construction materials, tools, electrical' },
    { icon: FaSeedling, label: 'Agriculture Suppliers', desc: 'Seeds, fertiliser, farm inputs, produce' },
];

const PROMISES = [
    { icon: FaShieldAlt, title: 'Your identity stays private', body: 'Buyers never see your name, phone, address, or pricing. ShopZone is the brand. Your privacy is contractual.' },
    { icon: FaMoneyBillWave, title: 'Your money is protected', body: 'Payments are collected by ShopZone before goods move. Payouts are structured and trackable. No payment uncertainty ever.' },
    { icon: FaClock, title: 'Your time is respected', body: 'No endless buyer negotiations. No chasing payments. No handling returns yourself. We take the operational burden completely.' },
    { icon: FaStar, title: 'Your growth is our goal', body: 'ShopZone succeeds only when our sellers succeed. We invest in marketing, platform features, and buyer acquisition so your products sell.' },
];

// ── Main component ────────────────────────────────────────────────────────────
const BecomeSellerPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        products: '',
        county: '',
        message: '',
    });
const [submitted, setSubmitted]         = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError]     = useState('');
    const heroRef = useRef(null);

    useEffect(() => { document.title = 'Become a Seller — ShopZone'; }, []);

    // Typewriter effect for hero headline accent
    const [typed, setTyped] = useState('');
    const fullText = 'Grow With Us.';
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setTyped(fullText.slice(0, i + 1));
            i++;
            if (i >= fullText.length) clearInterval(interval);
        }, 80);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ── Form submission — posts to /api/enquiries ─────────────
    // Replaces the old mailto hack. Data is stored in MongoDB and
    // visible in the admin enquiries page at /admin/enquiries.
    // When Step 6 (Seller Approval) is built, seller_application
    // enquiries will migrate to the dedicated seller application model.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitError('');
        try {
            await axios.post('/api/enquiries', {
                type:     'seller_application',
                name:     formData.contactName,
                email:    formData.email,
                phone:    formData.phone,
                business: formData.businessName,
                message:  formData.message,
                // Store full application payload in the data field so
                // nothing is lost when it migrates to the seller model
                data: {
                    businessName: formData.businessName,
                    contactName:  formData.contactName,
                    products:     formData.products,
                    county:       formData.county,
                    message:      formData.message,
                },
            });
            setSubmitted(true);
        } catch (err) {
            setSubmitError(
                err.response?.data?.message ||
                'Failed to submit application. Please try again or WhatsApp us directly.'
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    // Generate random particles
    const particles = Array.from({ length: 20 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${4 + Math.random() * 8}px`,
        height: `${4 + Math.random() * 8}px`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${6 + Math.random() * 8}s`,
        opacity: 0.06 + Math.random() * 0.1,
    }));

    return (
        <div className='bs-page'>

            {/* ══ HERO ═══════════════════════════════════════════════════════ */}
            <section className='bs-hero' ref={heroRef} aria-label='Become a ShopZone seller'>
                {/* Animated particles */}
                {particles.map((p, i) => (
                    <Particle key={i} style={p} />
                ))}

                {/* Large decorative circle */}
                <div className='bs-hero__orb bs-hero__orb--1' aria-hidden='true' />
                <div className='bs-hero__orb bs-hero__orb--2' aria-hidden='true' />
                <div className='bs-hero__orb bs-hero__orb--3' aria-hidden='true' />

                <div className='bs-hero__inner'>
                    <div className='bs-hero__text-col'>
                    <div className='bs-hero__eyebrow'>
                        <FaBolt aria-hidden='true' />
                        Seller Programme
                    </div>

                    <h1 className='bs-hero__title'>
                        Stop Selling Alone.<br />
                        <span className='bs-hero__title--accent'>
                            {typed}
                            <span className='bs-hero__cursor' aria-hidden='true'>|</span>
                        </span>
                    </h1>

                    <p className='bs-hero__subtitle'>
                        ShopZone connects your products to thousands of verified retailers
                        and bulk buyers across Kenya. You supply. We sell, handle, protect,
                        and pay. No cold calls. No chasing. No exposure.
                    </p>

                    <div className='bs-hero__ctas'>
                        <button
                            className='bs-hero__cta bs-hero__cta--primary'
                            onClick={() => document.getElementById('bs-apply')
                                ?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Apply Now — It is Free
                            <FaArrowRight aria-hidden='true' />
                        </button>

                        <a
                            href='https://wa.me/254700000000?text=I want to become a ShopZone seller'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bs-hero__cta bs-hero__cta--secondary'
                        >
                            <FaWhatsapp aria-hidden='true' />
                            WhatsApp Us First
                        </a>
                    </div>
                    </div>{/* /bs-hero__text-col */}

                    {/* Illustration */}
                    <div className='bs-hero__illustration' aria-hidden='true'>
                        <SellerIllustration />
                    </div>

                    {/* Quick trust row */}
                    <div className='bs-hero__trust'>
                        {['Free to apply', 'Reviewed in 48 hours', 'No monthly fees', 'Full privacy protection'].map(t => (
                            <div key={t} className='bs-hero__trust-item'>
                                <FaCheckCircle aria-hidden='true' />
                                {t}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className='bs-hero__scroll' aria-hidden='true'>
                    <div className='bs-hero__scroll-dot' />
                </div>
            </section>

            {/* ══ PAIN POINTS ════════════════════════════════════════════════ */}
            <section className='bs-pain' aria-label='Common seller problems we solve'>
                <div className='bs-pain__inner'>
                    <Reveal>
                        <div className='bs-pain__header'>
                            <h2 className='bs-pain__title'>
                                We built ShopZone for sellers who are tired of this:
                            </h2>
                        </div>
                    </Reveal>

                    <div className='bs-pain__grid'>
                        {[
                            { problem: 'Buyers who haggle, ghost you, and never pay on time', solution: 'ShopZone collects payment before anything ships' },
                            { problem: 'Your phone number shared everywhere without consent', solution: 'Your identity is fully hidden from every buyer' },
                            { problem: 'Building a customer base from scratch every time', solution: 'Thousands of verified buyers are already here waiting' },
                            { problem: 'Handling returns, complaints, and disputes yourself', solution: 'ShopZone mediates every single issue on your behalf' },
                            { problem: 'Delivery logistics that drain your time and energy', solution: 'We coordinate couriers across all 47 counties for you' },
                            { problem: 'No visibility — your products hidden in WhatsApp groups', solution: 'Instant exposure to structured, searchable listings' },
                        ].map((item, i) => (
                            <Reveal key={i} delay={i * 70}>
                                <div className='bs-pain__card'>
                                    <div className='bs-pain__problem'>
                                        <span className='bs-pain__x' aria-hidden='true'>✕</span>
                                        <p>{item.problem}</p>
                                    </div>
                                    <div className='bs-pain__divider' aria-hidden='true' />
                                    <div className='bs-pain__solution'>
                                        <FaCheckCircle className='bs-pain__check' aria-hidden='true' />
                                        <p>{item.solution}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ STATS STRIP ════════════════════════════════════════════════ */}
            <section className='bs-stats' aria-label='ShopZone platform statistics'>
                <div className='bs-stats__inner'>
                    {STATS.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className='bs-stat'>
                                <div className='bs-stat__icon-wrap'>
                                    <Icon aria-hidden='true' />
                                </div>
                                <div className='bs-stat__number'>
                                    <Counter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className='bs-stat__label'>{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ══ HOW IT WORKS ═══════════════════════════════════════════════ */}
            <section className='bs-how' aria-label='How to become a ShopZone seller'>
                <div className='bs-how__inner'>
                    <Reveal>
                        <div className='bs-section-header'>
                            <span className='bs-section-eyebrow'>Simple Process</span>
                            <h2 className='bs-section-title'>
                                From application to first sale in days
                            </h2>
                            <p className='bs-section-sub'>
                                No complicated onboarding. No hidden requirements. Just five clear steps.
                            </p>
                        </div>
                    </Reveal>

                    <div className='bs-steps'>
                        {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <Reveal key={step.number} delay={i * 120} direction='up'>
                                    <div className='bs-step'>
                                        {i < STEPS.length - 1 && (
                                            <div className='bs-step__line' aria-hidden='true' />
                                        )}
                                        <div className='bs-step__icon-wrap'>
                                            <Icon aria-hidden='true' />
                                            <span className='bs-step__number'>{step.number}</span>
                                        </div>
                                        <div className='bs-step__content'>
                                            <h3 className='bs-step__title'>{step.title}</h3>
                                            <p className='bs-step__desc'>{step.description}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══ BENEFITS GRID ══════════════════════════════════════════════ */}
            <section className='bs-benefits' aria-label='Seller benefits'>
                <div className='bs-benefits__inner'>
                    <Reveal>
                        <div className='bs-section-header bs-section-header--light'>
                            <span className='bs-section-eyebrow bs-section-eyebrow--light'>
                                What You Get
                            </span>
                            <h2 className='bs-section-title bs-section-title--light'>
                                Everything a serious supplier needs
                            </h2>
                            <p className='bs-section-sub bs-section-sub--light'>
                                ShopZone is not just a listing platform. It is a complete
                                business infrastructure for Kenya's best suppliers.
                            </p>
                        </div>
                    </Reveal>

                    <div className='bs-benefits__grid'>
                        {BENEFITS.map((b, i) => {
                            const Icon = b.icon;
                            return (
                                <Reveal key={b.title} delay={i * 60}>
                                    <div className='bs-benefit-card'>
                                        <div
                                            className='bs-benefit-card__icon'
                                            style={{ background: b.accent }}
                                        >
                                            <Icon aria-hidden='true' />
                                        </div>
                                        <h3 className='bs-benefit-card__title'>{b.title}</h3>
                                        <p className='bs-benefit-card__desc'>{b.description}</p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══ PROMISES STRIP ═════════════════════════════════════════════ */}
            <section className='bs-promises' aria-label='Seller protection promises'>
                <div className='bs-promises__inner'>
                    <Reveal>
                        <div className='bs-section-header'>
                            <span className='bs-section-eyebrow'>Our Commitment</span>
                            <h2 className='bs-section-title'>The ShopZone seller promise</h2>
                            <p className='bs-section-sub'>
                                Four guarantees we make to every approved seller on this platform.
                            </p>
                        </div>
                    </Reveal>

                    <div className='bs-promises__grid'>
                        {PROMISES.map((p, i) => {
                            const Icon = p.icon;
                            return (
                                <Reveal key={p.title} delay={i * 100}>
                                    <div className='bs-promise-card'>
                                        <div className='bs-promise-card__icon'>
                                            <Icon aria-hidden='true' />
                                        </div>
                                        <h3 className='bs-promise-card__title'>{p.title}</h3>
                                        <p className='bs-promise-card__body'>{p.body}</p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══ WHO IS THIS FOR ════════════════════════════════════════════ */}
            <section className='bs-who' aria-label='Types of sellers welcome on ShopZone'>
                <div className='bs-who__inner'>
                    <Reveal>
                        <div className='bs-section-header'>
                            <span className='bs-section-eyebrow'>Seller Types</span>
                            <h2 className='bs-section-title'>Is this for you?</h2>
                            <p className='bs-section-sub'>
                                ShopZone welcomes suppliers across every major wholesale category in Kenya.
                            </p>
                        </div>
                    </Reveal>

                    <div className='bs-who__grid'>
                        {SELLER_TYPES.map((type, i) => {
                            const Icon = type.icon;
                            return (
                                <Reveal key={type.label} delay={i * 70}>
                                    <div className='bs-who__card'>
                                        <div className='bs-who__card-icon'>
                                            <Icon aria-hidden='true' />
                                        </div>
                                        <div>
                                            <h3 className='bs-who__card-label'>{type.label}</h3>
                                            <p className='bs-who__card-desc'>{type.desc}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>

                    <Reveal delay={400}>
                        <div className='bs-who__note'>
                            Don't see your category? We are always expanding.{' '}
                            <a href='mailto:support@shopzone.com' className='bs-who__note-link'>
                                Email us anyway.
                            </a>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ══ APPLICATION FORM ═══════════════════════════════════════════ */}
            <section className='bs-apply' id='bs-apply' aria-label='Seller application form'>
                <div className='bs-apply__inner'>

                    <Reveal>
                        <div className='bs-apply__header'>
                            <div className='bs-apply__eyebrow'>
                                <FaBolt aria-hidden='true' /> Ready to start?
                            </div>
                            <h2 className='bs-apply__title'>
                                Apply to become a ShopZone seller
                            </h2>
                            <p className='bs-apply__sub'>
                                Takes three minutes. Completely free. We review every application personally.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <div className='bs-apply__card'>
                            {submitted ? (
                              <div className='bs-apply__success'>
                                    <div className='bs-apply__success-icon'>
                                        <FaCheckCircle aria-hidden='true' />
                                    </div>
                                    <h3>Application received!</h3>
                                    <p>
                                        Thank you for applying to sell on ShopZone. Our team reviews
                                        every application personally and will get back to you within
                                        48 hours. Keep an eye on your email at{' '}
                                        <strong>{formData.email}</strong>.
                                    </p>
                                    <button
                                        className='bs-apply__reset'
                                        onClick={() => {
                                            setSubmitted(false);
                                            setSubmitError('');
                                            setFormData({
                                                businessName: '', contactName: '', email: '',
                                                phone: '', products: '', county: '', message: '',
                                            });
                                        }}
                                    >
                                        Submit another application
                                    </button>
                                </div>
                            ) : (
                                <form className='bs-apply__form' onSubmit={handleSubmit} noValidate>

                                    <div className='bs-apply__form-row'>
                                        <div className='bs-apply__form-group'>
                                            <label htmlFor='bs-businessName'>Business Name</label>
                                            <input
                                                id='bs-businessName'
                                                name='businessName'
                                                type='text'
                                                placeholder='Your business or trading name'
                                                value={formData.businessName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className='bs-apply__form-group'>
                                            <label htmlFor='bs-contactName'>Your Name</label>
                                            <input
                                                id='bs-contactName'
                                                name='contactName'
                                                type='text'
                                                placeholder='Your full name'
                                                value={formData.contactName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className='bs-apply__form-row'>
                                        <div className='bs-apply__form-group'>
                                            <label htmlFor='bs-email'>Email Address</label>
                                            <input
                                                id='bs-email'
                                                name='email'
                                                type='email'
                                                placeholder='you@example.com'
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className='bs-apply__form-group'>
                                            <label htmlFor='bs-phone'>Phone Number</label>
                                            <input
                                                id='bs-phone'
                                                name='phone'
                                                type='tel'
                                                placeholder='+254 700 000 000'
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className='bs-apply__form-group'>
                                        <label htmlFor='bs-products'>What do you supply?</label>
                                        <input
                                            id='bs-products'
                                            name='products'
                                            type='text'
                                            placeholder='e.g. Clothing bales, electronics accessories, sugar in 50kg sacks'
                                            value={formData.products}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className='bs-apply__form-row'>
                                        <div className='bs-apply__form-group'>
                                            <label htmlFor='bs-county'>Your County</label>
                                            <input
                                                id='bs-county'
                                                name='county'
                                                type='text'
                                                placeholder='e.g. Nairobi, Mombasa, Kisumu'
                                                value={formData.county}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className='bs-apply__form-group'>
                                        <label htmlFor='bs-message'>Anything else we should know?</label>
                                        <textarea
                                            id='bs-message'
                                            name='message'
                                            rows={4}
                                            placeholder='Stock quantities, special requirements, how you heard about us...'
                                            value={formData.message}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Inline error if submission fails */}
                                    {submitError && (
                                        <p className='bs-apply__error' role='alert'>
                                            {submitError}
                                        </p>
                                    )}

                                    <button
                                        type='submit'
                                        className='bs-apply__submit'
                                        disabled={
                                            !formData.businessName || !formData.contactName ||
                                            !formData.email || !formData.phone || !formData.products ||
                                            !formData.county || submitLoading
                                        }
                                    >
                                        <FaRocket aria-hidden='true' />
                                        {submitLoading ? 'Submitting…' : 'Submit My Application'}
                                    </button>

                                    <p className='bs-apply__privacy'>
                                        <FaLock aria-hidden='true' />
                                        Your information is only used to review your application. We never sell data.
                                    </p>
                                </form>
                            )}
                        </div>
                    </Reveal>

                    {/* Alternative contact */}
                    <Reveal delay={200}>
                        <div className='bs-apply__alt'>
                            <p>Prefer to talk first?</p>
                            <div className='bs-apply__alt-links'>

                                <a
                                    href='https://wa.me/254700000000?text=I want to become a ShopZone seller'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='bs-apply__alt-btn bs-apply__alt-btn--wa'
                                >
                                    <FaWhatsapp aria-hidden='true' /> WhatsApp Us
                                </a>

                                <a
                                    href='mailto:support@shopzone.com?subject=Seller Application Enquiry'
                                    className='bs-apply__alt-btn bs-apply__alt-btn--email'
                                >
                                    <FaEnvelope aria-hidden='true' /> Email Us
                                </a>
                            </div>
                        </div>
                    </Reveal>

                </div>
            </section>

        </div>
    );
};

export default BecomeSellerPage;