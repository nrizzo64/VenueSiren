function handleRedirect(req, res, next) {
  const { state, code, error } = req.query;

  // will req.session.state exist from login.controller?
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

async function exchangeTokens(req, res, next) {
  const { code } = req.query;
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: process.env.SPOTIFY_REDIRECT,
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
      console.log("Error exchanging code for access_token:", data);
      return null;
    }

    const { access_token, refresh_token } = data;
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;

    // save accessToken + refreshToken in DB and in front end?
  } catch (err) {
    console.error("Error fetching tokens:", err);
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

module.exports = {
  recieveRedirect: [handleRedirect, exchangeTokens],
};
