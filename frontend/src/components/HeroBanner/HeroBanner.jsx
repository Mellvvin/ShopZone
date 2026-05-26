// HeroBanner.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Hero banner — full cinematic treatment matching BecomeSellerPage.
// Features:
//   - Floating particles (same as BecomeSellerPage)
//   - Typewriter effect on "Stock Smarter. Grow Faster." — runs once on mount
//   - Stats strip counts up once on first viewport entry — never repeats
//   - Scroll-triggered re-animation on content (except typewriter + counter)
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaShieldAlt, FaTruck, FaCheckCircle } from 'react-icons/fa';
import './HeroBanner.css';

// ── Animated counter — counts up once, never repeats ─────────────────────────
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

// ── Floating particle ─────────────────────────────────────────────────────────
const Particle = ({ style }) => (
  <div className='hero-particle' style={style} aria-hidden='true' />
);

const HeroBanner = () => {
  const navigate = useNavigate();
  const bannerRef = useRef(null);

  // ── Typewriter for "Stock Smarter." — runs once on mount ─────────────────
  const line1Full = 'Stock Smarter.';
  const line2Full = 'Grow Faster.';
  const [typed1, setTyped1] = useState('');
  const [typed2, setTyped2] = useState('');
  const [showCursor1, setShowCursor1] = useState(true);
  const [showCursor2, setShowCursor2] = useState(false);

  useEffect(() => {
    let i = 0;
    // Type line 1
    const t1 = setInterval(() => {
      setTyped1(line1Full.slice(0, i + 1));
      i++;
      if (i >= line1Full.length) {
        clearInterval(t1);
        setShowCursor1(false);
        setShowCursor2(true);
        // Start line 2 after brief pause
        let j = 0;
        const t2 = setInterval(() => {
          setTyped2(line2Full.slice(0, j + 1));
          j++;
          if (j >= line2Full.length) {
            clearInterval(t2);
            // Keep cursor blinking on line 2 forever
          }
        }, 75);
      }
    }, 70);
    return () => clearInterval(t1);
  }, []);

  // ── Scroll-triggered animation — replays on every viewport entry ──────────
  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove('is-visible');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.classList.add('is-visible');
            });
          });
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleShopNow = () => {
    const el = document.getElementById('featured-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Generate particles ────────────────────────────────────────────────────
  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${4 + Math.random() * 7}px`,
    height: `${4 + Math.random() * 7}px`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${6 + Math.random() * 8}s`,
    opacity: 0.05 + Math.random() * 0.09,
  }));

  return (
    <section
      className='hero-banner'
      aria-label='Welcome to ShopZone'
      ref={bannerRef}
    >
      {/* ── Particles ────────────────────────────────────────────────── */}
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* ── Decorative orbs ──────────────────────────────────────────── */}
      <div className='hero-bg-shape hero-bg-shape--1' aria-hidden='true' />
      <div className='hero-bg-shape hero-bg-shape--2' aria-hidden='true' />
      <div className='hero-bg-shape hero-bg-shape--3' aria-hidden='true' />

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className='hero-content'>

        {/* Eyebrow pill */}
        <span className='hero-eyebrow'>Kenya&apos;s B2B Wholesale Platform</span>

        {/* Typewriter headline */}
        <h1 className='hero-headline'>
          <span className='hero-headline__line1'>
            {typed1}
            {showCursor1 && (
              <span className='hero-headline__cursor' aria-hidden='true'>|</span>
            )}
          </span>
          <br />
          <span className='hero-headline--accent'>
            {typed2}
            {showCursor2 && (
              <span className='hero-headline__cursor' aria-hidden='true'>|</span>
            )}
          </span>
        </h1>

        {/* Subtitle */}
        <p className='hero-subtitle'>
          Connect your retail or small business to structured supply chains.
          Thousands of products across 13 categories — delivered to your door.
        </p>

        {/* CTAs */}
        <div className='hero-cta-row'>
          <button
            className='hero-btn hero-btn--primary'
            onClick={handleShopNow}
            aria-label='Scroll to featured products'
          >
            Shop Now
          </button>
          <button
            className='hero-btn hero-btn--secondary'
            onClick={() => navigate('/offers')}
            aria-label='Browse deals and sale items'
          >
            Browse Deals
          </button>
        </div>

        {/* Trust badges */}
        <div className='hero-trust'>
          {[
            'Verified Sellers',
            'Secure Payments',
            '47 Counties Covered',
            'VAT Inclusive Pricing',
          ].map(t => (
            <div key={t} className='hero-trust-item'>
              <FaCheckCircle aria-hidden='true' />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────── */}
      <div className='hero-stats' aria-label='Why ShopZone'>

        <div className='hero-stat'>
          <FaBoxOpen className='hero-stat__icon' aria-hidden='true' />
          <div className='hero-stat__text'>
            <strong>
              <Counter target={1000} suffix='+' />
            </strong>
            <span>Wholesale Products</span>
          </div>
        </div>

        <div className='hero-stat-divider' aria-hidden='true' />

        <div className='hero-stat'>
          <FaShieldAlt className='hero-stat__icon' aria-hidden='true' />
          <div className='hero-stat__text'>
            <strong>Verified Sellers</strong>
            <span>All transactions via ShopZone</span>
          </div>
        </div>

        <div className='hero-stat-divider' aria-hidden='true' />

        <div className='hero-stat'>
          <FaTruck className='hero-stat__icon' aria-hidden='true' />
          <div className='hero-stat__text'>
            <strong>
              <Counter target={47} suffix=' Counties' />
            </strong>
            <span>Flat-rate KSh shipping</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroBanner;