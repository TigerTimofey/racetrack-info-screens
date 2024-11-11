import React, { useState, useEffect } from "react";
import { useSocket } from "../../../hooks/useSocket";
import { useNavigate } from "react-router-dom";
import config from "../../../config";
import "./RaceControl.css";

const RaceControl = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (socket && !authenticated) {
      console.log("Attempting to authenticate...");
      setLoading(true);

      // Simulate loading time before attempting authentication
      const loadingTimeout = setTimeout(() => {
        socket.emit("authenticate", { key: config.keys.safety });

        // Listen for authentication response
        socket.on("authenticated", (status) => {
          setLoading(false);
          if (status) {
            setAuthenticated(true);
          } else {
            setError("Invalid access key");
          }
        });
      }, 2000);

      return () => clearTimeout(loadingTimeout);
    }
  }, [socket, authenticated]);

  if (loading) {
    // Show loading spinner while authenticating
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Authenticating Safety Official</p>
      </div>
    );
  }

  if (error) {
    // Show error message and back button if the key is wrong
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>{error}</h3>
          <button className="back-button" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <div>{error || "Authenticating..."}</div>;
  }

  return (
    <div className="race-control-container">
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Home
      </button>
      <h2 className="race-control-title">Race Control Interface</h2>
      <p>Manage the race operations here</p>
    </div>
  );
};

export default RaceControl;
