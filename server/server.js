import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve static files
app.use(express.static(path.join(__dirname, "../public")));

app.get("*", (req, res) => {
     res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => console.log(`frontend dev server running at http://localhost:${PORT}`));