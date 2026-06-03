// frontend/src/pages/ContactPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Contact Support page — full BecomeSellerPage cinematic treatment.
// Features: particles, typewriter hero, SVG drawing, counting stats,
// topic cards, split form layout, scroll reveals.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    FaHeadset, FaShoppingBag, FaBoxOpen, FaStore,
    FaEnvelope, FaWhatsapp, FaPhone, FaClock,
    FaPaperPlane, FaBolt, FaCheckCircle,
    FaMapMarkerAlt, FaChevronRight, FaUsers, FaTruck,
} from 'react-icons/fa';
import './ContactPage.css';

// ── Particle ──────────────────────────────────────────────────────────────────
const Particle = ({ style }) => (
    <div className='contact-particle' style={style} aria-hidden='true' />
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
            className={`contact-reveal ${visible ? 'contact-reveal--visible' : ''} ${className}`}
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

// ── SVG Support illustration ──────────────────────────────────────────────────
const SupportIllustration = () => (
    <svg
        className='contact-illustration'
        viewBox='0 0 340 300'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
    >
        {/* Background circle */}
        <circle cx='170' cy='150' r='110' fill='rgba(210,180,140,0.06)' stroke='rgba(210,180,140,0.15)' strokeWidth='1.5' />
        <circle cx='170' cy='150' r='75' fill='rgba(210,180,140,0.05)' stroke='rgba(210,180,140,0.1)' strokeWidth='1' />

        {/* Headset body */}
        <path d='M120 140 Q120 100 170 100 Q220 100 220 140' stroke='rgba(210,180,140,0.7)' strokeWidth='5' fill='none' strokeLinecap='round' />
        {/* Left ear cup */}
        <rect x='108' y='138' width='22' height='32' rx='8' fill='rgba(210,180,140,0.4)' stroke='rgba(210,180,140,0.6)' strokeWidth='2' />
        {/* Right ear cup */}
        <rect x='210' y='138' width='22' height='32' rx='8' fill='rgba(210,180,140,0.4)' stroke='rgba(210,180,140,0.6)' strokeWidth='2' />
        {/* Mic arm */}
        <path d='M119 165 Q105 185 118 195' stroke='rgba(210,180,140,0.6)' strokeWidth='3' fill='none' strokeLinecap='round' />
        <circle cx='122' cy='197' r='5' fill='rgba(210,180,140,0.5)' stroke='rgba(210,180,140,0.7)' strokeWidth='1.5' />

        {/* Chat bubbles */}
        {/* Bubble 1 */}
        <rect x='55' y='80' width='80' height='36' rx='10' fill='rgba(210,180,140,0.15)' stroke='rgba(210,180,140,0.3)' strokeWidth='1.5' className='contact-svg-float-1' />
        <line x1='75' y1='96' x2='115' y2='96' stroke='rgba(210,180,140,0.5)' strokeWidth='2' strokeLinecap='round' className='contact-svg-float-1' />
        <line x1='75' y1='104' x2='100' y2='104' stroke='rgba(210,180,140,0.4)' strokeWidth='2' strokeLinecap='round' className='contact-svg-float-1' />
        <path d='M65 116 L72 108' stroke='rgba(210,180,140,0.3)' strokeWidth='1.5' strokeLinecap='round' />

        {/* Bubble 2 */}
        <rect x='205' y='68' width='72' height='30' rx='9' fill='rgba(210,180,140,0.12)' stroke='rgba(210,180,140,0.25)' strokeWidth='1.5' className='contact-svg-float-2' />
        <line x1='220' y1='82' x2='262' y2='82' stroke='rgba(210,180,140,0.45)' strokeWidth='2' strokeLinecap='round' className='contact-svg-float-2' />
        <line x1='220' y1='90' x2='248' y2='90' stroke='rgba(210,180,140,0.35)' strokeWidth='2' strokeLinecap='round' className='contact-svg-float-2' />
        <path d='M267 98 L260 90' stroke='rgba(210,180,140,0.25)' strokeWidth='1.5' strokeLinecap='round' />

        {/* Check mark — resolved */}
        <circle cx='170' cy='230' r='20' fill='rgba(39,174,96,0.12)' stroke='rgba(39,174,96,0.3)' strokeWidth='1.5' className='contact-svg-float-3' />
        <path d='M161 230 L167 237 L180 223' stroke='rgba(39,174,96,0.7)' strokeWidth='2.5' fill='none' strokeLinecap='round' strokeLinejoin='round' className='contact-svg-float-3' />

        {/* Orbit dots */}
        <circle cx='170' cy='36' r='4' fill='rgba(210,180,140,0.35)' className='contact-svg-float-1' />
        <circle cx='278' cy='150' r='3.5' fill='rgba(210,180,140,0.3)' className='contact-svg-float-2' />
        <circle cx='62' cy='150' r='3.5' fill='rgba(210,180,140,0.3)' className='contact-svg-float-3' />
        <circle cx='170' cy='264' r='4' fill='rgba(210,180,140,0.25)' className='contact-svg-float-1' />

        {/* Dashed orbit ring */}
        <circle cx='170' cy='150' r='114' stroke='rgba(210,180,140,0.08)' strokeWidth='1' strokeDasharray='7 5' />
    </svg>
);

// ── Topics ────────────────────────────────────────────────────────────────────
const TOPICS = [
    { id: 'general', label: 'General Enquiry', description: 'Questions about ShopZone, how it works, or anything else.', icon: FaHeadset, accent: '#002147' },
    { id: 'order', label: 'Order Issue', description: 'Problem with a current or recent order, delivery, or payment.', icon: FaShoppingBag, accent: '#c0392b' },
    { id: 'bulk', label: 'Bulk Orders', description: 'Request a quote or discuss a large volume purchase.', icon: FaBoxOpen, accent: '#B8956A' },
    { id: 'seller', label: 'Become a Seller', description: 'Interested in supplying products through ShopZone.', icon: FaStore, accent: '#27ae60' },
];

const CONTACT_INFO = [
    { icon: FaWhatsapp, label: 'WhatsApp', value: '+254 700 000 000', sub: 'Fastest response — replies within minutes', href: 'https://wa.me/254700000000', accent: '#25d366' },
    { icon: FaPhone, label: 'Phone', value: '+254 700 000 000', sub: 'Mon–Fri, 8am–6pm EAT', href: 'tel:+254700000000', accent: '#002147' },
    { icon: FaEnvelope, label: 'Email', value: 'support@shopzone.com', sub: 'We reply within 4 business hours', href: 'mailto:support@shopzone.com', accent: '#D2B48C' },
    { icon: FaMapMarkerAlt, label: 'Location', value: 'Nairobi, Kenya', sub: 'Online platform — serving all 47 counties', href: null, accent: '#002147' },
];

// ── Main component ────────────────────────────────────────────────────────────
const ContactPage = () => {

    // ── Platform stats from API ───────────────────────────────
    const [platformStats, setPlatformStats] = useState({
        countiesServed:   47,
        ordersHandled:    1000,
        issuesResolved:   98,
    });

    useEffect(() => {
        axios.get('/api/stats')
            .then(({ data }) => {
                setPlatformStats({
                    countiesServed:  data.countiesServed        || 47,
                    ordersHandled:   data.totalOrdersFulfilled  || 1000,
                    issuesResolved:  98, // kept static — this is a service promise
                });
            })
            .catch(() => {});
    }, []);

    const [selectedTopic, setSelectedTopic] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', topic: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    // Loading and error state for the form submission
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Typewriter
    const fullText = 'Talk to Us.';
    const [typed, setTyped] = useState('');
    useEffect(() => { document.title = 'Contact Support — ShopZone'; }, []);
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
    const particles = Array.from({ length: 16 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${3 + Math.random() * 7}px`,
        height: `${3 + Math.random() * 7}px`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${6 + Math.random() * 8}s`,
        opacity: 0.05 + Math.random() * 0.09,
    }));

    const handleTopicCard = (topicId) => {
        setSelectedTopic(topicId);
        setFormData(prev => ({ ...prev, topic: topicId }));
        document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

   // ── Form submission — posts to /api/enquiries ─────────────
    // No longer opens a mailto link. Data is stored in the database
    // and visible in the admin enquiries page at /admin/enquiries.
    // When Step 15 (Support Tickets) is built, contact enquiries
    // will migrate to the ticket model automatically.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitError('');
        try {
            await axios.post('/api/enquiries', {
                type:    'contact',
                name:    formData.name,
                email:   formData.email,
                message: formData.message,
                // Store topic in the structured data field so admin
                // can filter by it and it migrates cleanly to tickets
                data: {
                    topic:      formData.topic,
                    topicLabel: TOPICS.find(t => t.id === formData.topic)?.label || formData.topic,
                },
            });
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className='contact-page'>

            {/* ══ HERO ═══════════════════════════════════════════════════════ */}
            <section className='contact-hero'>
                {particles.map((p, i) => <Particle key={i} style={p} />)}
                <div className='contact-hero__orb contact-hero__orb--1' aria-hidden='true' />
                <div className='contact-hero__orb contact-hero__orb--2' aria-hidden='true' />

                <div className='contact-hero__split'>
                    {/* Text */}
                    <div className='contact-hero__text'>
                        <div className='contact-hero__eyebrow'>
                            <FaBolt aria-hidden='true' /> Support Centre
                        </div>
                        <h1 className='contact-hero__title'>
                            We Are Here.<br />
                            <span className='contact-hero__title--accent'>
                                {typed}
                                <span className='contact-hero__cursor' aria-hidden='true'>|</span>
                            </span>
                        </h1>
                        <p className='contact-hero__subtitle'>
                            Real people, real answers. ShopZone support handles everything —
                            from order issues to bulk sourcing enquiries.
                        </p>
                        <div className='contact-hero__badges'>
                            {['WhatsApp replies in minutes', 'Email within 4 hours', 'Mon–Fri 8am–6pm EAT'].map(b => (
                                <div key={b} className='contact-hero__badge'>
                                    <FaCheckCircle aria-hidden='true' /> {b}
                                </div>
                            ))}
                        </div>
                        <button
                            className='contact-hero__cta'
                            onClick={() => document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Send a Message <FaChevronRight aria-hidden='true' />
                        </button>
                    </div>

                    {/* Illustration */}
                    <div className='contact-hero__illustration' aria-hidden='true'>
                        <SupportIllustration />
                    </div>
                </div>

                {/* Scroll line */}
                <div className='contact-hero__scroll' aria-hidden='true'>
                    <div className='contact-hero__scroll-line' />
                </div>
            </section>

            {/* ══ STATS STRIP ════════════════════════════════════════════════ */}
            <div className='contact-stats-strip'>
                {[
                    { icon: FaUsers,       value: platformStats.countiesServed,  suffix: '',    label: 'Counties served' },
                    { icon: FaClock,       value: 4,                             suffix: 'hr',  label: 'Email response' },
                    { icon: FaTruck,       value: platformStats.ordersHandled,   suffix: '+',   label: 'Orders handled' },
                    { icon: FaCheckCircle, value: platformStats.issuesResolved,  suffix: '%',   label: 'Issues resolved' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Reveal key={stat.label} delay={i * 80}>
                            <div className='contact-stat'>
                                <div className='contact-stat__icon'><Icon aria-hidden='true' /></div>
                                <div className='contact-stat__number'><Counter target={stat.value} suffix={stat.suffix} /></div>
                                <div className='contact-stat__label'>{stat.label}</div>
                            </div>
                        </Reveal>
                    );
                })}
            </div>

            {/* ══ RESPONSE TIME STRIP ════════════════════════════════════════ */}
            <Reveal>
                <div className='contact-strip'>
                    <div className='contact-strip__inner'>
                        {[
                            { icon: FaWhatsapp, label: 'WhatsApp', time: 'Under 5 minutes', color: '#25d366' },
                            { icon: FaPhone, label: 'Phone', time: 'Immediate', color: '#D2B48C' },
                            { icon: FaEnvelope, label: 'Email', time: 'Within 4 hours', color: '#002147' },
                        ].map(item => (
                            <div key={item.label} className='contact-strip__item'>
                                <item.icon className='contact-strip__icon' style={{ color: item.color }} aria-hidden='true' />
                                <div>
                                    <strong className='contact-strip__channel'>{item.label}</strong>
                                    <span className='contact-strip__time'>{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Reveal>

            {/* ══ TOPIC CARDS ════════════════════════════════════════════════ */}
            <div className='contact-topics-section'>
                <Reveal>
                    <div className='contact-section-header'>
                        <h2 className='contact-section-title'>What can we help you with?</h2>
                        <p className='contact-section-sub'>Select a topic and we will route your message to the right team.</p>
                    </div>
                </Reveal>
                <div className='contact-topics-grid'>
                    {TOPICS.map((topic, i) => {
                        const Icon = topic.icon;
                        const isSelected = selectedTopic === topic.id;
                        return (
                            <Reveal key={topic.id} delay={i * 80}>
                                <button
                                    className={`contact-topic-card ${isSelected ? 'contact-topic-card--selected' : ''}`}
                                    onClick={() => handleTopicCard(topic.id)}
                                    aria-pressed={isSelected}
                                >
                                    <div className='contact-topic-card__icon-wrap' style={{ background: topic.accent }}>
                                        <Icon aria-hidden='true' />
                                    </div>
                                    <h3 className='contact-topic-card__label'>{topic.label}</h3>
                                    <p className='contact-topic-card__desc'>{topic.description}</p>
                                    <div className='contact-topic-card__arrow'><FaChevronRight aria-hidden='true' /></div>
                                </button>
                            </Reveal>
                        );
                    })}
                </div>
            </div>

            {/* ══ FORM + INFO ═════════════════════════════════════════════════ */}
            <div className='contact-main' id='contact-form-section'>

                {/* Form */}
                <Reveal className='contact-form-col'>
                    <div className='contact-form-card'>
                        {submitted ? (
                            <div className='contact-success'>
                                <div className='contact-success__icon-wrap'><FaCheckCircle aria-hidden='true' /></div>
                                <h2 className='contact-success__title'>Message received!</h2>
                                <p className='contact-success__text'>
                                    Thank you for reaching out. Our support team will get back to you
                                    within 4 business hours. Check your email for a confirmation.
                                </p>
                                <button className='contact-success__reset' onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', topic: '', message: '' }); setSelectedTopic(''); setSubmitError(''); }}>
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className='contact-form-card__header'>
                                    <h2 className='contact-form-card__title'>Send us a message</h2>
                                    <p className='contact-form-card__sub'>Fill in the form and a real person will get back to you.</p>
                                </div>
                                <form className='contact-form' onSubmit={handleSubmit} noValidate>
                                    <div className='contact-form__row'>
                                        <div className='contact-form__group'>
                                            <label htmlFor='contact-name'>Your Name</label>
                                            <input id='contact-name' name='name' type='text' placeholder='e.g. Jane Mwangi' value={formData.name} onChange={handleChange} required />
                                        </div>
                                        <div className='contact-form__group'>
                                            <label htmlFor='contact-email'>Email Address</label>
                                            <input id='contact-email' name='email' type='email' placeholder='you@example.com' value={formData.email} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className='contact-form__group'>
                                        <label htmlFor='contact-topic'>Topic</label>
                                        <select id='contact-topic' name='topic' value={formData.topic} onChange={e => { handleChange(e); setSelectedTopic(e.target.value); }} required>
                                            <option value=''>Select a topic...</option>
                                            {TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <div className='contact-form__group'>
                                        <label htmlFor='contact-message'>Message</label>
                                        <textarea id='contact-message' name='message' placeholder='Tell us as much detail as possible...' rows={6} value={formData.message} onChange={handleChange} required />
                                    </div>
                                    {/* Inline error message if submission fails */}
                                    {submitError && (
                                        <p className='contact-form__error' role='alert'>{submitError}</p>
                                    )}
                                    <button
                                        type='submit'
                                        className='contact-form__submit'
                                        disabled={!formData.name || !formData.email || !formData.topic || !formData.message || submitLoading}
                                    >
                                        <FaPaperPlane aria-hidden='true' />
                                        {submitLoading ? 'Sending…' : 'Send Message'}
                                    </button>
                                    <p className='contact-form__note'>All communication goes through ShopZone — your details are never shared with third parties.</p>
                                </form>
                            </>
                        )}
                    </div>
                </Reveal>

                {/* Info panel */}
                <div className='contact-info-col'>
                    {CONTACT_INFO.map((info, i) => {
                        const Icon = info.icon;
                        return (
                            <Reveal key={info.label} delay={i * 100}>
                                <div className='contact-info-card'>
                                    <div className='contact-info-card__icon-wrap' style={{ background: info.accent }}>
                                        <Icon aria-hidden='true' />
                                    </div>
                                    <div className='contact-info-card__body'>
                                        <span className='contact-info-card__label'>{info.label}</span>
                                        {info.href ? (
                                            <a href={info.href} className='contact-info-card__value' target={info.href.startsWith('http') ? '_blank' : undefined} rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                                                {info.value}
                                            </a>
                                        ) : (
                                            <span className='contact-info-card__value'>{info.value}</span>
                                        )}
                                        <span className='contact-info-card__sub'>{info.sub}</span>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                    <Reveal delay={400}>
                        <div className='contact-hours-card'>
                            <div className='contact-hours-card__header'><FaClock aria-hidden='true' /> Office Hours</div>
                            <div className='contact-hours-card__rows'>
                                {[{ day: 'Monday – Friday', time: '8:00am – 6:00pm' }, { day: 'Saturday', time: '9:00am – 1:00pm' }, { day: 'Sunday', time: 'Closed' }].map(r => (
                                    <div key={r.day} className='contact-hours-card__row'>
                                        <span>{r.day}</span><strong>{r.time}</strong>
                                    </div>
                                ))}
                            </div>
                            <p className='contact-hours-card__note'>All times East Africa Time (EAT / UTC+3)</p>
                        </div>
                    </Reveal>
                </div>
            </div>

        </div>
    );
};

export default ContactPage;