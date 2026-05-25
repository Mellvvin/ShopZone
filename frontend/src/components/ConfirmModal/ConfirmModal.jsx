import { useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import './ConfirmModal.css';

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
    const cancelRef = useRef(null);

    // Move focus to Cancel on open — safer default for destructive actions
    useEffect(() => {
        if (show) {
            setTimeout(() => cancelRef.current?.focus(), 50);
        }
    }, [show]);

    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header className='confirm-modal-header' closeButton closeVariant='white'>
                <Modal.Title className='confirm-modal-title'>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message && <p>{message}</p>}
                {subMessage && <p className='confirm-modal-sub'>{subMessage}</p>}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant='light'
                    className='confirm-modal-cancel'
                    onClick={onCancel}
                    ref={cancelRef}
                >
                    {cancelLabel}
                </Button>
                <Button variant={confirmVariant} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;