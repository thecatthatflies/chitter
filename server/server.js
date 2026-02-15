import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/components", express.static(path.join(__dirname, "../public/components")));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../public/index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "../public/login.html")));
app.get("/app/home", (req, res) => res.sendFile(path.join(__dirname, "../public/app/home.html")));
app.get("/app/server/:serverId", (req, res) => res.sendFile(path.join(__dirname, "../public/app/server.html")));
app.get("/app/messages/:userId", (req, res) => res.sendFile(path.join(__dirname, "../public/app/messages.html")));

app.listen(PORT, () => console.log(`frontend dev server running at http://localhost:${PORT}`));