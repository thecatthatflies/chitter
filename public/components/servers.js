import { apiCall } from './app.js';

const serversListEl = document.getElementById('servers-list');
const createInput = document.getElementById('server-name-input');
const createBtn = document.getElementById('server-create-btn');
const joinInput = document.getElementById('invite-code-input');
const joinBtn = document.getElementById('server-join-btn');

const refreshServers = async () => {
     const servers = await apiCall('/api/servers');
     serversListEl.innerHTML = servers.map(s => `<li>${s.name} (invite: ${s.inviteCode})</li>`).join('');
};
refreshServers();

createBtn.addEventListener('click', async () => {
     const name = createInput.value.trim();
     if (!name) return;
     await apiCall('/api/servers', 'POST', { name });
     createInput.value = '';
     refreshServers();
});

joinBtn.addEventListener('click', async () => {
     const code = joinInput.value.trim();
     if (!code) return;
     await apiCall('/api/servers/join', 'POST', { code });
     joinInput.value = '';
     refreshServers();
});