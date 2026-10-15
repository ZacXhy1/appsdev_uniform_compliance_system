/* ==========================================================================
   Reports — page logic
   Owner: Paul (Phase 6)

   Reads getSessionDetections() (js/data/mock-data.js), same as every other
   page from Phase 4 onward — see PROJECT_BRIEF.md Section 6/28. The date
   filter narrows the stat cards and the compliance chart; the "Detections
   by Date" trend section always shows the full session, same convention
   Violations already uses for its own by-date summary.
   ========================================================================== */

let dateFilter = 'all';

/** `YYYY-MM-DD` slice of a record's ISO timestamp. */
function getDateKey(isoString) {
  return isoString.slice(0, 10);
}

function formatDateLabel(dateKey) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** All session detections matching the current date filter. */
function getFilteredDetections() {
  const all = getSessionDetections();
  if (dateFilter === 'all') return all;
  return all.filter((d) => getDateKey(d.timestamp) === dateFilter);
}

/** Keeps the date filter's <option> list in sync with whatever dates are
 *  actually present in the session log (grows as Live Monitoring adds
 *  more detections). Preserves the current selection if still valid. */
function populateDateFilterOptions() {
  const select = document.getElementById('reports-date-filter');
  const dateKeys = [...new Set(getSessionDetections().map((d) => getDateKey(d.timestamp)))]
    .sort()
    .reverse();

  // Only rebuild when the set of dates changed — rebuilding on every live
  // update would snap shut a dropdown the user has open.
  const signature = dateKeys.join(',');
  if (select.dataset.dates !== signature) {
    const previousValue = select.value;
    select.innerHTML = '<option value="all">All Dates</option>'
      + dateKeys.map((key) => `<option value="${key}">${formatDateLabel(key)}</option>`).join('');
    select.value = dateKeys.includes(previousValue) ? previousValue : 'all';
    select.dataset.dates = signature;
  }
  dateFilter = select.value;
}

/** Top summary cards — Total, Compliant, Violations, Compliance Rate —
 *  scoped to the current date filter. */
function renderStats(stats) {
  renderKpiCards(document.getElementById('reports-stats'), [
    { value: stats.total, label: 'Total Detections' },
    { value: stats.compliant, label: 'Compliant', tone: 'success' },
    { value: stats.violations, label: 'Violations', tone: 'danger' },
    { value: stats.complianceRate, suffix: '%', label: 'Compliance Rate', tone: 'primary' },
  ]);
}

/** Compliant / violation / pending donut for the current date filter —
 *  same CSS conic-gradient technique as Dashboard's chart. */
function renderComplianceChart(stats) {
  const donut = document.getElementById('reports-donut');
  const legend = document.getElementById('reports-donut-legend');
  const centerLabel = document.getElementById('reports-donut-center');
  const subtitle = document.getElementById('reports-overview-subtitle');

  subtitle.textContent = dateFilter === 'all'
    ? 'Across the entire session'
    : `For ${formatDateLabel(dateFilter)}`;

  setDonut(donut, stats);
  animateNumber(centerLabel, stats.complianceRate, { suffix: '%' });

  legend.innerHTML = `
    <div class="reports-legend-row">
      <span class="reports-legend-dot reports-legend-dot--success"></span>
      <span>Compliant</span>
      <span class="reports-legend-count">${stats.compliant}</span>
    </div>
    <div class="reports-legend-row">
      <span class="reports-legend-dot reports-legend-dot--danger"></span>
      <span>Violation</span>
      <span class="reports-legend-count">${stats.violations}</span>
    </div>
    <div class="reports-legend-row">
      <span class="reports-legend-dot reports-legend-dot--warning"></span>
      <span>Pending Review</span>
      <span class="reports-legend-count">${stats.pending}</span>
    </div>
  `;
}

/** Vertical bar chart of compliant / violation / pending counts for the
 *  current date filter — plain CSS, same palette as the donut. */
function renderStatusBarChart(stats) {
  const chart = document.getElementById('reports-bar-chart');
  const subtitle = document.getElementById('reports-bar-subtitle');
  if (!chart) return;

  subtitle.textContent = dateFilter === 'all'
    ? 'Across the entire session'
    : `For ${formatDateLabel(dateFilter)}`;

  const bars = [
    { label: 'Compliant', value: stats.compliant, tone: 'success' },
    { label: 'Violation', value: stats.violations, tone: 'danger' },
    { label: 'Pending Review', value: stats.pending, tone: 'warning' },
  ];

  chart.setAttribute('aria-label', 'Bar chart of detections by status: '
    + bars.map((b) => `${b.label} ${b.value}`).join(', '));
  renderAnimatedBars(chart, bars, {
    col: 'reports-bar-col', value: 'reports-bar-value', track: 'reports-bar-track',
    bar: 'reports-bar', label: 'reports-bar-label',
  });
  const max = Math.max(...bars.map((b) => b.value), 1);

  chart.setAttribute('aria-label', 'Bar chart of detections by status: '
    + bars.map((b) => `${b.label} ${b.value}`).join(', '));
  chart.innerHTML = bars.map((b) => `
    <div class="reports-bar-col">
      <span class="reports-bar-value">${b.value}</span>
      <div class="reports-bar-track">
        <div class="reports-bar reports-bar--${b.tone}" style="height: ${(b.value / max) * 100}%"></div>
      </div>
      <span class="reports-bar-label">${b.label}</span>
    </div>
  `).join('');
}

