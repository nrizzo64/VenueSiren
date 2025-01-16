import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
  const hasRun = useRef(false);
  
  useEffect(() => {
    // TODO: This is getting called twice because of StrictMode.
    const exchangeTokens = async () => {
      if(hasRun.current) return;
      hasRun.current = true;
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code") || null;
      const state = params.get("state") || null;
      const error = params.get("error") || null;

      try {
        const response = await fetch(`http://localhost:5001/spotify-redirect`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: code,
            state: state,
            error: error,
          }),
        });

        if (response.ok) {
          console.log("successfully authenticated");
        }

        const body = await response.json()
        window.location.href = body.redirectUrl;
        
      } catch (error) {
        console.error("Error:", error);
      }
    };

    exchangeTokens();
  }, []);
};

export default SpotifyCallback;
