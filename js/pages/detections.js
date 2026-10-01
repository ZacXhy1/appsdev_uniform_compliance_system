/* ==========================================================================
   Detections — page logic
   Owner: Zachary (Phase 4)

   Shows the session detection log via getSessionDetections()
   (js/data/mock-data.js) — seeded from MOCK_DETECTIONS, then grows with
   whatever Live Monitoring generates for the rest of this browser tab's
   session (sessionStorage-backed, so it survives navigating between
   pages but clears when the tab closes). Re-reads on every render so a
   detection added on Monitoring shows up here the next time this page
   loads or its own data changes.
   ========================================================================== */

let searchTerm = '';
let statusFilter = 'all';
let sortOrder = 'newest';
let currentPage = 1;
const DETECTIONS_PER_PAGE = 15;

function getFilteredSortedDetections() {
  const allDetections = getSessionDetections();

  const filtered = allDetections.filter((d) => {
    const matchesSearch = !searchTerm
      || d.id.toLowerCase().includes(searchTerm)
      || d.label.toLowerCase().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return filtered.sort((a, b) => {
    const diff = new Date(a.timestamp) - new Date(b.timestamp);
    return sortOrder === 'newest' ? -diff : diff;
  });
}

function renderTable() {
  const allDetections = getSessionDetections();
  const results = getFilteredSortedDetections();
  const body = document.getElementById('detections-table-body');
  const countEl = document.getElementById('detections-count');
  const tableWrap = document.getElementById('detections-table-wrap');
  const emptyEl = document.getElementById('detections-empty');

  if (results.length === 0) {
    countEl.textContent = `Showing 0 of ${allDetections.length} detections`;
    tableWrap.hidden = true;
    emptyEl.hidden = false;
    return;
  }
  tableWrap.hidden = false;
  emptyEl.hidden = true;

  // Slice out just the rows for the current page. Clamp the page number in
  // case the results shrank (e.g. a filter was applied or a review moved a
  // row out of the current filter) and the old page no longer exists.
  const totalPages = Math.ceil(results.length / DETECTIONS_PER_PAGE);
  currentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (currentPage - 1) * DETECTIONS_PER_PAGE;
  const pageRows = results.slice(startIndex, startIndex + DETECTIONS_PER_PAGE);

  const totalNote = results.length === allDetections.length ? '' : ` (${allDetections.length} total)`;
  countEl.textContent = `Showing ${startIndex + 1}\u2013${startIndex + pageRows.length} of ${results.length} detections${totalNote}`;

  renderPagination(document.getElementById('detections-pagination'), currentPage, totalPages, (page) => {
    currentPage = page;
    renderTable();
    tableWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  body.innerHTML = pageRows.map((d) => {
    const meta = getStatusPillMeta(d.status);
    return `
      <tr>
        <td>${d.id}</td>
        <td>${d.label}</td>
        <td>${formatTimestamp(d.timestamp)}</td>
        <td><span class="status-pill ${meta.className}">${meta.label}</span></td>
        <td>${Math.round(d.confidence * 100)}%</td>
        <td>
          <button type="button" class="btn ${d.status === 'pending' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="showDetectionDetails('${d.id}')">
            ${d.status === 'pending' ? 'Review' : 'View'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function showDetectionDetails(id) {
  const detection = getSessionDetections().find((d) => d.id === id);
  if (!detection) return;

  const meta = getStatusPillMeta(detection.status);

  openModal(`
    <div class="modal-header">
      <h2>Detection Details</h2>
      <button type="button" class="modal-close" onclick="closeModal()" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body">
      ${renderEvidenceFrame(detection, true)}
      <p class="evidence-caption">Snapshot from ${CAMERA_LOCATION} (placeholder)</p>
      <div class="modal-row"><span>Detection ID</span><span>${detection.id}</span></div>
      <div class="modal-row"><span>Detected</span><span>${detection.label}</span></div>
      <div class="modal-row"><span>Date &amp; Time</span><span>${formatTimestamp(detection.timestamp)}</span></div>
      <div class="modal-row"><span>Location</span><span>${CAMERA_LOCATION}</span></div>
      <div class="modal-row"><span>Status</span><span class="status-pill ${meta.className}">${meta.label}</span></div>
      <div class="modal-row"><span>Confidence</span><span>${Math.round(detection.confidence * 100)}%</span></div>
      ${detection.reviewed ? '<div class="modal-row"><span>Review</span><span>Manually reviewed</span></div>' : ''}
    </div>
    ${detection.status === 'pending' ? `
      <p class="review-note">
        The system wasn't confident about this detection. Check the
        snapshot above and confirm the correct result.
      </p>
      <div class="review-actions">
        <button type="button" class="btn btn-success" onclick="reviewDetection('${detection.id}', 'compliant')">Confirm Compliant</button>
        <button type="button" class="btn btn-danger" onclick="reviewDetection('${detection.id}', 'violation')">Confirm Violation</button>
      </div>
    ` : ''}
  `);
}

/** Saves a manual review decision, then refreshes the page's UI. */
function reviewDetection(id, newStatus) {
  const updated = reviewSessionDetection(id, newStatus);
  if (!updated) return;
  closeModal();
  renderReviewBanner();
  renderTable();
  const label = newStatus === 'compliant' ? 'compliant' : 'a violation';
  showToast(`${id} confirmed as ${label}.`);
}

/** Shows/hides the "N detections need review" banner. */
function renderReviewBanner() {
  const pendingCount = getSessionDetections().filter((d) => d.status === 'pending').length;
  const banner = document.getElementById('review-banner');
  banner.hidden = pendingCount === 0;
  document.getElementById('review-banner-text').textContent =
    `${pendingCount} detection${pendingCount === 1 ? '' : 's'} need${pendingCount === 1 ? 's' : ''} manual review.`;
}

document.addEventListener('DOMContentLoaded', () => {
  initShell('detections', 'Detections');

  document.getElementById('detections-search').addEventListener('input', (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    currentPage = 1;
    renderTable();
  });

  document.getElementById('detections-status-filter').addEventListener('change', (event) => {
    statusFilter = event.target.value;
    currentPage = 1;
    renderTable();
  });

  document.getElementById('detections-sort').addEventListener('change', (event) => {
    sortOrder = event.target.value;
    currentPage = 1;
    renderTable();
  });

  // Banner button jumps straight to the pending detections.
  document.getElementById('review-banner-btn').addEventListener('click', () => {
    statusFilter = 'pending';
    document.getElementById('detections-status-filter').value = 'pending';
    currentPage = 1;
    renderTable();
  });

  renderReviewBanner();
  renderTable();
});
