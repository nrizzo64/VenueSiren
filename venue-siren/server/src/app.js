require("dotenv").config();
const session = require('express-session')
const morgan = require("morgan");

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const express = require("express");
const redirect_uri = "http://localhost:5001/redirect";
const app = express();

// Middleware to parse JSON bodies
app.use(session({
  secret: clientSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, 
    sameSite: 'strict',
    secure: process.env.NODE_ENV === "prod" 
  }
}))
app.use(express.json());
app.use(morgan("dev"));

app.get("/login", (req, res) => {
  const state = generateRandomString(32);
  req.session.state = state;

  const scope = "user-follow-read";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientID,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get("/redirect", async (req, res) => {
  const { state, code, error } = req.query;

  if (state !== req.session.state) {
    return res.status(403).send("Invalid state parameter");
  }

  if(error === "access_denied") {
    return res.send("Authorization was cancelled. Please try again.");
  }

  req.session.state = null;

  if (error === "access_denied") {
    return res.send("Authorization was cancelled. Please try again.");
  }

  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }

  // Prepare data for token exchange
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirect_uri,
    client_id: clientID,
    client_secret: clientSecret,
  });

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if(!response.ok) {
      console.log('Error exchanging code for access_token:', data);
      return null
    }

    console.log('Response data:', data);
    const {access_token, refresh_token} = data;
    
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;

    // Redirect the user or fetch Spotify data
    res.send(`Access Token: ${access_token}`);
  } catch (err) {
    console.error('Error fetching tokens:', err);
    res.status(500).send('Error during token exchange');
  }
});

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = app;
