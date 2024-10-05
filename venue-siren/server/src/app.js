const CLIENT_ID = ''
const express = require("express");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Example route
app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  const scope = "user-follow-read";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

// You can add more routes here or in separate route files

module.exports = app;
