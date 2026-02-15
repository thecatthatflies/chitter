import { apiCall } from './app.js';

export const messagesContainer = document.getElementById('messages-container');
export const messageInput = document.getElementById('message-input');

let channelId = 'global'; // example default

export const fetchMessages = async () => {
     const messages = await apiCall(`/api/messages/${channelId}`);
     messagesContainer.innerHTML = messages.map(m => `<div><b>${m.sender}</b>: ${m.content}</div>`).join('');
};
fetchMessages();
setInterval(fetchMessages, 2000);

messageInput.addEventListener('keydown', async (e) => {
     if (e.key === 'Enter') {
          const content = messageInput.value.trim();
          if (!content) return;
          await apiCall('/api/messages', 'POST', { content, channelId });
          messageInput.value = '';
          fetchMessages();
     }
});