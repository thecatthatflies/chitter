const API_BASE = "https://chitterapi.unboundlabs.dev";

export async function loginWithDiscord(code) {
     const res = await fetch(`${API_BASE}/auth/discord/callback?code=${code}`, {
          credentials: "include",
     });
     return res.json();
}

export async function sendMessage(fromUser, toUser, content) {
     const res = await fetch(`${API_BASE}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromUser, toUser, content }),
     });
     return res.json();
}

export async function sendFriendRequest(fromUser, toUser) {
     const res = await fetch(`${API_BASE}/friend-request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromUser, toUser }),
     });
     return res.json();
}