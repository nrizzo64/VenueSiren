import { useState, useRef, useEffect } from "react";

const Login = () => {
  const hasRun = useRef(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const handleLogin = async () => {
      if(hasRun.current === true) return;
      hasRun.current = true;
      setError(null);
      console.log(`Login.js / handleLogin() - sending login request`)
      try {
        const response = await fetch("http://localhost:5001/login", {
          method: "POST",
          credentials: "include",
        });

        if (error) {
          setError(error.message);
        } else {
          const body = await response.json();
          window.location.href = body.redirectUrl;
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    handleLogin();

  }, []);

  return (
    <div className="login">
      <h1>Login with Spotify</h1>
      {/* <button onClick={handleLogin}>Login via Spotify</button> */}
    </div>
  );
};

export default Login;
