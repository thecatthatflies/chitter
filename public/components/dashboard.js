// placeholder js for future functionality
console.log("chitter dashboard loaded");

// example: auto scroll messages to bottom
const messages = document.getElementById("messages");
messages.scrollTop = messages.scrollHeight;

// fetch user info if you want
fetch('/me', { credentials: 'include' })
     .then(r => r.json())
     .then(user => {
          const el = document.createElement('div')
          el.className = 'message';
          el.innerText = `logged in as ${user.username}`;
          messages.appendChild(el);
          messages.scrollTop = messages.scrollHeight;
     })
     .catch(() => console.log("not logged in"))