// frontend js for future features
const apiBase = "https://chitterapi.unboundlabs.dev";

// example: fetch friend requests
export async function fetchFriendRequests(userId) {
     const res = await fetch(`${apiBase}/friend-requests?userId=${userId}`, {
          credentials: "include"
     });
     return await res.json();
}

// example: send message
export async function sendMessage(fromUser, toUser, content) {
     const res = await fetch(`${apiBase}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ fromUser, toUser, content })
     });
     return await res.json();
}