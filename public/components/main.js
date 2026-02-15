import { sendMessage, sendFriendRequest } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
     const msgForm = document.getElementById("message-form");
     if (msgForm) {
          msgForm.addEventListener("submit", async (e) => {
               e.preventDefault();
               const toUser = document.getElementById("toUser").value;
               const content = document.getElementById("content").value;
               const fromUser = window.localStorage.getItem("username") || "anon";
               await sendMessage(fromUser, toUser, content);
               document.getElementById("content").value = "";
          });
     }

     const frForm = document.getElementById("friend-request-form");
     if (frForm) {
          frForm.addEventListener("submit", async (e) => {
               e.preventDefault();
               const toUser = document.getElementById("friend-to").value;
               const fromUser = window.localStorage.getItem("username") || "anon";
               await sendFriendRequest(fromUser, toUser);
               document.getElementById("friend-to").value = "";
               alert("friend request sent!");
          });
     }
});