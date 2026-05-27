// frontend/src/pages/BulkOrdersPage.jsx
// ─────────────────────────────────────────────────────────────
// Landing page for wholesale buyers who want to place large
// volume orders or source goods not listed on the platform.
//
// Explains the ShopZone quoting process, builds trust, and
// collects a structured enquiry form.
//
// No backend yet — form shows a success state on submit.
// Step 8 (Manual RFQ Flow) will wire this to a real API.
//
// Design: full cinematic system — particles, typewriter hero,
// stats strip, scroll-reveal sections, Oxford Blue dark cards,
// CTA strip at bottom.
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    FaBoxOpen, FaTruck, FaShieldAlt, FaHandshake,
    FaClipboardList, FaSearch, FaFileInvoiceDollar,
    FaCheckCircle, FaChevronDown, FaArrowRight,
    FaWhatsapp, FaEnvelope,
} from 'react-icons/fa';
import './BulkOrdersPage.css';

// ── Kenyan counties for the shipping/delivery dropdown ────────
const COUNTIES = [
    'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika',
    'Malindi','Kitale','Garissa','Kakamega','Nyeri','Meru',
    'Kisii','Machakos','Kilifi','Uasin Gishu','Kirinyaga',
    'Murang\'a','Kiambu','Kajiado','Laikipia','Samburu',
    'Trans Nzoia','West Pokot','Siaya','Vihiga','Bungoma',
    'Busia','Migori','Homa Bay','Nyamira','Kericho','Bomet',
    'Narok','Nyandarua','Nandi','Baringo','Elgeyo-Marakwet',
    'Turkana','Marsabit','Isiolo','Tharaka-Nithi','Embu',
    'Kitui','Makueni','Taita Taveta','Kwale','Tana River',
    'Lamu','Mandera','Wajir',
];

// ── How the process works — 4-step timeline ───────────────────
const STEPS = [
    {
        number: '01',
        icon: <FaClipboardList />,
        title: 'Submit Your Request',
        desc: 'Fill in the enquiry form below with your item, quantity, budget, and delivery county. No account needed to start.',
    },
    {
        number: '02',
        icon: <FaSearch />,
        title: 'We Source For You',
        desc: 'ShopZone contacts verified wholesale suppliers on your behalf. You never deal with suppliers directly.',
    },
    {
        number: '03',
        icon: <FaFileInvoiceDollar />,
        title: 'Receive a Quote',
        desc: 'We send you a ShopZone-branded quote with pricing, lead time, and delivery estimate. No hidden charges.',
    },
    {
        number: '04',
        icon: <FaCheckCircle />,
        title: 'Confirm and Deliver',
        desc: 'Approve the quote, pay securely through ShopZone, and we handle the rest through to your door.',
    },
];

// ── Why use ShopZone for bulk — trust cards ───────────────────
const TRUST_CARDS = [
    {
        icon: <FaShieldAlt />,
        title: 'Verified Suppliers Only',
        desc: 'Every supplier is vetted before they can fulfil orders. You never take a risk on an unknown trader.',
    },
    {
        icon: <FaTruck />,
        title: 'Nationwide Delivery',
        desc: 'We deliver to all 47 counties in Kenya. Remote areas handled via Tier 2 logistics partnerships.',
    },
    {
        icon: <FaHandshake />,
        title: 'No Direct Supplier Contact',
        desc: 'ShopZone manages every conversation. No chasing, no negotiating, no risk of being ghosted.',
    },
    {
        icon: <FaBoxOpen />,
        title: 'Any Volume, Any Category',
        desc: 'From 10 cartons to 10,000 units. Electronics, FMCG, textiles, hardware, food — we source it.',
    },
];

// ── Budget range options ───────────────────────────────────────
const BUDGET_RANGES = [
    'Under KES 50,000',
    'KES 50,000 – 200,000',
    'KES 200,000 – 500,000',
    'KES 500,000 – 1,000,000',
    'Over KES 1,000,000',
    'Open to quote',
];

// ── Unit type options ──────────────────────────────────────────
const UNIT_TYPES = [
    'Cartons', 'Pieces', 'Kilograms', 'Litres',
    'Bales', 'Bags', 'Pallets', 'Rolls', 'Other',
];

