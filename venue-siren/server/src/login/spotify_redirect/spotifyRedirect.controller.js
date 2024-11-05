const service = require("./spotifyAuth.service");

function handleRedirect(req, res, next) {
  const { state, code, error } = req.body;
  
  if (state !== req.session.state) {
    return res.status(403).send("Invalid state parameter");
  }

  if (error === "access_denied") {
    return res.send("Authorization was cancelled. Please try again.");
  }

  if (!code) {
    return res.status(400).send("Authorization code is missing");
  }

  req.session.state = null;

  next();
}

async function exchangeTokens(req, res, _next) {
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
      return null;
    }

    const { access_token, refresh_token } = data;
    // TODO: Save user info in DB
    
  } catch (error) {
    console.error(error.stack);
    console.error("Error fetching tokens:", error);
    res.status(500).send("Error during token exchange");
  }

  res.status(200).json({redirectUrl: `http://localhost:3000/`});
}

async function fetchArtists(req, res, _next) {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/following?type=artist",
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
        },
      }
    );
    const data = await response.json();
    const artists = data.artists.items.map((artist) =>
      encodeURIComponent(artist.name)
    );
    const artistNames = artists.join(","); // unused for now
    req.session.ticketmasterRequest = `${process.env.TICKETMASTER_URL}?apikey=${process.env.TICKETMASTER_API_KEY}&postalCode=33610&keyword=Greeicy`;
  } catch (err) {
    console.error("Error fetching artists: ", err);
    res.status(500).json({ error: "Failed to fetch artists" });
  }

  try {
    const response = await fetch(req.session.ticketmasterRequest);
    const data = await response.json();
    res.send(data);
  } catch (err) {
    console.error("Error fetching events: ", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
}

function generateUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}


module.exports = {
  recieveRedirect: [handleRedirect, exchangeTokens],
};
