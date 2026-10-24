// frontend/src/components/StorageNotice/StorageNotice.jsx
// ─────────────────────────────────────────────────────────────
// Browser-storage notice (formerly CookieBanner).
//
// RENAMED on purpose: ad/tracker blockers (Ghostery etc.) block files
// and classes named "cookie"/"banner"/"consent". In dev that blocked
// the module and left the whole site on the splash screen. Keep this
// name and the sz-notice classes neutral.
//
// What it does:
//   - Shows once to a visitor who has not made a choice.
//   - "Accept all" or "Essential only", saved in localStorage.
//   - Exports getStorageChoice() so future analytics can check
//     permission before loading anything.
// The localStorage key keeps its old value so earlier choices survive.
//
// If analytics is ever added, update the cookie text in
// frontend/src/data/legalContent.js in the same pass (rule 97).
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCookieBite } from 'react-icons/fa';
import './StorageNotice.css';

const STORAGE_KEY = 'shopzone_cookie_consent';

/** Saved choice { choice: 'all' | 'essential', savedAt } or null. */
export const getStorageChoice = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const StorageNotice = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getStorageChoice()) return;
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const choose = (choice) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, savedAt: new Date().toISOString() })
      );
    } catch {
      /* storage blocked: the notice just hides for this visit */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className='sz-notice' role='dialog' aria-label='Storage notice' aria-live='polite'>
      <FaCookieBite className='sz-notice__icon' aria-hidden='true' />

      <p className='sz-notice__text'>
        We use essential cookies and browser storage to keep you signed in and
        remember your cart. See our{' '}
        <Link to='/cookie-policy' className='sz-notice__link'>Cookie Policy</Link>.
      </p>

      <div className='sz-notice__actions'>
        <button type='button' className='sz-notice__btn sz-notice__btn--ghost' onClick={() => choose('essential')}>
          Essential only
        </button>
        <button type='button' className='sz-notice__btn sz-notice__btn--primary' onClick={() => choose('all')}>
          Accept all
        </button>
      </div>
    </div>
  );
};

export default StorageNotice;