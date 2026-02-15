import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve static files from public/
app.use(express.static(path.join(__dirname, "public")));

// explicit frontend routes
app.get("/", (req, res) => {
     res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/login", (req, res) => {
     res.sendFile(path.join(__dirname, "public/login.html"));
});

app.get("/app/home", (req, res) => {
     res.sendFile(path.join(__dirname, "public/app/home.html"));
});

app.get("/app/server/:serverId", (req, res) => {
     res.sendFile(path.join(__dirname, "public/app/server.html"));
});

app.get("/app/messages/:userId", (req, res) => {
     res.sendFile(path.join(__dirname, "public/app/messages.html"));
});

// catch-all for any other paths (optional SPA fallback)
app.get("*", (req, res) => {
     res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
     console.log(`chitter frontend dev server running on http://localhost:${PORT}`);
});