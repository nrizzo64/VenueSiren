import React from 'react';

const CLIENT_ID = 'your_spotify_client_id';  // Replace with your Spotify Client ID
const REDIRECT_URI = 'http://localhost:3000/callback'; // Replace with your redirect URI
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPES = ['user-read-private', 'user-read-email']; // Add any required scopes

const SpotifyLogin = () => {
  const loginWithSpotify = () => {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES.join('%20')}&response_type=${RESPONSE_TYPE}&show_dialog=true`;
    window.location = authUrl;
  };

  return (
    <div>
      <button onClick={loginWithSpotify}>Login with Spotify</button>
    </div>
  );
};

export default SpotifyLogin;
