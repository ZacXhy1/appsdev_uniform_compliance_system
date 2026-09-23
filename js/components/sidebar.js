/* ==========================================================================
   Sidebar component
   Usage (in each page's own <script> at the bottom):
     renderSidebar('dashboard');
   The string passed in must match a `key` below so the right link gets
   the `is-active` class.
   ========================================================================== */

const SIDEBAR_LINKS = [
  { key: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: '◆' },
  { key: 'monitoring', label: 'Live Monitoring', href: 'monitoring.html', icon: '●' },
  { key: 'detections', label: 'Detections', href: 'detections.html', icon: '▣' },
  { key: 'violations', label: 'Violations', href: 'violations.html', icon: '▲' },
  { key: 'reports', label: 'Reports', href: 'reports.html', icon: '▤' },
  { key: 'settings', label: 'Settings', href: 'settings.html', icon: '⚙' },
];

function renderSidebar(activeKey) {
  const mount = document.getElementById('sidebar');
  if (!mount) return;

  const links = SIDEBAR_LINKS.map((link) => {
    const activeClass = link.key === activeKey ? ' is-active' : '';
    return `
      <a class="sidebar-link${activeClass}" href="${link.href}">
        <span class="sidebar-link-icon">${link.icon}</span>
        <span class="sidebar-link-text">${link.label}</span>
      </a>`;
  }).join('');

  mount.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="sidebar-brand-mark"></span>
        <span class="sidebar-brand-text">
          Uniform Compliance
          <span>Consolatrix College</span>
        </span>
      </div>
      <nav class="sidebar-nav">${links}</nav>
      <div class="sidebar-footer">Demo build &middot; no real data</div>
    </aside>
  `;
}
