const button = document.getElementById("discord-login");
button.addEventListener("click", () => {
     const apiUrl = "https://chitterapi.unboundlabs.dev/auth/discord";
     window.location.href = apiUrl;
});