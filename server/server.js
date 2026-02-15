import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.resolve("public")));

app.get("/", (req, res) => {
     res.sendFile(path.resolve("public/index.html"));
});

app.get("/app/home", (req, res) => {
     res.sendFile(path.resolve("public/app/home.html"));
});

app.get("/app/server/:id", (req, res) => {
     res.sendFile(path.resolve("public/app/server.html"));
});

app.get("/app/messages/:id", (req, res) => {
     res.sendFile(path.resolve("public/app/messages.html"));
});

app.listen(PORT, () => console.log(`frontend dev server running on http://localhost:${PORT}`));