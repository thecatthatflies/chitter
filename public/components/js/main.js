(() => {
  const config = Object.freeze({
    apiBase: "https://chitterapi.unboundlabs.dev",
    jwtStorageKey: "chitter.jwt",
    userStorageKey: "chitter.user",
    jwtCookieName: "chitter_jwt",
  });
  const safeParse = (value, fallback = null) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };
  const setCookie = (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  };
  const getCookie = (name) => {
    const prefix = `${encodeURIComponent(name)}=`;
    const match = document.cookie
      .split("; ")
      .find((part) => part.startsWith(prefix));
    return match ? decodeURIComponent(match.slice(prefix.length)) : "";
  };
  const deleteCookie = (name) => {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  };
  const setJWT = (jwt) => {
    if (!jwt) return;
    localStorage.setItem(config.jwtStorageKey, jwt);
    setCookie(config.jwtCookieName, jwt, 7);
  };
  const getJWT = () =>
    localStorage.getItem(config.jwtStorageKey) ||
    getCookie(config.jwtCookieName) ||
    "";
  const clearJWT = () => {
    localStorage.removeItem(config.jwtStorageKey);
    deleteCookie(config.jwtCookieName);
  };
  const setUser = (user) => {
    if (!user) return;
    localStorage.setItem(config.userStorageKey, JSON.stringify(user));
  };
  const getUser = () =>
    safeParse(localStorage.getItem(config.userStorageKey), null);
  const clearUser = () => localStorage.removeItem(config.userStorageKey);
  const clearAuth = () => {
    clearJWT();
    clearUser();
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
    const {
      method = "GET",
      headers = {},
      body,
      auth = true,
      query,
      signal,
    } = options;
    const requestHeaders = new Headers(headers);
    if (body !== undefined && !requestHeaders.has("Content-Type"))
      requestHeaders.set("Content-Type", "application/json");
    if (auth) {
      const token = getJWT();
      if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
    }
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
        credentials: "omit",
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
    let data = null;
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
      return { ok: false, status: response.status, data, error };
    }
    return { ok: true, status: response.status, data, error: "" };
  };
  const getQueryParam = (key) =>
    new URLSearchParams(window.location.search).get(key);
  const requireAuth = (redirectPath = "login.html") => {
    const token = getJWT();
    if (!token) {
      window.location.replace(redirectPath);
      return "";
    }
    return token;
  };
  const navigate = (path) => window.location.assign(path);
  const setStatus = (element, text, className = "") => {
    if (!element) return;
    element.textContent = text || "";
    element.className = `status${className ? ` ${className}` : ""}`;
    element.hidden = !text;
  };
  window.Chitter = {
    config,
    apiFetch,
    setCookie,
    getCookie,
    deleteCookie,
    setJWT,
    getJWT,
    clearJWT,
    setUser,
    getUser,
    clearUser,
    clearAuth,
    escapeHTML,
    formatTime,
    toQueryString,
    getQueryParam,
    requireAuth,
    navigate,
    setStatus,
  };
})();
