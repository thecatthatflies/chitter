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
  const showError = (text) => {
    api.setStatus(errorEl, text, "status-error");
    api.setStatus(statusEl, "", "");
  };
  const setBusy = (busy) => {
    if (!loginButton) return;
    loginButton.disabled = busy;
    loginButton.textContent = busy ? "Connecting..." : "Login with Discord";
  };
  const redirectToDiscord = () => {
    const redirectUri = `${window.location.origin}/login.html`;
    const authUrl = `${api.config.apiBase}/auth/discord?redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.assign(authUrl);
  };
  const completeDiscordCallback = async () => {
    const code = api.getQueryParam("code");
    const state = api.getQueryParam("state");
    const oauthError = api.getQueryParam("error");
    if (oauthError) {
      showError("Discord login was canceled or failed. Please try again.");
      return;
    }
    if (!code) {
      showStatus("Sign in with Discord to access chitter.", "");
      return;
    }
    setBusy(true);
    showStatus("Completing Discord sign-in...", "status-loading");
    const query = { code };
    if (state) query.state = state;
    const response = await api.apiFetch("/auth/discord/callback", {
      auth: false,
      query,
    });
    if (!response.ok) {
      showError(
        response.error || "Unable to complete login. Please try again.",
      );
      setBusy(false);
      return;
    }
    const payload = response.data || {};
    if (!payload.jwt) {
      showError("Authentication succeeded but no access token was returned.");
      setBusy(false);
      return;
    }
    api.setJWT(payload.jwt);
    if (payload.user) api.setUser(payload.user);
    showStatus("Login successful. Redirecting to home...", "status-success");
    window.history.replaceState({}, document.title, "login.html");
    window.setTimeout(() => api.navigate("home.html"), 500);
  };
  document.addEventListener("DOMContentLoaded", () => {
    if (api.getJWT()) {
      api.navigate("home.html");
      return;
    }
    if (loginButton) loginButton.addEventListener("click", redirectToDiscord);
    completeDiscordCallback();
  });
})();
