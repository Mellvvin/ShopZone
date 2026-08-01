// frontend/src/utils/axiosSessionInterceptor.js
// ─────────────────────────────────────────────────────────────
// Global session-expiry handler.
//
// Registered ONCE at app startup (see main.jsx). Watches every
// axios request made anywhere on the platform — no individual page
// or component needs its own handling for this, it is automatic.
//
// WHAT IT CATCHES:
// authMiddleware.js's protect function returns 401 with the message
// 'Not authorised, token failed' whenever jwt.verify() throws — a
// stale token signed against an old JWT_SECRET, a corrupted token,
// or a genuinely expired one — and 'Not authorised, no token' when
// a protected route is hit with nothing in the Authorization header
// at all.
//
// WHAT IT DOES, IN ORDER:
// 1. Clears the stale session from Redux + localStorage using the
//    existing logout thunk from authSlice — no duplicate logic.
// 2. Shows a toast explaining what happened, using the platform's
//    existing global Toast system.
// 3. Redirects to /login immediately, carrying the page the user
//    was on in location.state.from — LoginPage already reads this
//    on every other login gate, so it sends them right back after
//    they sign in again with no extra wiring needed there.
//
// A short-lived guard (isHandlingExpiry) prevents this firing more
// than once if several requests on the same page all 401 within a
// moment of each other — the user should see one toast and one
// redirect, not a stack of five.
// ─────────────────────────────────────────────────────────────
import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { showToast } from '../components/Toast/Toast';
import { redirectTo } from './navigationService';

const SESSION_EXPIRED_MESSAGES = [
  'Not authorised, token failed',
  'Not authorised, no token',
];

let isHandlingExpiry = false;

export const initAxiosSessionInterceptor = () => {
  axios.interceptors.response.use(
    // Every successful response passes straight through untouched.
    (response) => response,

    // Every failed response passes through here first, platform-wide.
    (error) => {
      const status  = error.response?.status;
      const message = error.response?.data?.message;

      const isSessionExpired =
        status === 401 && SESSION_EXPIRED_MESSAGES.includes(message);

      if (isSessionExpired && !isHandlingExpiry) {
        isHandlingExpiry = true;

        // Reuses the exact same logout thunk the header's own
        // logout button already calls.
        store.dispatch(logout());

        showToast('Your session has expired. Please sign in again.', 'error');

        // Remember exactly where they were, including query params,
        // so LoginPage's existing location.state.from handling can
        // send them right back after a fresh login.
        const currentPath = window.location.pathname + window.location.search;
        redirectTo('/login', { state: { from: currentPath } });

        // Release the guard shortly after, so a later, genuinely new
        // expiry in the same browser tab can still be caught.
        setTimeout(() => { isHandlingExpiry = false; }, 2000);
      }

      // Always re-reject. This interceptor only ADDS session-expiry
      // handling — it must never swallow the error, since individual
      // pages still need their own .catch() to run normally for
      // every other kind of failure (validation errors, 404s, etc.).
      return Promise.reject(error);
    }
  );
};