/* ==========================================================================
   Violations — page logic
   Owner: Dean (Phase 5)

   Reads the same session detection log as Detections
   (getSessionDetections() in js/data/mock-data.js) and narrows it down to
   status === 'violation' only — this page never shows compliant or
   pending records. Everything here is derived from that one shared
   dataset; nothing is hardcoded per page.
   ========================================================================== */

let searchTerm = '';
let dateFilter = 'all';
let sortOrder = 'newest';

/** All violation records in the current session (unfiltered). */
function getViolations() {
  return getSessionDetections().filter((d) => d.status === 'violation');
}

/** `YYYY-MM-DD` slice of a record's ISO timestamp — used for both the
 *  date filter and the by-date summary below. */
function getDateKey(isoString) {
  return isoString.slice(0, 10);
}

function formatDateLabel(dateKey) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function getFilteredSortedViolations() {
  const filtered = getViolations().filter((d) => {
    const matchesSearch = !searchTerm
      || d.id.toLowerCase().includes(searchTerm)
      || d.label.toLowerCase().includes(searchTerm);
    const matchesDate = dateFilter === 'all' || getDateKey(d.timestamp) === dateFilter;
    return matchesSearch && matchesDate;
  });

  return filtered.sort((a, b) => {
    const diff = new Date(a.timestamp) - new Date(b.timestamp);
    return sortOrder === 'newest' ? -diff : diff;
  });
}

/** Keeps the date filter's <option> list in sync with whatever dates are
 *  actually present in the violation log (grows as Live Monitoring adds
 *  more detections during the session). Preserves the current selection
 *  if it's still valid. */
function populateDateFilterOptions() {
  const select = document.getElementById('violations-date-filter');
  const dateKeys = [...new Set(getViolations().map((d) => getDateKey(d.timestamp)))]
    .sort()
    .reverse();

  const previousValue = select.value;
  select.innerHTML = '<option value="all">All Dates</option>'
    + dateKeys.map((key) => `<option value="${key}">${formatDateLabel(key)}</option>`).join('');
  select.value = dateKeys.includes(previousValue) ? previousValue : 'all';
  dateFilter = select.value;
}

function renderStats() {
  const allDetections = getSessionDetections();
  const violations = getViolations();
  const total = allDetections.length;
  const violationRate = total ? Math.round((violations.length / total) * 100) : 0;
  const distinctDays = new Set(violations.map((d) => getDateKey(d.timestamp))).size;

  const mostRecent = violations.length
    ? violations.reduce((latest, d) => (new Date(d.timestamp) > new Date(latest.timestamp) ? d : latest))
    : null;

  const cards = [
    renderStatCard(violations.length, 'Total Violations'),
    renderStatCard(`${violationRate}%`, 'Of All Detections'),
    renderStatCard(distinctDays, 'Days With Violations'),
    renderStatCard(mostRecent ? formatTimestamp(mostRecent.timestamp) : '—', 'Most Recent'),
  ];

  document.getElementById('violations-stats').innerHTML = cards.join('');
}

function renderByDateSummary() {
  const violations = getViolations();
  const counts = {};
  violations.forEach((d) => {
    const key = getDateKey(d.timestamp);
    counts[key] = (counts[key] || 0) + 1;
  });

  const entries = Object.entries(counts).sort((a, b) => b[0].localeCompare(a[0]));
  const container = document.getElementById('violations-by-date');
  const summaryCard = document.getElementById('violations-summary-card');

  if (entries.length === 0) {
    summaryCard.hidden = true;
    return;
  }
  summaryCard.hidden = false;

  const maxCount = Math.max(...entries.map(([, count]) => count));

  container.innerHTML = entries.map(([dateKey, count]) => {
    const widthPct = Math.round((count / maxCount) * 100);
    return `
      <div class="violations-by-date-row">
        <span class="violations-by-date-label">${formatDateLabel(dateKey)}</span>
        <span class="violations-by-date-bar-track">
          <span class="violations-by-date-bar-fill" style="width: ${widthPct}%"></span>
        </span>
        <span class="violations-by-date-count">${count}</span>
      </div>
    `;
  }).join('');
}

function renderTable() {
  const allViolations = getViolations();
  const results = getFilteredSortedViolations();
  const body = document.getElementById('violations-table-body');
  const countEl = document.getElementById('violations-count');
  const tableWrap = document.getElementById('violations-table-wrap');
  const emptyEl = document.getElementById('violations-empty');

  countEl.textContent = `Showing ${results.length} of ${allViolations.length} violations`;

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
          <button type="button" class="btn btn-secondary btn-sm" onclick="showViolationDetails('${d.id}')">
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderAll() {
  populateDateFilterOptions();
  renderStats();
  renderTable();
  renderByDateSummary();
}

function showViolationDetails(id) {
  const violation = getViolations().find((d) => d.id === id);
  if (!violation) return;

  const meta = getStatusPillMeta(violation.status);

  openModal(`
    <div class="modal-header">
      <h2>Violation Details</h2>
      <button type="button" class="modal-close" onclick="closeModal()" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-row"><span>Detection ID</span><span>${violation.id}</span></div>
      <div class="modal-row"><span>Detected</span><span>${violation.label}</span></div>
      <div class="modal-row"><span>Date &amp; Time</span><span>${formatTimestamp(violation.timestamp)}</span></div>
      <div class="modal-row"><span>Location</span><span>${CAMERA_LOCATION}</span></div>
      <div class="modal-row"><span>Status</span><span class="status-pill ${meta.className}">${meta.label}</span></div>
      <div class="modal-row"><span>Confidence</span><span>${Math.round(violation.confidence * 100)}%</span></div>
    </div>
  `);
}

document.addEventListener('DOMContentLoaded', () => {
  initShell('violations', 'Violations');

  document.getElementById('violations-search').addEventListener('input', (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    renderTable();
  });

  document.getElementById('violations-date-filter').addEventListener('change', (event) => {
    dateFilter = event.target.value;
    renderTable();
  });

  document.getElementById('violations-sort').addEventListener('change', (event) => {
    sortOrder = event.target.value;
    renderTable();
  });

  renderAll();
});
