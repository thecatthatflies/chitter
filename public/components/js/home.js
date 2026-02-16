(() => {
  const api = window.Chitter;
  if (!api) return;
  const el = {
    avatar: document.getElementById("user-avatar"),
    name: document.getElementById("user-name"),
    id: document.getElementById("user-id"),
    homeError: document.getElementById("home-error"),
    friendsState: document.getElementById("friends-state"),
    serversState: document.getElementById("servers-state"),
    messagesState: document.getElementById("messages-state"),
    friendsList: document.getElementById("friends-list"),
    serversList: document.getElementById("servers-list"),
    messagesList: document.getElementById("recent-messages-list"),
    friendForm: document.getElementById("friend-request-form"),
    friendInput: document.getElementById("friend-request-input"),
    friendState: document.getElementById("friend-request-state"),
    logoutBtn: document.getElementById("logout-btn"),
  };
  const asArray = (value) => (Array.isArray(value) ? value : []);
  const initials = (value) => String(value || "U").trim().slice(0, 1).toUpperCase();
  const fallbackAvatar = (value) =>
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(value || "chitter")}`;
  const isLikelyUserId = (value) =>
    /^[0-9]+$/.test(value) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  const isUnauthorized = (response) => response && response.status === 401;
  const normalizeId = (value, fallback = "n/a") =>
    value === undefined || value === null || value === "" ? fallback : String(value);
  const setProfile = (user) => {
    if (!user) {
      api.setStatus(
        el.homeError,
        "No active user session found. Please log in again.",
        "status-error",
      );
      return;
    }
    const userName = user.username || "Unknown User";
    if (el.avatar) {
      el.avatar.src = user.avatarUrl || fallbackAvatar(userName);
      el.avatar.alt = `${userName} avatar`;
    }
    if (el.name) el.name.textContent = userName;
    if (el.id) el.id.textContent = `ID: ${user.id || "n/a"}`;
  };
  const normalizeFriend = (friend, index) => ({
    id: normalizeId(friend.id || friend.userId || friend.friendId, `friend-${index + 1}`),
    username: friend.username || friend.user || friend.name || `Friend ${index + 1}`,
    avatarUrl: friend.avatarUrl || friend.avatar || friend.profileImage,
  });
  const renderFriends = (friends) => {
    if (!el.friendsList) return;
    el.friendsList.innerHTML = "";
    if (!friends.length) {
      api.setStatus(el.friendsState, "No friends yet.", "");
      return;
    }
    api.setStatus(
      el.friendsState,
      `Loaded ${friends.length} friend${friends.length === 1 ? "" : "s"}.`,
      "status-success",
    );
    friends.forEach((friend) => {
      const item = document.createElement("li");
      item.className = "entity-item";
      const avatar = document.createElement("img");
      avatar.className = "avatar";
      avatar.src =
        friend.avatarUrl ||
        fallbackAvatar(friend.username || friend.id || initials(friend.username));
      avatar.alt = `${friend.username || "Friend"} avatar`;
      const line = document.createElement("div");
      line.className = "friend-line";
      const name = document.createElement("span");
      name.className = "friend-name";
      name.textContent = friend.username || "Unknown";
      const meta = document.createElement("span");
      meta.className = "muted";
      meta.textContent = `ID: ${friend.id || "n/a"}`;
      line.appendChild(name);
      line.appendChild(meta);
      item.appendChild(avatar);
      item.appendChild(line);
      el.friendsList.appendChild(item);
    });
  };
  const normalizeServer = (server, index) => ({
    id: normalizeId(server.id || server.serverId || server._id, `server-${index + 1}`),
    name: server.name || server.serverName || `Server ${index + 1}`,
  });
  const renderServers = (servers) => {
    if (!el.serversList) return;
    el.serversList.innerHTML = "";
    if (!servers.length) {
      api.setStatus(el.serversState, "No servers available.", "");
      return;
    }
    api.setStatus(
      el.serversState,
      `Loaded ${servers.length} server${servers.length === 1 ? "" : "s"}.`,
      "status-success",
    );
    servers.forEach((server) => {
      const item = document.createElement("li");
      item.className = "entity-item";
      const link = document.createElement("a");
      link.className = "server-link";
      const params = new URLSearchParams({
        serverId: server.id,
        name: server.name,
      });
      link.href = `/server?${params.toString()}`;
      const line = document.createElement("div");
      line.className = "server-line";
      const name = document.createElement("span");
      name.className = "server-name";
      name.textContent = server.name;
      const id = document.createElement("span");
      id.className = "muted";
      id.textContent = `ID: ${server.id}`;
      line.appendChild(name);
      line.appendChild(id);
      link.appendChild(line);
      item.appendChild(link);
      el.serversList.appendChild(item);
    });
  };
  const extractMessageTimestamp = (message) =>
    message.createdAt || message.timestamp || message.sentAt || message.updatedAt;
  const extractMessageAuthor = (message) =>
    message.sender ||
    message.author ||
    message.fromUser ||
    message.fromUsername ||
    message.username ||
    "Unknown Sender";
  const renderMessages = (messages) => {
    if (!el.messagesList) return;
    el.messagesList.innerHTML = "";
    if (!messages.length) {
      api.setStatus(el.messagesState, "No recent messages found.", "");
      return;
    }
    const recent = [...messages]
      .sort(
        (a, b) =>
          new Date(extractMessageTimestamp(b) || 0) -
          new Date(extractMessageTimestamp(a) || 0),
      )
      .slice(0, 20);
    api.setStatus(
      el.messagesState,
      `Showing ${recent.length} recent message${recent.length === 1 ? "" : "s"}.`,
      "status-success",
    );
    recent.forEach((message) => {
      const item = document.createElement("li");
      item.className = "entity-item";
      const line = document.createElement("div");
      line.className = "message-line";
      const author = document.createElement("span");
      author.className = "message-author";
      author.textContent = extractMessageAuthor(message);
      const content = document.createElement("span");
      content.className = "message-content";
      content.textContent = message.content || "";
      const meta = document.createElement("span");
      meta.className = "message-meta";
      meta.textContent =
        api.formatTime(extractMessageTimestamp(message)) || "Unknown time";
      line.appendChild(author);
      line.appendChild(content);
      line.appendChild(meta);
      item.appendChild(line);
      el.messagesList.appendChild(item);
    });
  };
  const loadFriends = async () => {
    api.setStatus(el.friendsState, "Loading friends...", "status-loading");
    const response = await api.apiFetch("/friends/list");
    if (!response.ok) {
      if (isUnauthorized(response)) return;
      api.setStatus(
        el.friendsState,
        response.error || "Unable to load friends right now.",
        "status-error",
      );
      return;
    }
    const friends = asArray(response.data && response.data.friends).map(
      normalizeFriend,
    );
    renderFriends(friends);
  };
  const loadServers = async () => {
    api.setStatus(el.serversState, "Loading servers...", "status-loading");
    const response = await api.apiFetch("/servers/list");
    if (!response.ok) {
      if (isUnauthorized(response)) return;
      api.setStatus(
        el.serversState,
        response.error || "Unable to load servers.",
        "status-error",
      );
      return;
    }
    const servers = asArray(response.data && response.data.servers).map(
      normalizeServer,
    );
    renderServers(servers);
  };
  const loadMessages = async () => {
    api.setStatus(
      el.messagesState,
      "Loading recent messages...",
      "status-loading",
    );
    const response = await api.apiFetch("/messages/list");
    if (!response.ok) {
      if (isUnauthorized(response)) return;
      api.setStatus(
        el.messagesState,
        response.error || "Unable to load recent messages.",
        "status-error",
      );
      return;
    }
    const messages = asArray(response.data && response.data.messages);
    renderMessages(messages);
  };
  const submitFriendRequest = async (event) => {
    event.preventDefault();
    const raw = ((el.friendInput && el.friendInput.value) || "").trim();
    if (!raw) {
      api.setStatus(
        el.friendState,
        "Enter a username or user ID first.",
        "status-error",
      );
      return;
    }
    api.setStatus(
      el.friendState,
      "Sending friend request...",
      "status-loading",
    );
    const payload = isLikelyUserId(raw) ? { toUserId: raw } : { toUser: raw };
    const response = await api.apiFetch("/friends/request", {
      method: "POST",
      body: payload,
    });
    if (!response.ok) {
      if (isUnauthorized(response)) return;
      api.setStatus(
        el.friendState,
        response.error || "Unable to send friend request.",
        "status-error",
      );
      return;
    }
    api.setStatus(el.friendState, "Friend request sent.", "status-success");
    if (el.friendInput) el.friendInput.value = "";
  };
  const bindEvents = () => {
    if (el.logoutBtn)
      el.logoutBtn.addEventListener("click", async () => {
        el.logoutBtn.disabled = true;
        const response = await api.logout();
        if (!response.ok && response.status !== 401) {
          api.setStatus(
            el.homeError,
            response.error ||
              "Logged out locally, but the server session may still be active.",
            "status-error",
          );
        }
        api.navigate(api.config.routes.login, { replace: true });
      });
    if (el.friendForm)
      el.friendForm.addEventListener("submit", submitFriendRequest);
  };
  const loadDashboard = async () => {
    api.setStatus(el.homeError, "", "");
    await Promise.all([loadFriends(), loadServers(), loadMessages()]);
  };
  document.addEventListener("DOMContentLoaded", async () => {
    const canViewProtectedPage = await api.guardRoute("protected");
    if (!canViewProtectedPage) return;
    bindEvents();
    setProfile(api.getAuthState().user);
    loadDashboard();
  });
})();
