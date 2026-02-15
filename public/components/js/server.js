const API_URL = "https://chitterapi.unboundlabs.dev";
const chatList = document.getElementById("chat-list");
const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-msg");

const serverId = window.location.pathname.split("/").pop();

// fetch server messages
async function fetchMessages() {
     const res = await fetch(`${API_URL}/server/${serverId}/messages`, { credentials: "include" });
     const data = await res.json();
     chatList.innerHTML = "";
     data.messages.forEach(msg => {
          const li = document.createElement("li");
          li.textContent = `${msg.from}: ${msg.content}`;
          chatList.appendChild(li);
     });
}

// send message
sendBtn.addEventListener("click", async () => {
     const content = input.value.trim();
     if (!content) return;
     await fetch(`${API_URL}/server/${serverId}/message`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
     });
     input.value = "";
     fetchMessages();
});

// auto-refresh every 2s
setInterval(fetchMessages, 2000);
fetchMessages();
