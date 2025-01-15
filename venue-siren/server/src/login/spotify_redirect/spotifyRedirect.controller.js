const service = require("./spotifyAuth.service");

function handleRedirect(req, res, next) {
  const { state, code, error } = req.body;
  const { signed_state } = req.signedCookies; 
  if (!state || !signed_state) {
    return res.status(403).send("Invalid state parameters");
  }

  if(state !== signed_state) {
    console.log("State received back from Spotify does not match original state")
    return res.status(403).send("Invalid state parameters")
  }

  if (error === "access_denied") {
    return res
      .status(400)
      .send("Authorization was cancelled. Please try again.");
  }

  if (!code) {
    return res.status(403).send("Authorization code is missing");
  }

  next();
}

async function exchangeTokens(req, res, next) {
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

async function getSpotifyUserName(req, res, next) {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${req.spotifyTokenData.access_token}`, // Include the access token
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

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

async function checkUserExists(req, res, next) {
  const { spotifyUserId } = req;

  try {
    const user = await service.getUserId(spotifyUserId)
    if (user) {
      req.userId = user.user_id
    }

    next();
  } catch (error) {
    next(error);
  }
}

async function saveUser(req, _res, next) {
  // Simple 16-character random string
  const randomBytes = crypto.getRandomValues(new Uint8Array(8));
  // Convert each byte to a hexadecimal string and join them
  const sessionId = Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const userData = {
    userId: req.userId || null,
    spotifyUserId: req.spotifyUserId,
    sessionId: sessionId,
    tokenData: req.spotifyTokenData,
  };

  try {
    service.saveUser(userData);
    next();
  } catch (error) {
    next(error)
  }
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
    getSpotifyUserName,
    checkUserExists,
    saveUser,
    storeCookie,
  ],
};
