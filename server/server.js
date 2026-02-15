import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./firebaseAdmin.js";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// set up paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
     origin: "https://chitter.unboundlabs.dev",
     credentials: true
}));

// serve all static files from public
app.use(express.static(path.join(__dirname, "public")));

// =====================
// api endpoints
// =====================

// health check
app.get("/health", (req, res) => {
     res.json({ ok: true });
});

// discord oauth callback
app.get("/auth/discord/callback", async (req, res) => {
     const code = req.query.code;
     if (!code) return res.status(400).send("no code provided");

     try {
          const params = new URLSearchParams({
               client_id: process.env.DISCORD_CLIENT_ID,
               client_secret: process.env.DISCORD_CLIENT_SECRET,
               grant_type: "authorization_code",
               code,
               redirect_uri: process.env.DISCORD_REDIRECT_URI,
               scope: "identify email"
          });

          const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
               method: "POST",
               body: params,
               headers: { "Content-Type": "application/x-www-form-urlencoded" }
          });
          const tokenJson = await tokenRes.json();

          const userRes = await fetch("https://discord.com/api/users/@me", {
               headers: { Authorization: `Bearer ${tokenJson.access_token}` }
          });
          const user = await userRes.json();

          const userRef = db.collection("users").doc(user.id);
          await userRef.set({
               id: user.id,
               username: user.username,
               discriminator: user.discriminator,
               avatar: user.avatar || null
          }, { merge: true });

          const jwtToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });

          res.cookie("chitter_token", jwtToken, {
               httpOnly: true,
               secure: process.env.NODE_ENV === "production",
               sameSite: "none",
               maxAge: 7 * 24 * 60 * 60 * 1000
          });

          res.redirect("https://chitter.unboundlabs.dev/home");
     } catch (err) {
          console.error(err);
          res.status(500).send("discord oauth failed");
     }
});

// you can add other api routes normally
app.post("/message", async (req, res) => {
     const { fromUser, toUser, content } = req.body;
     const msgRef = db.collection("messages").doc();
     await msgRef.set({ fromUser, toUser, content, timestamp: new Date() });
     res.json({ ok: true });
});

// =====================
// frontend routes
// =====================

// serve home page
app.get("/home", (req, res) => {
     res.sendFile(path.join(__dirname, "public/app/home.html"));
});

// serve messages page
app.get("/messages", (req, res) => {
     res.sendFile(path.join(__dirname, "public/app/messages.html"));
});

// serve server page
app.get("/server", (req, res) => {
     res.sendFile(path.join(__dirname, "public/app/server.html"));
});

// any other path serve index (optional if you want SPA behavior)
// but ONLY after static + explicit routes
app.get("*", (req, res) => {
     res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
     console.log(`chitter api running on http://localhost:${PORT}`);
});