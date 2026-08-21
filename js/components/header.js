/* ==========================================================================
   Header component
   Usage: renderHeader('Dashboard');
   Login/real user identity comes in Phase 1 — for now this shows a
   static demo placeholder so the shell looks complete.
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
      </div>
    </header>
  `;
}
