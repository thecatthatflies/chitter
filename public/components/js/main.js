(() => {
  const config = Object.freeze({
    apiBase: "https://chitterapi.unboundlabs.dev",
    routes: Object.freeze({
      home: "/home",
      login: "/login",
    }),
  });
  const authState = {
    status: "loading",
    user: null,
    initPromise: null,
    listeners: new Set(),
  };
  const normalizePath = (path = window.location.pathname || "/") => {
    const trimmed = String(path).replace(/\/+$/, "");
    return trimmed || "/";
  };
  const pathMatches = (path, options) => options.includes(normalizePath(path));
  const isLoginPath = (path = window.location.pathname) =>
    pathMatches(path, ["/login", "/login.html"]);
  const isProtectedPath = (path = window.location.pathname) => {
    const normalizedPath = normalizePath(path);
    if (
      pathMatches(normalizedPath, [
        "/home",
        "/home.html",
        "/server",
        "/server.html",
        "/friends",
        "/friends.html",
        "/chat",
        "/chat.html",
      ])
    )
      return true;
    return (
      normalizedPath.startsWith("/server/") ||
      normalizedPath.startsWith("/servers/") ||
      normalizedPath.startsWith("/friends/") ||
      normalizedPath.startsWith("/chat/")
    );
  };
  const notifyAuthListeners = () => {
    const snapshot = Object.freeze({
      status: authState.status,
      user: authState.user,
    });
    authState.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch {
        // Ignore listener errors to avoid breaking auth flow.
      }
    });
  };
  const setAuthState = (status, user = null) => {
    authState.status = status;
    authState.user = user;
    notifyAuthListeners();
  };
  const getAuthState = () =>
    Object.freeze({
      status: authState.status,
      user: authState.user,
    });
  const onAuthChange = (listener) => {
    if (typeof listener !== "function") return () => {};
    authState.listeners.add(listener);
    return () => authState.listeners.delete(listener);
  };
  const buildAppPath = (path = "/") => {
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith("/")) return path;
    return `/${path}`;
  };
  const navigate = (path, options = {}) => {
    const { replace = false } = options;
    const targetPath = buildAppPath(path);
    if (replace) {
      window.location.replace(targetPath);
      return;
    }
    window.location.assign(targetPath);
  };
  const invalidateAuth = (options = {}) => {
    const { redirectToLogin = false } = options;
    setAuthState("unauthenticated", null);
    if (redirectToLogin && !isLoginPath())
      navigate(config.routes.login, { replace: true });
  };
  const escapeHTML = (value = "") =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const formatTime = (isoTime) => {
    if (!isoTime) return "";
    const date = new Date(isoTime);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };
  const toQueryString = (params = {}) => {
    const entries = Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    );
    return entries.length ? `?${new URLSearchParams(entries).toString()}` : "";
  };
  const buildUrl = (path, query) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    if (!query || Object.keys(query).length === 0)
      return `${config.apiBase}${normalizedPath}`;
    return `${config.apiBase}${normalizedPath}${toQueryString(query)}`;
  };
  const apiFetch = async (path, options = {}) => {
    const { method = "GET", headers = {}, body, query, signal } = options;
    const isProtectedRequest = options.protected !== false;
    const requestHeaders = new Headers(headers);
    if (body !== undefined && !requestHeaders.has("Content-Type"))
      requestHeaders.set("Content-Type", "application/json");
    let response;
    try {
      response = await fetch(buildUrl(path, query), {
        method,
        headers: requestHeaders,
        body:
          body === undefined
            ? undefined
            : typeof body === "string"
              ? body
              : JSON.stringify(body),
        mode: "cors",
        credentials: "include",
        signal,
      });
    } catch {
      return {
        ok: false,
        status: 0,
        data: null,
        error:
          "Unable to reach chitter right now. Check your connection and try again.",
      };
    }
    let data;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      const text = await response.text().catch(() => "");
      data = text ? { message: text } : null;
    }
    if (!response.ok) {
      const error =
        (data && (data.error || data.message || data.detail)) ||
        `Request failed with status ${response.status}.`;
      if (response.status === 401 && isProtectedRequest) {
        invalidateAuth({ redirectToLogin: isProtectedPath() });
      }
      return { ok: false, status: response.status, data, error };
    }
    return { ok: true, status: response.status, data, error: "" };
  };
  const initializeAuth = () => {
    if (authState.initPromise) return authState.initPromise;
    setAuthState("loading", null);
    authState.initPromise = (async () => {
      const response = await apiFetch("/auth/me", { protected: false });
      if (response.ok && response.data && response.data.user) {
        setAuthState("authenticated", response.data.user);
      } else {
        setAuthState("unauthenticated", null);
      }
      return getAuthState();
    })();
    return authState.initPromise;
  };
  const guardRoute = async (type) => {
    await initializeAuth();
    const state = getAuthState();
    if (type === "protected") {
      if (state.status !== "authenticated") {
        navigate(config.routes.login, { replace: true });
        return false;
      }
      return true;
    }
    if (type === "public") {
      if (state.status === "authenticated") {
        navigate(config.routes.home, { replace: true });
        return false;
      }
      return true;
    }
    return true;
  };
  const logout = async () => {
    const response = await apiFetch("/auth/logout", {
      method: "POST",
      protected: false,
    });
    invalidateAuth();
    return response;
  };
  const getQueryParam = (key) =>
    new URLSearchParams(window.location.search).get(key);
  const setStatus = (element, text, className = "") => {
    if (!element) return;
    element.textContent = text || "";
    element.className = `status${className ? ` ${className}` : ""}`;
    element.hidden = !text;
  };
  window.Chitter = {
    config,
    apiFetch,
    initializeAuth,
    getAuthState,
    onAuthChange,
    invalidateAuth,
    guardRoute,
    logout,
    escapeHTML,
    formatTime,
    toQueryString,
    getQueryParam,
    navigate,
    setStatus,
    isLoginPath,
    isProtectedPath,
  };
})();
