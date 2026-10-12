/* ==========================================================================
   Live Monitoring — page logic
   Owner: Zachary (Phase 3)

   Camera feed: tries to attach a real webcam via getUserMedia() (see
   tryAttachRealCamera() below) — if the device has no camera, permission
   is denied, or the API is unavailable, it falls back to a simulated
   placeholder view. Either way, this is purely visual.

   Detection: there is no real AI model reading the camera, and it no longer
   runs on this page. The timer and the fake detection generator live in
   js/monitoring-engine.js, which is loaded on EVERY page so monitoring keeps
   going while you browse elsewhere. This page just starts/stops the engine,
   attaches the (purely visual) camera, and re-renders whenever the engine
   announces new detections. generateDetection() in the engine is the
   function to change if the fake odds, timing or confidence need adjusting.
   ========================================================================== */

const MAX_RECENT_DISPLAY = 5;

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

function renderResultCard(detection) {
  const mount = document.getElementById('monitoring-result-content');
  if (!mount) return;

  const meta = getStatusPillMeta(detection.status);

  mount.innerHTML = `
    <div class="monitoring-result">
      ${renderEvidenceFrame(detection)}
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

  const allDetections = getSessionDetections();
  if (allDetections.length === 0) {
    body.innerHTML = `<tr><td colspan="5">No detections yet.</td></tr>`;
    return;
  }

  // Newest first, capped to MAX_RECENT_DISPLAY — the session log itself keeps
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
  const stats = getMockSummaryStats(getSessionDetections());
  document.getElementById('today-total-value').textContent = stats.total;
  document.getElementById('today-compliant-value').textContent = stats.compliant;
  document.getElementById('today-violation-value').textContent = stats.violations;
}

function updateStatusIndicator() {
  const isMonitoring = MonitoringEngine.isActive();
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

/** Re-renders everything that depends on the detection log. Called when the
 *  engine adds detections (whether this page or a previous one started it). */
function renderLatest(detections) {
  const latest = detections && detections.length
    ? detections[detections.length - 1]
    : getSessionDetections().slice(-1)[0];
  if (latest) renderResultCard(latest);
  renderRecentDetections();
  renderTodayStats();
}

function startMonitoring() {
  MonitoringEngine.start();   // flips the shared flag, fires the first detection now
  updateStatusIndicator();
  tryAttachRealCamera();      // best-effort; falls back to simulated view on failure
}

function stopMonitoring() {
  MonitoringEngine.stop();
  stopRealCamera();
  updateStatusIndicator();
}

document.addEventListener('DOMContentLoaded', () => {
  initShell('monitoring', 'Live Monitoring');

  renderLatest();
  updateStatusIndicator();

  // Clock runs regardless of monitoring state — it's just the current time.
  updateFeedClock();
  setInterval(updateFeedClock, 1000);

  document.getElementById('monitoring-toggle').addEventListener('click', () => {
    if (MonitoringEngine.isActive()) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  });

  // New detections from the engine (every ~4s while monitoring is on).
  MonitoringEngine.onDetections(({ detections }) => renderLatest(detections));

  // Release the camera if the user navigates away/closes the tab while
  // monitoring is running, rather than leaving the light on.
  window.addEventListener('beforeunload', stopRealCamera);

  // Monitoring was left running (e.g. started here, then you browsed other
  // pages, which kept detecting in the background) — the engine has already
  // resumed on its own, so all that's left for this page is the camera. A
  // fresh page can't hold the old stream, so the browser may ask for camera
  // permission again (expected).
  if (MonitoringEngine.isActive()) {
    tryAttachRealCamera();
  }
});
