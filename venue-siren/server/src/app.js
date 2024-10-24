require("dotenv").config();

const session = require('express-session')
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const app = express();

const loginRouter = require("./login/login.router.js")
const spotifyRedirectRouter = require("./login/spotify_redirect/spotifyRedirect.router");


// Middleware to parse JSON bodies
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, 
    sameSite: 'strict',
    secure: process.env.NODE_ENV === "prod",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}))

const corsOptions = {
  origin: 'http://localhost:3000', // Only allow requests from your frontend
  credentials: true,               // Allow cookies to be sent
  methods: ['GET', 'POST'],        // Specify allowed methods
  allowedHeaders: ['Content-Type'], // Specify allowed headers
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan("dev"));
app.use("/login", loginRouter)
app.use("/spotify-redirect", spotifyRedirectRouter)

module.exports = app;
