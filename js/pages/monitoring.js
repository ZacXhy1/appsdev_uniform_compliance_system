/* ==========================================================================
   Live Monitoring — page logic
   Owner: Zachary (Phase 3)

   Simulates a camera at the Main Gate periodically "detecting" a student
   and classifying them as compliant / violation / pending. There is no
   real camera or AI model — generateDetection() below is the entire
   simulation, and is the function to change if the fake detection
   behavior (odds, timing, confidence range) needs adjusting.
   ========================================================================== */

const MONITORING_INTERVAL_MS = 4000;
const MAX_RECENT = 10;

// Seed the "recent detections" feed with the shared mock data, newest first.
let recentDetections = [...MOCK_DETECTIONS].reverse();
let detectionCounter = MOCK_DETECTIONS.length;
let monitoringTimer = null;
let isMonitoring = false;

/**
 * Fakes a single camera detection. Not real computer vision — just picks
 * a random outcome with roughly realistic odds and a matching confidence
 * range, and labels the "student" generically since there is no real
 * identification (see js/data/mock-data.js scope notes).
 */
function generateDetection() {
  detectionCounter += 1;

  const roll = Math.random();
  let status;
  if (roll < 0.6) {
    status = 'compliant';
  } else if (roll < 0.9) {
    status = 'violation';
  } else {
    status = 'pending';
  }

  const confidence = status === 'pending'
    ? 0.40 + Math.random() * 0.20   // low confidence -> flagged for review
    : 0.85 + Math.random() * 0.14;  // confident read either way

  return {
    id: `DTC-${Date.now()}`,
    label: `Student ${detectionCounter}`,
    timestamp: new Date().toISOString(),
    status,
    confidence: Math.round(confidence * 100) / 100,
  };
}

function renderResultCard(detection) {
  const mount = document.getElementById('monitoring-result-content');
  if (!mount) return;

  const meta = getStatusPillMeta(detection.status);

  mount.innerHTML = `
    <div class="monitoring-result">
      <div class="monitoring-result-row">
        <span class="monitoring-result-label">${detection.label}</span>
        <span class="status-pill ${meta.className}">${meta.label}</span>
      </div>
      <div class="monitoring-result-meta">
        <span>${formatTimestamp(detection.timestamp)}</span>
        <span>${Math.round(detection.confidence * 100)}% confidence</span>
      </div>
    </div>
  `;
}

function renderRecentDetections() {
  const body = document.getElementById('monitoring-recent-body');
  if (!body) return;

  if (recentDetections.length === 0) {
    body.innerHTML = `<tr><td colspan="5">No detections yet.</td></tr>`;
    return;
  }

  body.innerHTML = recentDetections.slice(0, MAX_RECENT).map((d) => {
    const meta = getStatusPillMeta(d.status);
    return `
      <tr>
        <td>${d.id}</td>
        <td>${d.label}</td>
        <td>${formatTimestamp(d.timestamp)}</td>
        <td><span class="status-pill ${meta.className}">${meta.label}</span></td>
        <td>${Math.round(d.confidence * 100)}%</td>
      </tr>
    `;
  }).join('');
}

function updateStatusIndicator() {
  const dot = document.getElementById('monitoring-status-dot');
  const text = document.getElementById('monitoring-status-text');
  const toggleBtn = document.getElementById('monitoring-toggle');

  if (isMonitoring) {
    dot.classList.add('is-live');
    text.textContent = 'Live — watching Main Gate';
    toggleBtn.textContent = 'Stop Monitoring';
  } else {
    dot.classList.remove('is-live');
    text.textContent = 'Idle';
    toggleBtn.textContent = 'Start Monitoring';
  }
}

function tick() {
  const detection = generateDetection();
  recentDetections.unshift(detection);
  if (recentDetections.length > MAX_RECENT) {
    recentDetections.length = MAX_RECENT;
  }
  renderResultCard(detection);
  renderRecentDetections();
}

function startMonitoring() {
  if (isMonitoring) return;
  isMonitoring = true;
  updateStatusIndicator();
  tick(); // fire one immediately so it doesn't feel idle for 4s
  monitoringTimer = setInterval(tick, MONITORING_INTERVAL_MS);
}

function stopMonitoring() {
  isMonitoring = false;
  clearInterval(monitoringTimer);
  monitoringTimer = null;
  updateStatusIndicator();
}

document.addEventListener('DOMContentLoaded', () => {
  initShell('monitoring', 'Live Monitoring');

  renderRecentDetections();
  if (recentDetections.length > 0) {
    renderResultCard(recentDetections[0]);
  }

  document.getElementById('monitoring-toggle').addEventListener('click', () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  });
});
