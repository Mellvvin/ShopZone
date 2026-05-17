// src/components/Toast/Toast.jsx
// ─────────────────────────────────────────────────────────────
// Global toast notification component.
// Shows bottom-right banners with a draining progress bar.
// Used for every success and error message across the app.
//
// Usage anywhere in the app:
//   import { showToast } from '../components/Toast/Toast';
//   showToast('Product saved successfully', 'success');
//   showToast('Something went wrong', 'error');
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import './Toast.css';

// ── Toast event system ────────────────────────────────────────
// We use a simple custom event so any file can trigger a toast
// without needing to pass props or use Redux.
// Any component calls showToast(message, type) and this
// component listens for the event and renders it.

export const showToast = (message, type = 'success') => {
    // Dispatch a custom browser event carrying the toast data
    window.dispatchEvent(
        new CustomEvent('shopzone-toast', {
            detail: { message, type },
        })
    );
};

// ── Individual toast item ─────────────────────────────────────
// Each toast has: icon, message, close button, draining bar.
const ToastItem = ({ id, message, type, onRemove }) => {
    const [visible, setVisible] = useState(true);

    // Auto-dismiss after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            // Give the fade-out animation 300ms then remove from list
            setTimeout(() => onRemove(id), 300);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onRemove]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => onRemove(id), 300);
    };

    return (
        <div className={`toast-item toast-item--${type} ${visible ? 'toast-item--visible' : 'toast-item--hidden'}`}>

            {/* ── Icon ─────────────────────────────────────────── */}
            <span className='toast-icon'>
                {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
            </span>

            {/* ── Message ──────────────────────────────────────── */}
            <p className='toast-message'>{message}</p>

            {/* ── Close button ─────────────────────────────────── */}
            <button className='toast-close' onClick={handleClose} aria-label='Dismiss'>
                ✕
            </button>

            {/* ── Draining progress bar ────────────────────────── */}
            {/* Starts full width and drains to zero over 5 seconds */}
            <div className={`toast-bar toast-bar--${type}`} />

        </div>
    );
};

// ── Toast container — mounts once in App.jsx ─────────────────
const Toast = () => {
    const [toasts, setToasts] = useState([]);

    // Listen for toast events dispatched by showToast()
    useEffect(() => {
        const handler = (e) => {
            const { message, type } = e.detail;
            const id = Date.now() + Math.random(); // unique ID
            setToasts((prev) => [...prev, { id, message, type }]);
        };
        window.addEventListener('shopzone-toast', handler);
        return () => window.removeEventListener('shopzone-toast', handler);
    }, []);

    // Remove a toast by ID
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div className='toast-container' aria-live='polite'>
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