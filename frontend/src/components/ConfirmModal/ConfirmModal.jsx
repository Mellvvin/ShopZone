// frontend/src/components/ConfirmModal/ConfirmModal.jsx
// ─────────────────────────────────────────────────────────────
// Shared confirmation / info modal.
//
// Props:
//   show           — boolean, controls visibility
//   onConfirm      — function, called on confirm button click
//   onCancel       — function, called on cancel or backdrop click
//   title          — string, modal heading
//   message        — string or ReactNode, main body content
//   subMessage     — string, smaller secondary line (optional)
//   confirmLabel   — string, confirm button text (default 'Confirm')
//   confirmVariant — 'primary-branded' | 'danger' (default 'primary-branded')
//   infoOnly       — boolean, hides cancel button and softens layout
//                    used for help/info modals that need no cancel action
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import './ConfirmModal.css';

const ConfirmModal = ({
  show,
  onConfirm,
  onCancel,
  title,
  message,
  subMessage,
  confirmLabel   = 'Confirm',
  confirmVariant = 'primary-branded',
  infoOnly       = false,
}) => {
  // ── Focus the confirm button when modal opens ─────────────
  // For info-only modals this is the only button so it gets
  // focus immediately. For confirm modals the cancel button
  // should receive focus — handled by the cancel ref below.
  const confirmRef = useRef(null);
  const cancelRef  = useRef(null);

  useEffect(() => {
    if (!show) return;
    // Info-only: focus confirm (Got it).
    // Destructive confirm: focus cancel to prevent accidental confirm.
    const target = infoOnly ? confirmRef.current : cancelRef.current;
    if (target) target.focus();
  }, [show, infoOnly]);

  // ── Trap Escape key ───────────────────────────────────────
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, onCancel]);

  if (!show) return null;

  return (
    // Backdrop — click outside to cancel
    <div
      className='cm-backdrop'
      onClick={infoOnly ? onConfirm : onCancel}
      role='presentation'
    >
      <div
        className={`cm-modal${infoOnly ? ' cm-modal--info' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby='cm-title'
      >

        {/* ── Header ────────────────────────────────────── */}
        <div className={`cm-header${infoOnly ? ' cm-header--info' : ''}`}>
          <span className='cm-header-icon' aria-hidden='true'>
            {infoOnly
              ? <FaInfoCircle />
              : <FaExclamationTriangle />}
          </span>
          <h5 className='cm-title' id='cm-title'>{title}</h5>
        </div>

        {/* ── Body ──────────────────────────────────────── */}
        <div className='cm-body'>
          <div className='cm-message'>{message}</div>
          {subMessage && (
            <p className='cm-sub-message'>{subMessage}</p>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────── */}
        <div className={`cm-footer${infoOnly ? ' cm-footer--info' : ''}`}>
          {/* Cancel button — hidden for info-only modals */}
          {!infoOnly && (
            <button
              ref={cancelRef}
              type='button'
              className='cm-btn cm-btn--cancel'
              onClick={onCancel}
            >
              Cancel
            </button>
          )}

          <button
            ref={confirmRef}
            type='button'
            className={`cm-btn cm-btn--confirm cm-btn--${confirmVariant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;