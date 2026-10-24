// frontend/src/components/CookieBanner/CookieBanner.jsx
// ─────────────────────────────────────────────────────────────
// Cookie / storage consent bar.
//
// What it does:
//   - Shows once to a visitor who has not yet made a choice.
//   - Two choices: "Accept all" or "Essential only".
//   - Saves the choice (and date) in localStorage under
//     shopzone_cookie_consent so it never reappears.
//   - Exports getCookieConsent() so future analytics code can ask
//     "am I allowed to load?" before it runs anything.
//
// Today ShopZone only uses strictly necessary storage (login token,
// cart, search history), so both choices behave identically for now.
// The choice is recorded so analytics can respect it later.
//
// NOTE: if analytics or ad cookies are ever added, update the cookie
// text in frontend/src/data/legalContent.js in the same pass (rule 97).
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCookieBite } from 'react-icons/fa';
import './CookieBanner.css';

const STORAGE_KEY = 'shopzone_cookie_consent';

/**
 * Returns the saved consent object, or null if the visitor has not chosen.
 * Shape: { choice: 'all' | 'essential', savedAt: ISO string }
 * Safe to call anywhere (wrapped in try/catch for private-mode browsers).
 */
export const getCookieConsent = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  // Decide on mount whether to show. A short delay stops the bar
  // flashing in during the initial page paint.
  useEffect(() => {
    if (getCookieConsent()) return;
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Save the visitor's choice and hide the bar.
  const choose = (choice) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, savedAt: new Date().toISOString() })
      );
    } catch {
      /* storage blocked: the bar simply hides for this visit */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className='cookie-banner'
      role='dialog'
      aria-label='Cookie notice'
      aria-live='polite'
    >
      <FaCookieBite className='cookie-banner__icon' aria-hidden='true' />

      <p className='cookie-banner__text'>
        We use essential cookies and browser storage to keep you signed in and
        remember your cart. See our{' '}
        <Link to='/cookie-policy' className='cookie-banner__link'>
          Cookie Policy
        </Link>
        .
      </p>

      <div className='cookie-banner__actions'>
        <button
          type='button'
          className='cookie-banner__btn cookie-banner__btn--ghost'
          onClick={() => choose('essential')}
        >
          Essential only
        </button>
        <button
          type='button'
          className='cookie-banner__btn cookie-banner__btn--primary'
          onClick={() => choose('all')}
        >
          Accept all
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;