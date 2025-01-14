const service = require("./spotifyAuth.service");

// helper function
function generateUUIDv4() {
  // Simple 16-character random string
  const randomBytes = crypto.getRandomValues(new Uint8Array(8));

  // Convert each byte to a hexadecimal string and join them
  const sessionId = Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return sessionId;
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

    const data = await response.json();

    if (!response.ok) {
      console.error("Error exchanging code for access_token:", data);
      return res.status(500).send("Error during token exchange");
    }

    req.spotifyTokenData = data; // { access_token, refresh_token, token_type, expires_in }

    req.spotifyTokenData.access_token_expiry_date =
      (new Date(Date.now() + req.spotifyTokenData.expires_in * 1000).toISOString());

    next();
  } catch (error) {
    console.error(error.stack);
    console.error("Error fetching tokens:", error);
    return res.status(500).send("Error during token exchange");
  }
}

async function fetchSpotifyUserName(req, res, next) {
  console.log(req.spotifyTokenData);
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${req.spotifyTokenData.access_token}`, // Include the access token
        "Content-Type": "application/json",
      },
    });

    console.log("Received response from Spotify:", response.status);
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      console.error("Error while fetching Spotify UserName");
      return res.status(500).send("Error during Spotify UserName fetching");
    }

    req.spotifyUserId = data.id;

    next();
  } catch (error) {
    console.error(error.stack);
    return res.status(500).send("Error while fetching Spotify UserName");
  }
}

function saveUser(req, _res, next) {
  const userData = {
    spotifyUserId: req.spotifyUserId,
    sessionId: generateUUIDv4(),
    tokenData: req.spotifyTokenData,
  };
  service.saveUser(userData);
  next();
}

function storeCookie(req, res, _next) {
  res.setHeader(
    "Set-Cookie",
    `sessionId=${req.sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${
      24 * 60 * 60
    }`
  );

  return res.status(200).json({ redirectUrl: `http://localhost:3000/events` });
}

module.exports = {
  recieveRedirect: [
    handleRedirect,
    exchangeTokens,
    fetchSpotifyUserName,
    saveUser,
    storeCookie,
  ],
};
