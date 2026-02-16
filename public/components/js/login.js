(() => {
  const api = window.Chitter;
  if (!api) return;
  const loginButton = document.getElementById("discord-login");
  const statusEl = document.getElementById("login-status");
  const errorEl = document.getElementById("login-error");
  const showStatus = (text, type = "status-loading") => {
    api.setStatus(statusEl, text, type);
    api.setStatus(errorEl, "", "");
  };
  const setBusy = (busy) => {
    if (!loginButton) return;
    loginButton.disabled = busy;
    loginButton.textContent = busy ? "Connecting..." : "Login with Discord";
  };
  const redirectToDiscord = () => {
    setBusy(true);
    showStatus("Redirecting to Discord...", "status-loading");
    window.location.assign(`${api.config.apiBase}/auth/discord`);
  };
  document.addEventListener("DOMContentLoaded", async () => {
    setBusy(true);
    showStatus("Checking session...", "status-loading");
    const canViewLogin = await api.guardRoute("public");
    if (!canViewLogin) return;
    setBusy(false);
    api.setStatus(errorEl, "", "");
    showStatus("Sign in with Discord to access chitter.", "");
    if (loginButton) loginButton.addEventListener("click", redirectToDiscord);
  });
})();
