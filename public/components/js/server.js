(() => {
  const api = window.Chitter;
  if (!api) return;
  const el = {
    title: document.getElementById("server-title"),
    state: document.getElementById("server-state"),
    error: document.getElementById("server-error"),
    list: document.getElementById("server-messages"),
    form: document.getElementById("message-form"),
    input: document.getElementById("message-input"),
    sendBtn: document.getElementById("send-message"),
    sendState: document.getElementById("send-state"),
    refreshBtn: document.getElementById("refresh-messages"),
  };
  const asArray = (value) => (Array.isArray(value) ? value : []);
  let pollTimer = 0;
  const context = { id: "global", name: "Global Feed" };
  const resolveContext = () => {
    const id =
      api.getQueryParam("serverId") || api.getQueryParam("id") || "global";
    const name = api.getQueryParam("name") || "Global Feed";
    context.id = String(id);
    context.name = String(name);
    if (el.title) el.title.textContent = context.name;
  };
  const unauthorized = (response) => {
    if (response.status === 401 || response.status === 403) {
      api.clearAuth();
      api.navigate("login.html");
      return true;
    }
    return false;
  };
  const belongsToContext = (message) => {
    if (context.id === "global") return true;
    const messageServerId =
      message.serverId || message.server || message.channelId;
    return String(messageServerId || "") === context.id;
  };
  const renderMessages = (messages) => {
    el.list.innerHTML = "";
    if (!messages.length) {
      api.setStatus(el.state, "No messages yet. Start the conversation.", "");
      return;
    }
    messages.sort(
      (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0),
    );
    messages.forEach((message) => {
      const item = document.createElement("li");
      item.className = "entity-item";
      const bubble = document.createElement("div");
      bubble.className = "message-bubble";
      const author = document.createElement("strong");
      author.textContent = message.sender || "Unknown";
      const body = document.createElement("span");
      body.className = "message-body";
      body.textContent = message.content || "";
      const time = document.createElement("span");
      time.className = "message-time";
      time.textContent = api.formatTime(message.timestamp) || "Unknown time";
      bubble.appendChild(author);
      bubble.appendChild(body);
      bubble.appendChild(time);
      item.appendChild(bubble);
      el.list.appendChild(item);
    });
    api.setStatus(
      el.state,
      `Loaded ${messages.length} message${messages.length === 1 ? "" : "s"}.`,
      "status-success",
    );
  };
  const fetchMessages = async (silent = false) => {
    if (!silent)
      api.setStatus(el.state, "Loading messages...", "status-loading");
    api.setStatus(el.error, "", "");
    const query = context.id === "global" ? {} : { serverId: context.id };
    const response = await api.apiFetch("/message/list", { query });
    if (!response.ok) {
      if (unauthorized(response)) return;
      api.setStatus(
        el.error,
        response.error || "Unable to load server messages.",
        "status-error",
      );
      if (!silent) api.setStatus(el.state, "", "");
      return;
    }
    const messages = asArray(response.data && response.data.messages).filter(
      belongsToContext,
    );
    renderMessages(messages);
  };
  const sendMessage = async (event) => {
    event.preventDefault();
    const text = ((el.input && el.input.value) || "").trim();
    if (!text) {
      api.setStatus(el.sendState, "Message cannot be empty.", "status-error");
      return;
    }
    if (text.length > 2000) {
      api.setStatus(el.sendState, "Message is too long.", "status-error");
      return;
    }
    if (el.sendBtn) el.sendBtn.disabled = true;
    api.setStatus(el.sendState, "Sending message...", "status-loading");
    const body = { content: text };
    if (context.id !== "global") body.serverId = context.id;
    const response = await api.apiFetch("/message", { method: "POST", body });
    if (el.sendBtn) el.sendBtn.disabled = false;
    if (!response.ok) {
      if (unauthorized(response)) return;
      api.setStatus(
        el.sendState,
        response.error || "Unable to send message.",
        "status-error",
      );
      return;
    }
    if (el.input) el.input.value = "";
    api.setStatus(el.sendState, "Message sent.", "status-success");
    fetchMessages(true);
  };
  const bindEvents = () => {
    if (el.form) el.form.addEventListener("submit", sendMessage);
    if (el.refreshBtn)
      el.refreshBtn.addEventListener("click", () => fetchMessages());
    window.addEventListener("beforeunload", () => {
      if (pollTimer) window.clearInterval(pollTimer);
    });
  };
  document.addEventListener("DOMContentLoaded", () => {
    if (!api.requireAuth("login.html")) return;
    resolveContext();
    bindEvents();
    fetchMessages();
    pollTimer = window.setInterval(() => fetchMessages(true), 10000);
  });
})();
