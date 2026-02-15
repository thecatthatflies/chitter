import { apiCall } from './app.js';

const listEl = document.getElementById('friends-list');
const inputEl = document.getElementById('friend-add-input');
const addBtn = document.getElementById('friend-add-btn');

const refreshFriends = async () => {
     const friends = await apiCall('/api/users/friends');
     listEl.innerHTML = friends.map(f => `<li>${f}</li>`).join('');
};
refreshFriends();

addBtn.addEventListener('click', async () => {
     const friendId = inputEl.value.trim();
     if (!friendId) return;
     await apiCall('/api/users/friend', 'POST', { friendId });
     inputEl.value = '';
     refreshFriends();
});

// optionally: polling for friend requests every 5s
setInterval(async () => {
     const reqs = await apiCall('/api/users/friend/requests');
     // display pending friend requests
     console.log('friend requests', reqs);
}, 5000);