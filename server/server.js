import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import axios from "axios"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

app.use(cookieParser())
app.use(express.static(path.join(__dirname, "../public")))

// env
const {
     DISCORD_CLIENT_ID,
     DISCORD_CLIENT_SECRET,
     DISCORD_REDIRECT_URI,
     JWT_SECRET,
     PORT
} = process.env

const port = PORT || 3000

// redirect to discord login
app.get("/auth/discord", (req, res) => {
     const params = new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          redirect_uri: DISCORD_REDIRECT_URI,
          response_type: "code",
          scope: "identify email"
     })
     res.redirect(`https://discord.com/api/oauth2/authorize?${params}`)
})

// discord callback
app.get("/auth/discord/callback", async (req, res) => {
     const code = req.query.code
     if (!code) return res.status(400).send("no code provided")

     try {
          // exchange code for access token
          const tokenRes = await axios.post(
               "https://discord.com/api/oauth2/token",
               new URLSearchParams({
                    client_id: DISCORD_CLIENT_ID,
                    client_secret: DISCORD_CLIENT_SECRET,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: DISCORD_REDIRECT_URI
               }),
               { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          )

          const { access_token } = tokenRes.data

          // get discord user info
          const userRes = await axios.get(
               "https://discord.com/api/users/@me",
               { headers: { Authorization: `Bearer ${access_token}` } }
          )

          const discordUser = userRes.data
          const user = {
               discordId: discordUser.id,
               username: discordUser.username,
               avatar: discordUser.avatar
          }

          // create jwt
          const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })

          // set httpOnly cookie
          res.cookie("chitter_auth", token, {
               httpOnly: true,
               secure: true, // must be true for https
               sameSite: "lax",
               maxAge: 1000 * 60 * 60 * 24 * 7
          })

          res.redirect("/dashboard.html")
     } catch (err) {
          console.error(err)
          res.status(500).send("authentication failed")
     }
})

// get current user
app.get("/me", (req, res) => {
     const token = req.cookies.chitter_auth
     if (!token) return res.status(401).send("unauthorized")

     try {
          const user = jwt.verify(token, JWT_SECRET)
          res.json(user)
     } catch {
          res.status(401).send("invalid token")
     }
})

// start server
app.listen(port, () => console.log(`chitter backend running at http://localhost:${port}`))