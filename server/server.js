import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "../public");

const sendPage = (page) => (req, res) =>
  res.sendFile(path.join(publicDir, page));

app.use("/components", express.static(path.join(publicDir, "components")));
app.use(express.static(publicDir));

app.get("/", sendPage("index.html"));
app.get("/index.html", sendPage("index.html"));
app.get("/login", sendPage("login.html"));
app.get("/login.html", sendPage("login.html"));
app.get("/home", sendPage("home.html"));
app.get("/home.html", sendPage("home.html"));
app.get("/server", sendPage("server.html"));
app.get("/server.html", sendPage("server.html"));
app.get("/servers/:serverId", sendPage("server.html"));

app.listen(PORT, () =>
  console.log(`frontend dev server running at http://localhost:${PORT}`),
);
