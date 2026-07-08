import React from 'react';

export function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function ErrorDetailModal({ record, onClose }) {
  if (!record) return null;
  return (
    <Modal title={`Error details — ${record.instanceName}`} onClose={onClose} wide
      footer={<button className="btn btn-primary" onClick={onClose}>Close</button>}>
      <div className="alert error">Backup {record.type === 'SCHEDULED' ? 'scheduled run' : 'manual run'} failed at {new Date(record.startedAt).toLocaleString('en-IN')}.</div>
      <div className="error-log">{record.errorMessage || 'No stack trace was captured for this failure.'}</div>
    </Modal>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel, busy }) {
  return (
    <Modal title={title} onClose={onCancel}
      footer={<>
        <button className="btn" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>
          {busy ? <span className="spinner" /> : confirmLabel}
        </button>
      </>}>
      {message}
    </Modal>
  );
}
