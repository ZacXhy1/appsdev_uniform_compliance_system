/* ==========================================================================
   Shared app init + utilities.
   Each page's own js/pages/*.js file should call initShell() first.
   ========================================================================== */

/**
 * Renders the sidebar + header for a page and marks the correct nav link
 * active. Call this once at the top of every page's script.
 * @param {string} activeKey - matches a key in SIDEBAR_LINKS (sidebar.js)
 * @param {string} pageTitle - shown in the header
 */
function initShell(activeKey, pageTitle) {
  renderSidebar(activeKey);
  renderHeader(pageTitle);
}

/** Formats an ISO timestamp like "Aug 18, 2026 · 7:12 AM". */
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
  return `${datePart} \u00B7 ${timePart}`;
}

/** Maps a detection status to the status-pill CSS class + label. */
function getStatusPillMeta(status) {
  switch (status) {
    case 'compliant':
      return { className: 'status-pill--compliant', label: 'Compliant' };
    case 'violation':
      return { className: 'status-pill--violation', label: 'Violation' };
    case 'pending':
      return { className: 'status-pill--pending', label: 'Pending Review' };
    default:
      return { className: 'status-pill--pending', label: 'Unknown' };
  }
}

/**
 * Shows a small transient confirmation toast in the bottom-right corner.
 * Used by Settings (Phase 7) to confirm preference changes and demo
 * resets, but any page can call it. Creates its container on first use.
 * @param {string} message
 * @param {'success'|'warning'} [variant]
 */
function showToast(message, variant = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${variant}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  }));

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 220);
  }, 3200);
}

/**
 * Opens a confirm/cancel modal (built on openModal() from modal.js) and
 * runs `onConfirm` only if the user confirms. Used for destructive demo
 * actions like resetting data, so a stray click can't silently wipe state.
 * @param {string} title
 * @param {string} message
 * @param {() => void} onConfirm
 */
function confirmAction(title, message, onConfirm) {
  openModal(`
    <div class="modal-header">
      <h2>${title}</h2>
      <button type="button" class="modal-close" onclick="closeModal()" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body">
      <p style="margin:0;">${message}</p>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button type="button" class="btn btn-primary" id="modal-confirm-btn">Confirm</button>
    </div>
  `);

  document.getElementById('modal-confirm-btn').addEventListener('click', () => {
    closeModal();
    onConfirm();
  });
}