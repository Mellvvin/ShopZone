// frontend/src/pages/ReturnsPolicyPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Returns Policy page — full cinematic treatment matching BecomeSellerPage.
// Features:
//   - Particles, orbs, typewriter hero
//   - SVG illustration: shield protecting a package with checkmark
//   - Counting stats strip
//   - How returns work — animated timeline
//   - What is and is not covered — two-column grid
//   - FAQ accordion
//   - CTA strip
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import {
    FaShieldAlt, FaBolt, FaCheckCircle, FaTimesCircle,
    FaClock, FaBoxOpen, FaCamera, FaPhoneAlt,
    FaChevronDown, FaEnvelope, FaWhatsapp,
    FaUndoAlt, FaExclamationTriangle, FaHandshake,
    // Added for the fault-based returns split (ISS-014 / DEC-039)
    FaInfoCircle, FaMoneyBillWave, FaBoxes, FaLayerGroup,
} from 'react-icons/fa';
import './ReturnsPolicyPage.css';

// ── Particle ──────────────────────────────────────────────────────────────────
const Particle = ({ style }) => (
    <div className='rp-particle' style={style} aria-hidden='true' />
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
            className={`rp-reveal ${visible ? 'rp-reveal--visible' : ''} ${className}`}
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

// ── SVG Illustration — shield protecting a package ────────────────────────────
const ReturnsIllustration = () => (
    <svg
        className='rp-illustration'
        viewBox='0 0 360 320'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
    >
        {/* Background circles */}
        <circle cx='180' cy='160' r='118' fill='rgba(210,180,140,0.05)' stroke='rgba(210,180,140,0.12)' strokeWidth='1.5' />
        <circle cx='180' cy='160' r='80' fill='rgba(210,180,140,0.04)' stroke='rgba(210,180,140,0.09)' strokeWidth='1' />

        {/* Large shield */}
        <path
            d='M180 60 L240 82 L240 148 Q240 200 180 224 Q120 200 120 148 L120 82 Z'
            fill='rgba(210,180,140,0.1)'
            stroke='rgba(210,180,140,0.45)'
            strokeWidth='2.5'
            strokeLinejoin='round'
            className='rp-svg-shield'
        />
        {/* Shield inner highlight */}
        <path
            d='M180 76 L228 94 L228 148 Q228 192 180 212 Q132 192 132 148 L132 94 Z'
            fill='rgba(210,180,140,0.06)'
            stroke='rgba(210,180,140,0.2)'
            strokeWidth='1'
            strokeLinejoin='round'
        />

        {/* Package inside shield */}
        <rect x='158' y='120' width='44' height='40' rx='5'
            fill='rgba(210,180,140,0.18)'
            stroke='rgba(210,180,140,0.5)'
            strokeWidth='2' />
        {/* Package ribbon horizontal */}
        <line x1='158' y1='140' x2='202' y2='140'
            stroke='rgba(210,180,140,0.45)' strokeWidth='1.5' />
        {/* Package ribbon vertical */}
        <line x1='180' y1='120' x2='180' y2='160'
            stroke='rgba(210,180,140,0.45)' strokeWidth='1.5' />
        {/* Package bow */}
        <path d='M174 120 Q180 114 186 120'
            stroke='rgba(210,180,140,0.5)' strokeWidth='1.5' fill='none' strokeLinecap='round' />

        {/* Large checkmark over shield bottom */}
        <circle cx='180' cy='178' r='16'
            fill='rgba(39,174,96,0.15)'
            stroke='rgba(39,174,96,0.4)'
            strokeWidth='1.5'
            className='rp-svg-check-circle' />
        <path d='M172 178 L177 184 L189 170'
            stroke='rgba(39,174,96,0.8)'
            strokeWidth='2.5'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='rp-svg-check' />

        {/* Floating elements */}
        {/* 7 days badge — top left */}
        <rect x='44' y='80' width='56' height='28' rx='8'
            fill='rgba(210,180,140,0.12)'
            stroke='rgba(210,180,140,0.3)'
            strokeWidth='1.5'
            className='rp-svg-float-1' />
        <text x='72' y='91' fontSize='8' fill='rgba(210,180,140,0.7)'
            fontWeight='800' textAnchor='middle' className='rp-svg-float-1'>7 DAYS
        </text>
        <text x='72' y='103' fontSize='7' fill='rgba(210,180,140,0.5)'
            fontWeight='600' textAnchor='middle' className='rp-svg-float-1'>WINDOW
        </text>

        {/* Camera icon — top right — photo evidence */}
        <rect x='262' y='72' width='40' height='32' rx='8'
            fill='rgba(210,180,140,0.1)'
            stroke='rgba(210,180,140,0.28)'
            strokeWidth='1.5'
            className='rp-svg-float-2' />
        <circle cx='282' cy='88' r='7'
            fill='none'
            stroke='rgba(210,180,140,0.5)'
            strokeWidth='1.5'
            className='rp-svg-float-2' />
        <circle cx='282' cy='88' r='3'
            fill='rgba(210,180,140,0.4)'
            className='rp-svg-float-2' />
        <rect x='289' y='75' width='6' height='5' rx='2'
            fill='rgba(210,180,140,0.4)'
            className='rp-svg-float-2' />

        {/* Return arrow — bottom left */}
        <path d='M60 210 Q60 190 76 190 L100 190'
            stroke='rgba(210,180,140,0.4)'
            strokeWidth='2'
            fill='none'
            strokeLinecap='round'
            className='rp-svg-float-3' />
        <path d='M94 184 L102 190 L94 196'
            stroke='rgba(210,180,140,0.4)'
            strokeWidth='2'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='rp-svg-float-3' />

        {/* Refund coin — bottom right */}
        <circle cx='292' cy='224' r='18'
            fill='rgba(210,180,140,0.1)'
            stroke='rgba(210,180,140,0.35)'
            strokeWidth='1.5'
            className='rp-svg-float-1' />
        <text x='292' y='221' fontSize='9'
            fill='rgba(210,180,140,0.65)'
            fontWeight='800'
            textAnchor='middle'
            className='rp-svg-float-1'>KES
        </text>
        <text x='292' y='232' fontSize='7'
            fill='rgba(210,180,140,0.45)'
            fontWeight='600'
            textAnchor='middle'
            className='rp-svg-float-1'>BACK
        </text>

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

// ── Accordion ─────────────────────────────────────────────────────────────────
const AccordionItem = ({ question, answer, isOpen, onToggle }) => {
    const contentRef = useRef(null);
    return (
        <div className={`rp-faq-item ${isOpen ? 'rp-faq-item--open' : ''}`}>
            <button className='rp-faq-item__trigger' onClick={onToggle} aria-expanded={isOpen}>
                <span className='rp-faq-item__question'>{question}</span>
                <FaChevronDown
                    className={`rp-faq-item__chevron ${isOpen ? 'rp-faq-item__chevron--open' : ''}`}
                    aria-hidden='true'
                />
            </button>
            <div
                className='rp-faq-item__body'
                ref={contentRef}
                style={{ maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0px' }}
            >
                <p className='rp-faq-item__answer'>{answer}</p>
            </div>
        </div>
    );
};

// ── Data ──────────────────────────────────────────────────────────────────────
const RETURN_STEPS = [
    {
        icon: FaClock,
        title: 'Contact us within 7 days',
        desc: 'Report the issue within 7 days of confirmed delivery. WhatsApp or call +254 700 000 000, or email support@shopzone.com. Do not contact the seller directly.',
    },
    {
        icon: FaCamera,
        title: 'Provide your order number and photos',
        desc: 'Share your order number and clear photos showing the issue — damaged packaging, wrong item, defective product. The more detail you provide, the faster we resolve it.',
    },
    {
        icon: FaShieldAlt,
        title: 'ShopZone investigates',
        desc: 'Our team reviews your report within 24 hours. We investigate with the seller and courier on your behalf. You do not need to negotiate with anyone directly.',
    },
    {
        icon: FaBoxOpen,
        title: 'Return arranged if approved',
        desc: 'If the return is approved, we arrange collection from your location or provide a return address depending on your county. Do not return goods without written confirmation from us.',
    },
    {
        icon: FaHandshake,
        title: 'Refund or replacement issued',
        desc: 'Once the returned item is received and verified, we process a replacement or a full refund within 3 to 7 business days. Refunds are always sent back to the exact M-Pesa number or bank account you paid from — never as platform credit or a stored balance.',
    },
];

// ── Fault-based return categories (DEC-039) ─────────────────────────────
// ShopZone splits every return request into exactly two categories, locked
// in SESSION-012 and made visible here rather than only discoverable
// through a support conversation afterward. Seller or platform fault is
// always free. The buyer's own selection error or change of mind is
// buyer-paid where a return is offered at all, or simply non-returnable —
// the bulk/wholesale case is called out separately below since restocking
// a full carton or bale doesn't work like restocking a single retail unit.
const SELLER_FAULT = [
    'Wrong item received',
    'Item arrived damaged or broken in transit',
    'Significant quality defect not described in the listing',
    'Item does not match the product description',
    'Missing items from a multi-item order',
    'Counterfeit or misrepresented goods',
];

const BUYER_FAULT = [
    'Ordered the wrong size, colour, or variant by mistake',
    'Simply no longer need the item',
    'Perishable food items once received',
    'Opened personal care or cosmetic products',
    'Custom-sourced or specially ordered goods',
    'Item damaged by the buyer after delivery',
];

const FAQS = [
    {
        q: 'Do I contact the seller directly for a return?',
        a: 'Never. All return requests go through ShopZone exclusively. We investigate, mediate, and resolve every return on your behalf. Contacting a seller directly bypasses your protections and may void your return claim.',
    },
    {
        q: 'How long does a refund take to process?',
        a: 'Once the returned item is received and verified, refunds are processed within 3 to 7 business days. The time to reach your account depends on your payment method — M-Pesa is typically fastest.',
    },
    {
        q: 'What if my item was damaged during delivery?',
        a: 'Contact us immediately with photos of both the packaging and the damaged item. We file a claim with the courier and arrange either a replacement or full refund. Keep the original packaging — it helps the courier claim.',
    },
    {
        q: 'Can I return part of a bulk order?',
        a: 'If a specific item in a multi-item order is defective, wrong, or damaged, only that item is resolved — by replacement or refund — never the whole order. Bulk and wholesale-quantity listings such as full cartons, bales, or sacks are non-returnable for change-of-mind reasons, since restocking a full unit does not work the way restocking a single retail item does.',
    },
    {
        q: 'Will my refund come back as ShopZone credit?',
        a: 'No. Every refund ShopZone owes you is sent back to the exact M-Pesa number or bank account you originally paid from. ShopZone does not hold your refund as a platform balance or store credit for later withdrawal.',
    },
    {
        q: 'What happens if I miss the 7-day window?',
        a: 'Returns reported after 7 days are reviewed at ShopZone discretion. We may still assist in exceptional circumstances such as delayed delivery confirmation or hidden defects discovered later. Contact support and explain the situation.',
    },
    {
        q: 'Will I have to pay for return shipping?',
        a: 'For approved returns due to ShopZone or seller error — wrong item, damaged goods, quality defects — ShopZone covers return shipping. For returns due to buyer preference or change of mind where eligible, return shipping costs are discussed case by case.',
    },
];

// ── Main component ────────────────────────────────────────────────────────────
const ReturnsPolicyPage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    // Typewriter
    const line1 = 'Returns Policy.';
    const [typed, setTyped] = useState('');

    useEffect(() => { document.title = 'Returns Policy — ShopZone'; }, []);

    useEffect(() => {
        let i = 0;
        const t = setInterval(() => {
            setTyped(line1.slice(0, i + 1));
            i++;
            if (i >= line1.length) clearInterval(t);
        }, 80);
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

    return (
        <div className='rp-page'>

            {/* ══ HERO ═══════════════════════════════════════════════════════ */}
            <section className='rp-hero'>
                {particles.map((p, i) => <Particle key={i} style={p} />)}
                <div className='rp-hero__orb rp-hero__orb--1' aria-hidden='true' />
                <div className='rp-hero__orb rp-hero__orb--2' aria-hidden='true' />

                <div className='rp-hero__split'>
                    {/* Text */}
                    <div className='rp-hero__text'>
                        <div className='rp-hero__eyebrow'>
                            <FaBolt aria-hidden='true' /> Buyer Protection
                        </div>
                        <h1 className='rp-hero__title'>
                            Your Purchase<br />
                            <span className='rp-hero__title--accent'>
                                {typed}
                                <span className='rp-hero__cursor' aria-hidden='true'>|</span>
                            </span>
                        </h1>
                        <p className='rp-hero__subtitle'>
                            ShopZone stands behind every order. If something goes wrong,
                            we investigate, mediate, and resolve — no runaround, no finger-pointing.
                        </p>
                        <div className='rp-hero__badges'>
                            {['7-day return window', 'ShopZone mediates all disputes', 'Full refund or replacement'].map(b => (
                                <div key={b} className='rp-hero__badge'>
                                    <FaCheckCircle aria-hidden='true' /> {b}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Illustration */}
                    <div className='rp-hero__illustration' aria-hidden='true'>
                        <ReturnsIllustration />
                    </div>
                </div>

                <div className='rp-hero__scroll' aria-hidden='true'>
                    <div className='rp-hero__scroll-line' />
                </div>
            </section>

            {/* ══ STATS STRIP ════════════════════════════════════════════════ */}
            <div className='rp-stats-strip'>
                {[
                    { icon: FaClock, value: 7, suffix: ' days', label: 'Return window' },
                    { icon: FaShieldAlt, value: 24, suffix: 'hr', label: 'Review time' },
                    { icon: FaHandshake, value: 100, suffix: '%', label: 'ShopZone mediated' },
                    { icon: FaUndoAlt, value: 7, suffix: ' days', label: 'Refund processing' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Reveal key={stat.label} delay={i * 80}>
                            <div className='rp-stat'>
                                <div className='rp-stat__icon'><Icon aria-hidden='true' /></div>
                                <div className='rp-stat__number'><Counter target={stat.value} suffix={stat.suffix} /></div>
                                <div className='rp-stat__label'>{stat.label}</div>
                            </div>
                        </Reveal>
                    );
                })}
            </div>

            {/* ══ HOW RETURNS WORK ═══════════════════════════════════════════ */}
            <section className='rp-how'>
                <div className='rp-section__inner'>
                    <Reveal>
                        <div className='rp-section-header rp-section-header--light'>
                            <span className='rp-section-eyebrow rp-section-eyebrow--light'>Process</span>
                            <h2 className='rp-section-title rp-section-title--light'>
                                How the returns process works
                            </h2>
                            <p className='rp-section-sub rp-section-sub--light'>
                                Five clear steps from reporting an issue to receiving your resolution.
                                ShopZone handles every step on your behalf.
                            </p>
                        </div>
                    </Reveal>

                    <div className='rp-steps'>
                        {RETURN_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <Reveal key={step.title} delay={i * 100}>
                                    <div className='rp-step'>
                                        {i < RETURN_STEPS.length - 1 && (
                                            <div className='rp-step__line' aria-hidden='true' />
                                        )}
                                        <div className='rp-step__icon-wrap'>
                                            <Icon aria-hidden='true' />
                                            <span className='rp-step__number'>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <div className='rp-step__content'>
                                            <h3 className='rp-step__title'>{step.title}</h3>
                                            <p className='rp-step__desc'>{step.desc}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══ COVERED / NOT COVERED ══════════════════════════════════════ */}
            <section className='rp-coverage'>
                <div className='rp-section__inner'>
                    <Reveal>
                        <div className='rp-section-header'>
                            <span className='rp-section-eyebrow'>Eligibility</span>
                            <h2 className='rp-section-title'>What is and is not covered</h2>
                            <p className='rp-section-sub'>
                                ShopZone's returns policy is designed to protect buyers from genuine issues.
                                Please review what qualifies before submitting a return request.
                            </p>
                        </div>
                    </Reveal>

                <div className='rp-coverage__grid'>
                        {/* Seller or platform fault — free resolution (DEC-039) */}
                        <Reveal delay={0}>
                            <div className='rp-coverage-card rp-coverage-card--yes'>
                                <div className='rp-coverage-card__header'>
                                    <FaCheckCircle aria-hidden='true' />
                                    <h3>Seller or Platform Fault</h3>
                                </div>
                                <span className='rp-fault-badge rp-fault-badge--free'>
                                    Free resolution — ShopZone covers the cost
                                </span>
                                <ul className='rp-coverage-list'>
                                    {SELLER_FAULT.map(item => (
                                        <li key={item} className='rp-coverage-list__item'>
                                            <FaCheckCircle className='rp-coverage-list__icon rp-coverage-list__icon--yes' aria-hidden='true' />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className='rp-fault-card__footnote'>
                                    <FaMoneyBillWave aria-hidden='true' /> Refunds are always sent back to the
                                    original M-Pesa number or bank account you paid from.
                                </p>
                            </div>
                        </Reveal>

                        {/* Buyer's own selection or change of mind (DEC-039) */}
                        <Reveal delay={120}>
                            <div className='rp-coverage-card rp-coverage-card--buyer'>
                                <div className='rp-coverage-card__header'>
                                    <FaInfoCircle aria-hidden='true' />
                                    <h3>Your Own Selection or Change of Mind</h3>
                                </div>
                                <span className='rp-fault-badge rp-fault-badge--paid'>
                                    Buyer-paid where offered, or non-returnable
                                </span>
                                <ul className='rp-coverage-list'>
                                    {BUYER_FAULT.map(item => (
                                        <li key={item} className='rp-coverage-list__item'>
                                            <FaInfoCircle className='rp-coverage-list__icon rp-coverage-list__icon--buyer' aria-hidden='true' />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className='rp-fault-card__footnote rp-fault-card__footnote--bulk'>
                                    <FaBoxes aria-hidden='true' /> Bulk and wholesale orders — full cartons, bales,
                                    sacks — are non-returnable for change-of-mind reasons. The order was recorded
                                    and fulfilled exactly as placed.
                                </p>
                            </div>
                        </Reveal>
                    </div>

                    {/* Multi-item order disputes — line-item resolution (DEC-038) */}
                    <Reveal delay={160}>
                        <div className='rp-line-item-note'>
                            <FaLayerGroup className='rp-line-item-note__icon' aria-hidden='true' />
                            <div>
                                <p className='rp-line-item-note__title'>
                                    One faulty item never affects your whole order
                                </p>
                                <p className='rp-line-item-note__text'>
                                    If your order has several items and only one is wrong, damaged, or defective,
                                    only that item is resolved — by replacement or refund. The rest of your order
                                    is never returned, cancelled, or refunded because of a single item's problem.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Important note */}
                    <Reveal delay={220}>
                        <div className='rp-note'>
                            <FaExclamationTriangle className='rp-note__icon' aria-hidden='true' />
                            <p className='rp-note__text'>
                                <strong>Important:</strong> Never return goods without written confirmation from ShopZone.
                                Unauthorised returns cannot be tracked, verified, or refunded.
                                All return logistics are coordinated by our team.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ══ PROTECTION PROMISE ═════════════════════════════════════════ */}
            <section className='rp-promise'>
                <div className='rp-section__inner'>
                    <Reveal>
                        <div className='rp-promise-card'>
                            <div className='rp-promise-card__shape' aria-hidden='true' />
                            <div className='rp-promise-card__inner'>
                                <div className='rp-promise-card__icon-wrap'>
                                    <FaShieldAlt aria-hidden='true' />
                                </div>
                                <div className='rp-promise-card__text'>
                                    <h2 className='rp-promise-card__title'>
                                        The ShopZone Buyer Protection Promise
                                    </h2>
                                  <p className='rp-promise-card__body'>
                                        When you buy on ShopZone, you are never alone in a dispute.
                                        Unlike direct supplier markets where you take on all the risk,
                                        ShopZone is accountable for every transaction on this platform.
                                        We investigate every claim, we mediate every dispute, and we
                                        ensure every legitimate issue reaches a fair resolution.
                                        Your money is protected from the moment you pay to the moment
                                        your order is confirmed delivered and accepted. Any money owed
                                        back to you is always sent to the exact M-Pesa number or bank
                                        account you paid from — ShopZone never holds your refund as
                                        platform credit or a stored balance.
                                    </p>
                                    <div className='rp-promise-card__tags'>
                                        {[
                                            'ShopZone is accountable',
                                            'No direct seller contact needed',
                                            'Fair investigation every time',
                                            'Refund to your original payment method',
                                        ].map(t => (
                                            <span key={t} className='rp-promise-card__tag'>
                                                <FaCheckCircle aria-hidden='true' /> {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ══ FAQ ════════════════════════════════════════════════════════ */}
            <section className='rp-faq-section'>
                <div className='rp-section__inner rp-section__inner--narrow'>
                    <Reveal>
                        <div className='rp-section-header'>
                            <span className='rp-section-eyebrow'>Questions</span>
                            <h2 className='rp-section-title'>Returns FAQs</h2>
                        </div>
                    </Reveal>
                    <div className='rp-faq-list'>
                        {FAQS.map((faq, i) => (
                            <Reveal key={i} delay={i * 60}>
                                <AccordionItem
                                    question={faq.q}
                                    answer={faq.a}
                                    isOpen={openFaq === i}
                                    onToggle={() => setOpenFaq(prev => prev === i ? null : i)}
                                />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ CTA ════════════════════════════════════════════════════════ */}
            <Reveal>
                <div className='rp-cta'>
                    <div className='rp-cta__shape' aria-hidden='true' />
                    <div className='rp-cta__inner'>
                        <FaShieldAlt className='rp-cta__icon' aria-hidden='true' />
                        <div className='rp-cta__text'>
                            <h2 className='rp-cta__title'>Need to report an issue?</h2>
                            <p className='rp-cta__sub'>
                                Contact us within 7 days of delivery. We respond fast and
                                resolve every legitimate issue.
                            </p>
                        </div>
                        <div className='rp-cta__actions'>
                            <a
                                href='https://wa.me/254700000000'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='rp-cta__btn rp-cta__btn--wa'
                            >
                                <FaWhatsapp aria-hidden='true' /> WhatsApp Us
                            </a>
                            <a
                                href='mailto:support@shopzone.com'
                                className='rp-cta__btn rp-cta__btn--email'
                            >
                                <FaEnvelope aria-hidden='true' /> Email Support
                            </a>
                        </div>
                    </div>
                </div>
            </Reveal>

        </div>
    );
};

export default ReturnsPolicyPage;