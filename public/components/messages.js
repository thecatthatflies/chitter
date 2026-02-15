document.addEventListener('DOMContentLoaded', () => {
     const input = document.getElementById('chat-input');
     const sendBtn = document.getElementById('send-btn');
     const chatBox = document.getElementById('chat-messages');

     if (input && sendBtn && chatBox) {
          sendBtn.addEventListener('click', sendMessage);
          input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

          function sendMessage() {
               const msg = input.value.trim();
               if (!msg) return;
               const p = document.createElement('p');
               p.textContent = msg;
               chatBox.appendChild(p);
               input.value = '';
               chatBox.scrollTop = chatBox.scrollHeight;

               // send to backend
               fetch('https://api.chitter.unboundlabs.dev/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: msg })
               });
          }
     }
});