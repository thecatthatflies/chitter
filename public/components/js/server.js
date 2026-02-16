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
  const extractMessageTimestamp = (message) =>
    message.createdAt || message.timestamp || message.sentAt || message.updatedAt;
  const extractMessageAuthor = (message) =>
    message.sender ||
    message.author ||
    message.fromUser ||
    message.fromUsername ||
    message.username ||
    "Unknown";
  const isUnauthorized = (response) => response && response.status === 401;
  let pollTimer = 0;
  const context = { id: "", name: "Server Chat" };
  const setComposerEnabled = (enabled) => {
    if (el.input) el.input.disabled = !enabled;
    if (el.sendBtn) el.sendBtn.disabled = !enabled;
    if (el.refreshBtn) el.refreshBtn.disabled = !enabled;
  };
  const resolveContext = () => {
    const id = api.getQueryParam("serverId") || api.getQueryParam("id") || "";
    const name = api.getQueryParam("name") || "Server Chat";
    context.id = String(id);
    context.name = String(name);
    if (el.title) el.title.textContent = context.name;
    if (!context.id) {
      setComposerEnabled(false);
      api.setStatus(
        el.error,
        "No server selected. Open a server from Home first.",
        "status-error",
      );
      api.setStatus(el.state, "", "");
      return false;
    }
    setComposerEnabled(true);
    return true;
  };
  const renderMessages = (messages) => {
    if (!el.list) return;
    el.list.innerHTML = "";
    if (!messages.length) {
      api.setStatus(el.state, "No messages yet. Start the conversation.", "");
      return;
    }
    messages.sort(
      (a, b) =>
        new Date(extractMessageTimestamp(a) || 0) -
        new Date(extractMessageTimestamp(b) || 0),
    );
    messages.forEach((message) => {
      const item = document.createElement("li");
      item.className = "entity-item";
      const bubble = document.createElement("div");
      bubble.className = "message-bubble";
      const author = document.createElement("strong");
      author.textContent = extractMessageAuthor(message);
      const body = document.createElement("span");
      body.className = "message-body";
      body.textContent = message.content || "";
      const time = document.createElement("span");
      time.className = "message-time";
      time.textContent =
        api.formatTime(extractMessageTimestamp(message)) || "Unknown time";
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
    if (!context.id) return;
    if (!silent)
      api.setStatus(el.state, "Loading messages...", "status-loading");
    api.setStatus(el.error, "", "");
    const encodedServerId = encodeURIComponent(context.id);
    const response = await api.apiFetch(`/servers/${encodedServerId}/messages`);
    if (!response.ok) {
      if (isUnauthorized(response)) return;
      api.setStatus(
        el.error,
        response.error || "Unable to load server messages.",
        "status-error",
      );
      if (!silent) api.setStatus(el.state, "", "");
      return;
    }
    const messages = asArray(response.data && response.data.messages);
    renderMessages(messages);
  };
  const sendMessage = async (event) => {
    event.preventDefault();
    if (!context.id) return;
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
    const encodedServerId = encodeURIComponent(context.id);
    const response = await api.apiFetch(`/servers/${encodedServerId}/messages`, {
      method: "POST",
      body,
    });
    if (el.sendBtn) el.sendBtn.disabled = false;
    if (!response.ok) {
      if (isUnauthorized(response)) return;
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
  document.addEventListener("DOMContentLoaded", async () => {
    const canViewProtectedPage = await api.guardRoute("protected");
    if (!canViewProtectedPage) return;
    const hasServerContext = resolveContext();
    if (!hasServerContext) return;
    bindEvents();
    fetchMessages();
    pollTimer = window.setInterval(() => fetchMessages(true), 10000);
  });
})();
