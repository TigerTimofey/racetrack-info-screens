import React, { useState, useEffect } from "react";
import { useSocket } from "../../../hooks/useSocket";
import { useNavigate } from "react-router-dom";
import config from "../../../config";
import "./FrontDesk.css";

const FrontDesk = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (socket && !authenticated) {
      console.log("Attempting to authenticate...");
      setLoading(true);

      //PROVIDE PASSWORD FROM USER
      const loadingTimeout = setTimeout(() => {
        socket.emit("authenticate", { key: config.keys.receptionist });
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
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Authenticating Receptionist</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="error-container">
        <h2 className="error-message">{error || "Authenticating..."}</h2>
        <button className="back-button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="front-desk-container">
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Home
      </button>
      <h2 className="front-title">Front Desk Interface</h2>
      <p>Manage race sessions here</p>
    </div>
  );
};

export default FrontDesk;
