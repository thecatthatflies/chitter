document.addEventListener('DOMContentLoaded', () => {
     const memberList = document.getElementById('member-list');
     const inviteBtn = document.getElementById('invite-btn');

     // load members
     fetch(window.location.href)
          .then(r => r.json())
          .then(members => {
               if (memberList) {
                    members.forEach(u => {
                         const li = document.createElement('li');
                         li.textContent = u;
                         memberList.appendChild(li);
                    });
               }
          });

     if (inviteBtn) {
          inviteBtn.addEventListener('click', () => {
               const code = Math.random().toString(36).substring(2, 8);
               alert('Invite code: ' + code);
          });
     }
});