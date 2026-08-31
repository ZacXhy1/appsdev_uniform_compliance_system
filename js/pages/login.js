/* ==========================================================================
   Login — page logic
   Owner: Earl (Phase 1)
   No sidebar/header on this screen — it is the entry point before the app
   shell applies. Demo-level validation only; see js/auth.js for the actual
   login() / requireAuth() logic shared across the app.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorBox = document.getElementById('loginError');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showError('Enter both a username and password.');
      return;
    }

    if (login(username, password)) {
      window.location.href = 'dashboard.html';
    } else {
      showError('Incorrect username or password.');
    }
  });

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }
});
