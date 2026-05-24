// frontend/src/components/ConfirmModal/ConfirmModal.jsx
// ─────────────────────────────────────────────────────
// Shared confirmation modal — replaces all window.confirm usage.
// Import and drop into any page that needs a branded confirm dialog.
// ─────────────────────────────────────────────────────
import { Modal, Button } from 'react-bootstrap';

const ConfirmModal = ({
    show,
    onConfirm,
    onCancel,
    title = 'Are you sure?',
    message,
    subMessage,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmVariant = 'danger',
}) => {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header style={{ backgroundColor: 'var(--oxford-blue)' }}>
                <Modal.Title style={{ color: 'var(--tan)' }}>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message && <p>{message}</p>}
                {subMessage && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{subMessage}</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant='light'
                    onClick={onCancel}
                    style={{ borderColor: 'var(--tan)', color: 'var(--oxford-blue)' }}
                >
                    {cancelLabel}
                </Button>
                <Button
                    variant={confirmVariant}
                    onClick={onConfirm}
                    style={
                        confirmVariant === 'primary-branded'
                            ? { backgroundColor: 'var(--oxford-blue)', borderColor: 'var(--oxford-blue)', color: 'var(--tan)' }
                            : {}
                    }
                >
                    {confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;