/* ==========================================================================
   Detections — page logic
   Owner: Zachary (Phase 4)

   Shows the full detection log from MOCK_DETECTIONS (js/data/mock-data.js)
   — the same shared dataset Dashboard/Violations/Reports read from. This
   page does NOT include Live Monitoring's session-generated detections;
   those only exist in memory on the Monitoring page and aren't persisted
   anywhere shared (no localStorage bridge). If that's ever needed, this
   is the file to revisit.
   ========================================================================== */

let searchTerm = '';
let statusFilter = 'all';
let sortOrder = 'newest';

function getFilteredSortedDetections() {
  const filtered = MOCK_DETECTIONS.filter((d) => {
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
  const results = getFilteredSortedDetections();
  const body = document.getElementById('detections-table-body');
  const countEl = document.getElementById('detections-count');
  const tableWrap = document.getElementById('detections-table-wrap');
  const emptyEl = document.getElementById('detections-empty');

  countEl.textContent = `Showing ${results.length} of ${MOCK_DETECTIONS.length} detections`;

  if (results.length === 0) {
    tableWrap.hidden = true;
    emptyEl.hidden = false;
    return;
  }
  tableWrap.hidden = false;
  emptyEl.hidden = true;

  body.innerHTML = results.map((d) => {
    const meta = getStatusPillMeta(d.status);
    return `
      <tr>
        <td>${d.id}</td>
        <td>${d.label}</td>
        <td>${formatTimestamp(d.timestamp)}</td>
        <td><span class="status-pill ${meta.className}">${meta.label}</span></td>
        <td>${Math.round(d.confidence * 100)}%</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" onclick="showDetectionDetails('${d.id}')">
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function showDetectionDetails(id) {
  const detection = MOCK_DETECTIONS.find((d) => d.id === id);
  if (!detection) return;

  const meta = getStatusPillMeta(detection.status);

  openModal(`
    <div class="modal-header">
      <h2>Detection Details</h2>
      <button type="button" class="modal-close" onclick="closeModal()" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-row"><span>Detection ID</span><span>${detection.id}</span></div>
      <div class="modal-row"><span>Detected</span><span>${detection.label}</span></div>
      <div class="modal-row"><span>Date &amp; Time</span><span>${formatTimestamp(detection.timestamp)}</span></div>
      <div class="modal-row"><span>Location</span><span>${CAMERA_LOCATION}</span></div>
      <div class="modal-row"><span>Status</span><span class="status-pill ${meta.className}">${meta.label}</span></div>
      <div class="modal-row"><span>Confidence</span><span>${Math.round(detection.confidence * 100)}%</span></div>
    </div>
  `);
}

document.addEventListener('DOMContentLoaded', () => {
  initShell('detections', 'Detections');

  document.getElementById('detections-search').addEventListener('input', (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    renderTable();
  });

  document.getElementById('detections-status-filter').addEventListener('change', (event) => {
    statusFilter = event.target.value;
    renderTable();
  });

  document.getElementById('detections-sort').addEventListener('change', (event) => {
    sortOrder = event.target.value;
    renderTable();
  });

  renderTable();
});
