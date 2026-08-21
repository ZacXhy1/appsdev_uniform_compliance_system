/* ==========================================================================
   Stat card component (stub)
   Owned by: Paul (Dashboard & Reports phase)
   Purpose: render a single stat-card.stat-card block (see components.css)
   given a { value, label } shape. Build this out in Phase 2.
   ========================================================================== */

function renderStatCard(value, label) {
  return `
    <div class="card stat-card">
      <div class="stat-card-value">${value}</div>
      <div class="stat-card-label">${label}</div>
    </div>
  `;
}
