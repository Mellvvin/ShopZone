// frontend/src/pages/FAQPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// FAQ page — full cinematic treatment matching BecomeSellerPage.
// Features: particles, typewriter hero, animated accordion, scroll reveals,
// SVG illustration, counting stat strip.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaSearch, FaChevronDown, FaShoppingCart, FaCreditCard,
    FaTruck, FaStore, FaUndoAlt, FaQuestionCircle,
    FaHeadset, FaEnvelope, FaWhatsapp, FaBolt,
    FaCheckCircle, FaUsers, FaBoxOpen,
} from 'react-icons/fa';
import './FAQPage.css';

// ── Floating particle ─────────────────────────────────────────────────────────
const Particle = ({ style }) => (
    <div className='faq-particle' style={style} aria-hidden='true' />
);

// ── Scroll reveal wrapper ─────────────────────────────────────────────────────
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
            className={`faq-reveal ${visible ? 'faq-reveal--visible' : ''} ${className}`}
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

// ── FAQ data ──────────────────────────────────────────────────────────────────
const FAQ_DATA = [
    {
        category: 'buying',
        categoryLabel: 'Buying',
        icon: FaShoppingCart,
        questions: [
            { q: 'Do I need an account to browse products?', a: 'No — anyone can browse ShopZone products without an account. However, to place an order, save items, or track your purchases you will need to register. Registration is free and takes under two minutes.' },
            { q: 'What is the minimum order quantity?', a: 'ShopZone does not enforce a platform-wide minimum order quantity. Each product page shows its unit type — bale, carton, kg, sack, dozen, or piece. You order by the unit, and one unit is the minimum. For very large custom orders, contact our support team for a bulk quote.' },
            { q: 'How do I know what one unit contains?', a: 'Every product listing clearly states its unit type and what it contains. For example, a clothing bale contains an assorted mix of items, while a carton of soap contains a fixed number of bars. If you are unsure, contact support before ordering.' },
            { q: 'Can I request a product that is not listed?', a: 'Yes. ShopZone has a sourcing team that can find products not currently listed. Email support@shopzone.com with the product name, quantity needed, your location, your deadline, and your budget range. We review all requests within 24 to 48 hours.' },
            { q: 'Are the prices on ShopZone VAT inclusive?', a: 'Yes. All prices displayed on ShopZone are VAT inclusive at the standard rate of 16%. The VAT breakdown is shown clearly at checkout. For formal KRA-compliant tax invoices, contact support@shopzone.com after placing your order.' },
            { q: 'Can I cancel an order after placing it?', a: 'Orders can be cancelled as long as they have not been dispatched. Go to My Profile, find the order, and select Cancel Order. If your order has already been dispatched, contact us immediately on WhatsApp at +254 700 000 000.' },
        ],
    },
    {
        category: 'payments',
        categoryLabel: 'Payments',
        icon: FaCreditCard,
        questions: [
            { q: 'What payment methods does ShopZone accept?', a: 'ShopZone currently accepts M-Pesa, PayPal, and bank transfer. M-Pesa is recommended for fast, secure local transactions. PayPal is available for international buyers. Bank transfer is ideal for large wholesale orders.' },
            { q: 'Is it safe to pay on ShopZone?', a: 'Yes. All payments go directly to ShopZone — never to individual sellers. This means you are fully protected. If there is any issue with your order, ShopZone is accountable and will resolve it.' },
            { q: 'Will I receive a receipt or invoice?', a: 'Yes. A confirmation is available in your order history immediately after payment. For formal pro-forma invoices or KRA-compliant VAT receipts, email support@shopzone.com with your order number.' },
            { q: 'Can I pay in instalments for large orders?', a: 'Instalment and deposit arrangements for large bulk orders are handled case by case. Contact support@shopzone.com with your order details and budget structure and our team will work out a payment plan where possible.' },
        ],
    },
    {
        category: 'delivery',
        categoryLabel: 'Delivery',
        icon: FaTruck,
        questions: [
            { q: 'Does ShopZone deliver across Kenya?', a: 'Yes. ShopZone delivers to all 47 counties in Kenya. Nairobi and surrounding areas receive same-day or next-day delivery. Major towns like Mombasa, Kisumu, Nakuru, and Eldoret are served within one to two business days.' },
            { q: 'How much does shipping cost?', a: 'Standard shipping starts at KES 300 for orders up to 5kg. Each additional kilogram costs KES 100. For very large or heavy bulk orders, a Tier 2 delivery quote is generated at checkout.' },
            { q: 'Which couriers does ShopZone use?', a: 'ShopZone works with G4S, Fargo, and trusted bus parcel services depending on your location, package size, and urgency. The courier is selected by ShopZone to ensure your order arrives safely and on time.' },
            { q: 'How do I track my order?', a: 'Log into your ShopZone account, go to your profile, and open My Orders. Click on any order to see its current status. If your order is overdue, contact us at +254 700 000 000.' },
            { q: 'What is a Tier 2 delivery quote?', a: 'For bulk, heavy, or oversized orders, standard shipping rates may not apply. ShopZone generates a custom delivery quote and you can approve, reject, or negotiate before your order is processed.' },
        ],
    },
    {
        category: 'sellers',
        categoryLabel: 'Sellers',
        icon: FaStore,
        questions: [
            { q: 'How do I become a seller on ShopZone?', a: 'Email support@shopzone.com with your business name, the products you supply, your location, and your approximate stock quantities. Our team reviews all applications within 48 hours.' },
            { q: 'Will customers be able to contact me directly?', a: 'No. All customer communication goes exclusively through ShopZone. You will never receive direct messages, calls, or emails from buyers. ShopZone handles all customer queries on your behalf.' },
            { q: 'Can I set my own prices?', a: 'Yes. Approved sellers can update prices on their own eligible products directly from the seller dashboard. Price changes apply to future orders only.' },
            { q: 'How do seller payouts work?', a: 'ShopZone collects payment from customers and releases seller payouts after order completion and quality checks. All payout activity is visible in your seller dashboard.' },
        ],
    },
    {
        category: 'returns',
        categoryLabel: 'Returns',
        icon: FaUndoAlt,
        questions: [
            { q: "What is ShopZone's return policy?", a: 'ShopZone accepts return requests within 7 days of confirmed delivery. Valid reasons include wrong items received, damaged or defective goods, and significant quality issues.' },
            { q: 'How do I report a problem with my order?', a: 'Contact ShopZone support within 7 days of delivery. WhatsApp or call +254 700 000 000 and provide your order number along with clear photos of the issue. Do not contact the seller directly.' },
            { q: 'What happens after I report a return?', a: 'Our team reviews your report within 24 hours. If the return is approved, we arrange collection or ask you to return the item. Once received and verified, we process either a replacement or a refund.' },
            { q: 'Are there products that cannot be returned?', a: 'Perishable food items, opened personal care products, and custom-sourced goods generally cannot be returned unless they arrived damaged or incorrect.' },
        ],
    },
];

