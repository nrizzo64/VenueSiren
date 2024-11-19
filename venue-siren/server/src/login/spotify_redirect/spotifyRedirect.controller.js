const service = require("./spotifyAuth.service");

// helper function
function generateSessionId() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function handleRedirect(req, res, next) {
  console.log(`spotifyRedirect.controller / handleRedirect()`);
  const { state, code, error } = req.body;

  if (state !== req.session.state) {
    return res.status(403).send("Invalid state parameter");
  }

  if (error === "access_denied") {
    return res
      .status(400)
      .send("Authorization was cancelled. Please try again.");
  }

  if (!code) {
    return res.status(403).send("Authorization code is missing");
  }

  req.session.state = null;
  next();
}

async function exchangeTokens(req, res, next) {
  console.log(`spotifyRedirect.controller / exchangeTokens()`);
  const { code } = req.body;

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: process.env.SPOTIFY_REDIRECT,
    /* redirect_uri is used for validation only (there is no actual redirection). The value of this parameter must exactly match the value of redirect_uri supplied when requesting the authorization code. */
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  try {
    console.log("sending request to exchange tokens with spotify");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    console.log("Received response from Spotify:", response.status);
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      console.error("Error exchanging code for access_token:", data);
      return res.status(500).send("Error during token exchange");
    }
    // store tokens
    const { access_token, refresh_token, token_type, expires_in } = data;
    req.accessToken = access_token;
    req.refreshToken = refresh_token;
    console.log("tokens acquired");
    // store sessionId
    req.session.sessionId = generateSessionId();
    next();
  } catch (error) {
    console.error(error.stack);
    console.error("Error fetching tokens:", error);
    return res.status(500).send("Error during token exchange");
  }
}

function storeData(req, res, _next) {
  console.log(`spotifyRedirect.controller / storeData()`);
  console.log("setting headers");
  res.setHeader('Set-Cookie', `sessionId=${req.session.sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${24 * 60 * 60}`);

  return res.status(200).json({redirectUrl: `http://localhost:3000/events`});

  // save tokens
}

module.exports = {
  recieveRedirect: [handleRedirect, exchangeTokens, storeData],
};
