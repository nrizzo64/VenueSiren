require('dotenv').config();

const spotifyApiKey = process.env.SPOTIFY_API_KEY;
const express = require("express");
const redirect_uri = 'http://localhost:5001/success';
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Example route
app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  const scope = "user-follow-read";
    const params = new URLSearchParams({
        response_type: "code",
        client_id: spotifyApiKey,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
    })

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get('/success', (req, res) => {
    console.log("success")
})


function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
// You can add more routes here or in separate route files

module.exports = app;
