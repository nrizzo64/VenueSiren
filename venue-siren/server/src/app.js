require("dotenv").config();

const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const app = express();
const validateSession = require("./helper/sessionValidation.js")

const loginRouter = require("./login/login.router.js")
const spotifyRedirectRouter = require("./login/spotify_redirect/spotifyRedirect.router");

const corsOptions = {
  origin: 'http://localhost:3000', // Only allow requests from your frontend
  credentials: true,               // Allow cookies to be sent
  methods: ['GET', 'POST'],        // Specify allowed methods
  allowedHeaders: ['Content-Type'], // Specify allowed headers
};

// Use cookie-parser middleware
app.use(cookieParser(process.env.COOKIE_SIGNING_KEY));

app.use(cors(corsOptions));
app.use(morgan("dev"));

app.use(express.json());
app.use(validateSession);
app.use("/login", loginRouter)
app.use("/spotify-redirect", spotifyRedirectRouter)
module.exports = app;
