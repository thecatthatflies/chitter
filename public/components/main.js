const apiBase = "https://chitterapi.unboundlabs.dev";

const usernameEl = document.getElementById("username");
const friendsListEl = document.getElementById("friends-list");
const serversListEl = document.getElementById("servers-list");
const friendRequestsEl = document.getElementById("friend-requests");
const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const serverMembersEl = document.getElementById("server-members");
const serverChannelsEl = document.getElementById("server-channels");
const serverChat = document.getElementById("server-chat");
const serverChatInput = document.getElementById("server-chat-input");

let currentUser = null;

// ----------------------
// helpers
// ----------------------
async function fetchJSON(url, opts = {}) {
     const res = await fetch(url, { ...opts, credentials: "include" });
     return await res.json();
}

function getQueryParam(name) {
     const params = new URLSearchParams(window.location.search);
     return params.get(name);
}

// ----------------------
// auth / current user
// ----------------------
export async function getCurrentUser() {
     const data = await fetchJSON(`${apiBase}/me`);
     currentUser = data.user;
     if (usernameEl) usernameEl.textContent = currentUser.username;
}

// ----------------------
// friends
// ----------------------
export async function loadFriends() {
     if (!currentUser) await getCurrentUser();
     const friends = await fetchJSON(`${apiBase}/friends?userId=${currentUser.id}`);
     if (!friendsListEl) return;
     friendsListEl.innerHTML = "";
     friends.forEach(f => {
          const li = document.createElement("li");
          li.textContent = f.username;
          li.addEventListener("click", () => {
               window.location.href = `/app/messages.html?user=${f.id}`;
          });
          friendsListEl.appendChild(li);
     });
}

// ----------------------
// servers
// ----------------------
export async function loadServers() {
     if (!currentUser) await getCurrentUser();
     const servers = await fetchJSON(`${apiBase}/servers?userId=${currentUser.id}`);
     if (!serversListEl) return;
     serversListEl.innerHTML = "";
     servers.forEach(s => {
          const li = document.createElement("li");
          li.textContent = s.name;
          li.addEventListener("click", () => {
               window.location.href = `/app/server.html?server=${s.id}`;
          });
          serversListEl.appendChild(li);
     });
}

// ----------------------
// friend requests
// ----------------------
export async function loadFriendRequests() {
     if (!currentUser) await getCurrentUser();
     const requests = await fetchJSON(`${apiBase}/friend-requests?userId=${currentUser.id}`);
     if (!friendRequestsEl) return;
     friendRequestsEl.innerHTML = "";
     requests.forEach(r => {
          const li = document.createElement("li");
          li.textContent = `${r.from.username} wants to be your friend`;
          const acceptBtn = document.createElement("button");
          acceptBtn.textContent = "Accept";
          acceptBtn.addEventListener("click", async () => {
               await fetchJSON(`${apiBase}/friend-request/accept`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ requestId: r.id })
               });
               loadFriendRequests();
               loadFriends();
          });
          li.appendChild(acceptBtn);
          friendRequestsEl.appendChild(li);
     });
}

// ----------------------
// direct messages
// ----------------------
export async function loadMessages(toUserId) {
     if (!currentUser) await getCurrentUser();
     const messages = await fetchJSON(`${apiBase}/messages?userId=${currentUser.id}&toUserId=${toUserId}`);
     if (!chatWindow) return;
     chatWindow.innerHTML = "";
     messages.forEach(m => {
          const div = document.createElement("div");
          div.className = m.from.id === currentUser.id ? "msg-sent" : "msg-received";
          div.textContent = m.content;
          chatWindow.appendChild(div);
     });
}

if (chatInput) {
     chatInput.addEventListener("keypress", async e => {
          if (e.key === "Enter") {
               const toUserId = getQueryParam("user");
               if (!toUserId || !currentUser) return;
               const content = chatInput.value;
               await fetchJSON(`${apiBase}/message`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fromUser: currentUser.id, toUser: toUserId, content })
               });
               chatInput.value = "";
               loadMessages(toUserId);
          }
     });
}

// ----------------------
// server page
// ----------------------
export async function loadServer(serverId) {
     if (!currentUser) await getCurrentUser();
     const serverData = await fetchJSON(`${apiBase}/server/${serverId}`);
     if (!serverData) return;
     if (serverName) serverName.textContent = serverData.name;

     if (!serverMembersEl || !serverChannelsEl) return;

     serverMembersEl.innerHTML = "";
     serverData.members.forEach(m => {
          const li = document.createElement("li");
          li.textContent = m.username;
          serverMembersEl.appendChild(li);
     });

     serverChannelsEl.innerHTML = "";
     serverData.channels.forEach(c => {
          const li = document.createElement("li");
          li.textContent = c.name;
          li.addEventListener("click", () => loadServerChannelMessages(serverId, c.id));
          serverChannelsEl.appendChild(li);
     });
}

// ----------------------
// server chat
// ----------------------
export async function loadServerChannelMessages(serverId, channelId) {
     const messages = await fetchJSON(`${apiBase}/server/${serverId}/channel/${channelId}/messages`);
     if (!serverChat) return;
     serverChat.innerHTML = "";
     messages.forEach(m => {
          const div = document.createElement("div");
          div.className = m.from.id === currentUser.id ? "msg-sent" : "msg-received";
          div.textContent = m.content;
          serverChat.appendChild(div);
     });
}

if (serverChatInput) {
     serverChatInput.addEventListener("keypress", async e => {
          if (e.key === "Enter") {
               const serverId = getQueryParam("server");
               const channelId = getQueryParam("channel");
               if (!serverId || !channelId || !currentUser) return;
               const content = serverChatInput.value;
               await fetchJSON(`${apiBase}/server/${serverId}/channel/${channelId}/message`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fromUser: currentUser.id, content })
               });
               serverChatInput.value = "";
               loadServerChannelMessages(serverId, channelId);
          }
     });
}

// ----------------------
// initial load
// ----------------------
getCurrentUser().then(() => {
     loadFriends();
     loadServers();
     loadFriendRequests();

     const serverId = getQueryParam("server");
     if (serverId) loadServer(serverId);

     const toUserId = getQueryParam("user");
     if (toUserId) loadMessages(toUserId);
});