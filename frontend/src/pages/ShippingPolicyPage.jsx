// frontend/src/pages/ShippingPolicyPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Shipping Policy page — full cinematic treatment.
// Features:
//   - Particles, orbs, typewriter hero
//   - Animated SVG truck that drives across the hero as the headline types
//   - Counting stats strip (47 counties, KES 300 base rate, 2 day average)
//   - Rate table section with county tiers
//   - How delivery works — animated timeline
//   - Tier 2 quote explainer
//   - FAQ accordion for shipping questions
//   - CTA strip
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import {
    FaTruck, FaBolt, FaCheckCircle, FaMapMarkerAlt,
    FaBoxOpen, FaClock, FaShieldAlt, FaChevronDown,
    FaEnvelope, FaWhatsapp, FaMoneyBillWave,
    FaPhoneAlt, FaExclamationTriangle,
} from 'react-icons/fa';
import './ShippingPolicyPage.css';

// ── Particle ──────────────────────────────────────────────────────────────────
const Particle = ({ style }) => (
    <div className='sp-particle' style={style} aria-hidden='true' />
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
            className={`sp-reveal ${visible ? 'sp-reveal--visible' : ''} ${className}`}
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

// ── SVG Truck illustration — drives across hero ───────────────────────────────
const TruckIllustration = () => (
    <svg
        className='sp-truck'
        viewBox='0 0 400 200'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
    >
        {/* Road */}
        <rect x='0' y='158' width='400' height='8' rx='4' fill='rgba(210,180,140,0.15)' />
        {/* Road dashes */}
        <rect x='20' y='160' width='30' height='3' rx='1.5' fill='rgba(210,180,140,0.25)' />
        <rect x='80' y='160' width='30' height='3' rx='1.5' fill='rgba(210,180,140,0.25)' />
        <rect x='140' y='160' width='30' height='3' rx='1.5' fill='rgba(210,180,140,0.25)' />
        <rect x='200' y='160' width='30' height='3' rx='1.5' fill='rgba(210,180,140,0.25)' />
        <rect x='260' y='160' width='30' height='3' rx='1.5' fill='rgba(210,180,140,0.25)' />
        <rect x='320' y='160' width='30' height='3' rx='1.5' fill='rgba(210,180,140,0.25)' />

        {/* Truck body group — animated to drive */}
        <g className='sp-truck-body'>
            {/* Main cargo body */}
            <rect x='60' y='90' width='160' height='62' rx='5' fill='rgba(210,180,140,0.2)' stroke='rgba(210,180,140,0.55)' strokeWidth='2' />
            {/* Cargo door lines */}
            <line x1='110' y1='90' x2='110' y2='152' stroke='rgba(210,180,140,0.35)' strokeWidth='1.5' strokeDasharray='4 3' />
            <line x1='160' y1='90' x2='160' y2='152' stroke='rgba(210,180,140,0.35)' strokeWidth='1.5' strokeDasharray='4 3' />
            {/* ShopZone logo box on cargo */}
            <rect x='72' y='108' width='30' height='18' rx='3' fill='rgba(210,180,140,0.12)' stroke='rgba(210,180,140,0.3)' strokeWidth='1' />
            <line x1='80' y1='114' x2='94' y2='114' stroke='rgba(210,180,140,0.5)' strokeWidth='1.5' strokeLinecap='round' />
            <line x1='80' y1='119' x2='90' y2='119' stroke='rgba(210,180,140,0.35)' strokeWidth='1' strokeLinecap='round' />

            {/* Cab */}
            <path d='M220 110 L220 152 L270 152 L270 120 L254 110 Z' fill='rgba(210,180,140,0.25)' stroke='rgba(210,180,140,0.55)' strokeWidth='2' strokeLinejoin='round' />
            {/* Cab window */}
            <path d='M228 118 L228 140 L256 140 L256 124 L244 118 Z' fill='rgba(210,180,140,0.18)' stroke='rgba(210,180,140,0.4)' strokeWidth='1.5' strokeLinejoin='round' />
            {/* Headlight */}
            <rect x='264' y='136' width='8' height='6' rx='2' fill='rgba(210,180,140,0.5)' />
            {/* Headlight beam */}
            <path d='M272 137 L290 132 M272 141 L290 144' stroke='rgba(210,180,140,0.2)' strokeWidth='1.5' strokeLinecap='round' />
            {/* Exhaust */}
            <rect x='62' y='85' width='5' height='12' rx='2' fill='rgba(210,180,140,0.3)' stroke='rgba(210,180,140,0.4)' strokeWidth='1' />

            {/* Wheels */}
            <circle cx='105' cy='155' r='14' fill='rgba(0,33,71,0.4)' stroke='rgba(210,180,140,0.5)' strokeWidth='2' />
            <circle cx='105' cy='155' r='7' fill='rgba(210,180,140,0.2)' stroke='rgba(210,180,140,0.4)' strokeWidth='1.5' />
            <circle cx='105' cy='155' r='2.5' fill='rgba(210,180,140,0.6)' />

            <circle cx='175' cy='155' r='14' fill='rgba(0,33,71,0.4)' stroke='rgba(210,180,140,0.5)' strokeWidth='2' />
            <circle cx='175' cy='155' r='7' fill='rgba(210,180,140,0.2)' stroke='rgba(210,180,140,0.4)' strokeWidth='1.5' />
            <circle cx='175' cy='155' r='2.5' fill='rgba(210,180,140,0.6)' />

            <circle cx='248' cy='155' r='14' fill='rgba(0,33,71,0.4)' stroke='rgba(210,180,140,0.5)' strokeWidth='2' />
            <circle cx='248' cy='155' r='7' fill='rgba(210,180,140,0.2)' stroke='rgba(210,180,140,0.4)' strokeWidth='1.5' />
            <circle cx='248' cy='155' r='2.5' fill='rgba(210,180,140,0.6)' />

            {/* Exhaust smoke puffs */}
            <circle cx='55' cy='80' r='5' fill='rgba(210,180,140,0.12)' className='sp-smoke-1' />
            <circle cx='46' cy='72' r='7' fill='rgba(210,180,140,0.09)' className='sp-smoke-2' />
            <circle cx='38' cy='62' r='9' fill='rgba(210,180,140,0.06)' className='sp-smoke-3' />
        </g>

        {/* Location pin — destination */}
        <g className='sp-pin'>
            <path d='M355 40 Q355 20 375 20 Q395 20 395 40 Q395 56 375 68 Q355 56 355 40 Z' fill='rgba(210,180,140,0.2)' stroke='rgba(210,180,140,0.5)' strokeWidth='1.5' />
            <circle cx='375' cy='40' r='7' fill='rgba(210,180,140,0.5)' />
            {/* Pin bounce line */}
            <line x1='375' y1='68' x2='375' y2='158' stroke='rgba(210,180,140,0.15)' strokeWidth='1' strokeDasharray='5 4' />
        </g>

        {/* Kenya map outline — very simplified */}
        <path
            d='M330 30 Q338 25 345 32 Q350 40 346 52 Q340 62 335 58 Q328 52 326 42 Q324 34 330 30 Z'
            fill='rgba(210,180,140,0.08)'
            stroke='rgba(210,180,140,0.2)'
            strokeWidth='1'
        />
    </svg>
);

// ── Shipping accordion item ───────────────────────────────────────────────────
const AccordionItem = ({ question, answer, isOpen, onToggle }) => {
    const contentRef = useRef(null);
    return (
        <div className={`sp-faq-item ${isOpen ? 'sp-faq-item--open' : ''}`}>
            <button className='sp-faq-item__trigger' onClick={onToggle} aria-expanded={isOpen}>
                <span className='sp-faq-item__question'>{question}</span>
                <FaChevronDown className={`sp-faq-item__chevron ${isOpen ? 'sp-faq-item__chevron--open' : ''}`} aria-hidden='true' />
            </button>
            <div
                className='sp-faq-item__body'
                ref={contentRef}
                style={{ maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0px' }}
            >
                <p className='sp-faq-item__answer'>{answer}</p>
            </div>
        </div>
    );
};

// ── Data ──────────────────────────────────────────────────────────────────────
const RATE_TIERS = [
    { zone: 'Nairobi & Environs', areas: 'CBD, Westlands, Eastlands, Karen, Ruiru, Juja, Thika, Kiambu, Limuru, Ngong, Kitengela', days: 'Same day or next day', base: 300 },
    { zone: 'Central & Eastern', areas: "Nyeri, Muranga, Kirinyaga, Embu, Meru, Machakos, Makueni, Kitui, Tharaka Nithi", days: '1–2 business days', base: 500 },
    { zone: 'Coast', areas: 'Mombasa, Kilifi, Kwale, Malindi, Lamu, Voi, Taita Taveta', days: '1–2 business days', base: 600 },
    { zone: 'Western & Nyanza', areas: 'Kisumu, Kisii, Kakamega, Bungoma, Busia, Vihiga, Siaya, Migori, Homa Bay, Nyamira, Bomet, Kericho', days: '1–2 business days', base: 600 },
    { zone: 'Rift Valley & North', areas: 'Nakuru, Eldoret, Narok, Kajiado, Nandi, Uasin Gishu, Trans Nzoia, Baringo, Laikipia, Samburu', days: '1–2 business days', base: 550 },
    { zone: 'North Eastern & Remote', areas: 'Garissa, Wajir, Mandera, Marsabit, Isiolo, Turkana, West Pokot, Tana River', days: '3–5 business days', base: 800, note: 'Contact support for arrangements' },
];

const STEPS = [
    { icon: FaBoxOpen, title: 'Order placed', desc: 'Your order is confirmed and enters our processing queue immediately after payment.' },
    { icon: FaCheckCircle, title: 'Verified & packed', desc: 'Our team verifies stock, quality checks the items, and packs your order securely.' },
    { icon: FaTruck, title: 'Handed to courier', desc: 'Your package is handed to our courier partner — G4S, Fargo, or a trusted bus parcel service.' },
    { icon: FaMapMarkerAlt, title: 'In transit', desc: 'Your package travels to your county. You can track status in your ShopZone order history.' },
    { icon: FaCheckCircle, title: 'Delivered', desc: 'Package arrives at your address. Order marked delivered. Contact us within 7 days if there is any issue.' },
];

const FAQS = [
    { q: 'Can I pick up my order instead of having it delivered?', a: 'Yes. Pickup arrangements are available in Nairobi. Contact support@shopzone.com before placing your order to arrange a pickup point and time.' },
    { q: 'What happens if my package is damaged during delivery?', a: 'Contact ShopZone within 7 days of delivery with photos of the damage. We investigate with the courier and arrange a replacement or refund where applicable. Do not return the package without contacting us first.' },
    { q: 'Can I change my delivery address after ordering?', a: 'Address changes can be accommodated if the order has not yet been dispatched. Contact us immediately at +254 700 000 000 or support@shopzone.com with your order number.' },
    { q: 'Do you deliver on weekends?', a: 'Our courier partners operate on Saturdays for most routes. Sunday deliveries are not guaranteed. For urgent weekend deliveries, contact support in advance.' },
    { q: 'What is the maximum weight for standard shipping?', a: 'Standard shipping handles most orders up to approximately 30kg per parcel. Orders heavier than this, or oversized bulk goods, are handled through our Tier 2 delivery quote system.' },
    { q: 'How is shipping calculated for multiple items?', a: 'Shipping is calculated on the combined weight of your entire order, not per item. The total weight determines which rate band applies. You see the full shipping cost at checkout before confirming payment.' },
];

// ── Main component ────────────────────────────────────────────────────────────
const ShippingPolicyPage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    // Typewriter
    const line1 = 'Shipping Policy.';
    const [typed, setTyped] = useState('');
    const [truckStarted, setTruckStarted] = useState(false);

    useEffect(() => { document.title = 'Shipping Policy — ShopZone'; }, []);

    useEffect(() => {
        // Start truck immediately
        setTruckStarted(true);
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
        <div className='sp-page'>

            {/* ══ HERO ═══════════════════════════════════════════════════════ */}
            <section className='sp-hero'>
                {particles.map((p, i) => <Particle key={i} style={p} />)}
                <div className='sp-hero__orb sp-hero__orb--1' aria-hidden='true' />
                <div className='sp-hero__orb sp-hero__orb--2' aria-hidden='true' />

                <div className='sp-hero__split'>
                    {/* Text */}
                    <div className='sp-hero__text'>
                        <div className='sp-hero__eyebrow'>
                            <FaBolt aria-hidden='true' /> Delivery Information
                        </div>
                        <h1 className='sp-hero__title'>
                            We Deliver<br />
                            <span className='sp-hero__title--accent'>
                                {typed}
                                <span className='sp-hero__cursor' aria-hidden='true'>|</span>
                            </span>
                        </h1>
                        <p className='sp-hero__subtitle'>
                            ShopZone delivers to all 47 counties in Kenya. Transparent rates,
                            reliable couriers, and real-time order tracking through your account.
                        </p>
                        <div className='sp-hero__badges'>
                            {['All 47 counties', 'Tracked deliveries', 'Same-day Nairobi'].map(b => (
                                <div key={b} className='sp-hero__badge'>
                                    <FaCheckCircle aria-hidden='true' /> {b}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Truck illustration */}
                    <div className={`sp-hero__truck-wrap ${truckStarted ? 'sp-hero__truck-wrap--driving' : ''}`} aria-hidden='true'>
                        <TruckIllustration />
                    </div>
                </div>

                <div className='sp-hero__scroll' aria-hidden='true'>
                    <div className='sp-hero__scroll-line' />
                </div>
            </section>

            {/* ══ STATS STRIP ════════════════════════════════════════════════ */}
            <div className='sp-stats-strip'>
                {[
                    { icon: FaMapMarkerAlt, value: 47, suffix: '', label: 'Counties covered' },
                    { icon: FaMoneyBillWave, value: 300, suffix: ' KES', label: 'Base shipping rate' },
                    { icon: FaClock, value: 2, suffix: ' days', label: 'Average delivery' },
                    { icon: FaShieldAlt, value: 100, suffix: '%', label: 'Insured shipments' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Reveal key={stat.label} delay={i * 80}>
                            <div className='sp-stat'>
                                <div className='sp-stat__icon'><Icon aria-hidden='true' /></div>
                                <div className='sp-stat__number'><Counter target={stat.value} suffix={stat.suffix} /></div>
                                <div className='sp-stat__label'>{stat.label}</div>
                            </div>
                        </Reveal>
                    );
                })}
            </div>

            {/* ══ STANDARD RATES ═════════════════════════════════════════════ */}
            <section className='sp-section'>
                <div className='sp-section__inner'>
                    <Reveal>
                        <div className='sp-section-header'>
                            <span className='sp-section-eyebrow'>Pricing</span>
                            <h2 className='sp-section-title'>Standard shipping rates</h2>
                            <p className='sp-section-sub'>
                                Base rate is KES 300 for up to 5kg. Each additional kilogram costs KES 100.
                                Rates below reflect the base charge per zone.
                            </p>
                        </div>
                    </Reveal>

                    <div className='sp-rate-grid'>
                        {RATE_TIERS.map((tier, i) => (
                            <Reveal key={tier.zone} delay={i * 70}>
                                <div className='sp-rate-card'>
                                    <div className='sp-rate-card__header'>
                                        <FaMapMarkerAlt className='sp-rate-card__icon' aria-hidden='true' />
                                        <h3 className='sp-rate-card__zone'>{tier.zone}</h3>
                                    </div>
                                    <p className='sp-rate-card__areas'>{tier.areas}</p>
                                    <div className='sp-rate-card__footer'>
                                        <div className='sp-rate-card__price'>
                                            KES {tier.base.toLocaleString()}
                                            <span>base</span>
                                        </div>
                                        <div className='sp-rate-card__days'>
                                            <FaClock aria-hidden='true' />
                                            {tier.days}
                                        </div>
                                    </div>
                                    {tier.note && (
                                        <div className='sp-rate-card__note'>
                                            <FaExclamationTriangle aria-hidden='true' /> {tier.note}
                                        </div>
                                    )}
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    {/* Weight calculation example */}
                    <Reveal delay={200}>
                        <div className='sp-weight-box'>
                            <div className='sp-weight-box__header'>
                                <FaBoxOpen aria-hidden='true' /> How weight is calculated
                            </div>
                            <div className='sp-weight-examples'>
                                {[
                                    { weight: '5kg order', price: 'KES 300' },
                                    { weight: '8kg order', price: 'KES 600' },
                                    { weight: '12kg order', price: 'KES 1,000' },
                                    { weight: '20kg order', price: 'KES 1,800' },
                                ].map(ex => (
                                    <div key={ex.weight} className='sp-weight-example'>
                                        <span>{ex.weight}</span>
                                        <strong>{ex.price}</strong>
                                    </div>
                                ))}
                            </div>
                            <p className='sp-weight-box__note'>
                                Shipping is calculated on the combined weight of your full order at checkout.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ══ HOW DELIVERY WORKS ═════════════════════════════════════════ */}
            <section className='sp-how'>
                <div className='sp-section__inner'>
                    <Reveal>
                        <div className='sp-section-header sp-section-header--light'>
                            <span className='sp-section-eyebrow sp-section-eyebrow--light'>Process</span>
                            <h2 className='sp-section-title sp-section-title--light'>How your order gets to you</h2>
                            <p className='sp-section-sub sp-section-sub--light'>
                                From the moment you place your order to the moment it arrives at your door.
                            </p>
                        </div>
                    </Reveal>

                    <div className='sp-steps'>
                        {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <Reveal key={step.title} delay={i * 100}>
                                    <div className='sp-step'>
                                        {i < STEPS.length - 1 && <div className='sp-step__line' aria-hidden='true' />}
                                        <div className='sp-step__icon-wrap'>
                                            <Icon aria-hidden='true' />
                                            <span className='sp-step__number'>{String(i + 1).padStart(2, '0')}</span>
                                        </div>
                                        <div className='sp-step__content'>
                                            <h3 className='sp-step__title'>{step.title}</h3>
                                            <p className='sp-step__desc'>{step.desc}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══ TIER 2 EXPLAINER ═══════════════════════════════════════════ */}
            <section className='sp-section'>
                <div className='sp-section__inner'>
                    <Reveal>
                        <div className='sp-tier2-card'>
                            <div className='sp-tier2-card__shape' aria-hidden='true' />
                            <div className='sp-tier2-card__inner'>
                                <div className='sp-tier2-card__icon-wrap'>
                                    <FaTruck aria-hidden='true' />
                                </div>
                                <div className='sp-tier2-card__text'>
                                    <h2 className='sp-tier2-card__title'>Tier 2 Delivery Quotes</h2>
                                    <p className='sp-tier2-card__body'>
                                        For bulk, heavy, or oversized orders where standard rates do not apply,
                                        ShopZone generates a custom Tier 2 delivery quote after your order is placed.
                                        You are notified by email and in your order dashboard. You can approve the quote,
                                        reject it, or contact us to negotiate — your order only processes once you accept.
                                        This protects you from unexpected costs on large shipments.
                                    </p>
                                    <div className='sp-tier2-card__tags'>
                                        {['No surprise charges', 'Full approval control', 'Negotiate before paying'].map(t => (
                                            <span key={t} className='sp-tier2-card__tag'>
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

            {/* ══ COURIER PARTNERS ═══════════════════════════════════════════ */}
            <section className='sp-couriers'>
                <div className='sp-section__inner'>
                    <Reveal>
                        <div className='sp-section-header'>
                            <span className='sp-section-eyebrow'>Partners</span>
                            <h2 className='sp-section-title'>Our courier partners</h2>
                            <p className='sp-section-sub'>ShopZone selects the best courier for your location, package size, and urgency.</p>
                        </div>
                    </Reveal>
                    <div className='sp-courier-grid'>
                        {[
                            { name: 'G4S', desc: 'Nationwide secure parcel delivery with real tracking and signature confirmation.' },
                            { name: 'Fargo', desc: 'Fast inter-county delivery with reliable coverage across major towns and routes.' },
                            { name: 'Bus Parcels', desc: 'Trusted for remote county routes where courier networks have limited coverage.' },
                        ].map((c, i) => (
                            <Reveal key={c.name} delay={i * 80}>
                                <div className='sp-courier-card'>
                                    <div className='sp-courier-card__name'>{c.name}</div>
                                    <p className='sp-courier-card__desc'>{c.desc}</p>
                                    <div className='sp-courier-card__badge'>
                                        <FaShieldAlt aria-hidden='true' /> ShopZone verified
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FAQ ════════════════════════════════════════════════════════ */}
            <section className='sp-section'>
                <div className='sp-section__inner sp-section__inner--narrow'>
                    <Reveal>
                        <div className='sp-section-header'>
                            <span className='sp-section-eyebrow'>Questions</span>
                            <h2 className='sp-section-title'>Shipping FAQs</h2>
                        </div>
                    </Reveal>
                    <div className='sp-faq-list'>
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
                <div className='sp-cta'>
                    <div className='sp-cta__shape' aria-hidden='true' />
                    <div className='sp-cta__inner'>
                        <FaTruck className='sp-cta__icon' aria-hidden='true' />
                        <div className='sp-cta__text'>
                            <h2 className='sp-cta__title'>Questions about your delivery?</h2>
                            <p className='sp-cta__sub'>Our support team tracks every order and resolves delivery issues fast.</p>
                        </div>
                        <div className='sp-cta__actions'>
                            <a href='https://wa.me/254700000000' target='_blank' rel='noopener noreferrer' className='sp-cta__btn sp-cta__btn--wa'>
                                <FaWhatsapp aria-hidden='true' /> WhatsApp
                            </a>
                            <a href='mailto:support@shopzone.com' className='sp-cta__btn sp-cta__btn--email'>
                                <FaEnvelope aria-hidden='true' /> Email Us
                            </a>
                        </div>
                    </div>
                </div>
            </Reveal>

        </div>
    );
};

export default ShippingPolicyPage;