// ─────────────────────────────────────────────────────────────
const BulkOrdersPage = () => {

    // ── Typewriter state — hero accent line ───────────────────
    const [typed, setTyped]   = useState('');
    const [tw, setTw]         = useState(false);   // typewriter done
    const TARGET = 'Source Big. Pay Once. Delivered.';

    // ── Stats strip — count-up on first viewport entry ────────
    const statsRef  = useRef(null);
    const [counted, setCounted] = useState(false);
    const [counts, setCounts]   = useState({ orders: 0, counties: 0, suppliers: 0, saved: 0 });

    // ── Scroll reveal — sections ──────────────────────────────
    const revealRefs = useRef([]);

    // ── Form state ────────────────────────────────────────────
    const [form, setForm] = useState({
        name: '', business: '', item: '', quantity: '',
        unitType: '', county: '', budget: '', notes: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState('');

    // ── Particle data — generated once ───────────────────────
    const [particles] = useState(() =>
        Array.from({ length: 28 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 6,
            duration: 6 + Math.random() * 6,
            size: 2 + Math.random() * 3,
        }))
    );

    // ── Page title ────────────────────────────────────────────
    useEffect(() => { document.title = 'Bulk Orders | ShopZone Wholesale'; }, []);

    // ── Typewriter effect — runs once on mount ────────────────
    useEffect(() => {
        let i = 0;
        const id = setInterval(() => {
            setTyped(TARGET.slice(0, i + 1));
            i++;
            if (i >= TARGET.length) { clearInterval(id); setTw(true); }
        }, 55);
        return () => clearInterval(id);
    }, []);

    // ── Stats count-up — fires once on first entry ────────────
    useEffect(() => {
        const el = statsRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting || counted) return;
            setCounted(true);
            const targets = { orders: 1200, counties: 47, suppliers: 80, saved: 35 };
            const duration = 1800;
            const steps = 60;
            const interval = duration / steps;
            let step = 0;
            const id = setInterval(() => {
                step++;
                const progress = step / steps;
                setCounts({
                    orders:    Math.round(targets.orders    * progress),
                    counties:  Math.round(targets.counties  * progress),
                    suppliers: Math.round(targets.suppliers * progress),
                    saved:     Math.round(targets.saved     * progress),
                });
                if (step >= steps) {
                    clearInterval(id);
                    setCounts(targets);
                }
            }, interval);
        }, { threshold: 0.3 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [counted]);

    // ── Scroll reveal — observes all reveal sections ──────────
    useEffect(() => {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.12 });
        revealRefs.current.forEach(el => el && obs.observe(el));
        return () => obs.disconnect();
    }, []);

    // Helper — push a ref into the reveal list
    const addReveal = (el) => {
        if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
    };

    // ── Form handlers ─────────────────────────────────────────
    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation — required fields
        if (!form.name || !form.item || !form.quantity || !form.unitType || !form.county) {
            setFormError('Please fill in all required fields.');
            return;
        }
        // Step 8 will POST to /api/rfq — for now just show success
        setSubmitted(true);
    };

    // ─────────────────────────────────────────────────────────
    return (
        <div className='bulk-page'>

            {/* ════════════════════════════════════════════════
                HERO — Oxford Blue, particles, typewriter
            ════════════════════════════════════════════════ */}
            <section className='bulk-hero'>

                {/* Floating particle dots */}
                <div className='bulk-particles' aria-hidden='true'>
                    {particles.map(p => (
                        <span
                            key={p.id}
                            className='bulk-particle'
                            style={{
                                left: `${p.left}%`,
                                animationDelay: `${p.delay}s`,
                                animationDuration: `${p.duration}s`,
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                            }}
                        />
                    ))}
                </div>

                {/* Background orbs */}
                <div className='bulk-orb bulk-orb--1' aria-hidden='true' />
                <div className='bulk-orb bulk-orb--2' aria-hidden='true' />

                <div className='bulk-hero-inner'>

                    {/* Left — text content */}
                    <div className='bulk-hero-text'>
                        <span className='bulk-eyebrow'>Wholesale Sourcing</span>
                        <h1 className='bulk-hero-title'>
                            Request Goods.<br />
                            <span className='bulk-hero-accent'>
                                {typed}
                                {!tw && <span className='bulk-cursor' aria-hidden='true'>|</span>}
                            </span>
                        </h1>
                        <p className='bulk-hero-subtitle'>
                            Can't find what you need? Tell us what you want, how much you need,
                            and where you are. ShopZone sources it, quotes it, and delivers it —
                            without you ever speaking to a supplier.
                        </p>

                        {/* Trust badges */}
                        <div className='bulk-badges'>
                            <span className='bulk-badge'><FaShieldAlt aria-hidden='true' /> Verified Suppliers</span>
                            <span className='bulk-badge'><FaTruck aria-hidden='true' /> All 47 Counties</span>
                            <span className='bulk-badge'><FaHandshake aria-hidden='true' /> No Direct Contact</span>
                        </div>
                    </div>

                    {/* Right — SVG illustration (hidden on mobile) */}
                    <div className='bulk-hero-illustration' aria-hidden='true'>
                        <svg viewBox='0 0 340 300' xmlns='http://www.w3.org/2000/svg'>
                            {/* Warehouse/pallet stack illustration */}
                            <rect x='40' y='200' width='260' height='12' rx='4' fill='#D2B48C' opacity='0.4'/>
                            {/* Pallet 1 */}
                            <rect x='60' y='150' width='90' height='55' rx='6' fill='#D2B48C' opacity='0.18'/>
                            <rect x='65' y='155' width='80' height='18' rx='3' fill='#D2B48C' opacity='0.5'/>
                            <rect x='65' y='177' width='80' height='18' rx='3' fill='#D2B48C' opacity='0.35'/>
                            {/* Pallet 2 */}
                            <rect x='180' y='130' width='90' height='75' rx='6' fill='#D2B48C' opacity='0.18'/>
                            <rect x='185' y='135' width='80' height='18' rx='3' fill='#D2B48C' opacity='0.5'/>
                            <rect x='185' y='157' width='80' height='18' rx='3' fill='#D2B48C' opacity='0.35'/>
                            <rect x='185' y='179' width='80' height='18' rx='3' fill='#D2B48C' opacity='0.22'/>
                            {/* Delivery truck outline */}
                            <rect x='80' y='80' width='130' height='65' rx='8' fill='none' stroke='#D2B48C' strokeWidth='2.5' opacity='0.6'/>
                            <rect x='210' y='90' width='55' height='45' rx='6' fill='none' stroke='#D2B48C' strokeWidth='2' opacity='0.5'/>
                            <circle cx='110' cy='148' r='10' fill='none' stroke='#D2B48C' strokeWidth='2.5' opacity='0.7'/>
                            <circle cx='240' cy='148' r='10' fill='none' stroke='#D2B48C' strokeWidth='2.5' opacity='0.7'/>
                            {/* Arrow / motion lines */}
                            <line x1='50' y1='100' x2='75' y2='100' stroke='#D2B48C' strokeWidth='2' opacity='0.4' strokeDasharray='4 3'/>
                            <line x1='50' y1='112' x2='75' y2='112' stroke='#D2B48C' strokeWidth='2' opacity='0.3' strokeDasharray='4 3'/>
                            {/* Check circle — confirmed */}
                            <circle cx='170' cy='45' r='22' fill='none' stroke='#D2B48C' strokeWidth='2.5' opacity='0.6'/>
                            <polyline points='160,45 167,53 182,37' fill='none' stroke='#D2B48C' strokeWidth='2.5' opacity='0.8' strokeLinecap='round'/>
                        </svg>
                    </div>

                </div>
            </section>

            {/* ════════════════════════════════════════════════
                STATS STRIP
            ════════════════════════════════════════════════ */}
            <section className='bulk-stats' ref={statsRef}>
                <div className='bulk-stats-inner'>
                    <div className='bulk-stat'>
                        <span className='bulk-stat-number'>{counts.orders.toLocaleString()}+</span>
                        <span className='bulk-stat-label'>Bulk Orders Fulfilled</span>
                    </div>
                    <div className='bulk-stat'>
                        <span className='bulk-stat-number'>{counts.counties}</span>
                        <span className='bulk-stat-label'>Counties Served</span>
                    </div>
                    <div className='bulk-stat'>
                        <span className='bulk-stat-number'>{counts.suppliers}+</span>
                        <span className='bulk-stat-label'>Verified Suppliers</span>
                    </div>
                    <div className='bulk-stat'>
                        <span className='bulk-stat-number'>{counts.saved}%</span>
                        <span className='bulk-stat-label'>Avg. Savings vs Retail</span>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
                HOW IT WORKS — 4-step process
            ════════════════════════════════════════════════ */}
            <section className='bulk-section bulk-how' ref={addReveal}>
                <div className='bulk-section-inner'>
                    <span className='bulk-eyebrow-section'>The Process</span>
                    <h2 className='bulk-section-title'>How Bulk Ordering Works</h2>
                    <p className='bulk-section-sub'>
                        Four steps from enquiry to delivery. ShopZone handles everything in between.
                    </p>
                    <div className='bulk-steps-grid'>
                        {STEPS.map((step, i) => (
                            <div className='bulk-step-card' key={i} ref={addReveal}>
                                <div className='bulk-step-number'>{step.number}</div>
                                <div className='bulk-step-icon' aria-hidden='true'>{step.icon}</div>
                                <h3 className='bulk-step-title'>{step.title}</h3>
                                <p className='bulk-step-desc'>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
                TRUST CARDS — why use ShopZone for bulk
            ════════════════════════════════════════════════ */}
            <section className='bulk-section bulk-trust-section' ref={addReveal}>
                <div className='bulk-section-inner'>
                    <span className='bulk-eyebrow-section'>Why ShopZone</span>
                    <h2 className='bulk-section-title'>Built for Serious Buyers</h2>
                    <div className='bulk-trust-grid'>
                        {TRUST_CARDS.map((card, i) => (
                            <div className='bulk-trust-card' key={i} ref={addReveal}>
                                <div className='bulk-trust-icon' aria-hidden='true'>{card.icon}</div>
                                <h3 className='bulk-trust-title'>{card.title}</h3>
                                <p className='bulk-trust-desc'>{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════
                ENQUIRY FORM — submit a bulk request
            ════════════════════════════════════════════════ */}
            <section className='bulk-section bulk-form-section' id='enquiry-form' ref={addReveal}>
                <div className='bulk-section-inner'>
                    <span className='bulk-eyebrow-section'>Get a Quote</span>
                    <h2 className='bulk-section-title'>Submit Your Bulk Enquiry</h2>
                    <p className='bulk-section-sub'>
                        Tell us what you need. Our sourcing team will come back to you within 24 hours.
                    </p>

                    {submitted ? (
                        /* ── Success state ──────────────────────────── */
                        <div className='bulk-success'>
                            <FaCheckCircle className='bulk-success-icon' aria-hidden='true' />
                            <h3 className='bulk-success-title'>Enquiry Received!</h3>
                            <p className='bulk-success-msg'>
                                Thank you. Our sourcing team will review your request and get back to
                                you within 24 hours. Check your email for a confirmation.
                            </p>
                            <button
                                className='bulk-success-reset'
                                onClick={() => { setSubmitted(false); setForm({ name:'',business:'',item:'',quantity:'',unitType:'',county:'',budget:'',notes:'' }); }}
                            >
                                Submit Another Request
                            </button>
                        </div>
                    ) : (
                        /* ── Enquiry form ───────────────────────────── */
                        <form className='bulk-form' onSubmit={handleSubmit} noValidate>

                            {/* Row 1 — name + business */}
                            <div className='bulk-form-row'>
                                <div className='bulk-form-group'>
                                    <label className='bulk-label' htmlFor='bulk-name'>
                                        Your Name <span className='bulk-required'>*</span>
                                    </label>
                                    <input
                                        id='bulk-name'
                                        className='bulk-input'
                                        type='text'
                                        name='name'
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder='e.g. Jane Mwangi'
                                        autoComplete='name'
                                    />
                                </div>
                                <div className='bulk-form-group'>
                                    <label className='bulk-label' htmlFor='bulk-business'>
                                        Business / Shop Name
                                    </label>
                                    <input
                                        id='bulk-business'
                                        className='bulk-input'
                                        type='text'
                                        name='business'
                                        value={form.business}
                                        onChange={handleChange}
                                        placeholder='e.g. Mwangi General Store'
                                        autoComplete='organization'
                                    />
                                </div>
                            </div>

                            {/* Row 2 — item description */}
                            <div className='bulk-form-group'>
                                <label className='bulk-label' htmlFor='bulk-item'>
                                    What do you need? <span className='bulk-required'>*</span>
                                </label>
                                <input
                                    id='bulk-item'
                                    className='bulk-input'
                                    type='text'
                                    name='item'
                                    value={form.item}
                                    onChange={handleChange}
                                    placeholder='e.g. Unilever Sunlight Dishwashing Liquid 500ml'
                                />
                            </div>

                            {/* Row 3 — quantity + unit type */}
                            <div className='bulk-form-row'>
                                <div className='bulk-form-group'>
                                    <label className='bulk-label' htmlFor='bulk-quantity'>
                                        Quantity <span className='bulk-required'>*</span>
                                    </label>
                                    <input
                                        id='bulk-quantity'
                                        className='bulk-input'
                                        type='number'
                                        name='quantity'
                                        value={form.quantity}
                                        onChange={handleChange}
                                        min='1'
                                        placeholder='e.g. 50'
                                    />
                                </div>
                                <div className='bulk-form-group'>
                                    <label className='bulk-label' htmlFor='bulk-unit'>
                                        Unit Type <span className='bulk-required'>*</span>
                                    </label>
                                    <select
                                        id='bulk-unit'
                                        className='bulk-input bulk-select'
                                        name='unitType'
                                        value={form.unitType}
                                        onChange={handleChange}
                                    >
                                        <option value=''>Select unit</option>
                                        {UNIT_TYPES.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 4 — county + budget */}
                            <div className='bulk-form-row'>
                                <div className='bulk-form-group'>
                                    <label className='bulk-label' htmlFor='bulk-county'>
                                        Delivery County <span className='bulk-required'>*</span>
                                    </label>
                                    <select
                                        id='bulk-county'
                                        className='bulk-input bulk-select'
                                        name='county'
                                        value={form.county}
                                        onChange={handleChange}
                                    >
                                        <option value=''>Select county</option>
                                        {COUNTIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className='bulk-form-group'>
                                    <label className='bulk-label' htmlFor='bulk-budget'>
                                        Budget Range
                                    </label>
                                    <select
                                        id='bulk-budget'
                                        className='bulk-input bulk-select'
                                        name='budget'
                                        value={form.budget}
                                        onChange={handleChange}
                                    >
                                        <option value=''>Select budget</option>
                                        {BUDGET_RANGES.map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 5 — notes */}
                            <div className='bulk-form-group'>
                                <label className='bulk-label' htmlFor='bulk-notes'>
                                    Additional Notes
                                </label>
                                <textarea
                                    id='bulk-notes'
                                    className='bulk-input bulk-textarea'
                                    name='notes'
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder='Brands you prefer, delivery urgency, special packaging requirements, etc.'
                                />
                            </div>

                            {/* Inline error */}
                            {formError && (
                                <p className='bulk-form-error' role='alert'>{formError}</p>
                            )}

                            <button type='submit' className='bulk-submit-btn'>
                                Submit Enquiry <FaArrowRight aria-hidden='true' />
                            </button>
                        </form>
                    )}
                </div>
            </section>

            {/* ════════════════════════════════════════════════
                CTA STRIP — bottom
            ════════════════════════════════════════════════ */}
            <section className='bulk-cta' ref={addReveal}>
                <div className='bulk-cta-orb' aria-hidden='true' />
                <div className='bulk-cta-inner'>
                    <h2 className='bulk-cta-title'>Already know what you want?</h2>
                    <p className='bulk-cta-sub'>
                        Browse our live catalogue and add to cart directly. Bulk pricing applies at checkout for qualifying quantities.
                    </p>
                    <Link to='/' className='bulk-cta-btn'>
                        Browse Products <FaArrowRight aria-hidden='true' />
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default BulkOrdersPage;