const crypto = require('crypto');

async function login(_req, res, _next) {
  const state = crypto.randomBytes(16).toString('hex');

  // store signed state in client cookie
  res.cookie('signed_state', state, {
    signed: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === `prod`,
    maxAge: 300000 // 5 minutes
  });

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT,
    state: state,
    scope: "user-follow-read user-read-private",
    show_dialog: false,
  });

  return res
    .status(200)
    .json({
      redirectUrl: `https://accounts.spotify.com/authorize?${params.toString()}`,
    });
}

module.exports = {
  login: [login],
};
