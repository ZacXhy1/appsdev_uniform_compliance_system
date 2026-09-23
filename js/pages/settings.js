/* ==========================================================================
   Settings — page logic
   Owner: Dean (Phase 7)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initShell('settings', 'Settings');

  // TODO (Phase 7): build out Settings using MOCK_DETECTIONS from
  // js/data/mock-data.js. See docs/PHASES.md for the deliverable.
});
/* ==========================================================================
   Settings — page logic
   Owner: Dean (Phase 7)

   Reads/writes preferences via js/settings.js (getSettings, saveSettings,
   resetSettings — loaded in <head> on every page so theme/density apply
   app-wide, not just here). This file is only responsible for the form
   UI and for the demo data reset action.
   ========================================================================== */

function renderSettingsForm() {
  const settings = getSettings();
  const root = document.getElementById('settings-root');

  root.innerHTML = `
    <div class="card settings-section">
      <h2>Appearance</h2>
      <div class="settings-row">
        <div class="settings-row-text">
          <strong>Dark Mode</strong>
          <p class="form-hint">Switch the dashboard to a dark color scheme.</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="setting-theme" ${settings.theme === 'dark' ? 'checked' : ''} />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="card settings-section">
      <h2>Display</h2>
      <div class="settings-row">
        <div class="settings-row-text">
          <strong>Compact View</strong>
          <p class="form-hint">Reduce spacing in cards and tables to fit more on screen.</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="setting-compact" ${settings.compactView ? 'checked' : ''} />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="card settings-section">
      <h2>Notifications</h2>
      <div class="settings-row">
        <div class="settings-row-text">
          <strong>Detection Alerts</strong>
          <p class="form-hint">Show an alert when a new violation is detected.</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="setting-notifications" ${settings.notifications ? 'checked' : ''} />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="settings-row settings-row--action">
        <p class="form-hint" id="notification-test-hint">
          ${settings.notifications
            ? 'Alerts are on — send a sample to see how it looks.'
            : 'Alerts are off. Turn them on to send a sample.'}
        </p>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          id="test-notification-btn"
          ${settings.notifications ? '' : 'disabled'}
        >
          Send Test Alert
        </button>
      </div>
    </div>

    <div class="card settings-section">
      <h2>Demo Data</h2>
      <p class="form-hint">
        This is a frontend-only demo build — detections live in this browser
        tab's session only, and preferences live in this browser. Use these
        controls to reset either one back to a clean state.
      </p>
      <div class="settings-actions">
        <button type="button" class="btn btn-secondary" id="reset-detections-btn">Reset Detection Data</button>
        <button type="button" class="btn btn-secondary" id="restore-defaults-btn">Restore Default Settings</button>
      </div>
    </div>
  `;

  wireSettingsForm();
}

function wireSettingsForm() {
  document.getElementById('setting-theme').addEventListener('change', (event) => {
    saveSettings({ theme: event.target.checked ? 'dark' : 'light' });
    showToast('Theme updated.');
  });

  document.getElementById('setting-compact').addEventListener('change', (event) => {
    saveSettings({ compactView: event.target.checked });
    showToast('Display preference updated.');
  });

  document.getElementById('setting-notifications').addEventListener('change', (event) => {
    saveSettings({ notifications: event.target.checked });
    renderSettingsForm();
    showToast(event.target.checked ? 'Detection alerts turned on.' : 'Detection alerts turned off.');
  });

  document.getElementById('test-notification-btn').addEventListener('click', () => {
    showToast('Sample alert: a new student was flagged — not in uniform (Main Gate).', 'warning');
  });

  document.getElementById('reset-detections-btn').addEventListener('click', () => {
    confirmAction(
      'Reset detection data?',
      'This clears every detection generated this session and restores the original demo dataset. This cannot be undone.',
      () => {
        resetSessionDetections();
        showToast('Detection data reset.');
      },
    );
  });

  document.getElementById('restore-defaults-btn').addEventListener('click', () => {
    confirmAction(
      'Restore default settings?',
      'This resets theme, display, and notification preferences back to their defaults.',
      () => {
        resetSettings();
        renderSettingsForm();
        showToast('Settings restored to defaults.');
      },
    );
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initShell('settings', 'Settings');
  renderSettingsForm();
});
