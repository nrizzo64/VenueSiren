require("dotenv").config();
const session = require('express-session')
const morgan = require("morgan");

const spotifyClientID = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const express = require("express");
const redirect_uri = process.env.SPOTIFY_REDIRECT;
const app = express();

// Middleware to parse JSON bodies
app.use(session({
  secret: spotifyClientSecret,
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
    client_id: spotifyClientID,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get("/redirect", async (req, res, next) => {
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
    client_id: spotifyClientID,
    client_secret: spotifyClientSecret,
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

    // console.log('Response data:', data);
    const {access_token, refresh_token} = data;
    console.log(access_token)
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    // save accessToken + refreshToken in DB


    // Redirect the user or fetch Spotify data
    //res.send(`Access Token: ${access_token}`);
  } catch (err) {
    console.error('Error fetching tokens:', err);
    res.status(500).send('Error during token exchange');
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/following?type=artist', {
      headers: {
        Authorization: `Bearer ${req.session.accessToken}`
      }
    })
    const data = await response.json();
    console.log(data);
    res.send(data)
  } catch (err) {
    console.error('Error fetching artists: ', err);
    res.status(500).json({ error: 'Failed to fetch artists' });
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
