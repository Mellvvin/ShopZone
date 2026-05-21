// src/components/Toast/Toast.jsx
// ─────────────────────────────────────────────────────────────
// Global toast notification system.
// Renamed container class to sz-toast-container to avoid
// conflict with Bootstrap's own .toast-container class which
// was overriding position: fixed with position: absolute.
//
// Usage from any file in the project:
//   import { showToast } from '../components/Toast/Toast';
//   showToast('Something went wrong', 'error');
//   showToast('Saved successfully', 'success');
//   showToast('Here is some info', 'info');
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import './Toast.css';

// ── showToast — call this from anywhere in the app ────────────
// Dispatches a custom browser event that the Toast component
// listens for and renders. No props or Redux needed.
export const showToast = (message, type = 'success') => {
    window.dispatchEvent(
        new CustomEvent('shopzone-toast', {
            detail: { message, type },
        })
    );
};

// ── ToastItem — a single notification card ────────────────────
// Renders the icon, message, close button and draining bar.
// Auto-dismisses after 5 seconds.
const ToastItem = ({ id, message, type, onRemove }) => {
    const [visible, setVisible] = useState(true);

    // ── Auto-dismiss after 5 seconds ─────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            // Wait for the fade-out animation to finish before removing
            setTimeout(() => onRemove(id), 300);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onRemove]);

    // ── Manual close ──────────────────────────────────────────
    const handleClose = () => {
        setVisible(false);
        setTimeout(() => onRemove(id), 300);
    };

    return (
        <div
            className={`sz-toast-item sz-toast-item--${type} ${visible ? 'sz-toast-item--visible' : 'sz-toast-item--hidden'
                }`}
        >
            {/* ── Icon ────────────────────────────────────────────── */}
            <span className='sz-toast-icon'>
                {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
            </span>

            {/* ── Message ─────────────────────────────────────────── */}
            <p className='sz-toast-message'>{message}</p>

            {/* ── Close button ────────────────────────────────────── */}
            <button
                className='sz-toast-close'
                onClick={handleClose}
                aria-label='Dismiss notification'
            >
                ✕
            </button>

            {/* ── Draining progress bar ────────────────────────────── */}
            {/* Starts full width and shrinks to zero over 5 seconds  */}
            <div className={`sz-toast-bar sz-toast-bar--${type}`} />
        </div>
    );
};

// ── Toast container — mounted once in App.jsx ─────────────────
// Listens for shopzone-toast events and renders each one.
const Toast = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handler = (e) => {
            const { message, type } = e.detail;
            // Unique ID using timestamp + random so multiple toasts
            // can stack without key conflicts
            const id = Date.now() + Math.random();
            setToasts((prev) => [...prev, { id, message, type }]);
        };
        window.addEventListener('shopzone-toast', handler);
        return () => window.removeEventListener('shopzone-toast', handler);
    }, []);

    // Remove a single toast from the list by its ID
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        // sz-toast-container — NOT toast-container, to avoid Bootstrap conflict
        <div className='sz-toast-container' aria-live='polite'>
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onRemove={removeToast}
                />
            ))}
        </div>
    );
};

export default Toast;