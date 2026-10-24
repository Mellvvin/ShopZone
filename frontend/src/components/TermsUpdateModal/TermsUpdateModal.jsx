// frontend/src/components/TermsUpdateModal/TermsUpdateModal.jsx
// ─────────────────────────────────────────────────────────────
// "We've updated our Terms" prompt (ISS-091).
//
// Shows when a logged-in user's account has not accepted the current
// Terms version (userInfo.termsUpToDate !== true, computed by the
// server). Behaviour:
//   - Dismissible with "Not now" (remembered for this tab session
//     only, so it returns on the next visit).
//   - Never shown on the legal pages themselves, so people can read.
//   - Re-opens when requireCurrentTerms() is called from Place Order
//     or the seller application.
//   - Accept calls PUT /api/users/accept-terms and updates Redux via
//     setCredentials (rule 18).
// The server records the date and version; this file never sends them.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FaFileContract } from 'react-icons/fa';
import { setCredentials } from '../../redux/slices/authSlice';
import { showToast } from '../Toast/Toast';
import './TermsUpdateModal.css';

const DISMISS_KEY = 'shopzone_terms_prompt_dismissed';
const OPEN_EVENT  = 'shopzone:open-terms';
const LEGAL_PATHS = ['/terms', '/privacy-policy', '/cookie-policy'];

/**
 * Call before a sensitive action (placing an order, applying as a seller).
 * Returns true if the action may continue. Otherwise it opens the prompt
 * and returns false. Guests return true (login gates handle them).
 */
export const requireCurrentTerms = (userInfo) => {
  if (!userInfo || userInfo.termsUpToDate === true) return true;
  window.dispatchEvent(new Event(OPEN_EVENT));
  return false;
};

const TermsUpdateModal = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
  });
  const [forced, setForced]   = useState(false);
  const [saving, setSaving]   = useState(false);

  // Re-open on demand (Place Order / seller application gate)
  useEffect(() => {
    const open = () => { setDismissed(false); setForced(true); };
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  const needsAcceptance = !!userInfo && userInfo.termsUpToDate !== true;
  const onLegalPage = LEGAL_PATHS.includes(location.pathname);

  if (!needsAcceptance || onLegalPage || (dismissed && !forced)) return null;

  const dismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setDismissed(true);
    setForced(false);
  };

  const accept = async () => {
    try {
      setSaving(true);
      const { data } = await axios.put(
        '/api/users/accept-terms',
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch(setCredentials(data));
      setForced(false);
      showToast('Thank you. Your acceptance has been recorded.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not record acceptance. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='terms-modal__overlay' role='presentation'>
      <div className='terms-modal' role='dialog' aria-modal='true' aria-labelledby='terms-modal-title'>
        <FaFileContract className='terms-modal__icon' aria-hidden='true' />
        <h2 id='terms-modal-title' className='terms-modal__title'>
          We have updated our Terms and Privacy Policy
        </h2>
        <p className='terms-modal__text'>
          Please review and accept our{' '}
          <Link to='/terms' target='_blank' rel='noopener noreferrer'>Terms of Service</Link>
          {' '}and{' '}
          <Link to='/privacy-policy' target='_blank' rel='noopener noreferrer'>Privacy Policy</Link>
          {' '}to keep ordering and selling on ShopZone.
        </p>
        <div className='terms-modal__actions'>
          <button type='button' className='terms-modal__btn terms-modal__btn--ghost' onClick={dismiss} disabled={saving}>
            Not now
          </button>
          <button type='button' className='terms-modal__btn terms-modal__btn--primary' onClick={accept} disabled={saving}>
            {saving ? 'Saving…' : 'I accept'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsUpdateModal;