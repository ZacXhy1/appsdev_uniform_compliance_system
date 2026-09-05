/* ==========================================================================
   Dashboard — page logic
   Owner: Paul (Phase 2)

   Reads from getSessionDetections() (js/data/mock-data.js), not the raw
   MOCK_DETECTIONS array, so anything Live Monitoring (Phase 3) generates
   this session shows up here too — see PROJECT_BRIEF.md Section 6/28.
   ========================================================================== */

const DASHBOARD_MAX_RECENT = 5;
// Written by js/pages/monitoring.js — reading it here is how Dashboard
// reflects whether Live Monitoring is currently running, without the two
// pages needing to talk to each other directly.
const MONITORING_ACTIVE_KEY = 'ucms_monitoring_active';

/** Renders the four top summary cards via the shared renderStatCard()
 *  (js/components/stat-card.js), using its optional color tone so
 *  compliant/violation values stand out at a glance. */
function renderSummaryCards(stats) {
  const mount = document.getElementById('dashboard-summary-cards');
  if (!mount) return;

  mount.innerHTML = [
    renderStatCard(stats.total, 'Total Detections'),
    renderStatCard(stats.compliant, 'Compliant', 'success'),
    renderStatCard(stats.violations, 'Violations', 'danger'),
    renderStatCard(`${stats.complianceRate}%`, 'Compliance Rate', 'primary'),
  ].join('');
}

/** Reflects whether Live Monitoring is currently active, per
 *  PROJECT_BRIEF.md Section 12 ("Monitoring status ... if feasible"). */
function renderMonitoringStatus() {
  const dot = document.getElementById('dashboard-monitoring-dot');
  const text = document.getElementById('dashboard-monitoring-text');
  const isActive = sessionStorage.getItem(MONITORING_ACTIVE_KEY) === 'true';

  dot.classList.toggle('is-live', isActive);
  text.textContent = isActive
    ? 'Live Monitoring is active \u2014 watching Main Gate'
    : 'Live Monitoring is idle';
}

/**
 * Compliant / violation / pending donut, built with a CSS conic-gradient
 * rather than a charting library (PROJECT_BRIEF.md Section 25). The center
 * label shows the overall compliance rate.
 */
function renderComplianceChart(stats) {
  const donut = document.getElementById('dashboard-donut');
  const legend = document.getElementById('dashboard-donut-legend');
  const centerLabel = document.getElementById('dashboard-donut-center');
  if (!donut) return;

  if (stats.total === 0) {
    donut.style.background = 'var(--color-border)';
  } else {
    const compliantPct = (stats.compliant / stats.total) * 100;
    const violationPct = (stats.violations / stats.total) * 100;
    // Pending fills whatever's left, so the three slices always sum to a
    // full circle even with rounding.
    donut.style.background = `conic-gradient(
      var(--color-success) 0% ${compliantPct}%,
      var(--color-danger) ${compliantPct}% ${compliantPct + violationPct}%,
      var(--color-warning) ${compliantPct + violationPct}% 100%
    )`;
  }

  centerLabel.textContent = `${stats.complianceRate}%`;

  legend.innerHTML = `
    <div class="dashboard-legend-row">
      <span class="dashboard-legend-dot dashboard-legend-dot--success"></span>
      <span>Compliant</span>
      <span class="dashboard-legend-count">${stats.compliant}</span>
    </div>
    <div class="dashboard-legend-row">
      <span class="dashboard-legend-dot dashboard-legend-dot--danger"></span>
      <span>Violation</span>
      <span class="dashboard-legend-count">${stats.violations}</span>
    </div>
    <div class="dashboard-legend-row">
      <span class="dashboard-legend-dot dashboard-legend-dot--warning"></span>
      <span>Pending Review</span>
      <span class="dashboard-legend-count">${stats.pending}</span>
    </div>
  `;
}

/** Latest detections, newest first, capped to DASHBOARD_MAX_RECENT — same
 *  pattern as Monitoring's "Recent Detections" table. */
function renderRecentActivity(allDetections) {
  const body = document.getElementById('dashboard-recent-body');
  if (!body) return;

  if (allDetections.length === 0) {
    body.innerHTML = `<tr><td colspan="4">No detections yet.</td></tr>`;
    return;
  }

  const recent = [...allDetections].reverse().slice(0, DASHBOARD_MAX_RECENT);

  body.innerHTML = recent.map((d) => {
    const meta = getStatusPillMeta(d.status);
    return `
      <tr>
        <td>${d.label}</td>
        <td>${formatTimestamp(d.timestamp)}</td>
        <td><span class="status-pill ${meta.className}">${meta.label}</span></td>
        <td>${Math.round(d.confidence * 100)}%</td>
      </tr>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initShell('dashboard', 'Dashboard');

  const allDetections = getSessionDetections();
  const stats = getMockSummaryStats(allDetections);

  renderMonitoringStatus();
  renderSummaryCards(stats);
  renderComplianceChart(stats);
  renderRecentActivity(allDetections);
});
