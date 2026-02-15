document.addEventListener('DOMContentLoaded', () => {
     const serverList = document.getElementById('server-list');
     const friendList = document.getElementById('friend-list');
     const usernameEl = document.getElementById('username');

     // fetch user info
     fetch('https://chitterapi.unboundlabs.dev/api/users/me')
          .then(r => r.json())
          .then(u => {
               if (usernameEl) usernameEl.textContent = u.username;
          });

     // fetch servers
     fetch('https://chitterapi.unboundlabs.dev/api/servers')
          .then(r => r.json())
          .then(servers => {
               if (serverList) {
                    servers.forEach(s => {
                         const li = document.createElement('li');
                         li.textContent = s.name;
                         serverList.appendChild(li);
                    });
               }
          });

     // fetch friends
     fetch('https://chitterapi.unboundlabs.dev/api/friends')
          .then(r => r.json())
          .then(friends => {
               if (friendList) {
                    friends.forEach(f => {
                         const li = document.createElement('li');
                         li.textContent = f;
                         friendList.appendChild(li);
                    });
               }
          });
});