// ── Accordion item ────────────────────────────────────────────────────────────
const AccordionItem = ({ question, answer, isOpen, onToggle, index }) => {
    const contentRef = useRef(null);
    return (
        <div className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
            <button
                className='faq-item__trigger'
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span className='faq-item__number'>{String(index + 1).padStart(2, '0')}</span>
                <span className='faq-item__question'>{question}</span>
                <FaChevronDown
                    className={`faq-item__chevron ${isOpen ? 'faq-item__chevron--open' : ''}`}
                    aria-hidden='true'
                />
            </button>
            <div
                className='faq-item__body'
                ref={contentRef}
                style={{ maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0px' }}
            >
                <p className='faq-item__answer'>{answer}</p>
            </div>
        </div>
    );
};

// ── SVG illustration — floating question marks ────────────────────────────────
const FAQIllustration = () => (
    <svg
        className='faq-illustration'
        viewBox='0 0 320 280'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
    >
        {/* Central circle */}
        <circle cx='160' cy='140' r='80' fill='rgba(210,180,140,0.08)' stroke='rgba(210,180,140,0.2)' strokeWidth='1.5' />
        <circle cx='160' cy='140' r='55' fill='rgba(210,180,140,0.06)' stroke='rgba(210,180,140,0.15)' strokeWidth='1' />
        {/* Big question mark */}
        <text x='140' y='165' fontSize='52' fill='rgba(210,180,140,0.6)' fontWeight='800' fontFamily='serif'>?</text>
        {/* Floating small question marks */}
        <text x='48' y='72' fontSize='22' fill='rgba(210,180,140,0.35)' fontWeight='700' className='faq-svg-float-1'>?</text>
        <text x='255' y='60' fontSize='16' fill='rgba(210,180,140,0.25)' fontWeight='700' className='faq-svg-float-2'>?</text>
        <text x='280' y='190' fontSize='26' fill='rgba(210,180,140,0.3)' fontWeight='700' className='faq-svg-float-3'>?</text>
        <text x='30' y='200' fontSize='18' fill='rgba(210,180,140,0.2)' fontWeight='700' className='faq-svg-float-2'>?</text>
        <text x='200' y='240' fontSize='14' fill='rgba(210,180,140,0.2)' fontWeight='700' className='faq-svg-float-1'>?</text>
        {/* Orbit dots */}
        <circle cx='160' cy='56' r='5' fill='rgba(210,180,140,0.4)' />
        <circle cx='244' cy='140' r='4' fill='rgba(210,180,140,0.3)' />
        <circle cx='160' cy='224' r='5' fill='rgba(210,180,140,0.4)' />
        <circle cx='76' cy='140' r='4' fill='rgba(210,180,140,0.3)' />
        {/* Connecting dashed orbit ring */}
        <circle cx='160' cy='140' r='84' stroke='rgba(210,180,140,0.1)' strokeWidth='1' strokeDasharray='6 4' />
    </svg>
);

// ── Main component ────────────────────────────────────────────────────────────
const FAQPage = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [openItem, setOpenItem] = useState(null);

    // Typewriter
    const fullText = 'Asked Questions.';
    const [typed, setTyped] = useState('');
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => { document.title = 'FAQ — ShopZone'; }, []);

    useEffect(() => {
        let i = 0;
        const t = setInterval(() => {
            setTyped(fullText.slice(0, i + 1));
            i++;
            if (i >= fullText.length) clearInterval(t);
        }, 75);
        return () => clearInterval(t);
    }, []);

    // Particles
    const particles = Array.from({ length: 16 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${3 + Math.random() * 7}px`,
        height: `${3 + Math.random() * 7}px`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${6 + Math.random() * 8}s`,
        opacity: 0.05 + Math.random() * 0.09,
    }));

    const filteredData = FAQ_DATA
        .filter(s => activeCategory === 'all' || s.category === activeCategory)
        .map(s => ({
            ...s,
            questions: s.questions.filter(item =>
                searchQuery === '' ||
                item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.a.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter(s => s.questions.length > 0);

    const totalResults = filteredData.reduce((acc, s) => acc + s.questions.length, 0);

    const handleToggle = (key) => {
        setOpenItem(prev => prev === key ? null : key);
    };

    const allCategories = [
        { value: 'all', label: 'All Questions', icon: FaQuestionCircle },
        ...FAQ_DATA.map(s => ({ value: s.category, label: s.categoryLabel, icon: s.icon })),
    ];

    return (
        <div className='faq-page'>

            {/* ══ HERO ═══════════════════════════════════════════════════════ */}
            <section className='faq-hero'>
                {particles.map((p, i) => <Particle key={i} style={p} />)}
                <div className='faq-hero__orb faq-hero__orb--1' aria-hidden='true' />
                <div className='faq-hero__orb faq-hero__orb--2' aria-hidden='true' />

                <div className='faq-hero__split'>
                    {/* Left — text */}
                    <div className='faq-hero__text'>
                        <div className='faq-hero__eyebrow'>
                            <FaBolt aria-hidden='true' /> Help Centre
                        </div>
                        <h1 className='faq-hero__title'>
                            Frequently<br />
                            <span className='faq-hero__title--accent'>
                                {typed}
                                <span className='faq-hero__cursor' aria-hidden='true'>|</span>
                            </span>
                        </h1>
                        <p className='faq-hero__subtitle'>
                            Everything you need to know about buying wholesale,
                            payments, delivery across Kenya, and how ShopZone works.
                        </p>

                        {/* Trust badges */}
                        <div className='faq-hero__badges'>
                            {['Instant answers', 'Real support team', 'Available Mon–Fri'].map(b => (
                                <div key={b} className='faq-hero__badge'>
                                    <FaCheckCircle aria-hidden='true' /> {b}
                                </div>
                            ))}
                        </div>

                        {/* Search */}
                        <div className='faq-search'>
                            <FaSearch className='faq-search__icon' aria-hidden='true' />
                            <input
                                type='text'
                                className='faq-search__input'
                                placeholder='Search questions...'
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setOpenItem(null); }}
                                aria-label='Search frequently asked questions'
                            />
                            {searchQuery && (
                                <button className='faq-search__clear' onClick={() => setSearchQuery('')} aria-label='Clear search'>×</button>
                            )}
                        </div>
                    </div>

                    {/* Right — illustration */}
                    <div className='faq-hero__illustration' aria-hidden='true'>
                        <FAQIllustration />
                    </div>
                </div>
            </section>

            {/* ══ STATS STRIP ════════════════════════════════════════════════ */}
            <div className='faq-stats-strip'>
                {[
                    { icon: FaQuestionCircle, value: FAQ_DATA.reduce((a, s) => a + s.questions.length, 0), suffix: '', label: 'Questions answered' },
                    { icon: FaBoxOpen, value: 5, suffix: '', label: 'Topic categories' },
                    { icon: FaUsers, value: 47, suffix: '+', label: 'Counties we serve' },
                    { icon: FaHeadset, value: 4, suffix: 'hr', label: 'Email response time' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Reveal key={stat.label} delay={i * 80}>
                            <div className='faq-stat'>
                                <div className='faq-stat__icon'><Icon aria-hidden='true' /></div>
                                <div className='faq-stat__number'>
                                    <Counter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className='faq-stat__label'>{stat.label}</div>
                            </div>
                        </Reveal>
                    );
                })}
            </div>

            {/* ══ TABS ═══════════════════════════════════════════════════════ */}
            <div className='faq-tabs' role='tablist'>
                {allCategories.map(cat => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.value}
                            className={`faq-tab ${activeCategory === cat.value ? 'faq-tab--active' : ''}`}
                            onClick={() => { setActiveCategory(cat.value); setOpenItem(null); }}
                            role='tab'
                            aria-selected={activeCategory === cat.value}
                        >
                            <Icon aria-hidden='true' /> {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* ══ ACCORDION ══════════════════════════════════════════════════ */}
            <div className='faq-content'>
                {searchQuery && (
                    <p className='faq-results-count'>
                        {totalResults} result{totalResults !== 1 ? 's' : ''} for <strong>"{searchQuery}"</strong>
                    </p>
                )}

                {filteredData.length === 0 ? (
                    <div className='faq-empty'>
                        <FaQuestionCircle className='faq-empty__icon' aria-hidden='true' />
                        <p>No questions found.</p>
                        <button className='faq-empty__reset' onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                            Clear filters
                        </button>
                    </div>
                ) : (
                    filteredData.map((section, si) => (
                        <Reveal key={section.category} delay={si * 80}>
                            <div className='faq-section-header'>
                                <div className='faq-section-header__icon-wrap'>
                                    <section.icon aria-hidden='true' />
                                </div>
                                <div>
                                    <h2 className='faq-section-header__title'>{section.categoryLabel}</h2>
                                    <p className='faq-section-header__count'>{section.questions.length} question{section.questions.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            <div className='faq-accordion'>
                                {section.questions.map((item, qi) => {
                                    const key = `${section.category}-${qi}`;
                                    return (
                                        <Reveal key={key} delay={qi * 50}>
                                            <AccordionItem
                                                question={item.q}
                                                answer={item.a}
                                                isOpen={openItem === key}
                                                onToggle={() => handleToggle(key)}
                                                index={qi}
                                            />
                                        </Reveal>
                                    );
                                })}
                            </div>
                        </Reveal>
                    ))
                )}
            </div>

            {/* ══ CTA STRIP ══════════════════════════════════════════════════ */}
            <Reveal>
                <div className='faq-cta'>
                    <div className='faq-cta__shape' aria-hidden='true' />
                    <div className='faq-cta__inner'>
                        <FaHeadset className='faq-cta__icon' aria-hidden='true' />
                        <div className='faq-cta__text'>
                            <h2 className='faq-cta__title'>Still have questions?</h2>
                            <p className='faq-cta__subtitle'>Our support team is available Monday to Friday, 8am to 6pm EAT.</p>
                        </div>
                        <div className='faq-cta__actions'>
                            <a href='mailto:support@shopzone.com' className='faq-cta__btn faq-cta__btn--email'>
                                <FaEnvelope aria-hidden='true' /> Email Us
                            </a>
                            <a href='https://wa.me/254700000000' target='_blank' rel='noopener noreferrer' className='faq-cta__btn faq-cta__btn--whatsapp'>
                                <FaWhatsapp aria-hidden='true' /> WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </Reveal>

        </div>
    );
};

export default FAQPage;