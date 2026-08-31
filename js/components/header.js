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
}