/** Plain-language narrative summary + a couple of quick insights, computed
 *  from real data rather than hardcoded — the one piece Reports has that
 *  Dashboard/Violations don't. */
function renderSummaryReport(stats) {
  const textEl = document.getElementById('reports-summary-text');
  const insightsEl = document.getElementById('reports-insights');
  const scopeLabel = dateFilter === 'all' ? 'across the current session' : `on ${formatDateLabel(dateFilter)}`;

  if (stats.total === 0) {
    textEl.textContent = `No detections have been recorded ${scopeLabel} at ${CAMERA_LOCATION}.`;
    insightsEl.innerHTML = '';
    return;
  }

  const standing = stats.complianceRate >= 80 ? 'strong' : stats.complianceRate >= 50 ? 'moderate' : 'low';

  textEl.textContent = `${stats.total} detection${stats.total === 1 ? '' : 's'} recorded ${scopeLabel} `
    + `at ${CAMERA_LOCATION}: ${stats.compliant} compliant, ${stats.violations} in violation, `
    + `and ${stats.pending} pending review — a ${stats.complianceRate}% compliance rate (${standing}).`;

  // These two insights are always computed from the FULL session (not the
  // date filter above) — "best day" only means something across more than
  // one day of data.
  const all = getSessionDetections();
  const byDate = {};
  all.forEach((d) => {
    const key = getDateKey(d.timestamp);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(d);
  });
  const dateEntries = Object.entries(byDate);

  insightsEl.innerHTML = '';

  if (dateEntries.length > 1) {
    let bestDate = null;
    let bestRate = -1;
    let busiestDate = null;
    let busiestCount = -1;

    dateEntries.forEach(([key, records]) => {
      const dayStats = getMockSummaryStats(records);
      if (dayStats.complianceRate > bestRate) {
        bestRate = dayStats.complianceRate;
        bestDate = key;
      }
      if (records.length > busiestCount) {
        busiestCount = records.length;
        busiestDate = key;
      }
    });

    insightsEl.innerHTML += `
      <li><span>Best compliance day</span><span>${formatDateLabel(bestDate)} (${bestRate}%)</span></li>
      <li><span>Busiest day</span><span>${formatDateLabel(busiestDate)} (${busiestCount} detections)</span></li>
    `;
  }

  const lowConfidence = all.filter((d) => d.status === 'pending').length;
  insightsEl.innerHTML += `
    <li><span>Flagged for manual review</span><span>${lowConfidence}</span></li>
    <li><span>Checkpoint</span><span>${CAMERA_LOCATION}</span></li>
  `;
}

/** Stacked compliant/violation/pending bar per day — the one section that
 *  always reflects the FULL session, ignoring the date filter above, same
 *  convention Violations already uses for its own by-date summary. */
function renderTrendByDate() {
  const all = getSessionDetections();
  const byDate = {};
  all.forEach((d) => {
    const key = getDateKey(d.timestamp);
    if (!byDate[key]) byDate[key] = { compliant: 0, violation: 0, pending: 0, total: 0 };
    byDate[key][d.status] += 1;
    byDate[key].total += 1;
  });

  const entries = Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0]));
  const container = document.getElementById('reports-trend-list');

  if (entries.length === 0) {
    container.innerHTML = '<p class="form-hint">No detections yet.</p>';
    return;
  }

  container.innerHTML = entries.map(([dateKey, counts]) => {
    const compliantPct = (counts.compliant / counts.total) * 100;
    const violationPct = (counts.violation / counts.total) * 100;
    const pendingPct = (counts.pending / counts.total) * 100;
    return `
      <div class="reports-trend-row">
        <span class="reports-trend-label">${formatDateLabel(dateKey)}</span>
        <span class="reports-trend-bar-track">
          <span class="reports-trend-bar-segment--success" style="width: ${compliantPct}%"></span>
          <span class="reports-trend-bar-segment--danger" style="width: ${violationPct}%"></span>
          <span class="reports-trend-bar-segment--warning" style="width: ${pendingPct}%"></span>
        </span>
        <span class="reports-trend-count">${counts.total}</span>
      </div>
    `;
  }).join('');
}

function renderAll() {
  populateDateFilterOptions();
  const filtered = getFilteredDetections();
  const stats = getMockSummaryStats(filtered);

  renderStats(stats);
  renderComplianceChart(stats);
  renderStatusBarChart(stats);
  renderSummaryReport(stats);
  renderTrendByDate();
}

document.addEventListener('DOMContentLoaded', () => {
  initShell('reports', 'Reports');
  document.getElementById('reports-trend-camera-label').textContent = CAMERA_LOCATION;

  document.getElementById('reports-date-filter').addEventListener('change', (event) => {
    dateFilter = event.target.value;
    const filtered = getFilteredDetections();
    const stats = getMockSummaryStats(filtered);
    renderStats(stats);
    renderComplianceChart(stats);
    renderStatusBarChart(stats);
    renderSummaryReport(stats);
    // Trend section intentionally not re-rendered here — it always shows
    // the full session regardless of this filter.
  });

  renderAll();

  // Reports update live while monitoring runs in the background — see
  // js/monitoring-engine.js.
  MonitoringEngine.onDetections(renderAll);
});
