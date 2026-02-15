const token = localStorage.getItem('chitterToken');
if (!token && !window.location.href.includes('index.html')) {
     window.location.href = '/index.html';
}

export const apiCall = async (url, method = 'GET', body) => {
     const res = await fetch(`https://chitterapi.unboundlabs.dev${url}`, {
          method,
          headers: {
               'Content-Type': 'application/json',
               ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: body ? JSON.stringify(body) : undefined
     });
     return res.json();
}

// load username
document.addEventListener('DOMContentLoaded', async () => {
     if (token) {
          const user = await apiCall('/api/users/me');
          document.getElementById('username').textContent = user.username;
     }
});