import React from 'react';

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5001/login';  // Redirect to backend for Spotify OAuth
  };

  return (
    <div className="login">
      <h1>Login with Spotify</h1>
      <button onClick={handleLogin}>Login via Spotify</button>
    </div>
  );
};

export default Login;
