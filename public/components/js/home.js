const API_URL = "https://chitterapi.unboundlabs.dev";

// fetch friends
async function fetchFriends() {
     const res = await fetch(`${API_URL}/friend/list`, { credentials: "include" });
     const data = await res.json();
     const list = document.getElementById("friends-list");
     list.innerHTML = "";
     data.friends.forEach(f => {
          const li = document.createElement("li");
          li.textContent = f.username;
          list.appendChild(li);
     });
}

// fetch servers
async function fetchServers() {
     const res = await fetch(`${API_URL}/server/list`, { credentials: "include" });
     const data = await res.json();
     const list = document.getElementById("servers-list");
     list.innerHTML = "";
     data.servers.forEach(s => {
          const li = document.createElement("li");
          li.innerHTML = `<a href="/app/server/${s.id}">${s.name}</a>`;
          list.appendChild(li);
     });
}

// fetch direct messages
async function fetchDMs() {
     const res = await fetch(`${API_URL}/message/list`, { credentials: "include" });
     const data = await res.json();
     const list = document.getElementById("dms-list");
     list.innerHTML = "";
     data.dms.forEach(dm => {
          const li = document.createElement("li");
          li.innerHTML = `<a href="/app/messages/${dm.userId}">${dm.username}</a>`;
          list.appendChild(li);
     });
}

// logout
document.getElementById("logout").addEventListener("click", async () => {
     await fetch(`${API_URL}/auth/logout`, { credentials: "include" });
     window.location.href = "/";
});

// initialize
fetchFriends();
fetchServers();
fetchDMs();