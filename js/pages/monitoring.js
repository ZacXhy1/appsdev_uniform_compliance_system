/* ==========================================================================
   Live Monitoring — page logic
   Owner: Zachary (Phase 3)

   Camera feed: tries to attach a real webcam via getUserMedia() (see
   tryAttachRealCamera() below) — if the device has no camera, permission
   is denied, or the API is unavailable, it falls back to a simulated
   placeholder view. Either way, this is purely visual.

   Detection: there is no real AI model reading the camera. Detections
   are entirely fake — generateDetection() below rolls a random outcome
   on a timer, regardless of whether a real or simulated feed is showing.
   That's the function to change if the fake detection behavior (odds,
   timing, confidence range) needs adjusting.
   ========================================================================== */

const MONITORING_INTERVAL_MS = 4000;
const MAX_RECENT_DISPLAY = 5;
const MONITORING_ACTIVE_KEY = 'ucms_monitoring_active';

// Session-persisted history (see getSessionDetections() in
// js/data/mock-data.js) — survives navigating to other pages within the
// same tab, so Detections/Dashboard/etc. see what Monitoring generates.
let allDetections = getSessionDetections();
let detectionCounter = allDetections.length;
let monitoringTimer = null;
let isMonitoring = false;
let cameraStream = null;

/**
 * Tries to attach a real webcam to the feed if the browser/device has one
 * and the user grants permission. Falls back to the simulated placeholder
 * on any failure (no camera, permission denied, insecure context, etc.)
 * — this NEVER blocks the detection simulation, which runs identically
 * either way. The video is purely visual; nothing reads pixels from it.
 */
async function tryAttachRealCamera() {
  const video = document.getElementById('monitoring-video');
  const placeholder = document.getElementById('monitoring-feed-placeholder');
  const placeholderText = document.getElementById('monitoring-feed-placeholder-text');
  const cameraLabel = document.getElementById('monitoring-feed-camera-label');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return; // API unsupported (old browser, or non-secure context) — stay on placeholder
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = cameraStream;
    video.hidden = false;
    placeholder.hidden = true;
    // Real video is showing — move the "Main Gate Camera Feed" label out of
    // the center (where the placeholder used to have it) into the corner,
    // like a CCTV overlay label, instead of covering the video.
    cameraLabel.hidden = false;
  } catch (err) {
    // No camera, permission denied, or camera in use elsewhere — this is
    // an expected/common outcome, not a bug. Just show the simulated view.
    placeholderText.textContent = 'Main Gate Camera Feed (simulated — no camera detected)';
  }
}

function stopRealCamera() {
  const video = document.getElementById('monitoring-video');
  const placeholder = document.getElementById('monitoring-feed-placeholder');
  const cameraLabel = document.getElementById('monitoring-feed-camera-label');

  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  video.hidden = true;
  video.srcObject = null;
  placeholder.hidden = false;
  cameraLabel.hidden = true;
}

/** Live clock shown in the feed's top-right corner. Runs continuously,
 *  independent of monitoring state — it's just "what time is it right now." */
function updateFeedClock() {
  const el = document.getElementById('monitoring-feed-datetime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit',
  });
}

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

  if (allDetections.length === 0) {
    body.innerHTML = `<tr><td colspan="5">No detections yet.</td></tr>`;
    return;
  }

  // Newest first, capped to MAX_RECENT_DISPLAY — allDetections itself keeps
  // growing so today's stats stay accurate even once older rows scroll off.
  const recent = [...allDetections].reverse().slice(0, MAX_RECENT_DISPLAY);

  body.innerHTML = recent.map((d) => {
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

/** Updates the "Today's Detections / Compliant / Non-Compliant" stat row,
 *  computed from the full session history via getMockSummaryStats()
 *  (see js/data/mock-data.js). */
function renderTodayStats() {
  const stats = getMockSummaryStats(allDetections);
  document.getElementById('today-total-value').textContent = stats.total;
  document.getElementById('today-compliant-value').textContent = stats.compliant;
  document.getElementById('today-violation-value').textContent = stats.violations;
}

function updateStatusIndicator() {
  const dot = document.getElementById('monitoring-status-dot');
  const text = document.getElementById('monitoring-status-text');
  const toggleBtn = document.getElementById('monitoring-toggle');
  const feedDot = document.getElementById('monitoring-feed-dot');
  const feedText = document.getElementById('monitoring-feed-status-text');
  const todayStatus = document.getElementById('today-status-value');

  if (isMonitoring) {
    dot.classList.add('is-live');
    text.textContent = 'Live — watching Main Gate';
    toggleBtn.textContent = 'Stop Monitoring';

    feedDot.classList.add('is-live');
    feedText.textContent = 'LIVE';

    todayStatus.textContent = 'Monitoring';
  } else {
    dot.classList.remove('is-live');
    text.textContent = 'Idle';
    toggleBtn.textContent = 'Start Monitoring';

    feedDot.classList.remove('is-live');
    feedText.textContent = 'IDLE';

    todayStatus.textContent = 'Idle';
  }
}

function tick() {
  const detection = generateDetection();
  allDetections = addSessionDetection(detection); // persists across page loads
  renderResultCard(detection);
  renderRecentDetections();
  renderTodayStats();
}

function startMonitoring() {
  if (isMonitoring) return;
  isMonitoring = true;
  sessionStorage.setItem(MONITORING_ACTIVE_KEY, 'true');
  updateStatusIndicator();
  tryAttachRealCamera(); // best-effort; falls back to simulated view on failure
  tick(); // fire one immediately so it doesn't feel idle for 4s
  monitoringTimer = setInterval(tick, MONITORING_INTERVAL_MS);
}

function stopMonitoring() {
  isMonitoring = false;
  sessionStorage.setItem(MONITORING_ACTIVE_KEY, 'false');
  clearInterval(monitoringTimer);
  monitoringTimer = null;
  stopRealCamera();
  updateStatusIndicator();
}

document.addEventListener('DOMContentLoaded', () => {
  initShell('monitoring', 'Live Monitoring');

  renderRecentDetections();
  renderTodayStats();
  if (allDetections.length > 0) {
    renderResultCard(allDetections[allDetections.length - 1]);
  }

  // Clock runs regardless of monitoring state — it's just the current time.
  updateFeedClock();
  setInterval(updateFeedClock, 1000);

  document.getElementById('monitoring-toggle').addEventListener('click', () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  });

  // Release the camera if the user navigates away/closes the tab while
  // monitoring is running, rather than leaving the light on.
  window.addEventListener('beforeunload', stopRealCamera);

  // If monitoring was left running when the user navigated to another
  // page, resume it automatically on return — feels continuous, even
  // though a real page load can't literally keep the old interval alive.
  // Note: this does NOT "catch up" on ticks missed while away, and if a
  // real camera was attached before, the browser will just ask for
  // permission again (expected — a fresh page can't hold onto the old
  // camera stream).
  if (sessionStorage.getItem(MONITORING_ACTIVE_KEY) === 'true') {
    startMonitoring();
  }
});
