const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

function generateState(req, _res, next) {
  const length = 32;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  req.session.state = randomString;
  next();
}

async function login(req, res, _next) {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT,
    state: req.session.state,
    scope: "user-follow-read user-read-private",
    show_dialog: false,
  });

  return res.status(200).json({redirectUrl: `https://accounts.spotify.com/authorize?${params.toString()}`});
}

module.exports = {
  login: [generateState, login],
};
