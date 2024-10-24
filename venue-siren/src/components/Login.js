import React from "react";

const Login = () => {

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const body = await response.json()
        window.location.href = body.redirectUrl
      } else {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="login">
      <h1>Login with Spotify</h1>
      <button onClick={handleLogin}>Login via Spotify</button>
    </div>
  );
};

export default Login;
