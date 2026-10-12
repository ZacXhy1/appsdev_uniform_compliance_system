/* ==========================================================================
   Header component
   Usage: renderHeader('Dashboard');
   User identity is still a static demo label (no real accounts — see
   PROJECT_BRIEF.md Section 8). Logout is real as of Phase 1: it clears the
   demo auth flag via js/auth.js and redirects to login.html.
   ========================================================================== */

function renderHeader(pageTitle) {
  const mount = document.getElementById('header');
  if (!mount) return;

  mount.innerHTML = `
    <header class="header">
      <h1 class="header-title">${pageTitle}</h1>
      <div class="header-user">
        <a class="header-live" id="header-live" href="monitoring.html" hidden
           title="Live Monitoring is running \u2014 open it">
          <span class="header-live-dot"></span>
          <span class="header-live-text">Monitoring live</span>
        </a>
        <span class="header-user-avatar">A</span>
        <span>Admin (Demo)</span>
        <button type="button" class="header-logout" id="logoutBtn">Log Out</button>
      </div>
    </header>
  `;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  updateHeaderLive();
  // Keep the pill in sync if monitoring is started/stopped while this page is
  // open (MonitoringEngine is loaded after this file, so look it up lazily).
  if (typeof MonitoringEngine !== 'undefined') {
    MonitoringEngine.onStateChange(updateHeaderLive);
  }
}

/** Shows the "Monitoring live" pill on every page while Live Monitoring is
 *  running in the background. Hidden on the Monitoring page itself, which
 *  already shows its own LIVE status. */
function updateHeaderLive() {
  const pill = document.getElementById('header-live');
  if (!pill || typeof MonitoringEngine === 'undefined') return;
  const onMonitoringPage = /monitoring\.html$/.test(window.location.pathname);
  pill.hidden = !MonitoringEngine.isActive() || onMonitoringPage;
}
