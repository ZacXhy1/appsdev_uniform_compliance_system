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
