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

/**
 * Evidence snapshot frame — the photo/video "proof" shown with a detection
 * on Live Monitoring, Detections and Violations (incl. the review modal).
 * For now it's an empty avatar placeholder because nothing analyzes real
 * video (see brief Sections 2 & 13). When real snapshots exist, this is
 * the ONE function to change: render an <img>/<video> instead of the SVG.
 * @param {object} detection - the detection record (unused until real
 *   snapshots exist, but passed so call sites won't need to change)
 * @param {boolean} [compact] - smaller frame, used inside modals
 */
function renderEvidenceFrame(detection, compact = false) {
  const sizeClass = compact ? ' evidence-frame--compact' : '';
  return `
    <div class="evidence-frame${sizeClass}" role="img" aria-label="Snapshot for ${detection.label} (placeholder)">
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <circle cx="100" cy="58" r="30" fill="currentColor"/>
        <path d="M30 150c0-38 31-58 70-58s70 20 70 58z" fill="currentColor"/>
      </svg>
    </div>
  `;
}

/**
 * Footer for a details modal that lets staff correct a CONFIDENT result
 * the system got wrong (compliant <-> violation). Returns '' for pending
 * detections — those use the existing "Confirm Compliant / Confirm
 * Violation" review flow on the Detections page instead.
 * Used by Detections and Violations so both modals behave identically.
 */
function renderCorrectionActions(detection) {
  if (detection.status === 'compliant') {
    return `
      <p class="review-note">Think the system got this wrong? You can correct the result.</p>
      <div class="review-actions">
        <button type="button" class="btn btn-danger" onclick="correctDetection('${detection.id}', 'violation')">Change to Violation</button>
      </div>
    `;
  }
  if (detection.status === 'violation') {
    return `
      <p class="review-note">Think the system got this wrong? You can correct the result.</p>
      <div class="review-actions">
        <button type="button" class="btn btn-success" onclick="correctDetection('${detection.id}', 'compliant')">Change to Compliant</button>
      </div>
    `;
  }
  return '';
}

/**
 * Asks for confirmation, then saves the correction via
 * correctSessionDetection() (mock-data.js). Afterwards it calls the
 * page's own refreshAfterStatusChange() — each page that uses
 * renderCorrectionActions() defines that function to re-render itself.
 */
function correctDetection(id, newStatus) {
  const label = newStatus === 'violation' ? 'Violation' : 'Compliant';
  confirmAction(
    `Change ${id} to ${label}?`,
    'This overrides the system\'s result and marks the detection as manually reviewed. '
      + 'Dashboard, Violations and Reports will update to match.',
    () => {
      if (!correctSessionDetection(id, newStatus)) return;
      if (typeof refreshAfterStatusChange === 'function') refreshAfterStatusChange();
      showToast(`${id} changed to ${label.toLowerCase()}.`);
    },
  );
}


/* ==========================================================================
   Motion helpers — shared by Dashboard and Reports so numbers and charts
   animate the same way on both. All of them respect "reduce motion".
   ========================================================================== */

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Counts an element's number from whatever it currently shows to `to`.
 * Remembers the current value in data-value, so the next call continues from
 * there (0 -> 42 on first draw, 42 -> 43 when a new detection arrives).
 * @param {{suffix?: string, bump?: boolean}} [opts] bump: pop the number when it changes.
 */
function animateNumber(el, to, { suffix = '', bump = false } = {}) {
  if (!el) return;
  const from = Number(el.dataset.value) || 0;
  el.dataset.value = String(to);
  if (el._countFrame) cancelAnimationFrame(el._countFrame);

  if (from === to || prefersReducedMotion()) {
    el.textContent = `${to}${suffix}`;
    return;
  }

  if (bump) {
    el.classList.remove('is-bumped');
    void el.offsetWidth; // restart the animation if it is already running
    el.classList.add('is-bumped');
  }

  const duration = Math.min(900, 350 + Math.abs(to - from) * 12);
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out
    el.textContent = `${Math.round(from + (to - from) * eased)}${suffix}`;
    if (t < 1) el._countFrame = requestAnimationFrame(step);
  };
  el._countFrame = requestAnimationFrame(step);
}

/**
 * Draws KPI stat cards. The first call builds the cards and counts them up
 * from 0; later calls (live updates, a changed date filter) keep the same
 * cards and count each number to its new value, so nothing flashes or resets.
 * @param {Array<{value: number, label: string, tone?: string, suffix?: string}>} items
 */
function renderKpiCards(mount, items) {
  if (!mount) return;
  const isFirstDraw = mount.querySelectorAll('.stat-card').length !== items.length;
  if (isFirstDraw) {
    mount.innerHTML = items
      .map((item) => renderStatCard(`0${item.suffix || ''}`, item.label, item.tone))
      .join('');
  }
  mount.querySelectorAll('.stat-card-value').forEach((el, i) => {
    animateNumber(el, items[i].value, { suffix: items[i].suffix, bump: !isFirstDraw });
  });
}

/**
 * Compliant / violation / pending donut. The slices are CSS variables that
 * css/components.css transitions, so the ring sweeps in on first draw and
 * smoothly re-slices when the numbers change. Replaces setting
 * style.background to a conic-gradient directly.
 */
function setDonut(donut, stats) {
  if (!donut) return;
  let compliant = 0;
  let violation = 0;
  let pending = 0;
  if (stats.total > 0) {
    compliant = (stats.compliant / stats.total) * 100;
    violation = (stats.violations / stats.total) * 100;
    pending = Math.max(0, 100 - compliant - violation); // fills any rounding gap
  }
  if (!donut.classList.contains('donut-animated')) {
    donut.classList.add('donut-animated');
    void donut.offsetWidth; // commit the empty ring so the first draw animates
  }
  donut.style.setProperty('--donut-compliant', `${compliant}%`);
  donut.style.setProperty('--donut-violation', `${violation}%`);
  donut.style.setProperty('--donut-pending', `${pending}%`);
}

/**
 * Vertical bar chart. Builds the bars at height 0 and grows them on first
 * draw; afterwards it only changes heights and numbers in place, so the CSS
 * `transition: height` actually runs (rebuilding the HTML each time, as the
 * pages used to, threw the old bars away and made it impossible).
 * @param {{col: string, value: string, track: string, bar: string, label: string}} cls class names of the chart's markup
 */
function renderAnimatedBars(chart, bars, cls) {
  if (!chart) return;
  const max = Math.max(...bars.map((b) => b.value), 1);

  if (chart.querySelectorAll(`.${cls.bar}`).length !== bars.length) {
    chart.innerHTML = bars.map((b) => `
      <div class="${cls.col}">
        <span class="${cls.value}">0</span>
        <div class="${cls.track}">
          <div class="${cls.bar} ${cls.bar}--${b.tone}" style="height: 0%"></div>
        </div>
        <span class="${cls.label}">${b.label}</span>
      </div>
    `).join('');
    void chart.offsetWidth; // commit height 0 so the grow transition runs
  }

  const barEls = chart.querySelectorAll(`.${cls.bar}`);
  const valueEls = chart.querySelectorAll(`.${cls.value}`);
  bars.forEach((b, i) => {
    barEls[i].style.height = `${(b.value / max) * 100}%`;
    animateNumber(valueEls[i], b.value);
  });
}
